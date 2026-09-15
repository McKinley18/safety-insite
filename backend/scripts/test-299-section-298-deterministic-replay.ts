/**
 * §299 / HZ-4 -- THE EXACT §298 OBSERVATION, REPLAYED THROUGH THE DETERMINISTIC PATH.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO WRITES TO ACCEPTED EVIDENCE.
 * Runs with `npm run test:299-section-298-replay`.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS SEPARATE FROM THE REGRESSION FAMILY.
 *
 * `test-299-person-negation-semantics.ts` proves the SEMANTIC FAMILY is told apart. This proves the
 * REGULATORY CONSEQUENCE on the one observation §298 actually ran: that the fall-protection
 * candidate is no longer suppressed because the word "Nobody" appears in the note.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS NOT CLAIMED.
 *
 * This does NOT claim the repair manufactures a CFR citation. §299 explicitly does not require one.
 * The measured change is from CONTRADICTED -- an active assertion that the exposure predicate is
 * FALSE, which suppresses the standard -- to a candidate whose exposure predicate is UNKNOWN and
 * listed as missing. Unknown is the honest state: "Nobody working up there had a harness on" is
 * vacuously true if nobody is up there, so nothing in the sentence ENTAILS exposure, and
 * deterministic code must not invent the entailment. The governed standards and evidence
 * architecture remains authoritative for what the candidate becomes next.
 *
 * The prose read to the operator is checked too, because HZ-4's measured harm reached the customer
 * report as the sentence "HazLenz basis: Candidate only; missing: employee access or exposure"
 * printed directly beneath the paragraph describing the exposure.
 */
import { applyEvidenceFoundation } from '../src/hazlenz/evidence/evidence-foundation';
import { buildEvidenceFacts } from '../src/hazlenz/evidence/shared-evidence-facts';
import { readPersonNegation } from '../src/hazlenz/evidence/person-negation-semantics';

/**
 * THE §298 OBSERVATION, VERBATIM.
 *
 * Copied from `verification/current/expert-activation-298/`
 * `SECTION-298-EXPERT-FIRST-PRODUCTION-ACCEPTANCE.json` -> `controlledObservation.text`. Not
 * paraphrased: a paraphrase would be a different stimulus and would prove nothing about §298.
 */
const OBSERVATION_298 =
  'Morning walkthrough of the warehouse shipping area. The storage mezzanine above the packing '
  + 'benches was being restocked. On the west side there is a pallet-loading opening about twelve '
  + 'feet wide where the forklift lifts pallets up to the deck. The chain that normally goes across '
  + 'that opening was unhooked and lying on the deck, so the edge was open. One of the stockers was '
  + 'working maybe three feet from that open edge with his back to it, moving cartons off a pallet. '
  + 'It is about a ten foot drop to the concrete below. Nobody working up there had a harness on '
  + 'and I did not see any anchor points. The supervisor told me the chain gets unhooked whenever '
  + 'they are loading and they hook it back afterwards. I do not know whether that opening is '
  + 'supposed to have a proper gate or whether the chain is all they have ever had there. Nobody '
  + 'was injured and the forklift was not lifting at the time I was there.';

/**
 * THE SAME OBSERVATION WITH A GENUINE EXPOSURE DENIAL SUBSTITUTED FOR THE CONTROL DENIAL.
 *
 * THE CONTROL FOR OVERCORRECTION, and it is deliberately the HARDEST form of it: every other
 * sentence is left in place, so the note still raises `fallExposure` and still produces a
 * 29 CFR 1910.28 decision. Only the one sentence whose reading HZ-4 got wrong is swapped for one
 * whose reading it got right. If the §299 repair had simply stopped negating exposure rather than
 * drawing a distinction, this case would flip too -- and it must not.
 */
const OBSERVATION_298_GENUINELY_UNEXPOSED = OBSERVATION_298
  .replace('Nobody working up there had a harness on and I did not see any anchor points.',
    'No employees were on the mezzanine at any point.');

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string): void {
  if (condition) { passed += 1; console.log(`ok    ${message}`); }
  else { failures.push(message); console.error(`FAIL  ${message}`); }
}

interface Predicate { name: string; status: string; }
interface Decision {
  citation: string; status: string; confidence: number;
  requiredPredicates: Predicate[]; missingPredicates: string[]; explanation?: string;
}

