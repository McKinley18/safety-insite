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
        <div className="mt-4 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold leading-6 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Possible duplicate or repeat finding detected.{" "}
          {
            safeScopeResult.duplicateIntelligence
              .recommendedSplitOrMergeAction
          }
        </div>
      )}

      {safeScopeResult.risk?.requiresShutdown && (
        <div className="mt-4 border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm font-black text-red-800 dark:bg-red-950 dark:text-red-200">
          Shutdown / immediate control recommended.
        </div>
      )}
    </>
  );
}
