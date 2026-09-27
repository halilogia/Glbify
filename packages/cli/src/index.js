import { readFile, writeFile, stat } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRDracoMeshCompression, EXTMeshoptCompression } from '@gltf-transform/extensions';
import {
    dedup,
    draco,
    meshopt,
    prune,
    quantize,
    reorder,
    simplify,
    weld,
} from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import { ktx2 } from 'ktx2-encoder/gltf-transform';

const GLTF_EXTENSIONS = new Set(['.glb', '.gltf']);

export async function createIO({ ktx = false } = {}) {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
        'meshopt.encoder': MeshoptEncoder,
    });

    if (ktx) {
        io.registerDependencies({
            'ktx2.encoder': (await import('ktx2-encoder')).BasisEncoder,
        });
    }

    return io;
}

export async function readModel(path) {
    if (!GLTF_EXTENSIONS.has(extname(path).toLowerCase())) {
        throw new Error(`Yalnizca GLB/glTF okunur (verilen: ${extname(path) || 'uzantisiz'}).`);
    }

    const bytes = new Uint8Array(await readFile(path));
    const io = await createIO({ ktx: true });
    const document = await io.readBinary(bytes);
    return { document, io, bytes };
}

export async function inspect(path) {
    const { document } = await readModel(path);
    const root = document.getRoot();

    const meshes = root.listMeshes();
    let vertices = 0;
    let triangles = 0;
    let primitives = 0;

    for (const mesh of meshes) {
        for (const primitive of mesh.listPrimitives()) {
            primitives += 1;
            const position = primitive.getAttribute('POSITION');
            if (position) vertices += position.getCount();
            const index = primitive.getIndices();
            if (index) triangles += Math.floor(index.getCount() / 3);
            else if (position) triangles += Math.floor(position.getCount() / 3);
        }
    }

    const { size } = await stat(path);
    const animations = root.listAnimations();

    return {
        file: basename(path),
        bytes: size,
        meshes: meshes.length,
        primitives,
        materials: root.listMaterials().length,
        textures: root.listTextures().length,
        animations: animations.map((animation) => ({ name: animation.getName(), duration: animation.getDuration() })),
        vertices,
        triangles,
        extensions: root.listExtensionsUsed().map((extension) => extension.extensionName),
        scene: root.getDefaultScene()?.getName() || 'default',
    };
}

export async function optimize(input, output, options = {}) {
    const {
        ratio = 0,
        error = 0.0001,
        weld: useWeld = true,
        draco: useDraco = false,
        dracoLevel = 'balanced',
        meshopt: useMeshopt = false,
        ktx2: useKtx2 = false,
        uastc = false,
    } = options;

    const { document, io } = await readModel(input);
    const transforms = [];

    if (useWeld) {
        transforms.push(
            weld(),
            dedup(),
            prune({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.MESH, PropertyType.NODE] }),
        );
    }

    if (ratio > 0) {
        await MeshoptSimplifier.ready;
        transforms.push(simplify({ simplifier: MeshoptSimplifier, ratio, error }));
    }

    if (useMeshopt) {
        await MeshoptEncoder.ready;
        const extension = document.createExtension(EXTMeshoptCompression);
        extension.setRequired(true);
        transforms.push(meshopt({ encoder: MeshoptEncoder, level: 'high' }));
    } else if (useDraco) {
        document.createExtension(KHRDracoMeshCompression).setRequired(true);
        transforms.push(draco({ method: 'edgebreaker', ...dracoBits(dracoLevel) }));
    } else {
        transforms.push(reorder(), quantize());
    }

    await document.transform(...transforms);

    if (useKtx2) {
        const extension = document.createExtension((await import('@gltf-transform/extensions')).KHRTextureBasisu);
        extension.setRequired(true);
        await document.transform(ktx2({ isUASTC: uastc, generateMipmap: true }));
    }

    const payload = await io.writeBinary(document);
    await writeFile(resolve(output), payload);

    const { size: before } = await stat(input);
    return {
        output: basename(output),
        before,
        after: payload.byteLength,
        saved: before - payload.byteLength,
    };
}

function dracoBits(level) {
    if (level === 'max') return { quantizePosition: 11, quantizeNormal: 8, quantizeTexcoord: 10, quantizeColor: 8 };
    if (level === 'high') return { quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 14, quantizeColor: 8 };
    return { quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12, quantizeColor: 8 };
}
