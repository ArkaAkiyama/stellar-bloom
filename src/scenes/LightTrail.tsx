import { useRef, useMemo } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Custom ShaderMaterial for a soft glow that follows the pointer.
 */
class LightTrailMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uPointer: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uOpacity: { value: 0.35 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 uPointer;
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 p = vUv - 0.5;
          vec2 ptr = uPointer * 0.5;
          float d = length(p - ptr);
          float glow = exp(-d * 6.0) * uOpacity;
          // Soft pastel lavender
          vec3 color = vec3(0.76, 0.71, 0.99);
          // Subtle time shimmer
          glow *= 0.9 + 0.1 * sin(uTime * 2.0 + d * 10.0);
          gl_FragColor = vec4(color, glow);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }
}

extend({ LightTrailMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    lightTrailMaterial: any;
  }
}

export default function LightTrail() {
  const matRef = useRef<LightTrailMaterial>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uPointer.value.set(pointer.x, pointer.y);
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[30, 30]} />
      <lightTrailMaterial ref={matRef} />
    </mesh>
  );
}
