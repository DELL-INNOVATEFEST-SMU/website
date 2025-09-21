import React from "react";
import { useFormattedResult } from "@/hooks/use-quiz-state";
import { Button } from "@/components/ui/button";
import { submitLeadCapture } from "@/lib/cosmic-compass/lead-capture";
import { buildLeadPayload } from "@/lib/cosmic-compass/quiz-logic";
import { PlanetImage } from "./PlanetImage";

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
          {/* Result Badges */}
          <div className="cosmic-grid2">
            <div className="cosmic-badge">
              Dominant vibe:{" "}
              <strong>{formattedResult.dominantFlavorLabel}</strong>
            </div>
            <div className="cosmic-badge">
              PHQ-4 band: <strong>{formattedResult.phqBandLabel}</strong>
            </div>
          </div>

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

          <div className="cosmic-planet-description">
            {formattedResult.planetDescription}
          </div>

          {/* Action Buttons */}
          <a
            href={formattedResult.referralInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cosmic-cta"
          >
            {formattedResult.referralInfo.label}
          </a>

          <button className="cosmic-cta alt" onClick={handleShare}>
            Share your Cosmic Affinity
          </button>

          {/* PHQ Note */}
          <div className="cosmic-phq-note">
            PHQ-4 total: <strong>{formattedResult.phqTotal}</strong>. Brief
            sentiments, this is not a diagnosis.
          </div>
        </div>
      )}
    </div>
  );
}
