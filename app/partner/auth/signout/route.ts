import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

async function handleSignOut(request: Request) {
  const cookieStore = await cookies();
  const headersList = await headers();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors
          }
        },
      },
    }
  );

  await supabase.auth.signOut();

  // Get the correct origin - use host header or fallback to request URL
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const origin = host ? `${protocol}://${host}` : new URL(request.url).origin;

  // Presmerovanie na login stránku
  // Use 303 status to force GET request after POST (prevents HTTP 405)
  return NextResponse.redirect(new URL('/partner/login', origin), { status: 303 });
}

// Support both POST and GET for signout
export async function POST(request: Request) {
  return handleSignOut(request);
}

export async function GET(request: Request) {
  return handleSignOut(request);
}
