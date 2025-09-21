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

export default function ThinkingTrapBreaker({ onClose: _onClose }: { onClose: () => void }) {
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Thinking Trap Breaker</h2>
      <div
        className={`w-full p-6 rounded-lg shadow cursor-pointer transition-transform duration-500 ${
          showReframe ? "bg-green-100" : "bg-red-100"
        }`}
        onClick={handleBreakTrap}
        aria-live="polite"
      >
        <p className="text-center text-lg font-medium">
          {showReframe ? currentTrap.reframe : currentTrap.trap}
        </p>
        {!showReframe && (
          <p className="text-center mt-2 text-sm text-gray-700">
            Click {totalClicksToBreak - clickCount} more times to break this trap
          </p>
        )}
      </div>

      {showReframe && currentIndex < traps.length - 1 && (
        <button
          onClick={handleNextTrap}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next Trap
        </button>
      )}

      {showReframe && currentIndex === traps.length - 1 && (
        <div className="mt-6 text-center text-green-700 font-semibold">
          You've broken all traps! Great job!
        </div>
      )}

      <div className="mt-4">
        Score: {score} / {traps.length}
      </div>
    </div>
  );
};
