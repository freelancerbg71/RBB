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

function splitRouteLocale(route) {
  const normalized = route.startsWith('/') ? route : `/${route}`;
  const match = /^\/(fr|de|ru)(\/.*|$)/.exec(normalized);
  if (!match) return { locale: 'en', rest: normalized };
  const rest = match[2] && match[2].length > 0 ? match[2] : '/';
  return { locale: match[1], rest };
}

function toLocaleRoute(route, locale) {
  const { rest } = splitRouteLocale(route);
  if (locale === 'en') return rest;
  if (rest === '/') return `/${locale}/`;
  return `/${locale}${rest}`;
}

function isExcludedForAlternateValidation(route, isNoindex) {
  return (
    isNoindex ||
    route.startsWith('/go/') ||
    route.startsWith('/fr/go/') ||
    route.startsWith('/de/go/') ||
    route.startsWith('/ru/go/') ||
    route.endsWith('/404/') ||
    route === '/404.html'
  );
}

function expectedAlternateLocales(route) {
  const { locale } = splitRouteLocale(route);
  if (locale === 'de') return ['en', 'de'];
  if (locale === 'ru') return ['en', 'ru'];
  // Keep EN/FR as the default pair for global and FR routes.
  return ['en', 'fr'];
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
  const isNoindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
  if (!isExcludedForAlternateValidation(route, isNoindex)) {
    for (const locale of expectedAlternateLocales(route)) {
      const companion = toLocaleRoute(route, locale);
      if (!routeExists(companion)) continue;

      const hasLocaleAlternate = alternates.some((item) => item.lang === locale);
      if (!hasLocaleAlternate) {
        failures.push(`${route} -> missing hreflang ${locale}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error('check-links: FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`check-links: OK (${htmlFiles.length} HTML files checked)`);
