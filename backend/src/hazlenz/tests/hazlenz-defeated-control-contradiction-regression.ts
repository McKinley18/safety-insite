// Safety-semantics regression coverage for the 2026-08-18 pre-commit closure.
//
// Two defects found by the capability-truth audit are frozen here because both were SAFETY
// MEANING INVERSIONS -- the engine reported a safe/controlled state for an actively dangerous
// condition, which is strictly worse than saying nothing:
//
//   1. DEFEATED PROTECTIVE DEVICE READ AS AN EFFECTIVE CONTROL.
//      "The interlock guard on the press brake is installed but has been bypassed with a jumper
//      wire so the machine runs with the guard open" matched the "guard ... installed" pattern
//      in shared-evidence-facts.ts and was extracted as guardState = 'present_and_effective'.
//      That made 1910.212(a)(1) NOT_APPLICABLE, and evidence-foundation's suppressed-only branch
//      then reported the WHOLE observation as a Controlled condition with risk 0 -- output
//      indistinguishable from a verified-good guard.
//
//   2. CONTRADICTED HAZARDOUS-ENERGY CONTROL ERASING THE HAZARD.
//      Every LOTO detector in multi-hazard-decomposition requires the observation to state a
//      control FAILURE in recognised words. An observation that states the control as APPLIED
//      and then contradicts it ("the operator says the machine was locked out, but the
//      disconnect was found in the ON position and no lock or tag was present") satisfied none
//      of them and the per-fragment gates zeroed the route, so the hazard disappeared entirely:
//      no domain, no standard, no question. Conflicting evidence silently produced a clean
//      result.
//
// The invariants asserted here are semantic, not lexical: a control that is bypassed, defeated,
// overridden, jumpered, taped, blocked, or disabled is NOT effective; a control claim that is
// contradicted or unverified does NOT establish isolation and does NOT delete the hazard; and
// genuinely functioning, restored-and-verified, or fully-verified states must still read as
// controlled so that strengthening bypass detection cannot turn safe observations into hazards.
import { buildEvidenceFacts } from '../evidence/shared-evidence-facts';
import { MultiHazardDecompositionService } from '../multi-hazard-decomposition/multi-hazard-decomposition.service';
import { applyEvidenceFoundation } from '../evidence/evidence-foundation';

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
  }
}

const decomposer = new MultiHazardDecompositionService();

function guardState(text: string): string | undefined {
  const facts = buildEvidenceFacts({ text, scopes: ['osha_general_industry'] });
  const found = facts.facts.find(f => f.type === 'guardState');
  return found ? String(found.value) : undefined;
}

function isolationState(text: string): string | undefined {
  const facts = buildEvidenceFacts({ text, scopes: ['osha_general_industry'] });
  const found = facts.facts.find(f => f.type === 'energyIsolationState');
  return found ? String(found.value) : undefined;
}

function domains(text: string): string[] {
  const result = decomposer.decompose(text) as any;
  return (result.hazards || []).map((h: any) => String(h.domainId));
}

function hazardFor(text: string, domainId: string): any {
  const result = decomposer.decompose(text) as any;
  return (result.hazards || []).find((h: any) => h.domainId === domainId);
}

// ---------------------------------------------------------------------------------------
// 1. Defeated protective devices are not effective controls.
// ---------------------------------------------------------------------------------------
const DEFEATED: Array<[string, string]> = [
  ['originating case: interlock guard installed but bypassed with a jumper wire',
    'The interlock guard on the press brake is installed but has been bypassed with a jumper wire so the machine runs with the guard open.'],
  ['operator bypassed the interlock', 'Operator bypassed the interlock.'],
  ['interlock defeated so the machine runs with the guard open',
    'Interlock has been defeated so the machine will run with the guard open.'],
  ['jumper installed across the safety interlock (device named after the action)',
    'Jumper installed across the safety interlock.'],
  ['interlock installed but intentionally disabled', 'Interlock is installed but has been intentionally disabled.'],
  ['light curtain taped over', 'The light curtain on the press was taped over so production would not stop.'],
  ['safety gate blocked open', 'The safety gate on the robot cell is blocked open with a piece of angle iron.'],
  ['limit switch overridden', 'The limit switch on the hoist has been overridden.'],
];
for (const [name, text] of DEFEATED) {
  check(`defeated control is ineffective: ${name}`,
    guardState(text) === 'absent_or_ineffective', { text, guardState: guardState(text) });
}

