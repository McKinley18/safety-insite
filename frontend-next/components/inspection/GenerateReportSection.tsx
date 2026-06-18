"use client";

type Props = {
  currentStep: number;
  findings: any[];
  includeStandardsInReport: boolean;
  setIncludeStandardsInReport: (value: boolean) => void;
  includeActionsInReport: boolean;
  setIncludeActionsInReport: (value: boolean) => void;
  includePhotosInReport: boolean;
  setIncludePhotosInReport: (value: boolean) => void;
  includeSafeScopeNotesInReport: boolean;
  setIncludeSafeScopeNotesInReport: (value: boolean) => void;
  generateReport: () => void | Promise<void>;
};

function ReportOptionRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-slate-900 shadow-sm transition hover:bg-blue-50 active:scale-[0.99]"
    >
      <span className="truncate text-sm font-black text-[#102A43]">
        {label}
      </span>

      <span
        className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase leading-none tracking-wide ${
          enabled ? "bg-[#1D72B8] text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        {enabled ? "On" : "Off"}
      </span>
    </button>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex h-16 w-1/3 flex-col items-center justify-start rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-center shadow-sm ring-1 ring-white/10">
      <p className="text-[8px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function GenerateReportSection({
  currentStep,
  findings,
  includeStandardsInReport,
  setIncludeStandardsInReport,
  includeActionsInReport,
  setIncludeActionsInReport,
  includePhotosInReport,
  setIncludePhotosInReport,
  includeSafeScopeNotesInReport,
  setIncludeSafeScopeNotesInReport,
  generateReport,
}: Props) {
  if (currentStep !== 5) return null;

  const findingsWithStandards = findings.filter(
    (finding) => (finding.selectedStandards || finding.standards || []).length,
  ).length;

  const findingsWithPhotos = findings.filter(
    (finding) => (finding.photos || []).length,
  ).length;

  const findingsWithActions = findings.filter(
    (finding) =>
      (finding.selectedGeneratedActions || []).length ||
      (finding.manualActions || []).length ||
      (finding.correctiveActions || []).length,
  ).length;

  return (
    <section className="space-y-4 px-1 py-2 sm:px-2">
      <div className="rounded-2xl border border-[#102A43] bg-[#102A43] p-5 text-white shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
          Step 5
        </p>

        <h2 className="mt-1 text-2xl font-black text-white">
          Generate Report
        </h2>

        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
          Confirm the final report package options, review the report contents,
          and generate the completed inspection report.
        </p>

        <div className="mt-5 flex h-16 w-full items-start justify-center gap-1.5 text-center">
          <SummaryBox label="Findings" value={findings.length} />
          <SummaryBox label="Standards" value={findingsWithStandards} />
          <SummaryBox label="Actions" value={findingsWithActions} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm ring-1 ring-white/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Report Settings Review
            </p>
            <h3 className="mt-1 text-base font-black text-[#102A43]">
              Confirm final report options
            </h3>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">
              These options control what is included in the generated report.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <ReportOptionRow
            label="Applicable standards"
            enabled={includeStandardsInReport}
            onToggle={() =>
              setIncludeStandardsInReport(!includeStandardsInReport)
            }
          />

          <ReportOptionRow
            label="Corrective actions"
            enabled={includeActionsInReport}
            onToggle={() => setIncludeActionsInReport(!includeActionsInReport)}
          />

          <ReportOptionRow
            label="HazLenz AI Notes"
            enabled={includeSafeScopeNotesInReport}
            onToggle={() =>
              setIncludeSafeScopeNotesInReport(!includeSafeScopeNotesInReport)
            }
          />

          <ReportOptionRow
            label="Photos"
            enabled={includePhotosInReport}
            onToggle={() => setIncludePhotosInReport(!includePhotosInReport)}
          />
        </div>
      </div>

      <div className="sentinel-content-card rounded-xl px-4 py-3 sm:px-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Report Contents
        </p>

        <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white">
          Package summary
        </h3>

        <div className="mt-4 flex h-16 w-full items-start justify-center gap-1.5 text-center">
          <div className="flex h-16 w-1/4 flex-col items-center justify-start rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center shadow-sm ring-1 ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:ring-slate-800">
            <p className="text-[8px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total
            </p>
            <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
              {findings.length}
            </p>
          </div>

          <div className="flex h-16 w-1/4 flex-col items-center justify-start rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center shadow-sm ring-1 ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:ring-slate-800">
            <p className="text-[8px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Standards
            </p>
            <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
              {findingsWithStandards}
            </p>
          </div>

          <div className="flex h-16 w-1/4 flex-col items-center justify-start rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center shadow-sm ring-1 ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:ring-slate-800">
            <p className="text-[8px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Actions
            </p>
            <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
              {findingsWithActions}
            </p>
          </div>

          <div className="flex h-16 w-1/4 flex-col items-center justify-start rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center shadow-sm ring-1 ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:ring-slate-800">
            <p className="text-[8px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Photos
            </p>
            <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
              {findingsWithPhotos}
            </p>
          </div>
        </div>
      </div>

      <div className="sentinel-content-card rounded-xl px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Final Output
            </p>

            <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white">
              Generate completed inspection report
            </h3>

            <p className="mt-1 text-sm font-semibold leading-5 text-slate-500 dark:text-slate-300">
              Create the final report using the saved findings and selected
              report package options.
            </p>
          </div>

          <button
            type="button"
            onClick={generateReport}
            disabled={!findings.length}
            className="insite-inspection-action insite-inspection-action-orange insite-inspection-action-sm self-center sm:self-auto"
          >
            Generate
          </button>
        </div>
      </div>
    </section>
  );
}
