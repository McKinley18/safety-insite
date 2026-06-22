import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type Props = {
  safeScopeResult: any;
};

export default function SafeScopeReliabilitySection({
  safeScopeResult,
}: Props) {
  if (!safeScopeResult?.confidenceCalibration && !safeScopeResult?.reasoningDrift) {
    return null;
  }

  return (
    <SafeScopeDrawer
      title="Reliability Intelligence"
      summary={`Calibrated confidence: ${Math.round((safeScopeResult.confidenceCalibration?.calibratedConfidence || 0) * 100)}%`}
      badge={safeScopeResult.confidenceCalibration?.calibrationBand?.replaceAll("_", " ")}
    >
      <p className="text-sm font-semibold leading-6 text-slate-600">
        {safeScopeResult.confidenceCalibration?.reliabilityStatement}
      </p>

      {!!safeScopeResult.confidenceCalibration?.calibrationWarnings?.length && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
          {safeScopeResult.confidenceCalibration.calibrationWarnings
            .slice(0, 3)
            .map((warning: string) => (
              <li key={warning}>{warning}</li>
            ))}
        </ul>
      )}

      {safeScopeResult.reasoningDrift && (
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wide text-slate-700">
            Review consistency: {safeScopeResult.reasoningDrift.driftBand || "low"}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.reasoningDrift.driftSummary}
          </p>
        </div>
      )}
    </SafeScopeDrawer>
  );
}
