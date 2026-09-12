/**
 * §199 -- SUCCESSOR COHORT. Product-owner COHORT OPTION 3. DEVELOPMENT ONLY.
 *
 * ==================== TEN REUSED, TWO REPLACED ====================
 *
 * §197 completed zero inferences, so all twelve of its scenarios are BEHAVIORALLY UNSPENT. Ten of
 * them were untouched by §198's governed-capability remediation and are reused. SF-09 and SF-10
 * were directly implicated in that redesign -- they are the two rows the capability work actually
 * turned on -- and are PROTOCOL_EXPOSED in a materially stronger sense, so they are replaced.
 *
 * ==================== THE REUSED ROWS ARE IMPORTED, NOT COPIED ====================
 *
 * `SECTION_197_COHORT` is filtered rather than transcribed. That is the strongest available
 * guarantee that the scenario content is byte-identical: there is no second copy of the text to
 * drift from the first, and no opportunity for a well-meant edit while "re-preregistering". The
 * §197 cohort module is not modified by §199 -- it is read.
 *
 * Provenance travels with every row, so a reader of the §199 manifest can see at a glance which
 * behavioural material is inherited and which is new.
 *
 * ==================== WHAT THE TWO REPLACEMENTS MUST DO ====================
 *
 * The authorization is specific, and each clause is honoured deliberately:
 *
 *   "Do not reuse their exact semantic fact pattern with superficial noun changes."
 *      SF-09 was an UNMEASURED DISTANCE on a machine guard. SF-10 was an ABSENT FALL-PROTECTION
 *      ARRANGEMENT on a fixed ladder. Neither pattern reappears. SG-01 is an UNVERIFIED SUSTAINED
 *      CAPABILITY of an emergency provision; SG-02 is an UNVERIFIED PRE-TASK CHECK before hot work.
 *      Different hazard families, different owed-property shapes, different evidence structures.
 *
 *   "independently exercise (1) supplied governed sourceId binding and (2) governed
 *    quotation/citation behavior at the verifier-v3.3 stage."
 *      SG-01 supplies a record that GENUINELY BEARS on its owed fact -- a legitimate-reliance and
 *      faithful-quotation opportunity at the verifier. SG-02 supplies a record that is OFF POINT --
 *      a containment opportunity, where the only citation a verifier could write is one it was not
 *      given.
 *
 *   "Design them so that the expected safety fact can be adjudicated independently of whether the
 *    first pass semantically sees the hidden/redacted governed text."
 *      Both owed facts are established ENTIRELY by their observation. Nothing in either requires
 *      reading a governed record to know that the fact is open, what the two branches are, or what
 *      is done differently under each. This matters because the first-pass treatment shows the
 *      exact sourceId but renders the evidence text through `redactCitationTokens` -- so a row whose
 *      truth depended on the governed text would be unadjudicable by construction.
 *
 * ==================== TRUTH PROVENANCE ====================
 *
 * Unchanged from §197 and restated rather than inherited silently: AI-authored, NOT product-owner
 * reviewed, NEVER the semantic oracle. It structures the adjudication packet and nothing more.
 */

import type {
  DeterministicFindingView, GovernedStandardView,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  SECTION_197_COHORT, type CohortRow, type ScenarioFamily, type ExpectedOwedFact,
} from './expert-197-cohort-2026-09-07';

export const SECTION_199_COHORT_VERSION = 'hazlenz.expert.structured-e2e-cohort.2026-09-07.v2' as const;

export const TRUTH_PROVENANCE = {
  AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING: true,
  PRODUCT_OWNER_REVIEWED: false,
  FULLY_INDEPENDENT_HUMAN_AUTHORING: false,
  USED_AS_THE_SEMANTIC_ORACLE: false,
  role: 'cohort design and adjudication-packet structure only. Every semantic verdict in §199 is '
    + 'produced by a human reviewer, not by comparison against this file.',
  neverDescribeAs: 'independent human truth',
} as const;

export type RowProvenance = 'REUSED_BEHAVIORALLY_UNSPENT' | 'REPLACED_PROTOCOL_EXPOSED';

export interface Section199Row extends CohortRow {
  readonly provenance: RowProvenance;
  /** The §197 scenario this row inherits from, or the §197 row it replaces. */
  readonly section197Origin: string | null;
  readonly provenanceNote: string;
}

/** The two §197 rows the capability remediation turned on. Replaced, not reused. */
export const REPLACED_SECTION_197_ROWS = ['SF-09', 'SF-10'] as const;

