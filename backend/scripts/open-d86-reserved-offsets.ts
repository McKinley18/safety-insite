/**
 * §133 -- IRREVERSIBLE OPENING of D-86 GAUNTLET_OFFSET_2 and GAUNTLET_OFFSET_3.
 *
 * ==================== WHAT THIS DOES AND WHY IT CANNOT BE UNDONE ====================
 *
 * The product owner authorized OPTION B: use the existing D-86 reserved negative-control supply to
 * close the measured FORBIDDEN_FAMILY_NEGATIVE_CONTROL shortfall (open supply 44 against a frozen
 * minimum of 48), rather than authoring seven new dual-class semantic rows to preserve an historical
 * hardCeiling of 60.
 *
 * A reserved partition is a SINGLE-USE EXAM. Reading its rows spends it whether or not the result is
 * useful. This script therefore writes the complete pre-open record FIRST -- every identity, hash,
 * count and prior state -- and only then reads the material. If the run dies after the record is
 * written, the material is still spent, and the record says so.
 *
 * ==================== SCOPE, WHICH IS NOT NEGOTIABLE HERE ====================
 *
 * EXACTLY two partitions of exactly one artifact:
 *
 *   safescope-data/gauntlets/safescope-gauntlet.source.v1.json
 *   D-86 rule: scenarioId CMP ascending (UTF-8 byte-wise), 0-based index, m = 4, i % 4 === offset
 *   offset 2 (37 rows) and offset 3 (37 rows)
 *
 * NOT the §123 historical analytical i % 5 partition, which designates different material. The
 * owner resolved that identity question explicitly in favour of the retirement registry's i % 4.
 *
 * Realism offsets 1 and 2 are NOT touched, and their artifact hash is recorded here unchanged so a
 * later reader can prove it.
 *
 * ==================== NO SEMANTIC AUTHORING ====================
 *
 * The opened rows are evaluated by the EXISTING §122 eligibility rule (`reservedRowEligible`) and by
 * the EXISTING deterministic engine. No truth is authored, no label is reinterpreted, no eligibility
 * rule is redesigned, and no row is edited. The source artifact's sha256 is asserted before AND
 * after the read, so "byte-for-byte preserved" is proven rather than promised.
 *
 * NO PROVIDER IS CONSTRUCTED OR CALLED.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import { MultiHazardDecompositionService } from
  '../src/hazlenz/multi-hazard-decomposition/multi-hazard-decomposition.service';
import { toExpertFamily } from '../src/hazlenz/expert-hazlenz/expert-deterministic-projection';
import {
  CORPUS_RETIREMENT_REGISTRY, RETIREMENT_REGISTRY_VERSION, assertMayOpen,
} from '../src/hazlenz/expert-hazlenz/expert-corpus-retirement-registry';
import { EVALUATION_CORPUS_POLICY } from
  '../src/hazlenz/expert-hazlenz/expert-evaluation-plan';
import {
  ACCEPTED_EXPERT_TAXONOMY, reservedRowEligible, RESERVED_SELECTION_ORDER,
  type ReservedRowMetadata,
} from './lib/expert-cohort-supplemental-policy';

const ROOT = path.resolve(__dirname, '..', '..');
const shaOf = (b: string | Buffer) => createHash('sha256').update(b).digest('hex');
const shaFile = (p: string) => shaOf(fs.readFileSync(p));

const OUT_DIR = path.join(ROOT, 'verification',
  'expert-hazlenz-d86-reserved-open-2026-09-01');

const SOURCE_REL = 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json';
const SOURCE_ABS = path.join(ROOT, SOURCE_REL);
const REALISM_REL = 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json';
const SEED_REL = 'safescope-data/gauntlets/safescope-gauntlet.seed.json';
const REGISTRY_REL = 'backend/src/hazlenz/expert-hazlenz/expert-corpus-retirement-registry.ts';
const POLICY_REL = 'backend/scripts/lib/expert-cohort-supplemental-policy.ts';
const PLAN_REL = 'backend/src/hazlenz/expert-hazlenz/expert-evaluation-plan.ts';

const AUTHORIZED_OFFSETS = [2, 3] as const;

interface SourceRow extends ReservedRowMetadata {
  observation: string;
  expectedStandardFamily?: string;
}

const rec = (id: string) => CORPUS_RETIREMENT_REGISTRY.find(r => r.partitionId === id)!;

/**
 * The D-86 partition, executed rather than quoted.
 *
 * CMP is UTF-8 byte-wise ascending with no case folding, collation or normalization. Every
 * `scenarioId` in this artifact is pure ASCII, so a JS relational sort and a Buffer.compare sort
 * agree -- but the byte comparator is used anyway, because agreeing by accident is not the same as
 * being correct, and the equality is asserted below.
 */
