type Props = {
  safeScopeResult: any;
  safeScopeDetailsOpen: boolean;
  setSafeScopeDetailsOpen: (updater: any) => void;
};

export default function SafeScopeSupportingIntelligenceSection({
  safeScopeResult,
  safeScopeDetailsOpen,
  setSafeScopeDetailsOpen,
}: Props) {
  if (
    !safeScopeResult?.excludedStandards?.length &&
    !safeScopeResult?.additionalHazards?.length
  ) {
    return null;
  }

  return (
    <div className="mb-3 border-y border-slate-200 py-3">
      <button
        type="button"
        onClick={() => setSafeScopeDetailsOpen((open: boolean) => !open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Supporting Intelligence
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {safeScopeDetailsOpen
              ? "Hide secondary SafeScope review details."
              : "Show excluded standards and additional hazard notes."}
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
          {safeScopeDetailsOpen ? "Hide" : "Show"}
        </span>
      </button>

      {safeScopeDetailsOpen && (
        <div className="mt-3 space-y-4">
          {!!safeScopeResult?.excludedStandards?.length && (
            <div>
              <h3 className="font-black text-slate-700">Excluded Standards</h3>
              <p className="mt-1 text-sm text-slate-500">
                These standards were considered but excluded based on selected regulatory scope or context.
              </p>

              <div className="mt-2">
                {safeScopeResult.excludedStandards.map((standard: any) => (
                  <div key={standard.citation} className="border-t border-slate-200 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-slate-800">{standard.citation}</p>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                        Excluded
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {standard.reason || standard.rationale || "Excluded after contextual review."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!safeScopeResult?.additionalHazards?.length && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                    Additional Hazard Review
                  </p>
                  <h3 className="font-black text-slate-900">Multi-Hazard Intelligence</h3>
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                  {safeScopeResult.additionalHazards.length} Secondary
                </span>
              </div>

              <div className="mt-3 border-y border-slate-200">
                {safeScopeResult.additionalHazards.map((hazard: any, index: number) => {
                  const hazardName =
                    hazard.classification ||
                    hazard.name ||
                    hazard.hazard ||
                    `Additional Hazard ${index + 1}`;

                  const riskLabel =
                    hazard.risk?.riskBand ||
                    hazard.risk?.operationalRisk?.matrixBand ||
                    hazard.confidenceBand ||
                    "Review";

                  const standards = hazard.suggestedStandards || [];

                  return (
                    <div key={`${hazardName}-${index}`} className="border-b border-slate-200 py-3 last:border-b-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-black text-slate-900">{hazardName}</p>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                          {riskLabel}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                        {hazard.explanation ||
                          hazard.reason ||
                          hazard.rationale ||
                          "Review this secondary hazard for overlapping controls, standards, or corrective actions."}
                      </p>

                      {!!standards.length && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {standards.slice(0, 4).map((standard: any) => (
                            <span
                              key={standard.citation}
                              className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black text-[#1D72B8]"
                            >
                              {standard.citation}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-900">
                Multi-hazard findings should be split into separate findings when controls, standards, or responsible owners differ.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
