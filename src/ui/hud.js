import { t } from '../i18n/index.js';
import { setHidden, setText, toggleClass } from '../utils/dom.js';
import { formatBytes, formatCount, formatDimensions } from '../utils/format.js';

export function createHud(elements) {
    const {
        fileInfo,
        filename,
        meshes,
        vertices,
        triangles,
        debug,
        auditButton,
        animBadge,
        animLabel,
        netBadge,
        updateBadge,
    } = elements;

    return {
        showDropZone(visible) {
            setHidden(elements.dropZone, !visible);
        },

        showControls(visible) {
            toggleClass(elements.controls, 'is-visible', visible);
            elements.controls.setAttribute('aria-hidden', String(!visible));
        },

        setLoading(visible, label = '', hint = '') {
            setHidden(elements.dropContent, visible);
            setHidden(elements.loadingContent, !visible);
            if (label) setText(elements.loadingLabel, label);
            setText(elements.loadingHint, hint);
        },

        setProgress(ratio, label) {
            const clamped = Math.max(0, Math.min(ratio, 1));
            elements.loadingBar.style.width = `${(clamped * 100).toFixed(1)}%`;
            if (label) setText(elements.loadingLabel, label);
            setText(elements.loadingPercent, `${Math.round(clamped * 100)}%`);
        },

        setFileInfo(file, stats) {
            setHidden(fileInfo, false);
            setText(filename, file.name);
            setText(meshes, formatCount(stats.meshes));
            setText(vertices, formatCount(stats.vertices));
            setText(triangles, formatCount(stats.triangles));

            const parts = [
                formatBytes(file.size),
                formatDimensions(stats.size),
                stats.bones ? `${stats.bones} kemik` : null,
                stats.morphTargets ? `${stats.morphTargets} morph` : null,
            ].filter(Boolean);
            setText(debug, parts.join('  |  '));
        },

        setAudit(report) {
            const issues = report?.issues?.length ?? 0;
            toggleClass(auditButton, 'hidden', issues === 0);
            if (issues) setText(auditButton, t('model.audit', { count: issues }));
        },

        setAnimation(count) {
            const active = count > 0;
            toggleClass(animBadge, 'hidden', !active);
            if (active) {
                setText(animLabel, count === 1 ? t('model.animation') : t('model.animations', { count }));
            }
        },

        setOffline(offline) {
            toggleClass(netBadge, 'hidden', !offline);
        },

        setUpdateAvailable(available) {
            toggleClass(updateBadge, 'hidden', !available);
        },

        clearFileInfo() {
            setHidden(fileInfo, true);
            setText(filename, '');
            setText(debug, '');
            setHidden(animBadge, true);
            toggleClass(auditButton, 'hidden', true);
        },
    };
}
