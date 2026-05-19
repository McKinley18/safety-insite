type Props = {
  safeScopeResult: any;
  submitSafeScopeValidation: (
    decision: "accepted" | "modified" | "rejected" | "escalated" | "insufficient_evidence"
  ) => void;
};

export default function SafeScopeResultHeaderSection({
  safeScopeResult,
  submitSafeScopeValidation,
}: Props) {
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            SafeScope Analysis
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-900">
            {safeScopeResult.classification || "Review Required"}
          </h3>
        </div>

        <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#1D72B8]">
          {Math.round(
            ((safeScopeResult.confidenceIntelligence?.overallConfidence ??
              safeScopeResult.confidence ??
              0) || 0) * 100
          )}% confidence
        </span>
      </div>

      {(safeScopeResult.basicPlanMode || safeScopeResult.upgradeRequiredForFullSafeScope) && (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-[#E8F4FF] p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Plus unlocks full SafeScope
          </p>
          <h4 className="mt-1 text-base font-black text-slate-900">
            You are seeing limited Basic hazard assistance.
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Upgrade to Plus or Company for standards matching, evidence quality review,
            exposure-path reasoning, corrective action recommendations, confidence calibration,
            and full SafeScope traceability.
          </p>
        </div>
      )}

      {safeScopeResult.reasoningSnapshotId && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Supervisor Validation
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            Validate this SafeScope reasoning snapshot for audit history and future learning.
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
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(safeScopeResult.reasoningSnapshotId || safeScopeResult.intelligenceMetadata) && (
        <div className="mb-4 rounded-xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            SafeScope Traceability
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
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
                {safeScopeResult.intelligenceMetadata?.engineVersion || "Not versioned"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Layers
              </p>
              <p className="mt-1 text-xs font-bold text-slate-700">
                {safeScopeResult.intelligenceMetadata?.layersExecuted?.length || 0} executed
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
