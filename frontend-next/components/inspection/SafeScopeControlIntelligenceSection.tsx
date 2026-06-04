type Props = {
  safeScopeResult: any;
};

export default function SafeScopeControlIntelligenceSection({
  safeScopeResult,
}: Props) {
  const control = safeScopeResult?.controlIntelligence;

  if (!control) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Control Intelligence
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Strongest control: {control.strongestControl?.replaceAll("_", " ") || "general"}
          </h4>
        </div>

        {control.verificationNeeded && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
            Verify
          </span>
        )}
      </div>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        {control.hierarchyAssessment}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {(control.controlTypes || []).map((type: string) => (
          <span
            key={type}
            className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]"
          >
            {type.replaceAll("_", " ")}
          </span>
        ))}
      </div>

      {!!control.controlGaps?.length && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
          {control.controlGaps.slice(0, 3).map((gap: string) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
        {control.verificationRecommendation}
      </p>
    </div>
  );
}
