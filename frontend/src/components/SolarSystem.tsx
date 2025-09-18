import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { PlanetInfo } from "./PlanetInfo";
import { Background } from "./Background";
import { Moon } from "./Moon";
import { Button } from "./ui/button";
import { LoginModal } from "./auth/LoginModal";
import { useAuthContext } from "@/providers/AuthProvider";
import { SpaceChatSystem } from "./SpaceChatSystem";
import { supabase } from "@/services/supabase/client";

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

const baseOrbitSpeed = 0.6;

// Planet data with realistic relative sizes, distances, and orbital speeds
const planets: PlanetData[] = [
  {
    name: "Mercury",
    color: "#8C7853",
    size: 0.1,
    distance: 2.5,
    speed: baseOrbitSpeed / 0.24,
    description: "The smallest and fastest planet, closest to the Sun.",
    facts: ["Closest to the Sun", "No atmosphere", "Extreme temperatures"],
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
    facts: ["Only planet with life", "71% water coverage", "One natural moon"],
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
    description: "The red planet with the largest volcano in the solar system.",
    facts: ["Red planet", "Largest volcano", "Two small moons"],
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
      <Background type={backgroundType} />

      {/* Lighting setup */}
      <ambientLight intensity={0.6} color="#B0E0E6" />
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

      {/* Point lights for each planet */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2.8}
        color="#FDB813"
        distance={150}
        decay={1.2}
      />
      <pointLight
        position={[-25, 15, -25]}
        intensity={1.8}
        color="#E0F6FF"
        distance={120}
        decay={1.2}
      />
      <pointLight
        position={[20, -20, 20]}
        intensity={1.5}
        color="#FFE4E1"
        distance={100}
        decay={1.2}
      />
      <pointLight
        position={[3.5, 0, 0]}
        intensity={0.3}
        color="#CD5C5C"
        distance={2}
      />
      <pointLight
        position={[8.0, 0, 0]}
        intensity={0.6}
        color="#D8CA9D"
        distance={4}
      />
      <hemisphereLight args={["#ffffff", "#60666C"]} intensity={0.2} />

      <Sun />

      {planets.map((planet) => (
        <Planet
          key={planet.name}
          {...planet}
          onClick={() => onPlanetClick(planet)}
          isHighlighted={focusedPlanet === planet.name}
        />
      ))}

      <Moon earthPosition={[4.5, 0, 0]} earthDistance={4.5} />
    </>
  );
};

const thinkingTraps = [
  {
    title: "All-or-Nothing Thinking",
    description: "Seeing things as all good or all bad.",
  },
  {
    title: "Overgeneralizing",
    description: "Assuming one event means it always happens.",
  },
  {
    title: "Catastrophizing",
    description: "Expecting the worst-case scenario.",
  },
];

