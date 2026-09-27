import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { Animator } from '../../src/core/animator.js';

function createAnimator(clipCount = 1, duration = 1) {
    const root = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    root.add(mesh);

    const mixer = new THREE.AnimationMixer(root);
    const clips = Array.from({ length: clipCount }, (_, index) =>
        new THREE.AnimationClip(`clip-${index}`, duration, [
            new THREE.VectorKeyframeTrack('.position', [0, duration], [0, 0, 0, 0, 1, 0]),
        ]),
    );

    return { animator: new Animator(mixer, clips), mixer, clips };
}

describe('Animator', () => {
    it('klip listesini bos bırakıldığında oynatmaz', () => {
        const { animator } = createAnimator(0);
        expect(animator.playing).toBe(false);
        expect(animator.duration).toBe(0);
    });

    it('ilk klibi otomatik oynatir', () => {
        const { animator } = createAnimator();
        expect(animator.playing).toBe(true);
        expect(animator.index).toBe(0);
    });

    it('duraklat ve devam et durumu degistirir', () => {
        const { animator } = createAnimator();
        animator.pause();
        expect(animator.playing).toBe(false);
        animator.play();
        expect(animator.playing).toBe(true);
    });

    it('durdurma zamani sifirlar', () => {
        const { animator, mixer } = createAnimator();
        mixer.update(0.5);
        expect(animator.time).toBeGreaterThan(0);

        animator.stop();

        expect(animator.playing).toBe(false);
        expect(animator.time).toBe(0);
    });

    it('zaman atlamak oynatmayı durdurur', () => {
        const { animator } = createAnimator();

        animator.setTime(0.4);

        expect(animator.time).toBeCloseTo(0.4, 5);
        expect(animator.playing).toBe(false);
    });

    it('hız değerini sınırlar', () => {
        const { animator } = createAnimator();

        animator.setSpeed(10);
        expect(animator.speed).toBe(4);

        animator.setSpeed(0);
        expect(animator.speed).toBe(0.1);
    });

    it('klip değiştirme önceki eylemi durdurur', () => {
        const { animator, clips } = createAnimator(2);

        animator.select(1);

        expect(animator.clip).toBe(clips[1]);
        expect(animator.index).toBe(1);
        expect(animator.actions[1].enabled).toBe(true);
    });

    it('döngü kapalıyken klip sonunda durur', () => {
        const { animator } = createAnimator(1, 0.2);

        animator.setLoop(false);
        animator.update(0.5);

        expect(animator.playing).toBe(false);
    });
});
