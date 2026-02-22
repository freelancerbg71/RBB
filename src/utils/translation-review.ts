import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../config/affiliate';

const REVIEW_REQUIRED_LOCALES = new Set<Locale>(['de', 'ru']);

type BlogData = CollectionEntry<'blog'>['data'];

export function isTranslationApproved(data: Pick<BlogData, 'locale' | 'translationReviewed'>): boolean {
  const locale = data.locale ?? 'en';
  if (!REVIEW_REQUIRED_LOCALES.has(locale)) return true;
  return data.translationReviewed === true;
}

export function requiresManualTranslationReview(locale: Locale): boolean {
  return REVIEW_REQUIRED_LOCALES.has(locale);
}
