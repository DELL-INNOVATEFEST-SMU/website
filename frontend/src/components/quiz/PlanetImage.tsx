import React from "react";

interface PlanetImageProps {
  planetId: string;
  className?: string;
  alt?: string;
}

/**
 * Planet mascot image component
 * Maps planet IDs to their corresponding mascot images
 */
export function PlanetImage({
  planetId,
  className = "",
  alt,
}: PlanetImageProps) {
  // Map planet IDs to mascot image filenames
  const planetImageMap: Record<string, string> = {
    earth: "earth_art.JPG",
    jupiter: "jupiter_art.JPG",
    mars: "mars_art.JPG",
    mercury: "mercury_art.JPG",
    neptune: "neptune_art.JPG",
    saturn: "saturn_art.jpg",
    uranus: "uranus_art.JPG",
    venus: "venus_art.jpg",
    pluto: "pluto_art.jpg",
  };

  const imageFilename = planetImageMap[planetId];

  if (!imageFilename) {
    // Handle missing images (like Pluto) with a fallback
    return (
      <div className={`planet-image-fallback ${className}`}>
        <div className="planet-symbol">{planetId.charAt(0).toUpperCase()}</div>
      </div>
    );
  }

  const defaultAlt =
    alt || `${planetId.charAt(0).toUpperCase() + planetId.slice(1)} mascot`;

  return (
    <img
      src={`/mascots/${imageFilename}`}
      alt={defaultAlt}
      className={`planet-image ${className}`}
      loading="lazy"
    />
  );
}
