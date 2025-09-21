/**
 * Cosmic Compass Quiz Logic
 * 
 * Core logic for processing quiz answers, calculating scores,
 * and determining planet assignments and referral routes
 */

import { QuizAnswers, QuizResult, PLANET_MATRIX, PLANET_DESCRIPTIONS } from "./quiz-config";

/**
 * Calculate PHQ-4 total score from answers
 */
export function calculatePHQScore(answers: QuizAnswers): number {
  const phqIds = ["phq1", "phq2", "phq3", "phq4"];
  return phqIds.reduce((total, id) => {
    return total + (answers[id]?.score || 0);
  }, 0);
}

/**
 * Determine PHQ-4 severity band
 */
export function getPHQBand(total: number): "normal" | "mild" | "elevated" {
  if (total <= 2) return "normal";
  if (total <= 5) return "mild";
  return "elevated";
}

/**
 * Calculate dominant personality flavor from planet questions
 */
export function getDominantFlavor(answers: QuizAnswers): string {
  const flavorCounts = { fire: 0, ice: 0, water: 0, air: 0 };
  
  // Count tags from planet questions (pq1-pq8)
  Object.entries(answers).forEach(([id, answer]) => {
    if (id.startsWith("pq") && answer?.tag) {
      const flavor = answer.tag as keyof typeof flavorCounts;
      if (flavorCounts.hasOwnProperty(flavor)) {
        flavorCounts[flavor]++;
      }
    }
  });
  
  // Find the flavor with the highest count
  const entries = Object.entries(flavorCounts) as [string, number][];
  const [dominantFlavor] = entries.sort((a, b) => b[1] - a[1])[0];
  
  return dominantFlavor || "fire"; // Default fallback
}

/**
 * Get age from birth year answer
 */
export function getAge(answers: QuizAnswers): number | null {
  const yearAnswer = answers.yob?.year;
  if (!yearAnswer) return null;
  
  const birthYear = parseInt(yearAnswer.trim(), 10);
  const currentYear = new Date().getFullYear();
  
  if (Number.isInteger(birthYear) && birthYear >= 1900 && birthYear <= currentYear) {
    return currentYear - birthYear;
  }
  
  return null;
}

/**
 * Get nationality from answers
 */
export function getNationality(answers: QuizAnswers): string {
  return answers.nat?.nat || "";
}

/**
 * Determine referral route based on age and nationality
 */
export function getReferralRoute(age: number | null, nationality: string): "samh" | "comit" | "limitless" {
  const isSGCitizen = nationality === "sg";
  
  if (isSGCitizen && age !== null) {
    if (age >= 12 && age <= 25) {
      return "samh"; // SAMH Telegram bot for youth
    } else if (age > 25) {
      return "comit"; // COMIT for adults
    }
  }
  
  return "limitless"; // Default for non-citizens or edge cases
}

/**
 * Get referral URL and label
 */
export function getReferralInfo(referral: "samh" | "comit" | "limitless") {
  const routes = {
    samh: {
      label: "Proceed to SAMH Telegram bot",
      url: "https://t.me/CommanderSam_bot"
    },
    comit: {
      label: "Proceed to COMIT",
      url: "https://supportgowhere.life.gov.sg/services/SVC-CITC/community-intervention-team-comit"
    },
    limitless: {
      label: "Proceed to Limitless",
      url: "https://www.limitless.sg/"
    }
  };
  
  return routes[referral];
}

/**
 * Get PHQ band label with score range
 */
export function getPHQBandLabel(band: "normal" | "mild" | "elevated"): string {
  const labels = {
    normal: "Normal (0–2)",
    mild: "Mild (3–5)",
    elevated: "Elevated (6–12)"
  };
  
  return labels[band];
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

/**
 * Process all quiz answers and generate complete result
 */
export function processQuizAnswers(answers: QuizAnswers): QuizResult {
  const phqTotal = calculatePHQScore(answers);
  const phqBand = getPHQBand(phqTotal);
  const dominantFlavor = getDominantFlavor(answers);
  const age = getAge(answers);
  const nationality = getNationality(answers);
  const referral = getReferralRoute(age, nationality);
  
  // Get planet assignment
  const planet = PLANET_MATRIX[dominantFlavor][phqBand];
  
  return {
    phqTotal,
    phqBand,
    dominantFlavor,
    planet,
    age,
    nationality,
    referral
  };
}

/**
 * Validate if a question is properly answered
 */
export function isQuestionAnswered(questionId: string, questionType: string, answers: QuizAnswers): boolean {
  const answer = answers[questionId];
  
  if (!answer) return false;
  
  switch (questionType) {
    case "phq":
    case "planet":
      return answer.score !== undefined || answer.tag !== undefined;
      
    case "input_year":
      const year = parseInt((answer.year || "").trim(), 10);
      const currentYear = new Date().getFullYear();
      return Number.isInteger(year) && year >= 1900 && year <= currentYear;
      
    case "select_nat":
      const nat = answer.nat || "";
      return nat === "sg" || nat === "spr" || nat === "non-sg";
      
    default:
      return true;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const trimmed = (email || "").trim();
  const atIndex = trimmed.indexOf("@");
  const dotIndex = trimmed.lastIndexOf(".");
  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1;
}

/**
 * Validate phone number format (basic validation for 8+ digits)
 */
export function isValidPhone(phone: string): boolean {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length >= 8;
}

/**
 * Check if contact info is valid (either email or phone)
 */
export function isValidContact(email: string, phone: string): boolean {
  return isValidEmail(email) || isValidPhone(phone);
}

/**
 * Build payload for lead capture
 */
export function buildLeadPayload(
  answers: QuizAnswers, 
  result: QuizResult, 
  contactEmail: string, 
  contactPhone: string
) {
  return {
    contact: {
      email: (contactEmail || "").trim(),
      phone: (contactPhone || "").trim(),
    },
    quiz: {
      answers,
      phqTotal: result.phqTotal,
      phqBand: result.phqBand,
      dominantFlavor: result.dominantFlavor,
      planetId: result.planet.id,
      planetName: result.planet.name,
      age: result.age,
      nationality: result.nationality,
      referral: result.referral
    },
    meta: {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      source: "cosmic-compass-react"
    }
  };
}

/**
 * Get planet description
 */
export function getPlanetDescription(planetId: string): string {
  return PLANET_DESCRIPTIONS[planetId] || "A mysterious cosmic destination awaits you.";
}
