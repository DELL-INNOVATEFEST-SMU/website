import { useState } from "react";
import { useResponsive } from "@/hooks/use-mobile";

type Step = {
  question: string;
  type: "yesno" | "text";
  next?: {
    yes?: number; // index of next step if "yes"
    no?: number; // index of next step if "no"
    default?: number; // next step if text input
  };
};

const steps: Step[] = [
  {
    question: "Are you worried about something specific right now?",
    type: "yesno",
    next: { yes: 1, no: 7 },
  },
  {
    question: "Is this worry something out of your control?",
    type: "yesno",
    next: { yes: 2, no: 3 },
  },
  {
    question: "Can you stop worrying about it now?",
    type: "yesno",
    next: { yes: 7, no: 4 },
  },
  {
    question: "Is there something you can do to improve the situation?",
    type: "yesno",
    next: { yes: 5, no: 7 },
  },
  {
    question: "What action could you take? Write it down.",
    type: "text",
    next: { default: 6 },
  },
  {
    question: "Do you feel empowered to take this action?",
    type: "yesno",
    next: { yes: 7, no: 4 },
  },
  {
    question:
      "Write down any obstacles that might stop you and how you could manage them.",
    type: "text",
    next: { default: 7 },
  },
  {
    question:
      "Great! Try to focus on the present and let go of unnecessary worries.",
    type: "text",
  },
];

export default function WorryTreeModal({ onClose }: { onClose: () => void }) {
  const { isMobile, isSmallMobile } = useResponsive();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const currentStep = steps[stepIndex];

  const handleYesNo = (answer: "yes" | "no") => {
    const nextStep = currentStep.next?.[answer];
    if (nextStep !== undefined) {
      setStepIndex(nextStep);
    }
  };

  const handleTextSubmit = () => {
    const nextStep = currentStep.next?.default;
    if (nextStep !== undefined) {
      setStepIndex(nextStep);
    }
  };

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 sm:p-6 shadow-2xl relative">
      <p className="mb-4 sm:mb-6 text-slate-200 text-sm sm:text-base">
        {currentStep.question}
      </p>

      {currentStep.type === "yesno" && currentStep.next ? (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => handleYesNo("yes")}
            className="px-4 py-3 sm:py-2 bg-slate-900/95 border border-green-500 text-green-400 rounded shadow hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 min-h-[44px] touch-manipulation"
          >
            Yes
          </button>
          <button
            onClick={() => handleYesNo("no")}
            className="px-4 py-3 sm:py-2 bg-slate-900/95 border border-red-500 text-red-400 rounded shadow hover:bg-red-500/20 hover:text-red-300 hover:border-red-400 min-h-[44px] touch-manipulation"
          >
            No
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTextSubmit();
          }}
        >
          <textarea
            className="w-full p-3 sm:p-4 border border-slate-600/50 rounded mb-4 min-h-[100px] sm:min-h-[120px] bg-slate-800/60 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm sm:text-base resize-none"
            value={answers[stepIndex] || ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [stepIndex]: e.target.value }))
            }
            required={currentStep.type === "text"}
            placeholder="Type your response here..."
          />

          {!currentStep.next ? (
            <button
              onClick={onClose}
              className="px-4 py-3 sm:py-2 bg-slate-900/95 border border-green-500 text-green-400 rounded mt-2 shadow hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 min-h-[44px] touch-manipulation w-full sm:w-auto"
            >
              Finish
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-3 sm:py-2 bg-slate-900/95 border border-green-500 text-green-400 rounded shadow hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 min-h-[44px] touch-manipulation w-full sm:w-auto"
            >
              Continue
            </button>
          )}
        </form>
      )}
    </div>
  );
}
