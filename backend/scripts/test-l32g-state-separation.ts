/**
 * L3-2g -- OFFLINE SUITE. No network, no database, no model.
 *
 * WHAT IT PINS
 *   A. the binder residual repair -- `UNAMBIGUOUS_CORRECTION` as the rejection vocabulary, with
 *      every ambiguous token measured out of it and every unambiguous one measured still in;
 *   B. the admission half UNMOVED, which is what makes (A) safe;
 *   C. `state-facts.ts` -- the deterministic resolver's safety properties, above all `L3-INV-04`;
 *   D. the multi-hazard scoring-harness correction;
 *   E. the CONTAINMENT of the new module: it must remain off the customer path.
 *
 * ASSERTIONS ARE BOUND TO GUARANTEES, NOT TO LITERALS. §35.7 and §36.9 both record prior-phase
 * assertions that had to be rebound because they pinned a literal (a version string, a sentence)
 * rather than the property it protected. Nothing here asserts a specific word is present in a list;
 * it asserts the BEHAVIOUR the list exists to produce.
 *
 * Run: npx ts-node scripts/test-l32g-state-separation.ts
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import {
  resolveConditionState, checkResolutionAgreement, coerceStateFacts, stateFactsSchemaFragment,
  L3_CONTROL_READINGS, type L3StateFacts,
} from '../src/safescope-v2/reasoning-l3/state-facts';

let passed = 0; const failures: string[] = [];
function ok(cond: boolean, label: string) {
  if (cond) passed += 1; else failures.push(label);
}

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'housekeeping', 'confined_space',
  'noise_exposure', 'lifting_rigging', 'mobile_equipment'];

function mk(text: string): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32g-suite', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}

function survives(text: string, family: string, quote: string, state: HazardCandidate['conditionState']): boolean {
  const input = mk(text);
  const src = input.authoritativeSources[0].text;
  const start = src.indexOf(quote);
  if (start < 0) throw new Error(`fixture quote not verbatim: ${JSON.stringify(quote)}`);
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
  if (v.state !== 'VALID' || !v.validated) return false;
  return bindEvidenceSemantically(v.validated, input).boundHazards.some(h => h.candidateKey === 'k1');
}

// =====================================================================================
// A. THE BINDER RESIDUAL -- ambiguous tokens must no longer DELETE a correct ACTIVE.
//
// Each row is the shape that actually reaches `checkContradiction`: the token is INSIDE the cited
// span, because that check reads `citedText(h)` and a narrow quote never reaches it at all.
// =====================================================================================
{
  ok(survives(
    'A DANGER OPEN PIT sign is fixed to the handrail post beside the inspection pit in the workshop floor and the pit is left open across the walkway.',
    'walking_working_surfaces', 'A DANGER OPEN PIT sign is fixed to the handrail post', 'ACTIVE'),
  'A1 F-WC-02 -- `fixed` predicated of a SIGN must not delete the ACTIVE pit finding');

  ok(survives(
    'The breaker feeding the mixer was reset twice this shift and the trailing lead is still crushed flat where the pallet truck runs over it.',
    'electrical', 'The breaker feeding the mixer was reset twice this shift and the trailing lead is still crushed flat', 'ACTIVE'),
  'A2 `reset` -- a breaker reset onto a live fault corrects nothing');

  ok(survives(
    'The maintenance ticket was resolved on the system yesterday and the emergency stop on the line is still painted over and unreachable.',
    'machine_guarding', 'The maintenance ticket was resolved on the system yesterday and the emergency stop on the line is still painted over', 'ACTIVE'),
  'A3 `resolved` -- a ticket resolved is a record, not a repair');

  ok(survives(
    'The damaged handrail was addressed at the safety meeting on Monday and the middle section is still hanging loose over the stair flight.',
    'falls', 'The damaged handrail was addressed at the safety meeting on Monday and the middle section is still hanging loose', 'ACTIVE'),
  'A4 `addressed` -- raised in a meeting is not repaired');

  ok(survives(
    'The hot work permit was closed out at the end of the job and the gas bottles are still stood unsecured against the partition wall.',
    'chemical_storage', 'The hot work permit was closed out at the end of the job and the gas bottles are still stood unsecured', 'ACTIVE'),
  'A5 `closed out` -- a paperwork state is not a physical state');

  ok(survives(
    'Power was restored to the packing hall after the outage and the distribution board door is still missing with the busbars open to touch.',
    'electrical', 'Power was restored to the packing hall after the outage and the distribution board door is still missing', 'ACTIVE'),
  'A6 `restored` -- supply restored, defect untouched');

  ok(survives(
    'The insulation on the oven feed cable has been destroyed by heat and the bare conductors are showing along the tray.',
    'electrical', 'The insulation on the oven feed cable has been destroyed by heat and the bare conductors are showing', 'ACTIVE'),
  'A7 `destroyed` -- describing DAMAGE, which IS the hazard, must not read as disposal');

}

// =====================================================================================
// A''. THE LINE IS AT SENSE, NOT AT OBJECT -- and these rows are why.
//
// `replaced`, `reinstalled` and `applied` were ALSO measured deleting a correct ACTIVE under a
// broad quote, and removing them broke two prior-phase gates that are RIGHT:
// `test:l32b-binder-precision` "unhandled contradiction is fatal" (the guard itself was replaced)
// and `test:l32e-syntactic-role` "PAIR/unnegated correction" (a full lockout was applied).
//
// They keep the rejection role. These assertions pin BOTH halves of that decision, so the residual
// is recorded in the suite rather than only in a comment -- the same-sense-different-object case
// still deletes, and is a known, accepted `DISC-02`-shaped precision/recall trade.
// =====================================================================================
{
  ok(!survives(
    'The tongue guard was missing at the start of the shift. The guard was replaced before lunch and the machine was returned to service.',
    'machine_guarding', 'The guard was replaced before lunch', 'ACTIVE'),
  "A''1 `replaced` of the HAZARD ITSELF must still contradict ACTIVE (pins test:l32b's gate)");

  ok(!survives(
    'The crew stopped work and a full lockout was applied at the disconnect before the guard came off.',
    'loto_stored_energy', 'a full lockout was applied at the disconnect', 'ACTIVE'),
  "A''2 `applied` of a real CONTROL must still contradict ACTIVE (pins test:l32e's gate)");

  // The accepted residual, asserted so it cannot change silently and be mistaken for a repair.
  ok(!survives(
    'The battery on the pallet truck was replaced at the start of the shift and the brake is still binding hard to the left.',
    'mobile_equipment', 'The battery on the pallet truck was replaced at the start of the shift and the brake is still binding', 'ACTIVE'),
  "A''3 KNOWN RESIDUAL -- same-sense-different-object under a BROAD quote still deletes. Recorded, not closed.");

  // ...and the narrow quote the prompt actually asks for does NOT trip it, which is what bounds the
  // residual's real-world exposure.
  ok(survives(
    'The battery on the pallet truck was replaced at the start of the shift and the brake is still binding hard to the left.',
    'mobile_equipment', 'the brake is still binding hard to the left', 'ACTIVE'),
  "A''4 the SHORTEST-SPAN quote the prompt requires does not reach the check -- the residual's bound");
}

// =====================================================================================
// A'. THE REJECTION HALF MUST STILL REJECT. Removing ambiguity is not disarming the check.
// =====================================================================================
{
  ok(!survives(
    'The gouged section of flooring outside the press shop was made good with new plate before the shift ended.',
    'walking_working_surfaces', 'The gouged section of flooring outside the press shop was made good with new plate', 'ACTIVE'),
  "A'1 `made good` -- an unambiguous asserted repair must still contradict ACTIVE");

  ok(!survives(
    'The torn conveyor belt was repaired with a vulcanised joint and ran correctly for the rest of the shift.',
    'machine_guarding', 'The torn conveyor belt was repaired with a vulcanised joint', 'ACTIVE'),
  "A'2 `repaired` -- the unambiguous core must still contradict ACTIVE");

  ok(!survives(
    'The reversed polarity on the socket outlet was corrected by the electrician before the area was handed back.',
    'electrical', 'The reversed polarity on the socket outlet was corrected by the electrician', 'ACTIVE'),
  "A'3 `corrected` -- takes the defect as its object by definition");

  ok(!survives(
    'The cracked pedestal grinder was removed from service and red-tagged at the start of the shift.',
    'machine_guarding', 'The cracked pedestal grinder was removed from service and red-tagged', 'ACTIVE'),
  "A'4 UNAMBIGUOUS_SERVICE_WITHDRAWAL still rejects (L3-2e, unchanged)");

  ok(survives(
    'The chain guard on the drive sprocket has been removed and the machine is still being run.',
    'machine_guarding', 'The chain guard on the drive sprocket has been removed', 'ACTIVE'),
  "A'5 L3-2e -- bare `removed` of a CONTROL must still survive");

  ok(survives(
    'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris.',
    'electrical', 'Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris', 'ACTIVE'),
  "A'6 L3-2d DISC-03 -- `discarded` as an attributive modifier must still survive");

  ok(!survives(
    'The frayed sling was discarded into the scrap bin after the lift finished.',
    'lifting_rigging', 'The frayed sling was discarded into the scrap bin', 'ACTIVE'),
  "A'7 `discarded` as an ASSERTED predicate is disposal and must still reject -- role, not vocabulary, separates A'6 from this");

  ok(survives(
    'No lockout is applied to the mixer and the fitter has his arm inside the bowl.',
    'loto_stored_energy', 'No lockout is applied to the mixer', 'ACTIVE'),
  "A'8 L3-2c DISC-04 -- `applied` inside a negation must still survive");
}

// =====================================================================================
// B. THE ADMISSION HALF IS UNMOVED. This is what makes A safe: a token that no longer DELETES
//    still CORROBORATES a CORRECTED state the model itself chose.
// =====================================================================================
{
  ok(survives(
    'The broken interlock on the guard door was fixed by the fitter during the shift and tested afterwards.',
    'machine_guarding', 'The broken interlock on the guard door was fixed by the fitter during the shift', 'CORRECTED'),
  'B1 CORRECTED still admitted on `fixed`');

  ok(survives(
    'The tripped overload on the conveyor was reset after the jam was cleared and the belt ran normally.',
    'machine_guarding', 'The tripped overload on the conveyor was reset after the jam was cleared', 'CORRECTED'),
  'B2 CORRECTED still admitted on `reset`');

  ok(survives(
    'The rigger drew a replacement from the store and the worn sling went in the scrap bin.',
    'lifting_rigging', 'The rigger drew a replacement from the store', 'CORRECTED'),
  'B3 L3-2f F4 -- nominal correction still admitted');

  ok(!survives(
    'No replacement guard was fitted to the bench grinder before the shift finished.',
    'machine_guarding', 'No replacement guard was fitted to the bench grinder', 'CORRECTED'),
  'B4 L3-2f guard -- a NEGATED nominal correction is still refused');

  ok(!survives(
    'The replacement procedure was gone over with the crew and the split hose is still on the machine.',
    'machine_guarding', 'The replacement procedure was gone over with the crew', 'CORRECTED'),
  'B5 L3-2f guard -- a MENTION still corrects nothing');
}

// =====================================================================================
// C. THE DETERMINISTIC RESOLVER.
// =====================================================================================
{
  const base: L3StateFacts = {
    hazardAsserted: false, hazardAssertionQuote: '', controlReading: 'NOT_STATED', controlQuote: null,
    framing: 'ACTUAL', disposition: 'NONE', decisionCriticalFactMissing: false, missingFact: null,
    hazardExplicitlyDenied: false,
  };
  const f = (o: Partial<L3StateFacts>): L3StateFacts => ({ ...base, ...o });

  // ---- L3-INV-04: NO DEFAULT ACTIVE. This is the single most important property in the module.
  ok(resolveConditionState(base).state !== 'ACTIVE',
    'C1 L3-INV-04 -- wholly empty facts must NOT resolve to ACTIVE');
  ok(resolveConditionState(base).state === 'UNKNOWN',
    'C2 wholly empty facts resolve to UNKNOWN');

  // Exhaustive: ACTIVE must be unreachable whenever `hazardAsserted` is false, for EVERY
  // combination of the other fields. This is a proof, not a sample.
  {
    let anyActive = false; let combos = 0;
    for (const controlReading of L3_CONTROL_READINGS) {
      for (const framing of ['ACTUAL', 'CONDITIONAL'] as const) {
        for (const disposition of ['NONE', 'CORRECTED', 'WITHDRAWN_FROM_SERVICE'] as const) {
          for (const missing of [false, true]) {
            for (const denied of [false, true]) {
              combos += 1;
              const r = resolveConditionState(f({
                hazardAsserted: false, controlReading, framing, disposition,
                decisionCriticalFactMissing: missing, missingFact: missing ? 'x' : null,
                hazardExplicitlyDenied: denied,
              }));
              if (r.state === 'ACTIVE') anyActive = true;
            }
          }
        }
      }
    }
    ok(!anyActive && combos === 120,
      `C3 L3-INV-04 EXHAUSTIVE -- ACTIVE unreachable without hazardAsserted across all ${combos} combinations`);
  }

  // ---- the control axis, which is §36.4's mechanism expressed as a branch.
  ok(resolveConditionState(f({ hazardAsserted: true, controlReading: 'WARNS_ONLY', controlQuote: 'warning tape' })).state === 'ACTIVE',
    'C4 asserted hazard + WARNS_ONLY -> ACTIVE (E-FLD-147 / F-WC-02 / F-WC-03 class)');
  ok(resolveConditionState(f({ hazardAsserted: true, controlReading: 'DEFEATED', controlQuote: 'strapped down with tape' })).state === 'ACTIVE',
    'C5 asserted hazard + DEFEATED -> ACTIVE (F-WC-09 class)');
  ok(resolveConditionState(f({ hazardAsserted: true, controlReading: 'ABSENT' })).state === 'ACTIVE',
    'C6 asserted hazard + ABSENT -> ACTIVE (E-OA-07 class)');
  ok(resolveConditionState(f({ hazardAsserted: true, controlReading: 'PREVENTS_CONTACT', controlQuote: 'a fitted guard' })).state === 'CONTROLLED',
    'C7 asserted hazard + PREVENTS_CONTACT -> CONTROLLED');
  ok(resolveConditionState(f({ hazardAsserted: true, controlReading: 'NOT_STATED' })).state === 'ACTIVE',
    'C8 asserted hazard, control unmentioned -> ACTIVE (H-NG-02 class: no retreat to INSUFFICIENT)');

  // ---- disposition outranks the control reading.
  ok(resolveConditionState(f({ hazardAsserted: true, controlReading: 'ABSENT', disposition: 'CORRECTED' })).state === 'CORRECTED',
    'C9 disposition CORRECTED outranks an absent control');
  ok(resolveConditionState(f({ hazardAsserted: true, disposition: 'WITHDRAWN_FROM_SERVICE' })).state === 'REMOVED_FROM_SERVICE',
    'C10 disposition WITHDRAWN -> REMOVED_FROM_SERVICE');

  // ---- framing, and the conjunction that makes it safe.
  ok(resolveConditionState(f({ framing: 'CONDITIONAL' })).state === 'HYPOTHETICAL',
    'C11 conditional framing without assertion -> HYPOTHETICAL (C-CS-05 class)');
  ok(resolveConditionState(f({ hazardAsserted: true, framing: 'CONDITIONAL', controlReading: 'ABSENT' })).state === 'ACTIVE',
    'C12 a contingency attached to a PRESENT fact does not make the fact contingent');

  // ---- the clarification axis.
  const miss = resolveConditionState(f({ decisionCriticalFactMissing: true, missingFact: 'whether they were clipped on' }));
  ok(miss.state === 'INSUFFICIENT_EVIDENCE' && miss.clarificationOwed,
    'C13 decision-critical fact missing -> INSUFFICIENT_EVIDENCE with a clarification owed');
  for (const st of ['ACTIVE', 'CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED', 'HYPOTHETICAL'] as const) {
    const r = st === 'ACTIVE' ? resolveConditionState(f({ hazardAsserted: true, controlReading: 'ABSENT' }))
      : st === 'CONTROLLED' ? resolveConditionState(f({ hazardAsserted: true, controlReading: 'PREVENTS_CONTACT' }))
        : st === 'CORRECTED' ? resolveConditionState(f({ hazardAsserted: true, disposition: 'CORRECTED' }))
          : st === 'REMOVED_FROM_SERVICE' ? resolveConditionState(f({ hazardAsserted: true, disposition: 'WITHDRAWN_FROM_SERVICE' }))
            : st === 'NEGATED' ? resolveConditionState(f({ hazardExplicitlyDenied: true }))
              : resolveConditionState(f({ framing: 'CONDITIONAL' }));
    ok(r.state === st && !r.clarificationOwed,
      `C14.${st} L3-INV-06 / §34.2 -- a DECIDED state never owes a clarification`);
  }

  ok(resolveConditionState(f({ hazardExplicitlyDenied: true })).state === 'NEGATED',
    'C15 explicit denial -> NEGATED');

  // ---- CHECK mode surfaces a self-contradiction the single-enum contract could not express.
  const agree = checkResolutionAgreement(
    f({ hazardAsserted: true, controlReading: 'WARNS_ONLY', controlQuote: 'a sign' }), 'CONTROLLED');
  ok(!agree.agrees && agree.derivedState === 'ACTIVE' && agree.disagreementLosesHazard,
    'C16 CHECK mode flags a model CONTROLLED against its own WARNS_ONLY facts, in the hazard-losing direction');

  // ---- coercion must never manufacture an assertion.
  ok(coerceStateFacts(null) === null, 'C17 null facts coerce to null, never to a default');
  const junk = coerceStateFacts({ hazardAsserted: 'yes', controlReading: 'BANANA', framing: 'SIDEWAYS', disposition: 'NOPE' })!;
  ok(junk.hazardAsserted === false && junk.controlReading === 'NOT_STATED'
    && junk.framing === 'ACTUAL' && junk.disposition === 'NONE',
    'C18 malformed facts coerce to the NON-ASSERTING value in every field');
  ok(resolveConditionState(junk).state !== 'ACTIVE',
    'C19 malformed facts cannot resolve to ACTIVE');

  // ---- §31.1's portability finding must not be reintroduced by the new schema surface.
  const frag = JSON.stringify(stateFactsSchemaFragment());
  ok(!frag.includes('minLength') && !frag.includes('minItems'),
    'C20 the stateFacts schema uses neither minLength nor minItems (§31.1 portability finding)');
}

// =====================================================================================
// D. THE MULTI-HAZARD SCORING-HARNESS CORRECTION.
// =====================================================================================
{
  const scorer = readFileSync(join(__dirname, 'score-l32f-reasoning.ts'), 'utf8');
  ok(/minCandidates\s*\?\?\s*r\.expect\.minimumCandidates/.test(scorer),
    'D1 the L3-2f scorer reads BOTH decomposition keys');

  const holdout = JSON.parse(readFileSync(
    join(__dirname, '..', 'src', 'safescope-v2', 'reasoning-l3', 'eval', 'holdout-l32f.json'), 'utf8'));
  const rows = holdout.scenarios || holdout;
  const mh = rows.filter((r: any) => r?.expect
    && (r.expect.minCandidates !== undefined || r.expect.minimumCandidates !== undefined));
  ok(mh.length >= 1, 'D2 the frozen L3-2f holdout carries at least one decomposition-scored row');
  ok(mh.every((r: any) => (r.expect.minCandidates ?? r.expect.minimumCandidates) !== undefined),
    'D3 every such row is reachable through the corrected reader');
}

// =====================================================================================
// E. CONTAINMENT. `state-facts.ts` must not have acquired customer authority.
// =====================================================================================
{
  const src = readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'reasoning-l3', 'state-facts.ts'), 'utf8');
  ok(!/@(Injectable|Entity|Column|InjectRepository)/.test(src),
    'E1 state-facts.ts carries no Nest or TypeORM decorator');
  ok(!/\bimport\b[^\n]*(typeorm|@nestjs)/.test(src),
    'E2 state-facts.ts imports no persistence or framework module');

  // Nothing outside reasoning-l3 -- and nothing on the shipped reasoning path -- may import it.
  const { execSync } = require('child_process');
  const importers = execSync(
    `grep -rl "state-facts" ${join(__dirname, '..', 'src')} ${__dirname} || true`,
    { encoding: 'utf8' },
  ).split('\n').map((s: string) => s.trim()).filter(Boolean);
  const outsideL3 = importers.filter((p: string) => !p.includes('reasoning-l3') && !p.includes('/scripts/'));
  ok(outsideL3.length === 0, `E3 no importer outside reasoning-l3 (found: ${outsideL3.join(', ')})`);

  const runner = readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'reasoning-l3', 'reasoning-runner.ts'), 'utf8');
  ok(!runner.includes('state-facts'),
    'E4 the shipped validation sequence does NOT consume state-facts -- architecture evidence only');
  const prompt = readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'reasoning-l3', 'reasoning-prompt.ts'), 'utf8');
  ok(!prompt.includes('state-facts'),
    'E5 the shipped prompt/schema is unchanged by L3-2g -- the structural schema lives in the harness');
}

// =====================================================================================

console.log(`\nL3-2g state separation + binder residual: ${passed} assertions passed, ${failures.length} failed`);
for (const f of failures) console.log(`  FAILED  ${f}`);
process.exit(failures.length ? 1 : 0);
