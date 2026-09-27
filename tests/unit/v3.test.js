import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { History } from '../../src/core/history.js';
import { applySceneSettings, SCENE_DEFAULTS } from '../../src/core/sceneSettings.js';
import { collectTextures, describeMaterial, listMaterials, applyMaterialPatch, captureMaterialState, restoreMaterialState } from '../../src/io/materialEditor.js';

function scene() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0xdc2828, roughness: 0.5, metalness: 0.1 });
    material.name = 'Kirmizi';
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
    mesh.name = 'kule';
    group.add(mesh);
    return { group, material, mesh };
}

describe('History', () => {
    it('gidis durumu degistirir', () => {
        let value = 0;
        const history = new History({ capture: () => value, restore: (state) => { value = state; } });

        history.reset(0);
        value = 1;
        history.commit();
        value = 2;
        history.commit();

        expect(history.canUndo()).toBe(true);
        history.undo();
        expect(value).toBe(1);
        history.undo();
        expect(value).toBe(0);
        expect(history.canUndo()).toBe(false);
        history.redo();
        expect(value).toBe(1);
    });

    it('yeni commit sonra redo gecmisini keser', () => {
        let value = 0;
        const history = new History({ capture: () => value, restore: (state) => { value = state; } });

        history.reset(0);
        value = 1;
        history.commit();
        history.undo();
        value = 5;
        history.commit();

        expect(history.canRedo()).toBe(false);
        expect(value).toBe(5);
    });

    it('degisiklik bilgisini bildirir', () => {
        const seen = [];
        const history = new History({ capture: () => 0, restore: () => {}, onChange: (info) => seen.push(info) });

        history.reset(0);
        history.commit();

        expect(seen.at(-1)).toMatchObject({ canUndo: true, canRedo: false, total: 2, position: 1 });
    });
});

describe('applySceneSettings', () => {
    it('sahne, isik ve pozlama degerlerini uygular', () => {
        const target = {
            scene: new THREE.Scene(),
            renderer: { toneMappingExposure: 1 },
            lights: { key: new THREE.DirectionalLight(), fill: new THREE.AmbientLight() },
            grid: new THREE.GridHelper(),
            environment: { texture: new THREE.Texture() },
        };
        const gridHelper = target.grid;

        applySceneSettings(
            { ...SCENE_DEFAULTS, keyIntensity: 3.5, background: '#101014', exposure: 1.4, gridVisible: false },
            target,
        );

        expect(target.lights.key.intensity).toBe(3.5);
        expect(`#${target.scene.background.getHexString()}`).toBe('#101014');
        expect(target.scene.environmentIntensity).toBe(SCENE_DEFAULTS.environmentIntensity);
        expect(target.renderer.toneMappingExposure).toBe(1.4);
        expect(gridHelper.visible).toBe(false);
    });
});

describe('materialEditor', () => {
    it('materyalleri mesh sayisiyla listeler', () => {
        const { group, material } = scene();

        const entries = listMaterials(group);

        expect(entries).toHaveLength(1);
        expect(entries[0].material).toBe(material);
        expect(entries[0].meshes).toEqual(['kule']);
    });

    it('materyal ozelliklerini ozetler', () => {
        const { group, material } = scene();
        material.roughness = 0.25;

        const [entry] = listMaterials(group);
        const info = describeMaterial(entry);

        expect(info.name).toBe('Kirmizi');
        expect(info.roughness).toBe(0.25);
        expect(info.color).toBe('#dc2828');
        expect(info.meshCount).toBe(1);
    });

    it('renk ve deger yamalarini uygular', () => {
        const { material } = scene();

        applyMaterialPatch(material, { color: '#00ff00', values: { roughness: 0.9, metalness: 0.25 } });

        expect(`#${material.color.getHexString()}`).toBe('#00ff00');
        expect(material.roughness).toBe(0.9);
        expect(material.metalness).toBe(0.25);
    });

    it('doku atamasi renk uzayini duzeltir', () => {
        const { material } = scene();
        const texture = new THREE.Texture();

        applyMaterialPatch(material, { textureSlot: { key: 'map', texture } });

        expect(material.map).toBe(texture);
        expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
    });

    it('doku envanteri uuid ile eslenir', () => {
        const { group, material } = scene();
        const texture = new THREE.Texture();
        material.map = texture;

        const textures = collectTextures(group);

        expect(textures.get(texture.uuid)).toBe(texture);
    });

    it('materyal durumu yakalayip geri yukler', () => {
        const { material } = scene();
        const state = captureMaterialState(material);

        applyMaterialPatch(material, { color: '#123456', values: { roughness: 0.01 } });
        restoreMaterialState(material, state, new Map());

        expect(`#${material.color.getHexString()}`).toBe('#dc2828');
        expect(material.roughness).toBe(0.5);
    });
});
