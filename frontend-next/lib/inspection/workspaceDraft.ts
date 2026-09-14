/**
 * §280 (D-035) — LOCAL RECOVERABLE DRAFT STATE FOR THE INSPECTION WORKSPACE.
 *
 * ==================== THE PROBLEM THIS CLOSES ====================
 *
 * `/inspection-workspace` is the product's most important surface and was the one place where a
 * reload destroyed work. Everything else already survives: field-capture drafts and offline photos
 * are in IndexedDB, the calendar outbox and the offline request queue are in local storage, the
 * cover-page draft is in local storage, and saved inspections, observations, findings, reviews and
 * actions are on the server. In-progress observation text, work area, work activity, clarification
 * answers, reviewer risk selections and corrective-action drafts were React component state and
 * nothing else.
 *
 * §279 recorded the consequence for update delivery: because the workspace loses work on reload,
 * the UPDATE_REQUIRED state could not reload by itself, and no automatic refresh could be
 * introduced anywhere in the product. That is why D-035 is update-delivery safety and not polish.
 *
 * ==================== DRAFT IS NOT COMMITTED STATE ====================
 *
 * The distinction is structural, not a matter of naming discipline:
 *
 *   - Committed state is whatever `GET /inspections/:id` returns. It is the record. It is what a
 *     report is built from and what another device sees.
 *   - Draft state is what is in this module. It is one device's copy of what somebody had typed
 *     but not yet submitted. It is never sent anywhere, is never read by the server, and never
 *     becomes part of the record except by the user pressing the same button they would have
 *     pressed anyway.
 *
 * Nothing here submits. Restoring a draft restores the CONTENTS of form fields and the step the
 * user was on; it does not re-run analysis, does not create an observation and does not save a
 * finding. Auto-submitting unfinished work to make it durable would turn a recovery feature into a
 * writer of records nobody approved, which D-035 rules out explicitly.
 *
 * ==================== SCOPING: WHY A DRAFT CANNOT LAND IN THE WRONG PLACE ====================
 *
 * The storage key is `<prefix><userKey>:<inspectionId>`, where `userKey` is the same per-account
 * namespace the offline field-capture store derives (a SHA-256 of the account's server id) rather
 * than anything device-global. §79.4 and V1-OFFLINE-ISO-01 both dealt with real cross-account
 * leaks caused by device-global keys, and this module must not reintroduce that shape.
 *
 * The scope is then checked TWICE. The record repeats its own `userKey` and `inspectionId` in its
 * body, and a record whose body disagrees with the key it was found under is refused and deleted.
 * That is deliberately redundant: the key alone would be enough only if nothing could ever write
 * to the wrong key, and "nothing can ever" is the assumption that produces this class of bug.
 *
 * ==================== STALENESS ====================
 *
 * Three independent guards, because a resurrected draft is worse than a lost one — it puts words
 * into a safety record that the inspector did not mean to be there:
 *
 *   1. AGE. A record older than `DRAFT_TTL_MS` is refused and deleted.
 *   2. CONTEXT. A record naming an `observationId` that the loaded inspection does not contain is
 *      no longer about anything that exists. Its observation-scoped half is refused.
 *   3. SUPERSESSION. Every successful authoritative write re-writes the draft from the state that
 *      follows the write, and completing an inspection clears it outright.
 *
 * Sign-out clears it as well; the key prefix is in the sensitive-key sweep in `lib/auth.ts`.
 *
 * ==================== WHAT IS DELIBERATELY NOT HERE ====================
 *
 * The selected evidence FILE. A `File` handle cannot be serialised, and a photo re-encoded into
 * local storage would be a second, silent copy of evidence outside the one place the product says
 * evidence lives. A restored draft therefore says the photo must be chosen again rather than
 * pretending it is still attached. Photos that must survive being offline belong in Field Capture,
 * which stores them properly.
 *
 * This is ALSO not offline support. It makes a required refresh survivable. It does not queue
 * writes, does not reconcile conflicts and does not let an inspection be completed without a
 * connection — see D-037.
 */

