import {
  CONFIRMATION_RULE_VERSION, CONFIRMATION_TRIGGER_ROLE_CONTROLLING,
  CONFIRMATION_TRIGGER_ROLE_FOLLOW_UP, deriveConfirmationRequired,
  type ConfirmationTrigger,
} from './expert-confirmation-rule';

/**
 * §264 — WHAT A HUMAN IS ACTUALLY BEING ASKED, AND THE CLOSED VOCABULARY THEY MAY ANSWER IN.
 *
 * ---------------------------------------------------------------------------------------------
 * THE SUBJECT IS NAMED ENTRIES, NOT "THE ANALYSIS".
 *
 * §260 section 9 froze this: the reviewer confirms the operational classification of specific
 * `requiredBy` entries — the ones that triggered the confirmation rule — each identified by its
 * `refKind:ref` pair. They are not asked to re-author the analysis, not shown the internal driver
 * vocabulary, and not asked to populate a role taxonomy.
 *
 * In substance the question is: *HazLenz says this unresolved item decides whether work may
 * continue. Does it?*
 *
 * ---------------------------------------------------------------------------------------------
 * THE SUBJECT IS DERIVED FROM THE STORED POSTURE, AND THE RULE VERSION IS CHECKED FIRST.
 *
 * §261 stores the confirmation FLAG once and never recomputes it, so a later rule change cannot
 * alter what a reviewer was asked. That guarantee would be quietly broken if the SUBJECT were
 * re-derived by a newer rule: the flag would still say "confirmation required" while the entries
 * presented for confirmation had changed underneath it.
 *
 * So the subject is derived from the immutable persisted posture by the SAME rule version that
 * produced the flag, and a version mismatch is a refusal rather than a re-derivation. That is the
 * fail-closed direction: asking a human to settle a question no one can prove was the question
 * originally asked is worse than asking them to wait.
 *
 * ---------------------------------------------------------------------------------------------
 * TWO PRODUCT-FACING VALUES, AND ONLY TWO.
 *
 * The confirmation rule fires on exactly two driver roles, so the human answer space has exactly two
 * members. They are named in product language rather than in the §239 vocabulary, because §260
 * requires that the internal taxonomy not be exposed, and mapped one-to-one so nothing is lost.
 */
export const SETTLEMENT_CONTRACT_VERSION = 'hazlenz.expert.264.settlement-contract.v1' as const;

/** The complete answer space. An override outside it is rejected, not coerced. */
export const HUMAN_CLASSIFICATIONS = [
  /** The unresolved item decides whether work may continue. Work does not simply continue. */
  'CONTROLS_WHETHER_WORK_CONTINUES',
  /** The unresolved item is a follow-up. It does not decide whether work continues now. */
  'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES',
] as const;
export type HumanClassification = (typeof HUMAN_CLASSIFICATIONS)[number];

/**
 * The one-to-one map from the §239 driver role onto the product-facing value.
 *
 * TOTAL OVER THE TRIGGER ROLES AND NOTHING ELSE. A role that is not a trigger role has no product
 * value here, because the rule never asks a human about it. Asserted at load below.
 */
export const CLASSIFICATION_FOR_DRIVER_ROLE: Readonly<Record<string, HumanClassification>> = {
  [CONFIRMATION_TRIGGER_ROLE_CONTROLLING]: 'CONTROLS_WHETHER_WORK_CONTINUES',
  [CONFIRMATION_TRIGGER_ROLE_FOLLOW_UP]: 'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES',
};

/** The two decisions a settlement may record. Mirrors the §260 `human_reviews` extension. */
export const SETTLEMENT_DECISIONS = [
  'classification_confirmed',
  'classification_changed',
] as const;
export type SettlementDecision = (typeof SETTLEMENT_DECISIONS)[number];

export interface SubjectEntry {
  readonly refKind: string;
  readonly ref: string;
  /** What HazLenz claimed, in product language. Never the raw driver role. */
  readonly expertClassification: HumanClassification;
}

export type SubjectResolution =
  | { readonly ok: true; readonly entries: readonly SubjectEntry[]; readonly posture: string }
  | { readonly ok: false; readonly code: SubjectRefusalCode; readonly detail: string };

export const SUBJECT_REFUSAL_CODES = [
  /** The persisted rule version is not the one this build implements. */
  'CONFIRMATION_RULE_VERSION_DRIFTED',
  /** The stored snapshot carries no posture to derive a subject from. */
  'POSTURE_NOT_PERSISTED',
  /** Re-deriving over the stored posture produced no triggering entry, though the flag said yes. */
  'NO_SUBJECT_ENTRIES',
  /** The stored posture could not be read by the rule at all. */
  'POSTURE_UNREADABLE',
] as const;
export type SubjectRefusalCode = (typeof SUBJECT_REFUSAL_CODES)[number];

