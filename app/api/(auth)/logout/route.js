import { NextResponse } from 'next/server';

const clearAuthCookies = (response) => {
  // Clear auth_token with matching attributes
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });
  response.cookies.delete('auth_token');

  // Also clear other common cookie names if any
  ['token', 'session', 'authToken', 'user_token'].forEach(name => {
    try {
      response.cookies.set(name, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
        maxAge: 0,
      });
      response.cookies.delete(name);
    } catch (e) {}
  });

  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
};

export async function GET() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  return clearAuthCookies(response);
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  return clearAuthCookies(response);
}
