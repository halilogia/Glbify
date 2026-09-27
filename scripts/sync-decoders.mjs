import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'draco');

const assets = [
    ['draco3dgltf/draco_encoder_gltf_nodejs.js', 'draco_encoder.js'],
    ['draco3dgltf/draco_encoder.wasm', 'draco_encoder.wasm'],
];

async function sync() {
    if (!existsSync(join(root, 'node_modules'))) {
        console.warn('[sync-decoders] node_modules yok, atlaniyor. Once `npm install` calistirin.');
        return;
    }

    const stamp = {};
    const missing = [];

    for (const [from, to] of assets) {
        const source = join(root, 'node_modules', ...from.split('/'));
        if (!existsSync(source)) {
            missing.push(from);
            continue;
        }
        const target = join(outDir, to);
        await mkdir(dirname(target), { recursive: true });
        await copyFile(source, target);
        stamp[to] = (await stat(target)).size;
    }

    const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    const manifest = { draco3dgltf: pkg.dependencies.draco3dgltf, files: stamp };
    await writeFile(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

    const total = Object.values(stamp).reduce((sum, size) => sum + size, 0);
    console.log(`[sync-decoders] ${Object.keys(stamp).length} dosya hazir (${(total / 1048576).toFixed(2)} MB)`);

    if (missing.length) console.warn(`[sync-decoders] bulunamayan kaynaklar: ${missing.join(', ')}`);
}

sync().catch((error) => {
    console.warn(`[sync-decoders] basarisiz: ${error.message}`);
    if (process.env.GLBY_STRICT_DECODERS === '1') process.exit(1);
});
