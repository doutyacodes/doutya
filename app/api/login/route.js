import { db } from '@/utils';
import { USER_DETAILS } from '@/utils/schema';
import { decryptText } from '@/utils/encryption';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const data = await req.json();
    const username=data.username;
    const [existingUser] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, username))
      .execute();

    if (!existingUser) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    const decryptedPassword = decryptText(existingUser.password);

    if (decryptedPassword === data.password) {
      const token = jwt.sign(
        { userId: existingUser.id },
        process.env.JWT_SECRET_KEY,
        // { expiresIn: '1h' }
      );
      console.log(token)
      return NextResponse.json({ token }, { status: 200 }, { message: 'Loggedin successfully.' });
    } else {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

