import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { PlanetInfo } from "./PlanetInfo";
import { Background } from "./Background";
import { Moon } from "./Moon";
import { Button } from "./ui/button";
import { LoginModal } from "./auth/LoginModal";
import { useAuthContext } from "@/providers/AuthProvider";
import { SpaceChatSystem } from "./SpaceChatSystem";

interface PlanetData {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  description: string;
  facts: string[];
  texturePath?: string;
  hasRings?: boolean;
  rotationSpeed?: number;
  tilt?: number;
}

// Base orbit speed for calculations (Earth = 1.0)
const baseOrbitSpeed = 0.6;

const planets: PlanetData[] = [
  {
    name: "Mercury",
    color: "#8C7853",
    size: 0.1,
    distance: 2.5,
    speed: baseOrbitSpeed / 0.24,
    description: "The smallest and innermost planet in our solar system.",
    facts: [
      "Closest planet to the Sun",
      "No atmosphere",
      "Extreme temperature variations",
    ],
    texturePath: "/textures/bodies/mercury.jpg",
    rotationSpeed: 1,
    tilt: 0.00017,
  },
  {
    name: "Venus",
    color: "#FFC649",
    size: 0.15,
    distance: 3.5,
    speed: baseOrbitSpeed / 0.62,
    description: "The hottest planet with a thick, toxic atmosphere.",
    facts: ["Hottest planet", "Thick atmosphere", "Rotates backwards"],
    texturePath: "/textures/bodies/Venus.jpg",
    rotationSpeed: 1,
    tilt: 3.09639,
  },
  {
    name: "Earth",
    color: "#6B93D6",
    size: 0.15,
    distance: 4.5,
    speed: baseOrbitSpeed,
    description: "Our home planet, the only known planet with life.",
    facts: [
      "Only planet with known life",
      "71% water coverage",
      "Has one moon",
    ],
    texturePath: "/textures/bodies/Earth.jpg",
    rotationSpeed: 1,
    tilt: 0.40928,
  },
  {
    name: "Mars",
    color: "#C1440E",
    size: 0.13,
    distance: 6.0,
    speed: baseOrbitSpeed / 1.88,
    description: "The red planet with polar ice caps and the largest volcano.",
    facts: [
      "Red due to iron oxide",
      "Has two small moons",
      "Largest volcano in solar system",
    ],
    texturePath: "/textures/bodies/Mars.jpg",
    rotationSpeed: 0.5,
    tilt: 0.43965,
  },
  {
    name: "Jupiter",
    color: "#D8CA9D",
    size: 0.25,
    distance: 8.0,
    speed: baseOrbitSpeed / 11.86,
    description: "The largest planet with a great red spot storm.",
    facts: ["Largest planet", "Great Red Spot storm", "Over 80 moons"],
    texturePath: "/textures/bodies/Jupiter.jpg",
    rotationSpeed: 0.2,
    tilt: 0.05463,
  },
  {
    name: "Saturn",
    color: "#FAD5A5",
    size: 0.2,
    distance: 11.0,
    speed: baseOrbitSpeed / 29.46,
    description: "Famous for its prominent ring system.",
    facts: ["Prominent rings", "Less dense than water", "Over 80 moons"],
    texturePath: "/textures/bodies/saturn.jpg",
    hasRings: true,
    rotationSpeed: 0.1,
    tilt: 0.46653,
  },
  {
    name: "Uranus",
    color: "#4FD0E7",
    size: 0.18,
    distance: 14.0,
    speed: baseOrbitSpeed / 84.01,
    description: "An ice giant that rotates on its side.",
    facts: ["Rotates on its side", "Made of ice and rock", "Faint ring system"],
    texturePath: "/textures/bodies/uranus.jpg",
    rotationSpeed: 0.07,
    tilt: 1.70622,
  },
  {
    name: "Neptune",
    color: "#4B70DD",
    size: 0.8,
    distance: 17.0,
    speed: baseOrbitSpeed / 164.8,
    description: "The windiest planet with supersonic winds.",
    facts: ["Windiest planet", "Supersonic winds", "Deep blue color"],
    texturePath: "/textures/bodies/Neptune.jpg",
    rotationSpeed: 0.06,
    tilt: 0.49428,
  },
];

