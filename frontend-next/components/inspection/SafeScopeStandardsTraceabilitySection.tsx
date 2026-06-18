"use client";

import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type Props = {
  safeScopeResult: any;
};

function formatLabel(value: any) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === null || value === undefined || value === "") return "Not provided";
  return String(value).replaceAll("_", " ");
}

export default function SafeScopeStandardsTraceabilitySection({
  safeScopeResult,
}: Props) {
  const trace = safeScopeResult?.standardsTraceability;

  if (!trace) return null;

  const layers = [
    [trace.primaryMatcher, trace.primaryMatcherRole],
    [trace.scopeFilter, trace.scopeFilterRole],
    [trace.defensibilityRanker, trace.defensibilityRankerRole],
    [trace.scenarioStandardMapper, trace.scenarioStandardMapperRole],
    [trace.citationReview, trace.citationReviewRole],
    [trace.sourceBackedGovernance, trace.sourceBackedGovernanceRole],
    [trace.approvedKnowledgeRetrieval, trace.approvedKnowledgeRetrievalRole],
  ].filter(([name]) => Boolean(name));

  return (
    <SafeScopeDrawer
      title="Standards Traceability"
      summary="Shows how standards moved from candidates to reviewable suggestions"
      badge="Audit trail"
    >
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Raw candidates
            </p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
              {trace.rawCandidateCount ?? 0}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Suggested
            </p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
              {trace.scopeFilteredCandidateCount ?? 0}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Excluded
            </p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
              {trace.excludedCandidateCount ?? 0}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Final standards source
          </p>
          <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
            {formatLabel(trace.finalSuggestedStandardsSource)}
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
            Scope mode: {formatLabel(trace.sourceMode)} · Prior findings role:{" "}
            {formatLabel(trace.priorFindingsRole)}
          </p>
        </div>

        {!!layers.length && (
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Standards review layers
            </p>

            {layers.map(([name, role]: any) => (
              <div
                key={name}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-3"
              >
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">{name}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                  {role}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
              Prior findings can create standards
            </p>
            <p className="mt-1 text-sm font-black text-amber-900">
              {formatLabel(trace.priorFindingsCanCreateStandards)}
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
              Prior findings can override standards
            </p>
            <p className="mt-1 text-sm font-black text-amber-900">
              {formatLabel(trace.priorFindingsCanOverrideStandards)}
            </p>
          </div>
        </div>

        {!!trace.suggestedCitations?.length && (
          <p className="text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
            Suggested citations: {trace.suggestedCitations.slice(0, 6).join(" • ")}
          </p>
        )}

        {trace.advisoryGuardrails && (
          <p className="rounded-xl bg-blue-50 px-3 py-3 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
            HazLenz AI standards output is advisory, does not declare a violation,
            does not create a citation, and requires qualified review before final
            compliance reliance.
          </p>
        )}
      </div>
    </SafeScopeDrawer>
  );
}
