import {
  getStoredActions,
  saveStoredActions,
} from "@/lib/actionStorage";
import { addActivityEvent } from "@/lib/activityStorage";
import {
  mergeStoredFindingActions,
  normalizeFindingActionsForStorage,
} from "./inspectionWorkflowHelpers";

export function shouldConfirmHazLenzSuggestionSelection(input: {
  safeScopeResult: any;
  selectedStandards: any[];
  selectedGeneratedActions: any[];
  manualActions: any[];
}) {
  const suggestedStandardCount =
    input.safeScopeResult?.suggestedStandards?.length ||
    input.safeScopeResult?.inspectionIntelligence?.candidateStandards?.length ||
    (input.safeScopeResult?.executiveJudgment?.topStandard ? 1 : 0);
  const generatedActionCount =
    input.safeScopeResult?.generatedActions?.length || 0;

  return !!(
    input.safeScopeResult &&
    ((suggestedStandardCount > 0 && input.selectedStandards.length === 0) ||
      (generatedActionCount > 0 &&
        input.selectedGeneratedActions.length === 0 &&
        input.manualActions.length === 0))
  );
}

export async function persistFindingActions(finding: any) {
  const correctiveActions = finding.correctiveActions || [];

  if (!correctiveActions.length) return;

  const storedActions = await getStoredActions();
  const normalizedActions = normalizeFindingActionsForStorage(finding);
  const merged = mergeStoredFindingActions(normalizedActions, storedActions);

  await saveStoredActions(merged);
}

export async function recordFindingSavedActivity(input: {
  finding: any;
  detailFallback: string;
}) {
  const finding = input.finding;

  await addActivityEvent({
    type: "Finding",
    title:
      finding.hazardCategory ||
      finding.safeScopeResult?.classification ||
      "Finding saved",
    detail: finding.location || input.detailFallback,
  });
}

export async function persistFindingSaveSideEffects(input: {
  finding: any;
  detailFallback: string;
}) {
  await persistFindingActions(input.finding);
  await recordFindingSavedActivity(input);
}

export function upsertFindingInList(input: {
  findings: any[];
  finding: any;
  editingFindingIndex: number | null;
}) {
  if (input.editingFindingIndex !== null) {
    return input.findings.map((existingFinding, index) =>
      index === input.editingFindingIndex ? input.finding : existingFinding,
    );
  }

  const existingIndex = input.findings.findIndex(
    (existingFinding) => existingFinding.id === input.finding.id,
  );

  if (existingIndex >= 0) {
    return input.findings.map((existingFinding) =>
      existingFinding.id === input.finding.id
        ? input.finding
        : existingFinding,
    );
  }

  return [...input.findings, input.finding];
}
