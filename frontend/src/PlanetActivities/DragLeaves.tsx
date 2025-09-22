import React, { useState, useEffect } from "react";

interface Leaf {
  id: number;
  text: string;
  color: string;
  x?: number; // animation position X percent
}

const initialColors = ["#A3D9A5", "#F4C95D", "#A4CED4", "#FFC4C4", "#B9A6F2"];

export default function DragLeaves({
  onClose: _onClose,
}: {
  onClose: () => void;
}) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [droppedLeaves, setDroppedLeaves] = useState<Leaf[]>([]);
  const [inputText, setInputText] = useState("");
  const [nextId, setNextId] = useState(1);

  // Add new leaf from user input
  const addLeaf = () => {
    if (inputText.trim() === "") return;
    const newLeaf: Leaf = {
      id: nextId,
      text: inputText.trim(),
      color: initialColors[Math.floor(Math.random() * initialColors.length)],
    };
    setLeaves((prev) => [...prev, newLeaf]);
    setNextId((id) => id + 1);
    setInputText("");
  };

  // Handle drag start
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    leafId: number
  ) => {
    event.dataTransfer.setData("text/plain", leafId.toString());
  };

  // Handle drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const leafIdStr = event.dataTransfer.getData("text/plain");
    const leafId = parseInt(leafIdStr, 10);
    const leaf = leaves.find((l) => l.id === leafId);
    if (leaf && !droppedLeaves.find((l) => l.id === leaf.id)) {
      // Initialize x position at 0%
      setDroppedLeaves((prev) => [...prev, { ...leaf, x: 0 }]);
      setLeaves((prev) => prev.filter((l) => l.id !== leafId));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Animate dropped leaves moving across and eventually removing
  useEffect(() => {
    if (droppedLeaves.length === 0) return;

    let animationId: number;

    const animate = () => {
      setDroppedLeaves((prev) => {
        const newDropped = prev
          .map((leaf) => {
            if (leaf.x === undefined) return { ...leaf, x: 0 };
            return { ...leaf, x: leaf.x + 0.005 }; // move 0.5% per frame (adjust speed)
          })
          .filter((leaf) => leaf.x !== undefined && leaf.x < 100); // remove past 100%

        if (newDropped.length === 0) {
          cancelAnimationFrame(animationId);
          return newDropped;
        }
        animationId = requestAnimationFrame(animate);
        return newDropped;
      });
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [droppedLeaves]);

  return (
    <div className="w-full mx-auto p-4 sm:p-6 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl">
      <p className="mb-4 sm:mb-6 text-center text-slate-300 text-sm sm:text-base">
        Type your worry, add a leaf, then drag it to the stream to let it flow
        away.
      </p>

      {/* Input to add worries */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your worry here"
          className="flex-1 p-3 sm:p-2 border border-slate-600/50 rounded bg-slate-800/60 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm sm:text-base"
        />
        <button
          onClick={addLeaf}
          disabled={inputText.trim() === ""}
          className="px-4 py-3 sm:py-2 bg-slate-900/95 border border-green-500 text-green-400 rounded shadow hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
        >
          Add Leaf
        </button>
      </div>

      {/* Leaves available to drag */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center">
        {leaves.map((leaf) => (
          <div
            key={leaf.id}
            draggable
            onDragStart={(e) => handleDragStart(e, leaf.id)}
            className="min-w-[80px] min-h-[80px] rounded-xl flex items-center justify-center cursor-grab select-none p-3 sm:p-4 touch-manipulation"
            style={{
              backgroundColor: leaf.color,
              userSelect: "none",
              whiteSpace: "normal",
              textAlign: "center",
            }}
            title={leaf.text}
          >
            <span className="text-xs sm:text-sm font-medium">{leaf.text}</span>
          </div>
        ))}
      </div>

      {/* Stream drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative h-32 sm:h-40 bg-blue-200 rounded-lg border-4 border-blue-400 overflow-hidden"
        aria-label="Stream drop area"
      >
        {droppedLeaves.length === 0 && (
          <p className="text-center w-full text-gray-500 mt-8 sm:mt-12 text-sm sm:text-base">
            Drop leaves here to gently let go of your worries...
          </p>
        )}

        {droppedLeaves.map((leaf) => (
          <div
            key={leaf.id}
            className="absolute top-1/2 transform -translate-y-1/2 rounded-xl flex items-center justify-center px-3 sm:px-4 py-2 text-white font-semibold shadow-lg select-none"
            style={{
              backgroundColor: leaf.color,
              left: `${leaf.x}%`,
              whiteSpace: "normal",
              transition: "left 0.1s linear",
            }}
          >
            <span className="text-xs sm:text-sm">{leaf.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