// ---------------------------------------------------------------------------------------
// 2. Genuinely effective controls must still read as effective (no over-correction).
// ---------------------------------------------------------------------------------------
const EFFECTIVE: Array<[string, string]> = [
  ['fixed guard verified in place and interlock function-tested',
    'The press brake point of operation is fully enclosed by a fixed guard that was verified in place and the interlock was function-tested this morning.'],
  ['machine interlock is functioning normally', 'The machine interlock is functioning normally.'],
  ['guard interlock tested and works as designed', 'Guard interlock tested and works as designed.'],
  ['previously bypassed but restored and function-tested',
    'Interlock was previously bypassed but has now been restored and function-tested.'],
];
for (const [name, text] of EFFECTIVE) {
  check(`effective control still reads effective: ${name}`,
    guardState(text) === 'present_and_effective', { text, guardState: guardState(text) });
}

// ---------------------------------------------------------------------------------------
// 3. A merely SUSPECTED bypass asserts nothing in either direction.
// ---------------------------------------------------------------------------------------
{
  const text = 'Worker says the interlock may have been bypassed; condition not yet confirmed.';
  check('suspected bypass asserts neither an effective control nor an established deficiency',
    guardState(text) === undefined, { text, guardState: guardState(text) });
}

// ---------------------------------------------------------------------------------------
// 4. Unverified or contradicted isolation is never recorded as isolated_and_verified.
// ---------------------------------------------------------------------------------------
const NOT_VERIFIED: Array<[string, string]> = [
  ['locked out but isolation could not be verified', 'Worker says equipment is locked out, but I could not verify isolation.'],
  ['locked and tagged out but disconnect may still be energized',
    'Machine is locked and tagged out. Worker reports the disconnect may still be energized.'],
  ['lockout complete but voltage measured at the work point',
    'Supervisor says lockout is complete; electrician measured voltage at the work point.'],
  ['de-energized and locked out but stored hydraulic pressure remains',
    'Equipment was de-energized and locked out, but the operator says stored hydraulic pressure remains.'],
  ['lock installed but power never verified', 'Lock is installed but another employee says power was never verified.'],
];
for (const [name, text] of NOT_VERIFIED) {
  check(`unverified/contradicted isolation is not "verified": ${name}`,
    isolationState(text) !== 'isolated_and_verified', { text, isolationState: isolationState(text) });
}

{
  const text = 'Disconnect is open, lock applied, zero-energy verification completed, and stored energy relieved.';
  check('fully verified zero-energy state still extracts isolated_and_verified',
    isolationState(text) === 'isolated_and_verified', { text, isolationState: isolationState(text) });
}

{
  const text = 'The operator says the machine was locked out, but the disconnect was found in the ON position and no lock or tag was present on it.';
  check('an explicit "no lock or tag was present" still extracts not_isolated',
    isolationState(text) === 'not_isolated', { text, isolationState: isolationState(text) });
}

// ---------------------------------------------------------------------------------------
// 5. A contradiction reduces confidence; it must never delete the hazard.
// ---------------------------------------------------------------------------------------
const CONTRADICTED_SURVIVES: Array<[string, string]> = [
  ['originating case: says locked out, disconnect found ON, no lock or tag',
    'The operator says the machine was locked out, but the disconnect was found in the ON position and no lock or tag was present on it.'],
  ['locked and tagged out but disconnect may still be energized',
    'Machine is locked and tagged out. Worker reports the disconnect may still be energized.'],
  ['lock installed but power never verified', 'Lock is installed but another employee says power was never verified.'],
  ['lockout complete but voltage measured at the work point',
    'Supervisor says lockout is complete; electrician measured voltage at the work point.'],
  ['locked out but isolation could not be verified', 'Worker says equipment is locked out, but I could not verify isolation.'],
];
for (const [name, text] of CONTRADICTED_SURVIVES) {
  const found = domains(text);
  check(`contradicted energy control preserves a hazardous-energy finding: ${name}`,
    found.includes('lockout_tagout') || found.includes('hydraulic_pneumatic_energy'), { text, domains: found });
}

