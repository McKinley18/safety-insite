type Props = {
  safeScopeResult: any;
};

export default function SafeScopeActionEffectivenessSection({
  safeScopeResult,
}: Props) {
  const effectiveness = safeScopeResult?.actionEffectiveness;

  if (!effectiveness) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Corrective Action Effectiveness
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Effectiveness: {effectiveness.effectivenessScore}/100
          </h4>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">
          {effectiveness.effectivenessBand}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        {effectiveness.effectivenessStatement}
      </p>

      {!!effectiveness.unresolvedElements?.length && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
          {effectiveness.unresolvedElements
            .slice(0, 4)
            .map((item: string) => (
              <li key={item}>{item}</li>
            ))}
        </ul>
      )}

      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
        {effectiveness.recommendedImprovement}
      </p>
    </div>
  );
}
