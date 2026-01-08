import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createServerClient } from '@supabase/ssr';

// Lazy initialization - only validate when actually used (not at build time)
function getSecretKey(): Uint8Array {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Partner portal routes and API routes - Supabase auth
  if ((pathname.startsWith('/partner') || pathname.startsWith('/api/partner')) && pathname !== '/partner/login') {
    let response = NextResponse.next({ request });
    const isApiRoute = pathname.startsWith('/api/partner');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // For API routes, return JSON 401 instead of redirect
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Neautorizovaný prístup' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/partner/login', request.url));
    }

    return response;
  }

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      // Allow access to login page
      return NextResponse.next();
    }

    const session = request.cookies.get('session')?.value;
    const isApiRoute = pathname.startsWith('/api/admin');

    if (!session) {
      // For API routes, return JSON 401 instead of redirect
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      // For pages, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify session
      await jwtVerify(session, getSecretKey());
      return NextResponse.next();
    } catch (error) {
      console.error('Session verification failed in middleware:', error);
      // For API routes, return JSON 401 instead of redirect
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      // For pages, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/partner/:path*',
    '/api/partner/:path*',
  ],
};
