import { setDisabled, setHidden, setText } from '../utils/dom.js';
import { setSettings } from '../utils/store.js';

const TEXTURE_FORMATS = ['original', 'png', 'jpeg', 'webp'];
const MESHOPT_LEVELS = ['medium', 'high'];

export function createExportPanel({ elements, settings, onExport, onUnitScaleChange, onOptionsChange }) {
    const {
        scaleSelect,
        textureSelect,
        textureFormat,
        textureQuality,
        qualityValue,
        qualityField,
        invertNormals,
        generateNormals,
        usdzQuickLook,
        dracoToggle,
        dracoLevel,
        dracoLevelField,
        meshoptToggle,
        simplifyRatio,
        simplifyValue,
        weldToggle,
        ktx2Toggle,
        sizeEstimate,
        exportProgress,
        exportBar,
        exportStatus,
        limitSelect,
        buttons,
    } = elements;
    const buttonList = Object.values(buttons);

    scaleSelect.value = settings.scale;
    textureSelect.value = settings.textureSize;
    textureFormat.value = settings.textureFormat;
    textureQuality.value = String(settings.textureQuality);
    invertNormals.checked = settings.invertNormals;
    generateNormals.checked = settings.generateNormals;
    usdzQuickLook.checked = settings.usdzQuickLook;
    dracoToggle.checked = settings.draco;
    dracoLevel.value = settings.dracoLevel;
    meshoptToggle.checked = settings.meshopt;
    simplifyRatio.value = String(settings.simplifyRatio);
    weldToggle.checked = settings.weld;
    ktx2Toggle.checked = settings.ktx2;
    limitSelect.value = String(settings.maxFileMB);
    syncQuality();
    syncSimplify();
    syncCompression();

    for (const [format, button] of Object.entries(buttons)) {
        button.addEventListener('click', () => onExport(format));
    }

    const persist = () => {
        setSettings(getOptions());
        onOptionsChange?.(getOptions());
    };

    scaleSelect.addEventListener('change', () => {
        persist();
        onUnitScaleChange?.(getOptions().scale);
    });
    textureSelect.addEventListener('change', persist);
    limitSelect.addEventListener('change', persist);
    textureFormat.addEventListener('change', () => {
        syncQuality();
        persist();
    });
    textureQuality.addEventListener('input', () => {
        syncQuality();
        persist();
    });
    invertNormals.addEventListener('change', persist);
    generateNormals.addEventListener('change', persist);
    usdzQuickLook.addEventListener('change', persist);
    weldToggle.addEventListener('change', persist);
    ktx2Toggle.addEventListener('change', persist);
    meshoptToggle.addEventListener('change', () => {
        syncCompression();
        persist();
    });
    dracoToggle.addEventListener('change', () => {
        syncCompression();
        persist();
    });
    dracoLevel.addEventListener('change', persist);
    simplifyRatio.addEventListener('input', () => {
        syncSimplify();
        persist();
    });

    function syncQuality() {
        const lossy = textureFormat.value === 'jpeg' || textureFormat.value === 'webp';
        setHidden(qualityField, !lossy);
        setText(qualityValue, Number(textureQuality.value).toFixed(2));
    }

    function syncSimplify() {
        const ratio = Number(simplifyRatio.value) || 0;
        setText(
            simplifyValue,
            ratio > 0 ? `vertex %${Math.round(ratio * 100)}'ini koru` : 'Kapalı',
        );
    }

    function syncCompression() {
        setHidden(dracoLevelField, !dracoToggle.checked);
        const exclusive = meshoptToggle.checked && dracoToggle.checked;
        meshoptToggle.parentElement.classList.toggle('opacity-50', exclusive);
        if (exclusive) dracoToggle.checked = false;
    }

    function getOptions() {
        const format = TEXTURE_FORMATS.includes(textureFormat.value) ? textureFormat.value : 'original';
        return {
            scale: Number.parseFloat(scaleSelect.value) || 1,
            textureSize: Number.parseInt(textureSelect.value, 10) || 0,
            textureFormat: format,
            textureQuality: Number.parseFloat(textureQuality.value) || 0.92,
            invertNormals: invertNormals.checked,
            generateNormals: generateNormals.checked,
            usdzQuickLook: usdzQuickLook.checked,
            draco: dracoToggle.checked,
            dracoLevel: dracoLevel.value,
            meshopt: meshoptToggle.checked,
            meshoptLevel: MESHOPT_LEVELS.includes(settings.meshoptLevel) ? settings.meshoptLevel : 'high',
            simplifyRatio: Number(simplifyRatio.value) || 0,
            simplifyError: 0.001,
            weld: weldToggle.checked,
            ktx2: ktx2Toggle.checked,
            uastc: Boolean(settings.uastc),
            maxFileMB: Number.parseInt(limitSelect.value, 10) || settings.maxFileMB,
        };
    }

    return {
        getOptions,

        setEnabled(enabled) {
            buttonList.forEach((button) => setDisabled(button, !enabled));
            [
                scaleSelect,
                textureSelect,
                textureFormat,
                textureQuality,
                invertNormals,
                generateNormals,
                usdzQuickLook,
                dracoToggle,
                dracoLevel,
                meshoptToggle,
                simplifyRatio,
                weldToggle,
                ktx2Toggle,
            ].forEach((control) => setDisabled(control, !enabled));
        },

        setBusy(busy) {
            buttonList.forEach((button) => setDisabled(button, busy));
        },

        setEstimate(text) {
            setText(sizeEstimate, text);
        },

        showProgress(visible) {
            setHidden(exportProgress, !visible);
            if (visible) this.setProgress(0, 'Hazırlanıyor...');
        },

        setProgress(ratio, label) {
            const clamped = Math.max(0, Math.min(ratio ?? 0, 1));
            exportBar.style.width = `${(clamped * 100).toFixed(1)}%`;
            if (label) setText(exportStatus, label);
        },
    };
}
