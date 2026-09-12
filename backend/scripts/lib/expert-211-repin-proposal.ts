/**
 * §211 -- PROVENANCE MAINTENANCE ITEM PM-1: STALE PROJECTION-MODULE PINS. REPIN PROPOSAL.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO REPIN IS APPLIED AND NONE IS AUTHORIZED.
 *
 * ==================== WHAT THIS IS ====================
 *
 * A proposal, computed from the real filesystem, for product-owner review. It changes no pin, edits
 * no suite, and alters no frozen historical evidence. `PROPOSAL_STATUS` is the literal
 * `AWAITING_PRODUCT_OWNER_REVIEW` and there is no code path that produces any other value.
 *
 * ==================== THE RULE THIS EXISTS TO ENFORCE ====================
 *
 * A STALE HISTORICAL PIN IS NOT A CURRENT HAZLENZ BEHAVIOURAL FAILURE.
 *
 * Three suites currently fail on the same fact: `expert-first-pass-owed-fact-projection.ts` no
 * longer hashes to the value §199 froze. Nothing about HazLenz's behaviour changed to cause that.
 * §210E's accepted R7 remediation added a refusal code to the file, which is precisely what an
 * authorized remediation does, and the pins simply predate it. Reading those three failures as
 * regressions would be reading a bookkeeping lag as a defect.
 *
 * ==================== WHY THE REPIN IS NOT DONE HERE ====================
 *
 * A pin is a frozen expectation, and re-freezing one is an authorization-level act rather than a
 * maintenance chore -- the whole value of the mechanism is that it cannot be quietly refreshed by
 * whoever is inconvenienced by it. §210J made the same call for the §203 ancestry record and
 * repaired it ADDITIVELY instead. This proposal names what a repin would change and stops.
 *
 * ==================== WHAT COUNTS AS PROOF, AND WHAT DOES NOT ====================
 *
 * The attribution is not accepted because a report says so. It is accepted only when the file
 * itself carries the marks the modifying section would have left, checked at call time. Where the
 * marks are not all present the entry is `UNVERIFIED` and no replacement expectation is proposed --
 * an unexplained divergence must stay unexplained rather than acquire a plausible story.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import {
  EXPECTED_MARKS_IN_SUBJECT, HISTORICAL_RECORD, MODIFYING_SECTION, SUBJECT_PATH,
} from './expert-210j-ancestry-successor';

export const REPIN_PROPOSAL_211_VERSION = 'hazlenz.expert.211.pm1-repin-proposal.v1' as const;

/** The literal. There is no code path that produces any other value. */
export const PROPOSAL_STATUS: 'AWAITING_PRODUCT_OWNER_REVIEW' = 'AWAITING_PRODUCT_OWNER_REVIEW';

export const REPIN_APPLIED = false as const;
export const HISTORICAL_EVIDENCE_MODIFIED = false as const;

const REPO_ROOT = join(__dirname, '..', '..', '..');

/** How a recorded hash behaves when it goes stale. The distinction changes what a failure means. */
export type PinKind =
  /** A suite or gate asserts equality and FAILS when the file moves. */
  | 'ASSERTED_GATE'
  /** A script prints the hash into a report. It goes stale silently and fails nothing. */
  | 'RECORDED_ONLY';

export interface StalePin {
  readonly id: string;
  readonly site: string;
  readonly assertionName: string | null;
  readonly kind: PinKind;
  readonly expectedSha256: string;
  readonly observedFailure: string | null;
  readonly affectedSuite: string | null;
}

/**
 * Every place the §199-frozen projection hash is written down. Located by searching the repository
 * for the literal, not by memory.
 */
