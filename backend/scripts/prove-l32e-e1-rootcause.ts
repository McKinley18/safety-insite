/**
 * L3-2e -- E1 ROOT-CAUSE PROOF, run against the UNPATCHED L3-2d code.
 *
 * `ROOT_CAUSE_BEFORE_REMEDIATION`. This program asserts nothing about the repair. It drives the REAL
 * binder and prints, for each fixture, which check fired and on which lexical token, so the repair is
 * measured against a demonstrated defect rather than a described one.
 *
 * `checkContradiction` and `checkStateSupported` are proven SEPARATELY because they are not the same
 * defect and the entry contract explicitly warns against assuming they are:
 *
 *   checkContradiction   uses lexical presence to REJECT. A false positive DELETES a correct finding,
 *                        which is how D-FLD-175 was lost. This is the high-consequence direction.
 *   checkStateSupported  uses lexical presence to ADMIT a state the model already claimed. A false
 *                        positive accepts a wrong state; a false negative deletes a correct one.
 *
 * Every rejection fixture is PAIRED with the same token in a true predicate role, which must keep
 * working. A repair that closes the first and breaks the second is not a repair.
 *
 * NO NETWORK, NO DATABASE. Run: OUT=... npx ts-node scripts/prove-l32e-e1-rootcause.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { negationScopes } from '../src/safescope-v2/reasoning-l3/negation-scope';

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'housekeeping'];
const HIGH_CONSEQUENCE = ['fall', 'trench', 'excavation', 'cave_in', 'loto', 'energy', 'confined',
  'electrical', 'struck_by', 'mobile_equipment', 'scaffold', 'hole', 'opening', 'impalement', 'rebar',
  'explosion', 'ground_control'];

function mk(text: string): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32e-e1', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}

function run(text: string, family: string, quote: string, state: HazardCandidate['conditionState'], rationale = 'the observation states this condition directly') {
  const input = mk(text);
  const src = input.authoritativeSources[0].text;
  const start = src.indexOf(quote);
  if (start < 0) throw new Error(`quote not verbatim: ${JSON.stringify(quote)}`);
  const c: HazardCandidate = {
    candidateKey: 'k1', hazardFamily: family, conditionState: state,
    evidence: [{ sourceId: 'observation-1', sourceType: 'observation', startOffset: start, endOffset: start + quote.length, quotedText: quote }],
    conditionRationale: rationale, independentHazardRationale: 'the only hazard described',
    uncertainties: [], clarification: null, correctiveActionIntent: null, riskFactors: null, regulatoryCandidateRefs: [],
  };
  const p: ReasoningProposal = {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION, analysisId: input.analysisId,
    outcome: 'ANALYZED', observationInterpretation: 'x', hazardCandidates: [c], jurisdictionProposal: null,
  };
  const v = validateReasoningProposal(p, input);
  if (v.state !== 'VALID' || !v.validated) return { validatorRejected: v.issues.map(i => i.code), survived: false, fatalCodes: [] as string[], detail: '' };
  const s = bindEvidenceSemantically(v.validated, input);
  const fatal = s.issues.filter(i => i.severity === 'FATAL');
  return {
    validatorRejected: [] as string[],
    survived: s.boundHazards.some(h => h.candidateKey === 'k1'),
    fatalCodes: [...new Set(fatal.map(i => i.code))],
    detail: fatal.map(i => i.detail).join(' | '),
  };
}

interface Row {
  group: string; id: string; token: string; role: string; family: string;
  highConsequenceFamily: boolean; check: string; text: string; quote: string;
  state: HazardCandidate['conditionState'];
  mustSurvive: boolean; why: string;
}

const ROWS: Row[] = [
  // ============ checkContradiction, PATH B: correction/removal tokens over the whole cited text.
  { group: 'E1a_contradiction_correctionToken', id: 'D-FLD-175', token: 'discarded', role: 'ATTRIBUTIVE MODIFIER on "conveyor rollers"',
    family: 'electrical', highConsequenceFamily: true, check: 'checkContradiction (correction/removal path)',
    text: 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris.',
    quote: 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris',
    state: 'ACTIVE', mustSurvive: true,
    why: 'nothing was corrected -- "discarded" describes the rollers. The asserted predicate is "is blocked".' },
  { group: 'E1a_contradiction_correctionToken', id: 'PAIR-175', token: 'discarded', role: 'ASSERTED PREDICATE',
    family: 'electrical', highConsequenceFamily: true, check: 'checkContradiction (correction/removal path)',
    text: 'The damaged extension lead was found at the panel and was discarded before we left the area.',
    quote: 'The damaged extension lead was found at the panel and was discarded before we left the area',
    state: 'ACTIVE', mustSurvive: false,
    why: 'THE PAIRED HALF. Here the same token IS the predicate and genuinely contradicts ACTIVE.' },
  { group: 'E1a_contradiction_correctionToken', id: 'NEG-APPLIED', token: 'applied', role: 'ASSERTED PREDICATE UNDER A GOVERNING NEGATION',
    family: 'loto_stored_energy', highConsequenceFamily: true, check: 'checkContradiction (correction/removal path)',
    text: 'Crew was changing the knives on the granulator and no lockout is applied at the disconnect.',
    quote: 'no lockout is applied at the disconnect',
    state: 'ACTIVE', mustSurvive: true,
    why: 'a NEGATED correction is not a correction. "applied" is in CORRECTION_TOKENS and the negation is ignored.' },
  { group: 'E1a_contradiction_correctionToken', id: 'PAIR-APPLIED', token: 'applied', role: 'ASSERTED PREDICATE, unnegated',
    family: 'loto_stored_energy', highConsequenceFamily: true, check: 'checkContradiction (correction/removal path)',
    text: 'The crew stopped work and a full lockout was applied at the disconnect before the guard came off.',
    quote: 'a full lockout was applied at the disconnect before the guard came off',
    state: 'ACTIVE', mustSurvive: false,
    why: 'THE PAIRED HALF. Unnegated, the same token genuinely contradicts ACTIVE.' },
  { group: 'E1a_contradiction_removalToken', id: 'GUARD-REMOVED', token: 'removed', role: 'ASSERTED PREDICATE whose SUBJECT IS THE CONTROL, not the equipment',
    family: 'machine_guarding', highConsequenceFamily: false, check: 'checkContradiction (correction/removal path)',
    text: 'The chain guard has been removed from the drive and was not refitted after the belt change.',
    quote: 'The chain guard has been removed from the drive and was not refitted after the belt change',
    state: 'ACTIVE', mustSurvive: true,
    why: 'removing a GUARD creates the hazard. Bare "removed" is ambiguous between that and removal-from-service.' },
  { group: 'E1a_contradiction_removalToken', id: 'PAIR-REMOVED', token: 'removed from service', role: 'ASSERTED PREDICATE, unambiguous multi-word form',
    family: 'machine_guarding', highConsequenceFamily: false, check: 'checkContradiction (correction/removal path)',
    text: 'The grinder with the cracked wheel was removed from service and tagged before the shift ended.',
    quote: 'The grinder with the cracked wheel was removed from service and tagged before the shift ended',
    state: 'ACTIVE', mustSurvive: false,
    why: 'THE PAIRED HALF. The unambiguous form genuinely contradicts ACTIVE.' },

  // ============ checkContradiction, PATH A: HAZARD_NEGATION_OBJECTS inside a negation scope.
  { group: 'E1b_contradiction_hazardNegation', id: 'DISC-03-LABEL', token: 'hazard', role: 'ATTRIBUTIVE MODIFIER; the NP head is "labels"',
    family: 'hazard_communication', highConsequenceFamily: false, check: 'checkContradiction (hazard-negation path)',
    text: 'A plastic jug of solvent is stored on the open shelf without hazard warning labels of any kind.',
    quote: 'A plastic jug of solvent is stored on the open shelf without hazard warning labels of any kind',
    state: 'ACTIVE', mustSurvive: true,
    why: 'the negation denies the LABEL, which is a control. Their absence IS the hazard.' },
  { group: 'E1b_contradiction_hazardNegation', id: 'DISC-03-DAMAGE', token: 'damage', role: 'ATTRIBUTIVE context; the asserted hazard is in the contrastive clause',
    family: 'electrical', highConsequenceFamily: true, check: 'checkContradiction (hazard-negation path)',
    text: 'The survey found no damage to the enclosure although the earth conductor has been cut back and left unterminated.',
    quote: 'The survey found no damage to the enclosure although the earth conductor has been cut back and left unterminated',
    state: 'ACTIVE', mustSurvive: true,
    why: 'the negation governs its own clause only; the hazard is asserted in the next one.' },
  { group: 'E1b_contradiction_hazardNegation', id: 'PAIR-NEGATED-HAZARD', token: 'damage', role: 'NP HEAD of the negated phrase',
    family: 'electrical', highConsequenceFamily: true, check: 'checkContradiction (hazard-negation path)',
    text: 'The inspection of the switch room found no damage and no exposed conductors anywhere on the panels.',
    quote: 'The inspection of the switch room found no damage and no exposed conductors anywhere on the panels',
    state: 'ACTIVE', mustSurvive: false,
    why: 'THE PAIRED HALF. Here the negation genuinely denies the hazard and ACTIVE must be refused.' },

  // ============ checkStateSupported -- the OTHER direction, admission rather than rejection.
  { group: 'E1c_stateSupport', id: 'SS-MODIFIER-ADMITS', token: 'discarded', role: 'ATTRIBUTIVE MODIFIER',
    family: 'electrical', highConsequenceFamily: true, check: 'checkStateSupported (CORRECTED)',
    text: 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris.',
    quote: 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris',
    state: 'CORRECTED', mustSurvive: false,
    why: 'CORRECTED must NOT be supportable by a modifier. If this survives, lexical presence is admitting a wrong state.' },
  { group: 'E1c_stateSupport', id: 'SS-PREDICATE-ADMITS', token: 'replaced', role: 'ASSERTED PREDICATE',
    family: 'electrical', highConsequenceFamily: true, check: 'checkStateSupported (CORRECTED)',
    text: 'The cracked socket outlet at the bench was replaced with a new one before the end of the shift.',
    quote: 'The cracked socket outlet at the bench was replaced with a new one before the end of the shift',
    state: 'CORRECTED', mustSurvive: true,
    why: 'THE PAIRED HALF. A genuine correction predicate must keep supporting CORRECTED.' },
  { group: 'E1c_stateSupport', id: 'SS-NEGATED-ADMITS', token: 'in place', role: 'ASSERTED PREDICATE UNDER A GOVERNING NEGATION',
    family: 'falls', highConsequenceFamily: true, check: 'checkStateSupported (CONTROLLED)',
    text: 'The crew reported that no guardrail was in place along the open edge of the deck.',
    quote: 'no guardrail was in place along the open edge of the deck',
    state: 'CONTROLLED', mustSurvive: false,
    why: 'CONTROLLED must NOT be supportable by a NEGATED control-in-place phrase.' },
];

const results = ROWS.map(r => {
  const out = run(r.text, r.family, r.quote, r.state);
  const behavedCorrectly = out.survived === r.mustSurvive;
  return {
    ...r,
    negationScopes: negationScopes(r.text).map(s => ({ token: s.token, governs: r.text.slice(s.from, s.to) })),
    influencedDecision: out.fatalCodes.length > 0,
    checkFired: out.fatalCodes,
    detail: out.detail,
    survived: out.survived,
    expectedSurvival: r.mustSurvive,
    defectReproduced: !behavedCorrectly,
    consequence: behavedCorrectly ? 'correct today'
      : (r.mustSurvive
        ? (HIGH_CONSEQUENCE.some(k => r.family.includes(k)) ? 'A CORRECT HIGH-CONSEQUENCE FINDING IS DELETED' : 'a correct ordinary finding is deleted')
        : 'a wrong claim is ADMITTED'),
  };
});

const out = {
  stage: 'L3-2e E1 ROOT-CAUSE PROOF (unpatched L3-2d code)',
  generatedAt: new Date().toISOString(),
  checksProvenSeparately: {
    checkContradiction: 'lexical presence used to REJECT -- a false positive DELETES a correct finding (D-FLD-175)',
    checkStateSupported: 'lexical presence used to ADMIT a claimed state -- a false positive accepts a WRONG state',
  },
  summary: {
    total: results.length,
    defectsReproduced: results.filter(r => r.defectReproduced).length,
    highConsequenceDeletions: results.filter(r => r.defectReproduced && r.mustSurvive && HIGH_CONSEQUENCE.some(k => r.family.includes(k))).length,
    pairedHalvesStillCorrect: results.filter(r => !r.mustSurvive && !r.defectReproduced).length,
  },
  rows: results,
};
const path = process.env.OUT || '../verification/hazlenz-l3-2e-syntactic-role-2026-08-23/rootcause/e1-proof-pre-patch.json';
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, JSON.stringify(out, null, 2) + '\n');

for (const r of results) {
  const flag = r.defectReproduced ? 'DEFECT ' : 'ok     ';
  console.log(`${flag} ${r.id.padEnd(20)} survived=${String(r.survived).padEnd(5)} want=${String(r.expectedSurvival).padEnd(5)} fired=${JSON.stringify(r.checkFired).padEnd(40)} ${r.role}`);
}
console.log('\nSUMMARY:', JSON.stringify(out.summary, null, 2));
