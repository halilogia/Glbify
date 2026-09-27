import * as gltf from '@gltf-transform/core';
import { ASSETS, DRACO_LEVELS, PRUNE_PROPERTY_TYPES, TEXTURE_MIME } from '../config.js';
import { bytesToImageData, deriveNormalMap, imageDataToBytes, invertNormalGreen } from './textureOps.js';

let pipelinePromise = null;

function loadPipeline() {
    pipelinePromise ??= (async () => {
        const [extensions, functions, meshopt, ktx2] = await Promise.all([
            import('@gltf-transform/extensions'),
            import('@gltf-transform/functions'),
            import('meshoptimizer'),
            import('ktx2-encoder/gltf-transform'),
        ]);

        return {
            NodeIO: gltf.NodeIO,
            ALL_EXTENSIONS: extensions.ALL_EXTENSIONS,
            KHRTextureBasisu: extensions.KHRTextureBasisu,
            EXTMeshoptCompression: extensions.EXTMeshoptCompression,
            draco: functions.draco,
            meshopt: functions.meshopt,
            weld: functions.weld,
            dedup: functions.dedup,
            prune: functions.prune,
            simplify: functions.simplify,
            encoder: meshopt.MeshoptEncoder,
            ktx2: ktx2.ktx2,
        };
    })();

    return pipelinePromise;
}

async function getDracoEncoder() {
    const script = ASSETS.dracoEncoderScript;

    if (typeof globalThis.DracoEncoderModule !== 'function') {
        await new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${script}"]`);
            if (existing) {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', () => reject(new Error('Draco encoder betiği yüklenemedi.')), {
                    once: true,
                });
                return;
            }
            const element = document.createElement('script');
            element.src = script;
            element.async = true;
            element.addEventListener('load', resolve, { once: true });
            element.addEventListener('error', () => reject(new Error('Draco encoder betiği yüklenemedi.')), {
                once: true,
            });
            document.head.appendChild(element);
        });
    }

    const factory = globalThis.DracoEncoderModule;
    if (typeof factory !== 'function') throw new Error('Draco encoder bulunamadı.');
    return factory({ locateFile: () => ASSETS.dracoEncoderWasm });
}

const COLOR_SLOTS = ['baseColor', 'emissive'];

function collectTextureRoles(document) {
    const roles = new Map();
    const register = (texture, role) => {
        if (!texture) return;
        const existing = roles.get(texture) ?? new Set();
        existing.add(role);
        roles.set(texture, existing);
    };

    for (const material of document.getRoot().listMaterials()) {
        register(material.getBaseColorTexture(), 'baseColor');
        register(material.getEmissiveTexture(), 'emissive');
        register(material.getNormalTexture(), 'normal');
        register(material.getMetallicRoughnessTexture(), 'metallicRoughness');
        register(material.getOcclusionTexture(), 'occlusion');
    }

    return roles;
}

async function processTextures(document, options, report) {
    const { textureFormat, textureQuality, invertNormals, generateNormals } = options;
    const needsFormat = textureFormat && textureFormat !== 'original';
    if (!needsFormat && !invertNormals && !generateNormals) return;

    const textures = document.getRoot().listTextures();
    if (!textures.length) {
        report.push('Doku bulunamadı, doku işlemleri atlandı.');
        return;
    }

    const roles = collectTextureRoles(document);
    let handled = 0;
    let skippedLossy = 0;

    for (const texture of textures) {
        const roleSet = roles.get(texture);
        const isNormal = roleSet?.has('normal');
        const isColor = [...(roleSet ?? [])].some((role) => COLOR_SLOTS.includes(role));
        const targetMime = TEXTURE_MIME[textureFormat] ?? null;
        const originalMime = texture.getMimeType();
        const image = texture.getImage();
        if (!image?.length) continue;

        if (originalMime === 'image/ktx2') continue;

        try {
            if (isNormal && invertNormals) {
                const data = await bytesToImageData(image, originalMime);
                const encoded = await imageDataToBytes(invertNormalGreen(data), 'image/png');
                texture.setImage(encoded);
                texture.setMimeType('image/png');
                handled += 1;
                continue;
            }

            if (isColor && needsFormat && targetMime) {
                const data = await bytesToImageData(image, originalMime);
                const encoded = await imageDataToBytes(data, targetMime, textureQuality);
                texture.setImage(encoded);
                texture.setMimeType(targetMime);
                handled += 1;
                continue;
            }

            if (isNormal && needsFormat && targetMime && targetMime !== 'image/png') skippedLossy += 1;
        } catch (error) {
            report.push(`Doku işlenemedi (${texture.getName() || 'isimsiz'}): ${error.message}`);
        }
    }

    if (generateNormals) await attachGeneratedNormals(document, report);
    if (handled) report.push(`${handled} doku işlendi.`);
    if (skippedLossy) report.push(`${skippedLossy} normal map kayıpsız kalmak için PNG olarak korundu.`);
}

