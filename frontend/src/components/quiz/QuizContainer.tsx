import React from "react";
import { useQuizState } from "@/hooks/use-quiz-state";
import { QuizCard } from "./QuizCard";
import { ResultsCard } from "./ResultsCard";

/**
 * Main quiz container that orchestrates the quiz flow
 * Manages state transitions between quiz and results
 */
export function QuizContainer() {
  const quizState = useQuizState();

  return (
    <div className="quiz-container">
      {!quizState.showResults ? (
        <QuizCard {...quizState} />
      ) : (
        <ResultsCard {...quizState} />
      )}
    </div>
  );
}
