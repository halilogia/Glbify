import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export const TRANSFORM_MODES = ['translate', 'rotate', 'scale'];

export class TransformController {
    constructor({ camera, domElement, scene, orbitControls, onChange }) {
        this.orbitControls = orbitControls;
        this.onChange = onChange;
        this.target = null;
        this.unitScale = 1;

        this.proxy = new THREE.Object3D();
        this.proxy.name = 'glbify-transform';
        scene.add(this.proxy);

        this.gizmo = new TransformControls(camera, domElement);
        this.gizmo.addEventListener('mouseDown', () => {
            this.orbitControls.enabled = false;
        });
        this.gizmo.addEventListener('mouseUp', () => {
            this.orbitControls.enabled = true;
        });
        this.gizmo.addEventListener('objectChange', () => this.apply());

        this.helper = this.gizmo.getHelper();
        this.helper.visible = false;
        scene.add(this.helper);
    }

    get mode() {
        return this.gizmo.mode;
    }

    setTarget(object) {
        this.detach();
        this.target = object ?? null;
        this.resetTransform();
    }

    detach() {
        this.gizmo.detach();
        this.helper.visible = false;
    }

    setMode(mode) {
        if (TRANSFORM_MODES.includes(mode)) this.gizmo.setMode(mode);
    }

    setUnitScale(value) {
        this.unitScale = Number.isFinite(value) && value > 0 ? value : 1;
        this.apply();
    }

    setEnabled(enabled) {
        this.helper.visible = Boolean(enabled && this.target);
        if (enabled && this.target) this.gizmo.attach(this.proxy);
        else this.gizmo.detach();
    }

    resetTransform() {
        this.proxy.position.set(0, 0, 0);
        this.proxy.rotation.set(0, 0, 0);
        this.proxy.scale.set(1, 1, 1);
        this.proxy.updateMatrix();
        this.apply();
    }

    apply() {
        if (!this.target) return;
        this.target.position.copy(this.proxy.position);
        this.target.rotation.copy(this.proxy.rotation);
        this.target.scale.copy(this.proxy.scale).multiplyScalar(this.unitScale);
        this.target.updateMatrixWorld(true);
        this.onChange?.(this.snapshot());
    }

    snapshot() {
        return {
            position: this.proxy.position.toArray().map((value) => Number(value.toFixed(4))),
            rotationDegrees: [this.proxy.rotation.x, this.proxy.rotation.y, this.proxy.rotation.z].map((value) =>
                Number(THREE.MathUtils.radToDeg(value).toFixed(2)),
            ),
            scale: this.proxy.scale.toArray().map((value) => Number(value.toFixed(4))),
            unitScale: this.unitScale,
        };
    }
}
