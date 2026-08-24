/**
 * L3-2g -- BINDER RESIDUAL ROOT-CAUSE PROOF + PAIRED REGRESSION FIXTURES.
 *
 * `ROOT_CAUSE_BEFORE_REMEDIATION`. This program drives the REAL validator and the REAL binder and
 * records, per fixture, whether the candidate survived and which check consumed it. It is run TWICE
 * -- once against unpatched L3-2f code and once after the repair -- and the two JSON files are the
 * before/after proof. It asserts nothing about the repair itself.
 *
 * THE RESIDUAL. §36.6 / §36.11 item 1: `F-WC-02` was classified ACTIVE correctly by the provider and
 * DELETED by the binder, because `CORRECTION_TOKENS` contains `fixed` and "the DANGER sign IS FIXED
 * to the handrail post" is an asserted, unnegated predicate -- of the SIGN, not of the hazard. Role
 * analysis cannot separate them: the difference is WHAT was fixed.
 *
 * THE TREATMENT IS ALREADY PROVEN. §35.1's governing asymmetry -- *a vocabulary used to REJECT must
 * be unambiguous; a vocabulary used to ADMIT may be permissive* -- is the identical argument that
 * removed bare `removed` from the rejection path at L3-2e and produced
 * `UNAMBIGUOUS_SERVICE_WITHDRAWAL`. This is the eighth instance of §32.5.
 *
 * EVERY DEFECT FIXTURE IS PAIRED. A repair that closes the first and breaks the second is not a
 * repair. The pairs below are the whole point of the file: each ambiguous token is shown failing in
 * its ATTACHMENT sense and still working in its REPAIR sense, and `checkStateSupported`'s admission
 * half is shown UNCHANGED for the same tokens.
 *
 * NO NETWORK, NO DATABASE. Run: OUT=... npx ts-node scripts/prove-l32g-binder-residual.ts
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

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'housekeeping', 'confined_space',
  'noise_exposure', 'lifting_rigging', 'mobile_equipment'];

function mk(text: string): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32g-binder-rc', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}

/** Drives the real validator and the real binder over one hand-built candidate. */
function bind(text: string, family: string, quote: string, state: HazardCandidate['conditionState'],
  rationale = 'the observation states this condition directly') {
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
  if (v.state !== 'VALID' || !v.validated) {
    return { survived: false, fatalCodes: v.issues.map(i => i.code), detail: 'validator rejected' };
  }
  const s = bindEvidenceSemantically(v.validated, input);
  const fatal = s.issues.filter(i => i.severity === 'FATAL');
  return {
    survived: s.boundHazards.some(h => h.candidateKey === 'k1'),
    fatalCodes: [...new Set(fatal.map(i => i.code))],
    detail: fatal.map(i => i.detail).join(' | '),
  };
}

const out: any = {
  phase: 'L3-2g', role: 'BINDER_RESIDUAL_ROOT_CAUSE_AND_PAIRED_REGRESSION',
  generatedAt: new Date().toISOString(), findings: {},
};

