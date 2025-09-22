import { useState } from "react";
import { useFormattedResult } from "@/hooks/use-quiz-state";
import { PlanetImage } from "./PlanetImage";
import { X } from "lucide-react";

interface ResultsCardProps {
  result: any;
  contactEmail: string;
  contactPhone: string;
  isSubmitting: boolean;
  submitError: string | null;
  showReveal: boolean;
  setContactEmail: (email: string) => void;
  setContactPhone: (phone: string) => void;
  submitAndReveal: (endpoint?: string) => Promise<void>;
}

/**
 * Results card component
 * Shows lead capture form and reveals planet assignment
 */
export function ResultsCard({
  result,
  contactEmail,
  contactPhone,
  isSubmitting,
  submitError,
  showReveal,
  setContactEmail,
  setContactPhone,
  submitAndReveal,
}: ResultsCardProps) {
  const formattedResult = useFormattedResult(result);
  const [showImagePopup, setShowImagePopup] = useState(false);

  if (!formattedResult) {
    return (
      <div className="cosmic-results-card">
        <div className="text-center">Processing your results...</div>
      </div>
    );
  }

  const canSubmit = contactEmail.trim() || contactPhone.trim();

  const handleSubmit = async () => {
    // You can configure the endpoint here or leave empty for simulation
    const LEAD_ENDPOINT = ""; // Add your webhook URL here
    await submitAndReveal(LEAD_ENDPOINT);
    // Show popup after submission
    setShowImagePopup(true);
  };

  const handleShare = () => {
    const title = "My Cosmic Planet";
    const text = `I'm ${formattedResult.planet.name} — what's your planet?`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({ title, text, url });
    } else {
      // Fallback for browsers without Web Share API
      const shareText = `${text}\n${url}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        alert("Share text copied to clipboard!");
      } else {
        alert(shareText);
      }
    }
  };

  return (
    <div className="cosmic-results-card">
      <div className="cosmic-badge">
              Dominant vibe:{" "}
              <strong>{formattedResult.dominantFlavorLabel}</strong>
            </div>
      <h2 className="cosmic-results-title">Unlock your planet</h2>
      <div className="cosmic-results-subtitle">
        Enter your email or phone number to reveal your result. By doing this,
        you agree that you may be contacted by the Singapore Association for
        Mental Health.
      </div>

      {/* Contact Form */}
      <div className="cosmic-input-row">
        <input
          type="email"
          className="cosmic-input"
          placeholder="Email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        <input
          type="tel"
          className="cosmic-input"
          placeholder="Phone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        className="cosmic-cta"
        disabled={!canSubmit || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            <span className="cosmic-loading" />
            Submitting…
          </>
        ) : (
          "Submit & reveal"
        )}
      </button>

      {/* Submit Error */}
      {submitError && (
        <div className="cosmic-submit-message show">{submitError}</div>
      )}

      {/* Results Reveal */}
      {showReveal && (
        <div style={{ marginTop: "12px" }}>
          

          {/* Planet Assignment */}
          <h3 className="cosmic-planet-title">{formattedResult.planet.name}</h3>

          {/* Planet Mascot Image */}
          <div className="planet-image-container">
            <PlanetImage
              planetId={formattedResult.planet.id}
              className="cosmic-planet-mascot"
              alt={`${formattedResult.planet.name} mascot`}
            />
          </div>


          {/* Action Buttons */}
          {/* <a
            href={formattedResult.referralInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cosmic-cta"
          >
            {formattedResult.referralInfo.label}
          </a> */}

          {/* Result Badges */}
          <div className="cosmic-grid2">
            
            <div className="cosmic-badge">
              PHQ-4 band: <strong>{formattedResult.phqBandLabel}</strong>
            </div>
          </div>

          {/* PHQ Note */}
          <div className="cosmic-phq-note">
            PHQ-4 total: <strong>{formattedResult.phqTotal}</strong>. Brief
            sentiments, this is not a diagnosis.
          </div>
        </div>
      )}

      {/* Planet Image Popup */}
      {showImagePopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4"
          onClick={() => setShowImagePopup(false)}
        >
          <div
            className="relative bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowImagePopup(false)}
              className="absolute top-4 right-4 bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 hover:border-slate-500 h-8 w-8 rounded flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Celebration Message */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-green-400 mb-2">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-lg text-slate-100">
                You got <span className="font-bold text-blue-400">{formattedResult.planet.name}</span>!
              </p>
            </div>

            {/* Large Planet Image */}
            <div className="flex justify-center mb-4">
              <PlanetImage
                planetId={formattedResult.planet.id}
                className="w-full max-w-sm rounded-lg border-2 border-slate-600"
                alt={`${formattedResult.planet.name} mascot`}
              />
            </div>

            {/* Share Button */}
            <div className="text-center mb-4">
              <button className="cosmic-cta alt w-full" onClick={handleShare}>
                Share your Cosmic Affinity
              </button>
            </div>

            {/* Close Instructions */}
            <div className="text-center text-slate-300">
              <p className="text-sm">
                Click anywhere outside to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
