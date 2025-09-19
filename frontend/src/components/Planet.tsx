import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface PlanetProps {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  onClick: () => void;
  isHighlighted: boolean;
  texturePath?: string;
  hasRings?: boolean;
  rotationSpeed?: number;
  tilt?: number;
}

export const Planet: React.FC<PlanetProps> = ({
  name,
  color,
  size,
  distance,
  speed,
  onClick,
  isHighlighted,
  texturePath,
  hasRings,
  rotationSpeed = 0.5,
  tilt = 0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Load planet texture if provided
  const planetTexture = texturePath ? useTexture(texturePath) : null;

  // Load ring texture for Saturn
  const ringTexture = hasRings
    ? useTexture("/textures/bodies/saturn_ring_alpha.png")
    : null;

  // Configure texture properties
  React.useEffect(() => {
    if (planetTexture) {
      planetTexture.wrapS = THREE.RepeatWrapping;
      planetTexture.wrapT = THREE.RepeatWrapping;
      // Try different approaches for Earth orientation
      if (name === "Earth") {
        planetTexture.flipY = false;
        planetTexture.rotation = Math.PI; // Rotate 180 degrees
      } else {
        planetTexture.flipY = false;
      }
    }
    if (ringTexture) {
      ringTexture.wrapS = THREE.RepeatWrapping;
      ringTexture.wrapT = THREE.RepeatWrapping;
      ringTexture.flipY = false;
    }
  }, [planetTexture, ringTexture, name]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * speed * 0.1;
    }

    if (meshRef.current) {
      // Planet self-rotation with proper speed
      meshRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;

      // Apply axial tilt
      meshRef.current.rotation.z = tilt;

      // Add gentle bobbing animation when highlighted
      if (isHighlighted) {
        meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.1;
      } else {
        meshRef.current.position.y = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={[distance, 0, 0]}
        onClick={onClick}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          map={planetTexture}
          color={color}
          roughness={0.7}
          metalness={0.05}
          emissive={
            isHighlighted
              ? new THREE.Color(color).multiplyScalar(0.3)
              : new THREE.Color(color).multiplyScalar(0.1)
          }
          emissiveIntensity={isHighlighted ? 0.4 : 0.15}
        />

        {/* Planet atmosphere effect */}
        <mesh scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Surface details for larger planets */}
        {size > 1 && (
          <mesh>
            <sphereGeometry args={[size * 1.001, 64, 64]} />
            <meshStandardMaterial
              color={new THREE.Color(color).multiplyScalar(0.8)}
              roughness={1}
              metalness={0}
              transparent
              opacity={0.3}
            />
          </mesh>
        )}

        {/* Glow effect - always visible with enhanced effect when highlighted */}
        <mesh>
          <sphereGeometry args={[size * 1.15, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isHighlighted ? 0.4 : 0.25}
          />
        </mesh>

        {/* Additional outer glow layer */}
        <mesh>
          <sphereGeometry args={[size * 1.3, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isHighlighted ? 0.15 : 0.08}
          />
        </mesh>
      </mesh>

      {/* Saturn's rings */}
      {hasRings && ringTexture && (
        <mesh position={[distance, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.2, size * 2.5, 64]} />
          <meshBasicMaterial
            map={ringTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
            color="#FAD5A5"
          />
        </mesh>
      )}
    </group>
  );
};
