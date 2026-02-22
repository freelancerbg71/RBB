import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const REQUIRED_PARITY_LOCALES = ['de', 'ru'];
const issues = [];

function parseFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
  if (!match) return { frontmatter: {}, body: content };
  const raw = match[1];
  const body = content.slice(match[0].length);
  const frontmatter = {};

  for (const line of raw.split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+)\s*:\s*(.+)$/.exec(line.trim());
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim();
    if (value === 'true' || value === 'false') {
      frontmatter[key] = value === 'true';
      continue;
    }
    frontmatter[key] = value.replace(/^["']|["']$/g, '');
  }

  return { frontmatter, body };
}

function normalizeComparable(input) {
  return (input || '')
    .toLowerCase()
    .replace(/[`'"“”‘’.,:;!?()[\]{}<>/\\|_*+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function germanSignalCount(text) {
  const lower = ` ${text.toLowerCase()} `;
  const phrases = [
    ' und ',
    ' der ',
    ' die ',
    ' das ',
    ' nicht ',
    ' fuer ',
    ' mit ',
    ' auf ',
    ' ist ',
    ' eine ',
    ' einem ',
    ' gluecksspiel ',
    ' hausvorteil ',
    ' spieler ',
    ' einsatz ',
  ];
  return phrases.reduce((sum, token) => sum + (lower.includes(token) ? 1 : 0), 0);
}

function englishSignalCount(text) {
  return countMatches(
    text.toLowerCase(),
    /\b(the|and|you|your|with|this|that|for|from|bet|game|casino|odds|player|house)\b/g,
  );
}

const byLocale = new Map();
const allEntries = [];

for (const fileName of fs.readdirSync(BLOG_DIR)) {
  if (!fileName.endsWith('.md') && !fileName.endsWith('.mdx')) continue;
  const filePath = path.join(BLOG_DIR, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(content);
  const locale = (frontmatter.locale || 'en').toLowerCase();
  const urlSlug = (frontmatter.urlSlug || '').trim();

  if (!urlSlug) {
    issues.push(`${fileName}: missing urlSlug frontmatter`);
    continue;
  }

  if (!byLocale.has(locale)) byLocale.set(locale, new Map());
  const localeMap = byLocale.get(locale);
  if (localeMap.has(urlSlug)) {
    issues.push(`${fileName}: duplicate localized slug "${urlSlug}" for locale "${locale}"`);
    continue;
  }

  const entry = {
    fileName,
    locale,
    urlSlug,
    title: String(frontmatter.title || ''),
    description: String(frontmatter.description || ''),
    translationReviewed: frontmatter.translationReviewed === true,
    body,
  };
  localeMap.set(urlSlug, entry);
  allEntries.push(entry);
}

const enMap = byLocale.get('en') || new Map();

// Gate 1: ensure EN slugs have locale counterparts for parity locales.
for (const slug of enMap.keys()) {
  for (const locale of REQUIRED_PARITY_LOCALES) {
    const localeMap = byLocale.get(locale) || new Map();
    if (!localeMap.has(slug)) {
      issues.push(`missing ${locale} counterpart for en slug "${slug}"`);
    }
  }
}

// Gate 2: reviewed DE/RU translations must clearly differ from EN and contain locale signals.
for (const entry of allEntries) {
  if (!REQUIRED_PARITY_LOCALES.includes(entry.locale)) continue;
  if (!entry.translationReviewed) continue;

  const enEntry = enMap.get(entry.urlSlug);
  if (!enEntry) {
    issues.push(`${entry.fileName}: marked reviewed but no EN source for slug "${entry.urlSlug}"`);
    continue;
  }

  if (normalizeComparable(entry.title) === normalizeComparable(enEntry.title)) {
    issues.push(`${entry.fileName}: reviewed translation title matches EN title`);
  }

  if (normalizeComparable(entry.description) === normalizeComparable(enEntry.description)) {
    issues.push(`${entry.fileName}: reviewed translation description matches EN description`);
  }

  const cyrillicChars = countMatches(entry.body, /[\u0400-\u04FF]/g);
  const deSignals = germanSignalCount(entry.body);
  const enSignals = englishSignalCount(entry.body);

  if (entry.locale === 'ru') {
    if (cyrillicChars < 120) {
      issues.push(`${entry.fileName}: reviewed RU translation has too little Cyrillic content`);
    }
    if (enSignals > 140 && cyrillicChars < 250) {
      issues.push(`${entry.fileName}: reviewed RU translation appears English-dominant`);
    }
  }

  if (entry.locale === 'de') {
    if (deSignals < 6) {
      issues.push(`${entry.fileName}: reviewed DE translation lacks German language signals`);
    }
    if (enSignals > deSignals * 8 && enSignals > 140) {
      issues.push(`${entry.fileName}: reviewed DE translation appears English-dominant`);
    }
  }
}

if (issues.length > 0) {
  console.log('content-translation-gate: FAILED');
  for (const issue of [...new Set(issues)].sort((a, b) => a.localeCompare(b))) {
    console.log(`- ${issue}`);
  }
  process.exit(1);
}

const reviewedCount = allEntries.filter(
  (entry) => REQUIRED_PARITY_LOCALES.includes(entry.locale) && entry.translationReviewed,
).length;
console.log(
  `content-translation-gate: OK (reviewed localized posts: ${reviewedCount}, required locales: ${REQUIRED_PARITY_LOCALES.join(', ')})`,
);
