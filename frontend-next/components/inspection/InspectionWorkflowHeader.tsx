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
  const currentStepMeta = steps[currentStep - 1];
  const currentStepTitle = currentStepMeta.title.replace(/^Step \d+: /, "");
  const visibleSteps = isAdvancedMode ? [1, 2, 3, 4, 5, 6] : [1, 2, 5, 6];

  function handleBack() {
    if (currentStep === 1) {
      goToCoverPage();
      return;
    }

    goToInspectionStep(currentStep - 1);
  }

  function handleNext() {
    if (currentStep === 6) {
      generateReport();
      return;
    }

    if (quickCapture && currentStep === 1) {
      saveFinding();
      goToInspectionStep(5);
      return;
    }

    goToInspectionStep(currentStep + 1);
  }

  const nextButtonLabel =
    currentStep === 6
      ? "Generate Report"
      : quickCapture && currentStep === 1
        ? "Save Finding →"
        : currentStep === 1
          ? "Save & Continue →"
          : "Next →";

  return (
    <>
      <div className="sticky top-[73px] z-30 -mx-4 -mt-5 mb-4 border-b border-blue-100 bg-gradient-to-br from-white via-[#F4F9FF] to-[#E8F4FF] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.10)] sm:-mx-6 sm:px-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
              {inspectionContext?.inspectionTitle || currentStepTitle}
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {inspectionContext?.inspectionTitle
                ? `${currentStepTitle} — ${currentStepMeta.desc}`
                : currentStepMeta.desc}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <div className="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-black text-[#1D72B8] shadow-sm">
              Step {currentStep} of {steps.length}
            </div>
            <p className="text-[11px] font-black text-slate-500">
              {lastSavedAt ? `Saved ${lastSavedAt}` : "Autosave ready"}
            </p>
          </div>
        </div>

        <div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex min-h-7 items-center rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex min-h-7 items-center rounded-xl bg-[#102A43] px-4 py-1 text-[11px] font-black text-white shadow-sm transition hover:bg-[#1D72B8]"
            >
              {nextButtonLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 hidden gap-2 sm:flex">
        {visibleSteps.map((stepNumber) => {
          const active = currentStep === stepNumber;
          const complete = currentStep > stepNumber;

          return (
            <div
              key={stepNumber}
              className="h-2 flex-1 rounded-full bg-slate-200"
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  active || complete ? "bg-[#1D72B8]" : "bg-slate-200"
                }`}
              />
            </div>
          );
        })}
      </div>

      {inspectionContext && (
        <div className="mb-4 border-y border-slate-200 py-3">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Inspection Context
          </p>
          <p className="mt-1 text-sm font-black text-slate-900">
            {inspectionContext.inspectionTitle}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {inspectionContext.agency} •{" "}
            {inspectionContext.workflowDepth?.replaceAll("_", " ")}
          </p>
        </div>
      )}
    </>
  );
}
