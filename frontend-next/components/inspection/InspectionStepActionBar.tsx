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
  handleRunReviewCore: () => void;
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
  handleRunReviewCore,
  saveFinding,
  generateReport,
}: Props) {
  const actionCount = selectedGeneratedActions.length + manualActions.length;

  if (currentStep === 1) {
    return (
      <div className="sentinel-keyboard-unpin sticky bottom-20 z-30 lg:bottom-6 mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 shadow-xl backdrop-blur">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Capture Finding
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
            {hasCurrentFindingData
              ? "Ready for HazLenz AI review."
              : "You can continue now, or add details first for a stronger review."}
          </p>

          <button
            type="button"
            onClick={() => goToInspectionStep(2)}
            className="mt-3 rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8]"
          >
            Continue to HazLenz AI
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="sentinel-keyboard-unpin sticky bottom-20 z-30 lg:bottom-6 mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              HazLenz AI Review
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {safeScopeResult
                ? `${safeScopeResult.classification || "Finding reviewed"} · ${safeScopeResult.suggestedStandards?.length || 0} suggested standard(s)`
                : "Run HazLenz AI to classify the hazard, assess risk, and suggest standards."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRunReviewCore}
              className="rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C]"
            >
              {safeScopeResult ? "Rerun HazLenz AI" : "Run HazLenz AI"}
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
      <div className="sentinel-keyboard-unpin sticky bottom-20 z-30 lg:bottom-6 mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Review & Validate
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
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
              Finalize Findings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="sentinel-keyboard-unpin sticky bottom-20 z-30 lg:bottom-6 mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Finalize Findings
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Save, review, and edit findings before choosing report options.
            </p>
          </div>

          <button
            type="button"
            onClick={() => goToInspectionStep(5)}
            className="rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C]"
          >
            Continue to Report Options
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 5) {
    return (
      <div className="sentinel-keyboard-unpin sticky bottom-20 z-30 lg:bottom-6 mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Generate Report
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Confirm report options and generate the final inspection report.
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
