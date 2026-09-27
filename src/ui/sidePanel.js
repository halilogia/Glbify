import { setDisabled, setHidden, setText, toggleClass } from '../utils/dom.js';
import { t } from '../i18n/index.js';
import { TEXTURE_SLOTS, describeMaterial, listMaterials } from '../io/materialEditor.js';

const PANELS = ['materials', 'scene', 'system'];

export function createSidePanel({ elements, onSelectMaterial, onPatchMaterial, onSceneChange, onRendererChange, onXR, onProfile }) {
    const {
        sidePanel,
        materialList,
        materialsEmpty,
        materialTabs,
        panels,
        rendererMode,
        rendererBackend,
        capWebgpu,
        capXr,
        capMemory,
        xrButton,
        xrHint,
        sceneInputs,
        profileInput,
        profileCopy,
        profileApply,
    } = elements;

    let entries = [];
    let activeIndex = 0;
    let textureOptions = [];

    for (const tab of materialTabs) {
        tab.addEventListener('click', () => {
            for (const other of materialTabs) other.classList.toggle('is-active', other === tab);
            for (const name of PANELS) setHidden(panels[name], name !== tab.dataset.panel);
        });
    }

    for (const [key, input] of Object.entries(sceneInputs)) {
        input.addEventListener('input', () => onSceneChange(key, key === 'gridToggle' ? input.checked : Number(input.value)));
    }

    rendererMode.addEventListener('change', () => onRendererChange(rendererMode.value));
    xrButton.addEventListener('click', () => onXR());
    profileCopy.addEventListener('click', () => onProfile({ action: 'copy' }));
    profileApply.addEventListener('click', () => onProfile({ action: 'apply', code: profileInput.value }));

    return {
        setVisible(visible) {
            toggleClass(sidePanel, 'hidden', !visible);
        },

        setMaterials(modelEntries) {
            entries = modelEntries;
            activeIndex = 0;
            render();
        },

        setTextureOptions(options) {
            textureOptions = options;
            render();
        },

        setCapabilities({ backend, capabilities }) {
            setText(rendererBackend, backend);
            setText(capWebgpu, capabilities.webgpu ? 'var' : `yok (${capabilities.webgpuReason})`);
            setText(capXr, capabilities.xr ? 'var' : 'yok');
            setText(capMemory, capabilities.deviceMemoryGB ? `${capabilities.deviceMemoryGB} GB` : 'bilinmiyor');
            setDisabled(rendererMode, !capabilities.webgpu && capabilities.webgpuReason.includes('desteklemiyor'));
            setText(xrHint, capabilities.xr ? '' : t('system.xrUnavailable'));
            setDisabled(xrButton, !capabilities.xr);
            rendererMode.value = backend === 'webgpu' ? 'webgpu' : 'webgl';
        },

        get activeMaterial() {
            return entries[activeIndex]?.material ?? null;
        },
    };

    function render() {
        materialList.replaceChildren();
        setHidden(materialsEmpty, entries.length > 0);

        entries.forEach((entry, index) => {
            const info = describeMaterial(entry);
            const card = document.createElement('div');
            card.className = `material-card${index === activeIndex ? ' is-active' : ''}`;

            const header = document.createElement('div');
            const name = document.createElement('div');
            name.className = 'material-name';
            name.textContent = info.name;
            const meta = document.createElement('div');
            meta.className = 'material-meta';
            meta.textContent = `${info.type} · ${info.meshCount} mesh · ${info.textures.length} doku`;
            header.append(name, meta);
            card.appendChild(header);

            card.addEventListener('click', () => {
                activeIndex = index;
                render();
                onSelectMaterial?.(entry);
            });

            const color = document.createElement('input');
            color.type = 'color';
            color.className = 'color-input';
            color.value = info.color;
            color.addEventListener('input', () => onPatchMaterial(entry.material, { color: color.value }, false));
            color.addEventListener('change', () => onPatchMaterial(entry.material, { color: color.value }, true));
            card.appendChild(color);

            for (const [key, label] of [
                ['roughness', t('scene.roughness')],
                ['metalness', t('scene.metalness')],
            ]) {
                const wrapper = document.createElement('label');
                wrapper.className = 'field';
                const caption = document.createElement('span');
                caption.textContent = `${label}: ${info[key]}`;
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.className = 'timeline';
                slider.min = '0';
                slider.max = '1';
                slider.step = '0.01';
                slider.value = String(info[key]);
                slider.addEventListener('input', () => {
                    caption.textContent = `${label}: ${Number(slider.value).toFixed(2)}`;
                    onPatchMaterial(entry.material, { values: { [key]: Number(slider.value) } }, false);
                });
                slider.addEventListener('change', () => {
                    onPatchMaterial(entry.material, { values: { [key]: Number(slider.value) } }, true);
                });
                wrapper.append(caption, slider);
                card.appendChild(wrapper);
            }

            for (const slot of TEXTURE_SLOTS) {
                const assigned = info.textures.find((texture) => texture.key === slot.key);
                const row = document.createElement('div');
                row.className = 'texture-slot';

                const caption = document.createElement('span');
                caption.textContent = slot.label;

                const select = document.createElement('select');
                const none = document.createElement('option');
                none.value = '';
                none.textContent = '— yok —';
                select.appendChild(none);

                for (const option of textureOptions) {
                    const node = document.createElement('option');
                    node.value = option.uuid;
                    node.textContent = option.label;
                    if (assigned && assigned.source === option.label) node.selected = true;
                    select.appendChild(node);
                }

                select.addEventListener('change', () => {
                    const chosen = textureOptions.find((option) => option.uuid === select.value);
                    onPatchMaterial(entry.material, { textureSlot: { key: slot.key, texture: chosen?.texture ?? null } }, true);
                    render();
                });

                row.append(caption, select);
                card.appendChild(row);
            }

            materialList.appendChild(card);
        });
    }
}

export { listMaterials };
