import { QuizQuestion } from "@/lib/cosmic-compass/quiz-config";

interface QuestionRendererProps {
  question: QuizQuestion;
  answer: any;
  onAnswer: (answer: any) => void;
}

/**
 * Renders different question types with appropriate UI
 * Handles PHQ, personality, year input, and nationality selection
 */
export function QuestionRenderer({
  question,
  answer,
  onAnswer,
}: QuestionRendererProps) {
  const isSelected = (option: any) => {
    if (!answer) return false;

    // PHQ questions: match by score
    if (option.score !== undefined) {
      return answer.score === option.score;
    }

    // Personality questions: match by tag
    if (option.tag !== undefined) {
      return answer.tag === option.tag;
    }

    return false;
  };

  const handleOptionClick = (option: any) => {
    if (option.score !== undefined) {
      onAnswer({ score: option.score });
    } else if (option.tag !== undefined) {
      onAnswer({ tag: option.tag });
    }
  };

  // Multiple choice questions (PHQ and personality)
  if (question.type === "phq" || question.type === "planet") {
    return (
      <div className="cosmic-options">
        {question.options?.map((option, index) => (
          <button
            key={index}
            className={`cosmic-option-btn ${
              isSelected(option) ? "selected" : ""
            }`}
            onClick={() => handleOptionClick(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  // Year input
  if (question.type === "input_year") {
    return (
      <div className="cosmic-options">
        <input
          type="number"
          className="cosmic-input"
          placeholder={question.placeholder || "e.g., 2008"}
          min="1900"
          max={new Date().getFullYear().toString()}
          value={answer?.year || ""}
          onChange={(e) => onAnswer({ year: e.target.value.trim() })}
        />
      </div>
    );
  }

  // Nationality selection
  if (question.type === "select_nat") {
    return (
      <div className="cosmic-options">
        <select
          className="cosmic-select"
          value={answer?.nat || ""}
          onChange={(e) => onAnswer({ nat: e.target.value })}
        >
          <option value="">Select an option</option>
          {question.options?.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Fallback for unknown question types
  return (
    <div className="cosmic-options">
      <div className="text-center text-cosmic-muted">
        Unknown question type: {question.type}
      </div>
    </div>
  );
}
