/**
 * L3-2 -- `L3_COMPARE`: deterministic comparison of the Level-1 customer result against the
 * Level-3 validated outcome (Phase 11).
 *
 * THIS IS EVIDENCE, NOT AUTHORITY. Level 1 produced the customer result and still does. Nothing
 * here feeds back into it; this program reads two artifacts and writes a third.
 *
 * NEITHER SIDE IS GROUND TRUTH. Level 1 is not right because it is authoritative, and Level 3 is
 * not right because it used a model. Both are adjudicated against the frozen holdout expectations,
 * which were authored before either result existed. Where the frozen matrix itself declares a
 * scenario ambiguous, the disagreement is recorded as ambiguous rather than scored.
 *
 * The Level-1 condition-state axis is `additionalHazards[].conditionState`, mirroring
 * `multiHazardDecomposition.hazards[]`. That choice is not ours: `ORACLE_CORRECTION.md` measured the
 * top-level `conditionState` field as near-constant (`UNKNOWN` on 62 of 66) and therefore unusable
 * as the axis a condition-state contract is measured on. The top-level field is reported separately
 * as uncertainty calibration, never as a false positive.
 *
 * Env: LEVEL1 (jsonl capture), LEVEL3 (l3 run artifact), HOLDOUT, OUT.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

interface L1Row { id: string; payload: any; error: string | null }

type Class =
  | 'AGREE_BOTH_CORRECT' | 'AGREE_BOTH_INCORRECT'
  | 'L3_CORRECT_L1_INCORRECT' | 'L1_CORRECT_L3_INCORRECT'
  | 'BOTH_ACCEPTABLE' | 'GENUINELY_AMBIGUOUS' | 'COMPARISON_NOT_APPLICABLE';

function main(): void {
  const l1 = new Map<string, L1Row>(
    readFileSync(process.env.LEVEL1 || '', 'utf8').split('\n').filter(Boolean)
      .map(l => JSON.parse(l) as L1Row).map(r => [r.id, r]));
  const l3capture = JSON.parse(readFileSync(process.env.LEVEL3 || '', 'utf8')) as { records: any[] };
  const holdout = JSON.parse(readFileSync(process.env.HOLDOUT || '', 'utf8')) as { scenarios: any[] };
  const expectations = new Map(holdout.scenarios.map(s => [s.id, s]));
  const outPath = process.env.OUT || '';

  const rows: Array<Record<string, unknown>> = [];
  const tally: Record<Class, number> = {
    AGREE_BOTH_CORRECT: 0, AGREE_BOTH_INCORRECT: 0,
    L3_CORRECT_L1_INCORRECT: 0, L1_CORRECT_L3_INCORRECT: 0,
    BOTH_ACCEPTABLE: 0, GENUINELY_AMBIGUOUS: 0, COMPARISON_NOT_APPLICABLE: 0,
  };
  const axes = {
    hazardEstablishedAgree: 0, hazardEstablishedDisagree: 0,
    familyOverlap: 0, familyNoOverlap: 0, familyNotComparable: 0,
    l1TopLevelUnknownOnEstablishedHazard: 0,
    l1ClarificationsRaised: 0, l3ClarificationsRaised: 0,
    l1MultiHazardCount: 0, l3MultiHazardCount: 0,
    l3EvidenceGroundedFindings: 0, l1EvidenceGroundedFindings: 0,
  };

  for (const record of l3capture.records) {
    const id = record.id as string;
    const expect = expectations.get(id)?.expect ?? {};
    const l1row = l1.get(id);

    if (!l1row || l1row.error) {
      tally.COMPARISON_NOT_APPLICABLE += 1;
      rows.push({ id, class: 'COMPARISON_NOT_APPLICABLE', reason: 'no Level-1 capture' });
      continue;
    }
    const p = l1row.payload;
    const l1Hazards: any[] = Array.isArray(p.additionalHazards) ? p.additionalHazards : [];
    const l1Active = l1Hazards.filter(h => h.conditionState === 'ACTIVE');
    const l1Asserts = l1Active.length > 0;
    const l1Families = [...new Set(l1Hazards.map(h => String(h.family || '')))].filter(Boolean);

    const l3Hazards: any[] = record.reasoning?.hazards ?? [];
    const l3Asserts = l3Hazards.some((h: any) => h.conditionState === 'ACTIVE');
    const l3Families = [...new Set(l3Hazards.map((h: any) => String(h.hazardFamily)))];

    // axes
    if (l1Asserts === l3Asserts) axes.hazardEstablishedAgree += 1; else axes.hazardEstablishedDisagree += 1;
    if (l1Families.length && l3Families.length) {
      const overlap = l3Families.some(f => l1Families.some(g => g.includes(f) || f.includes(g)));
      if (overlap) axes.familyOverlap += 1; else axes.familyNoOverlap += 1;
    } else axes.familyNotComparable += 1;
    if (l1Asserts && p.conditionState === 'UNKNOWN') axes.l1TopLevelUnknownOnEstablishedHazard += 1;
    const l1Questions = (Array.isArray(p.clarifyingQuestions) ? p.clarifyingQuestions.length : 0)
      + (Array.isArray(p.evidenceGapQuestions) ? p.evidenceGapQuestions.length : 0);
    if (l1Questions > 0) axes.l1ClarificationsRaised += 1;
    if (l3Hazards.some((h: any) => h.clarification)) axes.l3ClarificationsRaised += 1;
    if (l1Hazards.length > 1) axes.l1MultiHazardCount += 1;
    if (l3Hazards.length > 1) axes.l3MultiHazardCount += 1;
    // Every Level-3 hazard carries a validated span by construction; Level-1 carries none.
    if (l3Hazards.length && l3Hazards.every((h: any) => (h.evidence || []).length > 0)) axes.l3EvidenceGroundedFindings += 1;
    if (l1Hazards.length && l1Hazards.every((h: any) => Array.isArray(h.evidenceSpans) && h.evidenceSpans.length)) axes.l1EvidenceGroundedFindings += 1;

    // adjudication against the FROZEN expectation
    let klass: Class;
    if (expect.ambiguous) {
      klass = 'GENUINELY_AMBIGUOUS';
    } else {
      const want = expect.hazardEstablished === true;
      const l1Right = l1Asserts === want;
      const l3Right = l3Asserts === want;
      if (l1Right && l3Right) klass = l1Asserts === l3Asserts ? 'AGREE_BOTH_CORRECT' : 'BOTH_ACCEPTABLE';
      else if (l3Right) klass = 'L3_CORRECT_L1_INCORRECT';
      else if (l1Right) klass = 'L1_CORRECT_L3_INCORRECT';
      else klass = 'AGREE_BOTH_INCORRECT';
    }
    tally[klass] += 1;

    rows.push({
      id, cohort: record.cohort, class: klass,
      expectedHazard: expect.ambiguous ? 'ambiguous' : expect.hazardEstablished,
      l1AssertsActive: l1Asserts, l3AssertsActive: l3Asserts,
      l1HazardCount: l1Hazards.length, l3HazardCount: l3Hazards.length,
      l1Families, l3Families,
      l1TopLevelConditionState: p.conditionState ?? null,
      l3Outcome: record.outcomeKind,
      l3SemanticIssues: [...new Set((record.semanticIssues || []).map((i: any) => i.code))],
      l1CitationCount: Array.isArray(p.supportingStandards) ? p.supportingStandards.length : null,
      l3CitationCount: 0,
    });
  }

  const report = {
    mode: 'L3_COMPARE',
    note: 'Comparison evidence only. The Level-1 result was and remains the customer result; '
      + 'nothing in this artifact was consumed by the customer path.',
    adjudicationBasis: 'frozen holdout expectations, authored before either result existed',
    level1ConditionStateAxis: 'additionalHazards[].conditionState (per ORACLE_CORRECTION.md)',
    classification: tally,
    axes,
    rows,
  };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ classification: tally, axes }, null, 2) + '\n');
}

main();