export const SolarSystem: React.FC = () => {
  const { user, logout } = useAuthContext();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedTraps, setSelectedTraps] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const isFutureDay = (day: Date) => day > new Date();
  const [journals, setJournals] = useState<{ [date: string]: string }>({});
  const [showJournal, setShowJournal] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<"stars" | "milky_way">(
    "milky_way"
  );

  // --- Journal feature (from main) ---
  const fetchedOnce = useRef(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTrap = (trapTitle: string) => {
    setSelectedTraps((prev) =>
      prev.includes(trapTitle)
        ? prev.filter((t) => t !== trapTitle)
        : [...prev, trapTitle]
    );
  };

  const handleShareImage = () => {
    if (navigator.share && imageBase64) {
      navigator.share({
        title: "My Journal Image",
        url: `data:image/png;base64,${imageBase64}`,
      });
    } else {
      alert("Sharing is not supported.");
    }
  };

  const handleSaveImage = () => {
    if (!imageBase64) return;
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${imageBase64}`;
    a.download = `journal-${selectedDay.toLocaleDateString()}.png`;
    a.click();
  };

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const canGenerate = async () => {
    if (!user?.id) return false;

    const { data, error } = await supabase
      .from("has_generated_image")
      .select("has_generated")
      .eq("user_id", user.id)
      .eq("created_at", todayStr)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

    if (error) {
      console.error("Error checking generation limit:", error);
      // For anonymous users, allow generation if database has issues
      if (user.is_anonymous) {
        console.log(
          "Anonymous user - allowing generation despite database error"
        );
        return true;
      }
      return false; // For authenticated users, be more cautious
    }

    return !data || data.has_generated === false;
  };

  const generateImage = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!(await canGenerate())) {
        setError("Already generated image today.");
        setLoading(false);
        return;
      }

      setImageBase64(null);

      // Use the new Supabase edge function instead of localhost
      const { data, error } = await supabase.functions.invoke(
        "journal-image-generator",
        {
          body: {
            journalEntry: journals[selectedDay.toDateString()] || "",
            thinkingTraps: selectedTraps,
          },
        }
      );

      if (error) {
        console.error("Edge Function Error:", error);
        throw new Error(`Failed to generate image: ${error.message || error}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Unknown error occurred");
      }

      setImageBase64(data.imageBase64);
      setShowImageModal(true);

      // The edge function already handles recording the generation,
      // but we can update the local state for consistency
      if (user?.id) {
        const { error: upsertErr } = await supabase
          .from("has_generated_image")
          .upsert(
            {
              user_id: user.id,
              created_at: todayStr,
              has_generated: true,
            },
            { onConflict: "user_id, created_at" }
          );
        if (upsertErr)
          console.error("Error saving generation record:", upsertErr);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3); // show 3 days before today initially
    return d;
  });
  const daysToShow = 7;
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
    if (!user?.id || fetchedOnce.current) return;
    fetchedOnce.current = true;

    const fetchJournals = async () => {
      const { data, error } = await supabase
        .from("journals")
        .select("journal_entry, created_at")
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      const journalMap: { [date: string]: string } = {};
      data.forEach((entry) => {
        const date = new Date(entry.created_at).toDateString();
        journalMap[date] = entry.journal_entry;
      });
      setJournals(journalMap);
    };

    fetchJournals();
  }, [user?.id]);

  const handlePlanetClick = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    setFocusedPlanet(planet.name);
  };

  const closePlanetInfo = () => {
    setSelectedPlanet(null);
    setFocusedPlanet(null);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Solar System Canvas */}
      <Canvas
        camera={{ position: [0, 5, 20], fov: 60 }}
        className="absolute inset-0"
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={50}
        />
        <SolarSystemScene
          onPlanetClick={handlePlanetClick}
          focusedPlanet={focusedPlanet}
          backgroundType={backgroundType}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setBackgroundType("stars")}
              variant={backgroundType === "stars" ? "default" : "outline"}
              size="sm"
            >
              Stars
            </Button>
            <Button
              onClick={() => setBackgroundType("milky_way")}
              variant={backgroundType === "milky_way" ? "default" : "outline"}
              size="sm"
            >
              Milky Way
            </Button>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <div className="flex gap-2">
            {user ? (
              <>
                <Button onClick={logout} variant="outline" size="sm">
                  Sign Out
                </Button>
                <Button
                  onClick={() => setShowJournal(true)}
                  variant="default"
                  size="sm"
                >
                  Journal
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                variant="default"
                size="sm"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Chat */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
          <SpaceChatSystem />
        </div>
      </div>

      {/* Planet Info Modal */}
      {selectedPlanet && (
        <PlanetInfo planet={selectedPlanet} onClose={closePlanetInfo} />
      )}

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Journal Modal */}
      {showJournal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Journal</h2>
              <Button
                onClick={() => setShowJournal(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>

            {/* Calendar Navigation */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <Button onClick={handlePrev} variant="outline" size="sm">
                  Previous Week
                </Button>
                <span className="font-medium">
                  {startDate.toDateString()} -{" "}
                  {new Date(
                    startDate.getTime() + (daysToShow - 1) * 24 * 60 * 60 * 1000
                  ).toDateString()}
                </span>
                <Button onClick={handleNext} variant="outline" size="sm">
                  Next Week
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const isSelected =
                    selectedDay.toDateString() === day.toDateString();
                  const hasEntry = journals[day.toDateString()];
                  const isFuture = isFutureDay(day);

                  return (
                    <Button
                      key={day.toDateString()}
                      onClick={() => setSelectedDay(day)}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`h-16 flex flex-col ${
                        hasEntry ? "bg-green-100" : ""
                      } ${isFuture ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={isFuture}
                    >
                      <span className="text-xs">
                        {day.toLocaleDateString("en", { weekday: "short" })}
                      </span>
                      <span className="text-lg">{day.getDate()}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {selectedDay.toDateString()}
              </h3>

              {/* Thinking Traps Selection */}
              <div>
                <h4 className="font-medium mb-2">
                  Thinking Traps (select any that apply):
                </h4>
                <div className="space-y-2">
                  {thinkingTraps.map((trap) => (
                    <label
                      key={trap.title}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTraps.includes(trap.title)}
                        onChange={() => toggleTrap(trap.title)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        <strong>{trap.title}:</strong> {trap.description}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Journal Entry */}
              <div>
                <h4 className="font-medium mb-2">Journal Entry:</h4>
                <textarea
                  value={journals[selectedDay.toDateString()] || ""}
                  onChange={(e) =>
                    setJournals((prev) => ({
                      ...prev,
                      [selectedDay.toDateString()]: e.target.value,
                    }))
                  }
                  placeholder="Write about your day, thoughts, feelings..."
                  className="w-full h-32 p-3 border rounded-lg resize-none"
                />
              </div>

              {/* Image Generation */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Generate Image</h4>
                  <Button
                    onClick={generateImage}
                    disabled={
                      loading || !journals[selectedDay.toDateString()]?.trim()
                    }
                    variant="default"
                    size="sm"
                  >
                    {loading ? "Generating..." : "Generate Image"}
                  </Button>
                </div>
                {error && (
                  <div className="text-red-600 text-sm mb-2">{error}</div>
                )}
              </div>
            </div>

            {/* Image Modal */}
            {showImageModal && imageBase64 && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
                <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Generated Image</h3>
                    <Button
                      onClick={() => setShowImageModal(false)}
                      variant="outline"
                      size="sm"
                    >
                      Close
                    </Button>
                  </div>
                  <img
                    src={`data:image/png;base64,${imageBase64}`}
                    alt="Generated journal visualization"
                    className="w-full h-auto rounded-lg mb-4"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveImage}
                      variant="default"
                      size="sm"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={handleShareImage}
                      variant="outline"
                      size="sm"
                    >
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={async () => {
                try {
                  if (!user?.id) {
                    alert("Please sign in to save.");
                    return;
                  }

                  const payload = {
                    user_id: user.id,
                    thinking_traps: JSON.stringify(selectedTraps),
                    journal_entry: journals[selectedDay.toDateString()] || "",
                    created_at: new Date(selectedDay)
                      .toISOString()
                      .split("T")[0],
                  };

                  const { error } = await supabase
                    .from("journals")
                    .upsert(payload, {
                      onConflict: "user_id, created_at",
                    });

                  if (error) {
                    console.error("Failed to save journal:", error);
                    alert("Failed to save journal.");
                    return;
                  }

                  setShowJournal(false);
                } catch (err) {
                  console.error(err);
                  alert("Unexpected error saving journal.");
                }
              }}
              variant="outline"
              className="w-full mt-4"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
