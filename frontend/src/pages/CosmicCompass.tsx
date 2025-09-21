import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuizContainer } from "../components/quiz/QuizContainer";
import { StarField } from "../components/quiz/StarField";
import { useIsMobile } from "@/hooks/use-mobile";
import "@/styles/cosmic-compass.css";

/**
 * Cosmic Compass Quiz Page
 *
 * A mental health screening quiz that assigns users to planets based on their
 * personality traits and PHQ-4 scores, with lead capture for SAMH.
 */
export default function CosmicCompass() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const BackButton = () => (
    <Button
      variant="ghost"
      onClick={() => navigate("/")}
      className={
        isMobile
          ? "w-full mobile-back-button text-white hover:bg-white/10 border border-white/20"
          : "fixed top-4 left-4 text-white hover:bg-white/10 z-10"
      }
    >
      ← Back to Solar System
    </Button>
  );

  return (
    <div className="cosmic-compass-page">
      <StarField />

      {/* Desktop back button - positioned at top-left */}
      {!isMobile && <BackButton />}

      <div className="cosmic-compass-container">
        {/* Header */}
        <header className="cosmic-compass-header">
          <div className="text-center">
            <h1 className="cosmic-compass-title">✦ Cosmic Compass ✦</h1>
            <div className="cosmic-compass-subtitle">
              Ready for your cosmic journey? Take this quiz to see if you're all
              systems go, including your mental wellbeing.
            </div>
          </div>
        </header>

        {/* Quiz Container */}
        <QuizContainer />

        {/* Mobile back button - positioned at bottom */}
        {isMobile && <BackButton />}
      </div>
    </div>
  );
}
