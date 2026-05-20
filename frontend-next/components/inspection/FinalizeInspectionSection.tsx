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

function FindingStatusBadge({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
        active ? "bg-[#E8F4FF] text-[#1D72B8]" : "bg-slate-100 text-slate-500"
      }`}
    >
      {label}
    </span>
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

  const reportOptions = [
    {
      label: "Include selected standards",
      desc: "Show regulatory citations selected by the user.",
      checked: includeStandardsInReport,
      toggle: () => setIncludeStandardsInReport(!includeStandardsInReport),
    },
    {
      label: "Include corrective actions",
      desc: "Show selected SafeScope actions and user-entered actions.",
      checked: includeActionsInReport,
      toggle: () => setIncludeActionsInReport(!includeActionsInReport),
    },
    {
      label: "Include evidence photos",
      desc: "Show uploaded/annotated photo evidence in the report.",
      checked: includePhotosInReport,
      toggle: () => setIncludePhotosInReport(!includePhotosInReport),
    },
    {
      label: "Include SafeScope notes",
      desc: "Show confidence and intelligence notes for internal review.",
      checked: includeSafeScopeNotesInReport,
      toggle: () =>
        setIncludeSafeScopeNotesInReport(!includeSafeScopeNotesInReport),
    },
  ];

  return (
    <>
      {currentStep === 6 && (
        <div className="px-1 py-2 sm:px-2">
          <div className="rounded-2xl border border-blue-100 bg-[#F4F9FF] px-4 py-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Finalize Inspection
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Review findings before generating the report
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Save the current finding, review the hazard cards already built,
              then choose what to include in the final report package.
            </p>
          </div>

          {findingSaveMessage && (
            <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-black text-emerald-700">
              {findingSaveMessage}
            </div>
          )}

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
                  Current Finding
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  {currentFindingSaved
                    ? "Current finding is saved"
                    : hasCurrentEntry
                      ? "Current finding needs to be saved"
                      : "No current finding details entered"}
                </h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                  Save or update the current finding before generating the final
                  report.
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
                  Add Another Finding
                </button>
              </div>
            </div>

            {hasCurrentEntry && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-sm font-black text-slate-900">
                  {hazardCategory ||
                    safeScopeResult?.classification ||
                    "Uncategorized finding"}
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  {description || "No observed condition description yet."}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <FindingStatusBadge
                    label={`${photos.length} photo(s)`}
                    active={photos.length > 0}
                  />
                  <FindingStatusBadge
                    label={location || "No location"}
                    active={Boolean(location)}
                  />
                  <FindingStatusBadge
                    label={
                      safeScopeResult?.classification
                        ? "SafeScope reviewed"
                        : "SafeScope not run"
                    }
                    active={Boolean(safeScopeResult?.classification)}
                  />
                  <FindingStatusBadge
                    label={`Standards: ${selectedStandards.length}`}
                    active={selectedStandards.length > 0}
                  />
                  <FindingStatusBadge
                    label={`Risk: ${
                      safeScopeResult?.risk?.riskBand ||
                      riskScore ||
                      "Not rated"
                    }`}
                    active={Boolean(
                      safeScopeResult?.risk?.riskBand || riskScore,
                    )}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
                  Saved Findings
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  {findings.length
                    ? `${findings.length} finding(s) ready`
                    : "No saved findings yet"}
                </h3>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                Hazard Cards
              </span>
            </div>

            {findings.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-900">
                  Save the current finding first.
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                  Saved findings will appear here as hazard cards before you
                  generate the final report.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {findings.map((finding, index) => {
                  const findingTitle =
                    finding.hazardCategory ||
                    finding.safeScopeResult?.classification ||
                    "Uncategorized finding";
                  const findingRisk =
                    finding.safeScopeResult?.risk?.riskBand ||
                    finding.riskScore ||
                    "Not rated";

                  return (
                    <div
                      key={
                        finding.id ||
                        `finding-${index}-${finding.hazardCategory || "unknown"}`
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Finding {index + 1}
                          </p>
                          <h4 className="mt-1 text-base font-black text-slate-900">
                            {findingTitle}
                          </h4>
                        </div>

                        <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black text-[#1D72B8]">
                          {findingRisk}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        {finding.description || "No description provided."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <FindingStatusBadge
                          label={`${finding.photos?.length || 0} photo(s)`}
                          active={(finding.photos?.length || 0) > 0}
                        />
                        <FindingStatusBadge
                          label={finding.location || "No location"}
                          active={Boolean(finding.location)}
                        />
                        <FindingStatusBadge
                          label={
                            finding.safeScopeResult?.classification
                              ? "SafeScope reviewed"
                              : "SafeScope not run"
                          }
                          active={Boolean(
                            finding.safeScopeResult?.classification,
                          )}
                        />
                        <FindingStatusBadge
                          label={`Standards: ${
                            finding.selectedStandards?.length || 0
                          }`}
                          active={(finding.selectedStandards?.length || 0) > 0}
                        />
                      </div>

                      {!!finding.selectedStandards?.length && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {finding.selectedStandards
                            .slice(0, 5)
                            .map((standard: any) => (
                              <span
                                key={standard.citation}
                                className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black text-[#1D72B8]"
                              >
                                {standard.citation}
                              </span>
                            ))}
                          {finding.selectedStandards.length > 5 && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                              +{finding.selectedStandards.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => editFinding(index)}
                          className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteFinding(index)}
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Report Package Options
            </p>
            <h3 className="mt-1 text-lg font-black text-slate-900">
              Choose what appears in the final report
            </h3>

            {reportOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={option.toggle}
                className="mt-3 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${
                    option.checked ? "bg-[#1D72B8]" : "bg-white"
                  }`}
                >
                  {option.checked ? "✓" : ""}
                </span>
                <span>
                  <span className="block text-sm font-black text-slate-900">
                    {option.label}
                  </span>
                  <span className="block text-xs font-semibold text-slate-500">
                    {option.desc}
                  </span>
                </span>
              </button>
            ))}
          </section>

          <section className="mt-4 rounded-2xl border border-[#1D72B8]/20 bg-[#F4F9FF] p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Generate Report
            </p>
            <h3 className="mt-1 text-lg font-black text-slate-900">
              Create the final inspection package
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Generate the report after the current finding is saved and the
              saved hazard cards look correct.
            </p>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={generateReport}
                className="rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C] active:scale-[0.98]"
              >
                Generate Report
              </button>
            </div>

            {findings.length === 0 && (
              <p className="mt-3 text-xs font-bold leading-5 text-amber-700">
                No saved findings yet. Save the current finding before
                generating the report.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