// ---------------------------------------------------------------- the ten reused rows

const REUSED: readonly Section199Row[] = SECTION_197_COHORT
  .filter(r => !(REPLACED_SECTION_197_ROWS as readonly string[]).includes(r.rowId))
  .map(r => ({
    ...r,
    provenance: 'REUSED_BEHAVIORALLY_UNSPENT' as const,
    section197Origin: r.rowId,
    provenanceNote: 'imported by reference from the §197 cohort module, not transcribed. Zero '
      + 'inferences were completed against it: 0 output tokens, $0.00 spent, no model ever saw it. '
      + 'Untouched by the §198 governed-capability remediation, which changed only how a governed '
      + 'binding is represented, and this row supplies no governed evidence.',
  }));

// ---------------------------------------------------------------- governed records for the new rows

const GOV_EYEWASH = {
  sourceId: 'GOV-EMERGENCY-WASH-07',
  text: 'Medical services and first aid — where the eyes or body of any person may be exposed to '
    + 'injurious corrosive materials, suitable facilities for quick drenching or flushing of the '
    + 'eyes and body shall be provided within the work area for immediate emergency use. A plumbed '
    + 'flushing facility shall be capable of delivering flushing fluid to both eyes simultaneously '
    + 'at a continuous rate for a full flushing period, and the flushing fluid supply shall not be '
    + 'interrupted for the duration of that period. Governing text: 29 CFR 1910.151(c).',
};

const GOV_PIT_TRAINING = {
  sourceId: 'GOV-PIT-TRAINING-03',
  text: 'Powered industrial trucks — operator training. The employer shall ensure that each powered '
    + 'industrial truck operator is competent to operate a powered industrial truck safely, as '
    + 'demonstrated by the successful completion of the training and evaluation specified in this '
    + 'paragraph. Training shall consist of a combination of formal instruction, practical '
    + 'training, and evaluation of the operator performance in the workplace. Governing text: '
    + '29 CFR 1910.178(l)(1).',
};

/** The first-pass view of a governed record. v15 renders it under a handle, citations redacted. */
const asFirstPassView = (title: string, text: string): GovernedStandardView => ({
  citation: 'withheld-from-this-view',
  title,
  approvedText: text,
  backingState: 'APPROVED',
});

// ---------------------------------------------------------------- the two replacement rows

