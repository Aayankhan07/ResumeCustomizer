import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

/**
 * Signed-out smoke tests. Nothing here needs a working Supabase project: the
 * landing page, legal pages and the anonymous redirect to /login all render
 * without a session.
 */

const PENDING_ROLE_KEY = 'resumorph:pending-role';
const SECTION_ANCHORS = ['#how-it-works', '#features', '#privacy', '#faq'];

/**
 * Console errors raised by the page itself. Failed network requests are
 * excluded: with placeholder Supabase credentials the browser client's
 * session calls fail by design, and that says nothing about the page.
 */
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource|net::ERR_|Failed to fetch/i.test(text)) return;
    errors.push(text);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

test.describe('landing page', () => {
  test('renders the hero heading without console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/');

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Tailor your resume to any job description');

    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('every section link in the navbar points at an existing section', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Sections' });

    for (const href of SECTION_ANCHORS) {
      await expect(nav.locator(`a[href="${href}"]`)).toHaveCount(1);
      await expect(page.locator(href)).toHaveCount(1);
    }
  });

  test('clicking a section link scrolls its target into view', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Sections' }).locator('a[href="#faq"]').click();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.locator('#faq')).toBeInViewport();
  });

  test('FAQ lists 10 questions that expand', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('#faq details');
    await expect(items).toHaveCount(10);

    const first = items.first();
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
  });

  test('hero form sends a signed-out visitor to /login and keeps the role', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hero-target-role').fill('Data Engineer');
    await page
      .locator('form')
      .filter({ has: page.locator('#hero-target-role') })
      .getByRole('button')
      .click();

    await page.waitForURL((url) => url.pathname === '/login');
    const redirect = new URL(page.url()).searchParams.get('redirect');
    expect(redirect).toMatch(/^\/transform(\?|$)/);

    const pending = await page.evaluate((key) => sessionStorage.getItem(key), PENDING_ROLE_KEY);
    expect(pending).toBe('Data Engineer');
  });
});

test.describe('protected routes', () => {
  test('anonymous /dashboard redirects to /login with the destination preserved', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.waitForURL((url) => url.pathname === '/login');
    expect(new URL(page.url()).searchParams.get('redirect')).toBe('/dashboard');
  });
});

test.describe('legal pages', () => {
  for (const [path, title] of [
    ['/privacy', 'Privacy Policy'],
    ['/terms', 'Terms of Service'],
  ] as const) {
    test(`${path} renders`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });
  }
});
