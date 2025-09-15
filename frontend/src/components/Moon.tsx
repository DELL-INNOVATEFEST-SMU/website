import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface MoonProps {
  earthPosition: [number, number, number];
  earthDistance: number;
}

export const Moon: React.FC<MoonProps> = ({ earthPosition, earthDistance }) => {
  const moonRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  // Load moon texture
  const moonTexture = useTexture("/textures/bodies/moon.jpg");

  // Configure texture properties
  React.useEffect(() => {
    if (moonTexture) {
      moonTexture.wrapS = THREE.RepeatWrapping;
      moonTexture.wrapT = THREE.RepeatWrapping;
      moonTexture.flipY = false;
    }
  }, [moonTexture]);

  useFrame(({ clock }) => {
    if (orbitRef.current) {
      // Moon orbits around Earth
      orbitRef.current.rotation.y = clock.getElapsedTime() * 2.5; // Faster than Earth's orbit
    }

    if (moonRef.current) {
      // Moon self-rotation (tidally locked, so same as orbital period)
      moonRef.current.rotation.y = clock.getElapsedTime() * 2.5;
    }
  });

  return (
    <group ref={orbitRef} position={earthPosition}>
      <mesh
        ref={moonRef}
        position={[earthDistance * 0.3, 0, 0]} // Moon orbits at 30% of Earth's distance from sun
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshStandardMaterial
          map={moonTexture}
          color="#C0C0C0"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};
