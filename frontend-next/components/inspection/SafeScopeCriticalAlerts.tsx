"use client";

type SafeScopeCriticalAlertsProps = {
  safeScopeResult: any;
};

export default function SafeScopeCriticalAlerts({
  safeScopeResult,
}: SafeScopeCriticalAlertsProps) {
  return (
    <>
      {safeScopeResult.duplicateIntelligence?.possibleDuplicate && (
        <div className="mt-4 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold leading-6 text-amber-900">
          Possible duplicate or repeat finding detected.{" "}
          {
            safeScopeResult.duplicateIntelligence
              .recommendedSplitOrMergeAction
          }
        </div>
      )}

      {safeScopeResult.risk?.requiresShutdown && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-black text-red-700">
          Shutdown / immediate control recommended.
        </p>
      )}
    </>
  );
}
