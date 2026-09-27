import { describe, expect, it } from 'vitest';
import { readSettingsFromUrl } from '../../src/utils/share.js';
import { EmptyFileError, FileLimitError } from '../../src/io/fileReader.js';
import { applyMtlLibrary, auditColorSpaces } from '../../src/io/materials.js';
import * as THREE from 'three';

describe('store URL ayarlari', () => {
    it('tarayici ortaminda localStorage kullanir', () => {
        expect(readSettingsFromUrl('?scale=100').scale).toBe(100);
    });
});

describe('fileReader hatalari', () => {
    it('limit asimi anlasilir mesaj uretir', () => {
        const error = new FileLimitError({ name: 'devasa.fbx', size: 900 * 1024 * 1024 }, 512 * 1024 * 1024);
        expect(error.message).toContain('limitini aşıyor');
        expect(error.limit).toBe(512 * 1024 * 1024);
    });

    it('bos dosya hatasi dosya adini icerir', () => {
        const error = new EmptyFileError({ name: 'bos.glb' });
        expect(error.message).toContain('boş');
    });
});

describe('auditColorSpaces', () => {
    it('renk haritasi olmayan modelde uyari uretmez', () => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
        const report = auditColorSpaces(mesh);

        expect(report.textures).toBe(0);
        expect(report.issues).toHaveLength(0);
    });

    it('sRGB isaretli normal haritasini raporlar', () => {
        const material = new THREE.MeshStandardMaterial();
        const texture = new THREE.Texture();
        texture.colorSpace = THREE.SRGBColorSpace;
        material.normalMap = texture;

        const report = auditColorSpaces(new THREE.Mesh(new THREE.BoxGeometry(), material));

        expect(report.issues.some((issue) => issue.includes('normal'))).toBe(true);
    });
});

describe('applyMtlLibrary', () => {
    it('usemtl adina gore materyal degistirir', () => {
        const replacement = new THREE.MeshPhongMaterial();
        const library = {
            getMaterial: (name) => (name === 'Kirmizi' ? replacement : null),
        };

        const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial());
        mesh.material.name = 'Kirmizi';
        const group = new THREE.Group();
        group.add(mesh);

        const applied = applyMtlLibrary(group, library);

        expect(applied).toBe(1);
        expect(mesh.material).toBe(replacement);
    });

    it('eslesme yoksa materyali degistirmez', () => {
        const original = new THREE.MeshPhongMaterial();
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(), original);
        const group = new THREE.Group();
        group.add(mesh);

        expect(applyMtlLibrary(group, { getMaterial: () => null })).toBe(0);
        expect(mesh.material).toBe(original);
    });
});
