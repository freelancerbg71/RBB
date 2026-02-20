import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

test('list MRQ guide article URLs', async ({ page }) => {
  // MRQ's category pages can be heavily client-rendered. The /blog/all page
  // consistently exposes post cards with category links we can filter on.
  const categoryUrl = 'https://mrq.com/blog/all';
  await page.goto(categoryUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Collect blog post URLs that are explicitly tagged as Guides on the category page.
  // We avoid scraping article body text here; this is just a URL inventory.
  const urls = await page.evaluate(() => {
    const normalize = (href: string) => href.split('#')[0].replace(/\/+$/, '');

    const out = new Set<string>();

    // Find post cards that contain a category link to /blog/category/guides, then
    // grab the post link within the same card/container.
    const guideCategoryLinks = Array.from(document.querySelectorAll('a[href*="/blog/category/guides"]'));
    for (const catLink of guideCategoryLinks) {
      const container =
        catLink.closest('article') ??
        catLink.closest('li') ??
        catLink.closest('[class*="card"]') ??
        catLink.closest('div') ??
        catLink.parentElement;
      if (!container) continue;

      const postLink = container.querySelector('a[href^="https://mrq.com/blog/"]:not([href*="/blog/category/"]):not([href*="/blog/all"])') as HTMLAnchorElement | null;
      if (!postLink?.href) continue;
      out.add(normalize(postLink.href));
    }

    return Array.from(out.values()).sort();
  });

  expect(urls.length).toBeGreaterThan(0);

  const outDir = path.join(process.cwd(), 'tmp', 'mrq');
  ensureDir(outDir);
  const outPath = path.join(outDir, 'guides.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        scrapedAt: new Date().toISOString(),
        sourceUrl: categoryUrl,
        count: urls.length,
        urls,
      },
      null,
      2
    ),
    'utf8'
  );
});
