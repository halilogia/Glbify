import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const APP_ROOT = resolve(here, '..', '..');

export const DIST_CANDIDATES = [
    join(APP_ROOT, 'dist', 'index.html'),
    join(APP_ROOT, '..', '..', 'Glbify', 'dist', 'index.html'),
];

export function resolveDistIndex(candidates = DIST_CANDIDATES) {
    const found = candidates.find((candidate) => existsSync(candidate));
    if (!found) {
        throw new Error('dist/index.html bulunamadi. Once `npm run build` calistirin.');
    }
    return found;
}

export function resolveIndexUrl(indexPath) {
    const normalized = indexPath.replace(/\\/g, '/');
    return `file://${normalized.startsWith('/') ? '' : '/'}${normalized}`;
}
