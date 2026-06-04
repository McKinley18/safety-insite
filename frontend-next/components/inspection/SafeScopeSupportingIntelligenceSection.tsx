type Props = {
  safeScopeResult: any;
  safeScopeDetailsOpen: boolean;
  setSafeScopeDetailsOpen: (updater: any) => void;
};

function normalizeHazardName(value: any) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}

function getHazardName(hazard: any, index: number) {
  return (
    hazard.classification ||
    hazard.name ||
    hazard.hazard ||
    `Secondary hazard ${index + 1}`
  );
}

function getUniqueSecondaryHazards(safeScopeResult: any) {
  const primary = normalizeHazardName(
    safeScopeResult?.classification ||
      safeScopeResult?.hazardCategory ||
      safeScopeResult?.primaryHazard,
  );

  const seen = new Set<string>();

  return (safeScopeResult?.additionalHazards || []).filter(
    (hazard: any, index: number) => {
      const name = getHazardName(hazard, index);
      const normalized = normalizeHazardName(name);

      if (!normalized) return false;
      if (primary && normalized === primary) return false;
      if (seen.has(normalized)) return false;

      seen.add(normalized);
      return true;
    },
  );
}

export default function SafeScopeSupportingIntelligenceSection({
  safeScopeResult,
  safeScopeDetailsOpen,
  setSafeScopeDetailsOpen,
}: Props) {
  const excludedStandards = safeScopeResult?.excludedStandards || [];
  const secondaryHazards = getUniqueSecondaryHazards(safeScopeResult);

  if (!excludedStandards.length && !secondaryHazards.length) {
    return null;
  }

  return (
    <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={() => setSafeScopeDetailsOpen((open: boolean) => !open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Advanced SafeScope Checks
          </p>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
            {safeScopeDetailsOpen
              ? "Hide secondary review details."
              : "Optional secondary checks. Primary finding guidance is shown above."}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
          {safeScopeDetailsOpen ? "Hide" : "Show"}
        </span>
      </button>

      {safeScopeDetailsOpen && (
        <div className="mt-3 space-y-4 border-t border-slate-200 pt-3">
          {!!excludedStandards.length && (
            <div>
              <h3 className="text-sm font-black text-slate-800">
                Standards considered but excluded
              </h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                These were not selected for the current scope or finding context.
              </p>

              <div className="mt-2 space-y-2">
                {excludedStandards.slice(0, 4).map((standard: any, index: number) => (
                  <div
                    key={standard.citation || `excluded-${index}`}
                    className="rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-slate-800">
                        {standard.citation || "Excluded standard"}
                      </p>

                      <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                        Excluded
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                      {standard.reason ||
                        standard.rationale ||
                        "Excluded after contextual review."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!secondaryHazards.length && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                    Secondary Checks
                  </p>
                  <h3 className="text-sm font-black text-slate-900">
                    Possible separate findings
                  </h3>
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                  {secondaryHazards.length} item(s)
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {secondaryHazards.slice(0, 3).map((hazard: any, index: number) => {
                  const hazardName = getHazardName(hazard, index);

                  const riskLabel =
                    hazard.risk?.riskBand ||
                    hazard.risk?.operationalRisk?.matrixBand ||
                    hazard.confidenceBand ||
                    "Review";

                  const standards = hazard.suggestedStandards || [];

                  return (
                    <div
                      key={`${hazardName}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-black text-slate-900">
                          {hazardName}
                        </p>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                          {riskLabel}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                        {hazard.explanation ||
                          hazard.reason ||
                          hazard.rationale ||
                          "Review only if this is separate from the primary finding."}
                      </p>

                      {!!standards.length && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {standards.slice(0, 3).map((standard: any, standardIndex: number) => (
                            <span
                              key={standard.citation || `secondary-standard-${standardIndex}`}
                              className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#1D72B8]"
                            >
                              {standard.citation || "Standard"}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-900 ring-1 ring-amber-200">
                Only split into another finding when the hazard has different controls,
                standards, owner, or corrective action.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
