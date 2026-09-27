import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export function createDecoders(renderer) {
    return {
        draco: new DRACOLoader(),
        ktx2: new KTX2Loader().detectSupport(renderer),
        meshopt: MeshoptDecoder,
    };
}