/**
 * Resolve what this analysis is asking a human to settle.
 *
 * `persistedRuleVersion` is the value §261 wrote to the execution record alongside the flag. It is
 * compared, not trusted: if it does not equal the rule compiled into this build, the subject cannot
 * be established and the caller must refuse.
 */
export function resolveConfirmationSubject(
  storedPosture: unknown,
  persistedRuleVersion: string | null,
): SubjectResolution {
  if (persistedRuleVersion !== CONFIRMATION_RULE_VERSION) {
    return {
      ok: false,
      code: 'CONFIRMATION_RULE_VERSION_DRIFTED',
      detail: `the flag was produced by ${String(persistedRuleVersion)} and this build implements `
        + `${CONFIRMATION_RULE_VERSION}; the subject cannot be re-derived without changing the `
        + 'question the reviewer was originally asked',
    };
  }
  if (storedPosture === null || storedPosture === undefined) {
    return { ok: false, code: 'POSTURE_NOT_PERSISTED', detail: 'no posture on the stored snapshot' };
  }

  const determination = deriveConfirmationRequired(storedPosture);
  if (determination.failedClosed) {
    return {
      ok: false, code: 'POSTURE_UNREADABLE',
      detail: `the rule fails closed on the stored posture: ${String(determination.failClosedCode)}`,
    };
  }
  if (determination.triggers.length === 0) {
    return {
      ok: false, code: 'NO_SUBJECT_ENTRIES',
      detail: 'the stored analysis is awaiting confirmation but re-deriving the subject over its '
        + 'own persisted posture produces no triggering entry',
    };
  }
  return {
    ok: true,
    posture: String(determination.posture),
    entries: determination.triggers.map(toSubjectEntry),
  };
}

function toSubjectEntry(trigger: ConfirmationTrigger): SubjectEntry {
  const mapped = CLASSIFICATION_FOR_DRIVER_ROLE[trigger.driverRole];
  if (mapped === undefined) {
    // Unreachable: the rule only produces triggers for the two roles the map covers, and the
    // load-time guard below asserts that. It throws rather than defaulting because a subject entry
    // with a guessed classification would ask a human the wrong question.
    throw new Error(`SETTLEMENT_264_ABORT: no product classification for driver role `
      + `${trigger.driverRole}; the trigger vocabulary and the map have diverged`);
  }
  return { refKind: trigger.refKind, ref: trigger.ref, expertClassification: mapped };
}

// ================================================================ the override contract

export interface ReplacementInput {
  readonly refKind: string;
  readonly ref: string;
  readonly classification: string;
}

export type ReplacementValidation =
  | { readonly ok: true; readonly changed: readonly SubjectEntry[] }
  | { readonly ok: false; readonly code: ReplacementRefusalCode; readonly detail: string };

export const REPLACEMENT_REFUSAL_CODES = [
  'REPLACEMENT_REQUIRED',
  'REPLACEMENT_NOT_A_SUBJECT_ENTRY',
  'REPLACEMENT_CLASSIFICATION_NOT_IN_VOCABULARY',
  'REPLACEMENT_DUPLICATED',
  'REPLACEMENT_CHANGES_NOTHING',
] as const;
export type ReplacementRefusalCode = (typeof REPLACEMENT_REFUSAL_CODES)[number];

/**
 * VALIDATE AN OVERRIDE AGAINST THE SUBJECT. This is what keeps the action from being arbitrary JSON
 * editing, which §264 prohibits explicitly.
 *
 * A replacement may only name an entry that is actually in the subject, may only carry a value from
 * the two-member vocabulary, and — the check that gives `classification_changed` its meaning —
 * at least one replacement must actually differ from what HazLenz claimed. An override that changes
 * nothing is a confirmation wearing the wrong label, and recording it as a change would put a false
 * disagreement into the audit trail.
 *
 * Hazard identification, citations, control text, declarations, raw output and provenance are not
 * addressable here at all: there is no field for them, so they cannot be edited by this action.
 */
