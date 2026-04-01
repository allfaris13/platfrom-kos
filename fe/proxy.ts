import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get user from cookie or header
    const userCookie = request.cookies.get('user')?.value;
    
    if (!userCookie) {
      // No user data, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decodedUser = decodeURIComponent(userCookie);
      const user = JSON.parse(decodedUser);
      
      // Check if user has admin role
      if (user.role !== 'admin') {
        // Not an admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      console.error("Middleware Auth Error:", e);
      // Invalid user data, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/admin/:path*',
};
