
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

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

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
    size: 0.18,
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
const thinkingTraps = [
  { title: "All-or-Nothing Thinking", description: "Seeing things as all good or all bad." },
  { title: "Overgeneralizing", description: "Assuming one event means it always happens." },
  { title: "Catastrophizing", description: "Expecting the worst-case scenario." },
];

export const SolarSystem: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [showInnerModal, setShowInnerModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedTraps, setSelectedTraps] = useState<string[]>([]);
  const toggleTrap = (trapTitle: string) => {
    setSelectedTraps((prev) =>
      prev.includes(trapTitle)
        ? prev.filter((t) => t !== trapTitle)
        : [...prev, trapTitle]
    );
  };
  const [email, setEmail] = useState("");
  const [showJournal, setShowJournal] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<"stars" | "milky_way">(
    "milky_way"
  );
  const [journal, setJournal] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generateImage = async () => {
    setLoading(true);
    setError(null);
    setImageBase64(null);

    try {
      console.log(JSON.stringify({ journal }));
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ journal }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setImageBase64(data.image_base64);
      setShowImageModal(true);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  console.log("Current user:", user);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3); // show 3 days before today initially
    return d;
  });

  const daysToShow = 7;

  // Generate the array of 7 days from startDate
  const days = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  const handlePrev = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() - daysToShow);
    setStartDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + daysToShow);
    setStartDate(newDate);
  };

  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  const handleMagicLinkLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });
    if (error) alert(error.message);
    else alert("Check your email for the login link!");
  };
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
      <div className="absolute top-6 right-6 z-10">{!user && (
        <Button
          onClick={() => setShowLoginModal(true)}
          className="mt-4 w-full bg-purple-600 text-white"
        >
          Log in
        </Button>
      )}</div>
      {/* Planet Info Overlay - Outside Canvas */}
      {selectedPlanet && (
        <PlanetInfo planet={selectedPlanet} onClose={handleBackToSystem} />
      )}
      <div className="absolute top-6 right-6 z-10">
        {user && (
          <>
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
              }}
              className="mt-4 w-full bg-red-600 text-white"
            >
              Log out
            </Button>
            <Button
              onClick={() => setShowJournal(true)}
              variant="outline"
              className="mt-4 w-full"
            >
              Open Journal
            </Button>
          </>
        )}

      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Log in</h2>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded mb-4"
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleMagicLinkLogin}
                className="bg-purple-600 text-white w-full"
              >
                Send Magic Link
              </Button>

              <Button
                onClick={() => setShowLoginModal(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {showJournal && (
        <div className="fixed inset-0  flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">

            <h2 className="text-xl font-bold mb-4">Journal</h2>
            <div className="flex items-center w-full max-w-4xl mx-auto overflow-hidden">
              <button
                onClick={handlePrev}
                className=" text-lg px-2 py-1 rounded-l hover:bg-gray-300"
              >
                ‹
              </button>

              <div className="flex flex-1 overflow-hidden">
                <div className="flex  w-full transition-transform duration-300 ease-in-out">
                  {days.map((day, idx) => (
                    <div
                      key={idx}
                      className={`flex-none text-center w-1/7 p-4 border border-gray-200 ${day.toDateString() === new Date().toDateString()
                        ? "bg-blue-100"
                        : ""
                        }`}
                    >
                      <div className="font-bold">{day.toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                className=" text-lg px-2 py-1 rounded-r hover:bg-gray-300"
              >
                ›
              </button>
            </div>
            <p>This is the journal modal. Here is your prompt.</p>
            <textarea
              rows={6}
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Enter your journal entry..."
              className="w-full p-3 border border-gray-300 rounded resize-none"
            />
            <button
              onClick={generateImage}
              disabled={loading || journal.trim() === ""}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded px-6 py-2 disabled:opacity-50"
            >{loading ? "Generating..." : "Generate Image"}
            </button>
            {error && <p className="text-red-600">{error}</p>}

            <button
              onClick={() => setShowInnerModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Select Thinking Traps
            </button>
            {showInnerModal && (
              <div className="absolute inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-auto">
                  <h3 className="text-lg font-semibold mb-2">Thinking Traps</h3>
                  <p>This modal is inside the main modal.</p>
                  <div className="grid gap-3">
                    {thinkingTraps.map((trap) => {
                      const isSelected = selectedTraps.includes(trap.title);
                      console.log(selectedTraps, isSelected);
                      return (
                        <button
                          key={trap.title}
                          onClick={() => toggleTrap(trap.title)}
                          className={`w-full text-left p-3 border rounded-lg transition-colors ${isSelected
                            ? "!bg-purple-500 !text-white !border-purple-600"
                            : "bg-gray-100 text-black hover:bg-purple-100"
                            }`}
                        >
                          <strong>{trap.title}</strong>
                          <p className="text-sm">{trap.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setShowInnerModal(false)}
                    className="mt-4 px-4 py-2 rounded border border-gray-400"
                  >
                    Close Image
                  </button>
                </div>
              </div>
            )}
            {showImageModal && imageBase64 && (
              <div className="absolute inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-auto">
                  <h3 className="text-lg font-semibold mb-2">Generated Image</h3>
                  <p>This modal is inside the main modal.</p>
                  
            <img
              src={`data:image/png;base64,${imageBase64}`}
              alt="Generated"
              className="max-w-full max-h-[80vh] mx-auto"
            />
                  

                  <button
                    onClick={() => setShowImageModal(false)}
                    className="mt-4 px-4 py-2 rounded border border-gray-400"
                  >
                    Close Image
                  </button>
                </div>
              </div>
            )}
            <Button
              onClick={() => setShowJournal(false)}
              variant="outline"
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>

  );
};
