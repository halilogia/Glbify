import { unzipSync } from 'three/addons/libs/fflate.module.js';

const ROOT_SUFFIX = '.usda';

export function validateUsdz(buffer, { expectTextures = true } = {}) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const notes = [];
    const warnings = [];

    if (bytes.length < 22 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
        return { valid: false, entries: [], notes: ['USDZ paketi ZIP imzası taşımıyor.'], warnings };
    }

    let archive;
    try {
        archive = unzipSync(bytes);
    } catch (error) {
        return { valid: false, entries: [], notes: [`USDZ paketi okunamadı: ${error.message}`], warnings };
    }

    const entries = Object.keys(archive);
    const root = entries.find((entry) => entry.toLowerCase().endsWith(ROOT_SUFFIX));
    const textures = entries.filter((entry) => /\.(png|jpe?g|exr)$/i.test(entry));

    if (!root) warnings.push('USDZ içinde .usda kök dosyası bulunamadı.');
    if (expectTextures && !textures.length) warnings.push('USDZ içinde doku bulunamadı; dokular gömülmemiş olabilir.');

    let frames = 0;
    if (root) {
        const source = new TextDecoder('utf-8', { fatal: false }).decode(archive[root]);
        frames = (source.match(/def\s+TimeSample\s+"[^"]*"/g) ?? []).length;
    }

    notes.push(`${entries.length} dosya, ${textures.length} doku, ${frames} animasyon karesi`);

    return { valid: Boolean(root), entries, notes, warnings };
}
