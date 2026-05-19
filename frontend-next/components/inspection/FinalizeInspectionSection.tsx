type Props = {
  currentStep: number;

  findingSaveMessage: string;
  editingFindingIndex: number | null;
  currentFindingSaved: boolean;
  saveFinding: () => void;
  addNewFinding: () => void;

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

export default function FinalizeInspectionSection({
  currentStep,
  findingSaveMessage,
  editingFindingIndex,
  currentFindingSaved,
  saveFinding,
  addNewFinding,
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
  return (
    <>
      {currentStep === 6 && (
        <div className="px-1 py-2 sm:px-2">
          <h2 className="mb-4 text-xl font-black text-slate-900">Finalize Inspection</h2>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-slate-900">Inspection Summary</p>
            <p className="mt-2 text-sm text-slate-600">
              Review saved findings and generate the final inspection report.
            </p>
          </div>

          {findingSaveMessage && (
            <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-black text-emerald-700">
              {findingSaveMessage}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="font-black text-slate-900">Report Customization</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Choose what appears in the final report.
            </p>

            {[
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
                toggle: () => setIncludeSafeScopeNotesInReport(!includeSafeScopeNotesInReport),
              },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={option.toggle}
                className="mt-3 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left"
              >
                <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${option.checked ? "bg-[#1D72B8]" : "bg-white"}`}>
                  {option.checked ? "✓" : ""}
                </span>
                <span>
                  <span className="block text-sm font-black text-slate-900">{option.label}</span>
                  <span className="block text-xs font-semibold text-slate-500">{option.desc}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={saveFinding}
              className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8] active:scale-[0.98]"
            >
              {editingFindingIndex !== null
                ? "Update Finding"
                : currentFindingSaved
                  ? "Update Saved Finding"
                  : "Save Current Finding"}
            </button>

            <button
              onClick={addNewFinding}
              className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition active:scale-[0.98] active:bg-slate-300"
            >
              Add New Finding
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-black text-slate-900">
          {currentStep === 6 ? "Saved Findings" : "Current Entry"}
        </h2>

        {currentStep !== 6 ? (
          <>
            <p className="text-sm font-semibold text-slate-600">
              {description || hazardCategory || location
                ? `${hazardCategory || "Uncategorized"} • ${description || "No description yet"}`
                : "Start entering finding details to build the current entry."}
            </p>
            <p className="mt-2 text-xs font-black text-slate-500">
              Photos: {photos.length} • Risk: {safeScopeResult?.risk?.riskBand || riskScore || "Not rated"} • Selected Standards: {selectedStandards.length}
            </p>

            {!!selectedStandards.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedStandards.map((standard: any) => (
                  <span key={standard.citation} className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black text-[#1D72B8]">
                    {standard.citation}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : findings.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">No saved findings yet.</p>
        ) : (
          <div className="space-y-3">
            {findings.map((finding, index) => (
              <div key={finding.id || `finding-${index}-${finding.hazardCategory || "unknown"}`} className="rounded-xl border border-slate-200 p-3">
                <div className="font-black">Finding {index + 1}: {finding.hazardCategory || "Uncategorized"}</div>
                <p className="mt-1 text-sm text-slate-600">{finding.description || "No description provided."}</p>
                {!!finding.location && (
                  <p className="mt-1 text-xs font-bold text-slate-500">Location: {finding.location}</p>
                )}
                <p className="mt-1 text-xs font-black text-slate-500">
                  Photos: {finding.photos?.length || 0} • SafeScope: {finding.safeScopeResult?.classification || "Not run"} • Risk: {finding.safeScopeResult?.risk?.riskBand || finding.riskScore || "Not rated"} • Selected Standards: {finding.selectedStandards?.length || 0}
                </p>

                {!!finding.selectedStandards?.length && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {finding.selectedStandards.map((standard: any) => (
                      <span key={standard.citation} className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black text-[#1D72B8]">
                        {standard.citation}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => editFinding(index)}
                    className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteFinding(index)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
