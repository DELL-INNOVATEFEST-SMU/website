/**
 * Quiz State Management Hook
 * 
 * Manages the complete state of the Cosmic Compass quiz including
 * navigation, answers, validation, and results processing
 */

import { useState, useCallback, useMemo } from "react";
import { 
  QuizQuestion, 
  QuizAnswers, 
  QuizResult, 
  getQuizQuestions 
} from "@/lib/cosmic-compass/quiz-config";
import { 
  processQuizAnswers, 
  isQuestionAnswered,
  isValidContact,
  buildLeadPayload,
  getReferralInfo,
  getPlanetDescription,
  getPHQBandLabel,
  capitalize
} from "@/lib/cosmic-compass/quiz-logic";
import { submitLeadCapture } from "@/lib/cosmic-compass/lead-capture";

interface QuizState {
  // Current state
  currentStep: number;
  answers: QuizAnswers;
  showResults: boolean;
  showReveal: boolean;
  
  // Contact form
  contactEmail: string;
  contactPhone: string;
  isSubmitting: boolean;
  submitError: string | null;
  
  // Computed values
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion | null;
  progress: number;
  isCurrentAnswered: boolean;
  canProceed: boolean;
  result: QuizResult | null;
  
  // Actions
  selectAnswer: (questionId: string, answer: { score?: number; tag?: string; year?: string; nat?: string }) => void;
  goNext: () => void;
  goBack: () => void;
  finish: () => void;
  setContactEmail: (email: string) => void;
  setContactPhone: (phone: string) => void;
  submitAndReveal: () => Promise<void>;
  reset: () => void;
}

export function useQuizState(): QuizState {
  // Core state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  
  // Contact form state
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Get questions (memoized to prevent reshuffling)
  const questions = useMemo(() => getQuizQuestions(), []);
  
  // Current question
  const currentQuestion = useMemo(() => {
    return questions[currentStep] || null;
  }, [questions, currentStep]);
  
  // Progress calculation
  const progress = useMemo(() => {
    return Math.min(100, ((currentStep + 1) / questions.length) * 100);
  }, [currentStep, questions.length]);
  
  // Check if current question is answered
  const isCurrentAnswered = useMemo(() => {
    if (!currentQuestion) return false;
    return isQuestionAnswered(currentQuestion.id, currentQuestion.type, answers);
  }, [currentQuestion, answers]);
  
  // Check if user can proceed
  const canProceed = useMemo(() => {
    return isCurrentAnswered;
  }, [isCurrentAnswered]);
  
  // Calculate results when needed
  const result = useMemo(() => {
    if (!showResults) return null;
    return processQuizAnswers(answers);
  }, [showResults, answers]);
  
  // Select answer for current question
  const selectAnswer = useCallback((questionId: string, answer: { score?: number; tag?: string; year?: string; nat?: string }) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);
  
  // Finish quiz and show results
  const finish = useCallback(() => {
    setShowResults(true);
  }, []);
  
  // Navigation: go to next question
  const goNext = useCallback(() => {
    if (!canProceed) return;
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finish();
    }
  }, [canProceed, currentStep, questions.length, finish]);
  
  // Navigation: go to previous question
  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  // Submit contact info and reveal results
  const submitAndReveal = useCallback(async () => {
    if (!result) return;
    
    const isValidContactInfo = isValidContact(contactEmail, contactPhone);
    if (!isValidContactInfo) {
      setSubmitError("Please provide a valid email or phone number.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const payload = buildLeadPayload(answers, result, contactEmail, contactPhone);
      
      // Submit to Supabase by default
      await submitLeadCapture(payload);
      
      // Success - reveal results
      setShowReveal(true);
      
    } catch (error) {
      console.error("Lead submission error:", error);
      setSubmitError("Could not save your contact info. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [result, contactEmail, contactPhone, answers]);
  
  // Reset quiz to initial state
  const reset = useCallback(() => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
    setShowReveal(false);
    setContactEmail("");
    setContactPhone("");
    setIsSubmitting(false);
    setSubmitError(null);
  }, []);
  
  return {
    // State
    currentStep,
    answers,
    showResults,
    showReveal,
    
    // Contact form
    contactEmail,
    contactPhone,
    isSubmitting,
    submitError,
    
    // Computed
    questions,
    currentQuestion,
    progress,
    isCurrentAnswered,
    canProceed,
    result,
    
    // Actions
    selectAnswer,
    goNext,
    goBack,
    finish,
    setContactEmail,
    setContactPhone,
    submitAndReveal,
    reset,
  };
}

/**
 * Helper hook to get formatted result data
 */
export function useFormattedResult(result: QuizResult | null) {
  return useMemo(() => {
    if (!result) return null;
    
    const referralInfo = getReferralInfo(result.referral);
    const planetDescription = getPlanetDescription(result.planet.id);
    const phqBandLabel = getPHQBandLabel(result.phqBand);
    const dominantFlavorLabel = capitalize(result.dominantFlavor);
    
    return {
      ...result,
      referralInfo,
      planetDescription,
      phqBandLabel,
      dominantFlavorLabel,
    };
  }, [result]);
}
