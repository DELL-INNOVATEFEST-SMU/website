import React from "react";
import { QuestionRenderer } from "./QuestionRenderer";

interface QuizCardProps {
  currentStep: number;
  currentQuestion: any;
  progress: number;
  questions: any[];
  answers: any;
  isCurrentAnswered: boolean;
  canProceed: boolean;
  selectAnswer: (questionId: string, answer: any) => void;
  goNext: () => void;
  goBack: () => void;
}

/**
 * Main quiz card component
 * Displays progress, current question, and navigation
 */
export function QuizCard({
  currentStep,
  currentQuestion,
  progress,
  questions,
  answers,
  isCurrentAnswered,
  canProceed,
  selectAnswer,
  goNext,
  goBack,
}: QuizCardProps) {
  if (!currentQuestion) {
    return (
      <div className="cosmic-quiz-card">
        <div className="text-center">Loading quiz...</div>
      </div>
    );
  }

  const handleNext = () => {
    if (!isCurrentAnswered) {
      // Show hint
      const hintElement = document.querySelector(".cosmic-hint");
      if (hintElement) {
        hintElement.classList.add("show");
        setTimeout(() => {
          hintElement.classList.remove("show");
        }, 3000);
      }
      return;
    }
    goNext();
  };

  return (
    <div className="cosmic-quiz-card">
      {/* Progress Bar */}
      <div className="cosmic-progress">
        <div
          className="cosmic-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Counter */}
      <div style={{ textAlign: "right", marginBottom: "10px" }}>
        <span className="cosmic-counter">
          {currentStep + 1} / {questions.length}
        </span>
      </div>

      {/* Question Type Indicator */}
      <div className="cosmic-kicker">
        {currentQuestion.type === "phq" ? "Mental Health" : "Mission"}
      </div>

      {/* Question Text */}
      <div className="cosmic-question">{currentQuestion.text}</div>

      {/* Question Renderer */}
      <QuestionRenderer
        question={currentQuestion}
        answer={answers[currentQuestion.id]}
        onAnswer={(answer) => selectAnswer(currentQuestion.id, answer)}
      />

      {/* Hint Message */}
      <div className="cosmic-hint">
        Please pick an option to continue on your cosmic journey!
      </div>

      {/* Navigation */}
      <div className="cosmic-nav">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className="cosmic-nav-btn"
        >
          Back
        </button>
        <button onClick={handleNext} className="cosmic-nav-btn primary">
          {currentStep < questions.length - 1 ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
}
