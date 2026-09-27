import { readFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { installDomShims } from './domShim.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

installDomShims();

const GEOMETRY_LOADERS = {
    '.stl': (arrayBuffer) => new STLLoader().parse(arrayBuffer),
    '.ply': (arrayBuffer) => new PLYLoader().parse(arrayBuffer),
    '.obj': (arrayBuffer) => new OBJLoader().parse(new TextDecoder().decode(arrayBuffer)),
};

const GEOMETRY_EXPORTERS = {
    '.obj': (mesh) => new OBJExporter().parse(mesh),
    '.stl': (mesh) => new STLExporter().parse(mesh, { binary: true }),
};

const EXPORT_WARNING = 'Dokular bu formatta gomulu olmadigi icin disari aktarilmadi.';

export async function convert(input, output) {
    const sourceExtension = extname(input).toLowerCase();
    const targetExtension = extname(output).toLowerCase();

    if (!Object.keys(GEOMETRY_LOADERS).includes(sourceExtension) && !['.glb', '.gltf'].includes(sourceExtension)) {
        throw new Error(`Desteklenmeyen giris formati: ${sourceExtension}`);
    }

    const buffer = await readFile(input);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const { object, hasTextures } = await loadScene(sourceExtension, arrayBuffer);

    if (targetExtension === '.gltf') {
        const payload = await new GLTFExporter().parseAsync(object, { binary: false, embedImages: hasTextures });
        await writeFile(output, JSON.stringify(payload, null, 2));
        return { output, textures: hasTextures };
    }

    if (targetExtension === '.glb') {
        const payload = await new GLTFExporter().parseAsync(object, { binary: true, embedImages: hasTextures });
        await writeFile(output, Buffer.from(payload));
        return { output, textures: hasTextures };
    }

    const exporter = GEOMETRY_EXPORTERS[targetExtension];
    if (!exporter) throw new Error(`Desteklenmeyen cikis formati: ${targetExtension}`);

    const payload = exporter(object);
    await writeFile(output, payload);
    return { output, textures: false, warning: hasTextures ? EXPORT_WARNING : '' };
}

async function loadScene(extension, buffer) {
    if (Object.keys(GEOMETRY_LOADERS).includes(extension)) {
        const geometry = GEOMETRY_LOADERS[extension](buffer);
        return { object: geometry, hasTextures: false };
    }

    const document = await new GLTFLoader().parseAsync(buffer, '');
    const hasTextures = new Set();
    document.scene.traverse((child) => {
        if (!child.isMesh) return;
        const list = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of list) if (material?.map) hasTextures.add(material.map.uuid);
    });

    return { object: document.scene, hasTextures: hasTextures.size > 0 };
}

export { THREE };
