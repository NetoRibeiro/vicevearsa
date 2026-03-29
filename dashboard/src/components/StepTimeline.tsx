interface StepTimelineProps {
  currentStep: number;
  totalSteps: number;
  currentLabel: string;
}

export function StepTimeline({ currentStep, totalSteps, currentLabel }: StepTimelineProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {steps.map((step) => {
        const isComplete = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              color: isCurrent
                ? "var(--accent-cyan)"
                : isComplete
                  ? "var(--accent-green)"
                  : "var(--text-secondary)",
            }}
          >
            <span style={{ width: 16, textAlign: "center" }}>
              {isComplete ? "\u2713" : isCurrent ? "\u25B6" : "\u25CB"}
            </span>
            <span>
              Step {step}
              {isCurrent ? `: ${currentLabel}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
