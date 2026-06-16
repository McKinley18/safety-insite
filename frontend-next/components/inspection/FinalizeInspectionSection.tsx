"use client";

import { useState } from "react";
import { formatStandardDisplay } from "@/lib/inspection/standardDisplay";

type Props = {
  currentStep: number;

  findingSaveMessage: string;
  editingFindingIndex: number | null;
  currentFindingSaved: boolean;
  saveFinding: () => void | Promise<void>;
  addNewFinding: () => void | Promise<void>;
  generateReport: () => void | Promise<void>;
  returnToReportInProgress?: () => void;

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
  returnToReportInProgress,
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

        <div className="mt-5 flex h-16 w-full items-start justify-center gap-1.5 text-center">
          <div className="flex h-16 w-1/3 flex-col items-center justify-start rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-center shadow-sm ring-1 ring-white/10">
            <p className="text-[8px] font-black uppercase tracking-wide text-blue-100">
              Findings
            </p>
            <p className="mt-0.5 text-sm font-black text-white">
              {visibleFindings.length}
            </p>
          </div>

          <div className="flex h-16 w-1/3 flex-col items-center justify-start rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-center shadow-sm ring-1 ring-white/10">
            <p className="text-[8px] font-black uppercase tracking-wide text-blue-100">
              Current
            </p>
            <p className="mt-0.5 text-sm font-black text-white">
              {currentStatus === "Not started" ? "-" : currentStatus}
            </p>
          </div>

          <div className="flex h-16 w-1/3 flex-col items-center justify-start rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-center shadow-sm ring-1 ring-white/10">
            <p className="text-[8px] font-black uppercase tracking-wide text-blue-100">
              Next
            </p>
            <p className="mt-0.5 text-sm font-black text-white">
              Report
            </p>
          </div>
        </div>
      </div>

      {findingSaveMessage && (
        <div className="mx-auto max-w-fit rounded-lg bg-yellow-200 px-2.5 py-1.5 text-center text-[11px] font-black leading-4 text-red-800 ring-1 ring-yellow-400 shadow-sm">
          {findingSaveMessage}
        </div>
      )}

      {hasCurrentEntry && !currentFindingSaved && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
              Unsaved Finding Preview
            </p>
            <h3 className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
              Review this finding before saving
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">
              This finding has not been saved yet. Review the card below, then
              save it so it is included in the report.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-white dark:bg-slate-900 px-3 py-3 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-700 dark:text-slate-700">
                  Current finding
                </p>
                <h4 className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
                  {currentTitle}
                </h4>
              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-800">
                Draft
              </span>
            </div>

            <div className="mt-3 grid gap-2 text-xs font-bold leading-5 text-slate-700 dark:text-slate-300 sm:grid-cols-2">
              <p>
                <span className="font-black text-slate-800 dark:text-slate-200">Location:</span>{" "}
                {location || "Not entered"}
              </p>
              <p>
                <span className="font-black text-slate-800 dark:text-slate-200">Risk:</span>{" "}
                {riskScore || safeScopeResult?.risk?.riskBand || safeScopeResult?.risk?.operationalRisk?.matrixBand || "Not rated"}
              </p>
              <p>
                <span className="font-black text-slate-800 dark:text-slate-200">Standards:</span>{" "}
                {selectedStandards.length || safeScopeResult?.suggestedStandards?.length || 0}
              </p>
              <p>
                <span className="font-black text-slate-800 dark:text-slate-200">Photos:</span>{" "}
                {photos.length}
              </p>
            </div>

            {(description || safeScopeResult?.classification) && (
              <p className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                {description || safeScopeResult?.classification}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={saveFinding}
              className="flex h-10 w-[146px] items-center justify-center rounded-xl bg-[#102A43] px-3 text-center text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8] active:scale-[0.98]"
            >
              {saveButtonLabel}
            </button>

            <button
              type="button"
              onClick={addNewFinding}
              className="flex h-10 w-[146px] items-center justify-center rounded-xl border border-amber-200 bg-white dark:bg-slate-900 px-3 text-center text-xs font-black leading-tight text-amber-800 shadow-sm transition hover:bg-amber-100 active:scale-[0.98]"
            >
              Save & Add New Finding
            </button>

            <button
              type="button"
              onClick={returnToReportInProgress}
              className="flex h-10 w-[190px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-center text-xs font-black leading-tight text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98]"
            >
              Return to Report in Progress
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Findings Review
            </p>
            <h3 className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
              {visibleFindings.length
                ? `${visibleFindings.length} finding(s) ready for report`
                : "No saved findings yet"}
            </h3>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-700 dark:text-slate-700">
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
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-3"
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
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-lg font-black text-[#102A43] shadow-sm transition hover:bg-blue-50 active:scale-[0.96]"
                    >
                      {isExpanded ? "−" : "+"}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-700">
                        Finding {index + 1}
                      </p>
                      <h4 className="mt-0.5 text-sm font-black text-slate-900 dark:text-slate-100">
                        {getFindingTitle(finding)}
                      </h4>
                      <p className="mt-1 text-xs font-bold leading-5 text-slate-700 dark:text-slate-700">
                        {statusText([
                          `${finding.photos?.length || 0} photo(s)`,
                          finding.location || "No location",
                          `Risk ${getFindingRisk(finding)}`,
                          `Standards ${standards.length}`,
                        ])}
                      </p>

                      {!isExpanded && (
                        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-700">
                          {finding.description || "No description provided."}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => editFinding(index)}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-[10px] font-black text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
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
                    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-700">
                          Observed condition
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                          {finding.description || "No description provided."}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-700">
                            Location
                          </p>
                          <p className="mt-1 text-xs font-black text-slate-800 dark:text-slate-200">
                            {finding.location || "Not specified"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-700">
                            Hazard Category
                          </p>
                          <p className="mt-1 text-xs font-black text-slate-800 dark:text-slate-200">
                            {finding.hazardCategory || "Not specified"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-700">
                            Risk
                          </p>
                          <p className="mt-1 text-xs font-black text-slate-800 dark:text-slate-200">
                            {getFindingRisk(finding)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-700">
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
                                {formatStandardDisplay(standard)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-700">
                            No standards selected for this finding.
                          </p>
                        )}
                      </div>

                      {finding.safeScopeResult && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-700">
                            HazLenz AI intelligence
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                            {finding.safeScopeResult.summary ||
                              finding.safeScopeResult.recommendation ||
                              finding.safeScopeResult.correctiveAction ||
                              "HazLenz AI result captured for this finding."}
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
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-3 text-sm font-semibold leading-5 text-slate-700 dark:text-slate-700">
            Save at least one finding before generating the final report.
          </p>
        )}
      </div>


    </section>
  );
}