import { resolveOfflineIdentity } from "../offline/offlineIdentity";
import { WORKSPACE_DRAFT_PREFIX } from "./workspaceDraftKey";

export { WORKSPACE_DRAFT_PREFIX };

/**
 * Fourteen days. Long enough to cover a real interruption — an inspection paused on Friday and
 * picked up the following week — and short enough that a draft nobody came back to does not
 * reappear months later attached to a record that has moved on without it.
 */
export const DRAFT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

/** Schema version. A record whose schema this build does not know is refused, never guessed at. */
export const DRAFT_SCHEMA = 1;

/** The user-entered values the workspace protects. Every one of these was previously lost. */
export interface WorkspaceDraftFields {
  /** Observation entry (step 1). */
  observation: string;
  workArea: string;
  workActivity: string;
  /** An in-progress revision of an already-saved observation. */
  editingObservation: boolean;
  revisionText: string;

  /**
   * Clarification answers already given this session. Not a text draft: each answer is a button
   * press that re-ran the analysis. Losing them is still losing user input, because the workspace
   * resends the accumulated history on every round, and without it HazLenz re-asks questions the
   * inspector already answered.
   */
  clarificationAnswerHistory: Array<{ questionId: string; answer: string }>;

  /** Reviewer risk selection (step 3), uncommitted until the finding is saved. */
  severity: number | null;
  likelihood: number | null;
  reviewerRisk: {
    severity: string;
    likelihood: string;
    exposure: string;
    overallRisk: string;
    rationale: string;
  };
  reviewerRiskReason: string;

  /** Corrective-action drafts (step 3). */
  actionDraft: {
    immediateAction: string;
    permanentCorrection: string;
    verificationStep: string;
  };
  newActionTitle: string;
  newActionDetail: string;
  newActionKind: string;
  responsiblePerson: string;

  /** A hazard the inspector says HazLenz missed, typed but not yet added. */
  missedFormOpen: boolean;
  missedHazardTitle: string;
  missedHazardDetail: string;

  /** Which standards the reviewer selected on the candidates step. */
  selectedSegmentKeys: string[];
  candidateSelection: Record<string, boolean>;
}

export interface WorkspaceDraft {
  schema: number;
  /** Repeated from the key on purpose — see the scoping note above. */
  userKey: string;
  inspectionId: string;
  /** Which observation the draft's observation-scoped half belongs to. "" before one exists. */
  observationId: string;
  analysisId: string;
  /** Where the user was, so a restore returns them there rather than to step 1. */
  step: string;
  savedAt: number;
  fields: WorkspaceDraftFields;
}

export interface WorkspaceDraftScope {
  userKey: string;
  inspectionId: string;
  storageKey: string;
}

/**
 * Resolves the storage scope for the signed-in account and one inspection, or null when either is
 * unavailable. Null is the isolation boundary: with no account there is no namespace, so no key
 * can be formed and nothing can be read or written.
 */
export async function resolveWorkspaceDraftScope(
  inspectionId: string,
): Promise<WorkspaceDraftScope | null> {
  if (typeof window === "undefined") return null;
  if (!inspectionId) return null;
  const identity = await resolveOfflineIdentity();
  if (!identity) return null;
  return {
    userKey: identity.userKey,
    inspectionId,
    storageKey: `${WORKSPACE_DRAFT_PREFIX}${identity.userKey}:${inspectionId}`,
  };
}

/** True when at least one protected field holds something worth restoring. */
export function draftHasContent(fields: WorkspaceDraftFields): boolean {
  const text = [
    fields.observation,
    fields.workArea,
    fields.workActivity,
    fields.revisionText,
    fields.reviewerRiskReason,
    fields.actionDraft.immediateAction,
    fields.actionDraft.permanentCorrection,
    fields.actionDraft.verificationStep,
    fields.newActionTitle,
    fields.newActionDetail,
    fields.responsiblePerson,
    fields.missedHazardTitle,
    fields.missedHazardDetail,
  ].some((value) => typeof value === "string" && value.trim().length > 0);

  return (
    text ||
    fields.severity !== null ||
    fields.likelihood !== null ||
    fields.clarificationAnswerHistory.length > 0 ||
    fields.selectedSegmentKeys.length > 0 ||
    Object.values(fields.candidateSelection).some(Boolean)
  );
}

