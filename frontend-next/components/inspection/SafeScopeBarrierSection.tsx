import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type Props = {
  safeScopeResult: any;
};

export default function SafeScopeBarrierSection({
  safeScopeResult,
}: Props) {
  const barrier = safeScopeResult?.barrierIntelligence;

  if (!barrier) {
    return null;
  }

  return (
    <SafeScopeDrawer
      title="Barrier Intelligence"
      summary={`Barrier adequacy: ${barrier.barrierAdequacy?.replaceAll("_", " ") || "unknown"}`}
    >
      <p className="text-sm font-semibold leading-6 text-slate-600">
        {barrier.barrierReasoning}
      </p>

      {!!barrier.barrierTypes?.length && (
        <div className="mt-2 flex flex-wrap gap-2">
          {barrier.barrierTypes.map((item: string) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {!!barrier.failedOrMissingBarriers?.length && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
          {barrier.failedOrMissingBarriers.slice(0, 4).map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {!!barrier.verificationNeeds?.length && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
          {barrier.verificationNeeds[0]}
        </p>
      )}
    </SafeScopeDrawer>
  );
}
