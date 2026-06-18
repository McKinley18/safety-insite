"use client";

import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type SafeScopeReasoningBasisSectionProps = {
  safeScopeResult: any;
};

function formatValue(value: any) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === null || value === undefined || value === "") return "Not provided";
  return String(value).replaceAll("_", " ");
}

export default function SafeScopeReasoningBasisSection({
  safeScopeResult,
}: SafeScopeReasoningBasisSectionProps) {
  const basis = safeScopeResult?.reasoningBasis;
  const hierarchy = safeScopeResult?.reasoningSourceHierarchy;

  if (!basis && !hierarchy) return null;

  return (
    <SafeScopeDrawer
      title="Reasoning Basis"
      summary="HazLenz AI engine is primary; prior report history is reference only"
      badge={basis?.sourceHierarchyEnforced ? "Hierarchy enforced" : "Review"}
    >
      <div className="space-y-3">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Primary reasoning source
          </p>
          <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
            {formatValue(basis?.primaryReasoningSource || "safescope_governed_brain")}
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
            Standards source:{" "}
            <span className="font-black text-slate-700 dark:text-slate-300">
              {formatValue(
                basis?.standardsMatchPrimarySource ||
                  "approved_applicability_and_scope_filtered_standards",
              )}
            </span>
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Prior report history role
            </p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
              {formatValue(basis?.workspaceHistoryRole || "supporting_reference_only")}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Prior findings used
            </p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
              {formatValue(basis?.priorFindingsUsed)}
              {typeof basis?.priorFindingReferenceCount === "number"
                ? ` (${basis.priorFindingReferenceCount})`
                : ""}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Prior findings can create standards
            </p>
            <p className="mt-1 text-sm font-black text-red-700">
              {formatValue(basis?.priorFindingsCanCreateStandards)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Prior findings can override governance
            </p>
            <p className="mt-1 text-sm font-black text-red-700">
              {formatValue(basis?.priorFindingsCanOverrideGovernance)}
            </p>
          </div>
        </div>

        {basis?.explanation && (
          <p className="rounded-xl bg-blue-50 px-3 py-3 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
            {basis.explanation}
          </p>
        )}

        {!!hierarchy?.primaryBasis?.length && (
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Primary basis
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
              {hierarchy.primaryBasis.slice(0, 6).map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {!!hierarchy?.secondaryReferenceOnly?.length && (
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Reference only
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
              {hierarchy.secondaryReferenceOnly.slice(0, 6).map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {!!hierarchy?.prohibitedHistoricalInfluence?.length && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-amber-700">
              Guardrails
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-amber-900">
              {hierarchy.prohibitedHistoricalInfluence
                .slice(0, 6)
                .map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </SafeScopeDrawer>
  );
}