export type DraftReadOutcome =
  | { status: "NONE" }
  | { status: "REFUSED"; reason: "SCHEMA" | "SCOPE" | "EXPIRED" | "UNREADABLE" }
  | { status: "FOUND"; draft: WorkspaceDraft };

/**
 * Reads the draft for this scope, refusing anything it cannot positively attribute.
 *
 * A refusal DELETES the record. Leaving an unattributable draft in place would mean it is offered
 * again on the next load and refused again forever, and a record this build cannot understand is
 * not a record it can keep safely.
 */
export function readWorkspaceDraft(scope: WorkspaceDraftScope): DraftReadOutcome {
  if (typeof window === "undefined") return { status: "NONE" };

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(scope.storageKey);
  } catch {
    return { status: "REFUSED", reason: "UNREADABLE" };
  }
  if (!raw) return { status: "NONE" };

  let parsed: WorkspaceDraft;
  try {
    parsed = JSON.parse(raw) as WorkspaceDraft;
  } catch {
    clearWorkspaceDraft(scope);
    return { status: "REFUSED", reason: "UNREADABLE" };
  }

  if (!parsed || parsed.schema !== DRAFT_SCHEMA || !parsed.fields) {
    clearWorkspaceDraft(scope);
    return { status: "REFUSED", reason: "SCHEMA" };
  }

  // The second half of the scope check. A record found under this key that claims to belong to a
  // different account or a different inspection is refused rather than trusted to its filename.
  if (parsed.userKey !== scope.userKey || parsed.inspectionId !== scope.inspectionId) {
    clearWorkspaceDraft(scope);
    return { status: "REFUSED", reason: "SCOPE" };
  }

  if (!Number.isFinite(parsed.savedAt) || Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
    clearWorkspaceDraft(scope);
    return { status: "REFUSED", reason: "EXPIRED" };
  }

  return { status: "FOUND", draft: parsed };
}

/**
 * Writes the draft, or removes it when there is nothing worth keeping.
 *
 * Removing on empty is what stops "your unsaved work was restored" appearing on a page where
 * nothing was typed — a notice that cries wolf is a notice nobody reads on the day it matters.
 */
export function writeWorkspaceDraft(
  scope: WorkspaceDraftScope,
  draft: Omit<WorkspaceDraft, "schema" | "userKey" | "inspectionId" | "savedAt">,
): void {
  if (typeof window === "undefined") return;

  if (!draftHasContent(draft.fields)) {
    clearWorkspaceDraft(scope);
    return;
  }

  const record: WorkspaceDraft = {
    schema: DRAFT_SCHEMA,
    userKey: scope.userKey,
    inspectionId: scope.inspectionId,
    savedAt: Date.now(),
    ...draft,
  };

  try {
    window.localStorage.setItem(scope.storageKey, JSON.stringify(record));
  } catch {
    // A quota failure must never take the workspace down with it. The work is still on screen and
    // still submittable; what is lost is only its protection against a reload, and the alternative
    // -- throwing out of an input handler -- would lose the work outright.
  }
}

export function clearWorkspaceDraft(scope: WorkspaceDraftScope): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(scope.storageKey);
  } catch {
    /* nothing useful to do, and nothing depends on it having worked */
  }
}

/** Every workspace draft on this device, for the sign-out sweep. */
export function allWorkspaceDraftKeys(): string[] {
  if (typeof window === "undefined") return [];
  const keys: string[] = [];
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key && key.startsWith(WORKSPACE_DRAFT_PREFIX)) keys.push(key);
    }
  } catch {
    return [];
  }
  return keys;
}
