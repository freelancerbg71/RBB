import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const canonicalAndHreflangRoutes = ['/', '/blog', '/fr/', '/fr/blog'];
const a11yRoutes = ['/', '/blog', '/tools/fee-impact', '/fr/', '/fr/blog', '/fr/tools/impact-frais'];

for (const route of canonicalAndHreflangRoutes) {
  test(`metadata is present: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });

    const canonical = page.locator('link[rel="canonical"]');
    const alternateEn = page.locator('link[rel="alternate"][hreflang="en"]');
    const alternateFr = page.locator('link[rel="alternate"][hreflang="fr"]');
    const alternateDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');

    await expect(canonical).toHaveCount(1);
    await expect(alternateEn).toHaveCount(1);
    await expect(alternateFr).toHaveCount(1);
    await expect(alternateDefault).toHaveCount(1);

    const canonicalHref = await canonical.getAttribute('href');
    expect(canonicalHref?.startsWith('https://readbetweenbets.com/')).toBeTruthy();
  });
}

test('outbound route is noindex', async ({ page }) => {
  await page.goto('/go/privateclub', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
});

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
