import React, { useState } from "react";

const steps = [
  {
    title: "Describe the Difficult Experience",
    prompt:
      "Write briefly about a difficult or challenging experience you had.",
    placeholder: "I felt overwhelmed when...",
  },
  {
    title: "Identify the Feelings",
    prompt: "Describe the feelings you had during or after this experience.",
    placeholder: "I felt sad, anxious, frustrated...",
  },
  {
    title: "Recognize Any Unhelpful Thoughts",
    prompt:
      "What negative or unhelpful thoughts did you notice during this experience?",
    placeholder: "I thought I would never succeed...",
  },
  {
    title: "Rewrite the Story",
    prompt:
      "Now, imagine rewriting this story with a positive or hopeful ending. What changed? How did you grow?",
    placeholder: "Instead of feeling stuck, I realized...",
  },

  {
    title: "Describe How You Can Apply This Growth",
    prompt: "How can you use what you’ve learned going forward in your life?",
    placeholder: "I will approach challenges with more confidence...",
  },
];

export default function StoryRewrite({
  onClose: _onClose,
}: {
  onClose: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [inputs, setInputs] = useState<string[]>(Array(steps.length).fill(""));

  const currentStep = steps[stepIndex];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInputs = [...inputs];
    newInputs[stepIndex] = e.target.value;
    setInputs(newInputs);
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl relative">
      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-100">
        {currentStep.title}
      </h3>
      <p className="mb-4 text-slate-200 text-sm sm:text-base">
        {currentStep.prompt}
      </p>
      <textarea
        value={inputs[stepIndex]}
        onChange={handleChange}
        placeholder={currentStep.placeholder}
        className="w-full p-3 sm:p-4 border border-slate-600/50 rounded min-h-[120px] sm:min-h-[150px] mb-4 bg-slate-800/60 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm sm:text-base resize-none"
      />
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <button
          onClick={prevStep}
          disabled={stepIndex === 0}
          className={`px-4 py-3 sm:py-2 rounded shadow border transition-colors min-h-[44px] touch-manipulation ${
            stepIndex === 0
              ? "bg-slate-700 text-slate-500 cursor-not-allowed border-slate-600/50"
              : "bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600/50"
          }`}
        >
          Back
        </button>
        {stepIndex < steps.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={inputs[stepIndex].trim() === ""}
            className={`px-4 py-3 sm:py-2 rounded shadow border border-green-500 bg-slate-900/95 text-green-400 hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => alert("Great job rewriting your story!")}
            disabled={inputs[stepIndex].trim() === ""}
            className="px-4 py-3 sm:py-2 rounded shadow border border-green-500 bg-slate-900/95 text-green-400 hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
