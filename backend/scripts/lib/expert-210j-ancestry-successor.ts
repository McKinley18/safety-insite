/**
 * §210J -- ADDITIVE ANCESTRY SUCCESSOR: THE §203 PROVENANCE RECORD FOR THE FIRST-PASS PROJECTION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING HISTORICAL IS MODIFIED.
 *
 * ==================== WHAT §210I FOUND ====================
 *
 * `ANCESTOR_PINS` in `expert-203-successor-identity.ts` records
 * `backend/scripts/lib/expert-first-pass-owed-fact-projection.ts` at
 * `aab67e0b2e9c7303569c480c0eee92a19d2d9ccd4ffda04dc841dba60256432c`. The working file no longer
 * hashes to that. §210I reported the divergence and, correctly, did not repair it.
 *
 * ==================== WHY THE OLD RECORD IS NOT EDITED ====================
 *
 * `aab67e0b…` is the TRUE hash of what §203 pinned, and it is what
 * `verification/expert-hazlenz-checkpoint-consolidation-2026-09-07/POST-CONSOLIDATION-MANIFEST.sha256`
 * and the §204 successor source manifest also carry. Rewriting the §203 entry to today's value
 * would make the record claim §203 pinned something it did not, and would silently disagree with
 * three recorded evidence artefacts that cannot be rewritten with it. A provenance record that is
 * edited to stay true is not a provenance record.
 *
 * So this is a SUCCESSOR. The old record stands, unmodified and still true of the moment it
 * describes, and this one states what happened after it.
 *
 * ==================== THE TRANSITION, AND WHAT SUPPORTS IT ====================
 *
 * §210E's R7 deterministic half added `NON_SEMANTIC_PLACEHOLDER_VALUE` to that file. The §210E
 * report says so in its own words, naming the file: "Added: refusal code
 * `NON_SEMANTIC_PLACEHOLDER_VALUE` in `expert-first-pass-owed-fact-projection.ts`, and the same
 * code added to `CONTRACT_INCOMPLETENESS_CODES` so RR-7 preserves the identified property".
 *
 * ==================== IT VERIFIES RATHER THAN ASSERTS ====================
 *
 * `buildAncestrySuccessor` hashes the real file at call time and classifies the result. It does not
 * hard-code today's hash as a new frozen expectation, because a second later edit would then be
 * invisible in exactly the way the §203 record's staleness was. Where the evidence does not support
 * the transition it says `UNVERIFIED` and explains what is missing. It never repairs, never writes
 * to a historical artefact, and never claims a section advanced a file it cannot show marks for.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const ANCESTRY_SUCCESSOR_210J_VERSION =
  'hazlenz.expert.210j.ancestry-successor.v1' as const;

const REPO_ROOT = join(__dirname, '..', '..', '..');

/** The subject. One file; this successor deliberately does not widen its own scope. */
export const SUBJECT_PATH =
  'backend/scripts/lib/expert-first-pass-owed-fact-projection.ts' as const;

/** The historical record, quoted. NEVER edited, and reproduced here only to be superseded. */
export const HISTORICAL_RECORD = {
  recordedIn: 'backend/scripts/lib/expert-203-successor-identity.ts — ANCESTOR_PINS',
  sha256: 'aab67e0b2e9c7303569c480c0eee92a19d2d9ccd4ffda04dc841dba60256432c',
  pinnedBy: 'FROZEN_BY_RECORDED_EVIDENCE: not hash-pinned against a frozen expectation, but its '
    + 'sha256 is recorded inside §196/§197/§198 evidence, and verify-197:248 / verify-199:255 '
    + 'assert a byte-level property of it',
  recordedOn: '2026-09-07',
  alsoCarriedBy: [
    'verification/expert-hazlenz-checkpoint-consolidation-2026-09-07/'
      + 'POST-CONSOLIDATION-MANIFEST.sha256',
    'verification/expert-hazlenz-checkpoint-consolidation-2026-09-07/'
      + 'PRE-CONSOLIDATION-BASELINE.sha256',
    'verification/expert-hazlenz-successor-value-closure-2026-09-07/'
      + 'SUCCESSOR-SOURCE-MANIFEST-204.json',
  ] as readonly string[],
  stillTrueOfTheMomentItDescribes: true,
} as const;

