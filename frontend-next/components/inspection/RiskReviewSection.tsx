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
        Company matrix: <span className="font-black text-slate-700">{activeRiskScale.label}</span>. Select one cell to confirm severity and likelihood.
      </p>

      {safeScopeResult?.risk?.operationalRisk && (
        <div className="mb-4 border-l-4 border-[#1D72B8] bg-[#E8F4FF] px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            SafeScope Suggested Risk
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
          className="grid gap-1"
          style={{
            gridTemplateColumns: `44px repeat(${activeRiskScale.maxScore}, minmax(0, 1fr))`,
          }}
        >
          <div />
          {severityValues.map((s) => (
            <div key={`s-${s.score}`} className="text-center text-[11px] font-black text-slate-500">
              S{s.score}
            </div>
          ))}

          {likelihoodValues.map((l) => (
            <div key={`likelihood-row-${l.score}`} className="contents">
              <div key={`l-label-${l.score}`} className="flex items-center justify-center text-[11px] font-black text-slate-500">
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
                    className={`min-h-12 rounded-xl border px-2 py-2 text-center text-xs font-black transition ${band.cls} ${
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Selected Severity</p>
            <p className="mt-1 text-sm font-black text-slate-800">
              {severity ? `S${severity}` : "Not selected"}
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Selected Likelihood</p>
            <p className="mt-1 text-sm font-black text-slate-800">
              {likelihood ? `L${likelihood}` : "Not selected"}
            </p>
          </div>
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
