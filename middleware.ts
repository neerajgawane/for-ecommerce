import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow login page
    if (req.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = req.nextauth.token;
    const isAdmin = token?.role === 'admin' || token?.role === 'super_admin';

    // Check if accessing admin routes (not login)
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!isAdmin) {
        // Not admin, redirect to login
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow login page
        if (req.nextUrl.pathname === '/admin/login') {
          return true;
        }

        // For other admin routes, require admin role
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin' || token?.role === 'super_admin';
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};