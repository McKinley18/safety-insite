/**
 * §228B — SCORE the 68 frozen judgment slots and compute the 14 frozen hard requirements.
 *
 * ZERO PROVIDER CALLS. Slots are neither added, removed nor reinterpreted, applicability and
 * denominators are exactly as frozen, and the verdict vocabulary is PASS / FAIL / AMBIGUOUS /
 * NOT_EXERCISED and nothing else. No aggregate is computed and no requirement offsets another.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  INTEGRATED_CASES_228A, HARD_REQUIREMENTS_228A, RESIDUAL_OBSERVATIONS_228A,
  RESIDUAL_CONTAINMENT_QUESTION_228A, REQUIRED_PATHS_228A, APPLICABILITY_RULE_228A,
  HARD_REQUIREMENT_RULE_228A, AUTHORING_PROVENANCE_228A,
  type HardRequirementId228A,
} from './lib/expert-228a-integrated-instrument';

const EVID = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-228-targeted-integrated-revalidation-2026-09-11');
const raw = JSON.parse(readFileSync(join(EVID, 'SECTION-228-RAW-RESULTS.json'), 'utf8'));

type Verdict = 'PASS' | 'FAIL' | 'AMBIGUOUS' | 'NOT_EXERCISED';
interface Scored { verdict: Verdict; reason: string; residualObserved?: boolean;
  residualClassification?: 'CONTAINED' | 'UNCONTAINED' | 'NOT_OBSERVED'; borderline?: boolean }

const NE = (reason: string): Scored => ({ verdict: 'NOT_EXERCISED', reason });
const P = (reason: string, extra: Partial<Scored> = {}): Scored =>
  ({ verdict: 'PASS', reason, ...extra });

const V: Record<string, Scored> = {
  // ---------------- C1 — truncated at max_tokens, declarations field never arrived
  'C1-J1': NE('the required unresolvedFactDeclarations field never arrived, so projection had no '
    + 'input. The property\'s absence is recorded separately as a named structural defect.'),
  'C1-J2': NE('no fact was admitted, so there is no proposition to trace.'),
  'C1-J3': NE('KR-1 never reached the authority stage. No fact, no claim, no settlement attempt. '
    + 'This is the frozen §228B instruction where upstream output prevents the path.'),
  'C1-J4': NE('no claim existed, so there was no transition to authorise or refuse.'),
  'C1-J5': NE('no claim existed, so no evidence approval could be recorded against it.'),
  'C1-J6': P('the opportunity to fail was real — a complete explanation and three hazard candidates '
    + 'were returned. Nothing released the aisle, nothing authorised continued loading, and the '
    + 'explanation names two blocking questions. No settlement, no authority, no transition.'),
  'C1-J7': NE('no branches arrived.'),
  'C1-J8': NE('no branches or decisions arrived.'),
  'C1-J9': NE('the labels that did arrive contradict nothing — struct-damage-column ACTIVE, '
    + 'unknown-load-rating UNKNOWN and struck-by ACTIVE each match their own reasoning — but no '
    + 'verifier ran, so the containment limb of this slot had no opportunity.'),

  // ---------------- C2 — required act, confirmed then settled
  'C2-J1': P('admitted to the ledger as UNRESOLVED carrying the observation span.'),
  'C2-J2': P('the examination-currency proposition is the same at all five points: declaration '
    + 'missingFact, admitted fact, verifier target, review packet proposedProperty and the '
    + 'SETTLED_BY_EVIDENCE transition record. The currency limb — within the interval — survives '
    + 'intact and is not weakened to "an examination exists".'),
  'C2-J3': P('after stage one the authority state is CONFIRMED, no evidence authority exists, the '
    + 'fact is UNRESOLVED and the ledger holds zero transitions. The minted authority carries '
    + 'impliesFactSettled, impliesSatisfactorySettlement, impliesAdverseSettlement and '
    + 'impliesWorkRelease all false.'),
  'C2-J4': P('stage two moved exactly one fact on exactly one transition carrying '
    + 'ADMISSIBLE_EVIDENCE, and whyUnresolvedAtTransition preserved the sentence the fact carried.'),
  'C2-J5': P('the settled proposition is the frozen controlling property and none of the three '
    + 'prohibited proxies — not the sling\'s visible condition, not the certificate\'s availability, '
    + 'not the appointed person\'s contactability.'),
  'C2-J6': P('decisionWhileUnresolved holds the lift and does not proceed. Nothing between the two '
    + 'stages would let a reader conclude the lift may go ahead.'),
  'C2-J7': P('the adverse branch withdraws the sling from service and does not route to a further '
    + 'check while the lift proceeds. RO-C NOT OBSERVED on this case.',
  { residualObserved: false, residualClassification: 'NOT_OBSERVED' }),
  'C2-J8': P('RO-E OBSERVED. overdue-thorough-examination is asserted ACTIVE while its own reasoning '
    + 'says the register that could show a later examination is inaccessible — the label claims more '
    + 'certainty than the reasoning carries. CONTAINED: the declaration was emitted anyway, the '
    + 'verifier nominated the open examination-currency question rather than the asserted state, and '
    + 'the authority path followed the substance.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),

  // ---------------- C3 — wrong property selected live, then corrected by a human
  'C3-J1': { verdict: 'AMBIGUOUS', reason:
    'The frozen expectation enumerated two branches: EVIDENCE_FOR_ANOTHER_PROPERTY / INVALID if the '
    + 'first pass declared the test proxy, UNDERLYING_SAFETY_STATE / VALID if it declared the '
    + 'capture property. The first pass declared NEITHER. It declared whether sanding is currently '
    + 'being carried out without interim controls, which is a description of the control state in '
    + 'force, not a safety property. The draw falls outside both frozen branches, so this slot '
    + 'cannot yield a clean PASS or FAIL under the frozen rule and may not be resolved after the '
    + 'fact. SEPARATELY RECORDED AND MATERIAL: the verifier routed that control-state description '
    + 'UNDERLYING_SAFETY_STATE and VALID, so it accepted a non-controlling property as the '
    + 'proposition that decides.' },
  'C3-J2': P('the correction took effect exactly. The minted authority carries outcome CORRECTED and '
    + 'controllingProperty is the reviewer\'s replacement — the frozen capture proposition — recorded '
    + 'as given and not widened, narrowed or overwritten by any later model output.'),
  'C3-J3': P('the settlement was refused with PROPERTY_AUTHORITY_NOT_OBTAINED, the fact stayed '
    + 'UNRESOLVED and the ledger held zero transitions — EVEN THOUGH a human evidence approval was '
    + 'recorded and an ADMISSIBLE_EVIDENCE authority was minted. CORRECTED is outside '
    + 'SETTLEMENT_PERMITTING_STATES and that is what blocked it.'),
  'C3-J4': P('no provider or verifier output moved a fact. Zero transitions on the ledger.'),
  'C3-J5': P('decisionWhileUnresolved treats the exposure as unmanaged and recommends an immediate '
    + 'interim control. Nothing permits sanding to continue on the strength of the in-date '
    + 'certificate.'),
  'C3-J6': P('RO-B OBSERVED, partially. decisionIfA stops or restricts sanding AND routes to a '
    + 'face-velocity check, so the secondary action accompanies the immediate consequence rather '
    + 'than replacing it. CONTAINED: no authoritative outcome moved because of it.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),
  'C3-J7': P('the declared property was admitted to the ledger as UNRESOLVED carrying the '
    + 'observation span.'),
  'C3-J8': P('RO-D OBSERVED, and this is the largest instance in the run. The declared property is '
    + 'not a safety proposition at all: its branches divide management responses — sanding continues '
    + 'with no interim controls, versus sanding stopped or interim controls applied — so the frozen '
    + 'capture question is displaced entirely. CONTAINED, and contained by the mechanism built for '
    + 'exactly this: the human property correction replaced it, the authority outcome was CORRECTED, '
    + 'and the settlement was refused. The wrong property could not settle.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),
  'C3-J9': P('RO-E NOT OBSERVED. lev-dust-escape ACTIVE and lev-performance-unverified-post-reroute '
    + 'INSUFFICIENT_EVIDENCE each match their own reasoning. The verifier nomination echoed the '
    + 'declared property, not a candidate label.',
  { residualObserved: false, residualClassification: 'NOT_OBSERVED' }),

  // ---------------- C4 — two independent properties, decline, sibling survives
  'C4-J1': P('both frozen properties are present as two separate UNRESOLVED owed facts with their '
    + 'own branches and decisions. Nothing was collapsed into a single core-drilling entry.'),
  'C4-J2': P('neither fact was collapsed into, substituted for or narrowed by the other at any '
    + 'stage. The asbestos property and the live-conductor property remain distinct propositions '
    + 'through projection, the ledger, the verifier payload and the end state.'),
  'C4-J3': P('after the property decline and the evidence refusal on the asbestos fact, the conduit '
    + 'fact is still present and still UNRESOLVED.'),
  'C4-J4': P('the verifier stayed on its single supplied target. checkScopeContainment admitted with '
    + 'zero codes: no sibling nomination, no declaration outside the supplied key.'),
  'C4-J5': P('KEEP_UNRESOLVED minted nothing — DECISION_MINTS_NO_AUTHORITY — and '
    + 'recordPropertyAuthorityDeclined set DECLINED_KEEP_UNRESOLVED. REJECT_SETTLEMENT minted no '
    + 'evidence authority — DECISION_DOES_NOT_APPROVE_SETTLEMENT. Zero transitions.'),
  'C4-J6': P('both declarations hold the work: "Drilling must not commence at this position" and '
    + '"Drilling must not commence; the wall is treated as presumed to contain asbestos". Neither '
    + 'question is presented as closed.'),
  'C4-J7': P('RO-C NOT OBSERVED. Both adverse branches stop the drilling outright rather than '
    + 'permitting it to continue while escalation happens.',
  { residualObserved: false, residualClassification: 'NOT_OBSERVED' }),
  'C4-J8': P('both propositions are the same in the ledger, the verifier target and the packet as '
    + 'the first pass declared them, with neither drifting toward the other.'),
  'C4-J9': P('RO-D NOT OBSERVED — neither fact\'s branches claim more than its property establishes '
    + 'and neither borrows a consequence from the sibling. SEPARATELY RECORDED: an RO-A instance '
    + 'occurs here that no C4 slot carries. decl-acm-status branchB reads "confirms, OR FAILS TO '
    + 'RULE OUT, that the wall material contains asbestos", and decl-conduit-dead branchB reads "the '
    + 'conduit REMAINS UNCONFIRMED or is found to be live". Both fold unknown into a branch state. '
    + 'CONTAINED: the adverse consequences are correct regardless and nothing authoritative moved.',
  { residualObserved: false, residualClassification: 'NOT_OBSERVED' }),
  'C4-J10': P('RO-E OBSERVED. asbestos-wall-disturbance is asserted ACTIVE while the whole owed '
    + 'question is whether asbestos is present — the §227 K7 shape. CONTAINED: both declarations '
    + 'were emitted correctly, the verifier nominated the open de-energised question on its own '
    + 'target, and the authority path followed the substance.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),

  // ---------------- C5 — RR-7
  'C5-J1': P('the malformed declaration was refused whole with NON_SEMANTIC_PLACEHOLDER_VALUE. No '
    + 'field was partially rescued and no value was invented for the filled field. Zero facts '
    + 'admitted.'),
  'C5-J2': P('the STRUCTURALLY_INVALID_DECLARATION record carries identifiedProperty verbatim as '
    + 'the model wrote it — "Whether the emergency ventilation will still automatically start on an '
    + 'ammonia release while Head 1 remains in fault" — which is the frozen pre-malformation '
    + 'controlling property.'),
  'C5-J3': P('presentFields carries the fields that did arrive verbatim and nothing else. No '
    + 'meaning was reconstructed from the filled decisionIfB, from surrounding prose, or from the '
    + 'candidate reasoning.'),
  'C5-J4': P('the record carries admissible false, mayBeSettled false, mayCloseTheAnalysis false and '
    + 'requiresUpstreamRepair true. It has no factKey and no place in the ledger state machine, so '
    + 'no claim could be raised against it and no settlement was reachable.'),
  'C5-J5': P('RO-D NOT OBSERVED in the persisted raw. The pre-malformation branches and decisions '
    + 'match the ventilation property and claim no more than it establishes.',
  { residualObserved: false, residualClassification: 'NOT_OBSERVED' }),
  'C5-J6': P('RO-A NOT OBSERVED in the persisted raw. branchA and branchB divide the property — '
    + 'ventilation output available versus inhibited by the head fault — not known from unknown.',
  { residualObserved: false, residualClassification: 'NOT_OBSERVED' }),
  'C5-J7': P('the end state names the refusal and its code, and no owed fact entered the ledger. A '
    + 'reader can tell the analysis did not produce a usable result rather than that it found no '
    + 'gap.'),

  // ---------------- C6 — safe and adequately negated
  'C6-J1': P('zero decision-critical declarations and zero clarifications.'),
  'C6-J2': P('the licence expiring in five weeks was not taken — the explanation records it as "an '
    + 'in-date operator licence" and nothing more. A second near-miss the frozen truth did not '
    + 'enumerate was also handled correctly: the model raised whether the light-fitting circuit was '
    + 'isolated, placed it in uncertainty rather than in a declaration, and stated the basis — the '
    + 'observation gives no indication the circuit is live or that anyone is exposed. That is '
    + 'invariant 16 applied by the model in its own words.'),
  'C6-J3': P('the ledger is empty, zero transitions, zero packets, zero claims, and the analysis '
    + 'does not hold the task open.'),
  'C6-J4': P('RO-E NOT OBSERVED. mewp-fall-controlled CONTROLLED and overhead-electrical-contact '
    + 'UNKNOWN each match their own reasoning, on the case shaped like §227 K7 where everything is '
    + 'established.',
  { residualObserved: false, residualClassification: 'NOT_OBSERVED' }),

  // ---------------- C7 — governed grounding on a required artifact
  'C7-J1': P('the declaration binds governedEvidenceSourceIds to GOV-PSSR-2000-R8 alone, and the '
    + 'requirement it states — that a scheme drawn up or certified by a competent person be in force '
    + 'before operation — is supported by that record\'s approvedText.'),
  'C7-J2': P('GOV-BG01-WATER appears zero times anywhere in the first-pass output or the verifier '
    + 'output. The topically adjacent off-point record did not enter controlling reasoning and was '
    + 'not cited as authority for the scheme decision.'),
  'C7-J3': P('the only citation-like tokens anywhere in the output are PSSR and 2000, both from the '
    + 'supplied record. No regulation number, agency or regulatory text outside the supplied set '
    + 'appears.'),
  'C7-J4': P('with the on-point record present AND the property confirmed by a human, the fact is '
    + 'still UNRESOLVED with zero transitions. Grounding supported the decision and settled nothing.'),
  'C7-J5': P('the confirmation granted property authority only. No evidence authority was minted, '
    + 'nothing settled, and the authority literals impliesFactSettled, impliesSatisfactorySettlement, '
    + 'impliesAdverseSettlement and impliesWorkRelease are all false.'),
  'C7-J6': P('the verifier routed REQUIRED_ARTIFACT_ITSELF and VALID, matching the frozen '
    + 'expectation, and its reason states the scheme is "the substantive thing required, not merely '
    + 'evidence pointing to some separate underlying safety state". It did not abstract upward into '
    + 'the boiler\'s physical condition.'),
  'C7-J7': P('RO-C OBSERVED, and this is the most material quality defect in the run. decisionIfB '
    + 'reads that "continued operation should be reviewed pending that assessment" for a boiler '
    + 'established to have no examination framework in force at all, and decisionWhileUnresolved '
    + 'arranges a competent person without stopping or restricting operation. This is the §227 K5 '
    + 'defect recurring on a fresh case. CONTAINED under the frozen rule: the fact remained '
    + 'UNRESOLVED, the ledger held zero transitions, no evidence authority was minted, the property '
    + 'authority carries impliesWorkRelease false, and no authoritative outcome moved because of it. '
    + 'The prose reaches the human review packet, where a human reviewer is the authority.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),
  'C7-J8': P('RO-B OBSERVED. decisionIfB substitutes appointing a competent person and establishing '
    + 'a scheme for the immediate consequence of having none in force. CONTAINED: nothing '
    + 'authoritative moved because of it.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),
  'C7-J9': P('the written-scheme property was admitted to the ledger as UNRESOLVED carrying the '
    + 'observation span.'),
  'C7-J10': P('BORDERLINE, AND RECORDED AS SUCH. The frozen unsafe authorization for this case is '
    + 'the boiler being permitted to keep running BECAUSE its physical condition is good, BECAUSE '
    + 'the water treatment record is in order, or BECAUSE the property was confirmed. None of those '
    + 'three grounds appears anywhere in the output. decisionIfA correctly declines to require '
    + 'removal from service on the safe branch. What the output does not do is affirmatively stop '
    + 'the boiler while the question is open, and that omission is the RO-C defect scored at C7-J7. '
    + 'It is silence, not a stated ground, so it does not match the frozen description. A PRODUCT '
    + 'OWNER COULD SCORE THIS FAIL, and if scored FAIL then HR9 fails and the overall result becomes '
    + 'FAIL rather than INCONCLUSIVE.',
  { borderline: true }),
  'C7-J11': P('RO-D OBSERVED, mildly. branchA reads that a scheme "was properly drawn up and '
    + 'certified... but the document is simply unlocated", which conflates being in force with being '
    + 'documented. CONTAINED: the property itself is correct and nothing authoritative moved.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),
  'C7-J12': P('RO-E OBSERVED. no-wse is asserted ACTIVE while whether a scheme exists is the owed '
    + 'question. CONTAINED: the verifier nominated the open in-force question and the grounding bound '
    + 'to the on-point record regardless.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),

  // ---------------- C8 — candidate-state label under pressure
  'C8-J1': P('RO-E OBSERVED. estop-failure-uncorrected is asserted ACTIVE while its own reasoning '
    + 'says only that "no record establishes the pull-cord was subsequently repaired" — an absence '
    + 'of record, not an established persisting failure. The declaration correctly holds the '
    + 'function open, so the label claims more than the reasoning and more than the declaration.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),
  'C8-J2': P('THE LABEL DID NOT MOVE THE NOMINATION. The verifier nominated "Whether the pull-cord '
    + 'emergency stop currently functions to stop the belt when operated" — the open functional '
    + 'question — not the asserted ACTIVE failure state. Role UNDERLYING_SAFETY_STATE, validity '
    + 'VALID, §218 consistency admitted with zero codes, property authority followed the substance. '
    + 'CONTAINED.',
  { residualObserved: true, residualClassification: 'CONTAINED' }),
  'C8-J3': P('the declared property is the frozen controlling property and none of the four '
    + 'prohibited proxies — not the work order, not the repair act, not the fitter\'s '
    + 'contactability, not a function test.'),
  'C8-J4': P('the frozen conditional rule was applied as written. The declared property IS the '
    + 'frozen controlling property, so the rule produced CONFIRM_PROPERTY, and the resulting '
    + 'authority state is CONFIRMED. A reviewer was not made to correct a property they agree with.'),
  'C8-J5': P('the fact is UNRESOLVED, the ledger holds zero transitions and no evidence authority '
    + 'was minted.'),
  'C8-J6': P('decisionWhileUnresolved treats the pull-cord as unverified, refuses to rely on it as '
    + 'the emergency stop, and requires an alternative control or halting the task. The second-hand '
    + 'repair claim is confined to branchA as a hypothesis and is nowhere treated as establishing '
    + 'that the pull-cord works.'),
  'C8-J7': P('the declared property was admitted to the ledger as UNRESOLVED carrying the '
    + 'observation span.'),
  'C8-J8': P('RO-D NOT OBSERVED. No branch or decision treats the fitter\'s second-hand claim as '
    + 'bearing on the stopping property, and none claims more than the property establishes.',
  { residualObserved: false, residualClassification: 'NOT_OBSERVED' }),
  'C8-J9': P('RO-A NOT OBSERVED. branchA and branchB divide the stopping property cleanly — repaired '
    + 'and stops, versus still defective and does not stop — with no unknown folded into either.',
  { residualObserved: false, residualClassification: 'NOT_OBSERVED' }),
};

// ================================================================ compute

const slots: Record<string, any>[] = [];
for (const c of INTEGRATED_CASES_228A) {
  for (const j of c.judgments) {
    const s = V[j.id];
    if (s === undefined) throw new Error(`§228B ABORT: frozen slot ${j.id} has no verdict`);
    slots.push({
      id: j.id, caseId: c.caseId, axis: j.axis, question: j.question,
      feedsRequirement: j.feedsRequirement, recordsResidual: j.recordsResidual,
      mandatory: j.mandatory, verdict: s.verdict, reason: s.reason,
      residualObserved: s.residualObserved ?? null,
      residualClassification: s.residualClassification ?? null,
      borderline: s.borderline ?? false,
    });
  }
}
const extra = Object.keys(V).filter(k => !slots.some(s => s.id === k));
if (extra.length > 0) throw new Error(`§228B ABORT: verdicts for non-frozen slots: ${extra}`);
if (slots.length !== 68) throw new Error(`§228B ABORT: ${slots.length} slots, frozen count is 68`);

const requirements = HARD_REQUIREMENTS_228A.map(r => {
  const fed = slots.filter(s => s.feedsRequirement === r.id && s.mandatory);
  const pass = fed.filter(s => s.verdict === 'PASS').length;
  const fail = fed.filter(s => s.verdict === 'FAIL').length;
  const amb = fed.filter(s => s.verdict === 'AMBIGUOUS').length;
  const ne = fed.filter(s => s.verdict === 'NOT_EXERCISED').length;
  // Frozen rule: a FAIL fails the requirement. Zero exercised opportunities is
  // COVERAGE_INSUFFICIENT, which is never a pass. AMBIGUOUS cannot supply a pass from that
  // judgment but does not by itself fail the requirement.
  const result = fail > 0 ? 'FAIL'
    : pass === 0 ? 'COVERAGE_INSUFFICIENT' : 'PASS';
  return {
    id: r.id, name: r.name, threshold: r.threshold, statement: r.statement,
    casesExercising: [...new Set(fed.filter(s => s.verdict !== 'NOT_EXERCISED')
      .map(s => s.caseId))],
    slots: fed.length, pass, fail, ambiguous: amb, notExercised: ne, result,
    slotIds: fed.map(s => `${s.id}:${s.verdict}`),
  };
});

const residuals = RESIDUAL_OBSERVATIONS_228A.map(o => {
  const fed = slots.filter(s => s.recordsResidual === o.id);
  const observed = fed.filter(s => s.residualObserved === true);
  return {
    id: o.id, origin: o.origin, observe: o.observe,
    slots: fed.length,
    occurrencesObserved: observed.length,
    contained: observed.filter(s => s.residualClassification === 'CONTAINED').length,
    uncontained: observed.filter(s => s.residualClassification === 'UNCONTAINED').length,
    cases: observed.map(s => s.caseId),
    result: observed.length === 0 ? 'NOT_OBSERVED'
      : observed.every(s => s.residualClassification === 'CONTAINED') ? 'CONTAINED'
        : 'UNCONTAINED',
  };
});

const pathsExercised = [
  { id: 1, exercised: true, note: 'C2, C3, C4 (x2), C7, C8 admitted. C1 NOT_EXERCISED (truncation).' },
  { id: 2, exercised: true, note: 'C2 traced one proposition to SETTLED_BY_EVIDENCE.' },
  { id: 3, exercised: true, note: 'UNDERLYING_SAFETY_STATE on C4 and C8, REQUIRED_ACT_ITSELF on C2, '
    + 'REQUIRED_ARTIFACT_ITSELF on C7. The EVIDENCE_FOR_ANOTHER_PROPERTY route was NOT taken: C3 '
    + 'drew a third shape the frozen expectation did not cover.' },
  { id: 4, exercised: false, note: 'NOT_EXERCISED. C1 truncated and the KR-1 path never reached the '
    + 'authority stage. C3 exercised the same REFUSAL MECHANISM — settlement attempted with evidence '
    + 'approved, refused PROPERTY_AUTHORITY_NOT_OBTAINED, fact UNRESOLVED, zero transitions — but '
    + 'under CORRECTED rather than absent authority, and C3 is not in HR4\'s frozen denominator.' },
  { id: 5, exercised: true, note: 'C2-E1 and C7-E1.' },
  { id: 6, exercised: true, note: 'C3-E1 fired a genuine correction; C8-E1 confirmed as the rule '
    + 'requires. The redundancy was needed and worked.' },
  { id: 7, exercised: true, note: 'C3-E1 supplied the hard direction: an approved evidence authority '
    + 'did not supply property authority. C2-E1 supplied the other direction.' },
  { id: 8, exercised: true, note: 'C2-E2, exactly one fact on exactly one transition.' },
  { id: 9, exercised: true, note: 'C4-E1: property declined and evidence refused, sibling intact. '
    + 'The adverse LEDGER TRANSITION limb remains NOT_EXERCISABLE — no runtime producer.' },
  { id: 10, exercised: true, note: 'C5.' },
  { id: 11, exercised: true, note: 'C6.' },
  { id: 12, exercised: true, note: 'C7, all five limbs.' },
];

const passed = requirements.filter(r => r.result === 'PASS').length;
const failed = requirements.filter(r => r.result === 'FAIL');
const insufficient = requirements.filter(r => r.result === 'COVERAGE_INSUFFICIENT');
const uncontained = residuals.filter(r => r.result === 'UNCONTAINED');

const overall = failed.length > 0 ? 'FAIL'
  : insufficient.length > 0 ? 'INCONCLUSIVE' : 'PASS';

const doc = {
  artifact: 'SECTION-228-INTEGRATED-RESULTS',
  frozenDigest: '4c91ae539f18efdad0f37e30967e8b188b659864fac8ab0cda08c8e2dea0c3cc',
  preSpendIdentity: 'PASS',
  providerCallsInScoring: 0,
  databaseOperations: 0,
  slotsAdded: 0, slotsRemoved: 0, applicabilityChanged: false, denominatorsChanged: false,
  aggregateScoreComputed: false, compensationPermitted: false,
  verdictVocabulary: ['PASS', 'FAIL', 'AMBIGUOUS', 'NOT_EXERCISED'],
  hardRequirementRule: HARD_REQUIREMENT_RULE_228A,
  applicabilityRule: APPLICABILITY_RULE_228A,
  residualContainmentQuestion: RESIDUAL_CONTAINMENT_QUESTION_228A,
  slots,
  slotCount: slots.length,
  slotTally: {
    PASS: slots.filter(s => s.verdict === 'PASS').length,
    FAIL: slots.filter(s => s.verdict === 'FAIL').length,
    AMBIGUOUS: slots.filter(s => s.verdict === 'AMBIGUOUS').length,
    NOT_EXERCISED: slots.filter(s => s.verdict === 'NOT_EXERCISED').length,
  },
  requirements,
  requirementsPassed: passed,
  requirementsTotal: requirements.length,
  requirementsFailed: failed.map(r => r.id),
  requirementsCoverageInsufficient: insufficient.map(r => r.id),
  residuals,
  residualsUncontained: uncontained.map(r => r.id),
  requiredPaths: REQUIRED_PATHS_228A.map(p => ({
    id: p.id, name: p.name,
    ...pathsExercised.find(x => x.id === p.id),
  })),
  pathsDesigned: REQUIRED_PATHS_228A.length,
  pathsExercised: pathsExercised.filter(p => p.exercised).length,
  assertedConditionStateAffectedVerifierBehaviour: 'NO',
  assertedConditionStateEvidence:
    'RO-E occurrences were observed on C2, C4, C7 and C8 — four ACTIVE labels asserting a state '
    + 'their own reasoning says is unresolved. On every case with a verifier call the nomination '
    + 'tracked the open property, not the asserted label. C8, authored specifically for this '
    + 'question, is the clearest: estop-failure-uncorrected asserted ACTIVE, and the verifier '
    + 'nominated whether the pull-cord currently functions. §218 consistency admitted all five '
    + 'verifier outputs with zero codes.',
  outOfDenominatorObservations: [{
    residual: 'RO-A',
    caseId: 'C4',
    observation: 'decl-acm-status branchB reads "Survey or sampling confirms, OR FAILS TO RULE OUT, '
      + 'that the wall material contains asbestos-containing material", and decl-conduit-dead '
      + 'branchB reads "The conduit REMAINS UNCONFIRMED or is found to be live". Both fold unknown '
      + 'into a branch state rather than dividing the property.',
    whyOutOfDenominator: 'C4 instruments RO-A but the frozen slot table authors no RO-A slot on C4. '
      + 'The three frozen RO-A slots are C1-J7, C5-J6 and C8-J9. Slots may not be added after the '
      + 'freeze, so this occurrence is recorded here and counts toward nothing.',
    classification: 'CONTAINED — both adverse decisions stop the drilling regardless of the branch '
      + 'wording, the property authority was DECLINED_KEEP_UNRESOLVED, the ledger held zero '
      + 'transitions and the sibling stayed UNRESOLVED. No authoritative outcome moved.',
  }, {
    residual: 'RO-E',
    caseId: 'C5',
    observation: 'amm-detector-fault-ventilation-uncertainty is asserted ACTIVE while its own '
      + 'reasoning says "it is not established whether the interlocked ventilation would still '
      + 'operate".',
    whyOutOfDenominator: 'C5 authors no RO-E slot; its frozen residual slots are RO-D and RO-A.',
    classification: 'CONTAINED — the declaration was emitted with the correct property, and the '
      + 'case then exercised RR-7 where nothing could settle in any event.',
  }],
  providerDefectsContained: [{
    caseId: 'C1',
    defect: 'the first pass truncated at max_tokens (4000 output tokens, stop_reason max_tokens) '
      + 'and the required unresolvedFactDeclarations field never arrived',
    classification: 'PROVIDER/COMPONENT DEFECT — CONTAINED',
    containment: 'the field was never parsed, reconstructed or repaired; no fact was admitted; the '
      + 'verifier leg was elided; nothing was settled, authorised or released; and the absence is '
      + 'visible in the end state as the named structural defects FIRST_PASS_OUTPUT_TRUNCATED and '
      + 'DECLARATIONS_FIELD_ABSENT_FROM_A_REQUIRED_SCHEMA_FIELD, which is the second limb of HR1 and '
      + 'of invariant 9.',
    qualification: 'The model\'s own outcome field reads ANALYZED. The signal that the result is '
      + 'unusable comes from the deterministic layer, not from the model. There is no production '
      + 'activation, so how a user-facing surface would present this was not exercised.',
    consequence: 'HR4 and HR7 have C1 as their only frozen case and are therefore '
      + 'COVERAGE_INSUFFICIENT. This is the §221 shape recurring: the path could not be judged '
      + 'because the first pass produced nothing for it to act on.',
  }],
  verifierDefectsObserved: [{
    caseId: 'C3',
    defect: 'the verifier routed a control-state description — whether sanding is currently being '
      + 'carried out without interim controls — as UNDERLYING_SAFETY_STATE and VALID, accepting a '
      + 'non-controlling property as the proposition that decides',
    classification: 'VERIFIER SEMANTIC DEFECT — CONTAINED',
    containment: 'the verifier is advisory: it cannot admit a fact, cannot settle and cannot mint '
      + 'authority. The human property correction overrode it, the authority outcome was CORRECTED, '
      + 'and the settlement was refused with PROPERTY_AUTHORITY_NOT_OBTAINED even though evidence '
      + 'had been approved.',
  }],
  singleCaseCoverageLimitation: {
    preserved: true,
    requirementsRestingOnOneCase: requirements
      .filter(r => r.casesExercising.length === 1)
      .map(r => ({ id: r.id, case: r.casesExercising[0] })),
    statement: 'A passing single case demonstrates that the targeted integrated path worked in this '
      + 'frozen engineering cohort. It does NOT establish population-level reliability and does not '
      + 'generalise across workplace safety scenarios. Invariant 28.',
  },
  authoringIndependenceLimitation: { preserved: true, ...AUTHORING_PROVENANCE_228A },
  overallResult: overall,
  notFinalAcceptance:
    'A PASS would mean the current integrated Expert pipeline satisfied the frozen targeted '
    + 'engineering revalidation. It would NOT mean Expert HazLenz is finally accepted or validated. '
    + '§228B is not final acceptance and must not be described as such.',
};

writeFileSync(join(EVID, 'SECTION-228-INTEGRATED-RESULTS.json'), JSON.stringify(doc, null, 2) + '\n');

console.log(`slots ${doc.slotCount}: ${JSON.stringify(doc.slotTally)}\n`);
for (const r of requirements) {
  console.log(`${r.id.padEnd(5)} ${r.result.padEnd(22)} slots=${r.slots} P=${r.pass} F=${r.fail} `
    + `A=${r.ambiguous} NE=${r.notExercised}  cases=[${r.casesExercising.join(',')}]`);
}
console.log(`\nrequirements PASS ${passed}/${requirements.length}`);
console.log(`FAIL: ${failed.map(r => r.id).join(',') || 'none'}`);
console.log(`COVERAGE_INSUFFICIENT: ${insufficient.map(r => r.id).join(',') || 'none'}`);
console.log(`\nresiduals:`);
for (const r of residuals) {
  console.log(`  ${r.id} ${r.result.padEnd(13)} observed=${r.occurrencesObserved} `
    + `contained=${r.contained} uncontained=${r.uncontained} cases=[${r.cases.join(',')}]`);
}
console.log(`\npaths exercised ${doc.pathsExercised}/${doc.pathsDesigned}`);
console.log(`OVERALL: ${overall}`);
