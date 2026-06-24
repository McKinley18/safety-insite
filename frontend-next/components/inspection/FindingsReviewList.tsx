import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { SafeScopeOfflineNotice } from "@/components/inspection/SafeScopeOfflineNotice";
import {
  SafeScopeRealImageAnalysisAppendix,
  SafeScopeVisualEvidenceAppendix,
  SafeScopeEquipmentReasoningAppendix,
  SafeScopeKnowledgeRouteAppendix,
} from "@/components/inspection/SafeScopeResultAppendix";
import {
  getFindingTitle,
  getFindingActionsForReview,
  getActionTitle,
  getStandardCitation,
  getRiskTone,
  getSafeScopeValidationStatus,
  formatSafeScopeValidationStatus,
  isSafeScopeValidationComplete,
} from "@/lib/inspection/reportReviewHelpers";

export function FindingsReviewList({
  findings,
  report,
  reportPackage,
  addFindingToReport,
}: {
  findings: any[];
  report: any;
  reportPackage: any;
  addFindingToReport: () => void;
}) {
  return (
    <section className="space-y-3">
      <SectionHeader
        eyebrow="Findings"
        title="Findings Review"
        action={
          <AppButton type="button" onClick={addFindingToReport} variant="accent" size="sm" className="shadow-none">
            Add Finding
          </AppButton>
        }
      />

      {!findings.length ? (
        <AppPanel variant="dashed" padding="md" className="text-sm font-semibold text-slate-700 dark:text-white">
          No findings are attached to this report.
        </AppPanel>
      ) : (
        <div className="space-y-3">
          {findings.map((finding: any, index: number) => {
            const standards = report.includeStandardsInReport === false ? [] : finding.selectedStandards || finding.standards || finding.safeScopeResult?.suggestedStandards || [];
            const actions = getFindingActionsForReview(finding, report.includeActionsInReport !== false);
            const photos = report.includePhotosInReport === false ? [] : finding.photos || [];
            const risk = finding.safeScopeResult?.risk?.riskBand || finding.safeScopeResult?.risk?.operationalRisk?.matrixBand || finding.riskBand || finding.riskScore || "Not rated";
            const confidence = finding.safeScopeResult?.confidenceIntelligence?.overallConfidence ?? finding.safeScopeResult?.confidence;
            const validationStatus = getSafeScopeValidationStatus(finding);
            const validationLabel = formatSafeScopeValidationStatus(validationStatus);
            const validationComplete = isSafeScopeValidationComplete(validationStatus);
            const traceabilityAvailable = Boolean(finding.safeScopeResult?.reasoningSnapshotId || finding.safeScopeResult?.knowledgeBrain?.matches?.length || finding.safeScopeResult?.fieldOutput?.evidenceGaps?.length || finding.safeScopeResult?.fieldOutput?.supervisorQuestions?.length || finding.safeScopeResult?.fieldOutput?.warnings?.length || finding.safeScopeResult?.knowledgeBrain?.evidenceGaps?.length || finding.safeScopeResult?.confidenceIntelligence?.missingCriticalInformation?.length || finding.safeScopeResult?.confidenceIntelligence?.reviewTriggers?.length || finding.safeScopeResult?.trendIntelligence || finding.safeScopeResult?.equipmentReasoningSummary || finding.safeScopeResult?.equipmentTaskMechanismContext || finding.safeScopeResult?.equipmentArchetypeContext || finding.safeScopeResult?.siteMemory || finding.safeScopeResult?.workspaceLearning || finding.safeScopeResult?.correlationIntelligence || finding.safeScopeResult?.reasoningDrift || finding.safeScopeResult?.knowledgeRoute);

            return (
              <details key={finding.id || index} className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 shadow-none" open={index === 0}>
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">Finding {index + 1}</p>
                      <h3 className="mt-0.5 text-base font-black leading-tight text-[#102A43]">{getFindingTitle(finding)}</h3>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">{finding.description || "No description provided."}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-white">
                        <span>{finding.location || "No location"}</span> <span>•</span> <span>{photos.length} photo(s)</span> <span>•</span> <span>{standards.length || 0} standard(s)</span> <span>•</span> <span>{actions.length || 0} action(s)</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs font-black text-slate-700 dark:text-slate-300 group-open:hidden">+</span>
                      <span className="hidden rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs font-black text-slate-700 dark:text-slate-300 group-open:inline-flex">−</span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getRiskTone(risk)}`}>{risk}</span>
                    </div>
                  </div>
                </summary>
                <div className="mt-3 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">Selected Standards</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">{standards.length ? standards.map((standard: any) => getStandardCitation(standard)).join(" · ") : "None selected"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">Corrective Actions</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">{actions.length ? actions.slice(0, 3).map((action: any) => getActionTitle(action)).join(" · ") : "None assigned"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">Review</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">{reportPackage.includesConfidence ? confidence !== undefined && confidence !== null ? `${confidence}% confidence` : finding.safeScopeResult ? "HazLenz AI reviewed" : "Manual" : finding.safeScopeResult ? "HazLenz AI reviewed" : "Manual"}</p>
                      {finding.safeScopeResult && <p className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${validationComplete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{validationLabel}</p>}
                    </div>
                  </div>
                  {!!actions.length && (
                    <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">Action Details</p>
                      <div className="mt-1 space-y-1">
                        {actions.slice(0, 3).map((action: any, actionIndex: number) => (
                          <p key={actionIndex} className="text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                            <span className="font-black text-slate-800 dark:text-slate-200">{getActionTitle(action)}</span> · Priority: {action.priority || "Medium"} · Due: {action.due || action.dueDate || "Not set"} · Evidence: {action.closureEvidence || action.verification || "Photo"}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {traceabilityAvailable && (reportPackage.includesSafeScopeTraceability || reportPackage.includesEvidenceGaps || reportPackage.includesConfidence || reportPackage.includesRepeatIntelligence) && (
                  <details className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <summary className="cursor-pointer px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">HazLenz AI appendix</summary>
                    <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 px-3 py-3 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                      {finding.safeScopeResult?.reasoningSnapshotId && <p>Reasoning snapshot: {finding.safeScopeResult.reasoningSnapshotId}</p>}
                      <SafeScopeOfflineNotice safeScopeResult={finding.safeScopeResult} />
                      <SafeScopeRealImageAnalysisAppendix safeScopeResult={finding.safeScopeResult} />
                      <SafeScopeVisualEvidenceAppendix safeScopeResult={finding.safeScopeResult} />
                      <SafeScopeEquipmentReasoningAppendix safeScopeResult={finding.safeScopeResult} />
                      <SafeScopeKnowledgeRouteAppendix safeScopeResult={finding.safeScopeResult} />
                    </div>
                  </details>
                )}
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
