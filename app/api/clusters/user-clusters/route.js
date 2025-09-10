import { NextResponse } from "next/server";
import { db } from "@/utils";
import { 
  CLUSTER_MBTI_RIASEC_COMBINATIONS, 
  CLUSTER, 
  USER_DETAILS, 
  QUIZ_SEQUENCES,
  USER_CLUSTER  // Add this import
} from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

import { 
  generateClusterSorting, 
  validateMBTI, 
  validateRIASEC, 
  validateClassLevel 
} from "@/app/api/utils/generateClusterSorting";
import { calculateAge } from "@/lib/ageCalculate";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Helper function to wait with exponential backoff
const waitWithBackoff = (attempt) => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Helper function to wait for generation completion
const waitForGenerationCompletion = async (combinationId) => {
  const maxWaitTime = 5 * 60 * 1000; // 5 minutes
  const startTime = Date.now();
  let attempt = 0;
  
  while (Date.now() - startTime < maxWaitTime) {
    await waitWithBackoff(attempt);
    attempt++;
    
    const [updatedStatus] = await db
      .select()
      .from(CLUSTER_MBTI_RIASEC_COMBINATIONS)
      .where(eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.id, combinationId));
    
    if (updatedStatus) {
      const status = updatedStatus.generation_status;
      
      if (status === 'completed') {
        console.log('Cluster sorting generation completed by another request');
        return updatedStatus;
      } else if (status === 'failed') {
        throw new Error('Cluster sorting generation failed by another request');
      }
    }
  }
  
  throw new Error('Cluster sorting generation timed out');
};

