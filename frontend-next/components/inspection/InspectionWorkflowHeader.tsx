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
      <div className="sentinel-inspection-workflow-header sticky z-50 mb-4 overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,#0B1320_0%,#102A43_52%,#0B1320_100%)] px-2.5 py-2 text-white shadow-sm ring-1 ring-white/10 backdrop-blur-xl sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-24 shrink-0 justify-start">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black text-white shadow-sm transition hover:bg-white hover:text-[#0B1320]"
            >
              ← Back
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center px-1">
            <p className="truncate text-[8px] font-black uppercase tracking-[0.18em] text-blue-200">
              Step {visibleStepIndex}
            </p>
            <h1 className="sentinel-workflow-header-title mt-0.5 truncate text-sm font-black leading-tight text-white">
              {currentStepTitle}
            </h1>
          </div>

          <div className="flex w-24 shrink-0 justify-end">
            {currentStep < steps.length && (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-[#1D72B8] px-3.5 py-1.5 text-[11px] font-black text-white shadow-sm transition hover:bg-white hover:text-[#0B1320]"
              >
                {nextButtonLabel} →
              </button>
            )}
          </div>
        </div>

        <div className="mt-2.5 h-1 rounded-full bg-white/15">
          <div
            className="h-1 rounded-full bg-[#5DB7FF] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

    </>
  );
}
