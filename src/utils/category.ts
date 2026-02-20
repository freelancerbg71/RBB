import { CATEGORY_NAMES } from '../config/affiliate';

const KNOWN_CATEGORY_SLUGS = new Set(Object.keys(CATEGORY_NAMES));

const CATEGORY_ALIASES: Record<string, string> = {
  'strategy-guides': 'strategy',
  'guides-de-strategie': 'strategy',
};

export function slugifyCategory(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function toKnownCategorySlug(input: string): string {
  const base = slugifyCategory(input);
  const resolved = CATEGORY_ALIASES[base] ?? base;
  return KNOWN_CATEGORY_SLUGS.has(resolved) ? resolved : '';
}
