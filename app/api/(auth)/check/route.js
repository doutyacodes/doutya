import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({ 
      authenticated: true,
      userId: payload.userId
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}