// =====================================================================================
// R1 -- the recorded residual. `fixed` in the REJECTION half of CORRECTION_TOKENS.
// =====================================================================================
{
  const rows: any[] = [];

  // The sealed-set scenario, verbatim from holdout-l32f.json / F-WC-02.
  const WC02 = 'A DANGER OPEN PIT sign is fixed to the handrail post beside the inspection pit in the workshop floor and the pit is left open across the walkway.';

  rows.push({
    fixture: 'F-WC-02 (sealed, the recorded loss)', mustSurvive: true,
    sense: 'ATTACHMENT -- "is fixed" is predicated of the SIGN, not of the hazard',
    ...bind(WC02, 'walking_working_surfaces', 'the pit is left open across the walkway', 'ACTIVE'),
  });
  // The same note quoted the way the provider actually quoted it on the sealed run -- the whole
  // clause including the sign. This is the shape that reached the binder.
  rows.push({
    fixture: 'F-WC-02 broad quote (whole note)', mustSurvive: true,
    sense: 'ATTACHMENT, with the ambiguous token inside the cited span',
    ...bind(WC02, 'walking_working_surfaces', 'A DANGER OPEN PIT sign is fixed to the handrail post', 'ACTIVE'),
  });

  // THE PAIRED COUNTER-FIXTURE, and the ACCEPTED COST of the treatment.
  //
  // Stated before the repair was applied, and NOT re-labelled after seeing the result: removing
  // `fixed` from the rejection half means this row -- `fixed` in its genuine REPAIR sense -- is no
  // longer refused by the binder. That is the identical, deliberate trade L3-2e made for bare
  // `removed`, and its direction is the safe one: the binder now lets a PROVIDER error stand
  // (precision, measurable against negative controls, recoverable) instead of DELETING a correct
  // high-consequence hazard (recall, not recoverable). `checkStateSupported` is unaffected, so a
  // model that correctly says CORRECTED here is still corroborated on `fixed`.
  const REPAIRED = 'The interlock on the guard door was fixed before we left the area and the machine was run off afterwards without incident.';
  rows.push({
    fixture: 'paired counter-fixture -- "was fixed before we left"',
    mustSurvive: false, acceptedTreatmentCost: true,
    sense: 'REPAIR -- an asserted correction of the hazard itself',
    costNote: 'refused BEFORE the repair, admitted AFTER it. Precision risk only; it can never delete a hazard. '
      + 'Same class and same direction as DISC-02, and the same trade L3-2e accepted for bare `removed`.',
    ...bind(REPAIRED, 'machine_guarding', 'The interlock on the guard door was fixed before we left the area', 'ACTIVE'),
  });

  out.findings.R1_fixed_token = {
    mechanism: 'CORRECTION_TOKENS is consulted by checkContradiction (B) to REJECT. `fixed` is '
      + 'ambiguous between REPAIRED and ATTACHED, so an asserted `is fixed` predicated of a SIGN '
      + 'deletes a correct high-consequence ACTIVE finding.',
    rule: '35.1 -- a vocabulary used to REJECT must be unambiguous; a vocabulary used to ADMIT may be permissive',
    precedent: 'L3-2e removed bare `removed` from the rejection path for this exact reason (UNAMBIGUOUS_SERVICE_WITHDRAWAL)',
    rows,
  };
}

