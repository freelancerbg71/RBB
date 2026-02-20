import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/blog',
  '/blog/news',
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
];

for (const route of routes) {
  test(`route is healthy: ${route}`, async ({ request }) => {
    const response = await request.get(route);
    expect(response.status(), `Expected successful response for ${route}`).toBeLessThan(400);
    const html = await response.text();
    expect(html).toContain('Read Between Bets');
  });
}
