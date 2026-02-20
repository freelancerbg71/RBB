/* eslint-disable no-console */
// Clean Astro's generated cache between builds to avoid noisy duplicate-id warnings
// when the content store is reused across incremental runs (common on Windows).

const fs = require('node:fs');
const path = require('node:path');

const p = path.join(process.cwd(), '.astro');
try {
  fs.rmSync(p, { recursive: true, force: true });
} catch (e) {
  // Ignore - non-fatal.
}

