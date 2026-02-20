import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const OUT_FILE = path.resolve('tmp/stale-content-report.md');
const STALE_DAYS = Number(process.env.STALE_DAYS || 180);

function parseFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+)\s*:\s*(.+)$/.exec(line.trim());
    if (!kv) continue;
    out[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const now = new Date();
const staleRows = [];

for (const fileName of fs.readdirSync(BLOG_DIR)) {
  if (!fileName.endsWith('.md')) continue;
  const filePath = path.join(BLOG_DIR, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const fm = parseFrontmatter(content);
  const reviewDateRaw = fm.updatedDate || fm.pubDate;
  if (!reviewDateRaw) continue;
  const reviewDate = new Date(reviewDateRaw);
  if (Number.isNaN(reviewDate.getTime())) continue;
  const ageDays = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
  if (ageDays < STALE_DAYS) continue;

  staleRows.push({
    fileName,
    title: fm.title || '(untitled)',
    reviewDate: reviewDate.toISOString().slice(0, 10),
    ageDays,
    slug: fm.urlSlug || '',
  });
}

staleRows.sort((a, b) => b.ageDays - a.ageDays);

const lines = [];
lines.push('# Stale Content Report');
lines.push('');
lines.push(`Generated: ${now.toISOString()}`);
lines.push(`Threshold: ${STALE_DAYS} days`);
lines.push(`Total stale posts: ${staleRows.length}`);
lines.push('');
lines.push('| File | Title | Last Reviewed | Age (days) | URL Slug |');
lines.push('| --- | --- | --- | ---: | --- |');
for (const row of staleRows) {
  lines.push(`| ${row.fileName} | ${row.title} | ${row.reviewDate} | ${row.ageDays} | ${row.slug} |`);
}
lines.push('');

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, lines.join('\n'), 'utf8');
console.log(`stale-content-report: wrote ${OUT_FILE} (${staleRows.length} stale posts)`);
