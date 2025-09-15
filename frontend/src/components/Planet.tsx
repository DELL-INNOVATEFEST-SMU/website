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
  focused: boolean;
  texturePath?: string;
  hasRings?: boolean;
}

export const Planet: React.FC<PlanetProps> = ({
  name,
  color,
  size,
  distance,
  speed,
  onClick,
  focused,
  texturePath,
  hasRings,
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
      planetTexture.flipY = false;
    }
    if (ringTexture) {
      ringTexture.wrapS = THREE.RepeatWrapping;
      ringTexture.wrapT = THREE.RepeatWrapping;
      ringTexture.flipY = false;
    }
  }, [planetTexture, ringTexture]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * speed * 0.1;
    }

    if (meshRef.current) {
      // Planet self-rotation
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;

      // Add gentle bobbing animation when focused
      if (focused) {
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
            focused
              ? new THREE.Color(color).multiplyScalar(0.3)
              : new THREE.Color(color).multiplyScalar(0.1)
          }
          emissiveIntensity={focused ? 0.4 : 0.15}
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

        {/* Orbital trail */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-distance, 0, 0]}>
          <ringGeometry args={[distance - 0.02, distance + 0.02, 64]} />
          <meshBasicMaterial
            color="#444"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Glow effect when focused */}
        {focused && (
          <mesh>
            <sphereGeometry args={[size * 1.2, 32, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.2} />
          </mesh>
        )}
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
