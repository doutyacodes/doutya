// import { NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';  // Import jose

// export async function middleware(req) {

//   const res = NextResponse.next({
//     headers: {
//       'Cache-Control': 'no-store',  // Disable caching
//     }
//   });

//   // Public routes that don't require authentication
//   const publicRoutes = [
//     '/',
//     '/login',
//     '/signup',
//     '/verify',
//     '/api/login',
//     '/api/signup',
//     '/verify/verify-certificate'
//   ];

//   // Current path being accessed
//   const path = req.nextUrl.pathname;

//   // Check if the current path is a public route
//   const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

//   // If it's a public route, allow access
//   // if (isPublicRoute) {
//   //   return NextResponse.next();
//   // }
//   if (isPublicRoute) {
//     return res;  // Allow access to public routes without checking token
//   }
//   // Try to get the token from cookies
//   const token = req.cookies.get('auth_token')?.value;
//   // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

//   // If no token exists, redirect to login
//   if (!token) {
//     console.log("not token auth");
    
//     return NextResponse.redirect(new URL('/login', req.url));
//   }

//   try {
//     console.log('try');
//     // Verify the token using jose
//     const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

//     const { payload } = await jwtVerify(token, secret);  // Verify JWT with jose

//     // Check Base/Pro plan in JWT payload
//     const plan = payload.plan;

//     console.log("plan, plan", plan)

//     // Redirect to activation page if no plan is set
//     if (!plan && !path.startsWith('/activation')) {
//       console.log("No plan → Redirecting to /activation");
//       return NextResponse.redirect(new URL('/activation', req.url));
//     }

//     /* For now we are taking away the vefication penging thing away */
//     // if (
//     //   payload.isVerified === false &&
//     //   !path.startsWith('/verification-pending')  // Prevent redirect loop
//     // ) {
//     //   return NextResponse.redirect(new URL('/verification-pending', req.url));
//     // }

//     // If everything is okay, continue the request
//     // return NextResponse.next();
//     // return response; 

//     return res;

//   } catch (error) {
//     // Token is invalid or expired
//     console.log("catch ", error);
//     return NextResponse.redirect(new URL('/login', req.url));
//   }
// }

// // Specify which routes this middleware should run on
// export const config = {
//   matcher: [
//     // Apply middleware to all routes except these
//     '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
//   ]
// };
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // Skip static assets and favicon
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  console.log("🔔 Middleware triggered for PAGE:", pathname);

  // Public routes
  const publicRoutes = [
    '/login',
    '/signup',
    '/verify',
    '/api/login',
    '/api/signup',
    '/verify/verify-certificate'
  ];

  // Allow homepage (/) and specific public routes
  const isPublicRoute =
    pathname === '/' ||
    publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    console.log("⚡ Public route, allowing access:", pathname);
    return NextResponse.next();
  }

  // Get token from cookies
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    console.log("❌ No token found, redirecting to /login");
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);

    console.log("✅ JWT payload:", payload);

    // ✅ Step 1: Check verification first
    if (payload.isVerified === false) {
      if (!pathname.startsWith('/verification-pending')) {
        console.log("⚠️ Not verified → redirecting to /verification-pending");
        return NextResponse.redirect(new URL('/verification-pending', req.url));
      }
    }

    // ✅ Step 2: Check plan (only if verified)
    if (!payload.plan) {
      if (
        !pathname.startsWith('/activation') &&
        !pathname.startsWith('/verification-pending')
      ) {
        console.log("⚠️ No plan → redirecting to /activation");
        return NextResponse.redirect(new URL('/activation', req.url));
      }
    }

    return NextResponse.next();

  } catch (error) {
    console.log("❌ JWT invalid or expired:", error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: '/:path*',
};
