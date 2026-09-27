import { setDisabled, setHidden, setText } from '../utils/dom.js';
import { setSettings } from '../utils/store.js';

export function createExportPanel({ elements, settings, onExport }) {
    const { scaleSelect, textureSelect, dracoToggle, dracoLevel, dracoLevelField, exportProgress, exportBar, exportStatus, limitSelect, buttons } = elements;
    const buttonList = Object.values(buttons);

    scaleSelect.value = settings.scale;
    textureSelect.value = settings.textureSize;
    dracoToggle.checked = settings.draco;
    dracoLevel.value = settings.dracoLevel;
    limitSelect.value = String(settings.maxFileMB);
    syncDracoLevel();

    for (const [format, button] of Object.entries(buttons)) {
        button.addEventListener('click', () => onExport(format));
    }

    const persist = () => setSettings(getOptions());

    scaleSelect.addEventListener('change', persist);
    textureSelect.addEventListener('change', persist);
    limitSelect.addEventListener('change', persist);
    dracoToggle.addEventListener('change', () => {
        syncDracoLevel();
        persist();
    });
    dracoLevel.addEventListener('change', persist);

    function syncDracoLevel() {
        setHidden(dracoLevelField, !dracoToggle.checked);
    }

    function getOptions() {
        return {
            scale: Number.parseFloat(scaleSelect.value) || 1,
            textureSize: Number.parseInt(textureSelect.value, 10) || 0,
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
