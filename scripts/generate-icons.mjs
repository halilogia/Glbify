import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');

const sizes = [
  { file: 'icon-192.png', size: 192, pad: 0 },
  { file: 'icon-512.png', size: 512, pad: 0 },
  { file: 'icon-maskable-512.png', size: 512, pad: 0.18 },
  { file: 'apple-touch-icon.png', size: 180, pad: 0 },
];

const mark = (size) => `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#g)"/>
  <text x="50%" y="50%" dy="0.36em" text-anchor="middle"
        font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="${size * 0.58}" font-weight="800" fill="#04180b">G</text>`;

async function generate() {
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });

  for (const { file, size, pad } of sizes) {
    const inset = Math.round(size * pad);
    const inner = size - inset * 2;
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#04180b"/>
      <g transform="translate(${inset} ${inset})">${mark(inner)}</g>
    </svg>`);

    const png = await sharp(svg).png({ compressionLevel: 9 }).toBuffer();
    await writeFile(join(outDir, file), png);
  }

  const favicon = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${mark(64)}</svg>`))
    .resize(64, 64)
    .png()
    .toBuffer();
  await writeFile(join(root, 'public', 'favicon.png'), favicon);

  console.log(`[icons] ${sizes.length + 1} ikon uretildi`);
}

generate().catch((error) => {
  console.warn(`[icons] ikon uretilemedi: ${error.message}`);
  if (process.env.GLBY_STRICT_ICONS === '1') process.exit(1);
});
