import { applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';

type GoldCase = {
  id: string;
  area: string;
  regime: 'osha_general_industry' | 'osha_construction' | 'msha';
  observation: string;
  expectedCitations: string[]; // any one of these counts as a correct match; [] means no-match expected
  mustNotReturn: string[]; // citations that would be a wrong-regime/wrong-hazard false positive
  authoritativeSource: string;
  rationale: string;
};

// Independently adjudicated from evaluate()'s own rule predicates (evidence-foundation.ts) and the
// verified corpus in CORPUS_INTEGRITY_AUDIT.md -- NOT derived by running HazLenz and copying its output.
const GOLD_SET: GoldCase[] = [
  {
    id: 'GI-MG-01', area: 'General Industry - machine guarding', regime: 'osha_general_industry',
    observation: 'The point-of-operation guard on the punch press is missing while the machine is energized and operating.',
    expectedCitations: ['1910.212(a)(1)'], mustNotReturn: ['1926.451(g)(1)', '56.14107'],
    authoritativeSource: 'osha.gov 1910.212(a)(1) "Types of guarding"',
    rationale: 'GI jurisdiction + guard absent + energized/operating machine satisfies all three required predicates.',
  },
  {
    id: 'GI-MG-02-NEG', area: 'General Industry - machine guarding (negative control)', regime: 'osha_general_industry',
    observation: 'The point-of-operation guard on the punch press is securely installed and the machine has been verified de-energized.',
    expectedCitations: [], mustNotReturn: ['1910.212(a)(1)'],
    authoritativeSource: 'osha.gov 1910.212(a)(1)',
    rationale: 'Guard present AND energy safe -- applicability predicates explicitly false, must not fire as SUPPORTED.',
  },
  {
    id: 'GI-LOTO-01', area: 'General Industry - LOTO', regime: 'osha_general_industry',
    observation: 'A technician is servicing the hydraulic press and hazardous energy has not been isolated or locked out.',
    expectedCitations: ['1910.147'], mustNotReturn: ['56.12016'],
    authoritativeSource: 'osha.gov 1910.147 "The control of hazardous energy"',
    rationale: 'GI jurisdiction + servicing activity + energy not isolated satisfies 1910.147 predicates.',
  },
  {
    id: 'MSHA-LOTO-01', area: 'MSHA - energy control', regime: 'msha',
    observation: 'A miner is performing electrical repair work on the crusher and the power has not been locked out.',
    expectedCitations: ['56.12016'], mustNotReturn: ['1910.147'],
    authoritativeSource: 'govinfo.gov 30 CFR 56.12016 "Work on electrically-powered equipment"',
    rationale: 'MSHA jurisdiction (not GI) must select the MSHA energy-control citation, not the OSHA GI one, even though the underlying hazard (uncontrolled energy during servicing) is conceptually the same.',
  },
  {
    id: 'GI-ELEC-01', area: 'General Industry - electrical', regime: 'osha_general_industry',
    observation: 'A live, exposed electrical conductor in the panel is reachable and has not been deenergized or isolated.',
    expectedCitations: ['1910.303'], mustNotReturn: [],
    authoritativeSource: 'osha.gov 1910.303 (general electrical safety)',
    rationale: 'GI jurisdiction + live exposed reachable conductor + not isolated satisfies 1910.303 predicates. NOTE: evaluate() returns bare "1910.303" (section-level); the seeded corpus only has "1910.303(b)(1)" (paragraph-level) -- a granularity mismatch expected to produce a citation with no DB-backed title/text (flagged separately, not a wrong-citation failure).',
  },
  {
    id: 'GI-PIT-01', area: 'General Industry - powered industrial trucks', regime: 'osha_general_industry',
    observation: 'A forklift was found to be defective and unsafe but was not taken out of service before continued operation.',
    expectedCitations: ['1910.178'], mustNotReturn: [],
    authoritativeSource: 'osha.gov 29 CFR 1910.178(p)(1)',
    rationale: 'This exact scenario (defective/unsafe PIT not removed from service) is 1910.178(p)(1)\'s own text. NOTE: evaluate() has no dedicated PIT rule -- this case tests whether the system honestly returns no confident match rather than fabricating one, since the seeded standards_master row exists but the rule engine itself does not evaluate PIT facts. Expected: no fabricated match (empty is acceptable and correct here).',
  },
  {
    id: 'GI-WWS-01', area: 'General Industry - walking-working surfaces / handrail', regime: 'osha_general_industry',
    observation: 'The handrail on the interior stairway is missing, exposing employees descending the stairs to a fall hazard.',
    expectedCitations: ['1910.28'], mustNotReturn: ['1926.501'],
    authoritativeSource: 'osha.gov 29 CFR 1910.28 (GI walking-working-surfaces fall protection)',
    rationale: 'GI jurisdiction + unprotected fall exposure + employee exposure satisfies 1910.28. Must not return the Construction fall-protection citation (1926.501) for a General Industry stairway.',
  },
  {
    id: 'GI-EXIT-01', area: 'General Industry - exit routes', regime: 'osha_general_industry',
    observation: 'The required emergency exit door in the occupied warehouse is locked and blocked, and employees are working on shift.',
    expectedCitations: ['1910.36'], mustNotReturn: [],
    authoritativeSource: 'osha.gov 1910.36 "Design and construction requirements for exit routes"',
    rationale: 'GI jurisdiction + occupied workplace + required exit + exit locked/blocked satisfies 1910.36.',
  },
  {
    id: 'GI-EXIT-02-NEG', area: 'General Industry - exit routes (negative control)', regime: 'osha_general_industry',
    observation: 'The emergency exit door in the occupied warehouse is open and usable, and employees are working on shift.',
    expectedCitations: [], mustNotReturn: ['1910.36'],
    authoritativeSource: 'osha.gov 1910.36',
    rationale: 'Exit explicitly open and usable -- must not fire as an active deficiency.',
  },
  {
    id: 'CON-FALL-01', area: 'Construction - fall protection (scaffold)', regime: 'osha_construction',
    observation: 'A mason is working on a scaffold platform 18 feet above the lower level with an open side that has no guardrail or personal fall arrest system.',
    expectedCitations: ['1926.451(g)(1)', '1926.501'], mustNotReturn: ['1910.28', '1910.212(a)(1)'],
    authoritativeSource: 'osha.gov 29 CFR 1926.451(g)(1) (scaffold fall protection, >10 ft) and/or 1926.501',
    rationale: 'Construction jurisdiction + scaffold work platform >10 ft + worker present + no guardrail/PFAS satisfies 1926.451(g)(1). This is Phase 8\'s own worked example. Must not return the General Industry walking-surfaces citation for a construction scaffold.',
  },
  {
    id: 'CON-EXC-01', area: 'Construction - excavation', regime: 'osha_construction',
    observation: 'Laborers are working in a 6-foot trench with no protective system installed and the soil is not stable rock.',
    expectedCitations: ['1926.652'], mustNotReturn: [],
    authoritativeSource: 'osha.gov 29 CFR 1926.652(a)(1)',
    rationale: 'Construction jurisdiction + trench + worker exposure + protective system absent + not stable rock satisfies 1926.652(a)(1).',
  },
  {
    id: 'CON-EXC-02-NEG', area: 'Construction - excavation (negative control)', regime: 'osha_construction',
    observation: 'Laborers are working in a 6-foot trench cut entirely into stable rock with no indications of instability.',
    expectedCitations: [], mustNotReturn: ['1926.652'],
    authoritativeSource: 'osha.gov 29 CFR 1926.652(a)(1)(i) stable-rock exception',
    rationale: 'The stable-rock exception explicitly suppresses this citation -- a superficially similar excavation must not trigger it.',
  },
  {
    id: 'CON-SILICA-01', area: 'Construction - silica', regime: 'osha_construction',
    observation: 'A worker is dry-cutting concrete with a masonry saw, generating a visible dust cloud, with no water suppression or dust control in use.',
    expectedCitations: ['1926.1153'], mustNotReturn: [],
    authoritativeSource: 'osha.gov 29 CFR 1926.1153',
    rationale: 'Construction jurisdiction + silica-generating task + visible airborne dust + control absent satisfies 1926.1153.',
  },
  {
    id: 'MSHA-GUARD-01', area: 'MSHA - moving machine parts', regime: 'msha',
    observation: 'The guard on the conveyor tail pulley at the surface mine is missing, exposing miners to the moving parts.',
    expectedCitations: ['56.14107'], mustNotReturn: ['1910.212(a)(1)'],
    authoritativeSource: 'govinfo.gov 30 CFR 56.14107(a) "Moving machine parts"',
    rationale: 'MSHA jurisdiction + guard absent -- must select the MSHA citation, not the OSHA GI machine-guarding citation.',
  },
  {
    id: 'MSHA-GUARD-02-NEG', area: 'MSHA - moving machine parts (negative control)', regime: 'msha',
    observation: 'The guard on the conveyor tail pulley at the surface mine is present and effective, fully preventing contact.',
    expectedCitations: [], mustNotReturn: ['56.14107'],
    authoritativeSource: 'govinfo.gov 30 CFR 56.14107(a)',
    rationale: 'Guard explicitly present and effective -- must not fire.',
  },
  {
    id: 'MSHA-TRAFFIC-01', area: 'MSHA - traffic control', regime: 'msha',
    observation: 'A haul truck at the surface mine is backing without a functional backup alarm and no spotter present.',
    expectedCitations: ['56.14132'], mustNotReturn: [],
    authoritativeSource: 'govinfo.gov 30 CFR 56.14132(a)',
    rationale: 'MSHA jurisdiction + reverse warning required + audible warning failed satisfies 56.14132(a).',
  },
  {
    id: 'GI-NOISE-01', area: 'General Industry - noise', regime: 'osha_general_industry',
    observation: "An employee's full-shift measured noise exposure is 92 dBA time-weighted average with no unusual impulse noise.",
    expectedCitations: ['1910.95'], mustNotReturn: [],
    authoritativeSource: 'osha.gov 29 CFR 1910.95',
    rationale: 'GI jurisdiction + measured full-shift TWA >= 85 dBA satisfies 1910.95 action-level applicability.',
  },
  {
    id: 'GI-HAZCOM-01', area: 'General Industry - HazCom', regime: 'osha_general_industry',
    observation: 'A workplace chemical container has no label identifying its contents or hazards.',
    expectedCitations: ['1910.1200'], mustNotReturn: [],
    authoritativeSource: 'osha.gov 29 CFR 1910.1200(f)',
    rationale: 'GI jurisdiction + workplace chemical container + label missing satisfies 1910.1200.',
  },
  {
    id: 'CROSS-01', area: 'Cross-regime adversarial: Construction scaffold vs GI walking surface', regime: 'osha_construction',
    observation: 'A worker on a construction scaffold platform experiences a fall hazard from an unguarded edge 15 feet above the ground.',
    expectedCitations: ['1926.451', '1926.501'], mustNotReturn: ['1910.28', '1910.22'],
    authoritativeSource: 'osha.gov 1926.451(g)(1) / 1926.501',
    rationale: 'Construction-context fall exposure must select Construction fall-protection citations, never the General Industry walking-surfaces family.',
  },
  // ---- Added 2026-08-18 (inspection-context closure): Construction analogs verified against
  // osha.gov published text the same day (see CONSTRUCTION_RULE_SOURCES.md).
  {
    id: 'CON-HAZCOM-01', area: 'Construction - hazard communication', regime: 'osha_construction',
    observation: 'On the jobsite a 5-gallon container of solvent has no label identifying its contents or hazards.',
    expectedCitations: ['1926.59'], mustNotReturn: ['1910.1200'],
    authoritativeSource: 'osha.gov 29 CFR 1926.59 ("The requirements applicable to construction work under this section are identical to those set forth at 1910.1200")',
    rationale: 'Construction jurisdiction + workplace chemical container + label missing. The construction citation is 1926.59 (which adopts 1910.1200 by reference); the GI citation must not be offered as the governing construction rule.',
  },
  {
    id: 'CON-NOISE-01', area: 'Construction - occupational noise over Table D-2', regime: 'osha_construction',
    observation: 'Laborers on the demolition crew are exposed to a measured 92 dBA 8-hour TWA with no hearing protection or hearing conservation program.',
    expectedCitations: ['1926.52'], mustNotReturn: ['1910.95'],
    authoritativeSource: 'osha.gov 29 CFR 1926.52(a),(b),(d)(1) and Table D-2 (8 hours: 90 dBA slow response)',
    rationale: 'Construction jurisdiction + measured full-shift TWA exceeding the 90 dBA Table D-2 value. 1910.95 (85 dBA action level) is General Industry only.',
  },
  {
    id: 'CON-NOISE-02-NEG', area: 'Construction - noise below Table D-2 (negative control)', regime: 'osha_construction',
    observation: 'Laborers on the demolition crew are exposed to a measured 88 dBA 8-hour TWA.',
    expectedCitations: [], mustNotReturn: ['1926.52', '1910.95'],
    authoritativeSource: 'osha.gov 29 CFR 1926.52 Table D-2 (8 hours: 90 dBA)',
    rationale: '88 dBA does not exceed the construction Table D-2 value, and the 85 dBA GI action level does not apply in construction -- a confident match here would be a false positive.',
  },
  {
    id: 'CON-ELEC-01', area: 'Construction - electric power circuit contact', regime: 'osha_construction',
    observation: 'On the construction site an extension cord powering a saw has exposed copper conductors and remains energized where laborers are working.',
    expectedCitations: ['1926.416(a)(1)'], mustNotReturn: ['1910.303'],
    authoritativeSource: 'osha.gov 29 CFR 1926.416(a)(1)',
    rationale: 'Construction jurisdiction + employee could contact part of an energized circuit + not deenergized/guarded. 1910.303 is General Industry only.',
  },
  {
    id: 'CON-GUARD-01', area: 'Construction - moving-part guarding of equipment', regime: 'osha_construction',
    observation: 'The belt guard on the jobsite concrete mixer drive is missing and the belt and pulley are exposed to contact while the mixer is running.',
    expectedCitations: ['1926.300(b)(2)'], mustNotReturn: ['1910.212'],
    authoritativeSource: 'osha.gov 29 CFR 1926.300(b)(2)',
    rationale: 'Construction jurisdiction + belt/pulley (moving part) exposed to employee contact + guard absent. 1910.212 is General Industry only.',
  },
  {
    id: 'CROSS-02', area: 'Cross-regime adversarial: MSHA vs GI machine guarding', regime: 'msha',
    observation: 'At a surface mine, the guard on a moving machine part is missing, exposing a miner to a pinch point.',
    expectedCitations: ['56.14107'], mustNotReturn: ['1910.212'],
    authoritativeSource: 'govinfo.gov 30 CFR 56.14107(a)',
    rationale: 'MSHA context must never surface the OSHA General Industry machine-guarding citation.',
  },
];

function scopeToText(regime: GoldCase['regime']): string[] {
  return [regime];
}

async function run() {
  let truePositive = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  let wrongRegime = 0;
  let noMatchCorrect = 0;
  let noMatchExpectedButGotOne = 0;
  const rows: any[] = [];

  // Feeds the full case observation directly as the finding's own fragment,
  // bypassing multi-hazard decomposition's own fragment-selection (already
  // separately verified in Phases 1-4 of this session). This isolates and
  // measures the standards-matching ENGINE itself (evaluate()/
  // buildEvidenceFacts()), which is what this phase's gold set targets --
  // not decomposition's fragment-selection quality, which is a different,
  // already-covered concern. This mirrors exactly how
  // applyFindingScopedStandards() is designed to be called: it trusts
  // whatever fragment it is given.
  for (const c of GOLD_SET) {
    const primaryFragment = c.observation;
    const result: any = {
      multiHazardDecomposition: {
        hazards: [{
          hazardId: 'gold-1',
          domainId: 'unknown',
          hazardFamily: 'unknown',
          observationFragment: primaryFragment,
          mechanism: '',
          supportingSignals: [],
        }],
      },
    };
    applyFindingScopedStandards(result, { text: c.observation, scopes: scopeToText(c.regime) } as any);
    const candidates = result.multiHazardDecomposition.hazards[0].standardCandidates || [];
    // A CONFIRMED match (status SUPPORTED / applicability direct) is a real
    // claim InSite is making. An UNKNOWN/candidate result is an honest "not
    // enough evidence to confirm" disclosure (it names what's missing) --
    // scoring it the same as a confirmed match would penalize exactly the
    // honesty behavior Contract Point 6/10 requires. Precision/recall below
    // are computed against CONFIRMED matches only; candidates are reported
    // separately.
    const confirmed = candidates.filter((cand: any) => cand.applicability === 'direct');
    const candidateOnly = candidates.filter((cand: any) => cand.applicability === 'candidate');
    const returnedCitations: string[] = confirmed.map((cand: any) => cand.citation);
    const candidateCitations: string[] = candidateOnly.map((cand: any) => cand.citation);

    const normalizedReturned = returnedCitations.map(c2 => c2.replace(/^29\s*CFR\s*/i, '').replace(/^30\s*CFR\s*/i, '').trim());
    const normalizedExpected = c.expectedCitations.map(e => e.replace(/^29\s*CFR\s*/i, '').replace(/^30\s*CFR\s*/i, '').trim());
    const normalizedForbidden = c.mustNotReturn.map(f => f.replace(/^29\s*CFR\s*/i, '').replace(/^30\s*CFR\s*/i, '').trim());

    const gotExpected = normalizedExpected.length === 0
      ? normalizedReturned.length === 0
      : normalizedReturned.some(r => normalizedExpected.some(e => r.startsWith(e) || e.startsWith(r)));
    const gotForbidden = normalizedReturned.some(r => normalizedForbidden.some(f => r.startsWith(f) || f.startsWith(r)));

    let verdict: string;
    if (normalizedExpected.length === 0) {
      if (normalizedReturned.length === 0) { verdict = 'CORRECT_NO_MATCH'; noMatchCorrect++; }
      else if (gotForbidden) { verdict = 'FALSE_POSITIVE_FORBIDDEN'; falsePositive++; wrongRegime++; }
      else { verdict = 'FALSE_POSITIVE_UNEXPECTED'; falsePositive++; noMatchExpectedButGotOne++; }
    } else {
      if (gotForbidden) { verdict = 'WRONG_REGIME_OR_FAMILY'; wrongRegime++; }
      else if (gotExpected) { verdict = 'TRUE_POSITIVE'; truePositive++; }
      else if (normalizedReturned.length === 0) { verdict = 'FALSE_NEGATIVE_NO_MATCH'; falseNegative++; }
      else { verdict = 'FALSE_NEGATIVE_WRONG_CITATION'; falseNegative++; }
    }

    rows.push({
      id: c.id, area: c.area, verdict,
      expected: c.expectedCitations, returned: returnedCitations, candidatesOnly: candidateCitations,
      fragment: primaryFragment,
    });
  }

  console.log(JSON.stringify(rows, null, 2));
  console.log('='.repeat(80));
  const total = GOLD_SET.length;
  const applicableCases = GOLD_SET.filter(c => c.expectedCitations.length > 0).length;
  const negativeControls = GOLD_SET.filter(c => c.expectedCitations.length === 0).length;
  console.log(`TOTAL CASES: ${total}`);
  console.log(`APPLICABLE-STANDARD CASES: ${applicableCases}`);
  console.log(`NO-STANDARD / NEGATIVE CONTROLS: ${negativeControls}`);
  console.log(`TRUE POSITIVES (correct match): ${truePositive}`);
  console.log(`CORRECT NO-MATCH (honest, no fabrication): ${noMatchCorrect}`);
  console.log(`FALSE POSITIVES (fired when it should not have): ${falsePositive}`);
  console.log(`FALSE NEGATIVES (missed an applicable case): ${falseNegative}`);
  console.log(`WRONG-REGIME/WRONG-FAMILY MATCHES: ${wrongRegime}`);
  const returnedTotal = truePositive + falsePositive;
  console.log(`PRECISION (of returned matches, how many correct): ${returnedTotal ? (truePositive / returnedTotal).toFixed(2) : 'n/a'} (${truePositive}/${returnedTotal})`);
  console.log(`RECALL (of applicable cases, how many found): ${applicableCases ? (truePositive / applicableCases).toFixed(2) : 'n/a'} (${truePositive}/${applicableCases})`);
}

run();
