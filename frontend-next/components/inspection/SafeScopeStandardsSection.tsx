type Props = {
  safeScopeResult: any;
  feedbackNotes: string;
  setFeedbackNotes: (value: string) => void;
  selectedStandards: any[];
  getStandardKey: (standard: any) => string;
  toggleSelectedStandard: (standard: any) => void;
  handleFeedback: (
    standard: any,
    decision: "accepted" | "rejected" | "flagged",
  ) => void | Promise<void>;
  safeScopeStandardsOpen: boolean;
  setSafeScopeStandardsOpen: (updater: any) => void;
};

export default function SafeScopeStandardsSection({
  safeScopeResult,
  feedbackNotes,
  setFeedbackNotes,
  selectedStandards,
  getStandardKey,
  toggleSelectedStandard,
  handleFeedback,
  safeScopeStandardsOpen,
  setSafeScopeStandardsOpen,
}: Props) {
  if (!safeScopeResult?.suggestedStandards?.length) {
    return null;
  }

  const standards = safeScopeResult.suggestedStandards;
  const selectedCount = standards.filter((standard: any) =>
    selectedStandards.some(
      (item) => getStandardKey(item) === getStandardKey(standard),
    ),
  ).length;

  return (
    <div className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={() => setSafeScopeStandardsOpen((open: boolean) => !open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Standards Review
          </p>
          <h3 className="mt-1 text-base font-black text-slate-900">
            {standards.length} suggested standard(s)
          </h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {selectedCount
              ? `${selectedCount} selected for the report.`
              : "Review only if you want to include standards in the report."}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
          {safeScopeStandardsOpen ? "Hide" : "Review"}
        </span>
      </button>

      {!safeScopeStandardsOpen && (
        <div className="mt-3 flex flex-wrap gap-2">
          {standards.slice(0, 3).map((standard: any) => (
            <span
              key={standard.citation}
              className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black text-[#1D72B8]"
            >
              {standard.citation}
            </span>
          ))}
          {standards.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
              +{standards.length - 3} more
            </span>
          )}
        </div>
      )}

      {safeScopeStandardsOpen && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-black text-slate-700">
            Feedback Notes
          </label>

          <textarea
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            placeholder="Optional notes for accepting, rejecting, or flagging a standard."
            className="mb-3 min-h-20 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
          />

          {standards.map((standard: any) => {
            const selected = selectedStandards.some(
              (item) => getStandardKey(item) === getStandardKey(standard),
            );

            return (
              <div
                key={standard.citation}
                className={`mb-3 rounded-2xl border border-slate-200 px-3 py-3 transition ${
                  selected
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-black text-[#1D72B8]">
                    {standard.citation}
                  </div>

                  {selected && (
                    <span className="rounded-full bg-[#1D72B8] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                      Selected
                    </span>
                  )}

                  {standard.score !== undefined && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                      Score {standard.score}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {standard.rationale}
                </p>

                {!!standard.matchingReasons?.length && (
                  <details className="mt-2 rounded-xl bg-slate-50 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-slate-500">
                      Why SafeScope matched this
                    </summary>

                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                      {standard.matchingReasons.slice(0, 6).join(" • ")}
                    </p>
                  </details>
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
      )}
    </div>
  );
}
