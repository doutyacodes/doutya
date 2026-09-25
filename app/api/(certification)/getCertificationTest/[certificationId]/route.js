import { db } from '@/utils';
import { 
    CERTIFICATION_QUIZ, 
    CERTIFICATION_QUIZ_OPTIONS, 
    CERTIFICATION_USER_PROGRESS, 
    CERTIFICATIONS, 
    USER_CERTIFICATION_COMPLETION, 
    USER_DETAILS, 
    CAREER_GROUP, 
    TOPICS_COVERED, 
    QUIZ_SEQUENCES, 
    CLUSTER, 
    SECTOR,
    USER_CAREER,
    USER_CLUSTER,
    USER_SECTOR
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray, sql, desc } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { GenerateCourse } from '@/app/api/utils/GenerateCourse';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

async function fetchAndFormatQuestions(certificationId, level) {
    const existingQuestions = await db
        .select({
            questionId: CERTIFICATION_QUIZ.id,
            question: CERTIFICATION_QUIZ.question,
            optionId: CERTIFICATION_QUIZ_OPTIONS.id,
            option_text: CERTIFICATION_QUIZ_OPTIONS.option_text,
            is_answer: CERTIFICATION_QUIZ_OPTIONS.is_answer,
        })
        .from(CERTIFICATION_QUIZ)
        .innerJoin(CERTIFICATION_QUIZ_OPTIONS, eq(CERTIFICATION_QUIZ.id, CERTIFICATION_QUIZ_OPTIONS.question_id))
        .where(
            and(
                eq(CERTIFICATION_QUIZ.certification_id, certificationId),
                eq(CERTIFICATION_QUIZ.level, level) 
            )
        );

    if (existingQuestions.length > 0) {
        const formattedQuestions = existingQuestions.reduce((acc, row) => {
            const { questionId, question, optionId, option_text, is_answer } = row;

            let questionEntry = acc.find(q => q.question === question);
            if (!questionEntry) {
                questionEntry = { id: questionId, question, options: [] };
                acc.push(questionEntry);
            }

            questionEntry.options.push({
                id: optionId,
                text: option_text,
                is_answer: is_answer === "yes" ? "yes" : "no",
            });

            return acc;
        }, []);

        return { questions: formattedQuestions };
    }

    return { questions: [] };
}

// Helper to resolve scope name across career, cluster, or sector
async function resolveScopeName(scopeType, scopeId, userId) {
    try {
        if (scopeType === 'career') {
            const cg = await db
                .select({ name: CAREER_GROUP.career_name })
                .from(CAREER_GROUP)
                .where(eq(CAREER_GROUP.id, scopeId))
                .limit(1);
            if (cg.length && cg[0].name) return cg[0].name;

            const uc = await db
                .select({ name: CAREER_GROUP.career_name })
                .from(USER_CAREER)
                .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
                .where(eq(USER_CAREER.id, scopeId))
                .limit(1);
            if (uc.length && uc[0].name) return uc[0].name;

            if (userId) {
                const uac = await db
                    .select({ name: CAREER_GROUP.career_name })
                    .from(USER_CAREER)
                    .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
                    .where(eq(USER_CAREER.user_id, userId))
                    .orderBy(desc(USER_CAREER.id))
                    .limit(1);
                if (uac.length && uac[0].name) return uac[0].name;
            }
        } else if (scopeType === 'cluster') {
            const cl = await db
                .select({ name: CLUSTER.name })
                .from(CLUSTER)
                .where(eq(CLUSTER.id, scopeId))
                .limit(1);
            if (cl.length && cl[0].name) return cl[0].name;

            const ucl = await db
                .select({ name: CLUSTER.name })
                .from(USER_CLUSTER)
                .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
                .where(eq(USER_CLUSTER.id, scopeId))
                .limit(1);
            if (ucl.length && ucl[0].name) return ucl[0].name;

            if (userId) {
                const uacl = await db
                    .select({ name: CLUSTER.name })
                    .from(USER_CLUSTER)
                    .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
                    .where(eq(USER_CLUSTER.user_id, userId))
                    .orderBy(desc(USER_CLUSTER.id))
                    .limit(1);
                if (uacl.length && uacl[0].name) return uacl[0].name;
            }
        } else if (scopeType === 'sector') {
            const sc = await db
                .select({ name: SECTOR.name })
                .from(SECTOR)
                .where(eq(SECTOR.id, scopeId))
                .limit(1);
            if (sc.length && sc[0].name) return sc[0].name;

            const usc = await db
                .select({ name: SECTOR.name })
                .from(USER_SECTOR)
                .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
                .where(eq(USER_SECTOR.id, scopeId))
                .limit(1);
            if (usc.length && usc[0].name) return usc[0].name;

            if (userId) {
                const uasc = await db
                    .select({ name: SECTOR.name })
                    .from(USER_SECTOR)
                    .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
                    .where(eq(USER_SECTOR.user_id, userId))
                    .orderBy(desc(USER_SECTOR.id))
                    .limit(1);
                if (uasc.length && uasc[0].name) return uasc[0].name;
            }
        }
    } catch (err) {
        console.error("Error resolving scope name:", err);
    }
    return '';
}