export const STALE_PINS: readonly StalePin[] = [
  {
    id: 'PM-1.1',
    site: 'backend/scripts/lib/expert-203-successor-identity.ts — ANCESTOR_PINS',
    assertionName: null,
    kind: 'ASSERTED_GATE',
    expectedSha256: HISTORICAL_RECORD.sha256,
    observedFailure: 'verify-203-source-integrity RESULT: FAIL — "expected aab67e0b… actual '
      + 'bc47df39…"',
    affectedSuite: 'backend/scripts/verify-203-source-integrity.ts',
  },
  {
    id: 'PM-1.2',
    site: 'backend/scripts/test-201-governed-binding-stage.ts:169',
    assertionName: 'A4. §201 changes nothing in the projection module',
    kind: 'ASSERTED_GATE',
    expectedSha256: HISTORICAL_RECORD.sha256,
    observedFailure: '58/59 PASS · 1 FAIL',
    affectedSuite: 'backend/scripts/test-201-governed-binding-stage.ts',
  },
  {
    id: 'PM-1.3',
    site: 'backend/scripts/test-202-governed-binding-stage.ts:554 — FROZEN.projectionModule',
    assertionName: 'B18. the first-pass protocol files are byte-unchanged by §202',
    kind: 'ASSERTED_GATE',
    expectedSha256: HISTORICAL_RECORD.sha256,
    observedFailure: '53/54 PASS · 1 FAIL',
    affectedSuite: 'backend/scripts/test-202-governed-binding-stage.ts',
  },
  {
    id: 'PM-1.4',
    site: 'backend/scripts/verify-196/197/198/199-source-integrity — report lines',
    assertionName: null,
    kind: 'RECORDED_ONLY',
    expectedSha256: HISTORICAL_RECORD.sha256,
    observedFailure: null,
    affectedSuite: null,
  },
];

/**
 * PM-1.4 is called out separately because it is the entry most likely to be mistaken for a fourth
 * failure. Those four scripts print the projection hash into their reports and assert a BYTE-LEVEL
 * PROPERTY of the file instead -- that it contains no `transition(` call -- which still holds. They
 * do exit non-zero, and NOT for this reason: their audit sweep flags an unrelated pre-existing path,
 * `backend/scripts/execute-208-acceptance-cohort.ts`. Attributing that exit to PM-1 would be
 * exactly the misreading this item exists to prevent.
 */
export const PM_1_4_IS_NOT_A_FAILURE = {
  scripts: ['verify-196', 'verify-197', 'verify-198', 'verify-199'],
  theyAssert: 'a byte-level property — no transition() call in the projection module — which holds',
  theyRecord: 'the projection hash, into a report line',
  theyExitNonZeroBecause: 'an unrelated pre-existing audit-sweep finding on '
    + 'backend/scripts/execute-208-acceptance-cohort.ts',
  isCausedByThisStaleness: false,
  isCausedBySection211: false,
} as const;

// ---------------------------------------------------------------- the computed proposal

export type EntryClassification =
  | 'REPIN_PROPOSED'
  /** A report line, not a gate. Nothing asserts it, so nothing needs repinning. */
  | 'RECORDED_ONLY_NO_REPIN_NEEDED'
  | 'UNVERIFIED_NO_REPIN_PROPOSED'
  | 'ALREADY_CURRENT'
  | 'SUBJECT_ABSENT';

export interface RepinEntry {
  readonly pin: StalePin;
  readonly currentSha256: string | null;
  readonly classification: EntryClassification;
  readonly legitimateModifyingSection: string | null;
  readonly semanticModificationDocumentedAt: readonly string[];
  readonly marksPresentInFile: readonly string[];
  readonly marksAbsentFromFile: readonly string[];
  readonly proposedReplacementExpectation: string | null;
  readonly proposedReplacementRationale: string | null;
}

export interface RepinProposal {
  readonly version: typeof REPIN_PROPOSAL_211_VERSION;
  readonly item: 'PM-1';
  readonly status: typeof PROPOSAL_STATUS;
  readonly subjectPath: typeof SUBJECT_PATH;
  readonly repinApplied: typeof REPIN_APPLIED;
  readonly historicalEvidenceModified: typeof HISTORICAL_EVIDENCE_MODIFIED;
  readonly entries: readonly RepinEntry[];
  readonly affectedSuites: readonly string[];
  readonly assertedGateFailureCount: number;
  readonly notes: readonly string[];
}

const sha256File = (abs: string): string =>
  createHash('sha256').update(readFileSync(abs)).digest('hex');

/**
 * Documentation that the semantic modification is ALREADY historically recorded. Paths only; the
 * suite checks they exist on disk rather than trusting the list.
 */
export const SEMANTIC_MODIFICATION_DOCUMENTED_AT: readonly string[] = [
  'verification/expert-hazlenz-210e-final-remediation-2026-09-09/FINAL-REMEDIATION-REPORT-210E.md',
  'verification/expert-hazlenz-210i-epistemic-representation-review-2026-09-09/'
    + 'ARCHITECTURE-REVIEW-210I.md',
  'verification/expert-hazlenz-210j-epistemic-schema-remediation-2026-09-09/'
    + 'IMPLEMENTATION-REPORT-210J.md',
  'backend/scripts/lib/expert-210j-ancestry-successor.ts',
];