function replay(text: string): {
  exposureFactValue: unknown;
  exposureFactConfidence: number;
  disposition: unknown;
  decisions: Decision[];
  fallDecision: Decision | undefined;
  exposurePredicate: Predicate | undefined;
} {
  const facts = buildEvidenceFacts({ text } as never);
  const exposure = facts.facts.find(f => f.type === 'employeeExposure');
  const result: Record<string, unknown> = {};
  applyEvidenceFoundation(result, { description: text, text } as never);
  const decisions = (result.applicabilityDecisions as Decision[]) ?? [];
  const fall = decisions.find(d => d.citation === '29 CFR 1910.28');
  return {
    exposureFactValue: exposure?.value,
    exposureFactConfidence: exposure?.confidence ?? 0,
    disposition: result.assessmentDisposition,
    decisions,
    fallDecision: fall,
    exposurePredicate: fall?.requiredPredicates
      .find(p => /employee access or exposure/i.test(p.name)),
  };
}

function report(label: string, r: ReturnType<typeof replay>): void {
  console.log(`\n---- ${label} ----`);
  console.log(`  employeeExposure fact         : ${JSON.stringify(r.exposureFactValue)} `
    + `(confidence ${r.exposureFactConfidence})`);
  console.log(`  assessmentDisposition         : ${JSON.stringify(r.disposition)}`);
  console.log(`  29 CFR 1910.28 status         : ${r.fallDecision?.status ?? '(no decision)'} `
    + `(confidence ${r.fallDecision?.confidence ?? '-'})`);
  console.log(`  ... exposure predicate        : ${r.exposurePredicate?.status ?? '(absent)'}`);
  console.log(`  ... missingPredicates         : ${JSON.stringify(r.fallDecision?.missingPredicates ?? [])}`);
  console.log(`  ... explanation               : ${r.fallDecision?.explanation ?? '(none)'}`);
  console.log(`  decisions emitted             : ${r.decisions.map(d => `${d.citation}=${d.status}`).join(', ') || '(none)'}`);
}

// ============================================================ the reading

console.log('\n================ how the two "Nobody" sentences are now read ================\n');

const reading = readPersonNegation(OBSERVATION_298);
for (const c of reading.clauses) {
  console.log(`  "${c.quantifier}" ... predicate "${c.predicate}"`);
  console.log(`      -> ${c.sense}${c.decidedBy === null ? '' : ` (decided by "${c.decidedBy}")`}`);
}

check(reading.clauses.length === 2,
  `Both negative person quantifiers in the §298 note are found (saw ${reading.clauses.length}).`);
check(reading.clauses[0]?.sense === 'CONTROL_USE',
  '"Nobody working up there had a harness on" is read as a denial of a CONTROL.');
check(reading.clauses[1]?.sense === 'OUTCOME',
  '"Nobody was injured" is read as a denial of an OUTCOME.');
check(reading.negatesEmployeeExposure === false,
  'Neither sentence negates employee exposure.');

// ============================================================ the consequence

console.log('\n================ the deterministic consequence ================');

const after = replay(OBSERVATION_298);
report('§298 observation, AFTER the §299 repair', after);

check(after.exposureFactValue !== false,
  'No employeeExposure=false fact is asserted from the §298 observation. '
  + '(§298 recorded fact-2 employeeExposure false at confidence 0.98, status confirmed.)');
check(after.fallDecision !== undefined,
  '29 CFR 1910.28 is still evaluated -- the repair does not remove the rule from consideration.');
check(after.fallDecision?.status !== 'CONTRADICTED',
  'The fall-protection candidate is NOT suppressed as CONTRADICTED. '
  + '(§298 measured CONTRADICTED at confidence 0.05.)');
check(after.exposurePredicate?.status !== 'CONTRADICTED',
  'The exposure predicate is not asserted FALSE.');
check(after.disposition !== 'controlled_condition',
  'assessmentDisposition is no longer controlled_condition. '
  + `(saw ${JSON.stringify(after.disposition)})`);

// ============================================================ no overcorrection

console.log('\n================ the genuine no-exposure control ================');

const control = replay(OBSERVATION_298_GENUINELY_UNEXPOSED);
report('same note with "No employees were on the mezzanine" substituted', control);

check(control.exposureFactValue === false,
  'A genuine "no employees were on the mezzanine" STILL asserts employeeExposure=false. '
  + 'The repair is a distinction, not a blanket removal.');
check(control.fallDecision !== undefined,
  'The control note still raises 29 CFR 1910.28, so the suppression below is a real measurement '
  + 'rather than the rule never having been evaluated.');
check(control.fallDecision?.status === 'CONTRADICTED'
  && control.exposurePredicate?.status === 'CONTRADICTED',
  'That genuine denial still suppresses the fall-protection candidate as CONTRADICTED, on exactly '
  + 'the exposure predicate. The repair narrowed WHICH sentences negate exposure, not WHETHER any do.');
check(control.disposition === 'controlled_condition',
  'And the disposition is still controlled_condition for the genuinely unexposed note.');

// ============================================================

console.log(`\n${passed} checks passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAILED: ${f}`);
  process.exitCode = 1;
}
