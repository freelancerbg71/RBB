import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const STRICT = process.argv.includes('--strict');
const BASELINE_FILE = path.resolve('docs/content-lint-baseline.txt');
const REQUIRED_FRONTMATTER = ['urlSlug', 'title', 'description', 'pubDate', 'category'];
const DISCLAIMER_PATTERNS = [
  /informational only/i,
  /for educational purposes only/i,
  /contenu est uniquement informatif/i,
];

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
    frontmatter[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return { frontmatter, body };
}

for (const fileName of fs.readdirSync(BLOG_DIR)) {
  if (!fileName.endsWith('.md')) continue;
  const filePath = path.join(BLOG_DIR, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(content);

  for (const key of REQUIRED_FRONTMATTER) {
    if (!frontmatter[key]) issues.push(`${fileName}: missing frontmatter "${key}"`);
  }

  const description = frontmatter.description || '';
  if (description.length > 155) {
    issues.push(`${fileName}: description too long (${description.length} chars, max 155)`);
  }

  const hasDisclaimer = DISCLAIMER_PATTERNS.some((pattern) => pattern.test(body));
  if (!hasDisclaimer) {
    issues.push(`${fileName}: missing informational disclaimer phrase`);
  }
}

if (issues.length > 0) {
  console.log('content-lint: issues found');
  for (const issue of issues) console.log(`- ${issue}`);
  if (STRICT) {
    const baseline = fs.existsSync(BASELINE_FILE)
      ? new Set(
          fs
            .readFileSync(BASELINE_FILE, 'utf8')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean),
        )
      : new Set();

    const newIssues = issues.filter((issue) => !baseline.has(issue));
    if (newIssues.length > 0) {
      console.log('content-lint: strict mode found new issues (not in baseline)');
      for (const issue of newIssues) console.log(`+ ${issue}`);
      process.exit(1);
    }

    console.log('content-lint: strict mode passed (no new issues vs baseline)');
    process.exit(0);
  }
  console.log('content-lint: non-strict mode, continuing');
} else {
  console.log('content-lint: OK');
}
