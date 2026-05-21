type Props = {
  safeScopeResult: any;
  submitSafeScopeValidation: (
    decision:
      | "accepted"
      | "modified"
      | "rejected"
      | "escalated"
      | "insufficient_evidence",
  ) => void;
};

function normalizePercent(value: any) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
}

export default function SafeScopeResultHeaderSection({
  safeScopeResult,
  submitSafeScopeValidation,
}: Props) {
  const confidence = Math.round(
    ((safeScopeResult.confidenceIntelligence?.overallConfidence ??
      safeScopeResult.confidence ??
      0) ||
      0) * 100,
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Analysis Complete
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Review the result, then continue to actions.
          </p>
        </div>

        <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#1D72B8]">
          {confidence}% confidence
        </span>
      </div>

      {(safeScopeResult.basicPlanMode ||
        safeScopeResult.upgradeRequiredForFullSafeScope) && (
        <div className="mb-4 rounded-xl bg-[#E8F4FF] px-3 py-3">
          <p className="text-sm font-black text-slate-900">
            Limited Basic hazard assistance
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
            Plus or Company unlocks full standards matching, reasoning, evidence
            quality review, and traceability.
          </p>
        </div>
      )}

      {safeScopeResult.reasoningSnapshotId && (
        <details className="mb-3 rounded-xl bg-slate-50 px-3 py-2">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-slate-600">
            Supervisor validation
          </summary>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Validate this reasoning snapshot for audit history and future
            learning.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["accepted", "Accept"],
              ["modified", "Modify"],
              ["rejected", "Reject"],
              ["escalated", "Escalate"],
              ["insufficient_evidence", "Insufficient Evidence"],
            ].map(([decision, label]) => (
              <button
                key={decision}
                type="button"
                onClick={() => submitSafeScopeValidation(decision as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100"
              >
                {label}
              </button>
            ))}
          </div>
        </details>
      )}

      {(safeScopeResult.reasoningSnapshotId ||
        safeScopeResult.intelligenceMetadata) && (
        <details className="mb-4 rounded-xl bg-slate-50 px-3 py-2">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-slate-600">
            Traceability
          </summary>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Snapshot
              </p>
              <p className="mt-1 break-all text-xs font-bold text-slate-700">
                {safeScopeResult.reasoningSnapshotId || "Not saved"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Engine
              </p>
              <p className="mt-1 text-xs font-bold text-slate-700">
                {safeScopeResult.intelligenceMetadata?.engineVersion ||
                  "Not versioned"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Layers
              </p>
              <p className="mt-1 text-xs font-bold text-slate-700">
                {safeScopeResult.intelligenceMetadata?.layersExecuted?.length ||
                  0}{" "}
                executed
              </p>
            </div>
          </div>
        </details>
      )}
    </>
  );
}
