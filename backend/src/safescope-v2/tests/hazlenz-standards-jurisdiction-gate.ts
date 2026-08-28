// Protected gate for STANDARDS JURISDICTION SAFETY and bounded standards matching.
//
// Phases 7 and 8 of "HazLenz Deterministic Standards Architecture + Coverage Closure".
//
// It exercises the FINDING-LEVEL standards authority — `applyFindingScopedStandards()` in
// `evidence-foundation.ts`, the path that produces the citations a customer sees on a finding
// and in the report — directly, with no database, so it runs anywhere.
//
// Two properties, both authored BEFORE any output for these rows was inspected:
//
//   JURISDICTION SAFETY  a citation from one regime must never appear on a finding whose
//                        inspection is pinned to another. This is the property that matters most:
//                        citing 29 CFR to a mine operator, or 30 CFR to a general-industry
//                        employer, is a regulatory error the customer would carry into an
//                        enforcement conversation.
//
//   BOUNDED MATCHING     for families the v1.0 coverage manifest marks SUPPORTED_AND_GOVERNED,
//                        a textbook observation must receive a citation from that family, and a
//                        safe/negated control must not.
//
// Rows whose families the manifest marks KNOWN_GAP are deliberately NOT asserted as matches here:
// asserting a citation this system cannot justify would be the gate demanding a fabrication. They
// are recorded by the coverage measurement instead.
//
//   npm run test:hazlenz-standards-jurisdiction

import { applyFindingScopedStandards } from '../evidence/evidence-foundation';

type Jurisdiction = 'osha-general-industry' | 'osha-construction' | 'msha' | 'unknown';

interface StandardsCase {
  id: string;
  intent: string;
  observation: string;
  jurisdiction: Jurisdiction;
  /** At least one emitted citation must match one of these. */
  expectOneOf?: RegExp[];
  /** No emitted citation may match any of these. */
  forbid?: RegExp[];
  /** No citation at all may be emitted. */
  expectNone?: boolean;
}

const OSHA_GI = /\b(?:29 CFR )?19(?:10)\./;
const OSHA_CONSTRUCTION = /\b(?:29 CFR )?1926\./;
const MSHA = /\b(?:30 CFR )?(?:47|56|57|62|75|77)\./;

const CASES: StandardsCase[] = [
  // ---- jurisdiction safety: the same hazard under each regime -------------
  {
    id: 'J-01', intent: 'LOTO under general industry cites 1910, never 1926 or 30 CFR',
    observation: 'A millwright was servicing the packaging machine to clear a jam while the drive remained energized and no lock or tag had been applied.',
    jurisdiction: 'osha-general-industry',
    expectOneOf: [/1910\.147/], forbid: [OSHA_CONSTRUCTION, MSHA],
  },
  {
    id: 'J-02', intent: 'the same LOTO observation under MSHA cites 30 CFR, never 29 CFR',
    observation: 'A millwright was servicing the crusher drive to clear a jam while it remained energized and no lock or tag had been applied.',
    jurisdiction: 'msha',
    expectOneOf: [/56\.12016|56\.14105/], forbid: [OSHA_GI, OSHA_CONSTRUCTION],
  },
  {
    id: 'J-03', intent: 'a fall exposure under construction cites 1926, never 1910',
    observation: 'Workers on the third-floor deck were within a metre of an open leading edge with no guardrail and no personal fall arrest.',
    jurisdiction: 'osha-construction',
    expectOneOf: [/1926\.501|1926\.451/], forbid: [OSHA_GI, MSHA],
  },
  {
    id: 'J-04', intent: 'the same fall exposure under general industry cites 1910, never 1926',
    observation: 'Workers on the third-floor deck were within a metre of an open leading edge with no guardrail and no personal fall arrest.',
    jurisdiction: 'osha-general-industry',
    expectOneOf: [/1910\.28/], forbid: [OSHA_CONSTRUCTION, MSHA],
  },
  {
    id: 'J-05', intent: 'an excavation under general industry must NOT borrow the construction trenching standard',
    observation: 'A worker was working in an unshored trench three metres deep with a spoil pile at the edge.',
    jurisdiction: 'osha-general-industry',
    forbid: [OSHA_CONSTRUCTION, MSHA],
  },
  {
    id: 'J-06', intent: 'machine guarding under MSHA cites 30 CFR only',
    observation: 'The guard over the conveyor tail pulley had been removed and the conveyor was running.',
    jurisdiction: 'msha',
    expectOneOf: [/56\.14107|57\.14107/], forbid: [OSHA_GI, OSHA_CONSTRUCTION],
  },
  {
    id: 'J-07', intent: 'electrical exposure under construction cites 1926, never 1910',
    // Quoted from the frozen corpus row B-12, whose electrical clause the real end-to-end
    // workflow already matched to this citation; using engine-neutral paraphrase here would be
    // testing the fact extractor's vocabulary rather than jurisdiction safety.
    observation: 'A damaged extension cord with exposed conductors ran across the wet floor of the wash bay.',
    jurisdiction: 'osha-construction',
    expectOneOf: [/1926\.416/], forbid: [OSHA_GI, MSHA],
  },
  {
    id: 'J-08', intent: 'hazard communication under MSHA cites Part 47, never 1910.1200',
    observation: 'A secondary container of unknown chemical in the shop carried no label and no safety data sheet was available at the point of use.',
    jurisdiction: 'msha',
    expectOneOf: [/47\.41/], forbid: [OSHA_GI, OSHA_CONSTRUCTION],
  },

  // ---- safe-state and negated controls: no citation may be manufactured ---
  {
    id: 'S-01', intent: 'verified lockout is a safe state, not a LOTO citation',
    observation: 'The conveyor drive was locked out and tagged by the assigned millwright, zero energy was verified at the motor, and the lockout log was signed.',
    jurisdiction: 'osha-general-industry', forbid: [/1910\.147/],
  },
  {
    id: 'S-02', intent: 'a guard reported correctly fitted is not a guarding citation',
    observation: 'The grinding wheel guard on the pedestal grinder was correctly fitted and the tool rest was set at one eighth of an inch.',
    jurisdiction: 'osha-general-industry', forbid: [/1910\.212|1910\.219/],
  },
  {
    id: 'S-03', intent: 'an explicitly negated hazard produces no citation for that family',
    observation: 'No welding, cutting or other hot work was taking place anywhere in the tank farm during this inspection.',
    jurisdiction: 'osha-general-industry', forbid: [/1910\.25[1-5]|1926\.35/],
  },
  {
    id: 'S-04', intent: 'a protected floor opening is not a fall-protection citation',
    observation: 'The floor opening at the mezzanine was fitted with a hinged cover that was closed, latched and labelled.',
    jurisdiction: 'osha-general-industry', forbid: [/1910\.28|1926\.501/],
  },
  {
    id: 'S-05', intent: 'an administrative record names no hazard and earns no citation',
    observation: 'The electrical safety training matrix and the annual lockout procedure audit were both current at the maintenance office.',
    jurisdiction: 'osha-general-industry', expectNone: true,
  },

  // ---- adjacent-but-inapplicable: specificity must be justified ----------
  {
    id: 'A-01', intent: 'a cylinder mentioned as secured earns no unsecured-cylinder citation',
    observation: 'Oxygen and acetylene cylinders were chained upright with their valve protection caps fitted in the welding bay.',
    jurisdiction: 'osha-general-industry', forbid: [/1910\.101|1910\.253/],
  },
  {
    id: 'A-02', intent: 'a walkway named only as a location earns no walking-surface citation',
    observation: 'A 480-volt panel door stood open with live parts exposed, directly beside the main aisle where employees pass.',
    jurisdiction: 'osha-general-industry', forbid: [/1910\.22/],
  },
  {
    id: 'A-03', intent: 'noise vocabulary without an exposure earns no noise citation',
    observation: 'The noise survey report for the compressor room was filed and current.',
    jurisdiction: 'osha-general-industry', forbid: [/1910\.95|1926\.52|62\.1[23]0/],
  },
];

