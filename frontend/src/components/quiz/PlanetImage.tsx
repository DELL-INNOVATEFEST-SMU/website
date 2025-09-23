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
    earth: "earth.png",
    jupiter: "jupiter.png",
    mars: "mars.png",
    mercury: "mercury.png",
    neptune: "neptune.png",
    saturn: "saturn.png",
    uranus: "uranus.png",
    venus: "venus.png",
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
      src={`/quizResults/${imageFilename}`}
      alt={defaultAlt}
      className={`planet-image ${className}`}
      loading="lazy"
    />
  );
}
