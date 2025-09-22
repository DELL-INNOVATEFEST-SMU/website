import { useState } from "react";

interface Trap {
  id: number;
  trap: string;
  reframe: string;
}

const traps: Trap[] = [
  {
    id: 1,
    trap: "I always mess up everything.",
    reframe: "Everyone makes mistakes, and I'm learning to improve.",
  },
  {
    id: 2,
    trap: "If I fail, it means I am worthless.",
    reframe: "Failure is a step to growth, not a judgement of my worth.",
  },
  {
    id: 3,
    trap: "Nothing will ever get better.",
    reframe: "Change takes time. I can make progress, one step at a time.",
  },
  {
    id: 4,
    trap: "I have to do everything perfectly.",
    reframe: "It's okay to be imperfect. Doing my best is enough.",
  },
];

export default function ThinkingTrapBreaker({
  onClose: _onClose,
}: {
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [score, setScore] = useState(0);
  const [showReframe, setShowReframe] = useState(false);
  const totalClicksToBreak = 5;

  const currentTrap = traps[currentIndex];

  const handleBreakTrap = () => {
    if (showReframe) return; // do nothing if already revealed reframe
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= totalClicksToBreak) {
      setShowReframe(true);
      setScore(score + 1);
    }
  };

  const handleNextTrap = () => {
    if (currentIndex < traps.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setClickCount(0);
      setShowReframe(false);
    }
  };

  return (
    <div className="w-full mx-auto p-4 sm:p-6 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl flex flex-col items-center">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-100 text-center">
        Thinking Trap Breaker
      </h2>
      <div
        className={`w-full p-4 sm:p-6 rounded-lg shadow-2xl cursor-pointer transition-transform duration-500 border min-h-[120px] sm:min-h-[140px] flex flex-col justify-center ${
          showReframe
            ? "bg-green-900/30 border-green-500/50"
            : "bg-red-900/30 border-red-500/50"
        }`}
        onClick={handleBreakTrap}
        aria-live="polite"
      >
        <p className="text-center text-base sm:text-lg font-medium text-slate-100">
          {showReframe ? currentTrap.reframe : currentTrap.trap}
        </p>
        {!showReframe && (
          <p className="text-center mt-2 text-sm text-slate-300">
            Click {totalClicksToBreak - clickCount} more times to break this
            trap
          </p>
        )}
      </div>

      {showReframe && currentIndex < traps.length - 1 && (
        <button
          onClick={handleNextTrap}
          className="mt-4 sm:mt-6 px-4 py-3 sm:py-2 bg-slate-900/95 border border-green-500 text-green-400 rounded shadow hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 min-h-[44px] touch-manipulation"
        >
          Next Trap
        </button>
      )}

      {showReframe && currentIndex === traps.length - 1 && (
        <div className="mt-4 sm:mt-6 text-center text-green-400 font-semibold text-sm sm:text-base">
          You've broken all traps! Great job!
        </div>
      )}

      <div className="mt-4 text-slate-300 text-sm sm:text-base">
        Score: <span className="text-cyan-400 font-semibold">{score}</span> /{" "}
        <span className="text-slate-400">{traps.length}</span>
      </div>
    </div>
  );
}
