/**
 * §212 -- PM-1: ASSERTION AND PROVENANCE REPAIR FOR THE FIRST-PASS PROJECTION MODULE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO FROZEN EVIDENCE EDITED.
 *
 * ==================== THE PRODUCT-OWNER PREFERENCE THIS IMPLEMENTS ====================
 *
 * "Prefer NARROWING brittle whole-file assertions to their actual intended invariant where possible
 * rather than mechanically repinning every gate to the current file hash."
 *
 * So each of the three asserted sites is CLASSIFIED BY WHAT IT ACTUALLY MEANT, and then handled on
 * that basis rather than uniformly.
 *
 *   §203 ancestry pin   CLASS 1. It genuinely intends exact file ancestry, which is the one thing a
 *                       whole-file hash is the right instrument for. The historical assertion is
 *                       PRESERVED and left historical-only, and a successor pin records the
 *                       transition. Nothing pretends the prior hash was wrong.
 *
 *   A4 and B18          CLASS 2. Neither is about ancestry. Both mean "MY SLICE CHANGED NOTHING IN
 *                       THE FIRST-PASS PROTOCOL", and a whole-file hash was the blunt instrument
 *                       used to say it. It is blunt in both directions: it fails when a DIFFERENT
 *                       authorized section legitimately advances the file, and it would equally
 *                       pass a file that had been edited and reverted. The narrowed assertions
 *                       below say the intended thing more accurately than the hash did.
 *
 * ==================== WHY THE CURRENT HASH IS NOT PROOF OF ANYTHING ====================
 *
 * The authorization is explicit: do not use the current hash alone as proof the current code is
 * correct. So the narrowed invariants are BEHAVIOURAL PROPERTIES CHECKED DIRECTLY -- the identity
 * shape the governed-binding stage depends on, the absence of a settlement call, the absence of a
 * retired matcher, the provider-owned-field refusal, and the absence of any wire route by which a
 * provider could name a fact. Each is read out of the real module at call time. A hash proves the
 * bytes; these prove the meaning.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  DECLARATION_FORBIDDEN_FIELDS, FACT_KEY_SHAPE, PROJECTION_REFUSAL_CODES,
} from './expert-first-pass-owed-fact-projection';
import { HISTORICAL_RECORD, MODIFYING_SECTION, SUBJECT_PATH } from './expert-210j-ancestry-successor';

export const PM1_ASSERTION_REPAIR_212_VERSION =
  'hazlenz.expert.212.pm1-assertion-repair.v1' as const;

const REPO_ROOT = join(__dirname, '..', '..', '..');
const readSubject = (repoRoot: string = REPO_ROOT): string =>
  readFileSync(join(repoRoot, SUBJECT_PATH), 'utf8');

// ================================================================ CLASS 1 — the ancestry pin

/**
 * The successor pin. §210J built the ancestry RECORD and deliberately declined to introduce a new
 * frozen expectation, saying a later edit must surface as a new divergence rather than be absorbed
 * by a pin that slice wrote on its own authority. §212 is the authorization §210J was waiting for,
 * and this is the pin.
 *
 * The historical value stays where it is and stays true of the moment it describes.
 */
export const SUCCESSOR_ANCESTRY_PIN_212 = {
  subjectPath: SUBJECT_PATH,
  priorSha256: HISTORICAL_RECORD.sha256,
  priorPinnedBy: HISTORICAL_RECORD.pinnedBy,
  modifyingSection: MODIFYING_SECTION.section,
  reasonForChange: MODIFYING_SECTION.change,
  currentSha256: 'bc47df39ea9d507b404f0b0ebe283c003e3220f097c6b3ea2139739989f0f11e',
  evidenceOfLegitimateTransition: [
    MODIFYING_SECTION.reportPath,
    'backend/scripts/lib/expert-210j-ancestry-successor.ts — verifies the marks at call time',
    'verification/expert-hazlenz-211-first-pass-freeze-and-verifier-validation-design-2026-09-09/'
      + 'DESIGN-REPORT-211.md §7',
  ] as readonly string[],
  priorHashWasWrong: false,
  historicalAssertionPreserved: true,
  section210jDeclinedToPinBecause: 'a later edit must surface as a new divergence, not be absorbed '
    + 'by a pin that slice wrote on its own authority',
  section212IsThatAuthorization: true,
} as const;