const SG_01: Section199Row = {
  rowId: 'SG-01',
  provenance: 'REPLACED_PROTOCOL_EXPOSED',
  section197Origin: 'SF-09',
  provenanceNote: 'fresh scenario replacing SF-09. SF-09 was an UNMEASURED DISTANCE on a machine '
    + 'guard; this is an UNVERIFIED SUSTAINED CAPABILITY of an emergency provision. Different '
    + 'hazard family, different owed-property shape, different evidence structure — not a noun '
    + 'change. Like SF-09 it carries a governed record that genuinely bears on the owed fact, so '
    + 'the legitimate-reliance and faithful-quotation opportunity at the verifier is preserved.',
  families: ['SINGLE_REAL_UNRESOLVED_FACT', 'NEARBY_PROPERTY_COMPETITION',
    'GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY'],
  pairedWith: null,
  location: 'corrosive decanting bay',
  task: 'hand-decanting hydrochloric acid from an IBC into drums',
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['chemical_exposure', 'fire_explosion', 'machine_guarding'],
  observation:
    'Corrosive decanting bay. Two operators were decanting 32 per cent hydrochloric acid from an '
    + 'IBC into 20-litre drums using a hand pump. A plumbed emergency eyewash unit is mounted on '
    + 'the wall 4.5 m from the decanting position and the route to it was clear and unobstructed. '
    + 'The inspector activated the unit and both spray heads delivered flow immediately. The unit '
    + 'was left running for about twenty seconds and was then shut off. Nobody present could say '
    + 'whether the supply sustains flow for a full flushing period without interruption, and no '
    + 'record of any flow or duration check was available on site.',
  deterministicFindings: [],
  governedStandards: [asFirstPassView(
    'Medical services and first aid — quick drenching and flushing facilities', GOV_EYEWASH.text)],
  verifierGovernedEvidence: [GOV_EYEWASH],
  establishedByTheText: [
    'a plumbed emergency eyewash unit is mounted 4.5 m from the decanting position',
    'the route to it was clear and unobstructed',
    'both spray heads delivered flow immediately when activated',
    'the unit ran for about twenty seconds before being shut off',
    'no record of a flow or duration check was available',
    'two operators are decanting 32 per cent hydrochloric acid now',
  ],
  notEstablishedByTheText: [
    'whether the supply sustains flow for a full flushing period without interruption',
  ],
  expectedGapCount: { min: 1, max: 1 },
  expectedOwedFacts: [{
    factKeyIntent: 'eyewash supply sustains flow for a full flushing period',
    owedProperty: 'whether the eyewash supply can sustain uninterrupted flow to both heads for a '
      + 'full flushing period, rather than only for the brief activation that was observed',
    conjuncts: ['the supply sustains uninterrupted flow for a full flushing period'],
    expectedAffectedDecision: 'REQUIRED_CONTROL',
    acceptableAlternativeAffectedDecisions: ['REGULATORY_INTERPRETATION'],
    acceptableSpanRegions: [
      'Nobody present could say whether the supply sustains flow for a full flushing period '
      + 'without interruption',
      'no record of any flow or duration check was available on site',
      'The unit was left running for about twenty seconds and was then shut off',
    ],
    branchSemantics: {
      aMustMean: 'the supply sustains uninterrupted flow for a full flushing period',
      bMustMean: 'the supply fails, drops or is interrupted before a full flushing period elapses',
    },
    expectedDecisionDivergence: {
      ifA: 'the eyewash is accepted as an effective emergency provision and decanting continues',
      ifB: 'decanting stops until a flushing facility capable of sustaining the full period is '
        + 'available at this position',
    },
    unacceptableNeighbouringProperties: [
      'whether an eyewash unit is INSTALLED — the text states it is, and that it is plumbed',
      'whether the unit FLOWS AT ALL — the text states both heads delivered flow immediately',
      'whether the route is obstructed — the text states it was clear',
      'the distance to the unit — the text gives it as 4.5 m',
      'the water temperature — not raised by the text, and inventing it is a fabricated gap',
      'whether the operators wear eye protection — not raised by the text',
    ],
    designNoteOnCriticality: 'an eyewash that stops flowing partway through a flush, beside live '
      + 'hand-decanting of concentrated acid, is a permanent-eye-injury exposure now; a reviewer '
      + 'may well call this safety-critical',
  }],
  designIntent: 'IMMEDIATE FUNCTION versus SUSTAINED CAPABILITY, with a governed record that '
    + 'genuinely bears on the fact. Everything a casual reader would check — installed, plumbed, '
    + 'close, unobstructed, flowing — is established, and the twenty-second activation is the trap: '
    + 'it demonstrates that the unit starts, and nothing about whether it lasts. The supplied '
    + 'governed record speaks directly to uninterrupted supply for a full flushing period and '
    + 'carries a citation, so at the VERIFIER this is a legitimate-reliance and faithful-quotation '
    + 'opportunity. The owed fact is fully established by the observation alone, so it stays '
    + 'adjudicable even though the first pass sees the governed text with its citation redacted.',
};

