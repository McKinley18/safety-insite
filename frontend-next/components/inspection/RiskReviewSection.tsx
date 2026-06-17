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

function scoreBand(score: number, maxScore: number) {
  const max = maxScore * maxScore;
  const ratio = score / max;

  if (ratio >= 0.75) return { label: "Critical", cls: "bg-red-100 text-red-800 border-red-200" };
  if (ratio >= 0.5) return { label: "High", cls: "bg-orange-100 text-orange-800 border-orange-200" };
  if (ratio >= 0.25) return { label: "Medium", cls: "bg-amber-100 text-amber-800 border-amber-200" };
  return { label: "Low", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" };
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
      <p className="mb-4 text-sm font-semibold leading-6 text-slate-500">
        Risk matrix: <span className="font-black text-slate-700">{activeRiskScale.label}</span>. Select one cell to confirm severity and likelihood.
      </p>

      {safeScopeResult?.risk?.operationalRisk && (
        <div className="mb-4 border-l-4 border-[#1D72B8] bg-[#E8F4FF] px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            HazLenz AI Suggested Risk
          </p>
          <p className="mt-1 text-sm font-bold text-slate-700">
            Severity {safeScopeResult.risk.operationalRisk.severity} × Likelihood {safeScopeResult.risk.operationalRisk.likelihood} = {safeScopeResult.risk.operationalRisk.matrixScore} {safeScopeResult.risk.operationalRisk.matrixBand}
          </p>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-black text-slate-800">Risk Matrix</h3>
          <p className="text-xs font-bold text-slate-500">
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
            <div key={`s-${s.score}`} className="text-center text-[9px] font-black text-slate-500">
              S{s.score}
            </div>
          ))}

          {likelihoodValues.map((l) => (
            <div key={`likelihood-row-${l.score}`} className="contents">
              <div key={`l-label-${l.score}`} className="flex items-center justify-center text-[9px] font-black text-slate-500">
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
        <p className="mt-1 text-sm font-semibold text-slate-600">
          {severity && likelihood
            ? `Severity ${severity} × Likelihood ${likelihood} = ${severity * likelihood}`
            : "Select a matrix cell to confirm the final risk rating."}
        </p>
      </div>
    </>
  );
}
