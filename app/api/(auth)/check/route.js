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

    // If the token belongs to an unverified user, consider them unauthenticated on check
    // so they are not bounced in an auto-redirect loop and can log in fresh
    if (payload.isVerified === false) {
      const response = NextResponse.json({ 
        authenticated: false, 
        isVerified: false, 
        message: "Account verification pending" 
      }, { status: 401 });

      response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
        maxAge: 0,
      });
      response.cookies.delete('auth_token');
      return response;
    }

    return NextResponse.json({ 
      authenticated: true,
      userId: payload.userId,
      isVerified: payload.isVerified
    }, { status: 200 });

  } catch (error) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    });
    response.cookies.delete('auth_token');
    return response;
  }
}