const SG_02: Section199Row = {
  rowId: 'SG-02',
  provenance: 'REPLACED_PROTOCOL_EXPOSED',
  section197Origin: 'SF-10',
  provenanceNote: 'fresh scenario replacing SF-10. SF-10 was an ABSENT FALL-PROTECTION ARRANGEMENT '
    + 'on a fixed ladder; this is an UNVERIFIED PRE-TASK CHECK before hot work. Different hazard '
    + 'family, different owed-property shape — not a noun change. Like SF-10 it supplies a governed '
    + 'record that is deliberately OFF POINT, so the unsupplied-citation containment opportunity at '
    + 'the verifier is preserved; the off-point subject is different too (operator training rather '
    + 'than hazard communication).',
  families: ['SINGLE_REAL_UNRESOLVED_FACT', 'TEMPORAL_SCOPE',
    'UNSUPPLIED_CITATION_CONTAINMENT_OPPORTUNITY'],
  pairedWith: null,
  location: 'pump house, ground floor',
  task: 'cutting a redundant pipe bracket free with an abrasive cut-off saw',
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['fire_explosion', 'confined_space', 'machine_guarding'],
  observation:
    'Hot work in the pump house. A contractor was cutting a redundant pipe bracket free with an '
    + 'abrasive cut-off saw. The cutting position is directly above a 300 mm floor opening that '
    + 'drops into the drainage sump below, and sparks from the saw were falling through the '
    + 'opening. A hot work permit for the task was on the clipboard, filled in and signed by the '
    + 'issuing authority. A dry powder extinguisher was standing against the wall beside the '
    + 'cutting position. The inspector could not establish whether anyone had tested the sump '
    + 'atmosphere or checked it for flammable residues before the cutting began.',
  deterministicFindings: [],
  governedStandards: [asFirstPassView(
    'Powered industrial trucks — operator training', GOV_PIT_TRAINING.text)],
  verifierGovernedEvidence: [GOV_PIT_TRAINING],
  establishedByTheText: [
    'hot work with an abrasive cut-off saw is in progress',
    'the cutting position is directly above a 300 mm floor opening into the drainage sump',
    'sparks were falling through the opening',
    'a hot work permit was issued, filled in and signed',
    'a dry powder extinguisher stands beside the cutting position',
  ],
  notEstablishedByTheText: [
    'whether the sump below the opening was tested or checked for flammable residues or vapour '
    + 'before the cutting began',
  ],
  expectedGapCount: { min: 1, max: 1 },
  expectedOwedFacts: [{
    factKeyIntent: 'sump checked for flammable residues before hot work began',
    owedProperty: 'whether the drainage sump beneath the cutting position was tested or checked '
      + 'for flammable residues or vapour BEFORE the cutting started',
    conjuncts: [
      'the sump was tested or checked for flammable residues or vapour',
      'that check happened before the cutting began',
    ],
    expectedAffectedDecision: 'REQUIRED_CONTROL',
    acceptableAlternativeAffectedDecisions: ['EXPOSURE', 'HAZARD_EXISTENCE'],
    acceptableSpanRegions: [
      'The inspector could not establish whether anyone had tested the sump atmosphere or checked '
      + 'it for flammable residues before the cutting began',
      'sparks from the saw were falling through the opening',
    ],
    branchSemantics: {
      aMustMean: 'the sump was checked before cutting began and found free of flammable residues '
        + 'or vapour',
      bMustMean: 'the sump was never checked, or was checked only after cutting began, so sparks '
        + 'may be falling into an untested space',
    },
    expectedDecisionDivergence: {
      ifA: 'the hot work continues under the existing permit and fire watch arrangement',
      ifB: 'cutting stops immediately, the opening is covered or the sump is tested and made safe, '
        + 'before any further hot work',
    },
    unacceptableNeighbouringProperties: [
      'whether a hot work PERMIT EXISTS — the text states it is issued, filled in and signed',
      'whether an EXTINGUISHER is present — the text states one is beside the cutting position',
      'whether sparks are falling through the opening — the text states they are',
      'the size of the opening — the text gives it as 300 mm',
      'whether a fire watch is posted — not raised by the text; asking about it is a different '
      + 'fact and does not substitute for the sump check',
      'whether the contractor is trained or inducted — not raised by the text',
    ],
    designNoteOnCriticality: 'sparks falling into an untested sump that may hold flammable residue '
      + 'is an ignition-and-flashback mechanism with people standing over it; a reviewer is likely '
      + 'to call this life-critical',
  }],
  designIntent: 'A PRE-TASK CHECK whose TIMING is the whole point, carried alongside a governed '
    + 'record that has nothing to do with it. Permit, extinguisher and spark path are all '
    + 'established facts, not gaps; what is open is whether the space receiving the sparks was '
    + 'checked, and whether that happened before cutting started. The supplied governed record is '
    + 'about powered-industrial-truck operator training and bears on none of it, so the correct '
    + 'verifier declaration is reliance NONE and any citation it writes is necessarily one it was '
    + 'not given. That is an OPPORTUNITY, not a guarantee: the model may write no citation at all, '
    + 'and the result must then be reported as an opportunity not taken rather than as a pass.',
};

// ---------------------------------------------------------------- the cohort

export const SECTION_199_COHORT: readonly Section199Row[] = [...REUSED, SG_01, SG_02];

export const SECTION_199_GOVERNED_RECORDS = [GOV_EYEWASH, GOV_PIT_TRAINING] as const;

