"use client";

import CorrectiveActionsSection from "@/components/inspection/CorrectiveActionsSection";
import RiskReviewSection from "@/components/inspection/RiskReviewSection";
import { hazardCategoryOptions } from "@/lib/inspection/inspectionConstants";

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
  const finalCategory =
    hazardCategory || safeScopeResult?.classification || "Unclassified finding";
  const actionCount = selectedGeneratedActions.length + manualActions.length;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Finding Review
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-900">
          Confirm finding details
        </h2>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
              Photos
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {photos.length}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
              Category
            </p>
            <p className="mt-1 truncate text-sm font-black text-slate-900">
              {finalCategory}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
              Risk
            </p>
            <p className="mt-1 truncate text-sm font-black text-slate-900">
              {riskSummary(safeScopeResult, severity, likelihood)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
              Actions
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {actionCount}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Description
        </p>

        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
              Observed Condition
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what was observed"
              className="min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
              Location
            </span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Area, equipment, department, or work location"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Category
        </p>

        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Current Category
          </p>
          <p className="mt-1 text-sm font-black text-slate-900">
            {finalCategory}
          </p>

          {safeScopeResult?.classification && (
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              SafeScope suggested: {safeScopeResult.classification}
            </p>
          )}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <select
            value={hazardCategory}
            onChange={(event) => setHazardCategory(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
          >
            <option value="">
              {safeScopeResult?.classification
                ? `Use SafeScope suggestion`
                : "Unclassified"}
            </option>
            {hazardCategoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            value={hazardCategory}
            onChange={(event) => setHazardCategory(event.target.value)}
            placeholder="Custom category"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
          />
        </div>
      </div>

      {!!suggestedStandards.length && (
        <details className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Standards included: {selectedStandards.length}/{suggestedStandards.length}
          </summary>

          <p className="mt-2 text-sm font-semibold leading-5 text-slate-500">
            Select the standards that should appear with this finding.
          </p>

          <div className="mt-3 space-y-2">
            {suggestedStandards.map((standard: any) => {
              const selected = selectedStandards.some(
                (item) => getStandardKey(item) === getStandardKey(standard),
              );

              return (
                <button
                  key={getStandardKey(standard)}
                  type="button"
                  onClick={() => toggleSelectedStandard(standard)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-[#1D72B8] bg-[#E8F4FF]"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-[#1D72B8]">
                        {standard.citation || "Suggested standard"}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                        {standard.rationale ||
                          standard.summary ||
                          standard.heading ||
                          "No summary available."}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                        selected
                          ? "bg-[#1D72B8] text-white"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      {selected ? "Included" : "Add"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </details>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Risk
        </p>

        <div className="mt-3">
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
