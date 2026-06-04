"use client";

type SafeScopeConfidenceReasonCodesProps = {
  safeScopeResult: any;
};

export default function SafeScopeConfidenceReasonCodes({
  safeScopeResult,
}: SafeScopeConfidenceReasonCodesProps) {
  return (
    <>
      {!!safeScopeResult.confidenceIntelligence?.reasonCodes?.length && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Confidence reason codes
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {safeScopeResult.confidenceIntelligence.reasonCodes
              .slice(0, 6)
              .map((code: string) => (
                <span
                  key={code}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                >
                  {code.replaceAll("_", " ")}
                </span>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
