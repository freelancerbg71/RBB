import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const APPLY = process.argv.includes('--apply');

const DISCLAIMER_PATTERNS = [
  /informational only/i,
  /for educational purposes only/i,
  /contenu est uniquement informatif/i,
  /nur zu informationszwecken/i,
  /tolko dlya informatsionnykh tselei/i,
];

const LOCALE_DISCLAIMER = {
  en: 'This article is for informational purposes only.',
  fr: 'Ce contenu est uniquement informatif.',
  de: 'Dieser Inhalt dient nur Informationszwecken.',
  ru: 'Tolko dlya informatsionnykh tselei.',
};

function parseFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
  if (!match) return { rawFrontmatter: '', body: content, start: -1, end: -1 };
  return {
    rawFrontmatter: match[1],
    body: content.slice(match[0].length),
    start: 0,
    end: match[0].length,
  };
}

function getLocale(rawFrontmatter) {
  const m = /^locale\s*:\s*['\"]?([a-z]{2})['\"]?\s*$/m.exec(rawFrontmatter);
  return (m?.[1] || 'en').toLowerCase();
}

function normalizeDescriptionLine(line) {
  const m = /^description\s*:\s*(.+)$/.exec(line);
  if (!m) return { changed: false, line };
  const raw = m[1].trim();
  const unquoted = raw.replace(/^['\"]|['\"]$/g, '');
  if (unquoted.length <= 155) return { changed: false, line };

  const truncated = `${unquoted.slice(0, 152).trimEnd()}...`;
  const needsQuotes = /[:#\[\]{}]/.test(truncated);
  const value = needsQuotes ? `"${truncated}"` : truncated;
  return { changed: true, line: `description: ${value}` };
}

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
let changedCount = 0;
let touchedFiles = 0;

for (const fileName of files) {
  const filePath = path.join(BLOG_DIR, fileName);
  const original = fs.readFileSync(filePath, 'utf8');
  const { rawFrontmatter, body, end } = parseFrontmatter(original);
  if (end < 0) continue;

  let nextFrontmatter = rawFrontmatter;
  let nextBody = body;
  let fileChanged = false;

  const updatedFrontmatter = nextFrontmatter
    .split(/\r?\n/)
    .map((line) => {
      const out = normalizeDescriptionLine(line);
      if (out.changed) fileChanged = true;
      return out.line;
    })
    .join('\n');
  nextFrontmatter = updatedFrontmatter;

  const hasDisclaimer = DISCLAIMER_PATTERNS.some((p) => p.test(nextBody));
  if (!hasDisclaimer) {
    const locale = getLocale(nextFrontmatter);
    const phrase = LOCALE_DISCLAIMER[locale] || LOCALE_DISCLAIMER.en;
    const append = `\n\n---\n\n${phrase}\n`;
    nextBody = `${nextBody.replace(/\s*$/, '')}${append}`;
    fileChanged = true;
  }

  if (!fileChanged) continue;

  touchedFiles += 1;
  const rebuilt = `---\n${nextFrontmatter}\n---\n\n${nextBody.replace(/^\s+/, '')}`;
  if (APPLY) {
    fs.writeFileSync(filePath, rebuilt, 'utf8');
  }
  changedCount += 1;
}

if (APPLY) {
  console.log(`content-autofix: updated ${changedCount} file(s)`);
} else {
  console.log(`content-autofix: dry run, ${touchedFiles} file(s) would be updated. Use --apply to write.`);
}
