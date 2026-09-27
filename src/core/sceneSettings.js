import * as THREE from 'three';

export const SCENE_DEFAULTS = {
    environmentIntensity: 1,
    background: '#0b0b0f',
    keyIntensity: 2.2,
    fillIntensity: 0.55,
    gridVisible: true,
    exposure: 1,
};

export function applySceneSettings(settings, target) {
    const { scene, renderer, lights, grid, environment } = target;

    scene.background = new THREE.Color(settings.background);
    if (environment?.texture) scene.environmentIntensity = settings.environmentIntensity;
    lights.key.intensity = settings.keyIntensity;
    lights.fill.intensity = settings.fillIntensity;
    renderer.toneMappingExposure = settings.exposure;
    grid.visible = settings.gridVisible;
}

export function snapshotSceneSettings(settings) {
    return { ...settings };
}
