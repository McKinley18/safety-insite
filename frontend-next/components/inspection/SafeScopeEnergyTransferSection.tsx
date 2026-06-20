import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type Props = {
  safeScopeResult: any;
};

export default function SafeScopeEnergyTransferSection({
  safeScopeResult,
}: Props) {
  const energy = safeScopeResult?.energyTransferIntelligence;

  if (!energy) {
    return null;
  }

  return (
    <SafeScopeDrawer
      title="Energy Transfer Intelligence"
      summary={`Dominant energy: ${energy.dominantEnergySource || "undetermined"}`}
      badge={energy.uncontrolledEnergyLikely ? "Uncontrolled Energy" : undefined}
    >
      <p className="text-sm font-semibold leading-6 text-slate-600">
        {energy.energyTransferSummary}
      </p>

      {!!energy.energySources?.length && (
        <div className="mt-2 flex flex-wrap gap-2">
          {energy.energySources.map((source: string) => (
            <span
              key={source}
              className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]"
            >
              {source}
            </span>
          ))}
        </div>
      )}

      {!!energy.releaseMechanisms?.length && (
        <div className="mt-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Release Mechanism
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            {energy.releaseMechanisms[0]}
          </p>
        </div>
      )}

      {!!energy.missingBarriers?.length && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
          {energy.missingBarriers.slice(0, 3).map((barrier: string) => (
            <li key={barrier}>{barrier}</li>
          ))}
        </ul>
      )}

      {!!energy.controlLogic?.length && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
          {energy.controlLogic[0]}
        </p>
      )}
    </SafeScopeDrawer>
  );
}
