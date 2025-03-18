import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { USER_CERTIFICATION_COMPLETION, USER_DETAILS } from '@/utils/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    // Parse the JSON body
    const body = await req.json();
    const { certificateId } = body;

    if (!certificateId) {
      return NextResponse.json(
        { message: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    // Query the database to find the certificate
    const certificationResults = await db
      .select({
        certification_id: USER_CERTIFICATION_COMPLETION.certification_id,
        certification_name: USER_CERTIFICATION_COMPLETION.certification_name,
        user_id: USER_CERTIFICATION_COMPLETION.user_id,
        status: USER_CERTIFICATION_COMPLETION.status,
        issued_at: USER_CERTIFICATION_COMPLETION.issued_at,
        score_percentage: USER_CERTIFICATION_COMPLETION.score_percentage
      })
      .from(USER_CERTIFICATION_COMPLETION)
      .where(eq(USER_CERTIFICATION_COMPLETION.certificate_id, certificateId))
      .limit(1);

    // If certificate not found
    if (!certificationResults || certificationResults.length === 0) {
      return NextResponse.json(
        { 
          status: 'invalid',
          message: 'Certificate not found' 
        },
        { status: 404 }
      );
    }

    const certification = certificationResults[0];

    // If certificate status is invalid
    if (certification.status === 'invalid') {
      return NextResponse.json(
        { 
          status: 'invalid',
          message: 'Certificate has been revoked or is invalid' 
        },
        { status: 200 }
      );
    }

    // Get user details
    const userDetails = await db
      .select({
        name: USER_DETAILS.name
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, certification.user_id))
      .limit(1);

    // Return the verification result with user details
    return NextResponse.json({
      status: 'valid',
      certification_id: certification.certification_id,
      certification_name: certification.certification_name,
      user_id: certification.user_id,
      user_name: userDetails[0]?.name || 'Unknown User',
      issued_at: certification.issued_at,
      score_percentage: certification.score_percentage
    });

  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}