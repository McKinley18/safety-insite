import { RISK_BAND_CLASSES, riskBandForScore } from "@/lib/inspection/riskBands";

type RiskScaleItem = {
  score: number;
  label: string;
  desc: string;
};

type ActiveRiskScale = {
  maxScore: number;
  severity: RiskScaleItem[];
  likelihood: RiskScaleItem[];
  label: string;
};

type Props = {
  activeRiskScale: ActiveRiskScale;
  safeScopeResult: any;
  severity: number | null;
  setSeverity: (value: number) => void;
  likelihood: number | null;
  setLikelihood: (value: number) => void;
};

/**
 * Cell banding comes from the ONE shared table in `lib/inspection/riskBands.ts`, which mirrors
 * `backend/src/safescope-v2/risk/risk-profiles.ts` and is held to it by
 * `npm run check:risk-band-parity`.
 *
 * This was previously a proportional rule (>=75% Critical, >=50% High, >=25% Medium), which
 * disagrees with the engine at ordinary cells: on the 5x5 matrix severity 4 x likelihood 3 = 12 is
 * 48% and was coloured "Medium", while the engine's band table -- the one that decides what is
 * SAVED on the finding and printed in the report -- calls 12 "High". A matrix cell whose colour
 * contradicts the risk recorded against it is a safety-relevant display defect.
 */
function scoreBand(score: number, maxScore: number) {
  const label = riskBandForScore(score, maxScore);
  return { label, cls: RISK_BAND_CLASSES[label] };
}

export default function RiskReviewSection({
  activeRiskScale,
  safeScopeResult,
  severity,
  setSeverity,
  likelihood,
  setLikelihood,
}: Props) {
  const likelihoodValues = [...activeRiskScale.likelihood].reverse();
  const severityValues = activeRiskScale.severity;

  return (
    <>
      <p className="mb-4 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-200">
        Risk matrix: <span className="font-black text-slate-800 dark:text-slate-100">{activeRiskScale.label}</span>. Select one cell to confirm severity and likelihood.
      </p>

      {safeScopeResult?.risk?.operationalRisk && (
        <div className="mb-4 border-l-4 border-[#1D72B8] bg-[#E8F4FF] px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            HazLenz AI Suggested Risk
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
            Severity {safeScopeResult.risk.operationalRisk.severity} × Likelihood {safeScopeResult.risk.operationalRisk.likelihood} = {safeScopeResult.risk.operationalRisk.matrixScore} {safeScopeResult.risk.operationalRisk.matrixBand}
          </p>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-black text-slate-900 dark:text-slate-100">Risk Matrix</h3>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Likelihood ↑ / Severity →
          </p>
        </div>

        <div
          className="mx-auto grid w-fit gap-1.5"
          style={{
            gridTemplateColumns: `26px repeat(${activeRiskScale.maxScore}, 34px)`,
          }}
        >
          <div />
          {severityValues.map((s) => (
            <div key={`s-${s.score}`} className="text-center text-[9px] font-black text-slate-800 dark:text-slate-200">
              S{s.score}
            </div>
          ))}

          {likelihoodValues.map((l) => (
            <div key={`likelihood-row-${l.score}`} className="contents">
              <div key={`l-label-${l.score}`} className="flex items-center justify-center text-[9px] font-black text-slate-800 dark:text-slate-200">
                L{l.score}
              </div>

              {severityValues.map((s) => {
                const score = s.score * l.score;
                const band = scoreBand(score, activeRiskScale.maxScore);
                const selected = severity === s.score && likelihood === l.score;

                return (
                  <button
                    key={`${s.score}-${l.score}`}
                    type="button"
                    onClick={() => {
                      setSeverity(s.score);
                      setLikelihood(l.score);
                    }}
                    className={`min-h-8 rounded-lg border px-1 py-1 text-center text-[10px] font-black transition ${band.cls} ${
                      selected ? "ring-2 ring-[#1D72B8] ring-offset-2" : "hover:scale-[1.02]"
                    }`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-3">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">User-Approved Risk</p>
        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {severity && likelihood
            ? `Severity ${severity} × Likelihood ${likelihood} = ${severity * likelihood}`
            : "Select a matrix cell to confirm the final risk rating."}
        </p>
      </div>
    </>
  );
}
