import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const SITE_ORIGIN = 'https://readbetweenbets.com';
const failures = [];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(fullPath));
    if (entry.isFile() && fullPath.endsWith('.html')) out.push(fullPath);
  }
  return out;
}

function toRoute(filePath) {
  const rel = path.relative(DIST_DIR, filePath).replaceAll(path.sep, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}/`;
  return `/${rel}`;
}

function routeExists(routePath) {
  const clean = routePath.split('#')[0].split('?')[0];
  const normalized = clean.startsWith('/') ? clean.slice(1) : clean;
  const trim = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  const candidates = [
    path.join(DIST_DIR, normalized),
    path.join(DIST_DIR, normalized, 'index.html'),
    path.join(DIST_DIR, `${normalized}.html`),
    path.join(DIST_DIR, trim, 'index.html'),
    path.join(DIST_DIR, `${trim}.html`),
  ];
  if (clean === '/' || normalized === '') {
    candidates.push(path.join(DIST_DIR, 'index.html'));
  }
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function extractAttributes(html, tag, attrName) {
  const regex = new RegExp(`<${tag}\\b[^>]*\\b${attrName}=["']([^"']+)["'][^>]*>`, 'gi');
  const values = [];
  let match = regex.exec(html);
  while (match) {
    values.push(match[1]);
    match = regex.exec(html);
  }
  return values;
}

function extractAlternates(html) {
  const regex = /<link\b[^>]*rel=["']alternate["'][^>]*>/gi;
  const items = [];
  let match = regex.exec(html);
  while (match) {
    const tag = match[0];
    const hrefMatch = /\bhref=["']([^"']+)["']/i.exec(tag);
    const langMatch = /\bhreflang=["']([^"']+)["']/i.exec(tag);
    if (hrefMatch && langMatch) items.push({ href: hrefMatch[1], lang: langMatch[1] });
    match = regex.exec(html);
  }
  return items;
}

function normalizeHref(href) {
  if (href.startsWith(SITE_ORIGIN)) {
    return href.slice(SITE_ORIGIN.length) || '/';
  }
  return href;
}

function toCompanionRoute(route) {
  if (route === '/fr/' || route === '/fr') return '/';
  if (route.startsWith('/fr/')) return `/${route.slice('/fr/'.length)}`;
  if (route === '/') return '/fr/';
  return `/fr${route.endsWith('/') ? route : `${route}/`}`;
}

if (!fs.existsSync(DIST_DIR)) {
  console.error(`check-links: dist folder not found at ${DIST_DIR}`);
  process.exit(1);
}

const htmlFiles = walk(DIST_DIR);
for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, 'utf8');
  const route = toRoute(filePath);

  const hrefs = [
    ...extractAttributes(html, 'a', 'href'),
    ...extractAttributes(html, 'link', 'href'),
  ];

  for (const rawHref of hrefs) {
    const href = normalizeHref(rawHref);
    if (
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('#') ||
      href.startsWith('javascript:')
    ) {
      continue;
    }
    if (!href.startsWith('/')) continue;
    if (!routeExists(href)) failures.push(`${route} -> missing route: ${href}`);
  }

  const alternates = extractAlternates(html);
  const expectedCompanion = toCompanionRoute(route);
  const isNoindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
  if (
    routeExists(expectedCompanion) &&
    !route.startsWith('/go/') &&
    !route.startsWith('/fr/go/') &&
    !route.endsWith('/404/') &&
    route !== '/404.html' &&
    !isNoindex
  ) {
    const hasEn = alternates.some((item) => item.lang === 'en');
    const hasFr = alternates.some((item) => item.lang === 'fr');
    if (!hasEn || !hasFr) {
      failures.push(`${route} -> missing hreflang pair (en/fr)`);
    }
  }
}

if (failures.length > 0) {
  console.error('check-links: FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`check-links: OK (${htmlFiles.length} HTML files checked)`);