/** The section that legitimately advanced the file, and the marks that show it. */
export const MODIFYING_SECTION = {
  section: '§210E',
  change: 'the R7 deterministic half added the NON_SEMANTIC_PLACEHOLDER_VALUE refusal code, the '
    + 'NON_SEMANTIC_FILLER closed set, isNonSemanticFiller, and the SEMANTIC_BRANCH_FIELDS check',
  authorizedBy: 'the §210E final-remediation slice, accepted',
  reportQuote: 'Added: refusal code `NON_SEMANTIC_PLACEHOLDER_VALUE` in '
    + '`expert-first-pass-owed-fact-projection.ts`, and the same code added to '
    + '`CONTRACT_INCOMPLETENESS_CODES` so RR-7 preserves the identified property rather than '
    + 'discarding it with the empty shape.',
  reportPath:
    'verification/expert-hazlenz-210e-final-remediation-2026-09-09/FINAL-REMEDIATION-REPORT-210E.md',
} as const;

/**
 * Marks the file must carry for the §210E attribution to be evidenced IN THE FILE rather than only
 * in a report. Substring presence only; nothing here reads code for meaning.
 */
export const EXPECTED_MARKS_IN_SUBJECT: readonly string[] = [
  'NON_SEMANTIC_PLACEHOLDER_VALUE',
  'isNonSemanticFiller',
  'SEMANTIC_BRANCH_FIELDS',
  '§210E R7',
];

/** Artefacts a reviewer can open to check the attribution without trusting this module. */
export const SUPPORTING_ARTIFACTS: readonly string[] = [
  MODIFYING_SECTION.reportPath,
  'backend/scripts/test-210e-final-remediation.ts — asserts PROJECTION_REFUSAL_CODES includes '
    + 'NON_SEMANTIC_PLACEHOLDER_VALUE and that a filler declaration is refused end to end',
  'backend/scripts/lib/expert-205-declaration-preservation.ts — CONTRACT_INCOMPLETENESS_CODES '
    + 'carries the code with an inline "§210E R7" attribution',
  'verification/expert-hazlenz-210i-epistemic-representation-review-2026-09-09/'
    + 'ARCHITECTURE-REVIEW-210I.md §12 — where the divergence was first reported',
];

export const TRANSITION_CLASSIFICATIONS = [
  /** Current hash differs from the historical pin AND every expected §210E mark is present. */
  'ADVANCED_BY_A_LATER_AUTHORIZED_SECTION',
  /** Current hash equals the historical pin. There is nothing to supersede. */
  'UNCHANGED_SINCE_THE_HISTORICAL_PIN',
  /** Diverged, but the marks that would attribute it are not all present. */
  'UNVERIFIED_DIVERGENCE',
  /** The subject file is not where the record says it is. */
  'SUBJECT_ABSENT',
] as const;
export type TransitionClassification = (typeof TRANSITION_CLASSIFICATIONS)[number];

export interface AncestrySuccessorRecord {
  readonly version: typeof ANCESTRY_SUCCESSOR_210J_VERSION;
  readonly recordKind: 'ADDITIVE_ANCESTRY_SUCCESSOR';
  readonly subjectPath: typeof SUBJECT_PATH;
  readonly historicalSha256: string;
  readonly currentSha256: string | null;
  readonly classification: TransitionClassification;
  readonly modifyingSection: string | null;
  readonly reasonForTransition: string | null;
  readonly marksPresent: readonly string[];
  readonly marksAbsent: readonly string[];
  readonly supportingArtifacts: readonly string[];
  readonly supportingArtifactsPresentOnDisk: readonly string[];
  /** Literals. This record is additive and reads nothing for meaning. */
  readonly historicalRecordModified: false;
  readonly historicalEvidenceModified: false;
  readonly newFrozenExpectationIntroduced: false;
  /** Stated so nobody reads a verified transition as a re-pin. */
  readonly note: string;
}

