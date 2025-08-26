import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';  // Import jose

export async function middleware(req) {

  const res = NextResponse.next({
    headers: {
      'Cache-Control': 'no-store',  // Disable caching
    }
  });

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/verify',
    '/api/login',
    '/api/signup',
    '/verify/verify-certificate'
  ];

  // Current path being accessed
  const path = req.nextUrl.pathname;

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  // If it's a public route, allow access
  // if (isPublicRoute) {
  //   return NextResponse.next();
  // }
  if (isPublicRoute) {
    return res;  // Allow access to public routes without checking token
  }
  // Try to get the token from cookies
  const token = req.cookies.get('auth_token')?.value;
  // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // If no token exists, redirect to login
  if (!token) {
    console.log("not token auth");
    
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    console.log('try');
    // Verify the token using jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

    const { payload } = await jwtVerify(token, secret);  // Verify JWT with jose

    // Check Base/Pro plan in JWT payload
    const plan = payload.plan;

    console.log("plan, plan", plan)

    // Redirect to activation page if no plan is set
    if (!plan && !path.startsWith('/activation')) {
      console.log("No plan → Redirecting to /activation");
      return NextResponse.redirect(new URL('/activation', req.url));
    }

    /* For now we are taking away the vefication penging thing away */
    // if (
    //   payload.isVerified === false &&
    //   !path.startsWith('/verification-pending')  // Prevent redirect loop
    // ) {
    //   return NextResponse.redirect(new URL('/verification-pending', req.url));
    // }

    // If everything is okay, continue the request
    // return NextResponse.next();
    // return response; 

    return res;

  } catch (error) {
    // Token is invalid or expired
    console.log("catch ", error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Apply middleware to all routes except these
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ]
};
