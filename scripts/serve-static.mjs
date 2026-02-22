import fs from 'node:fs';
import crypto from 'node:crypto';
import http from 'node:http';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

const REDIRECTS = new Map([
  ['/blog/aviator-guide/', '/blog/how-to-play-aviator/'],
  ['/blog/baccarat-strategies/', '/blog/baccarat-risk-playbook/'],
  ['/blog/bingo-basics/', '/blog/how-bingo-works/'],
  ['/blog/blackjack-charts/', '/blog/blackjack-basic-strategy-cheatsheet/'],
  ['/blog/mega-ball-strategy-guide/', '/blog/mega-ball-explained/'],
  ['/blog/monopoly-live-strategy-guide/', '/blog/monopoly-live-explained/'],
  ['/fr/blog/aviator-guide/', '/fr/blog/how-to-play-aviator/'],
  ['/fr/blog/baccarat-strategies/', '/fr/blog/baccarat-risk-playbook/'],
  ['/fr/blog/bingo-basics/', '/fr/blog/how-bingo-works/'],
  ['/de/blog/aviator-guide/', '/de/blog/how-to-play-aviator/'],
  ['/de/blog/baccarat-strategies/', '/de/blog/baccarat-risk-playbook/'],
  ['/de/blog/bingo-basics/', '/de/blog/how-bingo-works/'],
  ['/ru/blog/aviator-guide/', '/ru/blog/how-to-play-aviator/'],
  ['/ru/blog/baccarat-strategies/', '/ru/blog/baccarat-risk-playbook/'],
  ['/ru/blog/bingo-basics/', '/ru/blog/how-bingo-works/'],
]);

function walkHtmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtmlFiles(fullPath));
    if (entry.isFile() && fullPath.endsWith('.html')) out.push(fullPath);
  }
  return out;
}

function isExecutableInlineScript(attrs) {
  if (/\bsrc\s*=/i.test(attrs)) return false;
  const typeMatch = /\btype=["']([^"']+)["']/i.exec(attrs);
  if (!typeMatch) return true;
  const type = typeMatch[1].toLowerCase().trim();
  return type === 'module' || type === 'text/javascript' || type === 'application/javascript';
}

function hashCspBlock(content) {
  return `'sha256-${crypto.createHash('sha256').update(content, 'utf8').digest('base64')}'`;
}

function collectInlineScriptHashes() {
  const hashes = new Set();
  const scriptTagRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  for (const htmlPath of walkHtmlFiles(DIST_DIR)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    let match = scriptTagRe.exec(html);
    while (match) {
      const attrs = match[1] ?? '';
      const body = match[2] ?? '';
      if (isExecutableInlineScript(attrs)) {
        if (body.trim().length > 0) {
          hashes.add(hashCspBlock(body));
        }
      }
      match = scriptTagRe.exec(html);
    }
  }

  return [...hashes].sort();
}

function collectInlineStyleHashes() {
  const hashes = new Set();
  const styleTagRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

  for (const htmlPath of walkHtmlFiles(DIST_DIR)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    let match = styleTagRe.exec(html);
    while (match) {
      const body = match[1] ?? '';
      if (body.trim().length > 0) {
        hashes.add(hashCspBlock(body));
      }
      match = styleTagRe.exec(html);
    }
  }

  return [...hashes].sort();
}

const INLINE_SCRIPT_HASHES = collectInlineScriptHashes();
const INLINE_STYLE_HASHES = collectInlineStyleHashes();
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `script-src 'self' https://plausible.io ${INLINE_SCRIPT_HASHES.join(' ')}`.trim(),
  `style-src 'self' ${INLINE_STYLE_HASHES.join(' ')}`.trim(),
  "connect-src 'self' https://plausible.io",
  "form-action 'self' https://docs.google.com",
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function applyHeaders(res, extra = {}) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, value);
  }
  for (const [key, value] of Object.entries(extra)) {
    res.setHeader(key, value);
  }
}

function contentTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function cacheControlFor(relativePath) {
  if (relativePath.endsWith('.html')) return 'no-cache';
  if (relativePath.startsWith('_astro/')) return 'public, max-age=31536000, immutable';
  return 'public, max-age=86400';
}

function normalizeRoutePath(pathname) {
  const normalized = path.posix.normalize(pathname || '/');
  const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
  if (withSlash === '/') return withSlash;
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}

function resolveCandidate(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const normalized = path.posix.normalize(decoded);
  const safePath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  const relative = safePath.replace(/^\/+/, '');

  const base = path.resolve(DIST_DIR, relative);
  if (!base.startsWith(DIST_DIR)) return null;

  const candidates = [];
  if (safePath === '/') {
    candidates.push(path.join(DIST_DIR, 'index.html'));
  } else {
    candidates.push(base);
    candidates.push(path.join(base, 'index.html'));
    candidates.push(`${base}.html`);
  }

  for (const candidate of candidates) {
    if (!candidate.startsWith(DIST_DIR) || !fs.existsSync(candidate)) continue;
    const stat = fs.statSync(candidate);
    if (stat.isDirectory()) {
      const indexFile = path.join(candidate, 'index.html');
      if (fs.existsSync(indexFile)) return indexFile;
      continue;
    }
    if (stat.isFile()) return candidate;
  }

  return null;
}

function sendFile(req, res, filePath, statusCode = 200) {
  const relativePath = path.relative(DIST_DIR, filePath).replace(/\\/g, '/');
  applyHeaders(res, {
    'Cache-Control': cacheControlFor(relativePath),
    'Content-Type': contentTypeFor(filePath),
  });
  res.statusCode = statusCode;

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.statusCode = 500;
    res.end('Internal Server Error');
  });
  stream.pipe(res);
}

if (!fs.existsSync(DIST_DIR)) {
  console.error(`serve-static: dist folder not found at ${DIST_DIR}`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) {
    applyHeaders(res, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  const normalizedPath = normalizeRoutePath(url.pathname);
  const redirectTarget = REDIRECTS.get(normalizedPath);
  if (redirectTarget) {
    applyHeaders(res, {
      'Cache-Control': 'public, max-age=3600',
      Location: redirectTarget,
      'Content-Type': 'text/plain; charset=utf-8',
    });
    res.statusCode = 308;
    res.end(`Permanent Redirect to ${redirectTarget}`);
    return;
  }

  const filePath = resolveCandidate(url.pathname);

  if (filePath) {
    sendFile(req, res, filePath, 200);
    return;
  }

  const notFoundCandidates = [
    path.join(DIST_DIR, '404.html'),
    path.join(DIST_DIR, '404', 'index.html'),
  ];
  const notFoundFile = notFoundCandidates.find((candidate) => fs.existsSync(candidate));
  if (notFoundFile) {
    sendFile(req, res, notFoundFile, 404);
    return;
  }

  applyHeaders(res, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`serve-static: serving ${DIST_DIR} on http://${HOST}:${PORT}`);
  console.log(`serve-static: inline script hashes in CSP = ${INLINE_SCRIPT_HASHES.length}`);
  console.log(`serve-static: inline style hashes in CSP = ${INLINE_STYLE_HASHES.length}`);
});
