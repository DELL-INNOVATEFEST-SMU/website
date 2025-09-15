import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface BackgroundProps {
  textureType: "stars" | "milky_way";
}

export const Background: React.FC<BackgroundProps> = ({ textureType }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load the appropriate texture based on the type
  const texturePath =
    textureType === "milky_way"
      ? "/textures/background/stars_milky_way.jpg"
      : "/textures/background/stars.jpg";

  const texture = useTexture(texturePath);

  // Configure texture properties for better rendering
  React.useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.flipY = false; // Important for skybox textures
    }
  }, [texture]);

  // Optional: Add subtle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.01; // Very slow rotation
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        transparent={true}
        opacity={0.6}
      />
    </mesh>
  );
};
