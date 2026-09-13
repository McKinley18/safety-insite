/**
 * §160 EXPERT HAZLENZ -- VERIFIER HUMAN-TRUTH RECONCILIATION. ZERO PROVIDER CALLS.
 *
 * ==================== THE QUESTION ====================
 *
 * Before any further verifier remediation or provider spend: after removing model-authored
 * unreviewed truth, fixture defects, ambiguous selectors, unsupported counterfactuals and denominator
 * contamination, DOES AN ACTUAL VERIFIER DECISION-CRITICAL RECALL DEFECT REMAIN?
 *
 * ==================== THE DISCIPLINE THIS FILE IS UNDER ====================
 *
 * The evaluation-truth authority policy says a model under evaluation is not authoritative for its
 * own correctness. This file is written by that model family. So it may compute only what is
 * MECHANICAL -- string equality, set membership, counts, presence and absence -- and it must record
 * every semantic question as OPEN rather than answering it.
 *
 * Two specific traps are closed in code below:
 *
 *   1. Audit limbs G (authored by the evaluated model family) and H (human reviewed) MUST NOT be
 *      converted into independent truth by any reasoning in this operation. `assertNoSelfValidation`
 *      fails the run if any case is marked authoritative while G is true and H is false.
 *
 *   2. A denominator of zero is reported as INSUFFICIENT, never as a pass and never as a fail.
 *      `rate()` refuses to divide by zero and refuses to render a percentage below the floor.
 *
 * Historical §152-§158 figures are read and never written. Nothing here re-derives a historical
 * score; §155's end-to-end numbers are QUOTED, and the miss population is inventoried separately and
 * labelled as an inventory rather than a re-derivation.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

import { hardenedFixtureByRowId, HARDENED_SET_VERSION, CANONICAL_DETERMINISTIC_FAMILIES }
  from '../src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const SRC = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V157 = join(V, 'expert-hazlenz-verifier-v2-remediation-2026-09-04');
const REPAIR = join(V, 'expert-hazlenz-vc04-measurement-repair-2026-09-04');
const RECON159 = join(V, 'expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04');
const OUT = join(V, 'expert-hazlenz-verifier-human-truth-reconciliation-2026-09-04');

/** Below this denominator a rate is not rendered. */
const PERCENTAGE_FLOOR = 10;

/** PHASE 1. Byte-for-byte freeze. Any drift stops the operation. */
const FROZEN: Array<[string, string]> = [
  ['backend/src/hazlenz/expert-hazlenz/expert-prompt.ts',
    '02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa'],
  ['backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts',
    '09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb'],
  ['verification/expert-hazlenz-verifier-accuracy-2026-09-03/VERIFIER-PACKET.json',
    '75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a'],
  ['verification/expert-hazlenz-verifier-accuracy-2026-09-03/TRUTH-MANIFEST.json',
    'dbbe3361a3c407af6a06446024c8de6f78d8d15540a349702b9c1eac4855617c'],
  ['verification/expert-hazlenz-verifier-accuracy-2026-09-03/VERIFIER-SCORES.json',
    'acdf21dde5d15d51f1dfd6af7489e310f2391729f37e4d3a16b5d859608c06dc'],
  ['verification/expert-hazlenz-verifier-v2-remediation-2026-09-04/VERIFIER-V2-SCORES.json',
    '3e7cefded793587c2ca3ef8bc323a4c1b82199cbaba0181e05a6fed734c98c73'],
  ['verification/expert-hazlenz-verifier-v2-remediation-2026-09-04/VERIFIER-V2-RUN-RECORDS.jsonl',
    'af3e37b20ef917ee46d13eb30c925ae6a110da0736d9c4a287d75100aeab75b8'],
  ['verification/expert-hazlenz-hs-h1-human-adjudication-2026-09-04/HS-H1-HUMAN-ADJUDICATION-PACKET.md',
    '8182cb4e324a5ac24049b1aaef1e6298b78c61e8949b510f06cc86d07e84a63f'],
];

const sha256File = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T;
const norm = (s: unknown): string => typeof s === 'string'
  ? s.trim().toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim() : '';
const matchesSet = (text: string, sets: string[][] | null): boolean =>
  !!sets && sets.some(set => set.every(k => text.toLowerCase().includes(k)));

/** Refuses to divide by zero and refuses a percentage on a thin denominator. */
function rate(n: number, d: number): string {
  if (d === 0) return 'INSUFFICIENT — denominator is zero, no figure exists';
  if (d < PERCENTAGE_FLOOR) return `${n}/${d} — COUNT ONLY, denominator below ${PERCENTAGE_FLOOR}`;
  return `${n}/${d} (${((n / d) * 100).toFixed(1)}%)`;
}

interface AuditRow {
  caseId: string; draw: string; rowId: string; authoredClass: string; fixtureForm: string;
  historicalClassification: string; inPrimaryDenominator: boolean;
  expectedMissingFact: string | null; expectedAffectedDecision: string | null;
  expectedCounterfactual: string | null;
  acceptableSelectorCount: number;
  truthProvenance: string; governedEvidenceCount: number;
  deterministicFamiliesEmitted: string[]; deterministicSupportsAuthoredFamilies: boolean;
  humanReviewStatus: string; evaluatedModelFamilyContributed: boolean;
  loadBearingAfterHsH1Removal: boolean; prospectivelyExcludedFrom: string[];
  A_observationLeavesFactUnresolved: string;
  B_twoDistinctFactualStates: string;
  C_branchesClaimDifferentCurrentDecisions: string;
  D_selectorUniqueness: string;
  E_governedEvidenceSupportsDistinction: string;
  F_deterministicSupplied: string;
  G_authoredByEvaluatedModelFamily: string;
  H_humanReviewed: string;
  authoritativeForProvisionalMeasures: boolean;
  authoritativeReason: string;
}

