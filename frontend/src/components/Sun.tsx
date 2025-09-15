import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export const Sun: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Load the sun texture
  const sunTexture = useTexture("/textures/bodies/sun.jpg");

  // Configure texture properties
  React.useEffect(() => {
    if (sunTexture) {
      sunTexture.wrapS = THREE.RepeatWrapping;
      sunTexture.wrapT = THREE.RepeatWrapping;
      sunTexture.flipY = false;
    }
  }, [sunTexture]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }

    if (glowRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Main sun */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial map={sunTexture} color="#FDB813" />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.3} />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#FFE55C" transparent opacity={0.1} />
      </mesh>
    </group>
  );
};
