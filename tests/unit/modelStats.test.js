import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { computeStats } from '../../src/io/modelStats.js';

function mesh(positions, indexed) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (indexed) geometry.setIndex([...Array(positions.length / 3).keys()]);
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
}

describe('computeStats', () => {
    it('indekslenmemis gecide ucgen ve vertex sayar', () => {
        const group = new THREE.Group();
        group.add(mesh([0, 0, 0, 1, 0, 0, 0, 1, 0], false));

        const stats = computeStats(group);

        expect(stats.meshes).toBe(1);
        expect(stats.vertices).toBe(3);
        expect(stats.triangles).toBe(1);
        expect(stats.hasUnindexedGeometry).toBe(true);
    });

    it('indekslenmis gecide indis sayisini kullanir', () => {
        const group = new THREE.Group();
        group.add(mesh([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0], true));

        const stats = computeStats(group);

        expect(stats.vertices).toBe(4);
        expect(stats.triangles).toBe(1);
        expect(stats.hasUnindexedGeometry).toBe(false);
    });

    it('kemikleri ve morf hedeflerini sayar', () => {
        const group = new THREE.Group();
        const skinned = new THREE.SkinnedMesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
        skinned.morphTargetInfluences = [0, 0];
        const bone = new THREE.Bone();
        bone.add(skinned);
        group.add(bone);

        const stats = computeStats(group);

        expect(stats.bones).toBe(1);
        expect(stats.morphTargets).toBe(2);
    });

    it('bos sahne icin sifir degerler doner', () => {
        const stats = computeStats(new THREE.Group());

        expect(stats.meshes).toBe(0);
        expect(stats.triangles).toBe(0);
        expect(stats.size).toEqual(new THREE.Vector3(0, 0, 0));
    });
});
