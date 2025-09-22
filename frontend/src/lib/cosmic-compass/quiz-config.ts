/**
 * Cosmic Compass Quiz Configuration
 * 
 * Contains all quiz questions, options, planet mappings, and scoring logic
 * Extracted from the original HTML implementation for better maintainability
 */

export interface QuizOption {
  label: string;
  score?: number; // For PHQ questions
  tag?: string;   // For personality questions
  value?: string; // For select questions
}

export interface QuizQuestion {
  id: string;
  type: "phq" | "planet" | "input_year" | "select_nat";
  text: string;
  options?: QuizOption[];
  placeholder?: string;
  image?: string; // Optional image path for the question
}

export interface PlanetAssignment {
  id: string;
  name: string;
}

export interface PlanetMatrix {
  [flavor: string]: {
    normal: PlanetAssignment;
    mild: PlanetAssignment;
    moderate: PlanetAssignment;
    severe: PlanetAssignment;
  };
}

export interface QuizAnswers {
  [questionId: string]: {
    score?: number;
    tag?: string;
    year?: string;
    nat?: string;
  };
}

export interface QuizResult {
  phqTotal: number;
  phqBand: "normal" | "mild" | "moderate" | "severe";
  phqScores: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  anxietyScore: number;
  depressionScore: number;
  anxietyRisk: boolean;
  depressionRisk: boolean;
  dominantFlavor: string;
  planet: PlanetAssignment;
  age: number | null;
  nationality: string;
  referral: "samh" | "comit" | "limitless";
}

// PHQ-4 Options (standardized for clinical integrity)
export const PHQ_OPTIONS: QuizOption[] = [
  { label: "Not at all", score: 0 },
  { label: "Several days", score: 1 },
  { label: "More than half the days", score: 2 },
  { label: "Nearly every day", score: 3 },
];

// PHQ-4 Questions (verbatim for screening integrity)
export const PHQ_ITEMS: QuizQuestion[] = [
  {
    id: "phq1",
    type: "phq",
    text: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?"
  },
  {
    id: "phq2",
    type: "phq",
    text: "Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?"
  },
  {
    id: "phq3",
    type: "phq",
    text: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?"
  },
  {
    id: "phq4",
    type: "phq",
    text: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?"
  },
];

// Personality Questions (cosmic-themed)
export const PLANET_QUESTIONS: QuizQuestion[] = [
  {
    id: "pq1",
    type: "planet",
    text: "You're about to launch your rocket. What's going through your head?",
    image: "/cosmic-compass/pq1.png",
    options: [
      { label: "Let's goooo, can't wait to blast off!", tag: "fire" },
      { label: "I'm calculating every possible failure point", tag: "ice" },
      { label: "I hope the crew's ready and safe", tag: "water" },
      { label: "Wow, space is so big, this is surreal", tag: "air" },
    ]
  },
  {
    id: "pq2",
    type: "planet",
    text: "As your ship drifts into an asteroid field, how do you react?",
    image: "/cosmic-compass/pq2.png",
    options: [
      { label: "Treat it like an obstacle course", tag: "air" },
      { label: "Stress over every possible crash", tag: "ice" },
      { label: "Trust my instincts and fly through", tag: "fire" },
      { label: "Call mission control for reassurance", tag: "water" },
    ]
  },
  {
    id: "pq3",
    type: "planet",
    text: "A new alien festival invites you to join. What's your vibe?",
    image: "/cosmic-compass/pq3.png",
    options: [
      { label: "Jump in and dance with everyone", tag: "fire" },
      { label: "Observe quietly, not sure if I want to join", tag: "ice" },
      { label: "Go with friends, it's better together", tag: "water" },
      { label: "Wander around, curious about everything", tag: "air" },
    ]
  },
  {
    id: "pq4",
    type: "planet",
    text: "You're floating alone in deep space, stars all around. What's your thought?",
    image: "/cosmic-compass/pq4.png",
    options: [
      { label: "I feel so small… kinda heavy", tag: "ice" },
      { label: "It's peaceful, I could stay here forever", tag: "water" },
      { label: "I should set a new course, adventure awaits!", tag: "fire" },
      { label: "I wonder what's beyond those galaxies", tag: "air" },
    ]
  },
  {
    id: "pq5",
    type: "planet",
    text: "If your personality was a type of star, you'd be…",
    image: "/cosmic-compass/pq5.png",
    options: [
      { label: "A distant cold white dwarf", tag: "ice" },
      { label: "A blazing supernova", tag: "fire" },
      { label: "A mysterious pulsar", tag: "air" },
      { label: "A gentle, steady sun", tag: "water" },
    ]
  },
  {
    id: "pq6",
    type: "planet",
    text: "When you look at the night sky, what grabs your attention most?",
    image: "/cosmic-compass/pq6.png",
    options: [
      { label: "The quiet, dark patches", tag: "ice" },
      { label: "The brightest stars", tag: "fire" },
      { label: "The shooting stars", tag: "air" },
      { label: "The constellations and patterns", tag: "water" },
    ]
  },
  {
    id: "pq7",
    type: "planet",
    text: "Imagine discovering a new planet. What would it be like?",
    image: "/cosmic-compass/pq7.jpg",
    options: [
      { label: "A volcanic, stormy world", tag: "fire" },
      { label: "A frozen crystal landscape", tag: "ice" },
      { label: "A windy, cloud-drenched giant", tag: "air" },
      { label: "A lush, ocean-covered paradise", tag: "water" },
    ]
  },
  {
    id: "pq8",
    type: "planet",
    text: "The universe grants you a spaceship name — what's it called?",
    image: "/cosmic-compass/pq8.jpg",
    options: [
      { label: "Blaze Voyager", tag: "fire" },
      { label: "Silent Horizon", tag: "ice" },
      { label: "Star Chaser", tag: "air" },
      { label: "Ocean Dreamer", tag: "water" },
    ]
  },
];

