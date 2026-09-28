export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { INSTITUTION, CLASS } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { decryptURLText } from '@/utils/encryption';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const inviteToken = searchParams.get('invite');
    const institutionIdParam = searchParams.get('id');

    let institutionId = null;

    if (inviteToken) {
      try {
        const decryptedStr = decryptURLText(inviteToken);
        if (decryptedStr) {
          const parsed = JSON.parse(decryptedStr);
          institutionId = parsed.institutionId || parsed.id;
        }
      } catch (decryptErr) {
        console.error('Failed to decrypt invite token:', decryptErr);
        return NextResponse.json(
          { message: 'Invalid or corrupted invitation link' },
          { status: 400 }
        );
      }
    } else if (institutionIdParam) {
      institutionId = parseInt(institutionIdParam);
    }

    if (!institutionId) {
      return NextResponse.json(
        { message: 'Valid institution invitation token is required' },
        { status: 400 }
      );
    }

    // Fetch institution details
    const [institution] = await db
      .select({
        id: INSTITUTION.id,
        name: INSTITUTION.name,
        logo: INSTITUTION.logo,
        type: INSTITUTION.type,
        address: INSTITUTION.address,
        website: INSTITUTION.website,
        board: INSTITUTION.board,
        city: INSTITUTION.city,
        state: INSTITUTION.state,
      })
      .from(INSTITUTION)
      .where(eq(INSTITUTION.id, institutionId));

    if (!institution) {
      return NextResponse.json(
        { message: 'Institution not found' },
        { status: 404 }
      );
    }

    // Fetch classes for this institution
    const classes = await db
      .select({
        id: CLASS.id,
        name: CLASS.name,
        standard_grade: CLASS.standard_grade,
      })
      .from(CLASS)
      .where(eq(CLASS.institution_id, institutionId));

    return NextResponse.json({
      success: true,
      institution,
      classes,
    });
  } catch (error) {
    console.error('Error fetching institution info:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve institution details', error: error.message },
      { status: 500 }
    );
  }
}
