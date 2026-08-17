import * as THREE from 'three';
import { useFBO } from '@react-three/drei';
import { useRef } from 'react';

type FBO = {
    read: THREE.WebGLRenderTarget;
    write: THREE.WebGLRenderTarget;
    swap: () => void;
    dispose: () => void;
    setGenerateMipmaps: (value: boolean) => void;
};

export const useDoubleFBO = (width: number, height: number, options: NonNullable<Parameters<typeof useFBO>[2]>) => {
    const read = useFBO(width, height, options);

    const write = useFBO(width, height, options);

    const fbo = useRef<FBO>({
        read,
        write,
        swap: () => {
            const temp = fbo.read;
            fbo.read = fbo.write;
            fbo.write = temp;
        },
        dispose: () => {
            read.dispose();
            write.dispose();
        },
        setGenerateMipmaps: (value: boolean) => {
            read.texture.generateMipmaps = value;
            write.texture.generateMipmaps = value;
        },
    }).current;

    return fbo;
};
