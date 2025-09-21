import React, { useState, useEffect } from "react";

interface Leaf {
  id: number;
  text: string;
  color: string;
  x?: number; // animation position X percent
}

const initialColors = ["#A3D9A5", "#F4C95D", "#A4CED4", "#FFC4C4", "#B9A6F2"];

export default function DragLeaves({ onClose: _onClose }: { onClose: () => void }) {
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
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      

      <p className="mb-6 text-center text-gray-700">
        Type your worry, add a leaf, then drag it to the stream to let it flow away.
      </p>

      {/* Input to add worries */}
      <div className="flex gap-2 mb-6">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your worry here"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={addLeaf}
          disabled={inputText.trim() === ""}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Add Leaf
        </button>
      </div>

      {/* Leaves available to drag */}
      <div className="flex gap-4 mb-8 justify-center flex-wrap">
        {leaves.map((leaf) => (
          <div
            key={leaf.id}
            draggable
            onDragStart={(e) => handleDragStart(e, leaf.id)}
            className="min-w-[80px] min-h-[80px] rounded-xl flex items-center justify-center cursor-grab select-none p-4"
            style={{
              backgroundColor: leaf.color,
              userSelect: "none",
              whiteSpace: "normal",
              textAlign: "center",
            }}
            title={leaf.text}
          >
            {leaf.text}
          </div>
        ))}
      </div>

      {/* Stream drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative h-40 bg-blue-200 rounded-lg border-4 border-blue-400 overflow-hidden"
        aria-label="Stream drop area"
      >
        {droppedLeaves.length === 0 && (
          <p className="text-center w-full text-gray-500 mt-12">
            Drop leaves here to gently let go of your worries...
          </p>
        )}

        {droppedLeaves.map((leaf) => (
          <div
            key={leaf.id}
            className="absolute top-1/2 transform -translate-y-1/2 rounded-xl flex items-center justify-center px-4 py-2 text-white font-semibold shadow-lg select-none"
            style={{
              backgroundColor: leaf.color,
              left: `${leaf.x}%`,
              whiteSpace: "normal",
              transition: "left 0.1s linear",
            }}
          >
            {leaf.text}
          </div>
        ))}
      </div>
    </div>
  );
};
