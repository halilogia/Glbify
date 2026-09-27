import './styles/main.css';
import { Animator } from './core/animator.js';
import { createDecoders } from './core/decoders.js';
import { TransformController } from './core/transformController.js';
import { Viewer } from './core/viewer.js';
import { APP_VERSION, LIMITS, MB } from './config.js';
import { downloadBlob } from './io/download.js';
import { exporters } from './io/exporters.js';
import { EmptyFileError, FileLimitError, readFile } from './io/fileReader.js';
import { ACCEPTED_EXTENSIONS, getImporter } from './io/importers.js';
import { applyMtlLibrary, auditColorSpaces, prepareModel } from './io/materials.js';
import { computeStats } from './io/modelStats.js';
import { registerServiceWorker, watchConnection } from './pwa/serviceWorker.js';
import { createDropZone } from './ui/dropzone.js';
import { createExportPanel } from './ui/exportPanel.js';
import { createHud } from './ui/hud.js';
import { notify, toast } from './ui/toast.js';
import { $, nextFrame, setText } from './utils/dom.js';
import { extensionOf, formatBytes, sanitizeBaseName } from './utils/format.js';
import { getSettings } from './utils/store.js';

const elements = {
    container: $('#canvas-container'),
    dropZone: $('#drop-zone'),
    dropContent: $('#drop-content'),
    loadingContent: $('#loading-content'),
    loadingLabel: $('#loading-label'),
    loadingHint: $('#loading-hint'),
    loadingBar: $('#loading-bar'),
    loadingPercent: $('#loading-percent'),
    fileInput: $('#file-input'),
    browseButton: $('#btn-browse'),
    limitSelect: $('#limit-select'),
    controls: $('#controls'),
    fileInfo: $('#file-info'),
    filename: $('#filename-display'),
    meshes: $('#stat-meshes'),
    vertices: $('#stat-vertices'),
    triangles: $('#stat-triangles'),
    debug: $('#debug-info'),
    auditButton: $('#btn-audit'),
    animBadge: $('#anim-badge'),
    animLabel: $('#anim-label'),
    animPanel: $('#animation-panel'),
    clipSelector: $('#clip-selector'),
    clipCount: $('#clip-count'),
    animPlay: $('#btn-anim-play'),
    animStop: $('#btn-anim-stop'),
    animTimeline: $('#anim-timeline'),
    animTime: $('#anim-time'),
    animSpeed: $('#anim-speed'),
    animLoop: $('#anim-loop'),
    netBadge: $('#net-badge'),
    updateBadge: $('#update-badge'),
    resetButton: $('#btn-reset'),
    frameButton: $('#btn-frame'),
    transformReset: $('#btn-transform-reset'),
    transformReadout: $('#transform-readout'),
    exportProgress: $('#export-progress'),
    exportBar: $('#export-bar'),
    exportStatus: $('#export-status'),
    scaleSelect: $('#scale-selector'),
    textureSelect: $('#texture-selector'),
    dracoToggle: $('#draco-toggle'),
    dracoLevel: $('#draco-level'),
    dracoLevelField: $('#draco-level-field'),
    textureFormat: $('#texture-format'),
    textureQuality: $('#texture-quality'),
    qualityValue: $('#quality-value'),
    qualityField: $('#quality-field'),
    invertNormals: $('#invert-normals'),
    generateNormals: $('#generate-normals'),
    usdzQuickLook: $('#usdz-quicklook'),
    buttons: {
        glb: $('#btn-export-glb'),
        usdz: $('#btn-export-usdz'),
        stl: $('#btn-export-stl'),
        obj: $('#btn-export-obj'),
    },
};

