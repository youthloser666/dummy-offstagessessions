import * as THREE from 'three';
export declare const useFBOs: () => {
    density: {
        read: THREE.WebGLRenderTarget;
        write: THREE.WebGLRenderTarget;
        swap: () => void;
        dispose: () => void;
        setGenerateMipmaps: (value: boolean) => void;
    };
    velocity: {
        read: THREE.WebGLRenderTarget;
        write: THREE.WebGLRenderTarget;
        swap: () => void;
        dispose: () => void;
        setGenerateMipmaps: (value: boolean) => void;
    };
    pressure: {
        read: THREE.WebGLRenderTarget;
        write: THREE.WebGLRenderTarget;
        swap: () => void;
        dispose: () => void;
        setGenerateMipmaps: (value: boolean) => void;
    };
    divergence: THREE.WebGLRenderTarget<THREE.Texture<unknown>>;
    curl: THREE.WebGLRenderTarget<THREE.Texture<unknown>>;
};
//# sourceMappingURL=useFBOs.d.ts.map