// =====================================================================================
// R2 -- the audit §36.11 asked for. The other ambiguous members of the same rejection set.
//
// NEXT_ACTION.md names `addressed`, `applied`, `closed out`, `made good`, `reset`. Each is tested
// in the sense that is NOT a correction of the hazard. Any that deletes a correct ACTIVE is the
// same defect as `fixed` and must leave the rejection half with it.
// =====================================================================================
{
  const rows: any[] = [];
  // THE QUOTE MUST CONTAIN THE TOKEN. `checkContradiction` (B) reads `citedText(h)` -- the
  // concatenated evidence spans -- so a narrow quote of the hazard clause alone never reaches the
  // check at all. That is exactly why R1's narrow F-WC-02 quote survives and its broad quote does
  // not, and an audit that quoted narrowly would report a clean bill of health it had not earned.
  // Every probe here therefore cites the BROAD span, which is the shape that reaches the check.
  const probe = (token: string, sense: string, text: string, family: string, quote: string, mustSurvive: boolean) =>
    rows.push({ token, sense, fixture: `${token}: ${text.slice(0, 55)}...`, quoteContainsToken: quote.toLowerCase().includes(token), mustSurvive, ...bind(text, family, quote, 'ACTIVE') });

  // SAME SENSE, DIFFERENT OBJECT. Measured deleting a correct ACTIVE under a broad quote, and
  // RETAINED in the rejection half anyway: removing them broke `test:l32b-binder-precision` and
  // `test:l32e-syntactic-role`, whose fixtures are correct. Recorded as an accepted residual with
  // its expectation left at the pre-repair value, exactly as R1's counter-fixture is.
  const probeResidual = (token: string, sense: string, text: string, family: string, quote: string, _ms: boolean) =>
    rows.push({ token, sense, fixture: `${token}: ${text.slice(0, 55)}...`, mustSurvive: true,
      acceptedTreatmentCost: true,
      costNote: 'RETAINED in the rejection half. Its non-correction reading is the SAME sense attached '
        + 'to a different object, which needs a broad cited span AND a rationale without `still` to bite. '
        + 'Removing it broke two prior-phase gates that are right. DISC-02-shaped; recorded, not closed.',
      ...bind(text, family, quote, 'ACTIVE') });

  // `reset` -- resetting a tripped device is not repairing the hazard that tripped it.
  probe('reset', 'NON-CORRECTION -- a breaker reset onto a live fault',
    'The breaker feeding the mixer was reset twice this shift and the trailing lead is still crushed flat where the pallet truck runs over it.',
    'electrical', 'The breaker feeding the mixer was reset twice this shift and the trailing lead is still crushed flat', true);

  // `applied` -- L3-2c DISC-04 covered the NEGATED case; this is the OTHER-OBJECT case.
  probeResidual('applied', 'SAME SENSE, DIFFERENT OBJECT -- retained in the rejection half',
    'A hazard label was applied to the drum rack this morning and the bund around the solvent drums is cracked through to the floor.',
    'chemical_storage', 'A hazard label was applied to the drum rack this morning and the bund around the solvent drums is cracked through', true);

  // `addressed` -- talking about it is not fixing it. §36 already states this in prose.
  probe('addressed', 'NON-CORRECTION -- raised in a meeting, condition left in place',
    'The damaged handrail was addressed at the safety meeting on Monday and the middle section is still hanging loose over the stair flight.',
    'falls', 'The damaged handrail was addressed at the safety meeting on Monday and the middle section is still hanging loose', true);

  // `closed out` -- a paperwork state, not a physical state.
  probe('closed out', 'NON-CORRECTION -- a permit closed out, hazard still present',
    'The hot work permit was closed out at the end of the job and the gas bottles are still stood unsecured against the partition wall.',
    'chemical_storage', 'The hot work permit was closed out at the end of the job and the gas bottles are still stood unsecured', true);

  // `restored` -- restoring SUPPLY is not correcting the hazard.
  probe('restored', 'NON-CORRECTION -- supply restored, defect untouched',
    'Power was restored to the packing hall after the outage and the distribution board door is still missing with the busbars open to touch.',
    'electrical', 'Power was restored to the packing hall after the outage and the distribution board door is still missing', true);

  // `made good` -- the genuine repair sense must STILL reject.
  probe('made good', 'CORRECTION -- a genuine asserted repair of the hazard',
    'The gouged section of flooring outside the press shop was made good with new plate before the shift ended.',
    'walking_working_surfaces', 'The gouged section of flooring outside the press shop was made good with new plate', false);

  // `repaired` -- the unambiguous core of the set must STILL reject.
  probe('repaired', 'CORRECTION -- unambiguous, must remain in the rejection half',
    'The torn conveyor belt was repaired with a vulcanised joint and ran correctly for the rest of the shift.',
    'machine_guarding', 'The torn conveyor belt was repaired with a vulcanised joint', false);

  // The set is audited to its END rather than to the five NEXT_ACTION.md happened to name. These
  // three are the remaining plausible homographs: DISPOSAL senses that also describe DAMAGE.
  probe('destroyed', 'NON-CORRECTION -- `destroyed` describing DAMAGE, which is the hazard itself',
    'The insulation on the oven feed cable has been destroyed by heat and the bare conductors are showing along the tray.',
    'electrical', 'The insulation on the oven feed cable has been destroyed by heat and the bare conductors are showing', true);
  probe('scrapped', 'CORRECTION -- equipment scrapped is a genuine withdrawal',
    'The cracked lifting eye was scrapped at the end of the shift and taken off the rack.',
    'lifting_rigging', 'The cracked lifting eye was scrapped at the end of the shift', false);
  probe('discarded', 'CORRECTION -- asserted disposal of the defective item',
    'The frayed sling was discarded into the scrap bin after the lift finished.',
    'lifting_rigging', 'The frayed sling was discarded into the scrap bin', false);

  // The last untested members. Each is probed in its OTHER-OBJECT sense -- the shape that made
  // `applied` and `restored` dangerous -- so the partition rests on measurement, not on intuition
  // about which words "sound" unambiguous.
  probeResidual('replaced', 'NON-CORRECTION -- something OTHER than the hazard was replaced',
    'The battery on the pallet truck was replaced at the start of the shift and the brake is still binding hard to the left.',
    'mobile_equipment', 'The battery on the pallet truck was replaced at the start of the shift and the brake is still binding', true);
  probeResidual('reinstalled', 'NON-CORRECTION -- the equipment reinstalled, the control still absent',
    'The transfer pump was reinstalled after its overhaul and the coupling guard has still not been put back on.',
    'machine_guarding', 'The transfer pump was reinstalled after its overhaul and the coupling guard has still not been put back on', true);
  probe('resolved', 'NON-CORRECTION -- a ticket resolved, the condition untouched',
    'The maintenance ticket was resolved on the system yesterday and the emergency stop on the line is still painted over and unreachable.',
    'machine_guarding', 'The maintenance ticket was resolved on the system yesterday and the emergency stop on the line is still painted over', true);
  probe('corrected', 'CORRECTION -- takes the defect as its object by definition',
    'The reversed polarity on the socket outlet was corrected by the electrician before the area was handed back.',
    'electrical', 'The reversed polarity on the socket outlet was corrected by the electrician', false);
  probe('rectified', 'CORRECTION -- unambiguous',
    'The earth fault on the distribution board was rectified and the circuit was tested before energising.',
    'electrical', 'The earth fault on the distribution board was rectified', false);
  probe('remediated', 'CORRECTION -- unambiguous',
    'The contaminated section of floor was remediated and the area was released back to production.',
    'housekeeping', 'The contaminated section of floor was remediated', false);

  out.findings.R2_rejection_half_audit = {
    question: 'which other members of the rejection half are ambiguous in the same way as `fixed`?',
    method: 'the cited span DELIBERATELY contains the token, because checkContradiction reads citedText(h) only',
    note: 'rows with mustSurvive=true that did NOT survive are the same defect as `fixed`',
    rows,
  };
}

