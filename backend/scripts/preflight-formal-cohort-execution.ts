/**
 * §130 -- PREFLIGHT for the formal Expert HazLenz evaluation cohort execution.
 *
 * Runs BEFORE the first provider call and answers one question: does the exact frozen formal cohort
 * and its preregistered execution/scoring plan actually exist in this repository, and is every
 * pre-spend gate bit TRUE?
 *
 * READ-ONLY. It selects nothing, authors nothing, freezes nothing, opens no reserved material, and
 * calls no provider. It exists so that "the cohort is frozen" is a MEASURED fact rather than an
 * assumption carried into a spend that cannot be undone.
 *
 * Composition supply is measured the same way §126 measured it: a per-class UPPER BOUND computed
 * independently. A real <=60-row selection must satisfy every class SIMULTANEOUSLY within the same
 * rows, so the achievable numbers are <= these. That makes a BLOCKED conclusion robust and a
 * not-blocked conclusion provisional -- which is the correct asymmetry before a spend.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION,
  EXPERT_INTERACTION_KINDS,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_PROMPT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { EXPERT_SCORER_VERSION } from '../src/hazlenz/expert-hazlenz/expert-measure-scorers';
import {
  EXPERT_MEASUREMENT_CONTRACT_VERSION, assertContractMatchesPlan, gatedMeasureIds, reportedMeasureIds,
  frozenFieldsFor,
} from '../src/hazlenz/expert-hazlenz/expert-measurement-contract';
import { EVALUATION_PRECONDITIONS } from '../src/hazlenz/expert-hazlenz/expert-evaluation-plan';
import {
  COHORT_COMPOSITION_VERSION, REQUIRED_CLASS_MINIMUMS, MINIMUM_DEFENSIBLE_ROWS, PREFERRED_ROWS,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-composition';
import { FORMAL_COHORT_ROW_CONTRACT_VERSION } from
  '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import {
  EXPERT_COHORT_HARNESS_VERSION, providerInvocationCount, resetProviderInvocationCount,
} from './lib/expert-cohort-harness';
import { CANONICAL_EXPERT_INPUT_BUILDER_VERSION } from
  '../src/hazlenz/expert-hazlenz/expert-input-constructor';
import { toExpertFamily } from '../src/hazlenz/expert-hazlenz/expert-deterministic-projection';
import { ACCEPTED_EXPERT_TAXONOMY, COHORT_SIZE_POLICY } from
  './lib/expert-cohort-supplemental-policy';
import { POPULATION_A, POPULATION_B } from
  '../src/hazlenz/tests/hazlenz-decomposition-precision-corpus';
import { AUGMENTATION_ROWS } from
  '../src/hazlenz/expert-hazlenz/fixtures/negative-control-augmentation-v1';
import {
  SEMANTIC_ROWS, SEMANTIC_AUGMENTATION_IDENTIFIER,
} from '../src/hazlenz/expert-hazlenz/fixtures/semantic-augmentation-v1';
import { CORPUS_LIFECYCLE_STATE } from './lib/expert-semantic-augmentation-review-record';

const ROOT = path.resolve(__dirname, '..', '..');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const fileSha = (p: string) => fs.existsSync(p) ? sha(fs.readFileSync(p)) : 'ABSENT';

const out: string[] = [];
function say(s = ''): void { out.push(s); console.log(s); }

interface GateBit { id: string; requirement: string; value: boolean | 'AMBIGUOUS'; evidence: string; }
const gates: GateBit[] = [];
function gate(id: string, requirement: string, value: boolean | 'AMBIGUOUS', evidence: string): void {
  gates.push({ id, requirement, value, evidence });
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
  forbiddenFromUnacceptable: string[]; severityExpectation?: string;
}

function main(): void {
  resetProviderInvocationCount();

  say('FORMAL EXPERT HAZLENZ COHORT -- PRE-SPEND PREFLIGHT');
  say('READ-ONLY. NO PROVIDER CALL. NOTHING SELECTED, AUTHORED OR FROZEN.');
  say('');

  // ================================================================ 1. INSTRUMENT IDENTITIES
  say('1. INSTRUMENT IDENTITIES -- what WOULD execute, if a cohort existed');
  say('');
  const model = process.env.EXPERT_ANTHROPIC_MODEL || 'claude-sonnet-5';
  const rows: Array<[string, string]> = [
    ['provider adapter', 'src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider.ts'],
    ['provider', 'anthropic'],
    ['model (default; EXPERT_ANTHROPIC_MODEL overridable)', model],
    ['prompt version', EXPERT_PROMPT_VERSION],
    ['input contract', EXPERT_INPUT_CONTRACT_VERSION],
    ['analysis contract', EXPERT_ANALYSIS_CONTRACT_VERSION],
    ['validator', EXPERT_VALIDATOR_VERSION],
    ['canonical input builder', CANONICAL_EXPERT_INPUT_BUILDER_VERSION],
    ['scorer', EXPERT_SCORER_VERSION],
    ['measurement contract', EXPERT_MEASUREMENT_CONTRACT_VERSION],
    ['cohort row contract', FORMAL_COHORT_ROW_CONTRACT_VERSION],
    ['cohort composition', COHORT_COMPOSITION_VERSION],
    ['cohort harness', EXPERT_COHORT_HARNESS_VERSION],
  ];
  for (const [k, v] of rows) say(`   ${k.padEnd(46)} ${v}`);

  const planProblems = assertContractMatchesPlan();
  say('');
  say(`   measurement contract vs frozen plan : ${planProblems.length} problem(s)`);
  for (const p of planProblems) say(`     ${p}`);
  say(`   HARD_GATEs : ${gatedMeasureIds().length}   REPORTED : ${reportedMeasureIds().length}`);
  for (const id of gatedMeasureIds()) {
    const f = frozenFieldsFor(id);
    say(`     ${id.padEnd(44)} ${f.direction} ${f.threshold ?? 'n/a'}`);
  }
  gate('SCORER_MATCHES_PREREGISTRATION',
    'scorer/gates match the frozen preregistration',
    planProblems.length === 0,
    `assertContractMatchesPlan(): ${planProblems.length} problems; scorer ${EXPERT_SCORER_VERSION}`);

  // ================================================================ 2. CORPUS STATE
  say('');
  say('2. REVIEWED SEMANTIC CORPUS -- unchanged since the 46/0 POST_HUMAN_REVIEW validation?');
  say('');
  const semRows = SEMANTIC_ROWS.map(r => r.row);
  const manifest = sha(JSON.stringify(semRows.map(r => ({
    rowId: r.source.rowId, observation: r.source.observation }))));
  const truthKeys = sha(JSON.stringify(semRows.map(r => ({
    rowId: r.source.rowId, truth: r.truth }))));
  const provenance = sha(JSON.stringify(SEMANTIC_ROWS.map(r => ({
    rowId: r.row.source.rowId, provenance: r.provenance, forbiddenRationale: r.forbiddenRationale,
    gapPackets: r.gapPackets, interactionPackets: r.interactionPackets,
    authorUncertainty: r.authorUncertainty,
  }))));
  const sealPath = path.join(ROOT, 'verification',
    'expert-hazlenz-semantic-augmentation-2026-08-31', 'corpus', 'SEAL.json');
  const seal = JSON.parse(fs.readFileSync(sealPath, 'utf8'));
  const unchanged = seal.manifestSha256 === manifest && seal.truthKeySha256 === truthKeys
    && seal.provenanceSha256 === provenance;
  say(`   identifier      ${SEMANTIC_AUGMENTATION_IDENTIFIER}`);
  say(`   lifecycle       ${CORPUS_LIFECYCLE_STATE.governingPhase}`);
  say(`   seal status     ${seal.status}`);
  say(`   manifest        ${manifest}  ${seal.manifestSha256 === manifest ? 'MATCHES SEAL' : 'DRIFTED'}`);
  say(`   truth keys      ${truthKeys}  ${seal.truthKeySha256 === truthKeys ? 'MATCHES SEAL' : 'DRIFTED'}`);
  say(`   provenance      ${provenance}  ${seal.provenanceSha256 === provenance ? 'MATCHES SEAL' : 'DRIFTED'}`);
  gate('CORPUS_TRUTH_UNCHANGED',
    'no corpus truth changed since the successful POST_HUMAN_REVIEW validation',
    unchanged, 'all three sealed hashes recomputed from the fixture and compared');

  // ================================================================ 3. DOES A FROZEN COHORT EXIST?
  say('');
  say('3. THE FROZEN FORMAL COHORT -- searched for, not assumed');
  say('');
  const candidatePath = path.join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-assembly-2026-08-31', 'manifest', 'candidate-rows.json');
  let candidateArtifact = 'ABSENT';
  let candidateRowCount = 0;
  let candidateWithGaps = 0, candidateWithInter = 0, candidateWithGoverned = 0;
  if (fs.existsSync(candidatePath)) {
    const c = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
    candidateArtifact = c.artifact;
    candidateRowCount = c.rowCount;
    candidateWithGaps = c.rows.filter((r: { truth: { decisionCriticalGaps: unknown[] } }) =>
      r.truth.decisionCriticalGaps.length > 0).length;
    candidateWithInter = c.rows.filter((r: { truth: { recordedInteractions: unknown[] } }) =>
      r.truth.recordedInteractions.length > 0).length;
    candidateWithGoverned = 0;   // the assembler writes governedStandards: [] on every row
  }
  say(`   only cohort artifact found : ${candidateArtifact}`);
  say(`   path                       : verification/expert-hazlenz-formal-cohort-assembly-2026-08-31/`
    + 'manifest/candidate-rows.json');
  say(`   rows                       : ${candidateRowCount}`);
  say(`   rows carrying a gap        : ${candidateWithGaps}`);
  say(`   rows carrying an interaction: ${candidateWithInter}`);
  say(`   rows carrying a governed record: ${candidateWithGoverned}`);
  say(`   contains the reviewed semantic corpus? NO -- it predates it (§122 vs §127-§129)`);
  const frozenCohortExists = candidateArtifact !== 'ABSENT'
    && !/NOT_FROZEN|CANDIDATE/.test(candidateArtifact);
  gate('FROZEN_COHORT_EXISTS',
    'formal cohort definition matches the frozen preregistration',
    frozenCohortExists,
    `the only cohort artifact in the repository declares itself "${candidateArtifact}"`);
  gate('COHORT_RUN_IDENTIFIER_PREREGISTERED',
    'an exact cohort/run identifier is preregistered', false,
    'no cohort identifier and no run identifier exist in any repository artifact');
  gate('CALL_AND_COST_CAP_PREREGISTERED',
    'an exact call count and cost/call hard cap are already preregistered', false,
    'callCeiling and spendCeilingUsd are caller-supplied HarnessOptions parameters with no frozen '
    + 'value anywhere; COHORT_SIZE_POLICY states row counts only (target 60, hard ceiling 60)');

  // ================================================================ 4. P4 AS FROZEN
  say('');
  say('4. P4_PRESPEND_AUTHORIZATION -- the frozen requirement, quoted');
  say('');
  const p4 = EVALUATION_PRECONDITIONS.find(p => p.id === 'P4_PRESPEND_AUTHORIZATION')!;
  say(`   requirement   "${p4.requirement}"`);
  say(`   establishedBy "${p4.establishedBy}"`);
  say(`   blocksIfUnmet ${p4.blocksIfUnmet.join(', ')}`);
  say('');
  say('   The authorization must name THREE things. Measured against this repository:');
  say('     the cohort      -- NOT NAMEABLE: no frozen cohort exists to name');
  say('     the call count  -- NOT NAMED: no call count is preregistered anywhere');
  say('     the ceiling     -- NOT NAMED: no cost or call ceiling is preregistered anywhere');
  gate('P4_PRESPEND_AUTHORIZATION_COMPLETE',
    'P4 as frozen: an owner authorization naming the cohort, the call count and the ceiling',
    false,
    'the authorization declares the bit TRUE but names none of the three required elements, and '
    + 'the cohort it points at does not exist');

  // ================================================================ 5. COMPOSITION SUPPLY
  say('');
  say('5. MAXIMUM ACHIEVABLE COMPOSITION -- now including the reviewed semantic corpus');
  say('   per-class UPPER BOUNDS, computed independently. A real <=60-row selection must satisfy');
  say('   every class simultaneously, so achievable <= these numbers.');
  say('');
  const supply: Record<string, number> = {};
  const add = (cls: string, n: number) => { supply[cls] = (supply[cls] ?? 0) + n; };

  const classified: Classified[] = JSON.parse(fs.readFileSync(path.join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-assembly-2026-08-31', 'opening', 'reserved-classification.json'),
  'utf8'));
  const seed = classified.filter(r => r.eligible);
  const seedForbidden = seed.filter(r => {
    const present = [r.primary!, ...r.secondaries];
    return r.forbiddenFromUnacceptable.filter(f => !present.includes(f)).length > 0;
  });
  add('FORBIDDEN_FAMILY_NEGATIVE_CONTROL', seedForbidden.length);
  add('DETERMINISTIC_HAZARD_PRESENT', seed.length);
  add('MULTI_HAZARD', seed.filter(r => r.secondaries.length > 0).length);
  add('LIFE_CRITICAL_PRESENT', seed.filter(r => r.severityExpectation === 'critical').length);
  add('DETERMINISTIC_MISS_RECALL_OPPORTUNITY', seed.length);
  say(`   gauntlet.seed        OPENED §122   eligible ${seed.length}   forbidden ${seedForbidden.length}`
    + '   gaps 0   interactions 0');

  const popAForbidden = POPULATION_A.filter(r =>
    r.forbiddenDomains.some(d => ACCEPTED_EXPERT_TAXONOMY.includes(toExpertFamily(d) ?? d)));
  const popANoRequired = POPULATION_A.filter(r => r.requiredDomains.length === 0);
  add('FORBIDDEN_FAMILY_NEGATIVE_CONTROL', popAForbidden.length);
  add('CLARIFICATION_NOT_OWED', popANoRequired.length);
  add('NEGATED_OR_SAFE_STATE', popANoRequired.length);
  const popBMulti = POPULATION_B.filter(r => r.required.length >= 2);
  const popBLife = POPULATION_B.filter(r => r.required.some(g => g.lifeCritical));
  const popBInteraction = popBMulti.filter(r => {
    const fams = r.required.flatMap(g => g.domains).map(d => toExpertFamily(d) ?? d)
      .filter(f => ACCEPTED_EXPERT_TAXONOMY.includes(f));
    const kind = recognisedInteraction(fams);
    return kind !== null && (EXPERT_INTERACTION_KINDS as readonly string[]).includes(kind);
  });
  add('MULTI_HAZARD', popBMulti.length);
  add('LIFE_CRITICAL_PRESENT', popBLife.length);
  add('CROSS_HAZARD_INTERACTION', popBInteraction.length);
  add('DETERMINISTIC_HAZARD_PRESENT', POPULATION_B.length);
  say(`   Population A         OPEN         rows ${POPULATION_A.length}   forbidden ${popAForbidden.length}`
    + `   zero-required ${popANoRequired.length}   gaps 0`);
  say(`   Population B         OPEN         rows ${POPULATION_B.length}   multi ${popBMulti.length}`
    + `   life-critical ${popBLife.length}   recognised-interaction ${popBInteraction.length}   gaps 0`);

  const aug = AUGMENTATION_ROWS.map(a => a.row);
  const countFrom = (set: typeof aug, label: string) => {
    const gaps = set.filter(r => r.truth.decisionCriticalGaps.length > 0);
    const inter = set.filter(r => r.truth.recordedInteractions.length > 0);
    const forb = set.filter(r => r.truth.forbiddenHazardFamilies.length > 0);
    add('FORBIDDEN_FAMILY_NEGATIVE_CONTROL', forb.length);
    add('CLARIFICATION_OWED', gaps.length);
    add('CROSS_HAZARD_INTERACTION', inter.length);
    add('CLARIFICATION_NOT_OWED', set.length - gaps.length);
    add('NEGATED_OR_SAFE_STATE', set.filter(r => r.truth.negatedOrSafeStateFamilies.length > 0).length);
    add('LIFE_CRITICAL_PRESENT', set.filter(r => r.truth.lifeCriticalHazardFamilies.length > 0).length);
    add('MULTI_HAZARD', set.filter(r => r.truth.presentHazardFamilies.length >= 2).length);
    add('DETERMINISTIC_HAZARD_PRESENT', set.filter(r => r.truth.presentHazardFamilies.length > 0).length);
    say(`   ${label.padEnd(20)} rows ${String(set.length).padStart(3)}   forbidden ${forb.length}`
      + `   gaps ${gaps.length}   interactions ${inter.length}`);
  };
  countFrom(aug, 'augmentation V2');
  countFrom(semRows, 'semantic aug (§129)');

  // Governed records: measured, not credited by assumption.
  const relPath = path.join(ROOT, 'backend', 'src', 'standards', 'releases', 'definitions',
    'federal-core-2026-08-28.1.json');
  const rel = JSON.parse(fs.readFileSync(relPath, 'utf8'));
  const memberKeys = new Set(Object.keys(rel.members[0] ?? {}));
  const hasText = memberKeys.has('approvedText') || memberKeys.has('payload');
  say('');
  say(`   governed release definition  ${rel.releaseId}   members ${rel.members.length}`);
  say(`   member fields                ${[...memberKeys].join(', ')}`);
  say(`   carries approvedText/title?  ${hasText ? 'YES' : 'NO'}`);
  say('   GovernedStandardView requires { citation, title, approvedText, backingState }. The release');
  say('   definition supplies citation and citationKey only, so it cannot populate one.');
  say('');
  say('   STATED FAIRLY, BECAUSE THIS IS NOT A DEAD END:');
  say('     The record payloads exist. The owner produced a read-only snapshot of all 64 records');
  say('     from federal-core-2026-08-28.1, reconciled in §126 (snapshot a2c5dc32..., manifest');
  say('     680540d9...), and reconcile-governed-snapshot.ts reads approvedText and reviewState from');
  say('     it. That snapshot lives OUTSIDE the repository at the owner\'s choice, is not part of any');
  say('     cohort artifact, and is not within this operation\'s authorization.');
  say('     All 64 are reviewState=mechanically_validated -> UNAPPROVED_RECORD, so if they were');
  say('     attached, GOVERNED_RECORD_SUPPLIED and DISAGREEMENT_OPPORTUNITY would both be satisfied,');
  say('     and REVIEWER_APPROVED_GOVERNED_RECORDS would remain 0 (M07 approved-text axis');
  say('     unexercised -- a limitation already on record).');
  say('   Counted as 0 here because a class is supplied by what a FROZEN COHORT ROW carries, and no');
  say('   cohort artifact carries a governed record. This is a WIRING gap, not an impossibility.');
  add('GOVERNED_RECORD_SUPPLIED', hasText ? PREFERRED_ROWS : 0);
  add('DISAGREEMENT_OPPORTUNITY', hasText ? PREFERRED_ROWS : 0);
  add('NO_GOVERNED_RECORD', PREFERRED_ROWS);

  say('');
  say(`   ${'class'.padEnd(38)} ${'req'.padStart(4)} ${'supply'.padStart(7)}  verdict`);
  const blockers: string[] = [];
  for (const [cls, req] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    const a = supply[cls] ?? 0;
    const ok = a >= req.minimum;
    if (!ok) blockers.push(`${cls} ${a} < ${req.minimum} (short ${req.minimum - a})`);
    say(`   ${cls.padEnd(38)} ${String(req.minimum).padStart(4)} ${String(a).padStart(7)}`
      + `  ${ok ? 'ok' : 'BLOCKED'}`);
  }
  const totalRows = seed.length + POPULATION_A.length + POPULATION_B.length + aug.length
    + semRows.length;
  say('');
  say(`   distinct rows available across all authorized sources : ${totalRows}`);
  say(`   cohort size policy: target ${COHORT_SIZE_POLICY.targetRows}, minimum defensible `
    + `${MINIMUM_DEFENSIBLE_ROWS}, hard ceiling ${COHORT_SIZE_POLICY.hardCeiling}`);
  say('');
  if (blockers.length === 0) {
    say('   No class is short at the UPPER BOUND. That is necessary, not sufficient: a real');
    say('   selection must satisfy every class within one <=60-row set.');
  } else {
    say('   CLASSES STILL SHORT even at the upper bound:');
    for (const b of blockers) say(`     - ${b}`);
  }
  gate('COMPOSITION_SUPPLY_SUFFICIENT',
    'every frozen composition minimum is reachable from authorized sources',
    blockers.length === 0,
    blockers.length === 0 ? 'no class short at the upper bound'
      : `short at the upper bound: ${blockers.join('; ')}. GOVERNED_RECORD_SUPPLIED and `
        + 'DISAGREEMENT_OPPORTUNITY are wiring gaps with an authorized source available; '
        + 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL is a genuine supply shortfall unless gauntlet offsets '
        + '2+3 are opened (+16 capability, §124 label metadata), which is its own authorization.');

  // ================================================================ 6. REMAINING GATE BITS
  say('');
  say('6. REMAINING PRE-SPEND BITS');
  say('');
  const envPath = path.join(ROOT, 'backend', '.env');
  let credentialPresent = false;
  if (fs.existsSync(envPath)) {
    credentialPresent = fs.readFileSync(envPath, 'utf8').split('\n')
      .some(l => l.startsWith('ANTHROPIC_API_KEY=') && l.split('=').slice(1).join('=').trim().length > 20);
  }
  gate('PROVIDER_CREDENTIAL_AVAILABLE', 'provider credential available', credentialPresent,
    'ANTHROPIC_API_KEY present in backend/.env (presence and length only; never read or printed)');
  gate('PROJECTION_ENABLED_IN_EVALUATED_PATH',
    'permanent deterministic -> Expert projection enabled in the evaluated path', true,
    'D-131 / §119: projectDeterministicDispositions is on the permanent path and the harness calls '
    + 'buildExpertAnalysisInputFromAnalysis + runExpertAnalysis, not a copy');
  gate('MODEL_CALLABLE_WITHOUT_SPENDING_COHORT',
    'the exact intended provider/model is callable by the configured adapter', 'AMBIGUOUS',
    'prior hosted probes established transport and adapter callability, but no frozen model is '
    + 'preregistered FOR THIS COHORT, so there is no "exact intended model" to confirm. No hosted '
    + 'call was made by this preflight.');

  say('');
  for (const g of gates) {
    const v = g.value === true ? 'TRUE' : g.value === false ? 'FALSE' : 'AMBIGUOUS';
    say(`   ${v.padEnd(9)} ${g.id}`);
    say(`             ${g.requirement}`);
    say(`             ${g.evidence}`);
  }

  // ================================================================ 7. VERDICT
  const failing = gates.filter(g => g.value !== true);
  say('');
  say('7. PRE-SPEND GATE VERDICT');
  say('');
  say(`   bits evaluated ${gates.length}   TRUE ${gates.length - failing.length}   `
    + `NOT TRUE ${failing.length}`);
  say('');
  if (failing.length > 0) {
    say('   PRE_SPEND_GATE = FAILED. THE COHORT IS NOT SPENT.');
    for (const f of failing) say(`     ${f.value === false ? 'FALSE    ' : 'AMBIGUOUS'} ${f.id}`);
  } else {
    say('   PRE_SPEND_GATE = PASSED.');
  }

  say('');
  say(`PROVIDER_INVOCATION_COUNT = ${providerInvocationCount()}   FORMAL_COHORT_SPENT = FALSE`);
  say('RESERVED_MATERIAL_OPENED = FALSE   PRODUCTION_ACCESS = FALSE   DATABASE_ACCESS = FALSE');
  say('');
  say('ARTIFACT HASHES');
  for (const p of [
    'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts',
    'backend/src/hazlenz/expert-hazlenz/expert-measure-scorers.ts',
    'backend/src/hazlenz/expert-hazlenz/expert-measurement-contract.ts',
    'backend/src/hazlenz/expert-hazlenz/expert-evaluation-plan.ts',
    'backend/src/hazlenz/expert-hazlenz/expert-cohort-composition.ts',
    'backend/src/hazlenz/expert-hazlenz/fixtures/semantic-augmentation-v1.ts',
    'backend/scripts/lib/expert-cohort-harness.ts',
    'backend/scripts/preflight-formal-cohort-execution.ts',
  ]) say(`   ${fileSha(path.join(ROOT, p))}  ${p}`);

  const evidenceDir = path.join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-execution-2026-09-01', 'preflight');
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, 'PREFLIGHT.txt'), out.join('\n') + '\n');
  fs.writeFileSync(path.join(evidenceDir, 'PRE-SPEND-GATE.json'), JSON.stringify({
    evaluatedAt: 'preflight, before any provider call',
    formalCohortSpent: false,
    providerInvocationCount: providerInvocationCount(),
    gates,
    verdict: failing.length === 0 ? 'PASSED' : 'FAILED',
    notTrue: failing.map(f => f.id),
  }, null, 2) + '\n');
  console.log(`\npreflight written to verification/expert-hazlenz-formal-cohort-execution-2026-09-01/preflight/`);

  if (failing.length > 0) process.exit(2);
}

main();
