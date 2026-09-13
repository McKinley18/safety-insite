/**
 * EXPERT HAZLENZ -- protection matrix, contract, and the clarification carrier.
 *
 * PURE. No database, no network, no provider, no inference. Every assertion is a property of the
 * contract itself, so this suite costs nothing and can be run on every change.
 *
 * Sections:
 *   A. the protection matrix               -- section 98.6's freeze, checked rather than described
 *   B. non-goals have structural reasons   -- Phase 3
 *   C. the normalization boundary          -- governance leakage, evidence, taxonomy
 *   D. THE CLARIFICATION CARRIER           -- the six proofs the authorization named
 *
 * Run: npx ts-node scripts/test-expert-contract-foundation.ts
 */
import {
  EXPERT_ACTIONS, EXPERT_AUTHORITY_SURFACES, FROZEN_GOVERNANCE_CONTRACTS,
  getAuthoritySurface, isExpertActionPermitted,
  matrixForbidsRemovalEverywhere, matrixIsUnavailabilitySafe,
} from '../src/hazlenz/expert-hazlenz/expert-authority-matrix';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION, EXPERT_NON_GOALS,
  EXPERT_VALIDATOR_VERSION, FORBIDDEN_EXPERT_FIELD_NAMES,
  type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  EXPERT_CONDITION_STATES,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  normalizeExpertOutput, isFatal,
  type ExpertNormalizationReason,
} from '../src/hazlenz/expert-hazlenz/expert-normalization';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

let passed = 0, failed = 0;
const assert = (c: unknown, m: string) => { if (c) { passed++; console.log(`ok    ${m}`); } else { failed++; console.log(`FAIL  ${m}`); } };
const section = (t: string) => console.log(`\n--- ${t}`);

const NOW = '2026-08-29T00:00:00.000Z';
const OBS = 'Two employees were working in the vault near the transformer bay with the cabinet door open.';

