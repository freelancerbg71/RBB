import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Minimal internal scraper for outlines (titles/headings/links). Do not publish
// scraped text verbatim; we only use this to inform original writing.

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function slugFromUrl(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? 'mrq';
  } catch {
    return 'mrq';
  }
}

test('scrape one MRQ guide outline', async ({ page }) => {
  const categoryUrl = 'https://mrq.com/blog/category/guides';
  const url = process.env.MRQ_URL?.trim() || categoryUrl;

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // If we were given the category page, pick the first guide link.
  let targetUrl = url;
  if (new URL(url).pathname.includes('/blog/category/')) {
    const links = await page.evaluate(() => {
      const normalize = (href: string) => href.split('#')[0].replace(/\/+$/, '');
      const out: string[] = [];

      // Prefer cards explicitly tagged as Guides.
      const guideCategoryLinks = Array.from(document.querySelectorAll('a[href*="/blog/category/guides"]'));
      for (const catLink of guideCategoryLinks) {
        let el: Element | null = catLink;
        for (let i = 0; i < 6 && el; i++) el = el.parentElement;
        const container = el ?? catLink.closest('article') ?? catLink.closest('li') ?? catLink.closest('div') ?? catLink.parentElement;
        if (!container) continue;
        const postLink = container.querySelector('a[href*="/blog/"]:not([href*="/blog/category/"])') as HTMLAnchorElement | null;
        if (!postLink?.href) continue;
        const href = normalize(postLink.href);
        if (href.includes('/blog/all')) continue;
        out.push(href);
      }

      return Array.from(new Set(out)).sort();
    });
    expect(links.length).toBeGreaterThan(0);
    targetUrl = links[0]!;
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  }

  const title = (await page.title()).trim();

  // Attempt to locate an <article> and pull headings + outbound links.
  const outline = await page.evaluate(() => {
    const article = document.querySelector('article') ?? document.querySelector('main') ?? document.body;
    const h = Array.from(article.querySelectorAll('h1,h2,h3'))
      .map((el) => ({ tag: el.tagName.toLowerCase(), text: (el.textContent ?? '').trim() }))
      .filter((x) => x.text.length > 0);

    const links = Array.from(article.querySelectorAll('a[href]'))
      .map((a) => (a as HTMLAnchorElement).href)
      .filter((href) => href.startsWith('http'))
      .slice(0, 50);

    return { headings: h, links };
  });

  const outDir = path.join(process.cwd(), 'tmp', 'mrq');
  ensureDir(outDir);

  const slug = slugFromUrl(targetUrl);
  const outPath = path.join(outDir, `${slug}.json`);

  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        scrapedAt: new Date().toISOString(),
        sourceUrl: targetUrl,
        pageTitle: title,
        outline,
      },
      null,
      2
    ),
    'utf8'
  );
});
