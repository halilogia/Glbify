import { ACCEPTED_EXTENSIONS } from '../io/importers.js';
import { setHidden } from '../utils/dom.js';

const ACCEPT = ACCEPTED_EXTENSIONS.map((extension) => `.${extension}`).join(',');

export function createDropZone({ dropZone, fileInput, browseButton, onFiles, onReject }) {
    fileInput.setAttribute('accept', ACCEPT);

    let depth = 0;

    const activate = () => dropZone.classList.add('active');
    const deactivate = () => dropZone.classList.remove('active');

    const openPicker = () => fileInput.click();

    browseButton.addEventListener('click', openPicker);
    dropZone.addEventListener('click', (event) => {
        if (event.target.closest('button, select, option, a, label')) return;
        openPicker();
    });

    dropZone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
        }
    });

    fileInput.addEventListener('change', (event) => {
        const files = [...(event.target.files ?? [])];
        event.target.value = '';
        if (files.length) onFiles(files);
    });

    window.addEventListener('dragenter', (event) => {
        event.preventDefault();
        depth += 1;
        activate();
    });

    window.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        activate();
    });

    window.addEventListener('dragleave', (event) => {
        event.preventDefault();
        depth = Math.max(0, depth - 1);
        if (depth === 0) deactivate();
    });

    window.addEventListener('drop', (event) => {
        event.preventDefault();
        depth = 0;
        deactivate();
        const files = [...(event.dataTransfer?.files ?? [])];
        if (!files.length) return;
        if (files.length > 1) onReject?.('Aynı anda yalnızca bir dosya işlenebilir. İlk dosya yükleniyor.');
        onFiles([files[0]]);
    });

    return {
        setVisible(visible) {
            setHidden(dropZone, !visible);
        },
        reset() {
            deactivate();
        },
    };
}
