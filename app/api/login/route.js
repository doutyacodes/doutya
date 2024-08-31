import { db } from '@/utils';
import { USER_DETAILS } from '@/utils/schema';
import { decryptText } from '@/utils/encryption';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    console.log('got')
    const data = await req.json();
    console.log(data)
    const username=data.username;
    console.log(username)
    const [existingUser] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, username))
      .execute();

    console.log(existingUser)

    if (!existingUser) {
      console.log('not')
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    const decryptedPassword = decryptText(existingUser.password);

    if (decryptedPassword === data.password) {
      const token = jwt.sign(
        { userId: existingUser.id },
        process.env.JWT_SECRET_KEY,
        // { expiresIn: '1h' }
      );
      console.log(existingUser.birth_date)
      return NextResponse.json({ token,birth_date:existingUser.birth_date }, { status: 200 }, { message: 'Loggedin successfully.' });
    } else {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