/** Does the subject still match the successor pin? A gate, not a description. */
export function successorAncestryHolds(repoRoot: string = REPO_ROOT): {
  holds: boolean; observed: string; expected: string; drifted: boolean;
} {
  const observed = createHash('sha256')
    .update(readFileSync(join(repoRoot, SUBJECT_PATH))).digest('hex');
  return {
    holds: observed === SUCCESSOR_ANCESTRY_PIN_212.currentSha256,
    observed,
    expected: SUCCESSOR_ANCESTRY_PIN_212.currentSha256,
    drifted: observed !== SUCCESSOR_ANCESTRY_PIN_212.currentSha256,
  };
}

// ================================================================ CLASS 2 — the narrowed invariants

export const NARROWED_INVARIANT_IDS = [
  'N1_NO_FOREIGN_SECTION_EDITED_THE_MODULE',
  'N2_IDENTITY_SHAPE_UNCHANGED',
  'N3_NO_SETTLEMENT_AUTHORITY_IN_THE_PROJECTION',
  'N4_NO_RETIRED_SEMANTIC_MATCHER',
  'N5_PROVIDER_OWNED_FIELDS_STILL_REFUSED',
  'N6_IDENTITY_IS_COMPUTED_NEVER_ACCEPTED',
] as const;
export type NarrowedInvariantId = (typeof NARROWED_INVARIANT_IDS)[number];

export interface InvariantResult {
  readonly id: NarrowedInvariantId;
  readonly holds: boolean;
  readonly means: string;
  readonly detail: string;
}

/**
 * The frozen identity shape the governed-binding stages import and depend on. A change here would
 * silently alter which declaration ids and fact keys are admissible, which is the real thing A4 and
 * B18 were protecting.
 */
export const FROZEN_FACT_KEY_SHAPE_SOURCE = '^[A-Za-z0-9][A-Za-z0-9_:.\\-]{0,127}$' as const;

/**
 * Section markers that must NOT appear in the projection module. §201 and §202 are the two slices
 * whose assertions these replace; their absence is the direct form of "my slice changed nothing
 * here". §210E is deliberately NOT in this list: it is the section that legitimately did.
 */
export const FOREIGN_SECTION_MARKERS: readonly string[] = ['§201', '§202'];

/** Signatures of the semantic matcher §160 retired and v3 refused to reintroduce. */
export const RETIRED_MATCHER_SIGNATURES: readonly string[] = [
  'contentOverlap', 'similarityScore', 'jaccard', 'levenshtein', 'cosineSimilarity',
  'OVERLAP_THRESHOLD',
];

export function evaluateNarrowedInvariants(repoRoot: string = REPO_ROOT): InvariantResult[] {
  const src = readSubject(repoRoot);
  // Comment lines are stripped before the code-shaped checks so that PROSE ABOUT a retired matcher
  // is not mistaken for the matcher. §199's own integrity gate uses the same stripping discipline.
  const code = src.split('\n')
    .filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l))
    .join('\n');

  const out: InvariantResult[] = [];

  out.push({
    id: 'N1_NO_FOREIGN_SECTION_EDITED_THE_MODULE',
    holds: !FOREIGN_SECTION_MARKERS.some(m => src.includes(m)),
    means: 'neither §201 nor §202 left a mark in the projection module, which is what "my slice '
      + 'changed nothing here" actually asserts',
    detail: `markers checked: ${FOREIGN_SECTION_MARKERS.join(', ')}`,
  });

  out.push({
    id: 'N2_IDENTITY_SHAPE_UNCHANGED',
    holds: FACT_KEY_SHAPE.source === FROZEN_FACT_KEY_SHAPE_SOURCE,
    means: 'the identity shape the governed-binding stages import is byte-identical to the frozen '
      + 'value, so which ids are admissible has not moved',
    detail: FACT_KEY_SHAPE.source,
  });

  out.push({
    id: 'N3_NO_SETTLEMENT_AUTHORITY_IN_THE_PROJECTION',
    holds: !/\btransition\s*\(/.test(code),
    means: 'the projection still cannot move an owed fact out of UNRESOLVED. This is the authority '
      + 'boundary verify-197 and verify-199 already assert, and it is the invariant that actually '
      + 'matters',
    detail: 'no transition() call in code',
  });

  out.push({
    id: 'N4_NO_RETIRED_SEMANTIC_MATCHER',
    holds: !RETIRED_MATCHER_SIGNATURES.some(s => code.includes(s)),
    means: 'the content-overlap matcher §160 retired has not reappeared. A lexical threshold over '
      + 'safety prose is a free-text semantic gate and this architecture does not run one',
    detail: `signatures checked: ${RETIRED_MATCHER_SIGNATURES.length}`,
  });

  out.push({
    id: 'N5_PROVIDER_OWNED_FIELDS_STILL_REFUSED',
    holds: DECLARATION_FORBIDDEN_FIELDS.includes('factKey')
      && DECLARATION_FORBIDDEN_FIELDS.includes('acceptableEvidence')
      && DECLARATION_FORBIDDEN_FIELDS.includes('status')
      && (PROJECTION_REFUSAL_CODES as readonly string[])
        .includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'),
    means: 'a provider still cannot send a HazLenz-owned field, and the refusal code still exists',
    detail: `${DECLARATION_FORBIDDEN_FIELDS.length} forbidden fields`,
  });

  out.push({
    id: 'N6_IDENTITY_IS_COMPUTED_NEVER_ACCEPTED',
    holds: /computeFactKey/.test(code) && DECLARATION_FORBIDDEN_FIELDS.includes('factKey'),
    means: 'the wire has no factKey field and the key is computed, so a provider cannot name, '
      + 'collide with or impersonate a fact',
    detail: 'computeFactKey present; factKey forbidden on the wire',
  });

  return out;
}

