import { db } from "@/utils";
import {
  USER_DETAILS,
  USER_CAREER,
  CAREER_GROUP,
  USER_SECTOR,
  SECTOR,
  USER_CLUSTER,
  CLUSTER,
  QUIZ_SEQUENCES
} from "@/utils/schema";

import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { and, eq } from "drizzle-orm";
import { formattedAge } from "@/lib/formattedAge";
import { calculateWeekFromTimestamp } from "../utils/calculateWeekFromTimestamp";

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) return authResult.response;

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    const user = await db
      .select({ 
        birth_date: USER_DETAILS.birth_date,
        joined_date: USER_DETAILS.joined_date,
        planType: USER_DETAILS.plan_type,
        scopeType: USER_DETAILS.scope_type
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    const birthDate = user[0]?.birth_date;
    const joinedDate = user[0]?.joined_date;
    const planType = user[0]?.planType;
    const age = birthDate ? formattedAge(birthDate) : null;
    const scopeType = user[0]?.scopeType;
    console.log('scopeType', scopeType)
    
    let scopeData = [];
    let tableName = "";

    if (scopeType === "sector") {
      tableName = "sector";
      const data = await db
        .select({
          id: USER_SECTOR.id,
          scope_grp_id: SECTOR.id,
          name: SECTOR.name,
          description: SECTOR.brief_overview,
          created_at: USER_SECTOR.created_at
        })
        .from(USER_SECTOR)
        .leftJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
        .where(eq(USER_SECTOR.user_id, userId));
    
      scopeData = data;
    
    } else if (scopeType === "cluster") {
      tableName = "cluster";
      const data = await db
        .select({
          id: USER_CLUSTER.id,
          scope_grp_id: CLUSTER.id,
          name: CLUSTER.name,
          description: CLUSTER.brief_overview,
          created_at: USER_CLUSTER.created_at,
          riasec_code: USER_CLUSTER.riasec_code,
          selected: USER_CLUSTER.selected
        })
        .from(USER_CLUSTER)
        .leftJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
        .where(
          and(
            eq(USER_CLUSTER.user_id, userId),
            eq(USER_CLUSTER.selected, true),
          ))
    
      scopeData = data;
    
    } else if (scopeType === "career") {
      console.log('inside th ecareer')
      console.log('userId', userId)

      tableName = "career";
      const data = await db
        .select({
          id: USER_CAREER.id,
          scope_grp_id: CAREER_GROUP.id,
          name: CAREER_GROUP.career_name,
          // description: CAREER_GROUP.description,
          created_at: USER_CAREER.created_at
        })
        .from(USER_CAREER)
        .leftJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
        .where(eq(USER_CAREER.user_id, userId));
    
      scopeData = data;
    }
    
    // ✅ Add weekData for all scope types
    scopeData = scopeData.map((item) => ({
      ...item,
      weekData: joinedDate ? calculateWeekFromTimestamp(joinedDate) : null
    }))

    // ✅ Quiz completion status
    const quizSequences = await db
      .select()
      .from(QUIZ_SEQUENCES)
      .where(eq(QUIZ_SEQUENCES.user_id, userId));

    const quizMap = quizSequences.reduce((acc, quiz) => {
      acc[quiz.quiz_id] = quiz.type_sequence;
      return acc;
    }, {});

    const quizStatus = quizMap[1] && quizMap[2] ? 'completed' : 'not_completed';

    // ✅ Final response
    return NextResponse.json(
      {
        type: tableName,
        scopeData,
        age,
        planType,
        quizStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error fetching scope data:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
