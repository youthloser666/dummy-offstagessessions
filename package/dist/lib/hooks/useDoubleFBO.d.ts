import { useFBO } from '@react-three/drei';
import * as THREE from 'three';
type FBO = {
    read: THREE.WebGLRenderTarget;
    write: THREE.WebGLRenderTarget;
    swap: () => void;
    dispose: () => void;
    setGenerateMipmaps: (value: boolean) => void;
};
export declare const useDoubleFBO: (width: number, height: number, options: NonNullable<Parameters<typeof useFBO>[2]>) => FBO;
export {};
//# sourceMappingURL=useDoubleFBO.d.ts.map