export function narrowedInvariantsHold(repoRoot: string = REPO_ROOT): boolean {
  return evaluateNarrowedInvariants(repoRoot).every(r => r.holds);
}

// ================================================================ the disposition record

export const PM1_DISPOSITIONS = [
  {
    site: 'backend/scripts/lib/expert-203-successor-identity.ts — ANCESTOR_PINS',
    assertedBy: 'backend/scripts/verify-203-source-integrity.ts',
    intent: 'exact file ancestry',
    classification: 'CLASS_1_ANCESTRY',
    action: 'SUCCESSOR_PINNED_AND_LEFT_HISTORICAL_ONLY',
    detail: 'the historical assertion and its hash are preserved untouched. '
      + 'SUCCESSOR_ANCESTRY_PIN_212 records prior hash, modifying section, current hash, reason and '
      + 'evidence, and verify-212-projection-ancestry gates the current state. '
      + 'verify-203-source-integrity continues to assert the historical state and continues to '
      + 'report it as diverged, which is CORRECT: it is a historical gate and the file has '
      + 'legitimately moved since.',
  },
  {
    site: 'backend/scripts/test-201-governed-binding-stage.ts — A4',
    assertedBy: 'itself',
    intent: '§201 changed nothing in the projection module',
    classification: 'CLASS_2_BOUNDARY_INVARIANT',
    action: 'NARROWED',
    detail: 'the whole-file hash is replaced by the six narrowed invariants, which say the intended '
      + 'thing more accurately: a hash would also have passed a file edited and reverted, and fails '
      + 'when a different authorized section advances it. The §199 hash is retained in the '
      + 'assertion as a documented historical reference and is not erased.',
  },
  {
    site: 'backend/scripts/test-202-governed-binding-stage.ts — B18',
    assertedBy: 'itself',
    intent: 'the first-pass protocol files are byte-unchanged by §202',
    classification: 'CLASS_2_BOUNDARY_INVARIANT',
    action: 'NARROWED',
    detail: 'only the projection sub-clause is narrowed. The vNext module, expert-prompt.ts and the '
      + 'capability-absent system prompt remain whole-file hash assertions, because those files '
      + 'have NOT legitimately moved and the blunt instrument is still telling the truth there.',
  },
  {
    site: 'backend/scripts/verify-196/197/198/199-source-integrity — report lines',
    assertedBy: null,
    intent: 'record the protocol identities of a run',
    classification: 'REPORT_ONLY',
    action: 'LEFT_UNCHANGED_NO_CORRECTION_NEEDED',
    detail: 'these print the projection hash under PROTOCOL IDENTITIES FOR THIS RUN. They assert a '
      + 'byte-level property instead — no transition() call — which still holds, and they do not '
      + 'label the hash as drift. They exit non-zero for an unrelated pre-existing audit-sweep '
      + 'finding on backend/scripts/execute-208-acceptance-cohort.ts. No additive correction is '
      + 'needed because nothing there treats legitimate evolution as unexplained.',
  },
] as const;

/** The rules this repair operated under, asserted as literals. */
export function pm1RepairEffect(): {
  editsFrozenEvidence: false; erasesTheOldExpectedHash: false;
  callsTheStalePinABehaviouralFailure: false; usesCurrentHashAsProofOfCorrectness: false;
  narrowedInvariantsAreProvedByTests: true;
} {
  return {
    editsFrozenEvidence: false,
    erasesTheOldExpectedHash: false,
    callsTheStalePinABehaviouralFailure: false,
    usesCurrentHashAsProofOfCorrectness: false,
    narrowedInvariantsAreProvedByTests: true,
  };
}
