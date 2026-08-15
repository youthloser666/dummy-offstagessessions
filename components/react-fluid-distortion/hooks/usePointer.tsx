import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import { Vector2 } from 'three';

type SplatStack = {
    mouseX: number;
    mouseY: number;
    velocityX: number;
    velocityY: number;
};

export const usePointer = ({ force }: { force: number }) => {
    const splatStack: SplatStack[] = useRef([]).current;
    const lastMouse = useRef<Vector2>(new Vector2());
    const hasMoved = useRef<boolean>(false);

    useFrame((state) => {
        // state.pointer is [-1, 1], we need [0, 1]
        const currentX = (state.pointer.x + 1) / 2;
        const currentY = (state.pointer.y + 1) / 2;

        if (!hasMoved.current) {
            hasMoved.current = true;
            lastMouse.current.set(currentX, currentY);
            return;
        }

        const deltaX = currentX - lastMouse.current.x;
        const deltaY = currentY - lastMouse.current.y;

        lastMouse.current.set(currentX, currentY);

        // Hanya tambahkan jika ada pergerakan
        if (deltaX !== 0 || deltaY !== 0) {
            const splatInfo = {
                mouseX: currentX,
                mouseY: currentY,
                // Kita kalikan force dengan rasio agar velocity cukup kuat karena delta dalam koordinat [0,1] sangat kecil
                velocityX: deltaX * force * 1000,
                velocityY: deltaY * force * 1000,
            };

            splatStack.push(splatInfo);
        }
    });

    return splatStack;
};

