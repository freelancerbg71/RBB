/*
  Text guard: blocks mojibake + smart punctuation + emoji/symbols that commonly break encoding.
  This should fail builds on Railway if any of these slip into content/templates.
*/
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const ROOT_DIRS = [
  'src/content',
  'src/pages',
  'src/layouts',
  'src/components',
  'src/config',
  'src/styles',
];

const EXT_OK = new Set(['.md', '.mdx', '.astro', '.ts', '.tsx', '.js', '.cjs', '.mjs', '.css', '.json', '.yml', '.yaml']);
const ALLOW_EMOJI_IN_CONTENT = true;

// Disallow smart punctuation outright.
const FORBIDDEN_CHARS_RE = /[\u2013\u2014\u2018\u2019\u201C\u201D\u2026]/g; // – — ‘ ’ “ ” …

// Detect common mojibake sequences using ASCII-only \u escapes.
// Examples this catches: "â€“" (\u00e2\u20ac...), "Ã©" (\u00c3...), "ðŸ" (\u00f0\u0178...), replacement char.
const MOJIBAKE_RE = /(?:\u00e2\u20ac|\u00c3|\u00c2|\u00f0\u0178|\u00e2\u0153|\u00ef\u00b8|\ufffd)/g;

// Emoji + dingbats + arrows etc. Keep this broad.
const EMOJI_SYMBOL_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2190}-\u{21FF}]/gu;

function isTextFile(p) {
  return EXT_OK.has(path.extname(p).toLowerCase());
}

function walk(dir) {
  const out = [];
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  const stack = [abs];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.astro' || e.name === '.git') continue;
      const full = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.isFile() && isTextFile(full)) out.push(full);
    }
  }
  return out;
}

function toRel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function firstIndexOfAny(text) {
  const idxM = text.search(MOJIBAKE_RE);
  const idxP = text.search(FORBIDDEN_CHARS_RE);
  const idxE = text.search(EMOJI_SYMBOL_RE);

  const candidates = [idxM, idxP, idxE].filter((n) => n >= 0);
  if (!candidates.length) return -1;
  return Math.min(...candidates);
}

function findKindAt(text, idx) {
  if (idx < 0) return null;
  const slice = text.slice(idx, idx + 8);
  if (MOJIBAKE_RE.test(slice)) return 'mojibake';
  if (FORBIDDEN_CHARS_RE.test(slice)) return 'smart-punct';
  if (EMOJI_SYMBOL_RE.test(slice)) return 'emoji/symbol';
  return 'unknown';
}

function checkFile(fullPath) {
  const raw = fs.readFileSync(fullPath);
  const text = raw.toString('utf8');
  const rel = toRel(fullPath);
  const skipEmojiCheck = ALLOW_EMOJI_IN_CONTENT && rel.startsWith('src/content/');

  const idxM = text.search(MOJIBAKE_RE);
  const idxP = text.search(FORBIDDEN_CHARS_RE);
  const idxE = skipEmojiCheck ? -1 : text.search(EMOJI_SYMBOL_RE);
  const candidates = [idxM, idxP, idxE].filter((n) => n >= 0);
  const idx = candidates.length ? Math.min(...candidates) : -1;
  if (idx < 0) return [];

  // Report first occurrence only per file (keeps output readable).
  const before = text.slice(0, Math.max(0, idx));
  const line = before.split('\n').length;
  const col = idx - before.lastIndexOf('\n');
  const lineText = text.split('\n')[line - 1] ?? '';

  const kind = findKindAt(text, idx);
  const sample = text.slice(idx, idx + 4);

  return [{
    file: toRel(fullPath),
    kind,
    line,
    col,
    sample,
    context: lineText.trim().slice(0, 200),
  }];
}

function main() {
  const files = ROOT_DIRS.flatMap(walk);
  const all = [];
  for (const f of files) all.push(...checkFile(f));

  if (!all.length) {
    console.log('text-guard: OK');
    return;
  }

  console.error('text-guard: FAILED');
  for (const r of all) {
    console.error(`${r.file}:${r.line}:${r.col} [${r.kind}] ${JSON.stringify(r.sample)} | ${r.context}`);
  }
  console.error('\nFix: use plain ASCII punctuation, avoid emoji/symbols, and eliminate mojibake sequences (often caused by a bad copy/paste or editor encoding mismatch).');
  process.exit(1);
}

main();
