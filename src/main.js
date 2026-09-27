import './styles/main.css';
import { createDecoders } from './core/decoders.js';
import { Viewer } from './core/viewer.js';
import { MB, LIMITS, APP_VERSION } from './config.js';
import { downloadBlob } from './io/download.js';
import { exporters } from './io/exporters.js';
import { FileLimitError, readFile } from './io/fileReader.js';
import { ACCEPTED_EXTENSIONS, getImporter } from './io/importers.js';
import { prepareModel } from './io/materials.js';
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
    animBadge: $('#anim-badge'),
    animLabel: $('#anim-label'),
    netBadge: $('#net-badge'),
    updateBadge: $('#update-badge'),
    resetButton: $('#btn-reset'),
    exportProgress: $('#export-progress'),
    exportBar: $('#export-bar'),
    exportStatus: $('#export-status'),
    scaleSelect: $('#scale-selector'),
    textureSelect: $('#texture-selector'),
    dracoToggle: $('#draco-toggle'),
    dracoLevel: $('#draco-level'),
    dracoLevelField: $('#draco-level-field'),
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

        this.viewer = new Viewer(elements.container, {
            onContextLost: () => notify.error('Grafik bağlamı kayboldu. Sayfayı yenileyin.'),
        });
        this.decoders = createDecoders(this.viewer.renderer);

        this.hud = createHud(elements);
        this.dropZone = createDropZone({
            dropZone: elements.dropZone,
            fileInput: elements.fileInput,
            browseButton: elements.browseButton,
            onFiles: (files) => this.handleFile(files[0]),
            onReject: (message) => notify.warning(message),
        });
        this.exportPanel = createExportPanel({
            elements,
            settings: this.settings,
            onExport: (format) => this.handleExport(format),
        });

        elements.resetButton.addEventListener('click', () => this.reset());
        elements.container.addEventListener('dblclick', () => this.viewer.resetView());
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
                    action: {
                        label: 'Şimdi yenile',
                        onClick: () => window.location.reload(),
                    },
                });
            },
            onOfflineReady: () => notify.success('Çevrimdışı kullanıma hazır.'),
            onError: (error) => console.warn('Service worker kaydedilemedi:', error),
        });
    }

    async handleFile(file) {
        if (!file || this.busy) return;

        const extension = extensionOf(file.name);
        const importer = getImporter(extension);

        if (!importer) {
            notify.error(
                `".${extension || '?'}" formatı desteklenmiyor. Desteklenenler: ${ACCEPTED_EXTENSIONS.join(', ')}`,
            );
            return;
        }

        this.busy = true;
        this.hud.showDropZone(true);
        this.hud.setLoading(true, 'Dosya okunuyor', `${file.name} · ${formatBytes(file.size)}`);
        this.hud.setProgress(0);

        try {
            const limitBytes = this.exportPanel.getOptions().maxFileMB * MB;
            const buffer = await readFile(file, {
                limitBytes,
                onProgress: ({ ratio }) => this.hud.setProgress(ratio * 0.5),
            });

            this.hud.setProgress(0.55, 'Model ayrıştırılıyor', `${importer.label} · bu birkaç saniye sürebilir`);
            await nextFrame();

            const { object, animations } = await importer.parse(buffer, {
                extension,
                decoders: this.decoders,
                file,
            });

            this.hud.setProgress(0.85, 'Sahne hazırlanıyor', 'Materyaller ve ölçek hesaplanıyor');
            await nextFrame();

            prepareModel(object);
            const stats = computeStats(object);
            this.viewer.setModel(object);
            this.viewer.frameObject(object);
            const animationCount = this.viewer.playAnimations(animations);

            this.model = object;
            this.baseName = sanitizeBaseName(file.name);

            this.hud.setProgress(1);
            this.hud.setFileInfo(file, stats);
            this.hud.setAnimation(animationCount);
            this.hud.setLoading(false);
            this.hud.showDropZone(false);
            this.hud.showControls(true);
            this.exportPanel.setEnabled(true);

            this.warnAboutModel(file, stats, extension);
        } catch (error) {
            this.reset();
            this.hud.setLoading(false);
            const prefix = error instanceof FileLimitError ? 'Dosya limiti aşıldı' : 'Yükleme başarısız';
            notify.error(`${prefix}: ${error.message}`);
        } finally {
            this.busy = false;
        }
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

new GlbifyApp();
