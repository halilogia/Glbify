import { DRACO_LEVELS, MESHOPT_LEVELS } from '../config.js';

const BITS = {
    position: 3 * 4,
    normal: 3 * 4,
    texcoord: 2 * 4,
    color: 3 * 4,
    index: 4,
};

/**
 * Yaklaşık çıktı boyutu tahmini. Kesin değildir; ama kullanıcıya "yaklaşık" etiketiyle
 * gösterilir ve export sonrası gerçek boyutla karşılaştırılır.
 */
export function estimateOutputBytes({ vertices, triangles, textures, options }) {
    const {
        draco,
        dracoLevel = 'balanced',
        meshopt,
        meshoptLevel = 'high',
        simplifyRatio = 0,
        weld = true,
        ktx2 = false,
    } = options;

    const kept = Math.max(1, vertices * (1 - simplifyRatio));
    const keptTriangles = Math.max(1, triangles * (1 - simplifyRatio));

    let geometryBytes;
    if (draco) {
        const bits = DRACO_LEVELS[dracoLevel] ?? DRACO_LEVELS.balanced;
        const perVertex = (bits.quantizePosition + bits.quantizeNormal + bits.quantizeTexcoord) / 8;
        geometryBytes = kept * perVertex + keptTriangles * 1.2;
    } else if (meshopt) {
        const level = MESHOPT_LEVELS.includes(meshoptLevel) ? meshoptLevel : 'high';
        const perVertex = level === 'high' ? 2.4 : 1.9;
        geometryBytes = kept * perVertex + keptTriangles * 0.35;
    } else {
        geometryBytes = kept * (BITS.position + BITS.normal + BITS.texcoord) + keptTriangles * 3 * 2;
    }

    if (weld && !draco && !meshopt) geometryBytes *= 0.92;

    const textureBytes = estimateTextureBytes(textures, { ktx2, ktx2Mode: options.uastc ? 'uastc' : 'etc1s' });

    return Math.round(geometryBytes + textureBytes);
}

function estimateTextureBytes(textures, { ktx2, ktx2Mode }) {
    if (!textures?.length) return 0;

    let total = 0;
    for (const texture of textures) {
        const pixels = (texture.width ?? 1024) * (texture.height ?? 1024);
        if (!ktx2) {
            total += pixels * 1.2;
        } else {
            const bytesPerPixel = ktx2Mode === 'uastc' ? 1 : 0.5;
            total += pixels * bytesPerPixel * 1.34;
        }
    }
    return total;
}

export function collectTextureSizes(model) {
    const seen = new Map();

    model.traverse((child) => {
        if (!child.isMesh) return;
        const list = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of list) {
            for (const slot of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap']) {
                const texture = material?.[slot];
                if (!texture || seen.has(texture)) continue;
                const image = texture.image;
                seen.set(texture, {
                    width: image?.naturalWidth ?? image?.width ?? 1024,
                    height: image?.naturalHeight ?? image?.height ?? 1024,
                });
            }
        }
    });

    return [...seen.values()];
}

export function formatEstimate(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