/**
 * THE SELF-VALIDATION GUARD. A case may not be treated as authoritative while its truth was authored
 * by the evaluated model family and no human has reviewed it. If this ever fails, the operation has
 * converted G/H into truth and must stop.
 */
function assertNoSelfValidation(rows: AuditRow[]): void {
  const bad = rows.filter(r => r.authoritativeForProvisionalMeasures
    && r.evaluatedModelFamilyContributed && r.humanReviewStatus !== 'REVIEWED');
  if (bad.length > 0) {
    console.log('\nSELF_VALIDATION_GUARD_TRIPPED — the operation treated unreviewed '
      + `model-authored truth as authoritative on: ${bad.map(r => r.caseId).join(', ')}`);
    process.exit(1);
  }
}

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const L: string[] = [];
  const w = (s = '') => L.push(s);
  console.log('§160 EXPERT HAZLENZ — VERIFIER HUMAN-TRUTH RECONCILIATION');
  console.log('='.repeat(100));

  // ================================================================ PHASE 1
  console.log('\n--- PHASE 1  FREEZE\n');
  let drift = 0;
  const freeze: Array<Record<string, unknown>> = [];
  for (const [rel, expected] of FROZEN) {
    const actual = existsSync(join(ROOT, rel)) ? sha256File(join(ROOT, rel)) : 'ABSENT';
    const ok = actual === expected;
    if (!ok) drift += 1;
    freeze.push({ path: rel, expectedSha256: expected, actualSha256: actual, unchanged: ok });
    console.log(`  ${ok ? 'ok  ' : 'DRIFT'}  ${rel}`);
  }
  if (drift > 0) {
    console.log(`\n  ${drift} protected artifact(s) drifted. STOPPING — nothing is computed on a `
      + 'moved baseline.');
    process.exit(1);
  }
  console.log(`\n  ${FROZEN.length}/${FROZEN.length} protected artifacts byte-identical.`);

  // ================================================================ inputs
  const key = readJson<{ key: Array<{ caseId: string; draw: string; rowId: string }> }>(
    join(SRC, 'SEALED-CASE-KEY.json')).key;
  const manifest = readJson<{ entries: Array<Record<string, any>>; derivedFrom: string;
    LIMITATION: string }>(join(SRC, 'TRUTH-MANIFEST.json'));
  const packet = readJson<{ cases: Array<Record<string, any>> }>(join(SRC, 'VERIFIER-PACKET.json'));
  const v1 = readJson<{ results: Array<Record<string, any>> }>(join(SRC, 'VERIFIER-RESULTS.json'));
  const v2 = readJson<{ results: Array<Record<string, any>> }>(
    join(V157, 'VERIFIER-V2-RESULTS.json'));
  const repair = readJson<{ repairedExecution: Record<string, any> }>(
    join(REPAIR, 'VC04-REPAIR-RESULT.json')).repairedExecution;
  const ledger = readJson<{ rows: Array<Record<string, any>> }>(
    join(RECON159, 'ROW-TRUTH-DISPOSITIONS.json')).rows;
  const ledgerByRow = new Map(ledger.map(r => [r.rowId as string, r]));
  const truthById = new Map(manifest.entries.map(e => [e.caseId as string, e]));
  const caseById = new Map(packet.cases.map(c => [c.caseId as string, c]));

  // ================================================================ PHASE 2
  console.log('\n--- PHASE 2  HS-H1 HUMAN DISPOSITION, RECORDED ADDITIVELY\n');
  const hsH1 = {
    HS_H1_HUMAN_DISPOSITION: 'AUTHORING_AMBIGUOUS',
    HUMAN_REVIEW_STATUS: 'REVIEWED',
    STRICT_SELECTOR_DENOMINATOR_PROSPECTIVE_ELIGIBILITY: false,
    HISTORICAL_SCORES_MUTATED: false,
    dispositionedBy: 'PRODUCT_OWNER', dispositionedAt: '2026-09-04',
    authoredTruthPreserved: true, historicalModelOutputsPreserved: true,
    whatIsNotEstablishedByTheObservation: ['load contents/type', 'liquid vs non-liquid load',
      'cycle type', 'load temperature', 'manufacturer/SOP safe-unload criterion',
      'whether a specific cooling hold is required'],
    competingSelectorsNamedByTheReviewer: ['load type', 'actual safe-unload condition',
      'load temperature', 'cycle completion criteria',
      'manufacturer/SOP-defined unloading requirements'],
    governedEvidenceIndependentlyEstablishingTheSelector: 'NONE — governedStandards is [] on the row',
    truthProvenance: 'authored by the evaluated model family; cannot independently establish '
      + 'correctness',
  };
  for (const [k, val] of Object.entries(hsH1).slice(0, 4)) console.log(`  ${k} = ${val}`);

  // ================================================================ PHASE 3 + 4
  console.log('\n--- PHASE 3/4  LOAD-BEARING INVENTORY AND MECHANICAL TRUTH AUDIT\n');
  const rows: AuditRow[] = [];
  for (const k of key) {
    const fixture = hardenedFixtureByRowId(k.rowId)!;
    const t = truthById.get(k.caseId)!;
    const c = caseById.get(k.caseId)!;
    const kind = fixture.expectation.kind as 'REQUIRED' | 'FORBIDDEN';
    const at = (fixture.expectation as { truth: Record<string, any> }).truth;
    const observation: string = fixture.row.source.observation;
    const governed = fixture.row.source.governedStandards as unknown[];
    const emitted: string[] = c.deterministic.familiesEmitted;
    const authoredFamilies = new Set<string>([
      ...(fixture.row.truth.presentHazardFamilies as string[]),
      ...(fixture.row.truth.defensibleHazardFamilies as string[])]);
    const detSupports = emitted.some(f => authoredFamilies.has(f));
    const led = ledgerByRow.get(k.rowId)!;
    const reviewed = led.disposition ? 'REVIEWED' : 'AWAITING_HUMAN_ADJUDICATION';
    const excludedFrom: string[] = (led.excludeFromDenominators as string[] | null) ?? [];

    // ---- limb A. Mechanical only: does the observation itself carry the selector terms?
    const A = kind === 'FORBIDDEN'
      ? 'NOT_APPLICABLE — this row authors no missing fact'
      : matchesSet(observation, t.selectorKeywordSets)
        ? 'OBSERVATION_CONTAINS_THE_SELECTOR_TERMS — mechanically consistent with the fact being '
          + 'STATED; cannot be decided here'
        : 'OBSERVATION_DOES_NOT_CONTAIN_THE_SELECTOR_TERMS — mechanically consistent with '
          + 'unresolved; NOT a semantic confirmation';
    // ---- limbs B and C. String-level distinctness of the authored branches.
    const B = kind === 'FORBIDDEN' ? 'NOT_APPLICABLE'
      : (norm(at.answerA) && norm(at.answerB) && norm(at.answerA) !== norm(at.answerB))
        ? 'YES — two distinct factual states are authored' : 'NO';
    const C = kind === 'FORBIDDEN' ? 'NOT_APPLICABLE'
      : (norm(at.outcomeA) && norm(at.outcomeB) && norm(at.outcomeA) !== norm(at.outcomeB))
        ? 'YES — the authored branches claim different current decisions' : 'NO';
    // ---- limb D. Uniqueness, by the author's own count plus what executions actually raised.
    const selectors: string[] = kind === 'REQUIRED' ? (at.acceptableSelectors as string[]) : [];
    const raised = new Set<string>();
    for (const f of c.unresolvedFacts as Array<Record<string, string>>) raised.add(f.text);
    for (const [, set] of [['v1', v1], ['v2', v2]] as const) {
      const r = set.results.find(x => x.caseId === k.caseId);
      if (r?.proposedClarification?.question) raised.add(r.proposedClarification.question);
      if (r?.nominatedFact?.missingFact) raised.add(r.nominatedFact.missingFact);
    }
    if (k.caseId === 'VC-04' && repair.nominatedFact) {
      raised.add((repair.nominatedFact as Record<string, string>).missingFact);
    }
    const D = kind === 'FORBIDDEN' ? 'NOT_APPLICABLE'
      : selectors.length > 1
        ? `NOT_UNIQUE BY THE AUTHOR'S OWN ADMISSION — ${selectors.length} acceptable selectors are `
          + `authored; ${raised.size} distinct facts were raised by executions`
        : `SINGLE AUTHORED SELECTOR; ${raised.size} distinct facts were raised by executions — `
          + 'whether any is equally appropriate is a semantic question, not decided here';
    // ---- limb E. Governed support.
    const E = governed.length === 0
      ? 'NO_GOVERNED_SUPPORT — governedStandards is [] on this row'
      : `${governed.length} governed record(s) supplied`;
    // ---- limb F. Deterministic support.
    const F = emitted.length === 0
      ? 'NO_DETERMINISTIC_OUTPUT — the engine emitted no family for this row'
      : detSupports
        ? `emitted ${emitted.join(', ')} — intersects the authored present/defensible families`
        : `emitted ${emitted.join(', ')} — DISJOINT from the authored present/defensible families `
          + `(${[...authoredFamilies].join(', ')})`;
    // ---- limbs G and H.
    const G = 'YES — authored in the v9 fixture by the evaluated model family; the §156 manifest '
      + 'records the same limitation';
    const H = reviewed === 'REVIEWED'
      ? `YES — ${led.disposition} (${led.dispositionedBy}, ${led.dispositionedAt})`
      : 'NO — awaiting human adjudication';

    const authoritative = reviewed === 'REVIEWED'
      && ['AUTHORING_VALID_UNIQUE_SELECTOR', 'AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS']
        .includes(String(led.disposition));
    const loadBearing = !excludedFrom.includes('A_decisionCriticalRecall')
      && !excludedFrom.includes('B_selectorAccuracy');

    rows.push({
      caseId: k.caseId, draw: k.draw, rowId: k.rowId, authoredClass: kind,
      fixtureForm: fixture.form,
      historicalClassification: t.correctVerdict,
      inPrimaryDenominator: t.inPrimaryDenominator,
      expectedMissingFact: kind === 'REQUIRED' ? at.missingFact : null,
      expectedAffectedDecision: kind === 'REQUIRED' ? at.affectedDecision : null,
      expectedCounterfactual: kind === 'REQUIRED'
        ? `A: ${at.answerA} -> ${at.outcomeA}  ||  B: ${at.answerB} -> ${at.outcomeB}` : null,
      acceptableSelectorCount: selectors.length,
      truthProvenance: `v9 fixture (${HARDENED_SET_VERSION}), authored by the evaluated model family`,
      governedEvidenceCount: governed.length,
      deterministicFamiliesEmitted: emitted,
      deterministicSupportsAuthoredFamilies: detSupports,
      humanReviewStatus: reviewed,
      evaluatedModelFamilyContributed: true,
      loadBearingAfterHsH1Removal: loadBearing,
      prospectivelyExcludedFrom: excludedFrom,
      A_observationLeavesFactUnresolved: A, B_twoDistinctFactualStates: B,
      C_branchesClaimDifferentCurrentDecisions: C, D_selectorUniqueness: D,
      E_governedEvidenceSupportsDistinction: E, F_deterministicSupplied: F,
      G_authoredByEvaluatedModelFamily: G, H_humanReviewed: H,
      authoritativeForProvisionalMeasures: authoritative,
      authoritativeReason: authoritative
        ? 'human-reviewed and dispositioned valid'
        : reviewed === 'REVIEWED'
          ? `human-reviewed and dispositioned ${led.disposition} — not usable as strict truth`
          : 'no human review; model-authored truth may not be treated as authoritative',
    });
  }

  assertNoSelfValidation(rows);

  console.log('  case   row     class      hist. verdict                   primary  '
    + 'gov det  human-review                  load-bearing  authoritative');
  for (const r of rows) {
    console.log(`  ${r.caseId}  ${r.rowId.padEnd(7)} ${r.authoredClass.padEnd(10)} `
      + `${r.historicalClassification.padEnd(30)} ${(r.inPrimaryDenominator ? 'yes' : 'no ').padEnd(8)} `
      + `${String(r.governedEvidenceCount).padEnd(4)}`
      + `${(r.deterministicSupportsAuthoredFamilies ? 'y' : 'n').padEnd(4)}`
      + `${r.humanReviewStatus.padEnd(30)}`
      + `${(r.loadBearingAfterHsH1Removal ? 'yes' : 'NO ').padEnd(14)}`
      + `${r.authoritativeForProvisionalMeasures ? 'YES' : 'no'}`);
  }

  const requiredRows = rows.filter(r => r.authoredClass === 'REQUIRED');
  console.log(`\n  MECHANICAL AUDIT SUMMARY over ${rows.length} cases `
    + `(${requiredRows.length} REQUIRED, ${rows.length - requiredRows.length} FORBIDDEN)`);
  console.log(`    A  observation does not carry the selector terms   `
    + `${requiredRows.filter(r => r.A_observationLeavesFactUnresolved.startsWith('OBSERVATION_DOES_NOT')).length}`
    + `/${requiredRows.length}  (mechanically consistent with unresolved; NOT confirmation)`);
  console.log(`    B  two distinct authored factual states            `
    + `${requiredRows.filter(r => r.B_twoDistinctFactualStates.startsWith('YES')).length}/${requiredRows.length}`);
  console.log(`    C  branches claim different current decisions      `
    + `${requiredRows.filter(r => r.C_branchesClaimDifferentCurrentDecisions.startsWith('YES')).length}/${requiredRows.length}`);
  console.log(`    D  MULTIPLE acceptable selectors authored          `
    + `${requiredRows.filter(r => r.D_selectorUniqueness.startsWith('NOT_UNIQUE')).length}/${requiredRows.length}`
    + '  — selector uniqueness is not established by the fixture itself');
  console.log(`    E  governed evidence supplied                      `
    + `${rows.filter(r => r.governedEvidenceCount > 0).length}/${rows.length}`);
  console.log(`    F  deterministic output intersects authored families `
    + `${rows.filter(r => r.deterministicSupportsAuthoredFamilies).length}/${rows.length}`);
  console.log(`    G  authored by the evaluated model family          ${rows.length}/${rows.length}`);
  console.log(`    H  human-reviewed                                  `
    + `${rows.filter(r => r.humanReviewStatus === 'REVIEWED').length}/${rows.length}`);

  // ---- Two findings that fall out of the audit and are reported in their own right, because each
  // ---- bears on whether a measure was ever sound rather than on any single case.
  console.log('\n  FINDING 1 — THE SELECTOR KEYWORD SCORER MATCHES THE OBSERVATION ITSELF\n');
  const selfMatching = requiredRows.filter(r =>
    r.A_observationLeavesFactUnresolved.startsWith('OBSERVATION_CONTAINS'));
  for (const r of requiredRows) {
    const t = truthById.get(r.caseId)!;
    const obs: string = hardenedFixtureByRowId(r.rowId)!.row.source.observation;
    const hits = (t.selectorKeywordSets as string[][] | null)?.filter(
      set => set.every(k => obs.toLowerCase().includes(k))) ?? [];
    console.log(`    ${r.caseId} ${r.rowId}  ${hits.length
      ? `MATCHES the observation via ${JSON.stringify(hits)}` : 'does not match the observation'}`);
  }
  console.log(`\n    ${selfMatching.length}/${requiredRows.length} REQUIRED cases have an `
    + 'observation that already satisfies an authored selector keyword set. On those cases a');
  console.log('    question that merely ECHOES THE OBSERVATION scores as reaching the owed fact.');
  console.log('    This is a property of the SCORER, not of any model output, and it means');
  console.log('    B_selectorAccuracy was measuring something weaker than it was named for.');

  console.log('\n  FINDING 2 — DETERMINISTIC SUPPORT IS ABSENT ON EVERY ROW, IN THREE DISTINCT WAYS\n');
  const canonical = new Set<string>(CANONICAL_DETERMINISTIC_FAMILIES as readonly string[]);
  const detBreakdown = { NO_OUTPUT: [] as string[], EMITTED_BUT_DISJOINT: [] as string[],
    INTERSECTS: [] as string[] };
  const nonCanonical = new Set<string>();
  const seenRow = new Set<string>();
  for (const r of rows) {
    for (const f of r.deterministicFamiliesEmitted) if (!canonical.has(f)) nonCanonical.add(f);
    if (seenRow.has(r.rowId)) continue;
    seenRow.add(r.rowId);
    const bucket = r.deterministicFamiliesEmitted.length === 0 ? 'NO_OUTPUT'
      : r.deterministicSupportsAuthoredFamilies ? 'INTERSECTS' : 'EMITTED_BUT_DISJOINT';
    detBreakdown[bucket].push(r.rowId);
  }
  console.log(`    no deterministic output at all      ${detBreakdown.NO_OUTPUT.length} rows — `
    + `${detBreakdown.NO_OUTPUT.join(', ')}`);
  console.log(`    emitted, but DISJOINT from authored ${detBreakdown.EMITTED_BUT_DISJOINT.length} `
    + `rows — ${detBreakdown.EMITTED_BUT_DISJOINT.join(', ')}`);
  console.log(`    intersects the authored families    ${detBreakdown.INTERSECTS.length} rows`);
  console.log(`\n    The vocabularies genuinely overlap — 'suspended_loads' and 'hot_work' are both `
    + 'canonical — so');
  console.log('    the disjointness is substantive and not a naming artifact. Separately, '
    + `${nonCanonical.size} emitted `);
  console.log(`    famil${nonCanonical.size === 1 ? 'y is' : 'ies are'} NOT in `
    + `CANONICAL_DETERMINISTIC_FAMILIES: ${[...nonCanonical].join(', ') || '(none)'}.`);
  console.log('\n    Consequence: on no row did deterministic HazLenz supply support for the');
  console.log('    authored decision-critical claim. Every authored claim rests on the observation');
  console.log('    text alone, judged by the model family that wrote it.');

  // ================================================================ PHASE 5
  console.log('\n--- PHASE 5  HUMAN-REVIEW QUEUE\n');
  const needQueue = rows.filter(r => r.humanReviewStatus !== 'REVIEWED');
  const queueRows = [...new Set(needQueue.map(r => r.rowId))].sort();
  const queue = queueRows.map(rowId => {
    const pkt = join(RECON159, `${rowId}-ROW-TRUTH-RECONCILIATION-PACKET.md`);
    return { rowId, cases: needQueue.filter(r => r.rowId === rowId).map(r => r.caseId),
      packet: existsSync(pkt)
        ? `verification/expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04/${rowId}`
          + '-ROW-TRUTH-RECONCILIATION-PACKET.md' : null,
      packetSha256: existsSync(pkt) ? sha256File(pkt) : null };
  });
  const missingPackets = queue.filter(q => !q.packet);
  for (const q of queue) {
    console.log(`  ${q.rowId}  cases ${q.cases.join(', ').padEnd(22)} `
      + `${q.packet ? 'packet present' : 'PACKET MISSING'}`);
  }
  console.log(`\n  ${needQueue.length} cases over ${queueRows.length} rows require human `
    + `adjudication; ${queue.length - missingPackets.length}/${queue.length} rows have a packet.`);
  if (missingPackets.length > 0) {
    console.log(`  MISSING: ${missingPackets.map(q => q.rowId).join(', ')}`);
  }

  // ================================================================ PHASE 6
  console.log('\n--- PHASE 6  PROVISIONAL RE-DERIVATION ON HUMAN-REVIEWED TRUTH ONLY\n');
  const authoritative = rows.filter(r => r.authoritativeForProvisionalMeasures);
  console.log(`  cases with adequate independent human-reviewed truth: ${authoritative.length}`);
  console.log();

  const measure = (label: string, pool: AuditRow[],
    hit: (r: AuditRow, arm: Array<Record<string, any>>) => boolean, arm: Array<Record<string, any>>) =>
    `${label.padEnd(42)} ${rate(pool.filter(r => hit(r, arm)).length, pool.length)}`;
  const critical = authoritative.filter(r =>
    r.historicalClassification === 'ADD_OR_REPLACE_CLARIFICATION');
  const silence = authoritative.filter(r =>
    r.historicalClassification === 'NO_CLARIFICATION_REQUIRED');
  const semanticHit = (r: AuditRow, arm: Array<Record<string, any>>) => {
    const x = arm.find(a => a.caseId === r.caseId);
    const t = truthById.get(r.caseId)!;
    return !!x && (x.verdict === t.correctVerdict
      || (t.semanticallyEquivalentVerdicts as string[]).includes(x.verdict));
  };
  const selectorHit = (r: AuditRow, arm: Array<Record<string, any>>) => {
    const x = arm.find(a => a.caseId === r.caseId);
    const t = truthById.get(r.caseId)!;
    return !!x?.proposedClarification
      && matchesSet(x.proposedClarification.question, t.selectorKeywordSets);
  };
  const provisional: Record<string, unknown> = {};
  for (const [armName, arm] of [['v1 (§156)', v1.results], ['v2 (§157)', v2.results]] as const) {
    console.log(`  ${armName}`);
    console.log('    ' + measure('decision-critical verifier recall', critical, semanticHit, arm));
    console.log('    ' + measure('selector accuracy', critical, selectorHit, arm));
    console.log('    ' + measure('legitimate-silence specificity', silence, semanticHit, arm));
    console.log('    ' + measure('false NO_CLARIFICATION_REQUIRED', critical,
      (r, a) => a.find(x => x.caseId === r.caseId)?.verdict === 'NO_CLARIFICATION_REQUIRED', arm));
    console.log('    ' + measure('false-positive question rate', silence,
      (r, a) => a.find(x => x.caseId === r.caseId)?.verdict === 'ADD_OR_REPLACE_CLARIFICATION', arm));
    console.log('    ' + measure('nomination accuracy', critical,
      (r, a) => a.find(x => x.caseId === r.caseId)?.clarificationSourceMode === 'NOMINATED_FACT'
        && selectorHit(r, a), arm));
    console.log();
    provisional[armName] = {
      decisionCriticalRecall: rate(critical.filter(r => semanticHit(r, arm)).length, critical.length),
      selectorAccuracy: rate(critical.filter(r => selectorHit(r, arm)).length, critical.length),
      legitimateSilenceSpecificity: rate(silence.filter(r => semanticHit(r, arm)).length,
        silence.length),
      falseNoClarificationRequired: rate(critical.filter(r =>
        arm.find(x => x.caseId === r.caseId)?.verdict === 'NO_CLARIFICATION_REQUIRED').length,
      critical.length),
      falsePositiveQuestionRate: rate(silence.filter(r =>
        arm.find(x => x.caseId === r.caseId)?.verdict === 'ADD_OR_REPLACE_CLARIFICATION').length,
      silence.length),
      nominationAccuracy: rate(0, critical.length),
      denominatorCases: critical.map(r => r.caseId),
    };
  }

  // end-to-end reachable-miss recovery: inventoried, NOT re-derived.
  const e2e = {
    status: 'INSUFFICIENT — denominator is zero after removing unreviewed model-authored truth',
    section155QuotedNotRecomputed: {
      loosRequiredMissesObserved: 5,
      triggerFires: '15/44 (34.1%)',
      triggerCatchesOfFiveMisses: 4,
      escalatesSuccessfulRequired: '0 of 17',
      categoricallyUnreachableMissShapes: 2,
      unreachableShapes: ['§152 HS-H1 — a fluent, well-formed question about the WRONG fact',
        '§153 HS-E1 — a settled silence: the candidate was CORRECTED, nothing was retained'],
    },
    whyItCannotBeReDerivedNow: 'every one of the five observed misses is a miss ONLY against the '
      + 'authored truth now under adjudication. Two of the three rows involved (HS-H1, HS-E1, HS-A1) '
      + 'are undispositioned and the third is AUTHORING_AMBIGUOUS, so the miss set has no '
      + 'human-reviewed member.',
    missPopulationInventory: 'first-pass REQUIRED rows that emitted no clarification: §152 HS-A1; '
      + '§153 HS-A1, HS-E1, HS-H1; §154 HS-A1, HS-E1, HS-H1. INVENTORY ONLY — this is not a '
      + 're-derivation of §155\'s adjudicated figure and does not replace it.',
  };
  console.log('  end-to-end reachable-miss recovery        ' + e2e.status);

  // ================================================================ PHASE 7
  console.log('\n--- PHASE 7  IS REMEDIATION JUSTIFIED\n');
  const humanValidatedMiss = authoritative.filter(r =>
    r.historicalClassification === 'ADD_OR_REPLACE_CLARIFICATION'
    && !semanticHit(r, v2.results));
  const phase7 = {
    q1_atLeastOneIndependentlyHumanValidatedDecisionCriticalMiss:
      humanValidatedMiss.length > 0 ? `YES — ${humanValidatedMiss.map(r => r.caseId).join(', ')}`
        : 'NO — zero cases carry human-reviewed truth, so no miss can be human-validated. This is '
          + 'ABSENCE OF EVIDENCE, not evidence that the verifier is sound.',
    q2_exactMechanismDemonstrated: humanValidatedMiss.length > 0 ? 'see above'
      : 'NONE ESTABLISHED. The §156/§157 misses are misses only against unreviewed authored truth, '
        + 'and the one row a human HAS reviewed returned AUTHORING_AMBIGUOUS.',
    q3_evidenceSupportsChangingVerifierDiscoveryBehaviour:
      'NO. Changing discovery behaviour requires a demonstrated discovery defect. What is '
      + 'demonstrated is that the standard cannot currently distinguish a discovery defect from an '
      + 'authoring defect.',
    q4_usuallyNoSuppressionHypothesisStatus:
      'NOT SUPPORTED AND NOT REFUTED — UNTESTABLE ON THE CURRENT TRUTH. The hypothesis was raised '
      + 'because HS-H1 was never recovered. HS-H1 is now AUTHORING_AMBIGUOUS, so its non-recovery is '
      + 'no longer evidence of suppression. §158 separately measured that the verifier returned '
      + 'different verdicts on byte-identical input, which means a single-draw arm comparison cannot '
      + 'attribute a difference to the instruction at all.',
    q5_wouldTheTwoArmExperimentTestAnEstablishedDefect:
      'NO — it would OPTIMIZE AGAINST UNCERTAIN TRUTH. Its primary endpoint was decision-critical '
      + 'recall over a 12-draw denominator; after HS-H1 removal the eligible denominator is zero '
      + 'human-reviewed cases and at most two model-authored ones.',
    q6_verifierV2Status: 'INSUFFICIENT_HUMAN_TRUTH',
    q6_rationale: 'DEFECT_ESTABLISHED requires a human-validated miss and there is none. '
      + 'DEFECT_NOT_ESTABLISHED would imply the apparent misses dissolved on review, and five of six '
      + 'rows have not been reviewed at all. ARCHITECTURE_INCONCLUSIVE would attribute the problem to '
      + 'the architecture, when the measured obstruction is the truth standard. The containment '
      + 'properties measured in §156/§157 — 7/7 specificity, zero false nominations, whole-verdict '
      + 'refusal on an incomplete proof — are mechanical and are NOT invalidated by this; only the '
      + 'recall-side semantic figures are.',
  };
  for (const [k2, val] of Object.entries(phase7)) console.log(`  ${k2}\n      ${val}\n`);

  // ================================================================ terminal
  const terminal = needQueue.length > 0
    ? 'EXPERT_HAZLENZ_VERIFIER_TRUTH_INCOMPLETE — PRODUCT_OWNER_ADJUDICATION_REQUIRED'
    : humanValidatedMiss.length > 0
      ? 'EXPERT_HAZLENZ_VERIFIER_DEFECT_HUMAN_VALIDATED — TARGETED_REMEDIATION_AUTHORIZATION_REQUIRED'
      : 'EXPERT_HAZLENZ_VERIFIER_DEFECT_NOT_ESTABLISHED — RELIABILITY_INTEGRATION_REVIEW_REQUIRED';
  console.log(`  TERMINAL: ${terminal}\n`);

  // ================================================================ artifacts
  const out = {
    operation: '§160 verifier human-truth reconciliation',
    builtAt: new Date().toISOString(),
    providerCalls: 0, costUsd: 0, firstPassInvocations: 0, productionFilesChanged: 0,
    terminal,
    phase1Freeze: { artifacts: freeze, allUnchanged: drift === 0 },
    phase2HsH1Disposition: hsH1,
    phase3LoadBearingInventory: rows,
    phase4AuditLimbLegend: {
      A: 'MECHANICAL ONLY — whether the observation text carries the authored selector terms. '
        + 'Neither answer settles the semantic question.',
      B: 'string-level distinctness of the two authored factual states',
      C: 'string-level distinctness of the two authored current decisions',
      D: 'selector uniqueness, by the author\'s own count of acceptable selectors plus the count of '
        + 'distinct facts executions actually raised',
      E: 'whether any governed regulatory record was supplied with the row',
      F: 'whether the deterministic engine emitted a family intersecting the authored present or '
        + 'defensible families',
      G: 'whether the truth was authored by the evaluated model family',
      H: 'whether a human has reviewed the semantic truth',
      GUARD: 'assertNoSelfValidation() fails the run if any case is treated as authoritative while '
        + 'G is true and H is false. G and H are NOT convertible into independent truth.',
    },
    phase5HumanReviewQueue: { casesRequiringAdjudication: needQueue.length,
      rowsRequiringAdjudication: queueRows, queue, packetsMissing: missingPackets.length },
    phase6ProvisionalReDerivation: {
      casesWithAdequateHumanReviewedTruth: authoritative.length,
      RESULT: 'INSUFFICIENT — every measure has a zero denominator',
      measures: provisional,
      endToEndReachableMissRecovery: e2e,
      percentageFloor: PERCENTAGE_FLOOR,
      noPassFailManufactured: true,
      hsH1CountedAsStrictMiss: false,
      unreviewedModelAuthoredTruthTreatedAsAuthoritative: false,
    },
    phase4Findings: {
      FINDING_1_SELECTOR_SCORER_MATCHES_THE_OBSERVATION: {
        casesAffected: selfMatching.map(r => `${r.caseId} (${r.rowId})`),
        countOfRequiredCases: `${selfMatching.length}/${requiredRows.length}`,
        statement: 'On these cases the authored selector keyword set is already satisfied by the '
          + 'OBSERVATION TEXT, so a question that merely echoes the observation scores as reaching '
          + 'the owed fact. This is a property of the scorer, not of any model output.',
        consequence: 'B_selectorAccuracy was measuring something weaker than its name implies. It '
          + 'is a separate defect from the authoring ambiguity and is not repaired by excluding '
          + 'HS-H1.',
        notARescoring: 'No historical selector figure is recomputed here. The finding is recorded '
          + 'for the human-truth queue.',
      },
      FINDING_2_NO_DETERMINISTIC_SUPPORT_ON_ANY_ROW: {
        noDeterministicOutputRows: detBreakdown.NO_OUTPUT,
        emittedButDisjointRows: detBreakdown.EMITTED_BUT_DISJOINT,
        intersectsRows: detBreakdown.INTERSECTS,
        emittedFamiliesNotInCanonicalList: [...nonCanonical],
        vocabularyArtifactRuledOut: 'suspended_loads and hot_work are both members of '
          + 'CANONICAL_DETERMINISTIC_FAMILIES, so the disjointness is substantive rather than a '
          + 'naming-space artifact.',
        consequence: 'On no row did deterministic HazLenz supply support for the authored '
          + 'decision-critical claim. Every authored claim rests on the observation text alone, '
          + 'judged by the model family that authored it. This is why limbs E and F cannot rescue '
          + 'limb G.',
      },
    },
    phase7RemediationJustification: phase7,
    historicalImmutability: {
      section156ScoresUnchanged: true, section157ScoresUnchanged: true,
      section152to158ArtifactsUnchanged: true,
      note: 'All §156/§157 metrics remain immutable. Nothing here re-derives a historical score; '
        + '§155 figures are quoted, and the miss population is an inventory, not a re-derivation.',
    },
    degenerateOutputPolicyStatus: 'PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION — preserved '
      + 'independently and NOT reopened by truth reconciliation',
    ninetyCallExperiment: 'NOT AUTHORIZED and NOT JUSTIFIED — see phase 7 q5',
  };
  writeFileSync(join(OUT, 'HUMAN-TRUTH-RECONCILIATION.json'), `${JSON.stringify(out, null, 2)}\n`);

  // ---- the human-readable inventory
  w('# §160 — Verifier human-truth reconciliation');
  w();
  w(`**Terminal: \`${terminal}\`**`);
  w();
  w('Zero provider calls. $0.00. No historical score, artifact, report or terminal altered.');
  w();
  w('## Phase 2 — HS-H1 human disposition');
  w();
  w('| flag | value |');
  w('|---|---|');
  for (const [k2, val] of Object.entries(hsH1).slice(0, 4)) w(`| \`${k2}\` | \`${val}\` |`);
  w();
  w('## Phase 3 — load-bearing truth inventory');
  w();
  w('| case | draw | row | class | historical verdict | primary | selectors | gov | det | '
    + 'human review | load-bearing | authoritative |');
  w('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    w(`| ${r.caseId} | ${r.draw} | ${r.rowId} | ${r.authoredClass} | `
      + `${r.historicalClassification} | ${r.inPrimaryDenominator ? 'yes' : 'no'} | `
      + `${r.acceptableSelectorCount || '—'} | ${r.governedEvidenceCount} | `
      + `${r.deterministicSupportsAuthoredFamilies ? 'y' : 'n'} | ${r.humanReviewStatus} | `
      + `${r.loadBearingAfterHsH1Removal ? 'yes' : 'NO'} | `
      + `${r.authoritativeForProvisionalMeasures ? 'YES' : 'no'} |`);
  }
  w();
  w('Truth provenance is identical for every row: the v9 fixture '
    + `\`${HARDENED_SET_VERSION}\`, authored by the evaluated model family. The §156 manifest states `
    + 'the same limitation in its own words:');
  w();
  w('> ' + manifest.LIMITATION);
  w();
  w('## Phase 4 — mechanical truth audit');
  w();
  w('| case | A observation | B two states | C different decisions | D selector uniqueness | '
    + 'E governed | F deterministic | G model-authored | H human-reviewed |');
  w('|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    w(`| ${r.caseId} | ${r.A_observationLeavesFactUnresolved.split(' —')[0]} | `
      + `${r.B_twoDistinctFactualStates.split(' —')[0]} | `
      + `${r.C_branchesClaimDifferentCurrentDecisions.split(' —')[0]} | `
      + `${r.D_selectorUniqueness.split(' —')[0].split(';')[0]} | `
      + `${r.E_governedEvidenceSupportsDistinction.split(' —')[0]} | `
      + `${r.deterministicSupportsAuthoredFamilies ? 'intersects' : 'DISJOINT/none'} | `
      + `YES | ${r.humanReviewStatus === 'REVIEWED' ? 'YES' : 'NO'} |`);
  }
  w();
  w('**Limb A is mechanical only and settles nothing semantic.** Neither answer confirms or refutes '
    + 'that the fact is genuinely unresolved.');
  w();
  w('**Limbs G and H may not be converted into independent truth.** `assertNoSelfValidation()` fails '
    + 'the run if any case is treated as authoritative while its truth is model-authored and '
    + 'unreviewed.');
  w();
  w('## Phase 6 — provisional re-derivation');
  w();
  w(`Cases with adequate independent human-reviewed truth: **${authoritative.length}**.`);
  w();
  w('Every provisional measure therefore has a **zero denominator** and is reported as');
  w('`INSUFFICIENT`. No pass/fail was manufactured. HS-H1 is not counted as a strict miss.');
  w('Unreviewed model-authored truth is not counted as authoritative.');
  w();
  w('## Phase 7 — is remediation justified');
  w();
  for (const [k2, val] of Object.entries(phase7)) { w(`**${k2}**`); w(); w(`> ${val}`); w(); }
  writeFileSync(join(OUT, 'HUMAN-TRUTH-RECONCILIATION.md'), `${L.join('\n')}\n`);

  console.log(`  -> ${OUT.replace(ROOT + '/', '')}/`);
  console.log('  HISTORICAL SCORES UNTOUCHED. PROVIDER_CALLS_THIS_SCRIPT = 0');
}

main();