// Additional Questions
export const EXTRA_ITEMS: QuizQuestion[] = [
  {
    id: "yob",
    type: "input_year",
    text: "What's your year of launch (birth year)?",
    placeholder: "e.g., 2008"
  },
  {
    id: "nat",
    type: "select_nat",
    text: "Almost ready for takeoff! Where are you blasting off from?",
    options: [
      { label: "Home Base (Singapore Citizen)", value: "sg" },
      { label: "Lunar Outpost (Singapore PR)", value: "spr" },
      { label: "A Galaxy Far, Far Away (Non-Singapore Citizen)", value: "non-sg" },
    ]
  },
];

// Question sequence (interleaved for better engagement)
export const QUESTION_SEQUENCE = [
  "pq1", "pq2", "phq1", "pq3", "phq2", "pq4", "pq5", 
  "phq3", "pq6", "phq4", "pq7", "pq8", "yob", "nat"
];

// Planet assignment matrix
export const PLANET_MATRIX: PlanetMatrix = {
  fire: {
    normal: { id: "mars", name: "Mars" },
    mild: { id: "mercury", name: "Mercury" },
    moderate: { id: "venus", name: "Venus" },
    severe: { id: "mercury", name: "Mercury" }
  },
  ice: {
    normal: { id: "saturn", name: "Saturn" },
    mild: { id: "uranus", name: "Uranus" },
    moderate: { id: "pluto", name: "Pluto" },
    severe: { id: "uranus", name: "Uranus" }
  },
  water: {
    normal: { id: "earth", name: "Earth" },
    mild: { id: "venus", name: "Venus" },
    moderate: { id: "neptune", name: "Neptune" },
    severe: { id: "venus", name: "Venus" }
  },
  air: {
    normal: { id: "jupiter", name: "Jupiter" },
    mild: { id: "uranus", name: "Uranus" },
    moderate: { id: "neptune", name: "Neptune" },
    severe: { id: "uranus", name: "Uranus" }
  },
};

// Planet descriptions for results
export const PLANET_DESCRIPTIONS: Record<string, string> = {
  mars: "The warrior planet - bold, passionate, and ready for action. You face challenges head-on with courage and determination.",
  mercury: "The messenger planet - quick-thinking, adaptable, and communicative. You process information rapidly and connect ideas brilliantly.",
  venus: "The harmony planet - loving, creative, and seeking balance. You bring beauty and peace to everything you touch.",
  saturn: "The wisdom planet - structured, disciplined, and thoughtful. You build lasting foundations with patience and perseverance.",
  uranus: "The innovator planet - unique, independent, and revolutionary. You see possibilities others miss and dare to be different.",
  pluto: "The transformer plutoid - small, but tenacious. You have the strength to overcome any obstacle and emerge renewed.",
  earth: "The nurturing planet - grounded, caring, and life-giving. You create safe spaces where others can grow and thrive.",
  neptune: "The dreamer planet - intuitive, imaginative, and deeply empathetic. You see the world through the lens of possibility and compassion.",
  jupiter: "The explorer planet - expansive, optimistic, and adventurous. You seek knowledge, growth, and new horizons with enthusiasm.",
};

// Compile all questions in sequence
export function getQuizQuestions(): QuizQuestion[] {
  const allItems = [...PHQ_ITEMS, ...PLANET_QUESTIONS, ...EXTRA_ITEMS];
  const itemLookup = Object.fromEntries(allItems.map(q => [q.id, q]));
  
  return QUESTION_SEQUENCE.map(id => {
    const item = itemLookup[id];
    if (!item) {
      throw new Error(`Question with id "${id}" not found`);
    }
    
    // Shuffle planet question options for variety
    if (item.type === "planet" && item.options) {
      return {
        ...item,
        options: shuffleArray([...item.options])
      };
    }
    
    // Add PHQ options to PHQ questions
    if (item.type === "phq") {
      return {
        ...item,
        options: PHQ_OPTIONS
      };
    }
    
    return item;
  });
}

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
