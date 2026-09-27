import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { disposeObject3D } from '../utils/dispose.js';

export class Viewer {
    constructor(container, { onContextLost } = {}) {
        this.container = container;
        this.onContextLost = onContextLost;
        this.model = null;
        this.mixer = null;
        this.lastFrameTime = performance.now();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000000);
        this.camera.position.set(3, 3, 6);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        this.renderer.domElement.style.display = 'block';
        container.appendChild(this.renderer.domElement);

        this.pmrem = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

        this.ambient = new THREE.AmbientLight(0xffffff, 0.55);
        this.directional = new THREE.DirectionalLight(0xffffff, 2.2);
        this.directional.position.set(5, 10, 7);
        this.scene.add(this.ambient, this.directional);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.maxPolarAngle = Math.PI * 0.98;

        this.grid = new THREE.GridHelper(100, 100, 0x333333, 0x111111);
        this.grid.material.transparent = true;
        this.grid.material.opacity = 0.6;
        this.scene.add(this.grid);

        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(container);

        this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            this.onContextLost?.();
        });

        this.resize();
        this.renderer.setAnimationLoop(() => this.render());
    }

    resize() {
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        this.camera.aspect = width / Math.max(height, 1);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
    }

    render() {
        const now = performance.now();
        const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = now;
        if (this.mixer) this.mixer.update(delta);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    setModel(object) {
        this.clearModel();
        if (!object) return;
        this.model = object;
        this.scene.add(object);
    }

    clearModel() {
        this.stopAnimations();
        if (this.model) {
            disposeObject3D(this.model);
            this.model = null;
        }
    }

    playAnimations(clips) {
        this.stopAnimations();
        if (!this.model || !clips?.length) return 0;
        this.mixer = new THREE.AnimationMixer(this.model);
        for (const clip of clips) this.mixer.clipAction(clip).play();
        return clips.length;
    }

    stopAnimations() {
        if (!this.mixer) return;
        this.mixer.stopAllAction();
        this.mixer.uncacheRoot(this.mixer.getRoot());
        this.mixer = null;
    }

    frameObject(object) {
        const box = new THREE.Box3().setFromObject(object);
        if (box.isEmpty()) box.set(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));

        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        object.updateMatrixWorld(true);

        const radius = Math.max(size.length() * 0.5, 0.01);
        const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
        const horizontalFov = 2 * Math.atan(Math.tan(verticalFov * 0.5) * this.camera.aspect);
        const distance = (radius / Math.sin(Math.min(verticalFov, horizontalFov) * 0.5)) * 1.25;

        this.controls.minDistance = radius * 0.05;
        this.controls.maxDistance = distance * 20;
        this.camera.near = Math.max(distance / 5000, 0.0001);
        this.camera.far = distance * 100;
        this.camera.updateProjectionMatrix();

        this.camera.position.set(distance * 0.9, distance * 0.55, distance * 0.9);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        this.grid.position.y = box.min.y - center.y - radius * 0.04;
        this.grid.scale.setScalar(Math.max((radius * 12) / 100, 0.01));
        this.grid.visible = true;

        return { box, size, center, radius, distance };
    }

    resetView() {
        if (this.model) this.frameObject(this.model);
    }
}
