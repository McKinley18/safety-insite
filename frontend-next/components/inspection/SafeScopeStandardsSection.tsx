type Props = {
  safeScopeResult: any;
  feedbackNotes: string;
  setFeedbackNotes: (value: string) => void;
  selectedStandards: any[];
  getStandardKey: (standard: any) => string;
  toggleSelectedStandard: (standard: any) => void;
  handleFeedback: (standard: any, decision: "accepted" | "rejected" | "flagged") => void | Promise<void>;
};

export default function SafeScopeStandardsSection({
  safeScopeResult,
  feedbackNotes,
  setFeedbackNotes,
  selectedStandards,
  getStandardKey,
  toggleSelectedStandard,
  handleFeedback,
}: Props) {
  if (!safeScopeResult?.suggestedStandards?.length) {
    return null;
  }

  return (
    <div className="mb-3 border-y border-slate-200 py-3">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          Standards Review
        </p>

        <h3 className="mt-1 text-xl font-black text-slate-900">
          SafeScope Suggested Standards
        </h3>

        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Select only the standards you want included in the final report.
          Suggestions are not final until reviewed.
        </p>
      </div>

      <label className="mb-2 block text-sm font-black text-slate-700">
        Feedback Notes
      </label>

      <textarea
        value={feedbackNotes}
        onChange={(e) => setFeedbackNotes(e.target.value)}
        placeholder="Optional notes for accepting, rejecting, or flagging a standard."
        className="mb-3 min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
      />

      {safeScopeResult.suggestedStandards.map((standard: any) => {
        const selected = selectedStandards.some(
          (item) => getStandardKey(item) === getStandardKey(standard)
        );

        return (
          <div
            key={standard.citation}
            className={`mb-3 border-b border-slate-200 py-3 transition ${
              selected
                ? "border-[#1D72B8] bg-[#E8F4FF]"
                : "border-slate-200 bg-transparent hover:bg-slate-50"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-black text-[#1D72B8]">
                {standard.citation}
              </div>

              {selected && (
                <span className="rounded-full bg-[#1D72B8] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                  Selected for Report
                </span>
              )}

              {(Array.isArray(standard.source)
                ? standard.source
                : [standard.source]
              )
                .filter(Boolean)
                .map((source: string) => (
                  <span
                    key={source}
                    className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                  >
                    {source === "cfr_database"
                      ? "CFR Database"
                      : "Curated"}
                  </span>
                ))}

              {standard.score !== undefined && (
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                  Score {standard.score}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {standard.rationale}
            </p>

            {standard.workspaceLearningAdjustment !== undefined &&
              standard.workspaceLearningAdjustment !== 0 && (
                <div className="mt-2 border-l-4 border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
                  Workspace learning adjustment:{" "}
                  {standard.workspaceLearningAdjustment > 0 ? "+" : ""}
                  {standard.workspaceLearningAdjustment}
                </div>
              )}

            {!!standard.workspaceLearningWarnings?.length && (
              <div className="mt-2 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
                {standard.workspaceLearningWarnings.join(" • ")}
              </div>
            )}

            {!!standard.matchingReasons?.length && (
              <div className="mt-2 border-l-4 border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Why SafeScope matched this
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {standard.matchingReasons.slice(0, 6).join(" • ")}
                </p>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleSelectedStandard(standard);

                  if (!selected) {
                    handleFeedback(standard, "accepted");
                  }
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-black ${
                  selected
                    ? "bg-[#1D72B8] text-white"
                    : "bg-[#DCFCE7] text-[#166534]"
                }`}
              >
                {selected ? "Remove from Report" : "Select for Report"}
              </button>

              <button
                type="button"
                onClick={() => handleFeedback(standard, "rejected")}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() => handleFeedback(standard, "flagged")}
                className="rounded-full bg-[#FEF3C7] px-3 py-1.5 text-xs font-black text-[#92400E]"
              >
                Flag
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