export function buildRepinProposal(repoRoot: string = REPO_ROOT): RepinProposal {
  const abs = join(repoRoot, SUBJECT_PATH);
  const present = existsSync(abs);
  const current = present ? sha256File(abs) : null;
  const src = present ? readFileSync(abs, 'utf8') : '';
  const marksPresent = present ? EXPECTED_MARKS_IN_SUBJECT.filter(m => src.includes(m)) : [];
  const marksAbsent = present
    ? EXPECTED_MARKS_IN_SUBJECT.filter(m => !src.includes(m)) : [...EXPECTED_MARKS_IN_SUBJECT];
  const documented = SEMANTIC_MODIFICATION_DOCUMENTED_AT
    .filter(p => existsSync(join(repoRoot, p)));

  const classify = (pin: StalePin): EntryClassification => {
    if (!present) return 'SUBJECT_ABSENT';
    if (current === pin.expectedSha256) return 'ALREADY_CURRENT';
    if (marksAbsent.length > 0) return 'UNVERIFIED_NO_REPIN_PROPOSED';
    // A recorded report line asserts nothing, so there is nothing to re-freeze. Proposing a repin
    // for one would invent a gate where the repository deliberately has none.
    if (pin.kind === 'RECORDED_ONLY') return 'RECORDED_ONLY_NO_REPIN_NEEDED';
    return 'REPIN_PROPOSED';
  };

  const entries: RepinEntry[] = STALE_PINS.map(pin => {
    const classification = classify(pin);
    const proposable = classification === 'REPIN_PROPOSED';
    return {
      pin,
      currentSha256: current,
      classification,
      legitimateModifyingSection: proposable ? MODIFYING_SECTION.section : null,
      semanticModificationDocumentedAt: documented,
      marksPresentInFile: marksPresent,
      marksAbsentFromFile: marksAbsent,
      proposedReplacementExpectation: proposable ? current : null,
      proposedReplacementRationale: proposable
        ? `replace ${pin.expectedSha256.slice(0, 12)}… with ${String(current).slice(0, 12)}… and `
          + `record ${MODIFYING_SECTION.section} as the section that advanced the file. The `
          + 'assertion keeps its meaning — "this file has not moved since the expectation was set" '
          + '— and the expectation moves forward to the accepted state rather than being deleted.'
        : null,
    };
  });

  return {
    version: REPIN_PROPOSAL_211_VERSION,
    item: 'PM-1',
    status: PROPOSAL_STATUS,
    subjectPath: SUBJECT_PATH,
    repinApplied: REPIN_APPLIED,
    historicalEvidenceModified: HISTORICAL_EVIDENCE_MODIFIED,
    entries,
    affectedSuites: STALE_PINS.map(p => p.affectedSuite).filter((s): s is string => s !== null),
    assertedGateFailureCount: STALE_PINS
      .filter(p => p.kind === 'ASSERTED_GATE' && p.observedFailure !== null).length,
    notes: [
      'a stale historical pin is not a current HazLenz behavioural failure, and the three failing '
        + 'assertions must not be reported as regressions',
      'no repin is authorized until product-owner review; this module applies none',
      'PM-1.4 is RECORDED_ONLY. Those scripts exit non-zero for an unrelated pre-existing '
        + 'audit-sweep finding, not for this staleness.',
      'the §203 ancestry record was already repaired ADDITIVELY by §210J. That repair documents the '
        + 'transition; it does not and cannot make an asserted gate pass, which is why PM-1.1 '
        + 'still fails.',
      'an alternative to repinning PM-1.2 and PM-1.3 is to narrow those assertions to what they '
        + 'actually mean — "§201 / §202 changed nothing" — by comparing against a baseline captured '
        + 'at suite start rather than a literal. That is a product-owner choice and is recorded, '
        + 'not taken.',
    ],
  };
}

/** Asserted by the suite as literals: this module proposes and never applies. */
export function repinProposalEffect(): {
  providerCalls: 0; databaseOperations: 0;
  appliesARepin: false; editsASuite: false; editsHistoricalEvidence: false;
  proposesWithoutMarks: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    appliesARepin: false,
    editsASuite: false,
    editsHistoricalEvidence: false,
    proposesWithoutMarks: false,
  };
}
