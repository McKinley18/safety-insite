import AnnotationEditor from "@/components/evidence/AnnotationEditor";
import {
  asReviewList,
  formatEquipmentReasoningMode,
} from "@/lib/inspection/reportReviewHelpers";

export function SafeScopeRealImageAnalysisAppendix({
  safeScopeResult,
}: {
  safeScopeResult: any;
}) {
  const realImage = safeScopeResult?.realImageAnalysis;
  if (!realImage || !realImage.visualSignals?.length) return null;

  return (
    <div className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 ring-1 ring-indigo-200 dark:bg-indigo-950/35 dark:ring-indigo-900/60">
      <p className="text-[10px] font-black uppercase tracking-wide text-indigo-700">
        AI Photo Analysis (Beta)
      </p>

      <div className="mt-2 space-y-2">
        {realImage.visualSignals.map((sig: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2">
            <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
              sig.support === 'supports_observation' ? 'bg-emerald-500' :
              sig.support === 'conflicts_with_observation' ? 'bg-red-500' :
              'bg-amber-500'
            }`} />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {sig.signal.replace(/_/g, " ")} 
                <span className="ml-1 text-[10px] font-black uppercase text-slate-400 italic">
                  ({sig.support.replace(/_/g, " ")})
                </span>
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Basis: {sig.basis.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>

      {!!realImage.recommendedPhotoFollowups?.length && (
        <div className="mt-2">
          <p className="text-[10px] font-black uppercase text-indigo-700">Recommended Follow-ups</p>
          <ul className="mt-1 list-inside list-disc text-[10px] font-semibold text-indigo-800">
            {realImage.recommendedPhotoFollowups.map((f: string) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      <p className="mt-2 text-[10px] font-bold leading-relaxed text-slate-400 italic">
        {realImage.advisoryBoundary} {realImage.imageEvidenceLimitations.join(' · ')}
      </p>
    </div>
  );
}

export function SafeScopeVisualEvidenceAppendix({
  safeScopeResult,
}: {
  safeScopeResult: any;
}) {
  const visual = safeScopeResult?.visualEvidenceReasoning;
  if (!visual || visual.visualSupportLevel === 'not_evaluated') return null;

  return (
    <div className="rounded-xl bg-blue-50 px-3 py-2 ring-1 ring-blue-200 dark:bg-blue-950/35 dark:ring-blue-900/60">
      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
        Visual evidence analysis
      </p>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <p>
          <span className="font-black text-slate-800 dark:text-slate-200">Status:</span>{" "}
          {visual.visualSupportLevel.replace(/_/g, " ")}
        </p>
        <p>
          <span className="font-black text-slate-800 dark:text-slate-200">Score:</span>{" "}
          {visual.photoEvidenceScore}/10
        </p>
      </div>

      {!!visual.visualConsistencyFlags?.length && (
        <div className="mt-2">
          <p className="text-[10px] font-black uppercase text-red-700">Consistency Conflicts</p>
          <ul className="mt-1 list-inside list-disc text-xs font-bold text-red-800">
            {visual.visualConsistencyFlags.map((f: string) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      {!!visual.missingVisualEvidence?.length && (
        <div className="mt-2">
          <p className="text-[10px] font-black uppercase text-amber-700">Missing Views</p>
          <ul className="mt-1 list-inside list-disc text-xs font-semibold text-amber-800">
            {visual.missingVisualEvidence.map((m: string) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}

      <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500 dark:text-slate-400 italic">
        {visual.advisoryBoundary}
      </p>
    </div>
  );
}

export function SafeScopeEquipmentReasoningAppendix({
  safeScopeResult,
}: {
  safeScopeResult: any;
}) {
  const summary = safeScopeResult?.equipmentReasoningSummary;
  const taskContext = safeScopeResult?.equipmentTaskMechanismContext;
  const archetypeContext = safeScopeResult?.equipmentArchetypeContext;

  if (!summary && !taskContext?.matched && !archetypeContext?.matched) {
    return null;
  }

  const primarySpecific = taskContext?.primaryMatch;
  const primaryArchetype = archetypeContext?.primaryMatch;

  const mechanisms = asReviewList(
    primarySpecific?.harmMechanisms || primaryArchetype?.harmMechanisms,
  )
    .slice(0, 5)
    .map((item) => item.replace(/_/g, " "));

  const domains = asReviewList(
    primarySpecific?.likelyHazardDomains || primaryArchetype?.likelyHazardDomains,
  )
    .slice(0, 5)
    .map((item) => item.replace(/_/g, " "));

  const evidenceQuestions = asReviewList(summary?.evidenceGaps).slice(0, 4);
  const cautions = asReviewList(summary?.cautions).slice(0, 3);
  const rankingReasons = asReviewList(summary?.rankingReasons).slice(0, 3);

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2 ring-1 ring-slate-200 dark:ring-slate-800">
      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
        Equipment reasoning
      </p>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <p>
          <span className="font-black text-slate-800 dark:text-slate-200">Mode:</span>{" "}
          {formatEquipmentReasoningMode(summary?.primaryReasoningMode)}
        </p>

        <p>
          <span className="font-black text-slate-800 dark:text-slate-200">Primary context:</span>{" "}
          {summary?.primaryEquipmentContext || "Unknown"}
        </p>

        <p>
          <span className="font-black text-slate-800 dark:text-slate-200">Mechanism/archetype:</span>{" "}
          {summary?.primaryMechanismOrArchetype || "Unknown"}
        </p>

        {!!summary?.supportingContext?.length && (
          <p>
            <span className="font-black text-slate-800 dark:text-slate-200">Support:</span>{" "}
            {summary.supportingContext.slice(0, 2).join(" · ")}
          </p>
        )}

        {!!mechanisms.length && (
          <p>
            <span className="font-black text-slate-800 dark:text-slate-200">Mechanisms:</span>{" "}
            {mechanisms.join(" · ")}
          </p>
        )}

        {!!domains.length && (
          <p>
            <span className="font-black text-slate-800 dark:text-slate-200">Domains:</span>{" "}
            {domains.join(" · ")}
          </p>
        )}
      </div>

      {!!rankingReasons.length && (
        <p className="mt-2">
          <span className="font-black text-slate-800 dark:text-slate-200">Ranking basis:</span>{" "}
          {rankingReasons.join(" · ")}
        </p>
      )}

      {!!evidenceQuestions.length && (
        <p className="mt-2">
          <span className="font-black text-slate-800 dark:text-slate-200">Evidence questions:</span>{" "}
          {evidenceQuestions.join(" · ")}
        </p>
      )}

      {!!cautions.length && (
        <p className="mt-2 font-black text-amber-800">
          Cautions: {cautions.join(" · ")}
        </p>
      )}

      <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500 dark:text-slate-400 italic">
        Equipment reasoning is context-only and requires qualified review. It
        does not declare violations, create citations, or override regulations.
      </p>
    </div>
  );
}
