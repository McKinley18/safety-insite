"use client";

import { useEffect, useState } from "react";

type Props = {
  currentStep: number;

  findingSaveMessage: string;
  editingFindingIndex: number | null;
  currentFindingSaved: boolean;
  saveFinding: () => void;
  addNewFinding: () => void;
  generateReport: () => void;

  includeStandardsInReport: boolean;
  setIncludeStandardsInReport: (value: boolean) => void;
  includeActionsInReport: boolean;
  setIncludeActionsInReport: (value: boolean) => void;
  includePhotosInReport: boolean;
  setIncludePhotosInReport: (value: boolean) => void;
  includeSafeScopeNotesInReport: boolean;
  setIncludeSafeScopeNotesInReport: (value: boolean) => void;

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

export default function FinalizeInspectionSection({
  currentStep,
  findingSaveMessage,
  editingFindingIndex,
  currentFindingSaved,
  saveFinding,
  addNewFinding,
  generateReport,
  includeStandardsInReport,
  setIncludeStandardsInReport,
  includeActionsInReport,
  setIncludeActionsInReport,
  includePhotosInReport,
  setIncludePhotosInReport,
  includeSafeScopeNotesInReport,
  setIncludeSafeScopeNotesInReport,
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
  if (currentStep !== 6) return null;

  const hasCurrentEntry = Boolean(
    description ||
    hazardCategory ||
    location ||
    photos.length ||
    safeScopeResult,
  );

  const saveButtonLabel =
    editingFindingIndex !== null
      ? "Update Finding"
      : currentFindingSaved
        ? "Update Saved Finding"
        : "Save Current Finding";

  const currentStatus = statusText([
    `${photos.length} photo(s)`,
    location ? "Location added" : "No location",
    safeScopeResult?.classification
      ? "SafeScope reviewed"
      : "SafeScope not run",
    `Standards ${selectedStandards.length}`,
    `Risk ${safeScopeResult?.risk?.riskBand || riskScore || "not rated"}`,
  ]);

  const [reportPackageMode, setReportPackageMode] = useState("local_first");

  useEffect(() => {
    const saved = window.localStorage.getItem("sentinel_report_package_mode");
    if (saved) setReportPackageMode(saved);
  }, []);

  function updateReportPackageMode(value: string) {
    setReportPackageMode(value);
    window.localStorage.setItem("sentinel_report_package_mode", value);

    if (value === "evidence_centered") {
      setIncludePhotosInReport(true);
      setIncludeActionsInReport(true);
      setIncludeStandardsInReport(true);
      setIncludeSafeScopeNotesInReport(false);
    }

    if (value === "export_ready") {
      setIncludePhotosInReport(true);
      setIncludeActionsInReport(true);
      setIncludeStandardsInReport(true);
      setIncludeSafeScopeNotesInReport(true);
    }
  }

  const reportPackageDescriptions: Record<string, string> = {
    local_first: "Private local vault unless workspace sync is selected.",
    evidence_centered:
      "Prioritizes photos, evidence notes, findings, and corrective actions.",
    export_ready:
      "Optimized for final PDF export, audit review, and retention.",
    ask_every_report: "Prompts for storage/export preference on each report.",
  };

  const reportOptions = [
    {
      label: "Standards",
      desc: "Selected citations",
      checked: includeStandardsInReport,
      toggle: () => setIncludeStandardsInReport(!includeStandardsInReport),
    },
    {
      label: "Actions",
      desc: "Corrective work",
      checked: includeActionsInReport,
      toggle: () => setIncludeActionsInReport(!includeActionsInReport),
    },
    {
      label: "Photos",
      desc: "Evidence images",
      checked: includePhotosInReport,
      toggle: () => setIncludePhotosInReport(!includePhotosInReport),
    },
    {
      label: "SafeScope Notes",
      desc: "Internal review details",
      checked: includeSafeScopeNotesInReport,
      toggle: () =>
        setIncludeSafeScopeNotesInReport(!includeSafeScopeNotesInReport),
    },
  ];

  return (
    <div className="px-1 py-2 sm:px-2">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Finalize Inspection
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Save findings, review hazard cards, then generate the report.
        </p>
      </div>

      {findingSaveMessage && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
          {findingSaveMessage}
        </div>
      )}

      <section className="border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              {currentFindingSaved
                ? "Current finding saved"
                : hasCurrentEntry
                  ? "Current finding ready to save"
                  : "No current finding entered"}
            </h3>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              {hasCurrentEntry
                ? currentStatus
                : "Complete the capture and description steps before saving."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveFinding}
              className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8] active:scale-[0.98]"
            >
              {saveButtonLabel}
            </button>

            <button
              type="button"
              onClick={addNewFinding}
              className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-black text-slate-700 transition active:scale-[0.98] active:bg-slate-300"
            >
              Add Finding
            </button>
          </div>
        </div>

        {hasCurrentEntry && (
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-sm font-black text-slate-900">
              {hazardCategory ||
                safeScopeResult?.classification ||
                "Uncategorized finding"}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
              {description || "No observed condition description yet."}
            </p>
          </div>
        )}
      </section>

      <section className="border-b border-slate-200 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Saved Findings
            </p>
            <h3 className="mt-1 text-base font-black text-slate-900">
              {findings.length
                ? `${findings.length} hazard card(s)`
                : "No saved findings"}
            </h3>
          </div>
        </div>

        {findings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
            Save the current finding to build the report.
          </p>
        ) : (
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {findings.map((finding, index) => {
              const findingTitle =
                finding.hazardCategory ||
                finding.safeScopeResult?.classification ||
                "Uncategorized finding";

              const findingStatus = statusText([
                `${finding.photos?.length || 0} photo(s)`,
                finding.location || "No location",
                finding.safeScopeResult?.classification
                  ? "SafeScope reviewed"
                  : "SafeScope not run",
                `Standards ${finding.selectedStandards?.length || 0}`,
                `Risk ${
                  finding.safeScopeResult?.risk?.riskBand ||
                  finding.riskScore ||
                  "not rated"
                }`,
              ]);

              return (
                <div
                  key={
                    finding.id ||
                    `finding-${index}-${finding.hazardCategory || "unknown"}`
                  }
                  className="py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                        Finding {index + 1}
                      </p>
                      <h4 className="mt-0.5 text-sm font-black text-slate-900">
                        {findingTitle}
                      </h4>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => editFinding(index)}
                        className="rounded-lg bg-[#102A43] px-3 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteFinding(index)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
                    {finding.description || "No description provided."}
                  </p>

                  <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                    {findingStatus}
                  </p>

                  {!!finding.selectedStandards?.length && (
                    <p className="mt-1 text-xs font-black text-[#1D72B8]">
                      {finding.selectedStandards
                        .slice(0, 4)
                        .map((standard: any) => standard.citation)
                        .join(" · ")}
                      {finding.selectedStandards.length > 4
                        ? ` · +${finding.selectedStandards.length - 4} more`
                        : ""}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-b border-slate-200 py-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Report Options
        </p>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Report Package
          </span>
          <select
            value={reportPackageMode}
            onChange={(event) => updateReportPackageMode(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
          >
            <option value="local_first">Local-first private vault</option>
            <option value="evidence_centered">Evidence-centered package</option>
            <option value="export_ready">Export-ready package</option>
            <option value="ask_every_report">Ask every report</option>
          </select>
          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
            {reportPackageDescriptions[reportPackageMode]}
          </span>
        </label>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {reportOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={option.toggle}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left"
            >
              <span>
                <span className="block text-sm font-black text-slate-900">
                  {option.label}
                </span>
                <span className="block text-xs font-semibold text-slate-500">
                  {option.desc}
                </span>
              </span>

              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${
                  option.checked ? "bg-[#1D72B8]" : "bg-white"
                }`}
              >
                {option.checked ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="pt-4 text-center">
        <p className="text-xs font-semibold leading-5 text-slate-500">
          Generate after saved findings and report options look correct.
        </p>

        <button
          type="button"
          onClick={generateReport}
          className="mt-3 rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C] active:scale-[0.98]"
        >
          Generate Report
        </button>

        {findings.length === 0 && (
          <p className="mt-2 text-xs font-bold leading-5 text-amber-700">
            Save at least one finding before generating.
          </p>
        )}
      </section>
    </div>
  );
}
