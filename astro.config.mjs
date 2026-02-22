import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

import mdx from '@astrojs/mdx';

const LEGACY_REDIRECT_PATHS = new Set([
  '/blog/aviator-guide/',
  '/blog/baccarat-strategies/',
  '/blog/bingo-basics/',
  '/blog/blackjack-charts/',
  '/blog/mega-ball-strategy-guide/',
  '/blog/monopoly-live-strategy-guide/',
  '/de/blog/aviator-guide/',
  '/de/blog/baccarat-strategies/',
  '/de/blog/bingo-basics/',
  '/fr/blog/aviator-guide/',
  '/fr/blog/baccarat-strategies/',
  '/fr/blog/bingo-basics/',
  '/ru/blog/aviator-guide/',
  '/ru/blog/baccarat-strategies/',
  '/ru/blog/bingo-basics/',
]);

function normalizePathname(page) {
  const p0 = page.startsWith('http') ? new URL(page).pathname : page;
  const withSlash = p0.startsWith('/') ? p0 : `/${p0}`;
  if (withSlash === '/') return withSlash;
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://readbetweenbets.com',
  integrations: [react(), sitemap({
    // Language-only hreflang. We are not targeting jurisdictions.
    i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr', de: 'de', ru: 'ru' } },
    // Astro sitemap `page` values may be emitted with or without a leading slash.
    // Normalize so exclusions are reliable.
    filter: (page) => {
      const p = normalizePathname(page);
      const isGoPage = p.startsWith('/go/') || /^\/(?:fr|de|ru)\/go\//.test(p);
      return !p.includes('/404') && !isGoPage && !LEGACY_REDIRECT_PATHS.has(p);
    },
  }), tailwind(), mdx()],
  output: 'static',
  build: {
    format: 'directory',
  },
  // On Windows/mapped drives, Vite can sometimes see the same file via multiple
  // equivalent paths and emit "glob-loader Duplicate id" warnings. Resolving
  // to real paths helps dedupe.
  vite: {
    resolve: {
      preserveSymlinks: false,
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4321,
  },
});