class GlbifyApp {
    constructor() {
        this.settings = getSettings();
        this.model = null;
        this.baseName = 'model';
        this.busy = false;
        this.animator = null;
        this.audit = null;
        this.mtlLibrary = null;

        this.viewer = new Viewer(elements.container, {
            onContextLost: () => notify.error('Grafik bağlamı kayboldu. Sayfayı yenileyin.'),
        });
        this.decoders = createDecoders(this.viewer.renderer);
        this.transform = new TransformController({
            camera: this.viewer.camera,
            domElement: this.viewer.renderer.domElement,
            scene: this.viewer.scene,
            orbitControls: this.viewer.controls,
            onChange: (snapshot) => this.renderTransformReadout(snapshot),
        });

        this.hud = createHud(elements);
        this.dropZone = createDropZone({
            dropZone: elements.dropZone,
            fileInput: elements.fileInput,
            browseButton: elements.browseButton,
            onFiles: (files) => this.handleFiles(files),
            onReject: (message) => notify.warning(message),
        });
        this.exportPanel = createExportPanel({
            elements,
            settings: this.settings,
            onExport: (format) => this.handleExport(format),
            onUnitScaleChange: (scale) => {
                this.transform.setUnitScale(scale);
                this.viewer.fitCamera(this.model ?? this.transform.proxy);
            },
        });

        this.bindTransformTools();
        this.bindAnimationTools();

        elements.resetButton.addEventListener('click', () => this.reset());
        elements.container.addEventListener('dblclick', () => this.viewer.resetView());
        elements.auditButton.addEventListener('click', () => this.showAuditReport());
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.model) this.reset();
        });

        setText($('#app-version'), APP_VERSION);

        watchConnection({ onChange: (offline) => this.hud.setOffline(offline) });
        this.setupServiceWorker();
        this.reset();
    }

    setupServiceWorker() {
        registerServiceWorker({
            onUpdate: () => {
                this.hud.setUpdateAvailable(true);
                toast('Yeni sürüm indirildi.', {
                    type: 'info',
                    timeout: 0,
                    action: { label: 'Şimdi yenile', onClick: () => window.location.reload() },
                });
            },
            onOfflineReady: () => notify.success('Çevrimdışı kullanıma hazır.'),
            onError: (error) => console.warn('Service worker kaydedilemedi:', error),
        });
    }

    bindTransformTools() {
        for (const button of document.querySelectorAll('[data-transform]')) {
            button.addEventListener('click', () => {
                const mode = button.dataset.transform;
                this.transform.setMode(mode);
                document
                    .querySelectorAll('[data-transform]')
                    .forEach((entry) => entry.classList.toggle('is-active', entry === button));
                setText(elements.transformReadout, modeLabel(mode));
            });
        }

        elements.frameButton.addEventListener('click', () => this.viewer.resetView());
        elements.transformReset.addEventListener('click', () => {
            this.transform.resetTransform();
            this.viewer.resetView();
        });
    }

    bindAnimationTools() {
        elements.clipSelector.addEventListener('change', () => {
            this.animator?.select(Number(elements.clipSelector.value));
        });
        elements.animPlay.addEventListener('click', () => this.animator?.toggle());
        elements.animStop.addEventListener('click', () => this.animator?.stop());
        elements.animTimeline.addEventListener('input', () => {
            this.animator?.setTime(Number(elements.animTimeline.value));
        });
        elements.animSpeed.addEventListener('change', () => this.animator?.setSpeed(elements.animSpeed.value));
        elements.animLoop.addEventListener('change', () => this.animator?.setLoop(elements.animLoop.checked));
    }

    renderTransformReadout(snapshot) {
        setText(elements.transformReadout, `${modeLabel(this.transform.mode)} · ${snapshot.position.join(', ')}`);
        this.viewer.updateGround();
    }

    async handleFiles(files) {
        const [primary, ...rest] = files;
        if (!primary) return;

        const extension = extensionOf(primary.name);
        const importer = getImporter(extension);

        if (!importer) {
            notify.error(
                `".${extension || '?'}" formatı desteklenmiyor. Desteklenenler: ${ACCEPTED_EXTENSIONS.join(', ')}`,
            );
            return;
        }

        if (importer.standalone) return this.applyStandaloneMtl(primary, rest);

        if (this.busy) return;
        this.busy = true;
        this.hud.showDropZone(true);
        this.hud.setLoading(true, 'Dosya okunuyor', `${primary.name} · ${formatBytes(primary.size)}`);
        this.hud.setProgress(0);

        try {
            const limitBytes = this.exportPanel.getOptions().maxFileMB * MB;
            const buffer = await readFile(primary, {
                limitBytes,
                onProgress: ({ ratio }) => this.hud.setProgress(ratio * 0.5),
            });

            this.hud.setProgress(0.55, 'Model ayrıştırılıyor', `${importer.label} · bu birkaç saniye sürebilir`);
            await nextFrame();

            const result = await importer.parse(buffer, {
                extension,
                decoders: this.decoders,
                files: [primary, ...rest],
            });

            this.hud.setProgress(0.85, 'Sahne hazırlanıyor', 'Materyaller ve ölçek hesaplanıyor');
            await nextFrame();

            result.notes?.forEach((note) => notify.info(note));

            if (!result.object) throw new Error('Model içeriği bulunamadı.');

            prepareModel(result.object);
            this.audit = auditColorSpaces(result.object);
            const stats = computeStats(result.object);
            const unitScale = this.exportPanel.getOptions().scale;

            this.viewer.setModel(result.object);
            this.viewer.centerObject(result.object);
            this.viewer.fitCamera(result.object);
            this.viewer.updateGround();

            this.model = result.object;
            this.baseName = sanitizeBaseName(primary.name);

            this.transform.setUnitScale(unitScale);
            this.transform.setTarget(result.object);
            this.transform.setEnabled(true);

            this.setupAnimation(result.animations ?? []);

            this.hud.setProgress(1);
            this.hud.setFileInfo(primary, stats);
            this.hud.setAudit(this.audit);
            this.hud.setLoading(false);
            this.hud.showDropZone(false);
            this.hud.showControls(true);
            this.exportPanel.setEnabled(true);

            this.warnAboutModel(primary, stats, extension);
        } catch (error) {
            if (!(error instanceof FileLimitError) && !(error instanceof EmptyFileError)) console.error(error);
            this.reset();
            this.hud.setLoading(false);
            const prefix =
                error instanceof FileLimitError
                    ? 'Dosya limiti aşıldı'
                    : error instanceof EmptyFileError
                      ? 'Dosya boş'
                      : 'Yükleme başarısız';
            notify.error(`${prefix}: ${error.message}`);
        } finally {
            this.busy = false;
        }
    }

    async applyStandaloneMtl(file, siblings) {
        if (!this.model) {
            notify.warning('MTL dosyası için önce OBJ modeli yükleyin.');
            return;
        }

        try {
            const importer = getImporter('mtl');
            const result = await importer.parse(await file.arrayBuffer(), {
                files: [file, ...siblings],
            });
            const applied = applyMtlLibrary(this.model, result.materials);
            if (!applied) {
                notify.warning('MTL eşleşen materyal bulunamadı. OBJ dosyasında "usemtl" adları eşleşmiyor.');
                return;
            }
            prepareModel(this.model);
            this.audit = auditColorSpaces(this.model);
            this.hud.setAudit(this.audit);
            notify.success(`MTL uygulandı: ${applied} mesh · ${result.notes[0] ?? ''}`);
        } catch (error) {
            notify.error(`MTL uygulanamadı: ${error.message}`);
        }
    }

    setupAnimation(clips) {
        this.animator = null;
        this.viewer.animator = null;
        elements.animPanel.classList.add('hidden');
        this.hud.setAnimation(0);

        if (!clips.length) return;

        const animator = new Animator(this.viewer.createMixer(), clips);
        animator.onChange = (state) => this.renderAnimation(state);
        this.animator = animator;
        this.viewer.animator = animator;

        elements.clipSelector.replaceChildren(
            ...clips.map((clip, index) => {
                const option = document.createElement('option');
                option.value = String(index);
                option.textContent = clip.name || `Animasyon ${index + 1}`;
                return option;
            }),
        );
        elements.animSpeed.value = '1';
        elements.animLoop.checked = true;
        setText(elements.clipCount, `${clips.length} klip`);
        elements.animPanel.classList.remove('hidden');
        this.hud.setAnimation(clips.length);
        this.renderAnimation({ playing: animator.playing, time: 0, duration: animator.duration });
    }

    renderAnimation({ playing, time, duration }) {
        elements.animPlay.classList.toggle('is-playing', Boolean(playing));
        elements.animPlay.title = playing ? 'Duraklat' : 'Oynat';
        if (Number(elements.animTimeline.max) !== duration) elements.animTimeline.max = String(duration || 1);
        elements.animTimeline.value = String(time ?? 0);
        setText(elements.animTime, `${(time ?? 0).toFixed(2)}s / ${(duration ?? 0).toFixed(2)}s`);
    }

    warnAboutModel(file, stats, extension) {
        const options = this.exportPanel.getOptions();
        const warnBytes = Math.min(options.maxFileMB * MB * 0.5, LIMITS.warnMB * MB);

        if (file.size > warnBytes) {
            notify.warning(
                `Büyük dosya uyarısı: ${formatBytes(file.size)}. Mobil cihazlarda sekmeyi kapatmayı düşünün.`,
            );
        }

        if (extension === 'gltf') {
            notify.warning('.gltf dış kaynakları (bin/doku) tarayıcıdan okunamaz. GLB olarak dışa aktarın.');
        }

        if (stats.hasUnindexedGeometry) {
            notify.warning('Modelde indekslenmemiş geometri var. GLB/DRACO çıktısı daha büyük olabilir.');
        }

        if (stats.triangles > 2_000_000) {
            notify.warning(`${stats.triangles.toLocaleString('tr-TR')} üçgen: düşük cihazlarda FPS düşebilir.`);
        }
    }

    showAuditReport() {
        if (!this.audit) return;
        const { textures, issues } = this.audit;
        if (!issues.length) {
            notify.info(`Doku denetimi temiz: ${textures} doku, uyarı yok.`);
            return;
        }
        notify.warning(`Doku denetimi: ${issues.length} uyarı\n${issues.slice(0, 4).join('\n')}`, { timeout: 12_000 });
    }

    async handleExport(format) {
        if (!this.model || this.busy) return;
        const exporter = exporters[format];
        if (!exporter) return;

        this.busy = true;
        this.exportPanel.setBusy(true);
        this.exportPanel.showProgress(true);
        await nextFrame();

        const options = this.exportPanel.getOptions();

        try {
            const output = await exporter.run({
                model: this.model,
                baseName: this.baseName,
                scale: options.scale,
                options,
                onProgress: ({ ratio, label }) => this.exportPanel.setProgress(ratio, label),
            });

            downloadBlob(output.blob, output.fileName);
            notify.success(this.describeExport(format, output, options.draco));
            output.report?.length && notify.info(output.report.join(' · '));
            output.warnings?.forEach((warning) => notify.warning(warning));
        } catch (error) {
            console.error(error);
            notify.error(`${exporter.label} dışa aktarılamadı: ${error.message}`);
        } finally {
            this.busy = false;
            this.exportPanel.setBusy(false);
            setTimeout(() => this.exportPanel.showProgress(false), 1500);
        }
    }

    describeExport(format, output, draco) {
        const compressed = draco && format === 'glb' && output.uncompressedSize > output.size;
        const saved = compressed ? Math.round((1 - output.size / output.uncompressedSize) * 100) : 0;
        const suffix = saved > 0 ? ` · DRACO ile %${saved} küçüldü` : '';
        return `${output.fileName} indirildi (${formatBytes(output.size)})${suffix}`;
    }

    reset() {
        this.viewer.clearModel();
        this.transform.setTarget(null);
        this.animator = null;
        this.audit = null;
        this.model = null;
        this.baseName = 'model';

        this.hud.clearFileInfo();
        this.hud.setLoading(false);
        this.hud.setProgress(0);
        this.hud.showDropZone(true);
        this.hud.showControls(false);
        this.exportPanel.setEnabled(false);
        this.exportPanel.showProgress(false);
        this.dropZone.reset();
    }
}

function modeLabel(mode) {
    return { translate: 'Hareket', rotate: 'Döndür', scale: 'Ölçek' }[mode] ?? 'Hareket';
}

globalThis.__glbify = new GlbifyApp();
