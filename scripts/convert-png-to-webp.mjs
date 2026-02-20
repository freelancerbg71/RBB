import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const TARGET_ROOT = path.join(ROOT, 'public', 'img');
const KEEP_PNG = process.argv.includes('--keep-png');
const SKIP = new Set([
  path.join(TARGET_ROOT, 'brand', 'favicon.png'),
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && full.toLowerCase().endsWith('.png')) out.push(full);
  }
  return out;
}

async function run() {
  if (!fs.existsSync(TARGET_ROOT)) {
    console.error(`convert-png-to-webp: missing target directory: ${TARGET_ROOT}`);
    process.exit(1);
  }

  const pngFiles = walk(TARGET_ROOT).filter((file) => !SKIP.has(file));
  let converted = 0;
  let removed = 0;

  for (const file of pngFiles) {
    const webpFile = file.replace(/\.png$/i, '.webp');
    const image = sharp(file);
    await image.webp({ quality: 82 }).toFile(webpFile);
    converted += 1;

    if (!KEEP_PNG) {
      fs.unlinkSync(file);
      removed += 1;
    }
  }

  console.log(
    `convert-png-to-webp: converted ${converted} file(s) under ${path.relative(ROOT, TARGET_ROOT)}; removed ${removed} PNG source file(s).`,
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
