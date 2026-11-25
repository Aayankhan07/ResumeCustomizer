import { describe, it, expect } from 'vitest';
import { safeRedirectPath } from '@/lib/safeRedirect';

describe('safeRedirectPath', () => {
  it.each([
    ['/dashboard', '/dashboard'],
    ['/transform?role=Data%20Analyst', '/transform?role=Data%20Analyst'],
    ['/transform/abc#tracking', '/transform/abc#tracking'],
  ])('keeps same-site path %s', (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    '',
    'dashboard',
    'https://evil.com',
    '//evil.com',
    '/\\evil.com',
    '/\t/evil.com',
    '/\n/evil.com',
    '/%09/evil.com'.replace('%09', '\t'),
    'javascript:alert(1)',
  ])('falls back for %j', (input) => {
    expect(safeRedirectPath(input)).toBe('/dashboard');
  });

  it('uses a custom fallback', () => {
    expect(safeRedirectPath('//evil.com', '/')).toBe('/');
  });
});
