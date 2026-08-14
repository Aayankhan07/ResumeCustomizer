import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Only same-origin relative paths are allowed as a post-login destination.
 * Rejects protocol-relative values like "//evil.com" and "/\evil.com", which
 * browsers resolve to a different host once concatenated onto the origin.
 */
function safeNext(value: string | null): string {
  if (!value) return '/dashboard';
  if (!value.startsWith('/')) return '/dashboard';
  if (value.startsWith('//') || value.startsWith('/\\')) return '/dashboard';
  return value;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  // Supabase redirects here with error params when the user denies consent
  // or the provider rejects the request. Previously ignored, which sent the
  // user to /dashboard as though login had succeeded.
  const providerError = searchParams.get('error');
  const providerErrorDescription = searchParams.get('error_description');
  if (providerError) {
    console.error('OAuth provider error:', providerError, providerErrorDescription);
    return NextResponse.redirect(`${origin}/login?error=oauth_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // Expired or replayed codes used to fall through to /dashboard, where
    // middleware bounced the user back to /login with no explanation.
    if (error) {
      console.error('OAuth code exchange failed:', error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  } catch (err) {
    console.error('OAuth callback threw:', err);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
