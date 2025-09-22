import React, { useEffect, useRef, useState } from "react";
import { useResponsive } from "@/hooks/use-mobile";

const PHASES = ["Inhale", "Hold", "Exhale", "Hold"];
const DEFAULT_SIDE_SECONDS = 4; // default 4s per side

export default function BoxBreathingModal({
  onClose: _onClose,
}: {
  onClose: () => void;
}) {
  const { isMobile, isSmallMobile } = useResponsive();
  const [running, setRunning] = useState(false);
  const [sideSeconds, setSideSeconds] = useState(DEFAULT_SIDE_SECONDS);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedOffset, setPausedOffset] = useState(0); // seconds elapsed when paused
  const rafRef = useRef<number | null>(null);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSecRemaining, setPhaseSecRemaining] = useState(sideSeconds);

  // percentage positions for the dot (0..100)
  const [dotPct, setDotPct] = useState({ x: 0, y: 0 });

  const squareRef = useRef<HTMLDivElement | null>(null);

  const cycleDuration = sideSeconds * 4;

  function start() {
    if (!running) {
      setRunning(true);
      const now = performance.now();
      setStartTime(now - pausedOffset * 1000);
    }
  }

  function pause() {
    if (running) {
      setRunning(false);
      if (startTime !== null) {
        const elapsedMs = performance.now() - startTime;
        setPausedOffset(elapsedMs / 1000);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  }

  function reset() {
    setRunning(false);
    setStartTime(null);
    setPausedOffset(0);
    setPhaseIndex(0);
    setPhaseSecRemaining(sideSeconds);
    setDotPct({ x: 0, y: 0 });
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  // core animation loop (uses percentages so it's responsive)
  useEffect(() => {
    function tick() {
      const now = performance.now();
      if (startTime === null) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsedSecTotal = (now - startTime) / 1000;
      // wrap into cycle
      const elapsedInCycle =
        ((elapsedSecTotal % cycleDuration) + cycleDuration) % cycleDuration;

      const phase = Math.floor(elapsedInCycle / sideSeconds) % 4; // 0..3
      setPhaseIndex(phase);

      const phaseElapsed = elapsedInCycle - phase * sideSeconds; // 0..sideSeconds
      setPhaseSecRemaining(Math.max(0, Math.ceil(sideSeconds - phaseElapsed)));

      const progress = phaseElapsed / sideSeconds; // 0..1 within current side

      // compute percentage position within square:
      // phase 0: top edge left->right
      // phase 1: right edge top->bottom
      // phase 2: bottom edge right->left
      // phase 3: left edge bottom->top
      let xPct = 0;
      let yPct = 0;
      if (phase === 0) {
        xPct = progress * 100;
        yPct = 0;
      } else if (phase === 1) {
        xPct = 100;
        yPct = progress * 100;
      } else if (phase === 2) {
        xPct = 100 - progress * 100;
        yPct = 100;
      } else {
        xPct = 0;
        yPct = 100 - progress * 100;
      }

      // center offset applied via transform in style
      setDotPct({ x: xPct, y: yPct });

      rafRef.current = requestAnimationFrame(tick);
    }

    if (running) {
      if (startTime === null) {
        setStartTime(performance.now() - pausedOffset * 1000);
      }
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, startTime, pausedOffset, sideSeconds]);

  useEffect(() => {
    setPhaseSecRemaining(sideSeconds);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sideSeconds]);

  // dot CSS (percent positioning + translate to center)
  const dotStyle: React.CSSProperties = {
    position: "absolute",
    left: `${dotPct.x}%`,
    top: `${dotPct.y}%`,
    transform: "translate(-50%, -50%)",
    width: 16,
    height: 16,
    borderRadius: 9999,
    background: "linear-gradient(135deg,#0ea5e9,#7dd3fc)",
    boxShadow: "0 6px 18px rgba(14,165,233,0.25)",
    zIndex: 10,
    transition: "none", // RAF updates frequently; avoid CSS transitions
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 text-slate-100 rounded-lg relative flex flex-col items-center gap-4 sm:gap-6 shadow-2xl">
      <p className="mb-4 text-sm sm:text-base text-slate-300 text-center">
        Follow a 4-4-4-4 pattern. The dot moves around the square — inhale
        (top), hold (right), exhale (bottom), hold (left).
      </p>

      {/* Breathing box responsive */}
      <div
        ref={squareRef}
        className="relative bg-slate-800/60 border border-slate-700/50 rounded-lg shadow-2xl"
        style={{
          width: "100%",
          maxWidth: isSmallMobile ? "280px" : "400px",
          aspectRatio: "1 / 1",
        }}
      >
        {/* square outline */}
        <div className="absolute inset-0 rounded-md border-6 border-cyan-400/50 box-border" />
        {/* moving dot */}
        <div style={dotStyle} aria-hidden />
        {/* center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-base sm:text-lg font-medium text-slate-200">
            {PHASES[phaseIndex]}
          </div>
          <div className="text-2xl sm:text-4xl font-bold mt-2 text-cyan-400">
            {phaseSecRemaining}s
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {!running ? (
          <button
            onClick={start}
            className="flex-1 px-4 py-2 bg-slate-900/95 border border-green-500 text-green-400 rounded shadow hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 min-h-[44px] touch-manipulation"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex-1 px-4 py-2 bg-slate-900/95 border border-yellow-500 text-yellow-400 rounded shadow hover:bg-yellow-500/20 hover:text-yellow-300 hover:border-yellow-400 min-h-[44px] touch-manipulation"
          >
            Pause
          </button>
        )}

        <button
          onClick={reset}
          className="flex-1 px-4 py-2 bg-slate-900/95 border border-slate-600 text-slate-300 rounded shadow hover:bg-slate-700/50 hover:text-slate-200 hover:border-slate-500 min-h-[44px] touch-manipulation"
        >
          Reset
        </button>
      </div>

      {/* Seconds per side slider */}
      <div className="w-full max-w-md">
        <label className="block text-sm font-medium mb-2 text-slate-200">
          Seconds per side
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={2}
            max={8}
            value={sideSeconds}
            onChange={(e) => setSideSeconds(Number(e.target.value))}
            className="w-full accent-cyan-500"
            disabled={running}
          />
          <div className="w-12 text-right text-cyan-400">{sideSeconds}s</div>
        </div>
      </div>

      {/* How it works */}
      <div className="w-full max-w-md text-slate-300 text-sm sm:text-base leading-relaxed">
        <h3 className="font-semibold mb-2 text-slate-100">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 mb-4">
          <li>
            Inhale for <strong className="text-cyan-400">{sideSeconds}s</strong>{" "}
            while dot moves across top edge.
          </li>
          <li>
            Hold breath for{" "}
            <strong className="text-cyan-400">{sideSeconds}s</strong> while dot
            moves down right edge.
          </li>
          <li>
            Exhale for <strong className="text-cyan-400">{sideSeconds}s</strong>{" "}
            while dot moves across bottom edge.
          </li>
          <li>
            Hold for <strong className="text-cyan-400">{sideSeconds}s</strong>{" "}
            while dot moves up left edge.
          </li>
        </ol>
        <h3 className="font-semibold mb-2 text-slate-100">Tips</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Focus on smooth, steady breathing.</li>
          <li>Repeat 4–6 cycles to feel calmer.</li>
          <li>Use the timer to match your breathing pace.</li>
        </ul>
      </div>

      {/* Controls */}
    </div>
  );
}
