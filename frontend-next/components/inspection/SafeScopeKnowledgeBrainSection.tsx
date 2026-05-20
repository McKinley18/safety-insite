type SafeScopeKnowledgeBrainSectionProps = {
  safeScopeResult: any;
};

function formatPercent(value: any) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0%";
  return `${Math.round(number * 100)}%`;
}

function authorityLabel(tier: any) {
  const value = Number(tier || 5);

  if (value === 1) return "Tier 1 · Primary authority";
  if (value === 2) return "Tier 2 · Agency guidance";
  if (value === 3) return "Tier 3 · Incident learning";
  if (value === 4) return "Tier 4 · Research / case study";

  return "Tier 5 · Internal / supporting reference";
}

export default function SafeScopeKnowledgeBrainSection({
  safeScopeResult,
}: SafeScopeKnowledgeBrainSectionProps) {
  const knowledgeBrain = safeScopeResult?.knowledgeBrain;

  if (!knowledgeBrain) return null;

  const matches = knowledgeBrain.matches || [];
  const evidenceGaps = knowledgeBrain.evidenceGaps || [];

  if (!matches.length && !evidenceGaps.length) return null;

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
            SafeScope Knowledge Brain
          </p>
          <h3 className="mt-1 text-base font-black text-slate-900">
            Reference Intelligence
          </h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Supporting knowledge retrieved from approved references, incident
            lessons, standards, and internal safety intelligence.
          </p>
        </div>

        <div className="rounded-xl bg-[#E8F4FF] px-3 py-2 text-right">
          <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
            Brain Confidence
          </p>
          <p className="text-lg font-black text-[#102A43]">
            {formatPercent(knowledgeBrain.confidence)}
          </p>
        </div>
      </div>

      {!!matches.length && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Supporting References
          </p>

          {matches.slice(0, 3).map((match: any, index: number) => (
            <div
              key={match.chunkId || index}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {match.title || "Knowledge Reference"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {match.agency || "Reference"} ·{" "}
                    {String(match.sourceType || "source").replaceAll("_", " ")}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                  {authorityLabel(match.authorityTier)}
                </span>
              </div>

              {match.citation && (
                <p className="mt-2 text-xs font-black text-[#1D72B8]">
                  Citation: {match.citation}
                </p>
              )}

              {match.reason && (
                <p className="mt-2 text-xs font-bold leading-5 text-slate-600">
                  Why matched: {match.reason}
                </p>
              )}

              {match.excerpt && (
                <p className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-slate-500">
                  {match.excerpt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!!evidenceGaps.length && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-black uppercase tracking-wide text-amber-800">
            Evidence Gaps to Confirm
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-bold leading-5 text-amber-900">
            {evidenceGaps.slice(0, 4).map((gap: string, index: number) => (
              <li key={index}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {knowledgeBrain.caution && (
        <p className="mt-3 text-[11px] font-semibold leading-5 text-slate-500">
          {knowledgeBrain.caution}
        </p>
      )}
    </section>
  );
}