async function attachGeneratedNormals(document, report) {
    const cache = new Map();
    let count = 0;

    for (const material of document.getRoot().listMaterials()) {
        const baseColor = material.getBaseColorTexture();
        if (!baseColor || material.getNormalTexture()) continue;

        try {
            let normal = cache.get(baseColor);
            if (!normal) {
                const image = baseColor.getImage();
                if (!image?.length) continue;
                const data = await bytesToImageData(image, baseColor.getMimeType());
                normal = document.createTexture(`${baseColor.getName() || 'basecolor'}-normal`);
                normal.setMimeType('image/png');
                normal.setImage(await imageDataToBytes(deriveNormalMap(data), 'image/png'));
                cache.set(baseColor, normal);
            }
            material.setNormalTexture(normal);
            count += 1;
        } catch (error) {
            report.push(`Normal haritası üretilemedi: ${error.message}`);
        }
    }

    if (count) report.push(`${count} materyal için normal haritası üretildi.`);
}

async function optimizeGeometry(document, pipeline, options, report, onProgress) {
    const { weld, dedup, prune, simplify } = pipeline;
    const { simplifyRatio, simplifyError, weld: useWeld } = options;

    if (useWeld) {
        await document.transform(
            weld(),
            dedup(),
            prune({ propertyTypes: PRUNE_PROPERTY_TYPES.map((type) => gltf.PropertyType[type]) }),
        );
    }

    if (simplifyRatio > 0) {
        onProgress?.({ ratio: 0.7, label: 'Mesh sadeleştiriliyor...' });
        const { MeshoptSimplifier } = await import('three/addons/libs/meshopt_simplifier.module.js');
        await MeshoptSimplifier.ready;
        await document.transform(simplify({ simplifier: MeshoptSimplifier, ratio: simplifyRatio, error: simplifyError }));
        report.push(`Mesh sadeleştirme: hedef %${Math.round(simplifyRatio * 100)} vertex.`);
    }
}

async function compressTexturesToKtx2(document, pipeline, options, report, onProgress) {
    onProgress?.({ ratio: 0.85, label: 'KTX2 (Basis) dokular hazırlanıyor...' });
    document.createExtension(pipeline.KHRTextureBasisu).setRequired(true);
    await document.transform(
        pipeline.ktx2({ isUASTC: Boolean(options.uastc), generateMipmap: true, enableDebug: false }),
    );
    report.push(options.uastc ? 'KTX2 UASTC (kaliteli) dokular yazıldı.' : 'KTX2 ETC1S (küçük) dokular yazıldı.');
}

export async function postProcessGlb(buffer, options, onProgress) {
    const { draco, dracoLevel } = options;
    const needsTextureWork =
        (options.textureFormat && options.textureFormat !== 'original') ||
        options.invertNormals ||
        options.generateNormals;
    const needsGeometryWork = options.weld || options.simplifyRatio > 0 || options.meshopt;
    const needsKtx2 = Boolean(options.ktx2);

    if (!draco && !needsTextureWork && !needsGeometryWork && !needsKtx2) {
        return { buffer, report: [] };
    }

    const pipeline = await loadPipeline();
    const { NodeIO, ALL_EXTENSIONS } = pipeline;
    const report = [];

    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    if (draco) io.registerDependencies({ 'draco3d.encoder': await getDracoEncoder() });
    if (options.meshopt) io.registerDependencies({ 'meshopt.encoder': pipeline.encoder });

    const document = await io.readBinary(new Uint8Array(buffer));

    if (needsGeometryWork) await optimizeGeometry(document, pipeline, options, report, onProgress);

    if (draco) {
        onProgress?.({ ratio: 0.88, label: 'DRACO sıkıştırılıyor...' });
        await document.transform(pipeline.draco({ method: 'edgebreaker', ...DRACO_LEVELS[dracoLevel] }));
    } else if (options.meshopt) {
        onProgress?.({ ratio: 0.88, label: 'Meshopt sıkıştırılıyor...' });
        await pipeline.encoder.ready;
        const extension = document.createExtension(pipeline.EXTMeshoptCompression);
        extension.setRequired(true);
        await document.transform(pipeline.meshopt({ encoder: pipeline.encoder, level: options.meshoptLevel ?? 'high' }));
        report.push('EXT_meshopt_compression uygulandı.');
    }

    if (needsTextureWork) {
        onProgress?.({ ratio: 0.9, label: 'Dokular işleniyor...' });
        await processTextures(document, options, report);
    }

    if (needsKtx2 && document.getRoot().listTextures().length) {
        await compressTexturesToKtx2(document, pipeline, options, report, onProgress);
    }

    return { buffer: await io.writeBinary(document), report };
}