function citationsFor(testCase: StandardsCase): string[] {
  // One decomposed hazard carrying the observation, which is the shape
  // applyFindingScopedStandards() consumes on the real path.
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{
        hazardId: 'haz-1',
        domainId: 'evaluated',
        hazardFamily: 'evaluated',
        mechanism: 'evaluated hazard',
        observationFragment: testCase.observation,
        supportingSignals: [],
      }],
    },
  };
  const request: any = {
    text: testCase.observation,
    structuredObservation:
      testCase.jurisdiction === 'unknown' ? undefined : { jurisdiction: testCase.jurisdiction },
  };
  applyFindingScopedStandards(result, request);
  const hazard = result.multiHazardDecomposition.hazards[0];
  return (Array.isArray(hazard.standardCandidates) ? hazard.standardCandidates : [])
    .map((item: any) => String(item?.citation || ''))
    .filter(Boolean);
}

function main(): void {
  const failures: string[] = [];
  let checks = 0;
  let jurisdictionViolations = 0;

  console.log('-- standards jurisdiction safety and bounded matching --');
  for (const testCase of CASES) {
    const citations = citationsFor(testCase);
    const problems: string[] = [];

    if (testCase.expectNone && citations.length) {
      problems.push(`expected no citation, got [${citations.join(', ')}]`);
    }
    if (testCase.expectOneOf && !testCase.expectOneOf.some(p => citations.some(c => p.test(c)))) {
      problems.push(`no citation matched ${testCase.expectOneOf.map(String).join(' | ')}`);
    }
    for (const forbidden of testCase.forbid || []) {
      const hits = citations.filter(c => forbidden.test(c));
      if (hits.length) {
        problems.push(`FORBIDDEN ${String(forbidden)} matched [${hits.join(', ')}]`);
        if (forbidden === OSHA_GI || forbidden === OSHA_CONSTRUCTION || forbidden === MSHA) {
          jurisdictionViolations += hits.length;
        }
      }
    }

    checks += 1;
    console.log(
      `  [${problems.length ? 'FAIL' : 'PASS'}] ${testCase.id} (${testCase.jurisdiction}) ${testCase.intent}\n` +
      `          emitted=[${citations.join(', ') || 'none'}]` +
      (problems.length ? `\n          ${problems.join('; ')}` : ''),
    );
    if (problems.length) failures.push(`${testCase.id}: ${problems.join('; ')}`);
  }

  console.log(`\n  wrong-jurisdiction citations: ${jurisdictionViolations}`);
  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    console.error(`\n${failures.length} failure(s) across ${checks} checks`);
    process.exit(1);
  }
  console.log(`\nPASS HazLenz standards jurisdiction gate (${checks} checks, 0 wrong-jurisdiction citations)`);
}

main();
