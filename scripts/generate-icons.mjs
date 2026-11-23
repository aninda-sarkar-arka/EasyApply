/**
 * Generates PNG extension icons at all required sizes from public/logo.svg.
 * Run once after changing the logo:
 *   node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(__dirname, '../public/logo.svg'));

const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  const dest = resolve(__dirname, `../public/icon/${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(dest);
  console.log(`✓ ${size}x${size} → public/icon/${size}.png`);
}

console.log('\nDone. Reload the extension in chrome://extensions to see the new icons.');
