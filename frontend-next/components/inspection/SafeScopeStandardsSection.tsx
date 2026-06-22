import { formatStandardDisplay, getStandardCitation, getStandardSummary } from "@/lib/inspection/standardDisplay";

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
  const standards = safeScopeResult?.suggestedStandards?.length
    ? safeScopeResult.suggestedStandards
    : safeScopeResult?.inspectionIntelligence?.candidateStandards || [];

  if (!standards.length) {
    return null;
  }
  const selectedCount = standards.filter((standard: any) =>
    selectedStandards.some(
      (item) => getStandardKey(item) === getStandardKey(standard),
    ),
  ).length;

  return (
    <div className="mb-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={() => setSafeScopeStandardsOpen((open: boolean) => !open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Standards Review
          </p>
          <h3 className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
            {standards.length} suggested standard(s)
          </h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
            {selectedCount
              ? `${selectedCount} selected for the report.`
              : "Review only if you want to include standards in the report."}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:text-slate-300">
          {safeScopeStandardsOpen ? "Hide" : "Review"}
        </span>
      </button>

      {!safeScopeStandardsOpen && (
        <div className="mt-3 flex flex-wrap gap-2">
          {standards.slice(0, 3).map((standard: any) => (
            <span
              key={getStandardCitation(standard) || formatStandardDisplay(standard)}
              className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black text-[#1D72B8]"
            >
              {formatStandardDisplay(standard)}
            </span>
          ))}
          {standards.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:text-slate-300">
              +{standards.length - 3} more
            </span>
          )}
        </div>
      )}

      {safeScopeStandardsOpen && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
            Feedback Notes
          </label>

          <textarea
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            placeholder="Optional notes for accepting, rejecting, or flagging a standard."
            className="mb-3 min-h-20 w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-[#1D72B8] focus:bg-white dark:focus:bg-slate-900"
          />

          {standards.map((standard: any) => {
            const selected = selectedStandards.some(
              (item) => getStandardKey(item) === getStandardKey(standard),
            );

            return (
              <div
                key={getStandardCitation(standard) || formatStandardDisplay(standard)}
                className={`mb-3 rounded-2xl border border-slate-200 dark:border-slate-800 px-3 py-3 transition ${
                  selected
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-black text-[#1D72B8]">
                    {formatStandardDisplay(standard)}
                  </div>

                  {selected && (
                    <span className="rounded-full bg-[#1D72B8] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                      Selected
                    </span>
                  )}

                  {standard.score !== undefined && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Score {standard.score}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                  {getStandardSummary(standard) || "No summary available."}
                </p>

                {!!standard.matchingReasons?.length && (
                  <details className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Why this matched
                    </summary>

                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                      {standard.matchingReasons.slice(0, 6).join(" • ")}
                    </p>
                  </details>
                )}

                {(() => {
                  const citationStr = getStandardCitation(standard);
                  const normCitation = citationStr?.toLowerCase().replace(/\s+/g, "");
                  const explanation = safeScopeResult?.standardsMatchExplanations?.find(
                    (e: any) => e.reference?.toLowerCase().replace(/\s+/g, "") === normCitation
                  );

                  if (!explanation) return null;

                  return (
                    <details className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2.5 border border-slate-200/50 dark:border-slate-800/40">
                      <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-[#1D72B8] outline-none">
                        Match Details
                      </summary>

                      <div className="mt-2.5 space-y-2.5 text-xs">
                        {/* Matched Facts */}
                        {explanation.matchedFacts?.length > 0 && (
                          <div>
                            <p className="font-black text-slate-600 dark:text-slate-300 uppercase text-[9px] tracking-wide">
                              Matched Facts
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {explanation.matchedFacts.slice(0, 8).map((fact: string) => (
                                <span
                                  key={fact}
                                  className="rounded bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 capitalize"
                                >
                                  {fact}
                                </span>
                              ))}
                              {explanation.matchedFacts.length > 8 && (
                                <span className="rounded bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-black text-slate-600 dark:text-slate-300">
                                  +{explanation.matchedFacts.length - 8} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Satisfied Evidence */}
                        {explanation.satisfiedEvidence?.length > 0 && (
                          <div>
                            <p className="font-black text-slate-500 uppercase text-[9px] tracking-wide">
                              Satisfied Evidence
                            </p>
                            <ul className="mt-1 space-y-1 pl-4 list-disc text-slate-700 dark:text-slate-300">
                              {explanation.satisfiedEvidence.map((ev: string) => (
                                <li key={ev} className="font-semibold leading-relaxed">
                                  {ev}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Missing Operational Evidence */}
                        {explanation.missingEvidence?.length > 0 && (
                          <div>
                            <p className="font-black text-amber-600 dark:text-amber-400 uppercase text-[9px] tracking-wide">
                              Evidence Needed / Open Questions
                            </p>
                            <ul className="mt-1 space-y-1 pl-4 list-disc text-amber-800 dark:text-amber-400/90">
                              {explanation.missingEvidence.map((ev: string) => (
                                <li key={ev} className="font-bold leading-relaxed">
                                  {ev}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Advisory Disclaimer */}
                        <p className="text-[10px] leading-normal text-slate-600 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-800/40 pt-2 font-semibold">
                          ℹ️ This standards-informed reference is advisory-only, does not declare regulatory violations, and requires qualified professional review.
                        </p>
                      </div>
                    </details>
                  );
                })()}

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
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 dark:text-slate-300"
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
