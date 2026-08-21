/**
 * KG-3F (Phases 5-7) -- the 30 CFR 56.14132 predicate/citation contract.
 *
 * KG-3E found that HazLenz emitted `30 CFR 56.14132(a)` for a backing observation, but (a) is the
 * MANUALLY-OPERATED HORN requirement. The rule that governs reversing without a warning is (b)(1),
 * and (b)(1) is triggered only "when the operator has an obstructed view to the rear" -- a condition
 * the old predicate hard-coded to `true` rather than establishing from evidence. (b)(1)(iv) also
 * makes an OBSERVER one of four compliant alternatives, so "no backup alarm" is not by itself a
 * violation.
 *
 * KG-3E therefore refused to back (a), and refused to promote to (b)(1) because the predicate could
 * not establish the trigger. KG-3F refines the predicate so the trigger IS evidence-borne, which is
 * what earns the exact paragraph.
 *
 * The contract this asserts:
 *   - (a) is emitted for HORN evidence and nothing else;
 *   - (b)(1) is emitted ONLY where an obstructed rear view is established;
 *   - where visibility is unstated, a truthful SECTION-level candidate is emitted instead;
 *   - any one compliant alternative -- functional alarm OR observer -- satisfies the rule;
 *   - a clear rear view means (b)(1) does not apply at all.
 *
 * Usage: npx ts-node scripts/test-kg3f-56-14132-predicate.ts
 */
import 'dotenv/config';
import {
  applyEvidenceFoundation,
  applyFindingScopedStandards,
} from '../src/safescope-v2/evidence/evidence-foundation';

const checks: string[] = [];
let failed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { checks.push(msg); console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}

interface Decision { citation: string; status: string; requiredPredicates: Array<{ name: string; status: string }> }

/**
 * Returns BOTH surfaces, because they answer different questions:
 *   `candidates` -- what HazLenz surfaces to the customer (NOT_APPLICABLE decisions are excluded);
 *   `decisions`  -- the full adjudication, including rules evaluated and found not to apply.
 * A satisfied rule correctly produces a NOT_APPLICABLE decision and NO candidate; asserting only on
 * candidates would not distinguish "rule satisfied" from "rule never evaluated".
 */
function select(observation: string): { candidates: string[]; decisions: Decision[] } {
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{
        hazardId: 'kg3f-1', domainId: 'unknown', hazardFamily: 'unknown',
        observationFragment: observation, mechanism: '', supportingSignals: [],
      }],
    },
  };
  applyFindingScopedStandards(result, { text: observation, scopes: ['msha'] } as any);

  // `applyFindingScopedStandards` drops NOT_APPLICABLE decisions entirely, so it cannot distinguish
  // "rule evaluated and satisfied" from "rule never evaluated". `applyEvidenceFoundation` exposes
  // the full adjudication, which is the only surface where a SATISFIED rule is observable.
  const foundation: any = { multiHazardDecomposition: result.multiHazardDecomposition };
  applyEvidenceFoundation(foundation, { text: observation, scopes: ['msha'] } as any);

  return {
    candidates: (result.multiHazardDecomposition.hazards[0].standardCandidates || [])
      .map((s: any) => String(s.citation)),
    decisions: (foundation.applicabilityDecisions || []) as Decision[],
  };
}

const decisionFor = (d: Decision[], c: string) => d.find(x => x.citation === c);
const predicateStatus = (dec: Decision | undefined, re: RegExp) =>
  dec?.requiredPredicates.find(p => re.test(p.name))?.status;

