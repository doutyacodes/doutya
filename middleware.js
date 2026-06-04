import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  /* =====================================================
     1️⃣ SKIP STATIC FILES & API ROUTES
  ===================================================== */
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

  /* =====================================================
     2️⃣ MAINTENANCE MODE CHECK (NEW)
  ===================================================== */
  try {
    const maintenanceRes = await fetch(
      `${req.nextUrl.origin}/api/app/maintenance/status`,
      { cache: 'no-store' }
    );

    const maintenanceData = await maintenanceRes.json();

    console.log("🔔 Middleware maintenanceData:", maintenanceData);

    // 🟥 Maintenance ON → force everyone to /maintenance
    if (maintenanceData?.maintenanceMode === true) {
      if (!pathname.startsWith('/maintenance')) {
        console.log("🚧 Maintenance ON → redirecting to /maintenance");
        return NextResponse.redirect(
          new URL('/maintenance', req.url)
        );
      }

      // Already on /maintenance → allow
      return NextResponse.next();
    }

    // 🟩 Maintenance OFF but user still on /maintenance
    if (
      maintenanceData?.maintenanceMode === false &&
      pathname.startsWith('/maintenance')
    ) {
      console.log("✅ Maintenance OFF → leaving maintenance page");
      return NextResponse.redirect(
        new URL('/', req.url)
      );
    }

  } catch (err) {
    console.log("⚠️ Maintenance check failed, allowing access");
  }

  /* =====================================================
     3️⃣ PUBLIC ROUTES (EXISTING LOGIC)
  ===================================================== */
  const publicRoutes = [
    '/login',
    '/signup',
    '/open-signup',
    '/verify',
    '/api/login',
    '/api/signup',
    '/api/open-signup',
    '/verify/verify-certificate'
  ];

  const isPublicRoute =
    pathname === '/' ||
    publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    console.log("⚡ Public route, allowing access:", pathname);
    return NextResponse.next();
  }

  /* =====================================================
     4️⃣ AUTH TOKEN CHECK (EXISTING)
  ===================================================== */
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    console.log("❌ No token found, redirecting to /login");
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);

    console.log("✅ JWT payload:", payload);

    /* =====================================================
       5️⃣ VERIFICATION CHECK (EXISTING)
    ===================================================== */
    if (payload.isVerified === false) {
      if (!pathname.startsWith('/verification-pending')) {
        console.log("⚠️ Not verified → redirecting");
        return NextResponse.redirect(
          new URL('/verification-pending', req.url)
        );
      }
    }

    /* =====================================================
       6️⃣ PLAN CHECK (EXISTING)
    ===================================================== */
    if (!payload.plan) {
      if (
        !pathname.startsWith('/activation') &&
        !pathname.startsWith('/verification-pending')
      ) {
        console.log("⚠️ No plan → redirecting");
        return NextResponse.redirect(
          new URL('/activation', req.url)
        );
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
