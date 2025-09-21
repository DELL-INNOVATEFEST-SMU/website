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
    prompt:
      "Describe the feelings you had during or after this experience.",
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
    prompt:
      "How can you use what you’ve learned going forward in your life?",
    placeholder: "I will approach challenges with more confidence...",
  },
];


export default function DanceTherapyTrial({ onClose: _onClose }: { onClose: () => void }) {
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
    <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg relative">
      
      
      <p className="mb-4 text-gray-700">{currentStep.prompt}</p>
      <textarea
        value={inputs[stepIndex]}
        onChange={handleChange}
        placeholder={currentStep.placeholder}
        className="w-full p-2 border rounded min-h-[100px] mb-4"
      />
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={stepIndex === 0}
          className={`px-4 py-2 rounded ${
            stepIndex === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          Back
        </button>
        {stepIndex < steps.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={inputs[stepIndex].trim() === ""}
            className={`px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => alert("Great job rewriting your story!")}
            disabled={inputs[stepIndex].trim() === ""}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};
