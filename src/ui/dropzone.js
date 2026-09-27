import { ACCEPTED_EXTENSIONS } from '../io/importers.js';
import { setHidden } from '../utils/dom.js';

const AUXILIARY_EXTENSIONS = ['mtl', 'png', 'jpg', 'jpeg', 'webp', 'tga', 'bmp', 'gif'];
const MODEL_EXTENSIONS = ACCEPTED_EXTENSIONS.filter((extension) => !AUXILIARY_EXTENSIONS.includes(extension));
const ACCEPT = [...new Set([...ACCEPTED_EXTENSIONS, ...AUXILIARY_EXTENSIONS])].map((ext) => `.${ext}`).join(',');

const isModel = (file) => MODEL_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase() ?? '');

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

    const submit = (files) => {
        const models = files.filter(isModel);
        if (!models.length) {
            onReject?.('Model dosyası bulunamadı. Desteklenenler: ' + ACCEPTED_EXTENSIONS.join(', '));
            return;
        }
        if (models.length > 1) onReject?.('Aynı anda tek model işlenebilir. İlk dosya yükleniyor.');
        onFiles([models[0], ...files.filter((file) => file !== models[0])]);
    };

    fileInput.addEventListener('change', (event) => {
        const files = [...(event.target.files ?? [])];
        event.target.value = '';
        if (files.length) submit(files);
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
        if (files.length) submit(files);
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