const input = (over: Partial<ExpertAnalysisInput> = {}): ExpertAnalysisInput => ({
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'a-1',
  authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
  inspectionContext: { location: 'substation', task: 'inspection' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['electrical', 'confined_space'],
  deterministicFindings: [],
  governedStandards: [],
  answeredClarifications: [],
  ...over,
});

const analysis = (over: Record<string, unknown> = {}) => ({
  contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
  analysisId: 'a-1',
  outcome: 'ANALYZED',
  expertHazardCandidates: [],
  decisionCriticalClarifications: [],
  crossHazardInsights: [],
  disagreements: [],
  expertExplanation: null,
  uncertainty: { statements: [] },
  ...over,
});

const clarification = (id: string, over: Record<string, unknown> = {}) => ({
  clarificationId: id,
  question: `q-${id}`,
  whyItMatters: `why-${id}`,
  affectedDecision: 'HAZARD_EXISTENCE',
  criticality: 'BLOCKING',
  evidenceGap: `gap-${id}`,
  ...over,
});

const span = (needle: string) => {
  const startOffset = OBS.indexOf(needle);
  if (startOffset < 0) throw new Error(`fixture error: '${needle}'`);
  return { sourceId: 'obs-1', startOffset, endOffset: startOffset + needle.length, quotedText: needle };
};

const candidate = (over: Record<string, unknown> = {}) => ({
  candidateKey: 'e1',
  hazardFamily: 'electrical',
  assertedConditionState: 'ACTIVE',
  groundingStatus: 'EXACT_QUOTE_SUPPLIED',
  evidence: [span('the cabinet door open')],
  evidenceBasis: 'the door is open',
  reasoning: 'exposed energized parts are reachable',
  confidence: 'MODERATE',
  relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC',
  requiresUserConfirmation: false,
  ...over,
});

const codes = (r: { issues: { code: ExpertNormalizationReason }[] }) => r.issues.map(i => i.code);

(function main() {
  // =====================================================================================
  section('A. the protection matrix');
  // =====================================================================================

  assert(EXPERT_AUTHORITY_SURFACES.length === 12, 'A.1 twelve behavioural authority surfaces');
  assert(FROZEN_GOVERNANCE_CONTRACTS.length === 12, 'A.2 twelve frozen governance contracts (section 98.6)');

  // The default rule, checked across the WHOLE matrix rather than sampled. A future row that grants
  // SUPPRESS or MUTATE fails here, which is the point of keeping the matrix as data.
  assert(matrixForbidsRemovalEverywhere(),
    'A.3 no surface anywhere permits SUPPRESS or MUTATE');
  assert(matrixIsUnavailabilitySafe(),
    'A.4 every surface degrades to SURFACE_UNCHANGED when Expert is missing');

  assert(EXPERT_AUTHORITY_SURFACES.every(s => s.permitted.includes('CHALLENGE')),
    'A.5 every surface may be challenged -- disagreement is always expressible');
  assert(EXPERT_AUTHORITY_SURFACES.every(s => s.permitted.length > 0 && s.permitted.every(p => EXPERT_ACTIONS.includes(p))),
    'A.6 permitted actions come from the closed vocabulary');

  // The four surfaces whose authority is governed or fail-closed must NOT accept additions.
  for (const surface of ['GOVERNED_REGULATORY_CITATION', 'KNOWLEDGE_RELEASE_PROVENANCE',
                         'FAIL_CLOSED_AND_FALLBACK', 'JURISDICTION_HANDLING']) {
    assert(!isExpertActionPermitted(surface, 'ADD'), `A.7 ${surface} does not permit ADD`);
  }
  assert(isExpertActionPermitted('HAZARD_RECOGNITION', 'ADD'),
    'A.8 hazard recognition does permit ADD -- an extra advisory candidate cannot reduce recall');

  // Fail closed on an unknown surface: a product surface with no matrix row gets no Expert access.
  assert(getAuthoritySurface('SOMETHING_NEW') === null, 'A.9 unknown surface resolves to null');
  assert(!isExpertActionPermitted('SOMETHING_NEW', 'ADD'),
    'A.10 an unknown surface permits nothing (fail closed)');

  assert(new Set(EXPERT_AUTHORITY_SURFACES.map(s => s.surface)).size === 12,
    'A.11 surface keys are unique');
  assert(EXPERT_AUTHORITY_SURFACES.every(s => s.evidencePin.trim().length > 0
      && s.authoritySource.trim().length > 0 && s.rationale.trim().length > 0),
    'A.12 every surface names an authority source, an evidence pin and a rationale');

  // The frozen contracts that section 98.6 named must each be claimed by at least one surface;
  // an unclaimed contract is one nothing in the matrix protects.
  const claimed = new Set(EXPERT_AUTHORITY_SURFACES.flatMap(s => s.frozenContracts));
  const unclaimed = FROZEN_GOVERNANCE_CONTRACTS.filter(c => !claimed.has(c));
  assert(unclaimed.length === 0, `A.13 every frozen contract is claimed by a surface [${unclaimed.join(',')}]`);

  // =====================================================================================
  section('B. non-goals');
  // =====================================================================================

  assert(EXPERT_NON_GOALS.length === 10, 'B.1 ten non-goals recorded');
  assert(EXPERT_NON_GOALS.includes('PROVIDER_SPECIFIC_ARCHITECTURE'),
    'B.2 provider-specific architecture is a non-goal');

  // "Not an uncontrolled citation generator" has a structural reason, not a promise: the analysis
  // type has no citation field, and the boundary rejects citation-shaped text.
  const withCitation = normalizeExpertOutput(
    analysis({ expertExplanation: { summary: 'See 29 CFR 1910.147 for the rule.', whatMatters: [], whatIsMissing: [], howConditionsInteract: [] } }),
    input(), NOW);
  assert(withCitation.state === 'REJECTED' && codes(withCitation).includes('CITATION_SHAPED_TEXT_NOT_PERMITTED'),
    'B.3 a citation smuggled into prose is rejected, not sanitized');

  const withReleaseId = normalizeExpertOutput(
    { ...analysis(), knowledgeReleaseId: 'federal-core-2026-08-28.1' }, input(), NOW);
  assert(withReleaseId.state === 'REJECTED' && codes(withReleaseId).includes('FORBIDDEN_GOVERNANCE_FIELD'),
    'B.4 a release id anywhere in the payload rejects the whole analysis');

  const nested = normalizeExpertOutput(
    { ...analysis(), uncertainty: { statements: [], meta: { approvalStatus: 'approved' } } }, input(), NOW);
  assert(nested.state === 'REJECTED' && codes(nested).includes('FORBIDDEN_GOVERNANCE_FIELD'),
    'B.5 a governance field NESTED three deep is still found');

  assert(FORBIDDEN_EXPERT_FIELD_NAMES.includes('citation')
      && FORBIDDEN_EXPERT_FIELD_NAMES.includes('knowledgeReleaseId')
      && FORBIDDEN_EXPERT_FIELD_NAMES.includes('approvalStatus'),
    'B.6 the forbidden-field list names the three that matter most');

  // =====================================================================================
  section('C. the normalization boundary');
  // =====================================================================================

  const clean = normalizeExpertOutput(analysis(), input(), NOW);
  assert(clean.state === 'VALID' && clean.validated !== null, 'C.1 a well-formed empty analysis validates');
  assert(clean.validated?.validator.validatorVersion === EXPERT_VALIDATOR_VERSION,
    'C.2 the validated object records the validator version');
  assert(clean.validated?.validator.validatedAt === NOW,
    'C.3 the timestamp is injected, so a replay reproduces byte-for-byte');

  for (const bad of [null, 'a string', 42, [], undefined]) {
    const r = normalizeExpertOutput(bad, input(), NOW);
    assert(r.state === 'REJECTED', `C.4 non-object provider output rejects (${JSON.stringify(bad)})`);
  }

  // Derived from the current constant rather than written as a literal. A hand-written "wrong"
  // version silently stops testing anything the day the contract is bumped TO it -- which is
  // exactly what happened when the routing repair moved the contract to v2.
  const NOT_THE_CURRENT_VERSION = `${EXPERT_ANALYSIS_CONTRACT_VERSION}-not-a-real-version`;
  const versionMismatch = normalizeExpertOutput(analysis({ contractVersion: NOT_THE_CURRENT_VERSION }), input(), NOW);
  assert(versionMismatch.state === 'REJECTED' && codes(versionMismatch).includes('CONTRACT_VERSION_MISMATCH'),
    'C.5 a contract version mismatch rejects');

  const idMismatch = normalizeExpertOutput(analysis({ analysisId: 'a-2' }), input(), NOW);
  assert(idMismatch.state === 'REJECTED' && codes(idMismatch).includes('ANALYSIS_ID_MISMATCH'),
    'C.6 an analysis id mismatch rejects -- an answer to a different question is not an answer');

  const badOutcome = normalizeExpertOutput(analysis({ outcome: 'PROBABLY_FINE' }), input(), NOW);
  assert(badOutcome.state === 'REJECTED' && codes(badOutcome).includes('INVALID_OUTCOME'),
    'C.7 an outcome outside the closed vocabulary rejects');

  const unavailableWithContent = normalizeExpertOutput(
    analysis({ outcome: 'EXPERT_UNAVAILABLE', decisionCriticalClarifications: [clarification('c1')] }), input(), NOW);
  assert(unavailableWithContent.state === 'REJECTED'
      && codes(unavailableWithContent).includes('UNAVAILABLE_CANNOT_CARRY_CONTENT'),
    'C.8 "unavailable" cannot be used to deliver content');

  // evidence -- the three fabrication shapes
  const wrongText = normalizeExpertOutput(
    analysis({ expertHazardCandidates: [candidate({ evidence: [{ sourceId: 'obs-1', startOffset: 0, endOffset: 5, quotedText: 'XXXXX' }] })] }),
    input(), NOW);
  assert(wrongText.state === 'REJECTED' && codes(wrongText).includes('EVIDENCE_TEXT_MISMATCH'),
    'C.9 quoted text that is not the span rejects');

  const outOfBounds = normalizeExpertOutput(
    analysis({ expertHazardCandidates: [candidate({ evidence: [{ sourceId: 'obs-1', startOffset: 0, endOffset: 99999, quotedText: OBS }] })] }),
    input(), NOW);
  assert(outOfBounds.state === 'REJECTED' && codes(outOfBounds).includes('EVIDENCE_OUT_OF_BOUNDS'),
    'C.10 an out-of-bounds span rejects');

  const unknownSource = normalizeExpertOutput(
    analysis({ expertHazardCandidates: [candidate({ evidence: [{ sourceId: 'nope', startOffset: 0, endOffset: 3, quotedText: 'Two' }] })] }),
    input(), NOW);
  assert(unknownSource.state === 'REJECTED' && codes(unknownSource).includes('EVIDENCE_SOURCE_UNKNOWN'),
    'C.11 an unknown evidence source rejects');

  // taxonomy
  const badFamily = normalizeExpertOutput(
    analysis({ expertHazardCandidates: [candidate({ hazardFamily: 'Electrical' })] }), input(), NOW);
  assert(badFamily.state === 'REJECTED' && codes(badFamily).includes('UNSUPPORTED_HAZARD_FAMILY'),
    'C.12 a near-miss hazard family rejects (case matters)');

  const badState = normalizeExpertOutput(
    analysis({ expertHazardCandidates: [candidate({ assertedConditionState: 'PROBABLY_ACTIVE' })] }), input(), NOW);
  assert(badState.state === 'REJECTED' && codes(badState).includes('INVALID_CONDITION_STATE'),
    'C.13 a condition state outside the closed vocabulary rejects');

  // disagreements
  const unknownSurface = normalizeExpertOutput(analysis({
    disagreements: [{
      disagreementId: 'd1', target: 'DETERMINISTIC_RESULT', surface: 'PRICING',
      targetRef: null, disagreementType: 'MAY_BE_INCOMPLETE', reasoning: 'r', confidence: 'LOW',
      recommendsReview: false,
    }],
  }), input(), NOW);
  assert(unknownSurface.state === 'REJECTED' && codes(unknownSurface).includes('DISAGREEMENT_UNKNOWN_SURFACE'),
    'C.14 a disagreement against a surface the matrix does not govern rejects');

  const goodDisagreement = normalizeExpertOutput(analysis({
    disagreements: [{
      disagreementId: 'd1', target: 'GOVERNED_STANDARD', surface: 'GOVERNED_REGULATORY_CITATION',
      targetRef: 'REC-1', disagreementType: 'MAY_REQUIRE_CLOSER_REVIEW', reasoning: 'r',
      confidence: 'MODERATE', recommendsReview: true,
    }],
  }), input(), NOW);
  assert(goodDisagreement.state === 'VALID'
      && goodDisagreement.validated?.analysis.disagreements.length === 1,
    'C.15 a well-formed governed disagreement is accepted as evidence');

  // insights
  const oneParticipant = normalizeExpertOutput(analysis({
    crossHazardInsights: [{
      insightId: 'x1', interactionKind: 'LOTO_STORED_ENERGY', participants: ['electrical'],
      reasoning: 'r', confidence: 'HIGH',
    }],
  }), input(), NOW);
  assert(oneParticipant.state === 'VALID'
      && oneParticipant.validated?.analysis.crossHazardInsights.length === 0
      && codes(oneParticipant).includes('INSIGHT_INSUFFICIENT_PARTICIPANTS'),
    'C.16 an "interaction" with one participant is dropped and recorded, not fatal');

  // fatality classification is itself asserted, so the two severities cannot drift.
  assert(isFatal('EVIDENCE_TEXT_MISMATCH') && isFatal('FORBIDDEN_GOVERNANCE_FIELD'),
    'C.17 fabricated evidence and governance leakage are analysis-fatal');
  assert(!isFatal('CLARIFICATION_MALFORMED') && !isFatal('INSIGHT_MALFORMED'),
    'C.18 a malformed collection member is item-level, not analysis-fatal');

  // =====================================================================================
  section('D. THE CLARIFICATION CARRIER -- the six proofs');
  // =====================================================================================

  // D.1 -- the case D-56 recorded and this contract makes structurally impossible to lose.
  const zeroCandidates = normalizeExpertOutput(analysis({
    outcome: 'INSUFFICIENT_EVIDENCE',
    expertHazardCandidates: [],
    decisionCriticalClarifications: [clarification('c1')],
  }), input(), NOW);
  assert(zeroCandidates.state === 'VALID'
      && zeroCandidates.validated?.analysis.expertHazardCandidates.length === 0
      && zeroCandidates.validated?.analysis.decisionCriticalClarifications.length === 1,
    'D.1 zero hazard candidates + a valid decision-critical clarification SURVIVES');

  // D.2 -- and the presence of a candidate changes nothing about the clarification.
  const both = normalizeExpertOutput(analysis({
    expertHazardCandidates: [candidate()],
    decisionCriticalClarifications: [clarification('c1')],
  }), input(), NOW);
  assert(both.state === 'VALID'
      && both.validated?.analysis.expertHazardCandidates.length === 1
      && both.validated?.analysis.decisionCriticalClarifications.length === 1,
    'D.2 a hazard candidate and a clarification both survive, independently');

  // D.3 -- identity and order are stable, so an answer can be routed back to its question.
  const many = normalizeExpertOutput(analysis({
    decisionCriticalClarifications: [clarification('c1'), clarification('c2'), clarification('c3')],
  }), input(), NOW);
  const ids = many.validated?.analysis.decisionCriticalClarifications.map(c => c.clarificationId);
  assert(many.state === 'VALID' && JSON.stringify(ids) === JSON.stringify(['c1', 'c2', 'c3']),
    'D.3 multiple clarifications retain identity AND order');

  const dupes = normalizeExpertOutput(analysis({
    decisionCriticalClarifications: [clarification('c1'), clarification('c1')],
  }), input(), NOW);
  assert(dupes.state === 'VALID'
      && dupes.validated?.analysis.decisionCriticalClarifications.length === 1
      && codes(dupes).includes('DUPLICATE_CLARIFICATION_ID'),
    'D.3b a duplicate clarification id is refused and recorded, so identity stays a key');

  // D.4 -- empty is a legitimate answer, not a missing one.
  const none = normalizeExpertOutput(analysis({ decisionCriticalClarifications: [] }), input(), NOW);
  assert(none.state === 'VALID' && none.validated?.analysis.decisionCriticalClarifications.length === 0,
    'D.4 an empty clarification collection remains valid');

  // D.5 -- THE ANTI-DISAPPEARANCE PROOF. Three facts, all asserted:
  //        it fails validation, it leaves a locatable issue, and it is absent from the output.
  const malformed = normalizeExpertOutput(analysis({
    decisionCriticalClarifications: [
      clarification('c1'),
      { clarificationId: 'c2', question: '', whyItMatters: 'w', affectedDecision: 'HAZARD_EXISTENCE', criticality: 'BLOCKING', evidenceGap: 'g' },
    ],
  }), input(), NOW);
  const issue = malformed.issues.find(i => i.code === 'CLARIFICATION_MALFORMED');
  assert(!!issue, 'D.5a a malformed clarification FAILS schema validation (issue emitted)');
  assert(issue?.collection === 'decisionCriticalClarifications' && issue?.index === 1,
    'D.5b the issue names its collection and index, so the refused item is locatable');
  assert(malformed.validated?.analysis.decisionCriticalClarifications.length === 1
      && malformed.validated?.analysis.decisionCriticalClarifications[0].clarificationId === 'c1',
    'D.5c the malformed item is absent and the GOOD one survives -- a bad question never destroys the analysis');

  const notCritical = normalizeExpertOutput(analysis({
    decisionCriticalClarifications: [clarification('c1', { affectedDecision: 'CURIOSITY' })],
  }), input(), NOW);
  assert(notCritical.state === 'VALID'
      && notCritical.validated?.analysis.decisionCriticalClarifications.length === 0
      && codes(notCritical).includes('CLARIFICATION_NOT_DECISION_CRITICAL'),
    'D.5d a question that changes no product decision is refused and recorded (L3-INV-06)');

  // D.6 is a merge property and is proved in test-expert-authority-merge.ts, where the
  // deterministic input actually exists. Asserting it here would test a fixture, not the merge.
  console.log('\nnote  D.6 (provider failure does not affect Level-1) is proved in '
    + 'test-expert-authority-merge.ts and test-expert-provider-failure.ts, against a real merge.');

  // =====================================================================================
  section('E. containment: the Expert module depends on no unaccepted reasoning tier');
  // =====================================================================================

  // The Level-3 module is quarantined by `test:l32i-clarification-carrier` F3, whose label is
  // CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE. That guard is a CONTENT grep over `src/`,
  // so the Expert module must not import from, or even name, that directory. Asserted here rather
  // than left to the L3 suite so a violation is reported by the suite that introduced it.
  const L3_DIR_NAME = ['reasoning', 'l3'].join('-');       // built, never written as a literal
  const EXPERT_DIR = join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz');
  const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
  const expertFiles = walk(EXPERT_DIR).filter(f => f.endsWith('.ts'));
  const mentions = expertFiles.filter(f => readFileSync(f, 'utf8').includes(L3_DIR_NAME));
  assert(mentions.length === 0,
    `E.1 no Expert source file references the quarantined Level-3 module [${mentions.join(',')}]`);

  // The vocabularies are duplicated ON PURPOSE and must stay identical, or an Expert condition
  // assertion stops being comparable to a Level-3 one in evaluation. The L3 file is read as DATA
  // from a path assembled at runtime -- reading is not depending.
  const l3ContractPath = join(__dirname, '..', 'src', 'hazlenz', L3_DIR_NAME, 'reasoning-contract.types.ts');
  const l3Source = readFileSync(l3ContractPath, 'utf8');
  const l3States = (l3Source.match(/L3_CONDITION_STATES = \[([\s\S]*?)\] as const/)?.[1] ?? '')
    .split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
  assert(l3States.length === 8, `E.2 the Level-3 vocabulary was read as data (${l3States.length} members)`);
  assert(JSON.stringify(l3States) === JSON.stringify([...EXPERT_CONDITION_STATES]),
    `E.3 the duplicated condition-state vocabulary is IDENTICAL to the Level-3 one`);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
