import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { PlanetInfo } from "./PlanetInfo";
import { Background } from "./Background";
import { Button } from "./ui/button";

interface PlanetData {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  description: string;
  facts: string[];
  texturePath?: string;
}

const planets: PlanetData[] = [
  {
    name: "Mercury",
    color: "#8C7853",
    size: 0.4,
    distance: 4,
    speed: 2.0,
    description: "The smallest and innermost planet in our solar system.",
    facts: [
      "Closest planet to the Sun",
      "No atmosphere",
      "Extreme temperature variations",
    ],
    texturePath: "/textures/bodies/mercury.jpg",
  },
  {
    name: "Venus",
    color: "#FFC649",
    size: 0.9,
    distance: 6,
    speed: 1.6,
    description: "The hottest planet with a thick, toxic atmosphere.",
    facts: ["Hottest planet", "Thick atmosphere", "Rotates backwards"],
    texturePath: "/textures/bodies/Venus.jpg",
  },
  {
    name: "Earth",
    color: "#6B93D6",
    size: 1,
    distance: 8,
    speed: 1.0,
    description: "Our home planet, the only known planet with life.",
    facts: [
      "Only planet with known life",
      "71% water coverage",
      "Has one moon",
    ],
    texturePath: "/textures/bodies/Earth.jpg",
  },
  {
    name: "Mars",
    color: "#C1440E",
    size: 0.7,
    distance: 10,
    speed: 0.8,
    description: "The red planet with polar ice caps and the largest volcano.",
    facts: [
      "Red due to iron oxide",
      "Has two small moons",
      "Largest volcano in solar system",
    ],
    texturePath: "/textures/bodies/Mars.jpg",
  },
  {
    name: "Jupiter",
    color: "#D8CA9D",
    size: 2.5,
    distance: 14,
    speed: 0.4,
    description: "The largest planet with a great red spot storm.",
    facts: ["Largest planet", "Great Red Spot storm", "Over 80 moons"],
    texturePath: "/textures/bodies/Jupiter.jpg",
  },
  {
    name: "Saturn",
    color: "#FAD5A5",
    size: 2.1,
    distance: 18,
    speed: 0.3,
    description: "Famous for its prominent ring system.",
    facts: ["Prominent rings", "Less dense than water", "Over 80 moons"],
  },
  {
    name: "Uranus",
    color: "#4FD0E7",
    size: 1.8,
    distance: 22,
    speed: 0.2,
    description: "An ice giant that rotates on its side.",
    facts: ["Rotates on its side", "Made of ice and rock", "Faint ring system"],
    texturePath: "/textures/bodies/uranus.jpg",
  },
  {
    name: "Neptune",
    color: "#4B70DD",
    size: 1.7,
    distance: 26,
    speed: 0.15,
    description: "The windiest planet with supersonic winds.",
    facts: ["Windiest planet", "Supersonic winds", "Deep blue color"],
    texturePath: "/textures/bodies/Neptune.jpg",
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
        minDistance={5}
        maxDistance={50}
      />

      {/* Background texture */}
      <Background textureType={backgroundType} />

      {/* Additional stars for depth */}
      <Stars radius={300} depth={50} count={500} factor={2} saturation={0} />

      {/* Enhanced Lighting System */}
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.15} color="#4A90E2" />

      {/* Main sun light - primary directional light source */}
      <directionalLight
        position={[0, 0, 0]}
        intensity={2.5}
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
        intensity={1.8}
        color="#FDB813"
        distance={100}
        decay={2}
      />

      {/* Rim lighting for planet definition */}
      <pointLight
        position={[-20, 10, -20]}
        intensity={0.8}
        color="#87CEEB"
        distance={80}
        decay={2}
      />

      {/* Back lighting for depth */}
      <pointLight
        position={[15, -15, 15]}
        intensity={0.6}
        color="#FFB6C1"
        distance={60}
        decay={2}
      />

      {/* Space ambient lighting */}
      <hemisphereLight
        skyColor="#1E3A8A"
        groundColor="#0F172A"
        intensity={0.3}
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
        />
      ))}
    </>
  );
};

export const SolarSystem: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<"stars" | "milky_way">(
    "milky_way"
  );

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
      {/* Space background gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "var(--gradient-space)",
        }}
      />

      <Canvas
        camera={{ position: [0, 15, 30], fov: 60 }}
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

      {/* Planet Info Overlay - Outside Canvas */}
      {selectedPlanet && (
        <PlanetInfo planet={selectedPlanet} onClose={handleBackToSystem} />
      )}
    </div>
  );
};