const sha256File = (abs: string): string =>
  createHash('sha256').update(readFileSync(abs)).digest('hex');

/**
 * Build the successor record from the real filesystem. Pure with respect to the repository: it
 * reads, hashes and classifies, and writes nothing.
 */
export function buildAncestrySuccessor(repoRoot: string = REPO_ROOT): AncestrySuccessorRecord {
  const abs = join(repoRoot, SUBJECT_PATH);
  const base = {
    version: ANCESTRY_SUCCESSOR_210J_VERSION,
    recordKind: 'ADDITIVE_ANCESTRY_SUCCESSOR',
    subjectPath: SUBJECT_PATH,
    historicalSha256: HISTORICAL_RECORD.sha256,
    supportingArtifacts: SUPPORTING_ARTIFACTS,
    supportingArtifactsPresentOnDisk: SUPPORTING_ARTIFACTS
      .map(a => a.split(' — ')[0])
      .filter(p => existsSync(join(repoRoot, p))),
    historicalRecordModified: false,
    historicalEvidenceModified: false,
    newFrozenExpectationIntroduced: false,
    note: 'this record states WHAT THE CURRENT HASH WAS WHEN IT WAS BUILT. It is not a new frozen '
      + 'expectation: a later edit must show up as a new divergence, not be absorbed by a pin this '
      + 'slice wrote.',
  } as const;

  if (!existsSync(abs)) {
    return {
      ...base,
      currentSha256: null,
      classification: 'SUBJECT_ABSENT',
      modifyingSection: null,
      reasonForTransition: null,
      marksPresent: [],
      marksAbsent: [...EXPECTED_MARKS_IN_SUBJECT],
    };
  }

  const current = sha256File(abs);
  const src = readFileSync(abs, 'utf8');
  const marksPresent = EXPECTED_MARKS_IN_SUBJECT.filter(m => src.includes(m));
  const marksAbsent = EXPECTED_MARKS_IN_SUBJECT.filter(m => !src.includes(m));

  if (current === HISTORICAL_RECORD.sha256) {
    return {
      ...base,
      currentSha256: current,
      classification: 'UNCHANGED_SINCE_THE_HISTORICAL_PIN',
      modifyingSection: null,
      reasonForTransition: null,
      marksPresent,
      marksAbsent,
    };
  }

  if (marksAbsent.length > 0) {
    return {
      ...base,
      currentSha256: current,
      classification: 'UNVERIFIED_DIVERGENCE',
      modifyingSection: null,
      reasonForTransition: 'the file diverges from the §203 pin, but the marks that would attribute '
        + `the change to ${MODIFYING_SECTION.section} are not all present: `
        + `${marksAbsent.join(', ')}. The divergence is REPORTED and not explained; attributing it `
        + 'without evidence would be the reconstruction this record exists to avoid.',
      marksPresent,
      marksAbsent,
    };
  }

  return {
    ...base,
    currentSha256: current,
    classification: 'ADVANCED_BY_A_LATER_AUTHORIZED_SECTION',
    modifyingSection: MODIFYING_SECTION.section,
    reasonForTransition: MODIFYING_SECTION.change,
    marksPresent,
    marksAbsent,
  };
}

/** What this record does NOT do. Asserted by the suite as literals. */
export function ancestrySuccessorEffect(): {
  providerCalls: 0; databaseOperations: 0;
  editsHistoricalRecords: false; writesToVerificationEvidence: false;
  infersAttributionWithoutMarks: false; createsANewPin: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    editsHistoricalRecords: false,
    writesToVerificationEvidence: false,
    infersAttributionWithoutMarks: false,
    createsANewPin: false,
  };
}
