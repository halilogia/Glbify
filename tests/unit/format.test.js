import { describe, expect, it } from 'vitest';
import { formatBytes, formatCount, sanitizeBaseName, extensionOf, formatDimensions } from '../../src/utils/format.js';

describe('formatBytes', () => {
    it('bayt, kilobayt, megabayt ve gigabayt olceklerini kullanir', () => {
        expect(formatBytes(512)).toBe('512 B');
        expect(formatBytes(2048)).toBe('2.0 KB');
        expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
        expect(formatBytes(3 * 1024 * 1024 * 1024)).toBe('3.00 GB');
    });

    it('gecersiz girdide guvenli doner', () => {
        expect(formatBytes(Number.NaN)).toBe('-');
        expect(formatBytes(-1)).toBe('-');
    });
});

describe('formatCount', () => {
    it('binlik ve milyonluk kisaltmalar kullanir', () => {
        expect(formatCount(999)).toBe('999');
        expect(formatCount(1500)).toBe('1.5K');
        expect(formatCount(25000)).toBe('25K');
        expect(formatCount(1500000)).toBe('1.5M');
    });
});

describe('sanitizeBaseName', () => {
    it('uzanti ve yasakli karakterleri temizler', () => {
        expect(sanitizeBaseName('kule final.fbx')).toBe('kule_final');
        expect(sanitizeBaseName('a/b:c*model.glb')).toBe('a_b_c_model');
    });

    it('bos girdide varsayilan ad doner', () => {
        expect(sanitizeBaseName('')).toBe('model');
        expect(sanitizeBaseName('...')).toBe('model');
    });
});

describe('extensionOf', () => {
    it('uzantiyi kucuk harfe cevirir', () => {
        expect(extensionOf('model.FBX')).toBe('fbx');
        expect(extensionOf('archive.tar.gz')).toBe('gz');
        expect(extensionOf('model')).toBe('');
    });
});

describe('formatDimensions', () => {
    it('iki ondalikli boyut yazar', () => {
        expect(formatDimensions({ x: 1, y: 2.5, z: 3 })).toBe('1.00 x 2.50 x 3.00 birim');
    });
});
