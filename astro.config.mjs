import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://readbetweenbets.com',
  integrations: [react(), sitemap({
    // Language-only hreflang. We are not targeting jurisdictions.
    i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr', de: 'de', ru: 'ru' } },
    // Astro sitemap `page` values may be emitted with or without a leading slash.
    // Normalize so exclusions are reliable.
    filter: (page) => {
      const p0 = page.startsWith('http') ? new URL(page).pathname : page;
      const p = p0.startsWith('/') ? p0 : `/${p0}`;
      return !p.includes('/404') && !p.startsWith('/go/') && !p.startsWith('/fr/go/');
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