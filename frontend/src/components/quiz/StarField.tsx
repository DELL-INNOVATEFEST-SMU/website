/**
 * Animated starfield background component
 * Creates a cosmic atmosphere with twinkling stars
 */
export function StarField() {
  return (
    <div className="cosmic-stars" aria-hidden="true">
      <div className="cosmic-star" style={{ top: "8%", left: "8%" }} />
      <div className="cosmic-star" style={{ top: "20%", left: "70%" }} />
      <div className="cosmic-star" style={{ top: "60%", left: "20%" }} />
      <div className="cosmic-star" style={{ top: "80%", left: "85%" }} />
      <div className="cosmic-star" style={{ top: "35%", left: "40%" }} />
      <div className="cosmic-star" style={{ top: "15%", left: "25%" }} />
      <div className="cosmic-star" style={{ top: "45%", left: "75%" }} />
      <div className="cosmic-star" style={{ top: "70%", left: "10%" }} />
      <div className="cosmic-star" style={{ top: "25%", left: "90%" }} />
      <div className="cosmic-star" style={{ top: "55%", left: "60%" }} />
    </div>
  );
}
