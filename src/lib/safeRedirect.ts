/**
 * Post-login destinations must stay on this site.
 *
 * Prefix checks alone ("starts with / but not //") are bypassable: control
 * characters are stripped by the URL parser, so "/\t/evil.com" passes the
 * prefix checks and then resolves to //evil.com. Instead the value is
 * resolved against a fixed placeholder origin and accepted only if it still
 * points at that origin. The returned value is always a relative path.
 */
const PLACEHOLDER_ORIGIN = 'https://resumorph.invalid';

export function safeRedirectPath(
  value: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!value || !value.startsWith('/')) return fallback;
  // Reject any control character (0x00-0x1f, 0x7f) or backslash outright.
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f || code === 0x5c) return fallback;
  }

  let resolved: URL;
  try {
    resolved = new URL(value, PLACEHOLDER_ORIGIN);
  } catch {
    return fallback;
  }
  if (resolved.origin !== PLACEHOLDER_ORIGIN) return fallback;

  return resolved.pathname + resolved.search + resolved.hash;
}
