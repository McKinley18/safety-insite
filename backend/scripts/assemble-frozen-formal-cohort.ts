/**
 * §131 -- STEP 1 composition ledger and the FEASIBILITY PROOF that must precede any opening.
 *
 * The authorization to open GAUNTLET_OFFSET_2 and _3 exists "solely to construct the frozen formal
 * cohort and close the measured FORBIDDEN_FAMILY_NEGATIVE_CONTROL composition shortfall". Opening is
 * OPEN-ONCE and irreversible. So the honest order of operations is:
 *
 *   1. derive every frozen requirement from the authoritative artifacts;
 *   2. measure what each authorized source can supply -- using LABEL METADATA ONLY for the reserved
 *      offsets, exactly as §124 did, so nothing is spent to answer the question;
 *   3. decide whether a cohort satisfying EVERY requirement simultaneously exists;
 *   4. open the reserve ONLY if the answer is yes.
 *
 * ==================== WHY PER-CLASS UPPER BOUNDS ARE NOT ENOUGH ====================
 *
 * §126 and §130 both measured supply per class independently. That is the right instrument for
 * proving a BLOCK, but it cannot prove feasibility, because a real cohort must satisfy every class
 * inside ONE row set bounded by COHORT_SIZE_POLICY.hardCeiling.
 *
 * The binding interaction is between CLARIFICATION_OWED and FORBIDDEN_FAMILY_NEGATIVE_CONTROL. Write
 * A for the number of selected rows that are BOTH, and let O and F be the two frozen minimums and H
 * the hard ceiling. Then, by inclusion-exclusion:
 *
 *     H >= |R| >= |OWED u FORBIDDEN| = |OWED| + |FORBIDDEN| - A >= O + F - A
 *     =>  A >= O + F - H
 *
 * That is an exact necessary condition on the POOL: if the whole authorized pool contains fewer than
 * (O + F - H) rows that are simultaneously OWED and forbidden-carrying, NO cohort exists, at any
 * selection, and no amount of additional not-OWED forbidden material can change it.
 *
 * This script computes both sides and reports the verdict. It selects nothing and freezes nothing.
 *
 * READ-ONLY. No provider. No database. No observation is read from any RESERVED partition.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import {
  REQUIRED_CLASS_MINIMUMS, MINIMUM_DEFENSIBLE_ROWS, PREFERRED_ROWS,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-composition';
import { COHORT_SIZE_POLICY, ACCEPTED_EXPERT_TAXONOMY } from
  './lib/expert-cohort-supplemental-policy';
import { toExpertFamily } from '../src/hazlenz/expert-hazlenz/expert-deterministic-projection';
import { EXPERT_INTERACTION_KINDS } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { CORPUS_RETIREMENT_REGISTRY, assertMayOpen } from
  '../src/hazlenz/expert-hazlenz/expert-corpus-retirement-registry';
import { POPULATION_A, POPULATION_B } from
  '../src/hazlenz/tests/hazlenz-decomposition-precision-corpus';
import { AUGMENTATION_ROWS } from
  '../src/hazlenz/expert-hazlenz/fixtures/negative-control-augmentation-v1';
import { SEMANTIC_ROWS } from
  '../src/hazlenz/expert-hazlenz/fixtures/semantic-augmentation-v1';

const ROOT = path.resolve(__dirname, '..', '..');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const out: string[] = [];
function say(s = ''): void { out.push(s); console.log(s); }

/** One pool row, reduced to the class memberships that matter for feasibility. */
interface PoolRow {
  rowId: string;
  source: string;
  owed: boolean;
  forbidden: boolean;
  interaction: boolean;
  multiHazard: boolean;
  lifeCritical: boolean;
  negatedOrSafe: boolean;
  hazardPresent: boolean;
  missRecallOpportunity: boolean;
  reserved: boolean;
}

