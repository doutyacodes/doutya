import { db } from '@/utils';
import { USER_CERTIFICATION_COMPLETION, CERTIFICATIONS, USER_DETAILS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(request, { params }) {

    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const { certificationId } = params;
    
    if (!certificationId) {
        return NextResponse.json({ message: 'Invalid certificationId' }, { status: 400 });
    }

    try {
        // Fetch certification details, username, stars, percentage, and updated time
        const certificationDetails = await db
            .select({
                certificationName: CERTIFICATIONS.certification_name, // Certification name
                username: USER_DETAILS.username, // User's username
                ratingStars: USER_CERTIFICATION_COMPLETION.rating_stars, // Certification stars
                scorePercentage: USER_CERTIFICATION_COMPLETION.score_percentage, // Certification score percentage
                updatedAt: USER_CERTIFICATION_COMPLETION.updated_at // Last updated time
            })
            .from(USER_CERTIFICATION_COMPLETION)
            .innerJoin(CERTIFICATIONS, eq(USER_CERTIFICATION_COMPLETION.certification_id, CERTIFICATIONS.id))
            .innerJoin(USER_DETAILS, eq(USER_CERTIFICATION_COMPLETION.user_id, USER_DETAILS.id))
            .where(
                and(
                    eq(USER_CERTIFICATION_COMPLETION.user_id, userId), // Ensure the user ID matches
                    eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId) // Match certification ID
                )
            )
            .execute();

        // If no certification details are found
        if (certificationDetails.length === 0) {
            return NextResponse.json({ message: 'No certification details found' }, { status: 404 });
        }

        // Prepare the response with certification details
        return NextResponse.json({
            certificationName: certificationDetails[0].certificationName,
            username: certificationDetails[0].username,
            ratingStars: certificationDetails[0].ratingStars,
            scorePercentage: certificationDetails[0].scorePercentage,
            updatedAt: certificationDetails[0].updatedAt,
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching certification details:", error);
        return NextResponse.json({ message: 'Error fetching certification details' }, { status: 500 });
    }
}
