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
  const visibleSteps = isAdvancedMode ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 5, 6];
  const visibleStepIndex = Math.max(1, visibleSteps.indexOf(currentStep) + 1);
  const progressPercent = Math.round(
    (visibleStepIndex / visibleSteps.length) * 100,
  );
  const workflowLabel = isAdvancedMode ? "Advanced" : "Quick";

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

    if (!isAdvancedMode && currentStep === 3) {
      goToInspectionStep(5);
      return;
    }

    goToInspectionStep(currentStep + 1);
  }

  const nextButtonLabel =
    currentStep === 6
      ? "Generate"
      : quickCapture && currentStep === 1
        ? "Save"
        : currentStep === 1
          ? "Save & Continue"
          : "Next";

  return (
    <>
      <div className="sticky top-[73px] z-30 -mx-4 -mt-5 mb-3 border-b border-blue-100 bg-white/95 px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.10)] backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
              {workflowLabel} · Step {visibleStepIndex} of {visibleSteps.length}
            </p>
            <h1 className="mt-0.5 truncate text-lg font-black leading-tight text-slate-900 sm:text-xl">
              {currentStepTitle}
            </h1>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              {lastSavedAt ? "Saved" : "Autosave"}
            </p>
            <p className="text-[11px] font-black text-slate-600">
              {lastSavedAt || "Ready"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-9 min-w-[112px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="min-h-9 min-w-[112px] rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8]"
          >
            {nextButtonLabel} →
          </button>
        </div>

        <div className="mt-3 h-1.5 rounded-full bg-slate-200">
          <div
            className="h-1.5 rounded-full bg-[#1D72B8] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {inspectionContext && (
        <div className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1D72B8]">
                Inspection Context
              </p>
              <p className="mt-1 truncate text-sm font-black text-slate-900">
                {inspectionContext.inspectionTitle}
              </p>
            </div>

            <p className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
              {inspectionContext.agency} ·{" "}
              {inspectionContext.workflowDepth?.replaceAll("_", " ")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
