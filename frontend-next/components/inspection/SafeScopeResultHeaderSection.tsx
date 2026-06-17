"use client";

import { useState } from "react";
import { getHazLenzReasoningSnapshot } from "@/lib/hazlenz";

type Props = {
  safeScopeResult: any;
  submitSafeScopeValidation: (
    decision:
      | "accepted"
      | "modified"
      | "rejected"
      | "escalated"
      | "insufficient_evidence",
  ) => void;
};

function normalizePercent(value: any) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
}

function formatSnapshotMode(value: any) {
  const mode = String(value || "insufficient_equipment_context");

  const labels: Record<string, string> = {
    specific_with_archetype_support: "Specific match + archetype support",
    specific_task_mechanism: "Specific equipment mechanism",
    archetype_fallback: "Archetype fallback",
    insufficient_equipment_context: "Insufficient equipment context",
  };

  return labels[mode] || mode.replace(/_/g, " ");
}

function asSnapshotList(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => String(item));
}

function getFieldOutputList(safeScopeResult: any, key: string, fallback: any[] = []) {
  const fieldOutputValue = safeScopeResult?.fieldOutput?.[key];
  if (Array.isArray(fieldOutputValue) && fieldOutputValue.length) {
    return fieldOutputValue.filter(Boolean).map((item: any) => String(item));
  }

  if (Array.isArray(fallback) && fallback.length) {
    return fallback.filter(Boolean).map((item: any) => String(item));
  }

  return [];
}

function formatFieldOutputDisposition(value: any) {
  const raw = String(value || "").trim();
  const labels: Record<string, string> = {
    hold_for_critical_evidence: "Hold for critical evidence",
    proceed_with_human_review: "Proceed with human review",
    qualified_review_required: "Qualified review required",
    ready_for_supervisor_review: "Ready for supervisor review",
  };

  return labels[raw] || raw.replace(/_/g, " ");
}

export default function SafeScopeResultHeaderSection({
  safeScopeResult,
  submitSafeScopeValidation,
}: Props) {
  const confidence = normalizePercent(
    safeScopeResult.confidenceIntelligence?.overallConfidence ??
      safeScopeResult.confidence ??
      0,
  );

  const [snapshotSummary, setSnapshotSummary] = useState<any>(null);
  const [snapshotStatus, setSnapshotStatus] = useState("");

  const fieldOutput = safeScopeResult?.fieldOutput;
  const fieldEvidenceGaps = getFieldOutputList(safeScopeResult, "evidenceGaps");
  const fieldSupervisorQuestions = getFieldOutputList(
    safeScopeResult,
    "supervisorQuestions",
  );
  const fieldWarnings = getFieldOutputList(safeScopeResult, "warnings");
  const fieldDisposition = formatFieldOutputDisposition(
    fieldOutput?.recommendedDisposition,
  );


  async function loadSnapshotSummary() {
    if (!safeScopeResult.reasoningSnapshotId) {
      setSnapshotStatus("No reasoning snapshot ID is available.");
      return;
    }

    try {
      setSnapshotStatus("Loading reasoning snapshot...");
      const snapshot = await getHazLenzReasoningSnapshot(
        safeScopeResult.reasoningSnapshotId,
      );
      setSnapshotSummary(snapshot);
      setSnapshotStatus("Reasoning snapshot loaded.");
    } catch (error) {
      setSnapshotStatus(
        error instanceof Error
          ? error.message
          : "Unable to load reasoning snapshot.",
      );
    }
  }

  return (
    <>
      {safeScopeResult.error && (
        <div className="mb-4 rounded-xl bg-red-50 px-3 py-3 ring-1 ring-red-200">
          <p className="text-sm font-black text-red-800">
            HazLenz AI full intelligence was unavailable.
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-red-700">
            {safeScopeResult.message || "Review backend status before relying on this result."}
            {safeScopeResult.status && ` (Backend status: ${safeScopeResult.status})`}
          </p>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Analysis Complete
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Review the result, then continue to actions.
          </p>
        </div>

        <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#1D72B8]">
          {confidence}% confidence
        </span>
      </div>

      {(safeScopeResult.basicPlanMode ||
        safeScopeResult.upgradeRequiredForFullSafeScope) && (
        <div className="mb-4 rounded-xl bg-[#E8F4FF] px-3 py-3">
          <p className="text-sm font-black text-slate-900 dark:text-slate-100">
            Limited Basic hazard assistance
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
            Plus or Company unlocks full standards matching, reasoning, evidence
            quality review, and traceability.
          </p>
        </div>
      )}

      {fieldOutput && (
        <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Field Output
              </p>
              <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
                {fieldOutput.primaryMessage || "HazLenz AI field guidance ready"}
              </p>
            </div>
            {fieldDisposition && (
              <span className="rounded-full bg-white dark:bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-800">
                {fieldDisposition}
              </span>
            )}
          </div>

          {!!fieldOutput.summary && (
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
              {fieldOutput.summary}
            </p>
          )}

          {!!fieldEvidenceGaps.length && (
            <div className="mt-3 rounded-xl bg-white dark:bg-slate-900 px-3 py-2 ring-1 ring-slate-200 dark:ring-slate-800">
              <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
                Evidence needed
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                {fieldEvidenceGaps.slice(0, 4).map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {!!fieldSupervisorQuestions.length && (
            <div className="mt-3 rounded-xl bg-white dark:bg-slate-900 px-3 py-2 ring-1 ring-slate-200 dark:ring-slate-800">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Supervisor questions
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                {fieldSupervisorQuestions.slice(0, 3).map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          )}

          {!!fieldWarnings.length && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold leading-5 text-amber-800">
              {fieldWarnings.slice(0, 2).join(" • ")}
            </p>
          )}
        </div>
      )}

      {safeScopeResult.reasoningSnapshotId && (
        <details className="mb-3 rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Supervisor validation
          </summary>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
            Validate this reasoning snapshot for audit history and future
            learning.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["accepted", "Accept"],
              ["modified", "Modify"],
              ["rejected", "Reject"],
              ["escalated", "Escalate"],
              ["insufficient_evidence", "Insufficient Evidence"],
            ].map(([decision, label]) => (
              <button
                key={decision}
                type="button"
                onClick={() => submitSafeScopeValidation(decision as any)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-black text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {label}
              </button>
            ))}
          </div>
        </details>
      )}

    </>
  );
}