{
  const text = 'The operator says the machine was locked out, but the disconnect was found in the ON position and no lock or tag was present on it.';
  const hazard = hazardFor(text, 'lockout_tagout');
  check('the preserved contradiction finding is ACTIVE, requires review, and carries the contradiction as its evidence gap',
    !!hazard && hazard.conditionState === 'ACTIVE' && hazard.requiresHumanReview === true &&
    (hazard.evidenceGaps || []).some((gap: string) => /contradict|unresolved/i.test(gap)) &&
    (hazard.reviewerQuestions || []).some((q: string) => /zero-energy|verified/i.test(q)),
    hazard && { state: hazard.conditionState, gaps: hazard.evidenceGaps, questions: hazard.reviewerQuestions });
}

{
  const text = 'Disconnect is open, lock applied, zero-energy verification completed, and stored energy relieved.';
  check('a fully verified isolation is NOT turned into a hazard by contradiction preservation',
    !domains(text).includes('lockout_tagout'), { text, domains: domains(text) });
}

{
  // Positive and negative evidence about DIFFERENT hazards in one observation: the LOTO
  // deficiency is already owned by the ordinary detectors, so contradiction preservation must
  // not add a second, whole-observation finding that absorbs the electrical clause.
  const text = 'A worker is servicing the stamping press and hazardous energy has not been isolated or locked out. '
    + 'Nearby, a portable generator power cord has exposed copper conductors and remains energized.';
  const found = domains(text);
  const loto = found.filter(d => d === 'lockout_tagout');
  check('a stated LOTO deficiency alongside an electrical hazard yields exactly one LOTO finding and one electrical finding',
    loto.length === 1 && found.includes('electrical'), { domains: found });
  const hazard = hazardFor(text, 'lockout_tagout');
  check('that LOTO finding is not a whole-observation catch-all that absorbs the electrical clause',
    !!hazard && !/exposed copper conductors/i.test(String(hazard.observationFragment || '')),
    hazard && hazard.observationFragment);
}

// ---------------------------------------------------------------------------------------
// 6. Residual/stored energy despite partial LOTO is still a hazardous-energy finding.
// ---------------------------------------------------------------------------------------
{
  const text = 'Equipment was de-energized and locked out, but the operator says stored hydraulic pressure remains.';
  const found = domains(text);
  check('stored energy remaining after partial isolation is preserved as a hazardous-energy finding',
    found.includes('hydraulic_pneumatic_energy') || found.includes('lockout_tagout'), { domains: found });
}

// ---------------------------------------------------------------------------------------
// 7. An unstated fact is UNKNOWN, never FALSE.
//
// The 1910.36 / 1926.34(a) "occupied workplace" predicate was a bare boolean, so an observation
// that simply did not use the word "employees" CONTRADICTED the standard, and a
// contradicted-only decision set was then reported as a Controlled condition at risk 0 -- a
// blocked exit presented as safe.
// ---------------------------------------------------------------------------------------
{
  // Uses the public entry point (the same one the classify pipeline calls), not an internal.
  const decisions = (text: string, scope: string): Array<[string, string]> => {
    const result: any = applyEvidenceFoundation({ hazards: [] }, { text, scopes: [scope] } as any);
    return (result.applicabilityDecisions || []).map((d: any) => [String(d.citation), String(d.status)]);
  };
  const blocked = decisions('exit door by shipping blocked w/ pallets abt 4 high, been like that all week', 'osha_general_industry');
  const egress = blocked.find(([citation]) => citation.includes('1910.36'));
  check('a blocked exit with unstated occupancy is UNKNOWN (a candidate), never CONTRADICTED',
    !!egress && egress[1] === 'UNKNOWN', blocked);

  const occupied = decisions('the ground-floor exit door is chained shut while twelve workers are on shift', 'osha_general_industry');
  const occupiedEgress = occupied.find(([citation]) => citation.includes('1910.36'));
  check('a blocked exit with stated occupancy is still SUPPORTED', !!occupiedEgress && occupiedEgress[1] === 'SUPPORTED', occupied);

  const open = decisions('checked the shipping exit route; exit is open, unlocked, illuminated and clear', 'osha_general_industry');
  const openEgress = open.find(([citation]) => citation.includes('1910.36'));
  check('a genuinely open and usable exit is still NOT_APPLICABLE (no over-correction)',
    !!openEgress && openEgress[1] === 'NOT_APPLICABLE', open);
}

console.log(`\nHazLenz defeated-control / contradiction regression: ${failures === 0 ? 'all invariants passed' : `${failures} FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
