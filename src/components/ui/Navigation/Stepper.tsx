"use client";

import { Check } from "lucide-react";

export interface StepperStep {
  key:          string;
  label:        string;
  description?: string;
}

export interface StepperProps {
  steps:      StepperStep[];
  activeStep: string;
  className?: string;
}

export function Stepper({ steps, activeStep, className = "" }: StepperProps) {
  const activeIdx = steps.findIndex(s => s.key === activeStep);

  return (
    <ol className={`flex items-start gap-0 ${className}`} aria-label="Progress">
      {steps.map((step, i) => {
        const done    = i < activeIdx;
        const current = i === activeIdx;

        return (
          <li key={step.key} className="flex flex-1 flex-col items-center gap-2">
            {/* connector + circle row */}
            <div className="flex w-full items-center">
              {/* left connector */}
              <div className={`h-0.5 flex-1 transition-colors ${i === 0 ? "invisible" : done ? "bg-indigo-600" : "bg-slate-200"}`} />

              {/* step circle */}
              <div
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-semibold text-sm transition-colors",
                  done    ? "border-indigo-600 bg-indigo-600 text-white"
                  : current ? "border-indigo-600 bg-white text-indigo-600"
                  : "border-slate-200 bg-white text-slate-400",
                ].join(" ")}
                aria-current={current ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </div>

              {/* right connector */}
              <div className={`h-0.5 flex-1 transition-colors ${i === steps.length - 1 ? "invisible" : done ? "bg-indigo-600" : "bg-slate-200"}`} />
            </div>

            {/* label */}
            <div className="flex flex-col items-center text-center">
              <span
                className={`text-xs font-semibold ${
                  current ? "text-indigo-600" : done ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="mt-0.5 text-[10px] text-slate-400">{step.description}</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
