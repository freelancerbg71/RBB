import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    // Canonical URL slug (language-only). Keep stable across translations.
    urlSlug: z.string(),
    // High-level section used for blog tabs (mirrors common operator blog UX).
    // Keep this language-neutral. Do not create jurisdiction-targeted sections.
    postType: z.enum(['guide', 'insight']).default('guide'),
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    author: z.string().default('Read Between Bets Team'),
    // Optional one-line summary shown in the TL;DR box.
    tldr: z.string().optional(),
    // Optional short bullets rendered near the affiliate module to improve scanability.
    // Keep factual and neutral. No promises, no jurisdiction targeting.
    takeaways: z.array(z.string()).default([]),
    // Optional reference list to support factual claims and math values.
    sources: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
    })).default([]),
    affiliateLink: z.string().optional(),
    gameProvider: z.string().optional(),
    rtp: z.string().optional(),
    locale: z.enum(['en', 'fr', 'de', 'ru']).default('en'),
    // Manual QA flag for locales that require explicit translation review.
    translationReviewed: z.boolean().optional(),
  }),
});

export const collections = { blog };
