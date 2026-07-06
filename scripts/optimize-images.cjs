#!/usr/bin/env node
// Generates WebP variants of the product images in public/menu so the storefront
// can serve smaller files (PNG kept as fallback). Runs in prebuild. Skips files
// whose .webp is already newer than the source.
const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.warn('[optimize-images] sharp not installed — skipping WebP generation.');
  process.exit(0);
}

const MENU_DIR = path.resolve(__dirname, '..', 'public', 'menu');

async function main() {
  if (!fs.existsSync(MENU_DIR)) {
    console.warn(`[optimize-images] ${MENU_DIR} not found — skipping.`);
    return;
  }
  const pngs = fs.readdirSync(MENU_DIR).filter((f) => /\.png$/i.test(f));
  let made = 0;
  for (const png of pngs) {
    const src = path.join(MENU_DIR, png);
    const out = path.join(MENU_DIR, png.replace(/\.png$/i, '.webp'));
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
    await sharp(src).webp({ quality: 80 }).toFile(out);
    made++;
  }
  console.log(`[optimize-images] ${made} WebP file(s) generated from ${pngs.length} PNG(s).`);
}

main().catch((err) => {
  console.error('[optimize-images] failed:', err);
  process.exit(1);
});
