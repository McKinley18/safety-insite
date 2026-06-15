"use client";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

type SafeScopeCompactReasoningProps = {
  safeScopeResult: any;
  safeScopeAdvancedOpen: boolean;
  setSafeScopeAdvancedOpen: ToggleSetter;
};

function asFieldList(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => String(item));
}

export default function SafeScopeCompactReasoning({
  safeScopeResult,
  safeScopeAdvancedOpen,
  setSafeScopeAdvancedOpen,
}: SafeScopeCompactReasoningProps) {
  const fieldOutput = safeScopeResult?.fieldOutput;
  const missingInformation = asFieldList(fieldOutput?.evidenceGaps).length
    ? asFieldList(fieldOutput?.evidenceGaps)
    : asFieldList(safeScopeResult.confidenceIntelligence?.missingCriticalInformation);

  const reviewTriggers = asFieldList(fieldOutput?.warnings).length
    ? asFieldList(fieldOutput?.warnings)
    : asFieldList(safeScopeResult.confidenceIntelligence?.reviewTriggers);

  return (
    <>
      {!!missingInformation.length && (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            Missing information
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            {missingInformation.slice(0, 3).join(" • ")}
          </p>
        </div>
      )}

      {!!reviewTriggers.length && (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Supervisor review triggers
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
            {reviewTriggers.slice(0, 4).map((trigger: string) => (
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
            ? "Hide detailed HazLenz AI reasoning"
            : "Show detailed HazLenz AI reasoning"}
        </button>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
          Optional technical details for deeper review.
        </p>
      </div>
    </>
  );
}
