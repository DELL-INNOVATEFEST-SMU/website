import { useState, useEffect, useRef } from "react";

interface Sound {
  id: string;
  name: string;
  icon: string; // optional path or emoji
  src: string; // audio file url
}

const sounds: Sound[] = [
  { id: "rain", name: "Rain", icon: "🌧️", src: "/sounds/rain.mp3" },
  { id: "forest", name: "Forest", icon: "🌲", src: "/sounds/forest.mp3" },
  { id: "waves", name: "Waves", icon: "🌊", src: "/sounds/ocean.mp3" },
];

export default function CalmSoundsMixer({
  onClose: _onClose,
}: {
  onClose: () => void;
}) {
  const [activeSounds, setActiveSounds] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Initialize volumes (50%) on mount
    const initialVolumes: Record<string, number> = {};
    sounds.forEach(({ id }) => {
      initialVolumes[id] = 0.5;
    });
    setVolumes(initialVolumes);
  }, []);

  useEffect(() => {
    // Play/pause and update volume on activeSounds or volumes change
    sounds.forEach(({ id }) => {
      let audio = audioRefs.current[id];
      if (!audio) {
        audio = new Audio();
        audio.loop = true;
        audio.src = sounds.find((s) => s.id === id)?.src ?? "";
        console.log("Loading sound:", audio.src);
        audioRefs.current[id] = audio;
      }
      if (activeSounds[id]) {
        audio.volume = volumes[id] ?? 0.5;
        audio.play().catch(() => {}); // ignore play() promise rejection
      } else {
        audio.pause();
      }
    });
  }, [activeSounds, volumes]);

  const toggleSound = (id: string) => {
    setActiveSounds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const changeVolume = (id: string, volume: number) => {
    setVolumes((prev) => ({
      ...prev,
      [id]: volume,
    }));
  };

  return (
    <div className="max-w-md p-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl">
      <h2 className="text-xl font-semibold mb-4 text-slate-100">
        Calm Sounds Mixer
      </h2>
      {sounds.map(({ id, name, icon }) => (
        <div key={id} className="flex items-center mb-4 space-x-4">
          <button
            onClick={() => toggleSound(id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xl border transition-colors ${
              activeSounds[id]
                ? "bg-cyan-600 text-white border-cyan-500/50"
                : "bg-slate-700 text-slate-300 border-slate-600/50 hover:bg-slate-600"
            }`}
            aria-label={`Toggle ${name} sound`}
          >
            {icon}
          </button>
          <span className="w-20 text-slate-200">{name}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volumes[id] ?? 0.5}
            disabled={!activeSounds[id]}
            onChange={(e) => changeVolume(id, Number(e.target.value))}
            className="flex-1 accent-cyan-500"
          />
        </div>
      ))}
    </div>
  );
}