export async function GET(request, { params }) {
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { certificationId } = params;
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level") || "beginner";

    if (!certificationId) {
        return NextResponse.json({ message: 'Invalid certificationId' }, { status: 400 });
    }

    try {
        // Step 1: Check if certification is already completed
        const certificationStatus = await db
            .select({ completed: USER_CERTIFICATION_COMPLETION.completed })
            .from(USER_CERTIFICATION_COMPLETION)
            .where(and(
                eq(USER_CERTIFICATION_COMPLETION.user_id, userId),
                eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId)
            ));

        if (certificationStatus.length > 0 && certificationStatus[0].completed === 'yes') {
            return NextResponse.json({ isCompleted: true }, { status: 200 });
        }

        // Get user details
        const userDetailsResult = await db
            .select({ 
                birth_date: USER_DETAILS.birth_date,
                educationLevel: USER_DETAILS.education_level,
                academicYearStart: USER_DETAILS.academicYearStart,
                academicYearEnd: USER_DETAILS.academicYearEnd,
                className: USER_DETAILS.class_name,
                scope_type: USER_DETAILS.scope_type
            })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));

        if (!userDetailsResult.length) {
            return NextResponse.json({ message: 'User details not found.' }, { status: 404 });
        }

        const userDetails = userDetailsResult[0];
        const birth_date = userDetails.birth_date;
        let age = 18;
        if (birth_date) {
            const calculated = calculateAge(birth_date);
            if (!isNaN(calculated) && calculated > 0) {
                age = calculated;
            }
        }
        const className = userDetails.className || 'completed';

        // Get certification details
        const certificationDetails = await db
            .select({
                certificationName: CERTIFICATIONS.certification_name,
                scopeId: CERTIFICATIONS.scope_id,
                scopeType: CERTIFICATIONS.scope_type
            })
            .from(CERTIFICATIONS)
            .where(eq(CERTIFICATIONS.id, certificationId));

        if (!certificationDetails.length) {
            return NextResponse.json({ message: 'Certification details not found.' }, { status: 404 });
        }

        const certificationName = certificationDetails[0].certificationName;
        const scopeId = certificationDetails[0].scopeId;
        const scopeType = certificationDetails[0].scopeType || userDetails.scope_type || 'career';

        // Get scope name based on scope type (career, cluster, or sector)
        let scopeName = await resolveScopeName(scopeType, scopeId, userId);
        if (!scopeName) {
            scopeName = certificationName; // Fallback to avoid empty prompt string
        }

        // Get personality sequences
        const personalities = await db
            .select({
                quizId: QUIZ_SEQUENCES.quiz_id,
                typeSequence: QUIZ_SEQUENCES.type_sequence
            })
            .from(QUIZ_SEQUENCES)
            .where(
                and(
                    eq(QUIZ_SEQUENCES.user_id, userId),
                    inArray(QUIZ_SEQUENCES.quiz_id, [1, 2])
                )
            );

        let type1 = null;
        let type2 = null;

        for (const p of personalities) {
            if (p.quizId === 1) type1 = p.typeSequence;
            else if (p.quizId === 2) type2 = p.typeSequence;
        }

        // Fallbacks for personality types if missing
        if (!type1 || !type2) {
            if (scopeType === 'career') {
                const uc = await db.select({ type1: USER_CAREER.type1, type2: USER_CAREER.type2 }).from(USER_CAREER).where(eq(USER_CAREER.user_id, userId)).limit(1);
                if (uc.length) {
                    type1 = type1 || uc[0].type1;
                    type2 = type2 || uc[0].type2;
                }
            } else if (scopeType === 'cluster') {
                const ucl = await db.select({ mbti_type: USER_CLUSTER.mbti_type, riasec_code: USER_CLUSTER.riasec_code }).from(USER_CLUSTER).where(eq(USER_CLUSTER.user_id, userId)).limit(1);
                if (ucl.length) {
                    type1 = type1 || ucl[0].mbti_type;
                    type2 = type2 || ucl[0].riasec_code;
                }
            }
        }
        type1 = type1 || 'ENTP';
        type2 = type2 || 'RIA';

        let totalAnswered = 0;
        
        // Check progress
        const checkProgress = await db
            .select({
                isStarted: USER_CERTIFICATION_COMPLETION.isStarted
            })
            .from(USER_CERTIFICATION_COMPLETION)
            .where(
                and(
                    eq(USER_CERTIFICATION_COMPLETION.user_id, userId),
                    eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId)
                )
            );
    
        if (checkProgress.length > 0 && checkProgress[0].isStarted) {
            const totalQuestionsAnswered = await db
                .select({
                    countQuestionIds: sql`COUNT(${CERTIFICATION_USER_PROGRESS.quiz_id})`
                })
                .from(CERTIFICATION_USER_PROGRESS)
                .where(
                    and(
                        eq(CERTIFICATION_USER_PROGRESS.user_id, userId),
                        eq(CERTIFICATION_USER_PROGRESS.certification_id, certificationId)
                    )
                );
    
            totalAnswered = totalQuestionsAnswered[0]?.countQuestionIds || 0;
        }

        // Check existing questions and fetch quiz progress
        let { questions } = await fetchAndFormatQuestions(certificationId, level);

        // If no questions are found, generate new course data
        if (questions.length === 0) {
            await GenerateCourse(
                userId, 
                age, 
                level, 
                certificationName, 
                scopeName, 
                certificationId, 
                birth_date || new Date().toISOString(), 
                className, 
                type1, 
                type2, 
                scopeType
            );
            
            ({ questions } = await fetchAndFormatQuestions(certificationId, level));
        }

        // Fetch topics covered
        const topicsCovered = await db
            .select({
                topicName: TOPICS_COVERED.topic_name
            })
            .from(TOPICS_COVERED)
            .where(eq(TOPICS_COVERED.certification_id, certificationId));

        const topics = topicsCovered.map(topic => topic.topicName);

        const certificationOverview = {
            certificationName,
            scopeName,
            careerName: scopeName, // Backwards compatibility for frontend
            scopeType,
            topics
        };

        return NextResponse.json({ 
            certificationOverview, 
            quizProgress: totalAnswered, 
            questions 
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers', error: error.message }, { status: 500 });
    }
}
