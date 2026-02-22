import { test, expect } from '@playwright/test';

function normalizePath(path: string): string {
  if (path === '/') return '/';
  return path.replace(/\/+$/, '');
}

const routes = [
  '/',
  '/blog',
  '/blog/insights',
  '/blog/crypto-buzzwords-in-casino-marketing',
  '/about',
  '/contact',
  '/go/privateclub',
  '/go/barbossabet',
  '/fr/',
  '/fr/blog',
  '/fr/about',
  '/fr/contact',
  '/fr/go/privateclub',
  '/fr/go/barbossabet',
  '/de/',
  '/de/blog',
  '/de/about',
  '/de/contact',
  '/de/go/privateclub',
  '/de/go/barbossabet',
  '/ru/',
  '/ru/blog',
  '/ru/about',
  '/ru/contact',
  '/ru/go/privateclub',
  '/ru/go/barbossabet',
];

for (const route of routes) {
  test(`route is healthy: ${route}`, async ({ request }) => {
    const response = await request.get(route);
    expect(response.status(), `Expected successful response for ${route}`).toBeLessThan(400);
    const html = await response.text();
    expect(html).toContain('Read Between Bets');
  });
}

const legacyRedirects = [
  { from: '/blog/aviator-guide', to: '/blog/how-to-play-aviator' },
  { from: '/fr/blog/aviator-guide', to: '/fr/blog/how-to-play-aviator' },
  { from: '/de/blog/aviator-guide', to: '/de/blog/how-to-play-aviator' },
  { from: '/ru/blog/aviator-guide', to: '/ru/blog/how-to-play-aviator' },
];

for (const { from, to } of legacyRedirects) {
  test(`legacy redirect is HTTP 308: ${from} -> ${to}`, async ({ request }) => {
    const fromResponse = await request.get(from, { maxRedirects: 0 });
    expect(fromResponse.status(), `Expected permanent redirect for ${from}`).toBe(308);
    const location = fromResponse.headers().location ?? '';
    const locationPath = new URL(location, 'http://127.0.0.1:4321').pathname;
    expect(normalizePath(locationPath)).toBe(normalizePath(to));

    const toResponse = await request.get(to);
    expect(toResponse.status(), `Expected successful response for ${to}`).toBeLessThan(400);
  });
}