const CASES: Array<{ id: string; obs: string; expect: (r: ReturnType<typeof select>) => void }> = [
  {
    id: 'A — backing, obstructed rear view, no compliant method',
    obs: 'A haul truck at the surface mine is backing with an obstructed rear view and no functional backup alarm and no spotter present.',
    expect: ({ candidates, decisions }) => {
      assert(candidates.includes('30 CFR 56.14132(b)(1)'),
        'A: obstructed view + no method emits the EXACT paragraph (b)(1)');
      assert(!candidates.includes('30 CFR 56.14132(a)'),
        'A: does NOT emit (a) — the horn rule is not the backing rule');
      assert(predicateStatus(decisionFor(decisions, '30 CFR 56.14132(b)(1)'),
        /obstructed view to the rear/i) === 'SUPPORTED',
        'A: the obstructed-view trigger is recorded as ESTABLISHED, not assumed');
    },
  },
  {
    id: 'B — backing, rear view explicitly CLEAR',
    obs: 'A haul truck at the surface mine is backing with a clear rear view and no backup alarm.',
    expect: ({ candidates, decisions }) => {
      assert(!candidates.some(c => /56\.14132/.test(c)),
        'B: a CLEAR rear view surfaces NO 56.14132 violation to the customer');
      const dec = decisionFor(decisions, '30 CFR 56.14132');
      assert(dec?.status === 'NOT_APPLICABLE',
        'B: the rule was evaluated and adjudicated NOT_APPLICABLE — (b)(1) needs an obstructed view');
    },
  },
  {
    id: 'C — backup alarm absent but OBSERVER present',
    obs: 'A haul truck at the surface mine is backing with an obstructed rear view without a functional backup alarm, but a spotter was posted directing the reverse.',
    expect: ({ candidates, decisions }) => {
      const dec = decisionFor(decisions, '30 CFR 56.14132(b)(1)') || decisionFor(decisions, '30 CFR 56.14132');
      assert(!!dec, 'C: the backing rule is evaluated');
      assert(dec?.status === 'NOT_APPLICABLE',
        'C: an observer SATISFIES (b)(1)(iv) — "no backup alarm" alone is not a violation');
      assert(!candidates.some(c => /56\.14132/.test(c)),
        'C: no violation is surfaced to the customer');
    },
  },
  {
    id: 'D — a compliant alarm is present and functional',
    obs: 'A haul truck at the surface mine is backing with an obstructed rear view and the reverse alarm sounded correctly.',
    expect: ({ decisions }) => {
      const dec = decisionFor(decisions, '30 CFR 56.14132(b)(1)') || decisionFor(decisions, '30 CFR 56.14132');
      assert(dec?.status === 'NOT_APPLICABLE', 'D: a functional alarm satisfies the rule');
    },
  },
  {
    id: 'E — manually-operated HORN inoperative',
    obs: 'The horn on the loader at the surface mine is inoperative.',
    expect: ({ candidates }) => {
      assert(candidates.includes('30 CFR 56.14132(a)'),
        'E: horn evidence emits (a) — the horn-maintenance rule');
      assert(!candidates.includes('30 CFR 56.14132(b)(1)'),
        'E: horn evidence does NOT emit the backing rule (b)(1)');
    },
  },
  {
    id: 'F — vague "no alarm", visibility unstated (the gold-set case)',
    obs: 'A haul truck at the surface mine is backing without a functional backup alarm and no spotter present.',
    expect: ({ candidates, decisions }) => {
      assert(candidates.includes('30 CFR 56.14132'),
        'F: unstated visibility emits the truthful SECTION, matching the tracked gold set');
      assert(!candidates.includes('30 CFR 56.14132(b)(1)'),
        'F: does NOT promote to (b)(1) on an unestablished obstructed-view trigger');
      assert(!candidates.includes('30 CFR 56.14132(a)'),
        'F: does NOT emit (a) — the KG-3E defect is repaired');
      assert(predicateStatus(decisionFor(decisions, '30 CFR 56.14132'),
        /obstructed view to the rear/i) === 'UNKNOWN',
        'F: obstructed view is recorded as an OPEN QUESTION, not asserted true and not false');
    },
  },
  {
    id: 'G — generic mobile equipment, no visibility or warning evidence',
    obs: 'A haul truck was operating on the haul road at the surface mine.',
    expect: ({ candidates }) => {
      assert(!candidates.some(c => /56\.14132/.test(c)),
        'G: generic mobile-equipment activity emits no 56.14132 citation at all');
    },
  },
];

function main() {
  console.log('\n=== KG-3F 30 CFR 56.14132 predicate contract\n');
  for (const c of CASES) {
    const r = select(c.obs);
    console.log(`\n${c.id}`);
    console.log(`   candidates: ${r.candidates.filter(x => /56\.14132/.test(x)).join(', ') || '(none)'}`);
    console.log(`   decisions : ${r.decisions.filter(d => /56\.14132/.test(d.citation)).map(d => `${d.citation}=${d.status}`).join(', ') || '(none)'}`);
    c.expect(r);
  }
  console.log(`\n${checks.length} passed, ${failed} failed`);
  if (failed) process.exitCode = 1;
}

main();
