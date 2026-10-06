import React from "react";
import { Check } from "lucide-react";

interface CheckoutStepsProps {
  currentStep: number; // 1, 2, or 3
  onStepClick?: (step: number) => void;
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { number: 1, title: "Shipping Information" },
    { number: 2, title: "Payment Method" },
    { number: 3, title: "Review & Place Order" },
  ];

  return (
    <nav aria-label="Checkout Progress" className="py-4 mb-8">
      <ol className="flex items-center justify-between max-w-xl mx-auto relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-stone-200 -z-1" />

        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <li key={step.number} className="flex flex-col items-center group">
              <button
                type="button"
                disabled={!isCompleted && !isCurrent}
                onClick={() => isCompleted && onStepClick && onStepClick(step.number)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                  isCompleted
                    ? "bg-stone-900 border-stone-900 text-white cursor-pointer"
                    : isCurrent
                    ? "bg-white border-stone-900 text-stone-900 shadow-sm"
                    : "bg-white border-stone-300 text-stone-400 cursor-not-allowed"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.number}
              </button>

              <span
                className={`mt-2 text-xs font-medium tracking-tight text-center hidden sm:block ${
                  isCurrent
                    ? "text-stone-900 font-bold"
                    : isCompleted
                    ? "text-stone-700"
                    : "text-stone-400"
                }`}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
