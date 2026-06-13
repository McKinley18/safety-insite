"use client";

type InspectionStep = {
  title: string;
  desc: string;
};

type InspectionWorkflowHeaderProps = {
  currentStep: number;
  steps: InspectionStep[];
  inspectionContext: any;
  isAdvancedMode: boolean;
  quickCapture: boolean;
  lastSavedAt: string | null;
  goToInspectionStep: (nextStep: number) => void;
  saveFinding: () => void;
  generateReport: () => void;
  goToCoverPage: () => void;
};

export default function InspectionWorkflowHeader({
  currentStep,
  steps,
  inspectionContext,
  isAdvancedMode,
  quickCapture,
  lastSavedAt,
  goToInspectionStep,
  saveFinding,
  generateReport,
  goToCoverPage,
}: InspectionWorkflowHeaderProps) {
  const currentStepMeta = steps[currentStep - 1] || steps[0];
  const currentStepTitle = currentStepMeta.title.replace(/^Step \d+: /, "");
  const visibleStepIndex = Math.min(Math.max(currentStep, 1), steps.length);
  const progressPercent = Math.round((visibleStepIndex / steps.length) * 100);
  const workflowLabel = isAdvancedMode ? "Advanced" : "Quick";

  function handleBack() {
    if (currentStep === 1) {
      goToCoverPage();
      return;
    }

    goToInspectionStep(currentStep - 1);
  }

  function handleNext() {
    if (currentStep < steps.length) {
      goToInspectionStep(currentStep + 1);
      return;
    }

    generateReport();
  }

  const nextButtonLabel =
    currentStep >= steps.length
      ? "Finalize"
      : quickCapture && currentStep === 1
        ? "Next"
        : currentStep === 2
          ? "Review"
          : "Next";

  return (
    <>
      <div className="sticky top-[80px] z-30 -mx-4 -mt-5 mb-3 border-b border-blue-100 bg-white/95 px-4 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-20 shrink-0 justify-start">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ← Back
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-[#1D72B8]">
              {workflowLabel} · Step {visibleStepIndex} of {steps.length}
            </p>
            <h1 className="mt-0.5 truncate text-base font-black leading-tight text-slate-900 sm:text-lg">
              {currentStepTitle}
            </h1>
          </div>

          <div className="flex w-20 shrink-0 justify-end">
            {currentStep < steps.length && (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-[#102A43] px-3.5 py-1.5 text-[11px] font-black text-white shadow-sm transition hover:bg-[#1D72B8]"
              >
                {nextButtonLabel} →
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 h-1 rounded-full bg-slate-200">
          <div
            className="h-1 rounded-full bg-[#1D72B8] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

    </>
  );
}