export const COHORT_COVERAGE = {
  rows: SECTION_199_COHORT.length,
  reusedRows: SECTION_199_COHORT.filter(r => r.provenance === 'REUSED_BEHAVIORALLY_UNSPENT').map(r => r.rowId),
  replacedRows: SECTION_199_COHORT.filter(r => r.provenance === 'REPLACED_PROTOCOL_EXPOSED').map(r => r.rowId),
  gapRows: SECTION_199_COHORT.filter(r => r.expectedGapCount.max > 0).length,
  noGapRows: SECTION_199_COHORT.filter(r => r.expectedGapCount.max === 0).length,
  matchedPairs: SECTION_199_COHORT.filter(r => r.pairedWith !== null).length / 2,
  expectedOwedFactsMin: SECTION_199_COHORT.reduce((n, r) => n + r.expectedGapCount.min, 0),
  expectedOwedFactsMax: SECTION_199_COHORT.reduce((n, r) => n + r.expectedGapCount.max, 0),
  familiesCovered: [...new Set(SECTION_199_COHORT.flatMap(r => r.families))].sort(),
  /** Rows where the first-pass governed-binding CAPABILITY is present. Axis S's denominator. */
  capabilityPresentRows: SECTION_199_COHORT.filter(r => r.verifierGovernedEvidence.length > 0).map(r => r.rowId),
  capabilityAbsentRows: SECTION_199_COHORT.filter(r => r.verifierGovernedEvidence.length === 0).map(r => r.rowId),
  governedQuotationOpportunityRows: SECTION_199_COHORT
    .filter(r => r.families.includes('GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY')).map(r => r.rowId),
  unsuppliedCitationOpportunityRows: SECTION_199_COHORT
    .filter(r => r.families.includes('UNSUPPLIED_CITATION_CONTAINMENT_OPPORTUNITY')).map(r => r.rowId),
  conjunctiveRows: SECTION_199_COHORT.filter(r => r.expectedOwedFacts.some(f => f.conjuncts.length > 1)).map(r => r.rowId),
  multiGapRows: SECTION_199_COHORT.filter(r => r.expectedGapCount.min >= 2).map(r => r.rowId),
} as const;

/**
 * The transport canary. §199's FIRST provider call.
 *
 * It must be a NON-GOVERNED row, because the first question is whether the remediated ORDINARY
 * first-pass request is accepted at all -- that is the request shape §197 could never get past the
 * transport, and it is ten of the twelve rows. Running a governed row first would confound the
 * transport question with the capability question.
 *
 * IT IS NOT DISPOSABLE. Whatever it returns is that row's real experimental result and is scored
 * like any other. A canary that is thrown away is a call spent proving the wire works and nothing
 * else.
 *
 * SF-01 is chosen because it is a reused, capability-absent, single-gap row with a preregistered
 * expected count of exactly one -- the least ambiguous row in the cohort, so a surprising canary
 * result is a signal about the pipeline rather than about the scenario.
 */
export const TRANSPORT_CANARY_ROW_ID = 'SF-01' as const;

