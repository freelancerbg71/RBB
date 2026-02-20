import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import React from 'react';
import sharp from 'sharp';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'blog');
const OUTPUT_DIR = path.join(ROOT, 'public', 'img', 'blog', 'generated');
const WIDTH = 1200;
const HEIGHT = 630;

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
      args[key] = value;
      if (value !== 'true') i += 1;
    }
  }
  return args;
}

function pickTheme(category = '') {
  const normalized = String(category).toLowerCase();
  if (normalized.includes('slot')) {
    return { start: '#7f1d1d', end: '#be123c', accent: '#fb7185', label: 'Slots' };
  }
  if (normalized.includes('crash')) {
    return { start: '#0f172a', end: '#1d4ed8', accent: '#22d3ee', label: 'Crash Games' };
  }
  if (normalized.includes('live')) {
    return { start: '#083344', end: '#115e59', accent: '#2dd4bf', label: 'Live Casino' };
  }
  if (normalized.includes('table')) {
    return { start: '#1f2937', end: '#14532d', accent: '#4ade80', label: 'Table Games' };
  }
  if (normalized.includes('strategy')) {
    return { start: '#3b0764', end: '#831843', accent: '#f472b6', label: 'Strategy' };
  }
  if (normalized.includes('news')) {
    return { start: '#172554', end: '#581c87', accent: '#a78bfa', label: 'News' };
  }
  return { start: '#111827', end: '#3f3f46', accent: '#f59e0b', label: 'Guide' };
}

function loadFont() {
  const candidates = [
    process.env.OG_FONT_PATH,
    'C:\\Windows\\Fonts\\segoeui.ttf',
    'C:\\Windows\\Fonts\\arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate);
    }
  }
  throw new Error('Could not find a usable font. Set OG_FONT_PATH to a .ttf file.');
}

function formatDate(dateValue, locale) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed);
}

function collectPostFiles() {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(CONTENT_DIR, name));
}

function findPost({ slug, locale }) {
  const files = collectPostFiles();
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data } = matter(raw);
    const postLocale = data?.locale ?? 'en';
    if (data?.urlSlug === slug && postLocale === locale) {
      return { file, data };
    }
  }
  return null;
}

function buildTree({ post, theme, locale }) {
  const title = String(post.title || '');
  const category = String(post.category || theme.label);
  const dateText = formatDate(post.pubDate, locale);

  return React.createElement(
    'div',
    {
      style: {
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'SegoeUI',
        color: '#ffffff',
        background: `linear-gradient(145deg, ${theme.start} 0%, ${theme.end} 100%)`,
      },
    },
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: '-120px',
        right: '-100px',
        width: '460px',
        height: '460px',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.13)',
      },
    }),
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: '-190px',
        left: '-120px',
        width: '520px',
        height: '520px',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.08)',
      },
    }),
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '56px',
        },
      },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end' } },
        React.createElement(
          'div',
          {
            style: {
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '999px',
              padding: '8px 14px',
              fontSize: '22px',
              opacity: 0.95,
            },
          },
          category,
        ),
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '980px' } },
        React.createElement(
          'h1',
          {
            style: {
              margin: 0,
              fontSize: title.length > 88 ? '54px' : title.length > 62 ? '60px' : '68px',
              lineHeight: 1.06,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textWrap: 'balance',
            },
          },
          title,
        ),
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '24px',
            color: 'rgba(255,255,255,0.85)',
          },
        },
        React.createElement('span', null, dateText || (locale === 'fr' ? 'Date non definie' : 'Date not set')),
        React.createElement('span', { style: { color: theme.accent, fontWeight: 700 } }, 'readbetweenbets.com'),
      ),
    ),
  );
}

async function run() {
  const args = parseArgs(process.argv);
  const slug = args.slug;
  const locale = args.locale || 'en';
  if (!slug) {
    console.error('Usage: node scripts/generate-og-image.mjs --slug <urlSlug> [--locale en|fr]');
    process.exit(1);
  }

  const postResult = findPost({ slug, locale });
  if (!postResult) {
    console.error(`Could not find post with urlSlug="${slug}" and locale="${locale}".`);
    process.exit(1);
  }

  const { data } = postResult;
  const theme = pickTheme(data.category || data.postType);
  const fontData = loadFont();
  const tree = buildTree({ post: data, theme, locale });

  const svg = await satori(tree, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'SegoeUI',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'SegoeUI',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, `${slug}-${locale}.webp`);

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  });
  const pngData = resvg.render();
  const webpBuffer = await sharp(pngData.asPng()).webp({ quality: 82 }).toBuffer();
  fs.writeFileSync(outputPath, webpBuffer);

  console.log(`Generated image: ${path.relative(ROOT, outputPath)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
