"use client";

import { useEffect, useState } from "react";

type Props = {
  currentStep: number;

  findingSaveMessage: string;
  editingFindingIndex: number | null;
  currentFindingSaved: boolean;
  saveFinding: () => void | Promise<void>;
  addNewFinding: () => void | Promise<void>;
  generateReport: () => void | Promise<void>;

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

function getFindingTitle(finding: any) {
  return (
    finding.hazardCategory ||
    finding.safeScopeResult?.classification ||
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
  const [reportPackageMode, setReportPackageMode] = useState(
    "professional_compliance",
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("sentinel_report_package_mode");
    if (saved) setReportPackageMode(saved);
  }, []);

  function updateReportPackageMode(value: string) {
    setReportPackageMode(value);
    window.localStorage.setItem("sentinel_report_package_mode", value);

    if (value === "field_summary") {
      setIncludePhotosInReport(true);
      setIncludeActionsInReport(true);
      setIncludeStandardsInReport(true);
      setIncludeSafeScopeNotesInReport(false);
    }

    if (value === "professional_compliance") {
      setIncludePhotosInReport(true);
      setIncludeActionsInReport(true);
      setIncludeStandardsInReport(true);
      setIncludeSafeScopeNotesInReport(false);
    }

    if (value === "validation_appendix") {
      setIncludePhotosInReport(true);
      setIncludeActionsInReport(true);
      setIncludeStandardsInReport(true);
      setIncludeSafeScopeNotesInReport(true);
    }
  }

  const hasCurrentEntry = Boolean(
    description ||
      hazardCategory ||
      location ||
      photos.length ||
      safeScopeResult ||
      selectedStandards.length,
  );

  const saveButtonLabel =
    editingFindingIndex !== null
      ? "Update Finding"
      : currentFindingSaved
        ? "Update Finding"
        : "Save Finding";

  const currentTitle =
    hazardCategory || safeScopeResult?.classification || "Current finding";

  const currentStatus = statusText([
    `${photos.length} photo(s)`,
    location || "No location",
    safeScopeResult?.classification ? "SafeScope reviewed" : "SafeScope not run",
    `Selected ${selectedStandards.length}`,
    `Risk ${safeScopeResult?.risk?.riskBand || riskScore || "not rated"}`,
  ]);

  const reportPackageDescriptions: Record<string, string> = {
    field_summary:
      "Fast internal summary with findings, photos, standards, and corrective actions.",
    professional_compliance:
      "Recommended. Formal inspection report with findings, evidence, standards, risk, and corrective actions.",
    validation_appendix:
      "Full defensibility package with SafeScope validation reasoning, confidence notes, and traceability.",
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
      desc: "Validation appendix",
      checked: includeSafeScopeNotesInReport,
      toggle: () =>
        setIncludeSafeScopeNotesInReport(!includeSafeScopeNotesInReport),
    },
  ];

  if (currentStep !== 4 && currentStep !== 5) return null;

  if (currentStep === 4) {
    return (
      <section className="space-y-4 px-1 py-2 sm:px-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Final Findings
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Compiled findings list
          </h2>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
            Save the current finding, add another finding if needed, or continue
            to report customization.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                Saved
              </p>
              <p className="mt-1 text-sm font-black text-slate-900">
                {findings.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                Current
              </p>
              <p className="mt-1 text-sm font-black text-slate-900">
                {currentFindingSaved ? "Saved" : hasCurrentEntry ? "Draft" : "Empty"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                Next
              </p>
              <p className="mt-1 text-sm font-black text-slate-900">Options</p>
            </div>
          </div>
        </div>

        {findingSaveMessage && (
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
            {findingSaveMessage}
          </div>
        )}

        {hasCurrentEntry && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
                  Current Finding
                </p>
                <h3 className="mt-1 text-base font-black text-slate-900">
                  {currentTitle}
                </h3>
                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                  {currentStatus}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                  currentFindingSaved
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {currentFindingSaved ? "Saved" : "Draft"}
              </span>
            </div>

            <p className="mt-3 line-clamp-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
              {description || "No observed condition description yet."}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
              >
                Save & Add Finding
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Findings List
          </p>
          <h3 className="mt-1 text-base font-black text-slate-900">
            {findings.length
              ? `${findings.length} saved finding(s)`
              : "No saved findings"}
          </h3>

          {findings.length ? (
            <div className="mt-3 space-y-2">
              {findings.map((finding: any, index: number) => (
                <div
                  key={finding.id || `finding-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
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
                          `Standards ${finding.selectedStandards?.length || 0}`,
                        ])}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                        {finding.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => editFinding(index)}
                        className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-700 shadow-sm"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteFinding(index)}
                        className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[10px] font-black text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold leading-5 text-slate-500">
              Save the current finding to build the findings list.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 px-1 py-2 sm:px-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Report Options
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-900">
          Customize final report
        </h2>
        <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
          Choose the report package and what supporting content should be
          included.
        </p>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Report Package
          </span>
          <select
            value={reportPackageMode}
            onChange={(event) => updateReportPackageMode(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
          >
            <option value="professional_compliance">
              Professional Compliance Report
            </option>
            <option value="field_summary">Field Summary</option>
            <option value="validation_appendix">Full Validation Appendix</option>
          </select>
          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
            {reportPackageDescriptions[reportPackageMode]}
          </span>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Include in Report
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {reportOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={option.toggle}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                option.checked
                  ? "border-[#1D72B8] bg-[#E8F4FF]"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {option.label}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {option.desc}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                    option.checked
                      ? "bg-[#1D72B8] text-white"
                      : "bg-white text-slate-400"
                  }`}
                >
                  {option.checked ? "On" : "Off"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={generateReport}
          className="w-full rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C] active:scale-[0.98]"
        >
          Generate Report
        </button>
      </div>
    </section>
  );
}
