import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getClientEnv } from './lib/env';
import { safeRedirectPath } from './lib/safeRedirect';

const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey } =
  getClientEnv();

// Next 16 renamed the `middleware` file convention to `proxy` (same API, and
// the exported function is now `proxy`).
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
  });

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
      console.error('Proxy auth check failed:', error.message);
    } else {
      user = data.user;
    }
  } catch (err) {
    console.error('Proxy auth check threw:', err);
  }

  // Route auth gating
  const protectedPaths = ['/dashboard', '/transform', '/profile'];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !user) {
    // Preserve the destination (including its query, e.g. ?role= from the
    // landing hero) so login can send the user back. The login page only
    // honours same-origin relative paths.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const authPaths = ['/login', '/signup'];
  const isAuthPage = authPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isAuthPage && user) {
    // Honour a pending ?redirect= so an already-signed-in user still lands
    // where they were headed. Same-origin relative paths only.
    const redirect = request.nextUrl.searchParams.get('redirect');
    const safe = safeRedirectPath(redirect);
    return NextResponse.redirect(new URL(safe, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
