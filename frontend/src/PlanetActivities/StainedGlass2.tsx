"use client";

import React, { useState } from "react";

const COLORS = ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#F472B6", "#FCD34D"];

const shapes = [
  // Center circle
  { id: "c1", type: "circle", cx: 50, cy: 50, r: 20 },
  // Inner ring petals
  { id: "p1", type: "polygon", points: "50,10 55,30 45,30" },
  { id: "p2", type: "polygon", points: "90,50 70,55 70,45" },
  { id: "p3", type: "polygon", points: "50,90 55,70 45,70" },
  { id: "p4", type: "polygon", points: "10,50 30,55 30,45" },
  // Outer ring triangles
  { id: "t1", type: "polygon", points: "50,0 60,20 40,20" },
  { id: "t2", type: "polygon", points: "100,50 80,60 80,40" },
  { id: "t3", type: "polygon", points: "50,100 60,80 40,80" },
  { id: "t4", type: "polygon", points: "0,50 20,60 20,40" },
  // Four corner diamonds
  { id: "d1", type: "polygon", points: "25,25 35,35 25,45 15,35" },
  { id: "d2", type: "polygon", points: "75,25 85,35 75,45 65,35" },
  { id: "d3", type: "polygon", points: "75,75 85,65 75,55 65,65" },
  { id: "d4", type: "polygon", points: "25,75 35,65 25,55 15,65" },
];

export default function StainedGlassWithPalette() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [fills, setFills] = useState<{ [key: string]: string }>({});

  const handleFill = (id: string) => {
    setFills((prev) => ({ ...prev, [id]: selectedColor }));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Color Palette */}
      <div className="flex flex-wrap justify-center gap-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className="w-8 h-8 rounded-full border-2 border-gray-300"
            style={{
              backgroundColor: color,
              outline: selectedColor === color ? "3px solid black" : "none",
            }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      {/* Stained Glass SVG */}
      <svg
        viewBox="0 0 100 100"
        className="border-4 border-gray-400 rounded-md"
        style={{ width: 250, height: 250, cursor: "pointer" }}
      >
        {shapes.map((shape) => {
          if (shape.type === "circle") {
            return (
              <circle
                key={shape.id}
                cx={shape.cx}
                cy={shape.cy}
                r={shape.r}
                fill={fills[shape.id] || "#EEE"}
                stroke="#333"
                onClick={() => handleFill(shape.id)}
              />
            );
          } else if (shape.type === "polygon") {
            return (
              <polygon
                key={shape.id}
                points={shape.points}
                fill={fills[shape.id] || "#EEE"}
                stroke="#333"
                onClick={() => handleFill(shape.id)}
              />
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}
