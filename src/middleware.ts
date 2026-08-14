import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session token.
  //
  // This runs on nearly every route (see matcher below), so an unguarded
  // throw here takes down the whole site — landing page included — whenever
  // Supabase has a blip. Treat any failure as "not signed in" and let the
  // gating below decide: protected routes still redirect to /login, public
  // routes still render.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Middleware auth check failed:', error.message);
    } else {
      user = data.user;
    }
  } catch (err) {
    console.error('Middleware auth check threw:', err);
  }

  // Route auth gating
  const protectedPaths = ['/dashboard', '/transform', '/profile'];
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p));
  
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const authPaths = ['/login', '/signup'];
  const isAuthPage = authPaths.some(p => request.nextUrl.pathname.startsWith(p));
  
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