export function cohortDesignDefects(): string[] {
  const d: string[] = [];
  const ids = new Set<string>();
  for (const r of SECTION_199_COHORT) {
    if (ids.has(r.rowId)) d.push(`DUPLICATE_ROW_ID:${r.rowId}`);
    ids.add(r.rowId);
    if (r.observation.trim().length < 120) d.push(`OBSERVATION_TOO_SHORT:${r.rowId}`);
    if (r.expectedGapCount.min > r.expectedGapCount.max) d.push(`GAP_RANGE_INVERTED:${r.rowId}`);
    if (r.expectedOwedFacts.length > r.expectedGapCount.max) d.push(`MORE_EXPECTED_FACTS_THAN_MAX:${r.rowId}`);
    if (r.expectedGapCount.max === 0 && r.expectedOwedFacts.length !== 0) {
      d.push(`NO_GAP_ROW_CARRIES_EXPECTED_FACTS:${r.rowId}`);
    }
    if (r.pairedWith !== null && !SECTION_199_COHORT.some(x => x.rowId === r.pairedWith)) {
      d.push(`PAIR_PARTNER_MISSING:${r.rowId}`);
    }
    for (const f of r.expectedOwedFacts) {
      for (const span of f.acceptableSpanRegions) {
        if (!r.observation.includes(span)) {
          d.push(`SPAN_REGION_NOT_VERBATIM:${r.rowId}:${JSON.stringify(span.slice(0, 40))}`);
        }
      }
      if (f.expectedDecisionDivergence.ifA.trim() === f.expectedDecisionDivergence.ifB.trim()) {
        d.push(`EXPECTED_DECISIONS_DO_NOT_DIVERGE:${r.rowId}`);
      }
      if (f.branchSemantics.aMustMean.trim() === f.branchSemantics.bMustMean.trim()) {
        d.push(`EXPECTED_BRANCHES_IDENTICAL:${r.rowId}`);
      }
      if (f.unacceptableNeighbouringProperties.length < 2) {
        d.push(`TOO_FEW_NEIGHBOURS:${r.rowId}:${f.factKeyIntent}`);
      }
    }
    // No observation may carry a citation-shaped string: the model could then copy one out of the
    // stimulus, and the refusal would be an artefact of our fixture rather than a behaviour.
    if (/\b\d{2}\s*CFR\s*\d+/i.test(r.observation)) d.push(`OBSERVATION_CARRIES_A_CITATION:${r.rowId}`);
    // A governed row must supply the SAME record to both surfaces, or the first-pass id would name
    // something the verifier was never given.
    if (r.verifierGovernedEvidence.length !== r.governedStandards.length) {
      d.push(`GOVERNED_SURFACES_DISAGREE:${r.rowId}`);
    }
    for (const g of r.verifierGovernedEvidence) {
      if (!r.governedStandards.some(s => s.approvedText === g.text)) {
        d.push(`GOVERNED_TEXT_NOT_SHOWN_TO_FIRST_PASS:${r.rowId}:${g.sourceId}`);
      }
    }
  }
  // Option 3 structure.
  const reused = SECTION_199_COHORT.filter(r => r.provenance === 'REUSED_BEHAVIORALLY_UNSPENT');
  const replaced = SECTION_199_COHORT.filter(r => r.provenance === 'REPLACED_PROTOCOL_EXPOSED');
  if (reused.length !== 10) d.push(`EXPECTED_TEN_REUSED_ROWS_GOT_${reused.length}`);
  if (replaced.length !== 2) d.push(`EXPECTED_TWO_REPLACEMENT_ROWS_GOT_${replaced.length}`);
  if (SECTION_199_COHORT.length !== 12) d.push(`EXPECTED_TWELVE_ROWS_GOT_${SECTION_199_COHORT.length}`);
  for (const id of REPLACED_SECTION_197_ROWS) {
    if (SECTION_199_COHORT.some(r => r.rowId === id)) d.push(`REPLACED_ROW_STILL_PRESENT:${id}`);
  }
  // Every reused row must be byte-identical to its §197 original. Imported by reference, so this
  // can only fail if someone edits the §197 module — which is exactly what it is here to catch.
  for (const r of reused) {
    const origin = SECTION_197_COHORT.find(x => x.rowId === r.section197Origin);
    if (!origin) { d.push(`REUSED_ROW_HAS_NO_SECTION197_ORIGIN:${r.rowId}`); continue; }
    if (origin.observation !== r.observation) d.push(`REUSED_OBSERVATION_DRIFTED:${r.rowId}`);
    if (JSON.stringify(origin.expectedOwedFacts) !== JSON.stringify(r.expectedOwedFacts)) {
      d.push(`REUSED_TRUTH_DRIFTED:${r.rowId}`);
    }
  }
  // The canary must be a reused, capability-absent row.
  const canary = SECTION_199_COHORT.find(r => r.rowId === TRANSPORT_CANARY_ROW_ID);
  if (!canary) d.push('CANARY_ROW_NOT_IN_COHORT');
  else {
    if (canary.verifierGovernedEvidence.length > 0) d.push('CANARY_ROW_IS_A_GOVERNED_ROW');
    if (canary.provenance !== 'REUSED_BEHAVIORALLY_UNSPENT') d.push('CANARY_ROW_IS_NOT_A_REUSED_ROW');
  }
  if (COHORT_COVERAGE.capabilityPresentRows.length !== 2) d.push('EXPECTED_TWO_CAPABILITY_PRESENT_ROWS');
  if (COHORT_COVERAGE.governedQuotationOpportunityRows.length < 1) d.push('NO_GOVERNED_QUOTATION_ROW');
  if (COHORT_COVERAGE.unsuppliedCitationOpportunityRows.length < 1) d.push('NO_CONTAINMENT_ROW');
  if (COHORT_COVERAGE.noGapRows < 3) d.push('FEWER_THAN_THREE_NO_GAP_ROWS');
  if (COHORT_COVERAGE.matchedPairs < 3) d.push('FEWER_THAN_THREE_MATCHED_PAIRS');
  if (COHORT_COVERAGE.multiGapRows.length < 1) d.push('NO_MULTI_GAP_ROW');
  return d;
}

export type { ScenarioFamily, ExpectedOwedFact, DeterministicFindingView };
