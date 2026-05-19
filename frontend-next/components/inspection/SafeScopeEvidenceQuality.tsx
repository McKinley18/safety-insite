"use client";

import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type SafeScopeEvidenceQualityProps = {
  safeScopeResult: any;
};

export default function SafeScopeEvidenceQuality({
  safeScopeResult,
}: SafeScopeEvidenceQualityProps) {
  return (
    <>
      {safeScopeResult.evidenceQuality && (
        <SafeScopeDrawer
          title="Evidence Quality"
          summary={`Defensibility score: ${safeScopeResult.evidenceQuality.evidenceQualityScore}/100`}
        >
          <p className="text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.evidenceQuality.defensibilityStatement}
          </p>

          {!!safeScopeResult.evidenceQuality.gaps?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.evidenceQuality.gaps
                .slice(0, 4)
                .map((gap: string) => (
                  <li key={gap}>{gap}</li>
                ))}
            </ul>
          )}
        </SafeScopeDrawer>
      )}
    </>
  );
}
