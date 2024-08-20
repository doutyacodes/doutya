import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req)
{
    console.log('got user id function')
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    console.log(userData)
    const userId = userData.userId;
    console.log('userrrr id',userId)
    return NextResponse.json({ userId });
}