const SolarSystemScene: React.FC<{
  onPlanetClick: (planet: PlanetData) => void;
  focusedPlanet: string | null;
  backgroundType: "stars" | "milky_way";
}> = ({ onPlanetClick, focusedPlanet, backgroundType }) => {
  return (
    <>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={25}
      />

      {/* Background texture */}
      <Background textureType={backgroundType} />

      {/* Additional stars for depth */}
      <Stars radius={300} depth={50} count={500} factor={2} saturation={0} />

      {/* Enhanced Lighting System - Clear Planet Visibility */}
      {/* Strong ambient light for consistent planet visibility */}
      <ambientLight intensity={0.6} color="#B0E0E6" />

      {/* Main sun light - primary directional light source */}
      <directionalLight
        position={[0, 0, 0]}
        intensity={4.0}
        color="#FFE55C"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Secondary sun light for fill lighting */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2.8}
        color="#FDB813"
        distance={150}
        decay={1.2}
      />

      {/* Rim lighting for planet definition */}
      <pointLight
        position={[-25, 15, -25]}
        intensity={1.8}
        color="#E0F6FF"
        distance={120}
        decay={1.2}
      />

      {/* Back lighting for depth */}
      <pointLight
        position={[20, -20, 20]}
        intensity={1.5}
        color="#FFE4E1"
        distance={100}
        decay={1.2}
      />

      {/* Additional fill light for overall brightness */}
      <pointLight
        position={[0, 25, 0]}
        intensity={2.0}
        color="#FFFFFF"
        distance={180}
        decay={1.0}
      />

      {/* Side fill light for even illumination */}
      <pointLight
        position={[30, 0, 0]}
        intensity={1.5}
        color="#F0F8FF"
        distance={120}
        decay={1.2}
      />

      {/* Space ambient lighting - bright and clear */}
      <hemisphereLight
        skyColor="#87CEEB"
        groundColor="#4682B4"
        intensity={0.18}
      />

      <Sun />

      {planets.map((planet) => (
        <Planet
          key={planet.name}
          name={planet.name}
          color={planet.color}
          size={planet.size}
          distance={planet.distance}
          speed={planet.speed}
          onClick={() => onPlanetClick(planet)}
          focused={focusedPlanet === planet.name}
          texturePath={planet.texturePath}
          hasRings={planet.hasRings}
          rotationSpeed={planet.rotationSpeed}
          tilt={planet.tilt}
        />
      ))}

      {/* Moon orbiting Earth */}
      <Moon earthPosition={[4.5, 0, 0]} earthDistance={4.5} />
    </>
  );
};

export const SolarSystem: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<"stars" | "milky_way">(
    "milky_way"
  );

  const { user, logout } = useAuthContext();
  const handlePlanetClick = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    setFocusedPlanet(planet.name);
  };

  const handleBackToSystem = () => {
    setSelectedPlanet(null);
    setFocusedPlanet(null);
  };

  const toggleBackground = () => {
    setBackgroundType((prev) => (prev === "stars" ? "milky_way" : "stars"));
  };
  return (
    <div className="w-full h-screen bg-background relative overflow-hidden">
      {/* Space background gradient - brighter for mental health app */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #1e40af 50%, #1e3a8a 75%, #0f172a 100%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 8, 15], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <SolarSystemScene
          onPlanetClick={handlePlanetClick}
          focusedPlanet={focusedPlanet}
          backgroundType={backgroundType}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Solar System Explorer
          </h1>
          <p className="text-muted-foreground text-sm mb-3">
            Click on planets to explore • Use mouse to navigate
          </p>
          <Button
            onClick={toggleBackground}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Switch to {backgroundType === "stars" ? "Milky Way" : "Stars"}{" "}
            Background
          </Button>
        </div>
      </div>
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4">
          {user ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Welcome, {user.email}
              </p>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in to save your preferences
              </p>
              <Button
                onClick={() => setShowLoginModal(true)}
                size="sm"
                className="w-full bg-purple-600 text-white hover:bg-purple-700"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Planet Info Overlay - Outside Canvas */}
      {selectedPlanet && (
        <PlanetInfo planet={selectedPlanet} onClose={handleBackToSystem} />
      )}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />

      {/* Space Chat System */}
      <SpaceChatSystem />
    </div>
  );
};
