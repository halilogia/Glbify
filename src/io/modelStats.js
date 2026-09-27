import * as THREE from 'three';

function countGeometry(geometry, stats) {
    if (!geometry) return;
    const position = geometry.getAttribute('position');
    if (!position) return;

    stats.vertices += position.count;

    if (geometry.index) {
        stats.triangles += Math.floor(geometry.index.count / 3);
    } else {
        stats.triangles += Math.floor(position.count / 3);
        stats.hasUnindexedGeometry = true;
    }
}

export function computeStats(object) {
    const stats = {
        meshes: 0,
        bones: 0,
        vertices: 0,
        triangles: 0,
        hasUnindexedGeometry: false,
        morphTargets: 0,
        size: new THREE.Vector3(),
    };

    object.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
            stats.meshes += 1;
            countGeometry(child.geometry, stats);
            stats.morphTargets += child.morphTargetInfluences?.length ?? 0;
        }
        if (child.isBone) stats.bones += 1;
    });

    const box = new THREE.Box3();
    try {
        box.setFromObject(object);
    } catch {
        // Bozuk iskelet (skeleton'sız SkinnedMesh) boyut hesabini engelleyebilir.
        return stats;
    }
    if (!box.isEmpty()) stats.size.copy(box.getSize(new THREE.Vector3()));

    return stats;
}
