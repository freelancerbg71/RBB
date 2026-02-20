import type { CollectionEntry } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';

type BlogEntry = CollectionEntry<'blog'>;

function categoryToKey(category: string): string {
  const c = (category ?? '').trim().toLowerCase();
  if (c === 'slots') return 'slots';
  if (c === 'table games') return 'table-games';
  if (c === 'strategy' || c === 'insights') return 'strategy';
  if (c === 'crash games') return 'crash-games';
  if (c === 'live casino') return 'live-casino';
  if (c === 'reviews') return 'reviews';
  return 'default';
}

export function getDefaultHeroImageForPost(post: BlogEntry): string {
  if (post.data.heroImage) return post.data.heroImage;

  const generatedWebp = `/img/blog/generated/${post.data.urlSlug}-${post.data.locale}.webp`;
  const generatedWebpPath = path.join(
    process.cwd(),
    'public',
    'img',
    'blog',
    'generated',
    `${post.data.urlSlug}-${post.data.locale}.webp`,
  );
  if (fs.existsSync(generatedWebpPath)) return generatedWebp;

  // Backward-compatible fallback while old PNG assets are being phased out.
  const generatedPng = `/img/blog/generated/${post.data.urlSlug}-${post.data.locale}.png`;
  const generatedPngPath = path.join(
    process.cwd(),
    'public',
    'img',
    'blog',
    'generated',
    `${post.data.urlSlug}-${post.data.locale}.png`,
  );
  if (fs.existsSync(generatedPngPath)) return generatedPng;

  if (post.data.postType === 'insight') return '/img/blog/thumb-strategy.png';
  const key = categoryToKey(post.data.category);
  return `/img/blog/thumb-${key}.png`;
}

export function getDefaultHeroImage(category: string, postType: string | undefined): string {
  if (postType === 'insight') return '/img/blog/thumb-strategy.png';
  const key = categoryToKey(category);
  return `/img/blog/thumb-${key}.png`;
}
