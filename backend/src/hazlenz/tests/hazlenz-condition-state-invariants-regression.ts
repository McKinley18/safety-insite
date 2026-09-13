// Regression coverage for the InSite core-correctness remediation
// (2026-08-18): condition-state/negation semantics, multi-hazard finding
// ownership, and finding-scoped standards. Protects the SEMANTIC invariants
// fixed in that session, not today's incidental exact output -- each
// assertion checks a structural property (e.g. "no ACTIVE hazard exists",
// "each finding's evidence differs", "standards don't cross-contaminate"),
// not a hardcoded score or wording that would make this brittle against
// future, unrelated tuning.
import { MultiHazardDecompositionService } from '../multi-hazard-decomposition/multi-hazard-decomposition.service';
import { HazardTaxonomyCoverageService } from '../hazard-taxonomy-coverage/hazard-taxonomy-coverage.service';

const decomp = new MultiHazardDecompositionService();
const taxonomy = new HazardTaxonomyCoverageService();

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
  }
}

function activeHazards(hazards: any[]) {
  return hazards.filter(h => !['HISTORICAL', 'SAFE_VERIFIED', 'PLANNED_FUTURE'].includes(String(h?.conditionState || '').toUpperCase()));
}

// Invariant 1: explicitly negated/safe evidence cannot independently create an ACTIVE finding.
{
  const cases = [
    'The scaffold was inspected today. There were no missing guardrails, no damaged planking, and no unsecured base plates. All components were properly secured.',
    'The conveyor\'s point-of-operation guard is securely installed, bolted in place, and fully prevents access to the moving parts. No deficiencies observed.',
    'All electrical panel covers are intact and properly secured. No exposed conductors, no damaged cords, and no missing covers were observed.',
  ];
  for (const text of cases) {
    const result = decomp.decompose(text);
    check(`Invariant 1: no ACTIVE hazard from safe/negated text — "${text.slice(0, 40)}..."`, activeHazards(result.hazards).length === 0, result.hazards);
  }
}

// Invariant 2: historical/corrected evidence cannot independently create an ACTIVE finding.
{
  const text = 'Yesterday the guardrail was missing on the east platform, but it was replaced and verified secure before this inspection began.';
  const result = decomp.decompose(text);
  check('Invariant 2: historical-corrected fall_protection hazard is HISTORICAL, not ACTIVE',
    result.hazards.some(h => h.domainId === 'fall_protection' && h.conditionState === 'HISTORICAL') && activeHazards(result.hazards).length === 0,
    result.hazards);
}

// Invariant 3: future/planned evidence cannot independently create a current ACTIVE finding.
{
  const text = 'Guardrails are planned for removal next quarter during scheduled platform maintenance; no current exposure was observed today.';
  const result = decomp.decompose(text);
  const planned = result.hazards.find(h => h.domainId === 'fall_protection');
  check('Invariant 3: planned-future fall_protection hazard is PLANNED_FUTURE, not ACTIVE',
    !!planned && planned.conditionState === 'PLANNED_FUTURE' && activeHazards(result.hazards).length === 0,
    result.hazards);
}

// Negative control: a genuine active hazard must still be detected (Invariant 1/2/3 must not
// over-suppress legitimate detection).
{
  const text = 'The rotating shaft on the conveyor drive is unguarded and a worker\'s hands are within reach of the pinch point during operation.';
  const result = decomp.decompose(text);
  check('Negative control: genuinely active machine_guarding hazard is still detected as ACTIVE',
    result.hazards.some(h => h.domainId === 'machine_guarding' && h.conditionState === 'ACTIVE'),
    result.hazards);
}

// Mixed observation: a safe clause must not suppress a genuinely unsafe sibling clause.
{
  const text = 'Guardrails are complete and fully secured on the platform, but the extension cord running across the floor has exposed conductors and damaged insulation.';
  const result = decomp.decompose(text);
  const electrical = result.hazards.find(h => h.domainId === 'electrical');
  const fallOrGuarding = result.hazards.filter(h => h.domainId === 'fall_protection' || h.domainId === 'machine_guarding');
  check('Mixed observation: electrical hazard preserved as ACTIVE',
    !!electrical && electrical.conditionState === 'ACTIVE', result.hazards);
  check('Mixed observation: safe guardrail language does not produce an ACTIVE fall/guarding finding',
    fallOrGuarding.every(h => ['HISTORICAL', 'SAFE_VERIFIED'].includes(String(h.conditionState).toUpperCase())),
    result.hazards);
}

// Invariant 4: one observation may decompose into N findings, and each finding retains its own
// evidence identity (a weak, contentless fragment must not permanently block a later fragment
// carrying a domain's real evidence).
{
  const text = 'During the shop floor walkthrough, the fixed guard on the conveyor drive shaft was found missing, exposing the rotating shaft to contact. Nearby, an extension cord running across the floor had exposed conductors and damaged insulation. A trip hazard was created by scrap material and hoses lying across the main pedestrian walkway. Separately, oil had spilled near the loading dock creating a slip hazard on the walking surface. An unsecured compressed gas cylinder was standing upright near the walkway without a valve protection cap.';
  const result = decomp.decompose(text);
  check('Invariant 4: at least 4 distinct findings decomposed from the 5-hazard observation',
    result.hazards.length >= 4, result.hazards.map(h => h.domainId));
  const fragments = result.hazards.map(h => h.observationFragment);
  check('Invariant 4: every finding has its own distinct, non-empty evidence fragment',
    fragments.every(f => f && f.trim().length > 0) && new Set(fragments).size === fragments.length,
    fragments);
  const wwsHazard = result.hazards.find(h => h.domainId === 'slips_trips_falls');
  check('Invariant 4: the walking-surfaces finding carries real hazard evidence, not a contentless scene-setting fragment',
    !!wwsHazard && /oil|spill|slip|trip/i.test(String(wwsHazard.observationFragment)),
    wwsHazard);
}

// Base router negation-awareness: a bare keyword inside a negated/safe phrase must not route to
// a hazard domain at all (the deepest layer of Invariant 1).
{
  const route = taxonomy.route('There were no missing guardrails');
  check('Base router: "no missing guardrails" does not route to any hazard domain',
    route.domainId === 'unknown', route);
}

console.log('='.repeat(60));
if (failures > 0) {
  console.error(`HazLenz condition-state invariants regression: ${failures} FAILED`);
  process.exit(1);
}
console.log('HazLenz condition-state invariants regression: all invariants passed, 0 failed');
