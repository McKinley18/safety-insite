"use client";

import { formatStandardDisplay, getStandardCitation, getStandardSummary } from "@/lib/inspection/standardDisplay";

import CorrectiveActionsSection from "@/components/inspection/CorrectiveActionsSection";
import RiskReviewSection from "@/components/inspection/RiskReviewSection";

type Props = {
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  evidenceNotes: string;
  setEvidenceNotes: (value: string) => void;
  hazardCategory: string;
  setHazardCategory: (value: string) => void;
  photos: any[];
  safeScopeResult: any;
  selectedStandards: any[];
  getStandardKey: (standard: any) => string;
  toggleSelectedStandard: (standard: any) => void;
  activeRiskScale: any;
  severity: number | null;
  setSeverity: (value: number | null) => void;
  likelihood: number | null;
  setLikelihood: (value: number | null) => void;
  selectedGeneratedActions: any[];
  toggleGeneratedAction: (action: any) => void;
  manualActionTitle: string;
  setManualActionTitle: (value: string) => void;
  manualActionPriority: string;
  setManualActionPriority: (value: string) => void;
  manualActionDue: string;
  setManualActionDue: (value: string) => void;
  manualActionClosureEvidence: string;
  setManualActionClosureEvidence: (value: string) => void;
  manualActions: any[];
  addManualAction: () => void;
  removeManualAction: (index: number) => void;
};

function riskSummary(
  safeScopeResult: any,
  severity: number | null,
  likelihood: number | null,
) {
  if (severity && likelihood) {
    return `Severity ${severity} × Likelihood ${likelihood} = ${severity * likelihood}`;
  }

  return (
    safeScopeResult?.risk?.riskBand ||
    safeScopeResult?.risk?.operationalRisk?.matrixBand ||
    "Not rated"
  );
}

export default function FindingReviewEditor({
  description,
  setDescription,
  location,
  setLocation,
  evidenceNotes,
  setEvidenceNotes,
  hazardCategory,
  setHazardCategory,
  photos,
  safeScopeResult,
  selectedStandards,
  getStandardKey,
  toggleSelectedStandard,
  activeRiskScale,
  severity,
  setSeverity,
  likelihood,
  setLikelihood,
  selectedGeneratedActions,
  toggleGeneratedAction,
  manualActionTitle,
  setManualActionTitle,
  manualActionPriority,
  setManualActionPriority,
  manualActionDue,
  setManualActionDue,
  manualActionClosureEvidence,
  setManualActionClosureEvidence,
  manualActions,
  addManualAction,
  removeManualAction,
}: Props) {
  const suggestedStandards = safeScopeResult?.suggestedStandards || [];

  return (
    <section className="space-y-2">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Standards Confirmation
        </p>

        <h3 className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
          {selectedStandards.length
            ? `${selectedStandards.length} standard(s) selected in Step 2`
            : "No standards selected yet"}
        </h3>

        <p className="mt-1 text-sm font-semibold leading-5 text-slate-700 dark:text-slate-700">
          Standards are selected in the HazLenz AI Review step. This step is for final risk and corrective action confirmation.
        </p>

        <div className="mt-2 space-y-2">
          {(selectedStandards.length ? selectedStandards : suggestedStandards.slice(0, 2)).map((standard: any) => {
            const included = selectedStandards.some(
              (item) => getStandardKey(item) === getStandardKey(standard),
            );

            return (
              <div
                key={getStandardKey(standard)}
                className={`rounded-xl border px-3 py-3 ${
                  included
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#1D72B8]">
                      {formatStandardDisplay(standard)}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                      {getStandardSummary(standard) || "No summary available."}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                      included
                        ? "bg-[#1D72B8] text-white"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {included ? "Included" : "Review Step 2"}
                  </span>
                </div>
              </div>
            );
          })}

          {!selectedStandards.length && !suggestedStandards.length && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-black text-red-700">
              No HazLenz AI standards are available yet. Return to Step 2 and run HazLenz AI before finalizing.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Risk
        </p>

        <div className="mt-2">
          <RiskReviewSection
            activeRiskScale={activeRiskScale}
            safeScopeResult={safeScopeResult}
            severity={severity}
            setSeverity={setSeverity}
            likelihood={likelihood}
            setLikelihood={setLikelihood}
          />
        </div>
      </div>

      <CorrectiveActionsSection
        safeScopeResult={safeScopeResult}
        selectedGeneratedActions={selectedGeneratedActions}
        toggleGeneratedAction={toggleGeneratedAction}
        manualActionTitle={manualActionTitle}
        setManualActionTitle={setManualActionTitle}
        manualActionPriority={manualActionPriority}
        setManualActionPriority={setManualActionPriority}
        manualActionDue={manualActionDue}
        setManualActionDue={setManualActionDue}
        manualActionClosureEvidence={manualActionClosureEvidence}
        setManualActionClosureEvidence={setManualActionClosureEvidence}
        manualActions={manualActions}
        addManualAction={addManualAction}
        removeManualAction={removeManualAction}
      />
    </section>
  );
}