// =====================================================================================
// R3 -- THE ADMISSION HALF MUST NOT MOVE.
//
// `checkStateSupported` uses CORRECTION_TOKENS to CORROBORATE a CORRECTED state the model already
// chose. A false positive there only agrees with a claim already made; it cannot delete a hazard.
// The repair must leave every one of these exactly as it is.
// =====================================================================================
{
  const rows: any[] = [];
  const admit = (label: string, text: string, family: string, quote: string, state: HazardCandidate['conditionState'], mustSurvive: boolean) =>
    rows.push({ label, state, mustSurvive, ...bind(text, family, quote, state, 'the observation states the condition was corrected') });

  admit('CORRECTED admitted on `fixed`',
    'The broken interlock on the guard door was fixed by the fitter during the shift and tested afterwards.',
    'machine_guarding', 'The broken interlock on the guard door was fixed by the fitter during the shift', 'CORRECTED', true);
  admit('CORRECTED admitted on `replaced`',
    'The frayed sling was replaced with a new one from the store before the lift went ahead.',
    'lifting_rigging', 'The frayed sling was replaced with a new one from the store', 'CORRECTED', true);
  admit('CORRECTED admitted on `made good`',
    'The gouged section of flooring outside the press shop was made good with new plate before the shift ended.',
    'walking_working_surfaces', 'The gouged section of flooring outside the press shop was made good with new plate', 'CORRECTED', true);
  admit('CORRECTED admitted on `reset`',
    'The tripped overload on the conveyor was reset after the jam was cleared and the belt ran normally.',
    'machine_guarding', 'The tripped overload on the conveyor was reset after the jam was cleared', 'CORRECTED', true);
  admit('CORRECTED admitted on nominal correction (L3-2f F4, must not regress)',
    'The rigger drew a replacement from the store and the worn sling went in the scrap bin.',
    'lifting_rigging', 'The rigger drew a replacement from the store', 'CORRECTED', true);
  admit('CORRECTED still REFUSED on a negated correction (L3-2f guard)',
    'No replacement guard was fitted to the bench grinder before the shift finished.',
    'machine_guarding', 'No replacement guard was fitted to the bench grinder', 'CORRECTED', false);
  admit('CORRECTED still REFUSED on a mention (L3-2f guard)',
    'The replacement procedure was gone over with the crew and the split hose is still on the machine.',
    'machine_guarding', 'The replacement procedure was gone over with the crew', 'CORRECTED', false);

  out.findings.R3_admission_half_unchanged = {
    rule: 'checkStateSupported corroborates a state the model already claimed; a false positive there cannot delete a hazard',
    requirement: 'every row here must hold its recorded value across the repair',
    rows,
  };
}

