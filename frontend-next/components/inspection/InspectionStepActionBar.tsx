"use client";

type Props = {
  currentStep: number;
  hasCurrentFindingData: boolean;
  safeScopeResult: any;
  selectedStandards: any[];
  selectedGeneratedActions: any[];
  manualActions: any[];
  currentFindingSaved: boolean;
  goToInspectionStep: (step: number) => void;
  handleRunSafeScope: () => void;
  saveFinding: () => void;
  generateReport: () => void;
};

export default function InspectionStepActionBar({
  currentStep,
  hasCurrentFindingData,
  safeScopeResult,
  selectedStandards,
  selectedGeneratedActions,
  manualActions,
  currentFindingSaved,
  goToInspectionStep,
  handleRunSafeScope,
  saveFinding,
  generateReport,
}: Props) {
  const actionCount = selectedGeneratedActions.length + manualActions.length;

  if (currentStep === 1) {
    return (
      <div className="sticky bottom-3 z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Capture Finding
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs font-semibold leading-5 text-slate-600">
            {hasCurrentFindingData
              ? "Ready for SafeScope review."
              : "You can continue now, or add details first for a stronger review."}
          </p>

          <button
            type="button"
            onClick={() => goToInspectionStep(2)}
            className="mt-3 rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8]"
          >
            Continue to SafeScope
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="sticky bottom-3 z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              SafeScope Review
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {safeScopeResult
                ? `${safeScopeResult.classification || "Finding reviewed"} · ${safeScopeResult.suggestedStandards?.length || 0} suggested standard(s)`
                : "Run SafeScope to classify the hazard, assess risk, and suggest standards."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRunSafeScope}
              className="rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C]"
            >
              {safeScopeResult ? "Rerun SafeScope" : "Run SafeScope"}
            </button>

            <button
              type="button"
              disabled={!safeScopeResult}
              onClick={() => goToInspectionStep(3)}
              className="rounded-xl bg-[#102A43] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#1D72B8] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Review Risk & Actions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="sticky bottom-3 z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Review & Validate
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {selectedStandards.length} selected standard(s) · {actionCount} action(s) ready.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveFinding}
              className="rounded-xl bg-[#102A43] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#1D72B8]"
            >
              {currentFindingSaved ? "Update Finding" : "Save Finding"}
            </button>

            <button
              type="button"
              onClick={() => goToInspectionStep(4)}
              className="rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C]"
            >
              Finalize Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="sticky bottom-3 z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Finalize
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Save the current finding if needed, then generate the inspection report.
            </p>
          </div>

          <button
            type="button"
            onClick={generateReport}
            className="rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C]"
          >
            Generate Report
          </button>
        </div>
      </div>
    );
  }

  return null;
}
