type Props = {
  safeScopeResult: any;
};

export default function SafeScopeCrossDomainSection({
  safeScopeResult,
}: Props) {
  const interaction = safeScopeResult?.crossDomainInteraction;

  if (!interaction?.interactions?.length) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Cross-Domain Interaction
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Interaction severity: {interaction.interactionSeverity || "none"}
          </h4>
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        {interaction.interactionSummary}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {interaction.interactions.slice(0, 6).map((item: string) => (
          <span
            key={item}
            className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]"
          >
            {item.replaceAll("_", " ")}
          </span>
        ))}
      </div>

      {!!interaction.escalationRisks?.length && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
          {interaction.escalationRisks.slice(0, 3).map((risk: string) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      )}

      {!!interaction.reviewFocus?.length && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
          Review focus: {interaction.reviewFocus.slice(0, 2).join(" ")}
        </p>
      )}
    </div>
  );
}
