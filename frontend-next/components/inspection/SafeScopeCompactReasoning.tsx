"use client";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

type SafeScopeCompactReasoningProps = {
  safeScopeResult: any;
  safeScopeAdvancedOpen: boolean;
  setSafeScopeAdvancedOpen: ToggleSetter;
};

export default function SafeScopeCompactReasoning({
  safeScopeResult,
  safeScopeAdvancedOpen,
  setSafeScopeAdvancedOpen,
}: SafeScopeCompactReasoningProps) {
  return (
    <>
      {!!safeScopeResult.confidenceIntelligence?.missingCriticalInformation
        ?.length && (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            Missing information
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.confidenceIntelligence.missingCriticalInformation
              .slice(0, 3)
              .join(" • ")}
          </p>
        </div>
      )}

      {!!safeScopeResult.confidenceIntelligence?.reviewTriggers?.length && (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Supervisor review triggers
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.confidenceIntelligence.reviewTriggers
              .slice(0, 4)
              .map((trigger: string) => (
                <li key={trigger}>{trigger}</li>
              ))}
          </ul>
        </div>
      )}

      <div className="mt-3 border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={() => setSafeScopeAdvancedOpen((open) => !open)}
          className="text-sm font-black text-[#1D72B8] hover:underline"
        >
          {safeScopeAdvancedOpen
            ? "Hide detailed SafeScope reasoning"
            : "Show detailed SafeScope reasoning"}
        </button>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
          Optional technical details for deeper review.
        </p>
      </div>
    </>
  );
}
