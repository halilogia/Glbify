import { setDisabled, setHidden, setText } from '../utils/dom.js';
import { setSettings } from '../utils/store.js';

const TEXTURE_FORMATS = ['original', 'png', 'jpeg', 'webp'];

export function createExportPanel({ elements, settings, onExport, onUnitScaleChange }) {
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
    limitSelect.value = String(settings.maxFileMB);
    syncQuality();
    syncDracoLevel();

    for (const [format, button] of Object.entries(buttons)) {
        button.addEventListener('click', () => onExport(format));
    }

    const persist = () => setSettings(getOptions());

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
    dracoToggle.addEventListener('change', () => {
        syncDracoLevel();
        persist();
    });
    dracoLevel.addEventListener('change', persist);

    function syncQuality() {
        const lossy = textureFormat.value === 'jpeg' || textureFormat.value === 'webp';
        setHidden(qualityField, !lossy);
        setText(qualityValue, Number(textureQuality.value).toFixed(2));
    }

    function syncDracoLevel() {
        setHidden(dracoLevelField, !dracoToggle.checked);
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
            maxFileMB: Number.parseInt(limitSelect.value, 10) || settings.maxFileMB,
        };
    }

    return {
        getOptions,

        setEnabled(enabled) {
            buttonList.forEach((button) => setDisabled(button, !enabled));
            setDisabled(scaleSelect, !enabled);
            setDisabled(textureSelect, !enabled);
            setDisabled(textureFormat, !enabled);
            setDisabled(textureQuality, !enabled);
            setDisabled(invertNormals, !enabled);
            setDisabled(generateNormals, !enabled);
            setDisabled(usdzQuickLook, !enabled);
            setDisabled(dracoToggle, !enabled);
            setDisabled(dracoLevel, !enabled);
        },

        setBusy(busy) {
            buttonList.forEach((button) => setDisabled(button, busy));
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