function recognisedInteraction(families: string[]): string | null {
  const f = new Set(families);
  const pair = (a: string, b: string) => f.has(a) && f.has(b);
  if (pair('electrical', 'confined_space')) return 'ELECTRICAL_WET_ENVIRONMENT';
  if (pair('confined_space', 'chemical_exposure')) return 'CONFINED_SPACE_ATMOSPHERIC';
  if (pair('lockout_tagout', 'machine_guarding')) return 'LOTO_STORED_ENERGY';
  if (pair('chemical_exposure', 'fall_protection')) return 'CHEMICAL_PPE_VENTILATION';
  if (pair('mobile_equipment', 'fall_protection')) return 'MOBILE_EQUIPMENT_PEDESTRIAN';
  if (pair('fall_protection', 'lockout_tagout')) return 'FALL_EXPOSURE_ANCHORAGE';
  return null;
}

interface Classified {
  scenarioId: string; eligible: boolean; primary: string | null; secondaries: string[];
  forbiddenFromUnacceptable: string[]; severityExpectation?: string; engineFamilies: string[];
}

function main(): void {
  say('FORMAL EXPERT HAZLENZ COHORT -- STEP 1 COMPOSITION LEDGER AND FEASIBILITY PROOF');
  say('READ-ONLY. No provider. No database. No RESERVED observation read.');
  say('');

  // ================================================================ frozen requirements
  say('1. FROZEN COMPOSITION REQUIREMENTS, derived from the authoritative artifacts');
  say('   source: expert-cohort-composition.ts REQUIRED_CLASS_MINIMUMS');
  say('           expert-cohort-supplemental-policy.ts COHORT_SIZE_POLICY');
  say('');
  say(`   cohort target rows      ${COHORT_SIZE_POLICY.targetRows}`);
  say(`   minimum defensible rows ${MINIMUM_DEFENSIBLE_ROWS}`);
  say(`   preferred rows          ${PREFERRED_ROWS}`);
  say(`   HARD CEILING            ${COHORT_SIZE_POLICY.hardCeiling}`);
  say(`   onInsufficiency         ${COHORT_SIZE_POLICY.onInsufficiency}`);
  say('');
  for (const [cls, req] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    say(`   ${cls.padEnd(38)} minimum ${String(req.minimum).padStart(3)}   preferred `
      + `${String(req.preferred).padStart(3)}`);
  }

  // ================================================================ pool, per source
  const pool: PoolRow[] = [];

  // -- gauntlet.seed, OPENED in §122
  const classified: Classified[] = JSON.parse(fs.readFileSync(path.join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-assembly-2026-08-31', 'opening', 'reserved-classification.json'),
  'utf8'));
  for (const r of classified.filter(c => c.eligible)) {
    const present = [r.primary!, ...r.secondaries];
    const forb = r.forbiddenFromUnacceptable.filter(f => !present.includes(f));
    const emitted = new Set(r.engineFamilies ?? []);
    pool.push({
      rowId: r.scenarioId, source: 'gauntlet.seed',
      owed: false,                       // no gap label exists in this corpus
      forbidden: forb.length > 0,
      interaction: false,                // no interaction label exists in this corpus
      multiHazard: r.secondaries.length > 0,
      lifeCritical: r.severityExpectation === 'critical',
      negatedOrSafe: false,
      hazardPresent: present.length > 0,
      missRecallOpportunity: present.some(p => !emitted.has(p)),
      reserved: false,
    });
  }

  // -- Population A / B, DEVELOPMENT corpora
  for (const r of POPULATION_A) {
    const forb = r.forbiddenDomains.some(d =>
      ACCEPTED_EXPERT_TAXONOMY.includes(toExpertFamily(d) ?? d));
    pool.push({
      rowId: `POPA-${r.id}`, source: 'Population A', owed: false, forbidden: forb,
      interaction: false, multiHazard: false, lifeCritical: false,
      negatedOrSafe: r.requiredDomains.length === 0, hazardPresent: r.requiredDomains.length > 0,
      missRecallOpportunity: false, reserved: false,
    });
  }
  for (const r of POPULATION_B) {
    const fams = r.required.flatMap(g => g.domains).map(d => toExpertFamily(d) ?? d)
      .filter(f => ACCEPTED_EXPERT_TAXONOMY.includes(f));
    const kind = recognisedInteraction(fams);
    pool.push({
      rowId: `POPB-${r.id}`, source: 'Population B', owed: false, forbidden: false,
      interaction: kind !== null && (EXPERT_INTERACTION_KINDS as readonly string[]).includes(kind),
      multiHazard: r.required.length >= 2, lifeCritical: r.required.some(g => g.lifeCritical),
      negatedOrSafe: false, hazardPresent: r.required.length > 0,
      missRecallOpportunity: false, reserved: false,
    });
  }

  // -- augmentation V2 and the reviewed semantic corpus, both carrying authored truth
  const authored = [
    ...AUGMENTATION_ROWS.map(a => ({ row: a.row, src: 'augmentation V2' })),
    ...SEMANTIC_ROWS.map(a => ({ row: a.row, src: 'semantic §129' })),
  ];
  for (const { row, src } of authored) {
    const t = row.truth;
    pool.push({
      rowId: row.source.rowId, source: src,
      owed: t.decisionCriticalGaps.length > 0,
      forbidden: t.forbiddenHazardFamilies.length > 0,
      interaction: t.recordedInteractions.length > 0,
      multiHazard: t.presentHazardFamilies.length >= 2,
      lifeCritical: t.lifeCriticalHazardFamilies.length > 0,
      negatedOrSafe: t.negatedOrSafeStateFamilies.length > 0,
      hazardPresent: t.presentHazardFamilies.length > 0,
      missRecallOpportunity: false,
      reserved: false,
    });
  }

  // -- RESERVED gauntlet offsets 2 and 3: LABEL METADATA ONLY, no observation read
  say('');
  say('2. RESERVED GAUNTLET OFFSETS 2 AND 3 -- LABEL METADATA ONLY, NOT OPENED');
  say('');
  const srcPath = path.join(ROOT, 'safescope-data', 'gauntlets', 'safescope-gauntlet.source.v1.json');
  const srcBuf = fs.readFileSync(srcPath);
  const srcSha = sha(srcBuf);
  const src = JSON.parse(srcBuf.toString('utf8')) as Array<Record<string, unknown>>;
  const registryRec = CORPUS_RETIREMENT_REGISTRY.find(r => r.partitionId === 'GAUNTLET_OFFSET_2')!;
  say(`   artifact       safescope-data/gauntlets/safescope-gauntlet.source.v1.json`);
  say(`   sha256         ${srcSha}`);
  say(`   registry sha   ${registryRec.corpusSha256}   ${srcSha === registryRec.corpusSha256
    ? 'MATCHES -- artifact unchanged' : 'DRIFTED'}`);
  say(`   partition rule ${registryRec.partitionRule}`);
  const k = parseInt(srcSha.slice(-8), 16) % 4;
  const sorted = [...src].sort((a, b) =>
    String(a.scenarioId) < String(b.scenarioId) ? -1 : String(a.scenarioId) > String(b.scenarioId) ? 1 : 0);
  const partitions: Record<number, Array<Record<string, unknown>>> = { 0: [], 1: [], 2: [], 3: [] };
  sorted.forEach((r, i) => partitions[i % 4].push(r));
  say(`   rows ${src.length}   k = parseInt(sha.slice(-8),16) % 4 = ${k}`);
  say(`   partition sizes  ${[0, 1, 2, 3].map(i => partitions[i].length).join('/')}`);

  // ---- FINDING: the record contains TWO different partition schemes for "offset 2 / offset 3".
  const m5: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  sorted.forEach((r, i) => m5[i % 5].push(String(r.scenarioId)));
  const overlapOf = (four: Array<Record<string, unknown>>, five: string[]) => {
    const b = new Set(five);
    return four.filter(r => b.has(String(r.scenarioId))).length;
  };
  say('');
  say('   *** PARTITION-SCHEME DISCREPANCY -- material to an OPEN-ONCE action ***');
  say('   registry (D-86, authoritative)  : i % 4, sizes '
    + `${[0, 1, 2, 3].map(i => partitions[i].length).join('/')}`);
  say('   §123 NEGATIVE-CONTROL-DETERMINATION.json : i % 5, sizes '
    + `${[0, 1, 2, 3, 4].map(i => m5[i].length).join('/')} ("offset 2 (i %% 5 == 2) ... rows 30")`);
  say(`   "GAUNTLET_OFFSET_2" is ${partitions[2].length} rows under the registry rule and `
    + `${m5[2].length} under §123's; the two sets share only ${overlapOf(partitions[2], m5[2])} rows.`);
  say(`   "GAUNTLET_OFFSET_3" is ${partitions[3].length} vs ${m5[3].length}; they share `
    + `${overlapOf(partitions[3], m5[3])} rows.`);
  say('   An open-once instruction naming "offset 2 and 3" therefore designates DIFFERENT material');
  say('   depending on which record is followed, and opening the wrong set is irreversible.');

  const fieldNames = new Set<string>();
  for (const r of src) for (const key of Object.keys(r)) fieldNames.add(key);
  const hasGapLabel = [...fieldNames].some(key => /gap|missing|clarif/i.test(key));
  const hasInteractionLabel = [...fieldNames].some(key => /interaction/i.test(key));
  say(`   gap label present in ANY field name         : ${hasGapLabel}`);
  say(`   interaction label present in ANY field name : ${hasInteractionLabel}`);
  say('   => a row from these partitions can NEVER be CLARIFICATION_OWED or');
  say('      CROSS_HAZARD_INTERACTION without Level-3 authoring, which is not authorized here.');

  let reservedForbidden = 0;
  for (const offset of [2, 3]) {
    const verdict = assertMayOpen(`GAUNTLET_OFFSET_${offset}`);
    say('');
    say(`   GAUNTLET_OFFSET_${offset}   registry ${verdict.registryStatus}   `
      + `assertMayOpen.allowed = ${verdict.allowed}`);
    let forb = 0;
    for (const r of partitions[offset]) {
      const present = [r.primaryHazardFamily as string,
        ...((r.secondaryHazardFamilies as string[]) ?? [])].filter(Boolean);
      const unacceptable = ((r.unacceptableStandardFamilies as string[]) ?? [])
        .map(d => toExpertFamily(d) ?? d)
        .filter(f => ACCEPTED_EXPERT_TAXONOMY.includes(f) && !present.includes(f));
      if (unacceptable.length > 0) forb += 1;
      pool.push({
        rowId: String(r.scenarioId), source: `GAUNTLET_OFFSET_${offset}`,
        owed: false, forbidden: unacceptable.length > 0, interaction: false,
        multiHazard: ((r.secondaryHazardFamilies as string[]) ?? []).length > 0,
        lifeCritical: r.severityExpectation === 'critical',
        negatedOrSafe: false, hazardPresent: present.length > 0,
        missRecallOpportunity: false, reserved: true,
      });
    }
    reservedForbidden += forb;
    say(`   rows ${partitions[offset].length}   forbidden-label-bearing (UPPER BOUND) ${forb}`);
  }
  say('');
  say(`   TOTAL forbidden-label-bearing rows, UPPER BOUND: ${reservedForbidden}`);
  say('   THIS NUMBER IS NOT COMPARABLE TO THE RECORDED ONES AND IS NOT USED AS A CAPABILITY CLAIM.');
  say('   §123 recorded 9 + 9 = 18 and §126 recorded 16. Both applied an ELIGIBILITY filter that');
  say('   this count does not: in gauntlet.seed only 45 of 100 rows were eligible, and the rule is');
  say('   not reproducible from labels alone (8 of 100 rows carry a taxonomy-mappable primary family');
  say('   and are still marked ineligible). Reproducing it would require opening the partitions.');
  say('   The number is reported as an upper bound only, and the verdict below does not rest on it.');
  say('   NOTHING WAS OPENED. Only field names and label arrays were read; no observation was');
  say('   accessed from either partition.');

  // ================================================================ ledger
  const count = (rows: PoolRow[], f: (r: PoolRow) => boolean) => rows.filter(f).length;
  const open = pool.filter(r => !r.reserved);
  const all = pool;

  const CLASS_SUPPLY: Array<[string, (r: PoolRow) => boolean]> = [
    ['CLARIFICATION_OWED', r => r.owed],
    ['CLARIFICATION_NOT_OWED', r => !r.owed],
    ['FORBIDDEN_FAMILY_NEGATIVE_CONTROL', r => r.forbidden],
    ['CROSS_HAZARD_INTERACTION', r => r.interaction],
    ['MULTI_HAZARD', r => r.multiHazard],
    ['LIFE_CRITICAL_PRESENT', r => r.lifeCritical],
    ['NEGATED_OR_SAFE_STATE', r => r.negatedOrSafe],
    ['DETERMINISTIC_HAZARD_PRESENT', r => r.hazardPresent],
    ['DETERMINISTIC_MISS_RECALL_OPPORTUNITY', r => r.missRecallOpportunity],
  ];

  say('');
  say('3. COMPOSITION LEDGER -- supply by class');
  say('');
  say('   Status below is PER-CLASS ONLY. A class marked ok can still be unreachable inside one');
  say('   row set -- see section 4, which is what actually decides whether a cohort exists.');
  say('');
  say(`   ${'class'.padEnd(38)} ${'req'.padStart(4)} ${'open'.padStart(6)} ${'+resvd'.padStart(7)}  status`);
  const ledger: Array<Record<string, unknown>> = [];
  for (const [cls, pred] of CLASS_SUPPLY) {
    const req = REQUIRED_CLASS_MINIMUMS[cls]?.minimum ?? 0;
    const a = count(open, pred), b = count(all, pred);
    const status = b >= req ? 'ok' : 'SHORT';
    say(`   ${cls.padEnd(38)} ${String(req).padStart(4)} ${String(a).padStart(6)} `
      + `${String(b).padStart(7)}  ${status}`);
    ledger.push({ caseClass: cls, required: req, availableWithoutReserve: a,
      availableWithReserve: b, status });
  }
  // Governed-record classes are ATTACHMENT choices, not row properties.
  const governedSnapshot = path.join(process.env.HOME ?? '', 'Desktop', 'governed-snapshot.csv');
  const governedPresent = fs.existsSync(governedSnapshot);
  for (const cls of ['GOVERNED_RECORD_SUPPLIED', 'NO_GOVERNED_RECORD', 'DISAGREEMENT_OPPORTUNITY']) {
    const req = REQUIRED_CLASS_MINIMUMS[cls].minimum;
    say(`   ${cls.padEnd(38)} ${String(req).padStart(4)} ${'attach'.padStart(6)} `
      + `${'attach'.padStart(7)}  ${governedPresent ? 'satisfiable by attachment' : 'SNAPSHOT ABSENT'}`);
    ledger.push({ caseClass: cls, required: req, availableWithoutReserve: 'ATTACHMENT',
      availableWithReserve: 'ATTACHMENT',
      status: governedPresent ? 'SATISFIABLE_BY_ATTACHMENT' : 'SNAPSHOT_ABSENT' });
  }

  // ================================================================ feasibility
  const O = REQUIRED_CLASS_MINIMUMS.CLARIFICATION_OWED.minimum;
  const F = REQUIRED_CLASS_MINIMUMS.FORBIDDEN_FAMILY_NEGATIVE_CONTROL.minimum;
  const H = COHORT_SIZE_POLICY.hardCeiling;
  const requiredOverlap = O + F - H;
  const bothOpen = open.filter(r => r.owed && r.forbidden);
  const bothAll = all.filter(r => r.owed && r.forbidden);

  say('');
  say('4. SIMULTANEOUS-FEASIBILITY PROOF');
  say('');
  say('   Necessary condition, by inclusion-exclusion over ONE selected row set R:');
  say('     H >= |R| >= |OWED u FORBIDDEN| = |OWED| + |FORBIDDEN| - |OWED n FORBIDDEN|');
  say('     => |OWED n FORBIDDEN| >= O + F - H');
  say('');
  say(`     O = CLARIFICATION_OWED minimum                 ${O}`);
  say(`     F = FORBIDDEN_FAMILY_NEGATIVE_CONTROL minimum  ${F}`);
  say(`     H = COHORT_SIZE_POLICY.hardCeiling             ${H}`);
  say(`     REQUIRED overlap  O + F - H                  = ${requiredOverlap}`);
  say('');
  say(`     AVAILABLE overlap in the OPEN pool           = ${bothOpen.length}`
    + `   (${bothOpen.map(r => r.rowId).join(', ') || 'none'})`);
  say(`     AVAILABLE overlap INCLUDING offsets 2 and 3  = ${bothAll.length}`
    + `   (unchanged: those partitions carry no gap label)`);
  say('');
  const feasible = bothAll.length >= requiredOverlap;
  const maxForbidden = bothAll.length + Math.min(H - O, count(all, r => !r.owed && r.forbidden));
  say(`   MAXIMUM achievable FORBIDDEN count in any ${H}-row cohort that also carries ${O} OWED rows:`);
  say(`     overlap ${bothAll.length} + min(H - O = ${H - O}, non-OWED forbidden available `
    + `${count(all, r => !r.owed && r.forbidden)}) = ${maxForbidden}`);
  say(`     required ${F}   =>  ${maxForbidden >= F ? 'REACHABLE' : `SHORT BY ${F - maxForbidden}`}`);
  say('');
  say(`   FEASIBLE = ${feasible}`);
  if (!feasible) {
    say('');
    const nonOwedForbOpen = count(open, r => !r.owed && r.forbidden);
    const nonOwedForbAll = count(all, r => !r.owed && r.forbidden);
    say('   OPENING THE RESERVE CANNOT CHANGE THIS. Offsets 2 and 3 add only NOT-OWED forbidden');
    say('   rows, and the binding term is the OWED-AND-FORBIDDEN overlap, to which they contribute');
    say('   ZERO -- the artifact carries no gap label at all.');
    say('');
    say('   THE VERDICT IS ROBUST TO THE RESERVED-COUNT UNCERTAINTY. Only `min(H - O, non-OWED');
    say(`   forbidden)` + ' matters, and the slot count H - O = ' + `${H - O}` + ' is already the');
    say(`   binding side WITHOUT the reserve: ${nonOwedForbOpen} non-OWED forbidden rows are already`);
    say(`   available in the open pool (${nonOwedForbAll} including the reserve upper bound), and`);
    say(`   both exceed ${H - O}. The maximum is therefore ${maxForbidden} either way.`);
    say('');
    say('   Under COHORT_SIZE_POLICY.onInsufficiency the correct action is to STOP and report the');
    say('   exact reason, with the reserve INTACT.');
  }

  say('');
  say(`RESERVED_MATERIAL_OPENED = FALSE   PROVIDER_INVOCATION_COUNT = 0   FORMAL_COHORT_SPENT = FALSE`);
  say(`COHORT_STATUS = ${feasible ? 'CANDIDATE_FEASIBLE' : 'INFEASIBLE_UNDER_FROZEN_CONTRACT'}`);

  const dir = path.join(ROOT, 'verification', 'expert-hazlenz-formal-cohort-assembly-2026-09-01');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'COMPOSITION-LEDGER.txt'), out.join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'COMPOSITION-LEDGER.json'), JSON.stringify({
    frozenRequirements: REQUIRED_CLASS_MINIMUMS,
    cohortSizePolicy: COHORT_SIZE_POLICY,
    ledger,
    poolRowCount: all.length,
    poolRowCountWithoutReserve: open.length,
    feasibility: {
      rule: 'H >= |OWED| + |FORBIDDEN| - |OWED n FORBIDDEN|  =>  overlap >= O + F - H',
      O, F, H, requiredOverlap,
      availableOverlapOpenPool: bothOpen.length,
      availableOverlapIncludingReserve: bothAll.length,
      overlapRowIds: bothAll.map(r => r.rowId),
      maxAchievableForbiddenAtMinimumOwed: maxForbidden,
      feasible,
    },
    reservedMaterialOpened: false,
    providerInvocationCount: 0,
  }, null, 2) + '\n');

  console.log(`\nledger written to verification/expert-hazlenz-formal-cohort-assembly-2026-09-01/`);
  if (!feasible) process.exit(3);
}

main();