function d86Partitions(rows: SourceRow[]): { sorted: SourceRow[]; parts: Record<number, SourceRow[]>;
  k: number; cmpAgrees: boolean } {
  const byteSorted = [...rows].sort((a, b) =>
    Buffer.compare(Buffer.from(a.scenarioId, 'utf8'), Buffer.from(b.scenarioId, 'utf8')));
  const jsSorted = [...rows].sort((a, b) =>
    a.scenarioId < b.scenarioId ? -1 : a.scenarioId > b.scenarioId ? 1 : 0);
  const cmpAgrees = byteSorted.every((r, i) => r.scenarioId === jsSorted[i].scenarioId);
  const parts: Record<number, SourceRow[]> = { 0: [], 1: [], 2: [], 3: [] };
  byteSorted.forEach((r, i) => parts[i % 4].push(r));
  const k = parseInt(shaFile(SOURCE_ABS).slice(-8), 16) % 4;
  return { sorted: byteSorted, parts, k, cmpAgrees };
}

function main(): void {
  // An opening happens ONCE. Re-running would overwrite the recorded timestamp with a later one
  // and quietly falsify the only evidence of when the material was actually spent.
  const existing = path.join(OUT_DIR, 'OPENING-RECORD.txt');
  if (fs.existsSync(existing)) {
    throw new Error('REFUSED: an opening record already exists at '
      + `${path.relative(ROOT, existing)}. GAUNTLET_OFFSET_2 and _3 are already open and spent; `
      + 're-running would overwrite the recorded opening timestamp. Read the existing record.');
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const openedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  // ================================================================ STEP 1 -- PRE-OPEN RECORD
  //
  // Everything below is computed from FILE BYTES and GOVERNANCE METADATA only. No row content of
  // either reserved partition is read until the record has been flushed to disk.

  const preSourceSha = shaFile(SOURCE_ABS);
  const registrySha = shaFile(path.join(ROOT, REGISTRY_REL));
  const policySha = shaFile(path.join(ROOT, POLICY_REL));
  const planSha = shaFile(path.join(ROOT, PLAN_REL));
  const realismSha = shaFile(path.join(ROOT, REALISM_REL));
  const seedSha = shaFile(path.join(ROOT, SEED_REL));

  const rec2 = rec('GAUNTLET_OFFSET_2');
  const rec3 = rec('GAUNTLET_OFFSET_3');
  const verdicts = AUTHORIZED_OFFSETS.map(o => ({ offset: o,
    verdict: assertMayOpen(`GAUNTLET_OFFSET_${o}`) }));

  // A refusal here is FINAL. The guard is consulted before the read, not after it.
  for (const { offset, verdict } of verdicts) {
    if (!verdict.allowed) {
      throw new Error(`REFUSED by assertMayOpen: GAUNTLET_OFFSET_${offset} -- ${verdict.reason}`);
    }
  }
  if (preSourceSha !== rec2.corpusSha256 || preSourceSha !== rec3.corpusSha256) {
    throw new Error(`ARTIFACT DRIFT: ${SOURCE_REL} sha256 ${preSourceSha} does not match the `
      + `registry-recorded ${rec2.corpusSha256}. An open-once action is refused against material `
      + 'whose identity cannot be proven.');
  }

  // Partition membership is derived from `scenarioId` ONLY -- an identifier, not row content -- so
  // the expected counts can be stated in the pre-open record without spending anything.
  const rawBuf = fs.readFileSync(SOURCE_ABS);
  const allRows = JSON.parse(rawBuf.toString('utf8')) as SourceRow[];
  const { parts, k, cmpAgrees } = d86Partitions(allRows);

  const pre: string[] = [];
  const p = (s = '') => pre.push(s);
  p('D-86 RESERVED MATERIAL OPENING RECORD -- GAUNTLET OFFSETS 2 AND 3');
  p('================================================================');
  p(`opened_at_utc:        ${openedAt}`);
  p('operator:             Claude Code, acting under the 2026-09-01 product-owner authorization');
  p('                      "OPTION B -- USE EXISTING D-86 RESERVED NEGATIVE-CONTROL SUPPLY"');
  p('process:              local ts-node, no network egress, no provider client constructed,');
  p('                      no database connection');
  p('');
  p('AUTHORIZED SCOPE (exact, and nothing else):');
  p('  D86_GAUNTLET_OFFSETS_2_AND_3_ONLY');
  p('');
  p('ARTIFACT OPENED');
  p(`  path                ${SOURCE_REL}`);
  p(`  sha256 (pre-open)   ${preSourceSha}`);
  p(`  registry sha256     ${rec2.corpusSha256}   ${preSourceSha === rec2.corpusSha256
    ? 'MATCH -- artifact unmodified since the registry recorded it' : 'DRIFT'}`);
  p(`  total rows          ${allRows.length}`);
  p('');
  p('PARTITION RULE (verbatim from the authoritative retirement registry)');
  p(`  offset 2            ${rec2.partitionRule}`);
  p(`  offset 3            ${rec3.partitionRule}`);
  p('  executed as         sort scenarioId CMP ascending (UTF-8 byte-wise, no case folding, no');
  p('                      collation, no normalization); 0-based index; m = 4; i % 4 === offset');
  p(`  k = parseInt(sha256.slice(-8),16) % 4 = ${k}   (identifies which partition is OFFSET_0)`);
  p(`  byte-wise CMP and JS relational sort agree: ${cmpAgrees}   (all scenarioIds are ASCII)`);
  p(`  measured partition sizes  ${[0, 1, 2, 3].map(i => parts[i].length).join(' / ')}`);
  p('  registry-expected sizes   38 / 38 / 37 / 37');
  p('');
  p('  NOT the §123 historical analytical i % 5 partition. The product owner resolved the identity');
  p('  question in favour of the retirement registry scheme; §131 measured that the two schemes');
  p('  designate materially different row sets, and opening is irreversible.');
  p('');
  p('OFFSETS OPENED, AND THEIR EXPECTED ROW COUNTS');
  for (const o of AUTHORIZED_OFFSETS) {
    p(`  GAUNTLET_OFFSET_${o}   expected 37   measured ${parts[o].length}   `
      + `${parts[o].length === 37 ? 'MATCH' : 'MISMATCH'}`);
  }
  p('');
  p('PRIOR RETIREMENT / OPEN STATE OF EVERY PARTITION OF THIS ARTIFACT');
  for (const id of ['GAUNTLET_OFFSET_0', 'GAUNTLET_OFFSET_1', 'GAUNTLET_OFFSET_2',
    'GAUNTLET_OFFSET_3']) {
    const r = rec(id);
    p(`  ${id.padEnd(20)} ${r.status.padEnd(12)} mayEverReopen=${String(r.mayEverReopen).padEnd(5)} `
      + `${r.decisionSource}`);
  }
  p('');
  p('FAIL-CLOSED GUARD VERDICTS, TAKEN BEFORE THE READ');
  for (const { offset, verdict } of verdicts) {
    p(`  GAUNTLET_OFFSET_${offset}   allowed=${verdict.allowed}   `
      + `registryStatus=${verdict.registryStatus}   planSaysClosed=${verdict.planSaysClosed}`);
    p(`     ${verdict.reason}`);
  }
  p('');
  p('  EVALUATION_CORPUS_POLICY.reserved (frozen plan, verbatim):');
  for (const r of EVALUATION_CORPUS_POLICY.reserved) p(`     ${r}`);
  p('  EVALUATION_CORPUS_POLICY.closed (frozen plan, verbatim):');
  for (const c of EVALUATION_CORPUS_POLICY.closed) p(`     ${c}`);
  p('  The plan names "gauntlet offsets 2 and 3" as RESERVED and does not name them CLOSED. Both');
  p('  sources agree the material is openable, which is the only condition under which');
  p('  assertMayOpen returns allowed.');
  p('');
  p('NOT OPENED -- these remain available as future single-use exams, hashes recorded so a later');
  p('reader can prove they were untouched by this operation:');
  p(`  ${REALISM_REL}`);
  p(`     sha256 ${realismSha}   (REALISM_OFFSET_1 and REALISM_OFFSET_2 remain RESERVED)`);
  p('');
  p('ALL RELEVANT SOURCE HASHES AT OPEN TIME');
  p(`  ${SOURCE_REL}`);
  p(`     ${preSourceSha}`);
  p(`  ${SEED_REL}   (opened in §122, unchanged)`);
  p(`     ${seedSha}`);
  p(`  ${REALISM_REL}   (untouched)`);
  p(`     ${realismSha}`);
  p(`  ${REGISTRY_REL}`);
  p(`     ${registrySha}   version ${RETIREMENT_REGISTRY_VERSION}`);
  p(`  ${POLICY_REL}   (the §122 eligibility rule, frozen before any reserved row was seen)`);
  p(`     ${policySha}`);
  p(`  ${PLAN_REL}`);
  p(`     ${planSha}`);
  p('');
  p('AUTHORIZED PURPOSE');
  p('  Apply the EXISTING §122 eligibility rule to the opened rows; measure their existing class');
  p('  labels; feed the measured supply into local exact joint-feasibility analysis.');
  p('FORBIDDEN PURPOSE');
  p('  Provider execution; prompt development; semantic authoring of any kind; editing or');
  p('  reinterpreting any label; redesigning the eligibility rule; freezing a cohort.');
  p('');
  p('RESERVED_MATERIAL_OPENED = TRUE');
  p('RESERVED_SCOPE          = D86_GAUNTLET_OFFSETS_2_AND_3_ONLY');
  p('PROVIDER_INVOCATION_COUNT = 0');
  p('');
  p('EXACT ROW IDENTIFIERS EXPOSED BY THIS OPENING');
  for (const o of AUTHORIZED_OFFSETS) {
    p('');
    p(`  GAUNTLET_OFFSET_${o}  (${parts[o].length} rows, ${RESERVED_SELECTION_ORDER})`);
    for (const r of parts[o]) p(`    ${r.scenarioId}`);
  }
  p('');
  p('THIS OPENING IS IRREVERSIBLE. Both partitions are SPENT as of the timestamp above, whether or');
  p('not the material proves useful. They may never be opened again for a different exam.');

  fs.writeFileSync(path.join(OUT_DIR, 'OPENING-RECORD.txt'), pre.join('\n') + '\n');
  console.log(pre.join('\n'));

  // ================================================================ STEP 2 -- ELIGIBILITY
  //
  // From here the material IS open. The rule applied is the frozen §122 rule, unchanged.

  // The accepted taxonomy is asserted against the projection's value set, never trusted -- the same
  // assertion §122 made before classifying the seed.
  const projected = new Set<string>();
  for (const label of ['machine guarding', 'hazardous energy control', 'live electrical parts',
    'confined space', 'fall protection', 'hazard communication', 'powered industrial truck']) {
    const f = toExpertFamily(label);
    if (f) projected.add(f);
  }
  const declared = new Set(ACCEPTED_EXPERT_TAXONOMY);
  if (projected.size !== declared.size || ![...projected].every(f => declared.has(f))) {
    throw new Error('ACCEPTED_EXPERT_TAXONOMY does not equal the projection value set');
  }

  const decomposer = new MultiHazardDecompositionService();
  const classified: Array<Record<string, unknown>> = [];

  for (const offset of AUTHORIZED_OFFSETS) {
    for (const row of parts[offset]) {
      const verdict = reservedRowEligible(row, toExpertFamily);
      const decomposition = decomposer.decompose(row.observation, {});
      const engineFamilies = Array.from(new Set(decomposition.hazards.map(h => h.domainId)));

      // The forbidden-family derivation is copied from §122's own classifier, not re-invented:
      // map `unacceptableStandardFamilies` through the frozen projection, drop anything the
      // projection cannot express, then drop any family the row also asserts as PRESENT -- a family
      // cannot be both a present hazard and a negative control on the same row.
      const forbiddenFromUnacceptable = Array.from(new Set(
        (row.unacceptableStandardFamilies ?? []).map(toExpertFamily)
          .filter((f): f is string => !!f)));
      const present = verdict.eligible ? [verdict.primary!, ...verdict.secondaries] : [];
      const forbiddenNet = forbiddenFromUnacceptable.filter(f => !present.includes(f));

      classified.push({
        scenarioId: row.scenarioId,
        d86Offset: offset,
        eligible: verdict.eligible,
        reason: verdict.reason,
        primary: verdict.primary,
        secondaries: verdict.secondaries,
        rawPrimaryHazardFamily: row.primaryHazardFamily ?? null,
        rawSecondaryHazardFamilies: row.secondaryHazardFamilies ?? [],
        rawUnacceptableStandardFamilies: row.unacceptableStandardFamilies ?? [],
        forbiddenFromUnacceptable,
        forbiddenNet,
        isForbiddenFamilyNegativeControl: verdict.eligible && forbiddenNet.length > 0,
        selectedIntoEligibleSupply: verdict.eligible,
        severityExpectation: row.severityExpectation ?? null,
        agency: row.agency ?? null,
        engineFamilies,
        engineStates: decomposition.hazards.map(h => ({
          domainId: h.domainId, conditionState: h.conditionState ?? null,
          correctionStatus: h.correctionStatus ?? null,
          evidenceGaps: h.evidenceGaps ?? [],
        })),
        rowSha256: shaOf(JSON.stringify(row)),
        observation: row.observation,
      });
    }
  }

  // Byte-for-byte preservation, PROVEN rather than promised.
  const postSourceSha = shaFile(SOURCE_ABS);
  if (postSourceSha !== preSourceSha) {
    throw new Error(`SOURCE MUTATED DURING OPEN: ${preSourceSha} -> ${postSourceSha}`);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'opened-rows-classification.json'),
    JSON.stringify(classified, null, 2) + '\n');
  // The opened material itself, verbatim, so a later reader never has to re-open the artifact.
  for (const offset of AUTHORIZED_OFFSETS) {
    fs.writeFileSync(path.join(OUT_DIR, `opened-offset-${offset}.json`),
      JSON.stringify(parts[offset], null, 2) + '\n');
  }

  // ---------------------------------------------------------------- reconciliation
  const rpt: string[] = [];
  const s = (t = '') => rpt.push(t);
  s('D-86 OFFSETS 2 AND 3 -- MEASURED ELIGIBILITY AND REGISTRY RECONCILIATION');
  s('=======================================================================');
  s(`opened_at_utc ${openedAt}`);
  s('');
  s(`eligibility rule: reservedRowEligible (§122, ${POLICY_REL})`);
  s(`policy sha256   : ${policySha}`);
  s('rule applied UNCHANGED. No eligibility redesign, no label reinterpretation, no authoring.');
  s('');

  const summary: Array<Record<string, unknown>> = [];
  for (const offset of AUTHORIZED_OFFSETS) {
    const rows = classified.filter(c => c.d86Offset === offset);
    const eligible = rows.filter(c => c.eligible);
    const forb = rows.filter(c => c.isForbiddenFamilyNegativeControl);
    const reasons = new Map<string, number>();
    for (const r of rows) reasons.set(String(r.reason), (reasons.get(String(r.reason)) ?? 0) + 1);
    s(`GAUNTLET_OFFSET_${offset}`);
    s(`  rows opened                                  ${rows.length}`);
    s(`  ELIGIBLE under the frozen §122 rule          ${eligible.length}`);
    s(`  eligible AND forbidden-negative-control      ${forb.length}`);
    s('  eligibility reason breakdown:');
    for (const [reason, n] of [...reasons].sort((a, b) => b[1] - a[1])) {
      s(`    ${reason.padEnd(28)} ${String(n).padStart(3)}`);
    }
    s(`  registry-recorded eligible contribution      8`);
    s(`  MEASURED forbidden-negative contribution     ${forb.length}   `
      + `${forb.length === 8 ? 'MATCHES the registry' : 'DIFFERS from the registry'}`);
    s('');
    summary.push({ offset, rowsOpened: rows.length, eligible: eligible.length,
      eligibleForbiddenNegativeControl: forb.length, registryRecorded: 8,
      reasonBreakdown: Object.fromEntries(reasons) });
  }

  const totalEligible = classified.filter(c => c.eligible).length;
  const totalForb = classified.filter(c => c.isForbiddenFamilyNegativeControl).length;
  s('RECONCILIATION AGAINST THE RETIREMENT REGISTRY');
  s(`  registry-recorded eligible contribution   8 + 8 = 16`);
  s(`  MEASURED eligible rows                    ${summary[0].eligible} + ${summary[1].eligible}`
    + ` = ${totalEligible}`);
  s(`  MEASURED forbidden-negative controls      `
    + `${summary[0].eligibleForbiddenNegativeControl} + `
    + `${summary[1].eligibleForbiddenNegativeControl} = ${totalForb}`);
  s('');
  s('  The registry\'s own evidence field describes its 8 + 8 as "negative-control-capable rows"');
  s('  counted from LABEL METADATA ONLY, "without reading any observation". It was never a claim');
  s('  about the §122 eligibility rule, which §131 measured as NOT reproducible from labels alone');
  s('  (in gauntlet.seed, 8 of 100 rows carry a taxonomy-mappable primary family and are still');
  s('  ineligible). The measured figure is the authoritative one from here on; the registry figure');
  s('  is left as recorded, unchanged, and reported alongside rather than silently reconciled.');
  s('');
  s('EXACT ELIGIBLE FORBIDDEN-NEGATIVE-CONTROL ROWS');
  for (const c of classified.filter(x => x.isForbiddenFamilyNegativeControl)) {
    s(`  ${String(c.scenarioId).padEnd(16)} offset ${c.d86Offset}   present `
      + `[${[c.primary, ...(c.secondaries as string[])].join(', ')}]   forbidden `
      + `[${(c.forbiddenNet as string[]).join(', ')}]`);
  }
  s('');
  s('OTHER MEASURABLE CLASS LABELS CARRIED BY THE ELIGIBLE OPENED ROWS');
  const el = classified.filter(c => c.eligible);
  const multi = el.filter(c => (c.secondaries as string[]).length > 0).length;
  const lifeCrit = el.filter(c => c.severityExpectation === 'critical').length;
  const hazardPresent = el.filter(c => (c.primary as string | null) !== null).length;
  const missRecall = el.filter(c => {
    const present = [c.primary as string, ...(c.secondaries as string[])];
    const emitted = new Set(c.engineFamilies as string[]);
    return present.some(f => !emitted.has(f));
  }).length;
  s(`  MULTI_HAZARD                           ${multi}`);
  s(`  LIFE_CRITICAL_PRESENT                  ${lifeCrit}`);
  s(`  DETERMINISTIC_HAZARD_PRESENT           ${hazardPresent}`);
  s(`  DETERMINISTIC_MISS_RECALL_OPPORTUNITY  ${missRecall}`);
  s('  CLARIFICATION_OWED                     0   (structural: the artifact carries no gap label)');
  s('  CROSS_HAZARD_INTERACTION               0   (structural: no interaction label)');
  s('  NEGATED_OR_SAFE_STATE                  0   (structural: no negation/safe-state label)');
  s('');
  s('  The three zeros are STRUCTURAL, not measured absences: those classes require an authored');
  s('  Level-3 judgment the artifact does not carry, and authoring one is not authorized here.');
  s('');
  s(`source sha256 after the read: ${postSourceSha}   IDENTICAL to pre-open -- byte-for-byte preserved`);
  s('');
  s('RESERVED_MATERIAL_OPENED   = TRUE');
  s('RESERVED_SCOPE             = D86_GAUNTLET_OFFSETS_2_AND_3_ONLY');
  s('PROVIDER_INVOCATION_COUNT  = 0');
  s('FORMAL_COHORT_SPENT        = FALSE');
  s('P4_PRESPEND_AUTHORIZATION  = FALSE');
  s('COHORT_STATUS              = CANDIDATE');

  fs.writeFileSync(path.join(OUT_DIR, 'ELIGIBILITY-RECONCILIATION.txt'), rpt.join('\n') + '\n');
  fs.writeFileSync(path.join(OUT_DIR, 'ELIGIBILITY-RECONCILIATION.json'), JSON.stringify({
    openedAtUtc: openedAt,
    reservedScope: 'D86_GAUNTLET_OFFSETS_2_AND_3_ONLY',
    partitionRule: 'D-86: scenarioId CMP ascending, 0-based, m=4, i%4===offset',
    sourceArtifact: SOURCE_REL,
    sourceSha256PreOpen: preSourceSha,
    sourceSha256PostOpen: postSourceSha,
    registrySha256: registrySha,
    policySha256: policySha,
    perOffset: summary,
    registryRecordedEligibleContribution: 16,
    measuredEligibleRows: totalEligible,
    measuredEligibleForbiddenNegativeControls: totalForb,
    eligibleForbiddenRowIds: classified
      .filter(c => c.isForbiddenFamilyNegativeControl).map(c => c.scenarioId),
    otherClassLabelsAmongEligible: {
      MULTI_HAZARD: multi, LIFE_CRITICAL_PRESENT: lifeCrit,
      DETERMINISTIC_HAZARD_PRESENT: hazardPresent,
      DETERMINISTIC_MISS_RECALL_OPPORTUNITY: missRecall,
      CLARIFICATION_OWED: 0, CROSS_HAZARD_INTERACTION: 0, NEGATED_OR_SAFE_STATE: 0,
    },
    reservedMaterialOpened: true,
    providerInvocationCount: 0,
    formalCohortSpent: false,
    p4PrespendAuthorization: false,
    cohortStatus: 'CANDIDATE',
  }, null, 2) + '\n');

  console.log('');
  console.log(rpt.join('\n'));
  console.log('');
  console.log(`written to verification/expert-hazlenz-d86-reserved-open-2026-09-01/`);
}

main();