export function validateReplacements(
  subject: readonly SubjectEntry[],
  replacements: readonly ReplacementInput[],
): ReplacementValidation {
  if (replacements.length === 0) {
    return {
      ok: false, code: 'REPLACEMENT_REQUIRED',
      detail: 'a change must state the replacement classification for at least one subject entry',
    };
  }

  const byKey = new Map(subject.map(entry => [`${entry.refKind}:${entry.ref}`, entry]));
  const seen = new Set<string>();
  const resolved: SubjectEntry[] = [];

  for (const replacement of replacements) {
    const key = `${replacement.refKind}:${replacement.ref}`;
    const entry = byKey.get(key);
    if (entry === undefined) {
      return {
        ok: false, code: 'REPLACEMENT_NOT_A_SUBJECT_ENTRY',
        detail: `${key} is not one of the entries this analysis asks a human to settle`,
      };
    }
    if (seen.has(key)) {
      return {
        ok: false, code: 'REPLACEMENT_DUPLICATED',
        detail: `${key} appears more than once, so the intended value is ambiguous`,
      };
    }
    seen.add(key);
    if (!(HUMAN_CLASSIFICATIONS as readonly string[]).includes(replacement.classification)) {
      return {
        ok: false, code: 'REPLACEMENT_CLASSIFICATION_NOT_IN_VOCABULARY',
        detail: `${JSON.stringify(replacement.classification)} is not a permitted classification`,
      };
    }
    resolved.push({
      refKind: entry.refKind, ref: entry.ref,
      expertClassification: replacement.classification as HumanClassification,
    });
  }

  const differs = resolved.some(r => {
    const original = byKey.get(`${r.refKind}:${r.ref}`);
    return original !== undefined && original.expertClassification !== r.expertClassification;
  });
  if (!differs) {
    return {
      ok: false, code: 'REPLACEMENT_CHANGES_NOTHING',
      detail: 'every replacement equals what HazLenz already claimed; that is a confirmation, and '
        + 'recording it as a change would put a disagreement that did not happen into the record',
    };
  }
  return { ok: true, changed: resolved };
}

/**
 * The settled classification per entry, as it is written to `reviewedConclusion`.
 *
 * BOTH SIDES ARE CARRIED. §264 requires the original Expert conclusion to remain reconstructable
 * and the human replacement to be independently attributable, so each entry records what HazLenz
 * claimed AND what the human settled, rather than one value that has to be interpreted against the
 * decision type to be understood.
 */
export interface SettledEntry {
  readonly refKind: string;
  readonly ref: string;
  readonly expertClassification: HumanClassification;
  readonly humanClassification: HumanClassification;
  readonly changed: boolean;
}

export function settleEntries(
  subject: readonly SubjectEntry[],
  replacements: readonly SubjectEntry[],
): SettledEntry[] {
  const replaced = new Map(replacements.map(r => [`${r.refKind}:${r.ref}`, r.expertClassification]));
  return subject.map(entry => {
    const human = replaced.get(`${entry.refKind}:${entry.ref}`) ?? entry.expertClassification;
    return {
      refKind: entry.refKind,
      ref: entry.ref,
      expertClassification: entry.expertClassification,
      humanClassification: human,
      changed: human !== entry.expertClassification,
    };
  });
}

// ================================================================ load-time construction guards

/**
 * THE MAP MUST COVER EXACTLY THE TRIGGER ROLES.
 *
 * Asserted at load rather than in a test, so a contract edit that adds a third trigger role cannot
 * ship a settlement action that silently throws on it at runtime — in front of a reviewer, on a
 * safety decision — instead of failing at startup.
 */
function assertSettlementVocabulary264(): void {
  const triggerRoles = [CONFIRMATION_TRIGGER_ROLE_CONTROLLING, CONFIRMATION_TRIGGER_ROLE_FOLLOW_UP];
  for (const role of triggerRoles) {
    if (CLASSIFICATION_FOR_DRIVER_ROLE[role] === undefined) {
      throw new Error(`SETTLEMENT_264_ABORT: trigger role ${role} has no product classification`);
    }
  }
  const mapped = Object.keys(CLASSIFICATION_FOR_DRIVER_ROLE);
  if (mapped.length !== triggerRoles.length) {
    throw new Error('SETTLEMENT_264_ABORT: the classification map covers roles the confirmation '
      + `rule never triggers on (${mapped.join(', ')}); a human would be asked a question the rule `
      + 'does not raise');
  }
  const values = new Set(Object.values(CLASSIFICATION_FOR_DRIVER_ROLE));
  if (values.size !== HUMAN_CLASSIFICATIONS.length) {
    throw new Error('SETTLEMENT_264_ABORT: the two trigger roles do not map onto two distinct '
      + 'product classifications; the answer space has collapsed');
  }
}
assertSettlementVocabulary264();
