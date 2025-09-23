/**
 * Lead Capture Service for Cosmic Compass Quiz
 * 
 * Handles submission of quiz results and contact information to Supabase
 */

import { supabase } from "@/lib/supabase";
import { QuizAnswers } from "./quiz-config";

export interface LeadCapturePayload {
  contact: {
    email: string;
    phone: string;
  };
  quiz: {
    answers: QuizAnswers;
    phqTotal: number;
    phqBand: string;
    phqScores: {
      q1: number;
      q2: number;
      q3: number;
      q4: number;
    };
    dominantFlavor: string;
    planetId: string;
    planetName: string;
    age: number | null;
    nationality: string;
    referral: string;
  };
  meta: {
    timestamp: string;
    userAgent: string;
    source: string;
  };
}

/**
 * Submit lead capture data to Supabase
 * Creates a record in the cosmic_compass_leads table
 */
export async function submitLeadCapture(payload: LeadCapturePayload): Promise<void> {
  try {
    // Insert into cosmic_compass_leads table
    const { error } = await supabase
      .from("cosmic_compass_leads")
      .insert([
        {
          email: payload.contact.email || null,
          phone: payload.contact.phone || null,
          quiz_answers: payload.quiz.answers,
          phq_total: payload.quiz.phqTotal,
          phq_band: payload.quiz.phqBand,
          dominant_flavor: payload.quiz.dominantFlavor,
          planet_id: payload.quiz.planetId,
          planet_name: payload.quiz.planetName,
          age: payload.quiz.age,
          nationality: payload.quiz.nationality,
          referral: payload.quiz.referral,
          user_agent: payload.meta.userAgent,
          source: payload.meta.source,
          q1: payload.quiz.phqScores.q1,
          q2: payload.quiz.phqScores.q2,
          q3: payload.quiz.phqScores.q3,
          q4: payload.quiz.phqScores.q4,
          created_at: payload.meta.timestamp,
        }
      ]);

    if (error) {
      throw error;
    }

    // console.log("Lead capture submitted successfully");
  } catch (error) {
    console.error("Error submitting lead capture:", error);
    throw new Error("Failed to save contact information. Please try again.");
  }
}

/**
 * Alternative: Submit to external webhook endpoint
 * Use this if you want to send data to an external service instead of/in addition to Supabase
 */
export async function submitToWebhook(
  endpoint: string, 
  payload: LeadCapturePayload
): Promise<void> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: "cors",
      credentials: "omit"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // console.log("Webhook submission successful");
  } catch (error) {
    console.error("Error submitting to webhook:", error);
    throw new Error("Failed to save contact information. Please try again.");
  }
}