// =====================================================================================
// R4 -- SERVICE WITHDRAWAL AND THE PRIOR-PHASE REJECTION FIXTURES MUST NOT MOVE.
// =====================================================================================
{
  const rows: any[] = [];
  rows.push({
    fixture: 'UNAMBIGUOUS_SERVICE_WITHDRAWAL still rejects ACTIVE', mustSurvive: false,
    ...bind('The cracked pedestal grinder was removed from service and red-tagged at the start of the shift.',
      'machine_guarding', 'The cracked pedestal grinder was removed from service and red-tagged', 'ACTIVE'),
  });
  rows.push({
    fixture: 'L3-2e -- bare `removed` of a CONTROL must still survive as ACTIVE', mustSurvive: true,
    ...bind('The chain guard on the drive sprocket has been removed and the machine is still being run.',
      'machine_guarding', 'The chain guard on the drive sprocket has been removed', 'ACTIVE'),
  });
  rows.push({
    fixture: 'L3-2d DISC-03 -- `discarded` as a modifier must still survive', mustSurvive: true,
    ...bind('Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris.',
      'electrical', 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris', 'ACTIVE'),
  });
  rows.push({
    fixture: 'L3-2c DISC-04 -- `applied` inside a negation must still survive', mustSurvive: true,
    ...bind('No lockout is applied to the mixer and the fitter has his arm inside the bowl.',
      'loto_stored_energy', 'No lockout is applied to the mixer', 'ACTIVE'),
  });
  out.findings.R4_prior_phase_rejection_fixtures = { rows };
}

// ---------------------------------------------------------------- summary

const allRows: any[] = [];
for (const [k, v] of Object.entries<any>(out.findings)) {
  for (const r of (v.rows || [])) allRows.push({ finding: k, ...r });
}
const scored = allRows.filter(r => typeof r.mustSurvive === 'boolean');
const holding = scored.filter(r => r.survived === r.mustSurvive);
// A row flagged `acceptedTreatmentCost` is reported SEPARATELY rather than counted as a failure or
// quietly re-labelled. Its expectation records the PRE-repair behaviour and is left standing, so the
// before/after pair shows the cost instead of concealing it.
const deviating = scored.filter(r => r.survived !== r.mustSurvive);
out.summary = {
  totalFixtures: scored.length,
  holding: holding.length,
  deviating: deviating.length,
  unexplainedDeviations: deviating.filter(r => !r.acceptedTreatmentCost).map(r => r.fixture || r.token || r.label),
  acceptedTreatmentCosts: deviating.filter(r => r.acceptedTreatmentCost).map(r => r.fixture || r.token || r.label),
};

const dest = process.env.OUT || 'binder-residual.json';
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`wrote ${dest}`);
console.log(`fixtures ${out.summary.holding}/${out.summary.totalFixtures} holding`);
for (const r of scored) {
  if (r.survived !== r.mustSurvive) {
    console.log(`  NOT HOLDING  ${r.finding}  ${r.fixture || r.token || r.label}`);
    console.log(`               survived=${r.survived} expected=${r.mustSurvive} codes=${r.fatalCodes.join(',')}`);
    if (r.detail) console.log(`               ${r.detail}`);
  }
}
