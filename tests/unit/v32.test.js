import { describe, expect, it } from 'vitest';
import { decodeProfile, encodeProfile, summarizeProfile } from '../../src/utils/profile.js';
import { LANGUAGES, t } from '../../src/i18n/index.js';

describe('compression profili', () => {
    const options = {
        scale: 100,
        textureSize: 2048,
        textureFormat: 'jpeg',
        textureQuality: 0.8,
        draco: true,
        dracoLevel: 'max',
        meshopt: false,
        ktx2: true,
        weld: true,
        simplifyRatio: 0.5,
        maxFileMB: 512,
    };

    it('kodlayıp çözerken değerleri korur', () => {
        const decoded = decodeProfile(encodeProfile(options));

        expect(decoded.scale).toBe(100);
        expect(decoded.textureFormat).toBe('jpeg');
        expect(decoded.dracoLevel).toBe('max');
        expect(decoded.ktx2).toBe(true);
        expect(decoded.simplifyRatio).toBe(0.5);
        expect(decoded.weld).toBe(true);
    });

    it('URL güvenli karakterler üretir', () => {
        const code = encodeProfile(options);
        expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('boolean alanları korur', () => {
        const decoded = decodeProfile(encodeProfile({ ...options, meshopt: true, weld: false }));

        expect(decoded.meshopt).toBe(true);
        expect(decoded.weld).toBe(false);
    });

    it('bozuk kodda hata fırlatır', () => {
        expect(() => decodeProfile('ab')).toThrow();
        expect(() => decodeProfile('')).toThrow();
    });

    it('özet metni üretir', () => {
        const summary = summarizeProfile(options);

        expect(summary).toContain('100x');
        expect(summary).toContain('DRACO:max');
        expect(summary).toContain('KTX2');
    });
});

describe('i18n', () => {
    it('her iki dilde de aynı anahtar kümesini sunar', () => {
        const tr = Object.keys(LANGUAGES.tr).sort();
        const en = Object.keys(LANGUAGES.en).sort();

        expect(tr).toEqual(en);
    });

    it('yer tutucuları doldurur', () => {
        expect(t('model.clipCount', { count: 3 })).toBe('3 klip');
        expect(t('toast.saved', { percent: 42 })).toContain('42');
    });

    it('bilinmeyen anahtarda anahtarı döndürür', () => {
        expect(t('yok.boyle.bir.anahtar')).toBe('yok.boyle.bir.anahtar');
    });

    it('İngilizce sözlük Türkçe karakter içermez', () => {
        const english = Object.values(LANGUAGES.en).join(' ');
        expect(english).not.toMatch(/[şğüıöç]/i);
    });
});