// Helper function to handle failed generation with atomic retry
const handleFailedGeneration = async (combinationId, mbtiType, riasecCode, classLevel, userId) => {
  try {
    // Use atomic update to claim the retry
    await db
      .update(CLUSTER_MBTI_RIASEC_COMBINATIONS)
      .set({ 
        generation_status: 'in_progress',
        generated_by: userId 
      })
      .where(
        and(
          eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.id, combinationId),
          eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.generation_status, 'failed')
        )
      );

    console.log('Attempting to retry failed cluster sorting generation...');
    
    const sortingData = await generateClusterSorting(mbtiType, riasecCode, classLevel);

    await db
      .update(CLUSTER_MBTI_RIASEC_COMBINATIONS)
      .set({ 
        generation_status: 'completed',
        sorted_clusters: sortingData
      })
      .where(eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.id, combinationId));
    
    console.log('Retry cluster sorting generation completed successfully');
    
    return sortingData;
  } catch (error) {
    await db
      .update(CLUSTER_MBTI_RIASEC_COMBINATIONS)
      .set({ generation_status: 'failed' })
      .where(eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.id, combinationId));
    
    console.error('Retry cluster sorting generation failed:', error);
    throw error;
  }
};

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Get user details including class level
    const userDetails = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    if (!userDetails.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const classLevel = parseInt(userDetails[0].grade) || 5; // Default to class 5 if not set
    const scopeType = userDetails[0].scope_type;

    // Check if user is in cluster scope
    if (scopeType !== 'cluster') {
      return NextResponse.json({ 
        message: "Sorted clusters are only available for users in cluster scope" 
      }, { status: 400 });
    }

    // Get MBTI type from quiz sequences
    const mbtiQuiz = await db
      .select({ type_sequence: QUIZ_SEQUENCES.type_sequence })
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, userId),
          eq(QUIZ_SEQUENCES.quiz_id, 1),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        )
      );

    if (!mbtiQuiz.length || !mbtiQuiz[0].type_sequence) {
      return NextResponse.json({ 
        message: "Please complete your personality assessment first" 
      }, { status: 400 });
    }

    const mbtiType = mbtiQuiz[0].type_sequence;

    // Get RIASEC code from quiz sequences  
    const riasecQuiz = await db
      .select({ type_sequence: QUIZ_SEQUENCES.type_sequence })
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, userId),
          eq(QUIZ_SEQUENCES.quiz_id, 2),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        )
      );

    if (!riasecQuiz.length || !riasecQuiz[0].type_sequence) {
      return NextResponse.json({ 
        message: "Please complete your interest assessment first" 
      }, { status: 400 });
    }

    const riasecCode = riasecQuiz[0].type_sequence;

    console.log("Log 1", "riasec:", riasecCode, "mbtiType", mbtiType)

    // Validate inputs
    if (!validateMBTI(mbtiType)) {
      return NextResponse.json({ message: "Invalid MBTI type" }, { status: 400 });
    }

    if (!validateRIASEC(riasecCode)) {
      return NextResponse.json({ message: "Invalid RIASEC code" }, { status: 400 });
    }

    if (!validateClassLevel(classLevel)) {
      return NextResponse.json({ message: "Invalid class level" }, { status: 400 });
    }

    // Check if combination already exists
    const existingCombination = await db
      .select()
      .from(CLUSTER_MBTI_RIASEC_COMBINATIONS)
      .where(
        and(
          eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.mbti_type, mbtiType),
          eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.riasec_code, riasecCode),
          eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.class_level, classLevel)
        )
      );
    console.log("Log 2", "existingCombination:", existingCombination)
    let sortingData;

    if (existingCombination.length === 0) {
      // Create new combination entry
      try {
        const [insertResult] = await db
          .insert(CLUSTER_MBTI_RIASEC_COMBINATIONS)
          .values({
            mbti_type: mbtiType,
            riasec_code: riasecCode,
            class_level: classLevel,
            sorted_clusters: {},
            generation_status: 'in_progress',
            generated_by: userId
          });

        console.log('Created new cluster combination record, starting generation...');
        
        // Generate sorting data
        sortingData = await generateClusterSorting(mbtiType, riasecCode, classLevel);

        // Update with completed data
        await db
          .update(CLUSTER_MBTI_RIASEC_COMBINATIONS)
          .set({ 
            generation_status: 'completed',
            sorted_clusters: sortingData
          })
          .where(eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.id, insertResult.insertId));

        console.log('Cluster sorting generation completed successfully');

      } catch (insertError) {
        if (insertError.code === 'ER_DUP_ENTRY') {
          // Another request created the record, fetch it
          console.log('Another request created cluster combination record, fetching status...');
          const [existingRecord] = await db
            .select()
            .from(CLUSTER_MBTI_RIASEC_COMBINATIONS)
            .where(
              and(
                eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.mbti_type, mbtiType),
                eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.riasec_code, riasecCode),
                eq(CLUSTER_MBTI_RIASEC_COMBINATIONS.class_level, classLevel)
              )
            );

          if (existingRecord.generation_status === 'completed') {
            sortingData = existingRecord.sorted_clusters;
          } else if (existingRecord.generation_status === 'in_progress') {
            const completedRecord = await waitForGenerationCompletion(existingRecord.id);
            sortingData = completedRecord.sorted_clusters;
          } else if (existingRecord.generation_status === 'failed') {
            sortingData = await handleFailedGeneration(existingRecord.id, mbtiType, riasecCode, classLevel, userId);
          }
        } else {
          throw insertError;
        }
      }
    } else {
      // Handle existing combination
      const combination = existingCombination[0];
      
      if (combination.generation_status === 'completed') {
        sortingData = combination.sorted_clusters;
      } else if (combination.generation_status === 'in_progress') {
        const completedRecord = await waitForGenerationCompletion(combination.id);
        sortingData = completedRecord.sorted_clusters;
      } else if (combination.generation_status === 'failed') {
        sortingData = await handleFailedGeneration(combination.id, mbtiType, riasecCode, classLevel, userId);
      }
    }

    // Get full cluster data
    const clusters = await db
      .select()
      .from(CLUSTER);

    // Get user's cluster associations
    const userClusters = await db
      .select({
        id: USER_CLUSTER.id,
        user_id: USER_CLUSTER.user_id,
        cluster_id: USER_CLUSTER.cluster_id,
        mbti_type: USER_CLUSTER.mbti_type,
        riasec_code: USER_CLUSTER.riasec_code,
        selected: USER_CLUSTER.selected,
        created_at: USER_CLUSTER.created_at
      })
      .from(USER_CLUSTER)
      .where(eq(USER_CLUSTER.user_id, userId));

    console.log("sortingData",sortingData)

    // Parse sortingData if it's a string (from DB), otherwise use as-is (fresh generation)
    const parsedSortingData = typeof sortingData === 'string' ? JSON.parse(sortingData) : sortingData;

    // Merge sorting data with cluster details
    const sortedClustersWithDetails = parsedSortingData.sorted_clusters.map(sortedCluster => {
      const clusterDetails = clusters.find(c => c.name === sortedCluster.cluster);
      return {
        ...sortedCluster,
        cluster_details: clusterDetails
      };
    });
    
    // Compile full user data
    const fullUserData = {
      ...userDetails[0],
      personality_type: mbtiType,
      riasec_code: riasecCode,
      ...calculateAge(userDetails[0].birth_date)
    };

    return NextResponse.json({
      userData: {
        plan_type: fullUserData.plan_type || "base",
        personality_type: fullUserData.personality_type,
        riasec_code: fullUserData.riasec_code,
        age: fullUserData.age,
        current_age_week: fullUserData.currentAgeWeek
      },
      sorted_clusters: sortedClustersWithDetails,
      userClusters: userClusters, // Added userClusters data
      personality_summary: parsedSortingData.personality_summary,
      development_notes: parsedSortingData.development_notes,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching sorted clusters:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}