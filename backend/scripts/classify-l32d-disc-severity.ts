/**
 * L3-2d -- CLASSIFY DISC-02 / DISC-03 / DISC-04, which the entry contract requires at closure:
 * ordinary-quality debt only, capable of high-consequence loss, or violating a Level-3 invariant.
 *
 * This is a CLASSIFICATION, not a remediation. Nothing here changes behaviour.
 *
 * Run: OUT=... npx ts-node scripts/classify-l32d-disc-severity.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication', 'loto_stored_energy', 'walking_working_surfaces'];
const HIGH_CONSEQUENCE = ['fall', 'trench', 'excavation', 'cave_in', 'loto', 'energy', 'confined', 'electrical', 'struck_by', 'mobile_equipment', 'scaffold', 'hole', 'opening', 'impalement', 'rebar', 'explosion', 'ground_control'];

function mk(text: string): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32d-disc', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}
function run(text: string, family: string, quote: string, state: HazardCandidate['conditionState'] = 'ACTIVE') {
  const input = mk(text);
  const src = input.authoritativeSources[0].text;
  const start = src.indexOf(quote);
  if (start < 0) throw new Error(`quote not verbatim: ${quote}`);
  const c: HazardCandidate = {
    candidateKey: 'k1', hazardFamily: family, conditionState: state,
    evidence: [{ sourceId: 'observation-1', sourceType: 'observation', startOffset: start, endOffset: start + quote.length, quotedText: quote }],
    conditionRationale: 'the observation states this condition directly',
    independentHazardRationale: 'the only hazard described',
    uncertainties: [], clarification: null, correctiveActionIntent: null, riskFactors: null, regulatoryCandidateRefs: [],
  };
  const p: ReasoningProposal = {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION, analysisId: input.analysisId,
    outcome: 'ANALYZED', observationInterpretation: 'x', hazardCandidates: [c], jurisdictionProposal: null,
  };
  const v = validateReasoningProposal(p, input);
  if (v.state !== 'VALID' || !v.validated) return { validatorRejected: v.issues.map(i => i.code), survived: false, codes: [] as string[] };
  const s = bindEvidenceSemantically(v.validated, input);
  return {
    validatorRejected: [] as string[],
    survived: s.boundHazards.some(h => h.conditionState === 'ACTIVE'),
    codes: [...new Set(s.issues.filter(i => i.severity === 'FATAL').map(i => i.code))],
    highConsequenceFamily: HIGH_CONSEQUENCE.some(k => family.includes(k)),
  };
}

const cases = [
  // DISC-03 -- a hazard-vocabulary word in a NON-HAZARD syntactic role.
  { disc: 'DISC-03', label: 'hazard as a modifier: "without hazard warning labels"', family: 'hazard_communication',
    text: 'A plastic jug of solvent is stored on the open shelf without hazard warning labels of any kind.',
    quote: 'A plastic jug of solvent is stored on the open shelf without hazard warning labels of any kind' },
  { disc: 'DISC-03', label: 'no damage negating the HAZARD in a clause that also states one', family: 'electrical',
    text: 'The survey found no damage to the enclosure although the earth conductor has been cut back and left unterminated.',
    quote: 'The survey found no damage to the enclosure although the earth conductor has been cut back and left unterminated' },
  // DISC-04 -- a correction/removal word in a NON-CORRECTION syntactic role.
  { disc: 'DISC-04', label: 'correction token inside a negation: "no LOTO is applied"', family: 'loto_stored_energy',
    text: 'Crew was changing the knives on the granulator and no LOTO is applied at the disconnect.',
    quote: 'no LOTO is applied at the disconnect' },
  { disc: 'DISC-04', label: 'correction token as an adjective on debris: "discarded rollers"', family: 'electrical',
    text: 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris.',
    quote: 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris' },
  { disc: 'DISC-04', label: 'removal token describing the HAZARD, not a control', family: 'machine_guarding',
    text: 'The chain guard has been removed from the drive and was not refitted after the belt change.',
    quote: 'The chain guard has been removed from the drive and was not refitted after the belt change' },
  // DISC-02 -- no check owns "ACTIVE contradicted by control-in-place evidence".
  { disc: 'DISC-02', label: 'ACTIVE asserted on control-in-place evidence -- no check owns this', family: 'machine_guarding',
    text: 'The wheel guards on the grinder are all fitted and the tool rests are set within an eighth of an inch.',
    quote: 'The wheel guards on the grinder are all fitted and the tool rests are set within an eighth of an inch' },
];

const rows = cases.map(c => {
  const r = run(c.text, c.family, c.quote);
  const wrong = c.disc === 'DISC-02' ? r.survived : !r.survived;   // DISC-02 is a FALSE ACTIVE; 03/04 are FALSE REJECTIONS
  return {
    disc: c.disc, label: c.label, family: c.family,
    highConsequenceFamily: HIGH_CONSEQUENCE.some(k => c.family.includes(k)),
    activeSurvived: r.survived, fatalCodes: r.codes,
    defectReproduced: wrong,
    consequence: !wrong ? 'none -- behaves correctly here'
      : c.disc === 'DISC-02' ? 'a false ACTIVE would stand if the provider proposed one'
      : (HIGH_CONSEQUENCE.some(k => c.family.includes(k)) ? 'A CORRECT HIGH-CONSEQUENCE HAZARD IS DELETED' : 'a correct ordinary hazard is deleted'),
  };
});

const hcLoss = rows.filter(r => r.defectReproduced && r.highConsequenceFamily && r.disc !== 'DISC-02');
const verdict = {
  'DISC-02': rows.some(r => r.disc === 'DISC-02' && r.defectReproduced)
    ? 'OPEN -- no deterministic check owns ACTIVE vs control-in-place. It cannot delete a hazard, so it is a PRECISION risk: it can only let a provider error stand. On four sealed holdouts the provider has never made that error, so it remains UNPROVEN as a measured loss.'
    : 'not reproduced',
  'DISC-03': rows.some(r => r.disc === 'DISC-03' && r.defectReproduced && r.highConsequenceFamily)
    ? 'CAPABLE OF HIGH-CONSEQUENCE LOSS'
    : (rows.some(r => r.disc === 'DISC-03' && r.defectReproduced) ? 'ordinary-quality debt (reproduced, no high-consequence loss demonstrated)' : 'not reproduced'),
  'DISC-04': rows.some(r => r.disc === 'DISC-04' && r.defectReproduced && r.highConsequenceFamily)
    ? 'CAPABLE OF HIGH-CONSEQUENCE LOSS'
    : (rows.some(r => r.disc === 'DISC-04' && r.defectReproduced) ? 'ordinary-quality debt (reproduced, no high-consequence loss demonstrated)' : 'not reproduced'),
};

const out = {
  stage: 'L3-2d DISC SEVERITY CLASSIFICATION', generatedAt: new Date().toISOString(),
  note: 'Classification only. No behaviour was changed by this program or by L3-2d.',
  measuredHighConsequenceLossOnSealedSet: 'D-FLD-175 -- "Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris" -- an ELECTRICAL (high-consequence) hazard the provider classified correctly, deleted by SEMANTIC_EVIDENCE_CONTRADICTS_STATE. This is no longer a hypothetical severity: it is a measured high-consequence loss on the L3-2d sealed holdout.',
  invariantAnalysis: {
    'L3-INV-02_evidence_bound_findings': 'not violated -- the deleted findings were evidence-bound; they were deleted, not fabricated',
    'L3-INV-04_no_default_ACTIVE': 'not violated -- these defects DELETE ACTIVE, they never create it',
    'L3-INV-05_safe_failure': 'not violated -- the pipeline fails closed',
    'L3-INV-10_no_silent_L1_fallback': 'not violated',
    'L3-INV-11_negation_scope_preserved': 'ARGUABLY ENGAGED -- DISC-04 mis-reads a correction token INSIDE a negation ("no LOTO is applied"), which is a scope question, but the deletion is made by checkContradiction rather than by the negation-scope engine L3-INV-11 governs. Recorded as engaged-but-not-proven-violated.',
    conclusion: 'No mandatory Level-3 invariant is DEMONSTRATED violated. The defects are a hazard-RECALL failure, and recall is governed by the advancement gate rather than by an invariant.',
  },
  verdict, rows,
};

const path = process.env.OUT || '../verification/hazlenz-l3-2d-clarification-precision-2026-08-22/rootcause/disc-severity.json';
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
for (const r of rows) console.log(`${r.disc}  reproduced=${String(r.defectReproduced).padEnd(5)} hcFamily=${String(r.highConsequenceFamily).padEnd(5)} codes=${JSON.stringify(r.fatalCodes).padEnd(42)} ${r.label}`);
console.log('\nVERDICT:', JSON.stringify(verdict, null, 2));
