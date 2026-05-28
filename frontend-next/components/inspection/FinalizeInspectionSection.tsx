"use client";

import { useState } from "react";

type Props = {
  currentStep: number;

  findingSaveMessage: string;
  editingFindingIndex: number | null;
  currentFindingSaved: boolean;
  saveFinding: () => void | Promise<void>;
  addNewFinding: () => void | Promise<void>;
  generateReport: () => void | Promise<void>;

  description: string;
  hazardCategory: string;
  location: string;
  photos: any[];
  safeScopeResult: any;
  riskScore: number | null;
  selectedStandards: any[];

  findings: any[];
  editFinding: (index: number) => void;
  deleteFinding: (index: number) => void;
};

function statusText(items: string[]) {
  return items.filter(Boolean).join(" · ");
}

function getFindingTitle(finding: any) {
  return (
    finding.hazardCategory ||
    finding.safeScopeResult?.classification ||
    finding.safeScopeResult?.hazardCategory ||
    finding.safeScopeResult?.primaryHazard ||
    finding.description ||
    "Inspection finding"
  );
}

function getFindingRisk(finding: any) {
  return (
    finding.safeScopeResult?.risk?.riskBand ||
    finding.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
    finding.riskScore ||
    "Not rated"
  );
}

function getFindingStandards(finding: any) {
  return finding.selectedStandards || finding.standards || [];
}

export default function FinalizeInspectionSection({
  currentStep,
  findingSaveMessage,
  editingFindingIndex,
  currentFindingSaved,
  saveFinding,
  addNewFinding,
  generateReport,
  description,
  hazardCategory,
  location,
  photos,
  safeScopeResult,
  riskScore,
  selectedStandards,
  findings,
  editFinding,
  deleteFinding,
}: Props) {
  const [isConfidential, setIsConfidential] = useState(true);
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  const [includeExecutiveReview, setIncludeExecutiveReview] = useState(true);
  const [expandedFindingIndexes, setExpandedFindingIndexes] = useState<number[]>([]);

  const hasCurrentEntry = Boolean(
    description ||
      hazardCategory ||
      location ||
      photos.length ||
      safeScopeResult ||
      selectedStandards.length,
  );

  const visibleFindings = findings;

  const currentTitle =
    hazardCategory ||
    safeScopeResult?.hazardCategory ||
    safeScopeResult?.primaryHazard ||
    safeScopeResult?.classification ||
    "Current finding";

  const currentStatus = currentFindingSaved
    ? "Saved"
    : hasCurrentEntry
      ? "Draft"
      : "Not started";

  const saveButtonLabel = currentFindingSaved
    ? "Update Finding"
    : editingFindingIndex !== null
      ? "Update Finding"
      : "Save Finding";

  const toggleFindingExpanded = (index: number) => {
    setExpandedFindingIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  };

  if (currentStep !== 4) return null;

  return (
    <section className="space-y-4 px-1 py-2 sm:px-2">
      <div className="rounded-2xl border border-[#102A43] bg-[#102A43] p-5 text-white shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
          Step 4
        </p>
        <h2 className="mt-1 text-2xl font-black text-white">
          Finalize Findings
        </h2>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
          Save, review, and edit findings before choosing final report options. Expand
          any finding card to verify details before continuing.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="flex min-h-[72px] flex-col items-center justify-center rounded-xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/15">
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              Findings
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {visibleFindings.length}
            </p>
          </div>

          <div className="flex min-h-[72px] flex-col items-center justify-center rounded-xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/15">
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              Current
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {currentStatus}
            </p>
          </div>

          <div className="flex min-h-[72px] flex-col items-center justify-center rounded-xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/15">
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              Next
            </p>
            <p className="mt-1 text-lg font-black text-white">
              Report
            </p>
          </div>
        </div>
      </div>

      {findingSaveMessage && (
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
          {findingSaveMessage}
        </div>
      )}

      {hasCurrentEntry && !currentFindingSaved && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                Unsaved Finding
              </p>
              <h3 className="mt-1 text-base font-black text-slate-900">
                {currentTitle}
              </h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">
                Save the current finding before generating the report so it is
                included in the findings list.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={saveFinding}
                className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8] active:scale-[0.98]"
              >
                {saveButtonLabel}
              </button>

              <button
                type="button"
                onClick={addNewFinding}
                className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-xs font-black text-amber-800 shadow-sm transition hover:bg-amber-100 active:scale-[0.98]"
              >
                Save & Add Finding
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Findings Review
            </p>
            <h3 className="mt-1 text-base font-black text-slate-900">
              {visibleFindings.length
                ? `${visibleFindings.length} finding(s) ready for report`
                : "No saved findings yet"}
            </h3>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
              Use the +/- control to expand details. Edit any finding before
              generating the final report.
            </p>
          </div>
        </div>

        {visibleFindings.length ? (
          <div className="mt-4 space-y-3">
            {visibleFindings.map((finding: any, index: number) => {
              const isExpanded = expandedFindingIndexes.includes(index);
              const standards = getFindingStandards(finding);

              return (
                <div
                  key={finding.id || `finding-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleFindingExpanded(index)}
                      aria-label={
                        isExpanded
                          ? `Collapse finding ${index + 1}`
                          : `Expand finding ${index + 1}`
                      }
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-lg font-black text-[#102A43] shadow-sm transition hover:bg-blue-50 active:scale-[0.96]"
                    >
                      {isExpanded ? "−" : "+"}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                        Finding {index + 1}
                      </p>
                      <h4 className="mt-0.5 text-sm font-black text-slate-900">
                        {getFindingTitle(finding)}
                      </h4>
                      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                        {statusText([
                          `${finding.photos?.length || 0} photo(s)`,
                          finding.location || "No location",
                          `Risk ${getFindingRisk(finding)}`,
                          `Standards ${standards.length}`,
                        ])}
                      </p>

                      {!isExpanded && (
                        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                          {finding.description || "No description provided."}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => editFinding(index)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteFinding(index)}
                        className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[10px] font-black text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Observed condition
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                          {finding.description || "No description provided."}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Location
                          </p>
                          <p className="mt-1 text-xs font-black text-slate-800">
                            {finding.location || "Not specified"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Hazard Category
                          </p>
                          <p className="mt-1 text-xs font-black text-slate-800">
                            {finding.hazardCategory || "Not specified"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Risk
                          </p>
                          <p className="mt-1 text-xs font-black text-slate-800">
                            {getFindingRisk(finding)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Applicable standards
                        </p>
                        {standards.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {standards.map((standard: any, standardIndex: number) => (
                              <span
                                key={
                                  standard.id ||
                                  standard.citation ||
                                  `standard-${index}-${standardIndex}`
                                }
                                className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700"
                              >
                                {standard.citation ||
                                  standard.standard ||
                                  standard.title ||
                                  "Selected standard"}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            No standards selected for this finding.
                          </p>
                        )}
                      </div>

                      {finding.safeScopeResult && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            SafeScope intelligence
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                            {finding.safeScopeResult.summary ||
                              finding.safeScopeResult.recommendation ||
                              finding.safeScopeResult.correctiveAction ||
                              "SafeScope result captured for this finding."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold leading-5 text-slate-500">
            Save at least one finding before generating the final report.
          </p>
        )}
      </div>


    </section>
  );
}
