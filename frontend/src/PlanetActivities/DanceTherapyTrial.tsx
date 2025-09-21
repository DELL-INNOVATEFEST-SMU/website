import { useState, useEffect, useRef } from "react";

interface DanceStep {
  name: string;
  description: string;
  durationSeconds: number;
  animationClass: string; // CSS animation class
}

const danceSteps: DanceStep[] = [
  {
    name: "Sway Side to Side",
    description:
      "Gently sway your body from left to right. Feel the rhythm flow through you.",
    durationSeconds: 20,
    animationClass: "animate-sway-side-to-side",
  },
  {
    name: "Circle Arms",
    description:
      "Slowly make big circles with your arms, expressing openness and release.",
    durationSeconds: 20,
    animationClass: "animate-circle-arms",
  },
  {
    name: "Step Forward and Back",
    description:
      "Take soft steps forward and back, rooting and releasing tension.",
    durationSeconds: 20,
    animationClass: "animate-step-forward-back",
  },
  {
    name: "Free Expression",
    description:
      "Move however feels good to you. Let your body guide your dance.",
    durationSeconds: 30,
    animationClass: "animate-free-expression",
  },
];

export default function DanceTherapyTrial({
  onClose: _onClose,
}: {
  onClose: () => void;
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(danceSteps[0].durationSeconds);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          if (currentStepIdx < danceSteps.length - 1) {
            setCurrentStepIdx((i) => i + 1);
            setSecondsLeft(danceSteps[currentStepIdx + 1].durationSeconds);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentStepIdx]);

  const step = danceSteps[currentStepIdx];

  return (
    <div className="max-w-md p-6 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl relative flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold text-slate-100">{step.name}</h2>

      <div
        className={`w-48 h-48 bg-slate-800/60 border border-slate-600/50 rounded-lg flex items-center justify-center ${step.animationClass}`}
      >
        {/* You can add SVG or image here for visualization */}
        <span className="text-lg italic text-green-400">Dance Move</span>
      </div>

      <p className="text-center text-slate-300">{step.description}</p>

      <div className="text-2xl font-bold text-green-400">{secondsLeft}s</div>

      <div className="flex justify-center gap-2">
        {danceSteps.map((_, idx) => (
          <span
            key={idx}
            className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
              idx === currentStepIdx ? "bg-green-500" : "bg-slate-600"
            }`}
            onClick={() => {
              setCurrentStepIdx(idx);
              setSecondsLeft(danceSteps[idx].durationSeconds);
            }}
          />
        ))}
      </div>
    </div>
  );
}
