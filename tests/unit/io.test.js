import { describe, expect, it } from 'vitest';
import { ACCEPTED_EXTENSIONS, getImporter, importers } from '../../src/io/importers.js';
import { isWorkerParseSupported } from '../../src/io/workerParser.js';
import { invertNormalGreen } from '../../src/io/textureOps.js';
import { estimateOutputBytes, formatEstimate } from '../../src/io/estimate.js';
import { buildShareUrl, readSettingsFromUrl } from '../../src/utils/share.js';

describe('importer kayitlari', () => {
    it('tum beklenen formatlari kapsar', () => {
        for (const extension of ['fbx', 'glb', 'gltf', 'obj', 'mtl', 'stl', 'ply', '3mf', 'usdz']) {
            expect(ACCEPTED_EXTENSIONS).toContain(extension);
        }
    });

    it('uzantiya gore dogru yukleyiciyi dondurur', () => {
        expect(getImporter('glb').id).toBe('gltf');
        expect(getImporter('3mf').id).toBe('3mf');
        expect(getImporter('ply').id).toBe('ply');
        expect(getImporter('png')).toBeNull();
    });

    it('her yukleyici etiket ve parse sunar', () => {
        for (const importer of importers) {
            expect(importer.label).toBeTruthy();
            expect(typeof importer.parse).toBe('function');
        }
    });
});

describe('isWorkerParseSupported', () => {
    it('geometri formatlarini isciye gonderir', () => {
        expect(isWorkerParseSupported('stl', { size: 1024 })).toBe(true);
        expect(isWorkerParseSupported('ply', { size: 1024 })).toBe(true);
        expect(isWorkerParseSupported('obj', { size: 1024 })).toBe(true);
    });

    it('doku isteyen OBJ ve buyuk dosyalari disarida birakir', () => {
        expect(isWorkerParseSupported('fbx', { size: 1024 })).toBe(false);
        expect(isWorkerParseSupported('glb', { size: 1024 })).toBe(false);
        expect(isWorkerParseSupported('stl', { size: 400 * 1024 * 1024 })).toBe(false);
    });

    it('MTL ile birlikte gelen OBJ isciye gonderilir', () => {
        expect(isWorkerParseSupported('obj', { size: 1024 })).toBe(true);
    });
});

describe('invertNormalGreen', () => {
    it('yesil kanali ters cevirir', () => {
        const data = { width: 1, height: 1, data: new Uint8ClampedArray([10, 20, 30, 255]) };

        invertNormalGreen(data);

        expect([...data.data]).toEqual([10, 235, 30, 255]);
    });
});

describe('estimateOutputBytes', () => {
    const input = { vertices: 1000, triangles: 500, textures: [] };

    it('DRACO varsayilan olarak ham veriden kucuk sonuc verir', () => {
        const plain = estimateOutputBytes({ ...input, options: { draco: false, weld: false } });
        const draco = estimateOutputBytes({ ...input, options: { draco: true, dracoLevel: 'balanced' } });
        expect(draco).toBeLessThan(plain);
    });

    it('sadelestirme vertex sayisini dusurur', () => {
        const full = estimateOutputBytes({ ...input, options: { draco: true } });
        const half = estimateOutputBytes({ ...input, options: { draco: true, simplifyRatio: 0.5 } });
        expect(half).toBeLessThan(full);
    });

    it('KTX2 doku tahminini kucultur', () => {
        const textures = [{ width: 1024, height: 1024 }];
        const png = estimateOutputBytes({ ...input, textures, options: { draco: true } });
        const ktx2 = estimateOutputBytes({ ...input, textures, options: { draco: true, ktx2: true } });
        expect(ktx2).toBeLessThan(png);
    });

    it('tahmin bicimlendirmesi okunabilir', () => {
        expect(formatEstimate(512)).toBe('512 B');
        expect(formatEstimate(5 * 1024 * 1024)).toBe('5.0 MB');
    });
});

describe('paylasilabilir ayarlar', () => {
    it('URL parametrelerini ayarlara cevirir', () => {
        const patch = readSettingsFromUrl('?scale=100&draco=max&meshopt=1&ktx2=0');

        expect(patch.scale).toBe(100);
        expect(patch.dracoLevel).toBe('max');
        expect(patch.meshopt).toBe(true);
        expect(patch.ktx2).toBe(false);
    });

    it('bilinmeyen parametreleri yok sayar', () => {
        expect(readSettingsFromUrl('?kotu=1&x=2')).toEqual({});
    });

    it('ayarlardan baglanti uretir', () => {
        const url = buildShareUrl(
            { scale: 1, textureSize: 4096, textureFormat: 'original', dracoLevel: 'balanced', draco: true, simplifyRatio: 0, maxFileMB: 512 },
            'https://example.com/glbify/',
        );

        expect(url).toContain('scale=1');
        expect(url).toContain('draco=balanced');
        expect(url).toContain('limit=512');
    });
});
