import { NextResponse } from "next/server";
import { db } from "@/utils";
import { 
  SECTOR_MBTI_RIASEC_COMBINATIONS, 
  SECTOR, 
  USER_DETAILS, 
  QUIZ_SEQUENCES 
} from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { 
  generateSectorSorting,
  validateMBTI,
  validateRIASEC, 
  validateClassLevel 
} from "@/app/api/utils/generateSectorSorting";

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
      .from(SECTOR_MBTI_RIASEC_COMBINATIONS)
      .where(eq(SECTOR_MBTI_RIASEC_COMBINATIONS.id, combinationId));
    
    if (updatedStatus) {
      const status = updatedStatus.generation_status;
      
      if (status === 'completed') {
        console.log('Sector sorting generation completed by another request');
        return updatedStatus;
      } else if (status === 'failed') {
        throw new Error('Sector sorting generation failed by another request');
      }
    }
  }
  
  throw new Error('Sector sorting generation timed out');
};

// Helper function to handle failed generation with atomic retry
const handleFailedGeneration = async (combinationId, mbtiType, riasecCode, classLevel, userId) => {
  try {
    // Use atomic update to claim the retry
    await db
      .update(SECTOR_MBTI_RIASEC_COMBINATIONS)
      .set({ 
        generation_status: 'in_progress',
        generated_by: userId 
      })
      .where(
        and(
          eq(SECTOR_MBTI_RIASEC_COMBINATIONS.id, combinationId),
          eq(SECTOR_MBTI_RIASEC_COMBINATIONS.generation_status, 'failed')
        )
      );

    console.log('Attempting to retry failed sector sorting generation...');
    
    const sortingData = await generateSectorSorting(mbtiType, riasecCode, classLevel);

    await db
      .update(SECTOR_MBTI_RIASEC_COMBINATIONS)
      .set({ 
        generation_status: 'completed',
        sorted_sectors: sortingData
      })
      .where(eq(SECTOR_MBTI_RIASEC_COMBINATIONS.id, combinationId));
    
    console.log('Retry sector sorting generation completed successfully');
    
    return sortingData;
  } catch (error) {
    await db
      .update(SECTOR_MBTI_RIASEC_COMBINATIONS)
      .set({ generation_status: 'failed' })
      .where(eq(SECTOR_MBTI_RIASEC_COMBINATIONS.id, combinationId));
    
    console.error('Retry sector sorting generation failed:', error);
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
      .select({
        grade: USER_DETAILS.grade,
        scope_type: USER_DETAILS.scope_type
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    if (!userDetails.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const classLevel = parseInt(userDetails[0].grade) || 5; // Default to class 5 if not set
    const scopeType = userDetails[0].scope_type;

    // Check if user is in sector scope
    if (scopeType !== 'sector') {
      return NextResponse.json({ 
        message: "Sorted sectors are only available for users in sector scope" 
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
      .from(SECTOR_MBTI_RIASEC_COMBINATIONS)
      .where(
        and(
          eq(SECTOR_MBTI_RIASEC_COMBINATIONS.mbti_type, mbtiType),
          eq(SECTOR_MBTI_RIASEC_COMBINATIONS.riasec_code, riasecCode),
          eq(SECTOR_MBTI_RIASEC_COMBINATIONS.class_level, classLevel)
        )
      );

    let sortingData;

    if (existingCombination.length === 0) {
      // Create new combination entry
      try {
        const [insertResult] = await db
          .insert(SECTOR_MBTI_RIASEC_COMBINATIONS)
          .values({
            mbti_type: mbtiType,
            riasec_code: riasecCode,
            class_level: classLevel,
            sorted_sectors: {},
            generation_status: 'in_progress',
            generated_by: userId
          });

        console.log('Created new sector combination record, starting generation...');
        
        // Generate sorting data
        sortingData = await generateSectorSorting(mbtiType, riasecCode, classLevel);

        // Update with completed data
        await db
          .update(SECTOR_MBTI_RIASEC_COMBINATIONS)
          .set({ 
            generation_status: 'completed',
            sorted_sectors: sortingData
          })
          .where(eq(SECTOR_MBTI_RIASEC_COMBINATIONS.id, insertResult.insertId));

        console.log('Sector sorting generation completed successfully');

      } catch (insertError) {
        if (insertError.code === 'ER_DUP_ENTRY') {
          // Another request created the record, fetch it
          console.log('Another request created sector combination record, fetching status...');
          const [existingRecord] = await db
            .select()
            .from(SECTOR_MBTI_RIASEC_COMBINATIONS)
            .where(
              and(
                eq(SECTOR_MBTI_RIASEC_COMBINATIONS.mbti_type, mbtiType),
                eq(SECTOR_MBTI_RIASEC_COMBINATIONS.riasec_code, riasecCode),
                eq(SECTOR_MBTI_RIASEC_COMBINATIONS.class_level, classLevel)
              )
            );

          if (existingRecord.generation_status === 'completed') {
            sortingData = existingRecord.sorted_sectors;
          } else if (existingRecord.generation_status === 'in_progress') {
            const completedRecord = await waitForGenerationCompletion(existingRecord.id);
            sortingData = completedRecord.sorted_sectors;
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
        sortingData = combination.sorted_sectors;
      } else if (combination.generation_status === 'in_progress') {
        const completedRecord = await waitForGenerationCompletion(combination.id);
        sortingData = completedRecord.sorted_sectors;
      } else if (combination.generation_status === 'failed') {
        sortingData = await handleFailedGeneration(combination.id, mbtiType, riasecCode, classLevel, userId);
      }
    }

    // Get full sector data
    const sectors = await db
      .select()
      .from(SECTOR);

    // Merge sorting data with sector details
    const sortedSectorsWithDetails = sortingData.sorted_sectors.map(sortedSector => {
      const sectorDetails = sectors.find(s => s.name === sortedSector.sector);
      return {
        ...sortedSector,
        sector_details: sectorDetails
      };
    });

    return NextResponse.json({
      sorted_sectors: sortedSectorsWithDetails,
      personality_summary: sortingData.personality_summary,
      development_notes: sortingData.development_notes,
      user_profile: {
        mbti_type: mbtiType,
        riasec_code: riasecCode,
        class_level: classLevel
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching sorted sectors:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}