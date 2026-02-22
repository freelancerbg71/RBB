import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const metadataRoutes = [
  { route: '/', locales: ['en', 'fr'], ogLocale: 'en_US' },
  { route: '/blog', locales: ['en', 'fr'], ogLocale: 'en_US' },
  { route: '/fr/', locales: ['en', 'fr'], ogLocale: 'fr_FR' },
  { route: '/fr/blog', locales: ['en', 'fr'], ogLocale: 'fr_FR' },
  { route: '/de/', locales: ['en', 'de'], ogLocale: 'de_DE' },
  { route: '/de/blog', locales: ['en', 'de'], ogLocale: 'de_DE' },
  { route: '/ru/', locales: ['en', 'ru'], ogLocale: 'ru_RU' },
  { route: '/ru/blog', locales: ['en', 'ru'], ogLocale: 'ru_RU' },
];
const a11yRoutes = [
  '/',
  '/blog',
  '/tools/fee-impact',
  '/fr/',
  '/fr/blog',
  '/fr/tools/impact-frais',
  '/de/',
  '/de/blog',
  '/de/tools/impact-frais',
  '/ru/',
  '/ru/blog',
  '/ru/tools/impact-frais',
];
const securityHeaderRoutes = ['/', '/blog', '/fr/', '/de/', '/ru/', '/go/privateclub'];

for (const { route, locales, ogLocale } of metadataRoutes) {
  test(`metadata is present: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });

    const canonical = page.locator('link[rel="canonical"]');
    const alternateDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    const ogLocaleTag = page.locator('meta[property="og:locale"]');

    await expect(canonical).toHaveCount(1);
    await expect(alternateDefault).toHaveCount(1);
    await expect(ogLocaleTag).toHaveAttribute('content', ogLocale);

    for (const locale of locales) {
      const localeAlternate = page.locator(`link[rel="alternate"][hreflang="${locale}"]`);
      await expect(localeAlternate).toHaveCount(1);
    }

    const canonicalHref = await canonical.getAttribute('href');
    expect(canonicalHref?.startsWith('https://readbetweenbets.com/')).toBeTruthy();
  });
}

test('outbound route is noindex', async ({ page }) => {
  await page.goto('/go/privateclub', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
});

for (const route of securityHeaderRoutes) {
  test(`security headers present: ${route}`, async ({ request }) => {
    const response = await request.get(route);
    expect(response.status(), `Expected successful response for ${route}`).toBeLessThan(400);
    const headers = response.headers();

    const csp = headers['content-security-policy'];
    expect(csp, `CSP missing for ${route}`).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("'unsafe-inline'");

    expect(headers['strict-transport-security']).toBeTruthy();
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toBeTruthy();
  });
}

for (const route of a11yRoutes) {
  test(`axe has no serious violations: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page }).analyze();
    const impactful = results.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact ?? ''),
    );
    expect(impactful, JSON.stringify(impactful, null, 2)).toEqual([]);
  });
}
