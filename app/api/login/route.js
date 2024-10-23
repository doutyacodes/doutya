import { db } from '@/utils';
import { USER_DETAILS, QUIZ_SEQUENCES } from '@/utils/schema';
import { decryptText } from '@/utils/encryption';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const data = await req.json();
    const { username, password } = data;

    // Find the user in USER_DETAILS
    const [existingUser] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, username))
      .execute();

    // If user is not found
    if (!existingUser) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    // Decrypt stored password and check if it matches
    const decryptedPassword = decryptText(existingUser.password);

    if (decryptedPassword !== password) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_SECRET_KEY,
      //{ expiresIn: '1h' } // Adjust expiration as needed
    );

    // Check if the user has completed any quiz from QUIZ_SEQUENCES
    const [quizSequence] = await db
      .select()
      .from(QUIZ_SEQUENCES)
      .where(eq(QUIZ_SEQUENCES.user_id, existingUser.id))
      .execute();

    const quizCompleted = quizSequence ? true : false;

    // Return the token and quiz completion status
    return NextResponse.json({
      token,
      birth_date: existingUser.birth_date,
      quizCompleted,
    }, { status: 200 });

  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
