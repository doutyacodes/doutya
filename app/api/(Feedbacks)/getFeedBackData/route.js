import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import { CAREER_SUBJECTS, CHALLENGE_PROGRESS, CHALLENGES, SUBJECTS, TESTS, USER_CAREER, USER_DETAILS, USER_SUBJECT_COMPLETIONUSER_TESTS } from "@/utils/schema";
import { and, between, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    
    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const { searchParams } = new URL(req.url);
    const scope_id = parseInt(searchParams.get('id'));
    const month = parseInt(searchParams.get('month'), 10); // Parse the month parameter from the URL
    const currentYear = parseInt(searchParams.get('year'));
    const currentWeek = parseInt(searchParams.get('week'));
    
  
    if (!month || month < 1 || month > 12) {
      return NextResponse.json({ message: "Invalid month parameter. Please provide a month between 1 and 12." }, { status: 400 });
    }

    if (!currentYear || currentYear < 0) {
      return NextResponse.json({ message: "Invalid year parameter. Please provide a valid year." }, { status: 400 });
    }
  
    // Calculate the week range for the given month
    const startWeek = (month - 1) * 4 + 1;
    const endWeek = month * 4;
  
    try {
        // Check if the requested month and year are fully completed based on the current year and week
        const totalWeeksInYear = 52;
        const targetYearCompleted = currentYear * totalWeeksInYear + currentWeek;
        const endYearWeek = currentYear * totalWeeksInYear + endWeek;

        if (targetYearCompleted < endYearWeek) {
            return NextResponse.json({
                message: "Feedback for this month will be available once all weeks in the month are completed. Please check back at the end of the month for a detailed summary."
            }, { status: 200 });
        }
  
      // Fetch subjects related to the user’s career
      const subjects = await db
        .select({
          subject_id: SUBJECTS.subject_id,
          subject_name: SUBJECTS.subject_name,
        })
        .from(SUBJECTS)
        .innerJoin(CAREER_SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
        .where(eq(CAREER_SUBJECTS.id, scope_id))
        .execute();
  
        // Fetch test results for the requested month and year
        const testResults = await db
          .select({
            subject_id: TESTS.subject_id,
            stars_awarded: USER_SUBJECT_COMPLETIONUSER_TESTS.stars_awarded,
          })
          .from(USER_SUBJECT_COMPLETIONUSER_TESTS)
          .innerJoin(TESTS, eq(USER_SUBJECT_COMPLETIONUSER_TESTS.test_id, TESTS.test_id))
          .where(
            and(
              eq(USER_SUBJECT_COMPLETIONUSER_TESTS.user_id, userId),
              eq(TESTS.year, currentYear), // Filter by the specified year
              between(TESTS.week_number, startWeek, endWeek)
            )
          )
          .execute();
  
      // Calculate stars per subject for the requested month
      const monthlyStars = {};
      testResults.forEach(test => {
        if (!monthlyStars[test.subject_id]) monthlyStars[test.subject_id] = 0;
        monthlyStars[test.subject_id] += test.stars_awarded;
      });
  
      // Fetch challenge completion status for the requested month
      const challengeResults = await db
        .select({
          status: CHALLENGE_PROGRESS.status,
          challenge_id: CHALLENGE_PROGRESS.challenge_id,
        })
        .from(CHALLENGE_PROGRESS)
        .innerJoin(CHALLENGES, eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id))
        .where(
          and(
            eq(CHALLENGE_PROGRESS.user_id, userId),
            between(CHALLENGES.week, startWeek, endWeek)
          )
        )
        .execute();
  
      // Calculate challenges completed
      const completedChallenges = challengeResults.filter(
        (challenge) => challenge.status === "approved"
      ).length;
      const totalChallenges = challengeResults.length;

      // Generate feedback based on results
      const feedback = subjects.map((subject) => {
        const stars = monthlyStars[subject.subject_id] || 0;
        const maxStars = 8; // Maximum stars a user can earn per subject in a month

        let subjectFeedback;
        if (stars === maxStars) {
          subjectFeedback = `Excellent progress in ${subject.subject_name}! You've mastered this month's content with perfect scores. Your dedication and understanding shine through in your work. Keep maintaining this exceptional standard!`;
        } else if (stars >= 6) {
          subjectFeedback = `Strong performance in ${subject.subject_name}! You're showing great understanding, though there's still room to grow. Focus on the challenging topics and you'll be reaching perfect scores soon.`;
        } else if (stars >= 4) {
          subjectFeedback = `Steady progress in ${subject.subject_name}, but we see potential for more. Try reviewing your study materials before tests and don't hesitate to ask for help with topics you find challenging.`;
        } else {
          subjectFeedback = `We notice you're having some difficulties with ${subject.subject_name}. Let's work on strengthening your foundation - try reviewing past lessons and practice regularly. Remember, every small improvement counts!`;
        }
  
        return {
          subject: subject.subject_name,
          stars,
          feedback: subjectFeedback,
        };
      });

      // Direct feedback based on the number of completed challenges
      let challengeFeedback;
      if (completedChallenges === totalChallenges && totalChallenges > 0) {
        challengeFeedback = "Outstanding achievement on your challenges! You've successfully completed every single one, showing excellent problem-solving skills and dedication. This kind of consistency will take you far!";
      } else if (completedChallenges >= Math.ceil(totalChallenges * 0.75)) {
        challengeFeedback = "Impressive work on your challenges! You've completed most of them successfully. Push yourself to tackle those final few challenges - you're so close to achieving full completion!";
      } else if (completedChallenges > 0) {
        challengeFeedback = "You've made a start with the challenges, which is great! However, there are many more opportunities waiting for you. Each completed challenge builds your skills and confidence - keep pushing forward!";
      } else {
        challengeFeedback = "We haven't seen any completed challenges this month. These challenges are designed to help you grow and apply your knowledge. Start with the ones you feel most comfortable with, and gradually work your way up!";
      }
      // Consolidated feedback based on both tests and challenges
      let consolidatedFeedback;
      const allStars = Object.values(monthlyStars).reduce((acc, stars) => acc + stars, 0);
      const maxPossibleStars = subjects.length * 8;

      if (allStars === maxPossibleStars && completedChallenges === totalChallenges) {
        consolidatedFeedback = "Phenomenal work this month! You've achieved perfect scores across all subjects and completed every challenge. This shows exceptional dedication, understanding, and consistency. You're setting a fantastic example of what can be achieved with hard work and commitment!";
      } else if (allStars >= maxPossibleStars * 0.75 && completedChallenges >= Math.ceil(totalChallenges * 0.75)) {
        consolidatedFeedback = "Excellent progress this month! Your strong performance in both subjects and challenges demonstrates your growing expertise. You're very close to achieving perfect scores - keep up this impressive momentum and continue pushing yourself to reach new heights!";
      } else if (allStars >= maxPossibleStars * 0.5 || completedChallenges >= Math.ceil(totalChallenges * 0.5)) {
        consolidatedFeedback = "You're making steady progress! While you've shown good understanding in some areas, there's room to grow stronger. Try setting specific goals for each subject and challenge. Remember, consistent effort and regular practice are key to improvement!";
      } else {
        consolidatedFeedback = "This month has presented some challenges, but that's okay - it's all part of the learning journey! Let's focus on building stronger study habits and tackling challenges step by step. Remember to ask for help when needed, and celebrate every small victory along the way!";
      }
  
      return NextResponse.json(
        {
          feedback,
          challengeFeedback,
          consolidatedFeedback, // Add the consolidated feedback here
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error generating feedback:", error);
      return NextResponse.json(
        { message: "Error processing request" },
        { status: 500 }
      );
    }
  }
