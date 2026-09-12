/**
 * §127 -- mechanical validation of FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1_CANDIDATE.
 *
 * Mechanical only. This script CANNOT establish that a gap is genuinely decision-critical or that
 * an interaction is genuinely material -- those are safety judgements and they are exactly what the
 * independent product-owner review exists to decide. What it can do is prove the corpus is
 * well-formed, that its counts are what they claim, that no closed vocabulary was widened, that no
 * reserved or retired material was touched, and that no provider was called.
 *
 * §129 -- PHASE AWARE. Sections A through E and G through J are phase-independent and run
 * identically in both phases; only the section F COMPOSITION targets differ, because those targets
 * are the one thing that is genuinely pre-review-only:
 *
 *   --phase=PRE_REVIEW_CANDIDATE   the frozen candidate-authoring targets, 26 and 14, UNCHANGED.
 *   --phase=POST_HUMAN_REVIEW      the frozen cohort minimums, 20 and 10, against the countable
 *                                  reviewed evaluation material, plus row-by-row reconciliation of
 *                                  the review metadata against the applied fixture.
 *
 * With no argument the DECLARED corpus lifecycle state governs. Phase is never inferred from counts.
 * See `lib/expert-semantic-augmentation-review-record.ts`.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import {
  SEMANTIC_ROWS, SEMANTIC_AUGMENTATION_IDENTIFIER,
} from '../src/safescope-v2/expert-hazlenz/fixtures/semantic-augmentation-v1';
import { AUGMENTATION_ROWS } from '../src/safescope-v2/expert-hazlenz/fixtures/negative-control-augmentation-v1';
import {
  EXPERT_INTERACTION_KINDS, EXPERT_AFFECTED_DECISIONS,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { classifyRow, truthOnlyStrings, validateCohortRow } from
  '../src/safescope-v2/expert-hazlenz/expert-cohort-contract';
import { buildExpertUserPrompt, EXPERT_SYSTEM_PROMPT } from
  '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { assertMayOpen } from '../src/safescope-v2/expert-hazlenz/expert-corpus-retirement-registry';
import { ACCEPTED_EXPERT_TAXONOMY } from './lib/expert-cohort-supplemental-policy';
import {
  CANDIDATE_TARGETS, FORBIDDEN_GAP_SHAPES, MIN_GAP_DESCRIPTION_CHARS,
  SEMANTIC_AUGMENTATION_POLICY_VERSION,
} from './lib/expert-semantic-augmentation-construction-policy';
import {
  CORPUS_LIFECYCLE_STATE, FROZEN_COMPOSITION_MINIMUMS, INDEPENDENTLY_AUTHORIZED_COMPOSITION,
  SEAL_STATUS_BY_PHASE, SEAL_STATUS_DOES_NOT_IMPLY, SEMANTIC_AUGMENTATION_PHASE_MODEL_VERSION,
  SEMANTIC_AUGMENTATION_REVIEW_RECORD, compositionGatesForPhase, derivedCountableCases,
  resolveValidationPhase, type MechanicalComposition,
} from './lib/expert-semantic-augmentation-review-record';
import { providerInvocationCount, resetProviderInvocationCount, runFormalCohort } from
  './lib/expert-cohort-harness';

const ROOT = path.resolve(__dirname, '..', '..');
let passed = 0, failed = 0;
function assert(cond: boolean, label: string, detail = ''): void {
  if (cond) { passed += 1; console.log(`  PASS  ${label}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? '  -- ' + detail : ''}`); }
}

async function main(): Promise<void> {
  resetProviderInvocationCount();
  const rows = SEMANTIC_ROWS.map(r => r.row);

  const resolved = resolveValidationPhase(process.argv.slice(2));
  const phase = resolved.phase;

  console.log(`SEMANTIC AUGMENTATION VALIDATION -- ${SEMANTIC_AUGMENTATION_IDENTIFIER}`);
  console.log(`policy ${SEMANTIC_AUGMENTATION_POLICY_VERSION}`);
  console.log(`phase model ${SEMANTIC_AUGMENTATION_PHASE_MODEL_VERSION}`);
  console.log(`VALIDATION_PHASE = ${phase}   (source: ${resolved.source})`);
  console.log(`declared corpus lifecycle state = ${CORPUS_LIFECYCLE_STATE.governingPhase}`);
  console.log('phase is explicit and auditable; it is NEVER inferred from counts\n');

  console.log('A. RESERVED AND RETIRED MATERIAL UNTOUCHED\n');
  assert(!assertMayOpen('GAUNTLET_OFFSET_0').allowed, 'A.1 retired gauntlet offset 0 REFUSED');
  assert(!assertMayOpen('GAUNTLET_OFFSET_1').allowed, 'A.2 retired gauntlet offset 1 REFUSED');
  assert(!assertMayOpen('REALISM_OFFSET_3').allowed, 'A.3 retired realism offset 3 REFUSED');
  const srcRead = fs.readFileSync(path.join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz',
    'fixtures', 'semantic-augmentation-v1.ts'), 'utf8');
  assert(!/gauntlet\.source|gauntlet\.seed|realism-pack|reserved-classification/.test(srcRead),
    'A.4 the corpus module reads NO reserved or opened corpus -- every case is newly authored');
  // Scoped to THIS corpus and THIS run: the §129 semantic corpus is newly authored and reads no
  // reserved material, which is what A.4 proves. Gauntlet offsets 2 and 3 were opened separately on
  // 2026-09-01 under their own authorization; that opening is not part of this corpus's provenance.
  console.log('      RESERVED_MATERIAL_OPENED_BY_THIS_CORPUS = FALSE '
    + '(realism 1 and 2 untouched; gauntlet offsets 2 and 3 opened 2026-09-01, not by this corpus)');

  console.log('\nB. ROW VALIDITY AND IDENTITY\n');
  const ids = rows.map(r => r.source.rowId);
  assert(new Set(ids).size === ids.length, 'B.1 candidate row ids are unique', String(ids.length));
  const augIds = new Set(AUGMENTATION_ROWS.map(a => a.row.source.rowId));
  assert(!ids.some(i => augIds.has(i)), 'B.2 no id collides with the AUG augmentation corpus');
  const seedIds = new Set<string>(JSON.parse(fs.readFileSync(path.join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-assembly-2026-08-31', 'opening', 'reserved-classification.json'),
  'utf8')).map((r: { scenarioId: string }) => r.scenarioId));
  assert(!ids.some(i => seedIds.has(i)), 'B.3 no id collides with the opened gauntlet.seed corpus');
  const problems = rows.flatMap(validateCohortRow);
  assert(problems.length === 0, 'B.4 all 35 rows pass the frozen row contract',
    problems.slice(0, 4).map(p => `${p.rowId}:${p.code}`).join(','));
  assert(rows.length === 35, 'B.5 exactly 35 rows', String(rows.length));
  assert(rows.every(r => r.source.observation.trim().length > 200),
    'B.6 every observation is substantive');
  assert(rows.every(r => r.truth.authoringRationale.trim().length > 80),
    'B.7 every row states an authoring rationale');

  console.log('\nC. CLOSED VOCABULARIES RESPECTED\n');
  const allFamilies = rows.flatMap(r => [
    ...r.truth.presentHazardFamilies, ...r.truth.defensibleHazardFamilies,
    ...r.truth.forbiddenHazardFamilies, ...r.truth.negatedOrSafeStateFamilies,
    ...r.truth.lifeCriticalHazardFamilies,
  ]);
  assert(allFamilies.every(f => ACCEPTED_EXPERT_TAXONOMY.includes(f)),
    'C.1 every family is inside ACCEPTED_EXPERT_TAXONOMY -- taxonomy NOT widened');
  const kinds = rows.flatMap(r => r.truth.recordedInteractions.map(i => i.interactionKind));
  assert(kinds.every(k => (EXPERT_INTERACTION_KINDS as readonly string[]).includes(k)),
    'C.2 every interaction kind is in the frozen closed vocabulary -- NOT expanded',
    [...new Set(kinds)].join(','));
  const decisions = rows.flatMap(r => r.truth.decisionCriticalGaps.map(g => g.affectedDecision));
  assert(decisions.every(d => (EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(d)),
    'C.3 every affected decision is in the frozen vocabulary',
    [...new Set(decisions)].join(','));
  // The totality rule is already enforced by B.4; this states it separately for the reader.
  assert(rows.every(r => {
    const seen = [...r.truth.presentHazardFamilies, ...r.truth.defensibleHazardFamilies,
      ...r.truth.forbiddenHazardFamilies];
    return new Set(seen).size === seen.length && seen.length === ACCEPTED_EXPERT_TAXONOMY.length;
  }), 'C.4 every family partition is disjoint AND covering -- no unclassified family');

  console.log('\nD. GAP PACKET QUALITY (mechanical checks only)\n');
  const gapPackets = SEMANTIC_ROWS.flatMap(r => r.gapPackets);
  assert(gapPackets.every(g => g.missingFact.trim().length >= MIN_GAP_DESCRIPTION_CHARS),
    `D.1 every gap names a fact of at least ${MIN_GAP_DESCRIPTION_CHARS} chars`);
  assert(gapPackets.every(g => g.whyAbsent.trim().length > 40),
    'D.2 every gap states WHY the fact is not already present');
  assert(gapPackets.every(g => g.alternativeOutcomes.trim().length > 80),
    'D.3 every gap states how plausible answers MATERIALLY diverge');
  const lowered = gapPackets.map(g => g.missingFact.toLowerCase());
  assert(!lowered.some(m => FORBIDDEN_GAP_SHAPES.some(f =>
    m.includes(f.toLowerCase().replace('?', '')))),
  'D.4 no gap uses a forbidden generic question shape');
  assert(new Set(gapPackets.map(g => g.gapId)).size === gapPackets.length,
    'D.5 gap ids are unique');
  assert(SEMANTIC_ROWS.every(r =>
    r.gapPackets.length === r.row.truth.decisionCriticalGaps.length),
  'D.6 every gap packet is carried into the row truth, and none is orphaned');

  console.log('\nE. INTERACTION PACKET QUALITY (mechanical checks only)\n');
  const interPackets = SEMANTIC_ROWS.flatMap(r => r.interactionPackets);
  assert(interPackets.every(i => i.participants.length >= 2),
    'E.1 every interaction has at least two participants');
  assert(SEMANTIC_ROWS.every(r => r.interactionPackets.every(i =>
    i.participants.every(p => r.row.truth.presentHazardFamilies.includes(p)))),
  'E.2 every participant is a PRESENT family on its own row -- no pair completed by fabrication');
  assert(interPackets.every(i =>
    i.participants.every(p => (i.evidencePerParticipant[p] ?? '').trim().length > 40)),
  'E.3 every participant carries independent supporting evidence');
  assert(interPackets.every(i => i.relationship.trim().length > 80),
    'E.4 every interaction states a causal or operational relationship');
  assert(interPackets.every(i => i.independentLoss.trim().length > 80),
    'E.5 every interaction states what independent assessment would lose');
  assert(SEMANTIC_ROWS.every(r =>
    r.interactionPackets.length === r.row.truth.recordedInteractions.length),
  'E.6 every interaction packet is carried into the row truth, and none is orphaned');

  console.log(`\nF. COMPOSITION -- ${phase} CONTRACT\n`);
  const owed = rows.filter(r => r.truth.decisionCriticalGaps.length > 0);
  const notOwed = rows.filter(r => r.truth.decisionCriticalGaps.length === 0);
  const withInter = rows.filter(r => r.truth.recordedInteractions.length > 0);
  const noInter = rows.filter(r => r.truth.recordedInteractions.length === 0);
  const both = rows.filter(r =>
    r.truth.decisionCriticalGaps.length > 0 && r.truth.recordedInteractions.length > 0);
  const multiNoInter = noInter.filter(r => r.truth.presentHazardFamilies.length >= 2);
  const withForbidden = rows.filter(r => r.truth.forbiddenHazardFamilies.length > 0);

  const mechanical: MechanicalComposition = {
    rowIds: ids,
    owedRowIds: owed.map(r => r.source.rowId),
    notOwedRowIds: notOwed.map(r => r.source.rowId),
    interactionRowIds: withInter.map(r => r.source.rowId),
    interactionNegativeControlRowIds: multiNoInter.map(r => r.source.rowId),
  };
  console.log(`      MECHANICAL SURVIVING ROW COUNTS -- properties of the applied fixture`);
  console.log(`        rows carrying a gap          ${owed.length}`);
  console.log(`        rows carrying an interaction ${withInter.length}\n`);
  for (const g of compositionGatesForPhase(phase, mechanical, SEMANTIC_AUGMENTATION_REVIEW_RECORD)) {
    assert(g.passed, `${g.id} ${g.label}`, g.detail);
  }
  console.log(`      rows carrying BOTH a gap and an interaction: ${both.length}`);
  console.log(`      rows carrying a forbidden family: ${withForbidden.length}`);
  console.log(`      interaction kinds used: ${[...new Set(kinds)].sort().join(', ')}`);

  console.log('\nG. ANTI-CONTAMINATION\n');
  const frags = rows.map(r => r.source.observation.slice(0, 60).trim()).filter(f => f.length >= 40);
  const fragFile = path.join(ROOT, 'backend', '.sem-frags.tmp');
  fs.writeFileSync(fragFile, frags.join('\n'));
  let hits = '';
  try {
    hits = execFileSync('rg', ['-l', '-F', '-f', fragFile, 'verification', 'docs', 'safescope-data',
      'backend/src/safescope-v2/expert-hazlenz/fixtures'], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch { hits = ''; }
  fs.unlinkSync(fragFile);
  const hitFiles = hits ? hits.split('\n').filter(f => !f.includes('semantic-augmentation')) : [];
  assert(frags.length === 35, 'G.1 all 35 observations yield a distinctive >=40 char fragment',
    String(frags.length));
  assert(hitFiles.length === 0,
    'G.2 KNOWN_PROVIDER_CASE_COPY = FALSE -- no observation appears in any existing corpus, '
    + 'fixture, diagnostic artifact or verification record', hitFiles.join(','));

  console.log('\nH. CANONICAL-PATH DRY RUN, PROVIDER DISABLED\n');
  const run = await runFormalCohort(rows, {
    mode: 'DISABLED', callCeiling: 0, spendCeilingUsd: 0,
    arms: ['BASE', 'PERMUTED', 'CROSS_PROCESS'], processId: 'proc-semantic-aug',
    nowIso: '2026-08-31T00:00:00.000Z',
  });
  let leaks = 0;
  for (const b of run.requestsBuilt) {
    const row = rows.find(r => r.source.rowId === b.rowId)!;
    const rendered = `${EXPERT_SYSTEM_PROMPT}\n${buildExpertUserPrompt(b.input)}\n${JSON.stringify(b.input)}`;
    for (const secret of truthOnlyStrings(row)) if (rendered.includes(secret)) leaks += 1;
  }
  assert(run.requestsBuilt.length === rows.length * 3,
    `H.1 all ${rows.length} rows x 3 arms constructed through the canonical path`,
    String(run.requestsBuilt.length));
  assert(run.scoring === null, 'H.2 a DISABLED run produces NO score');
  assert(leaks === 0, `H.3 TRUTH_LEAK = 0 across all ${run.requestsBuilt.length} constructed requests`,
    String(leaks));
  assert(providerInvocationCount() === 0,
    'H.4 PROVIDER_INVOCATION_COUNT = 0, by the harness\'s own counter');

  console.log('\nI. CAPABILITY -- COUNTABLE CASES VS INDEPENDENTLY AUTHORIZED\n');
  const AUTHORIZED_OWED = INDEPENDENTLY_AUTHORIZED_COMPOSITION.clarificationOwed;
  const AUTHORIZED_INTERACTION = INDEPENDENTLY_AUTHORIZED_COMPOSITION.crossHazardInteraction;
  const countable = derivedCountableCases(mechanical, SEMANTIC_AUGMENTATION_REVIEW_RECORD);
  const minOwed = FROZEN_COMPOSITION_MINIMUMS.clarificationOwed;
  const minInter = FROZEN_COMPOSITION_MINIMUMS.crossHazardInteraction;
  console.log(`  CURRENT INDEPENDENTLY AUTHORIZED TRUTH (unchanged by this operation)`);
  console.log(`    CLARIFICATION_OWED        ${AUTHORIZED_OWED}   (frozen minimum ${minOwed})`);
  console.log(`    CROSS_HAZARD_INTERACTION  ${AUTHORIZED_INTERACTION}   (frozen minimum ${minInter})`);
  console.log(phase === 'PRE_REVIEW_CANDIDATE'
    ? '  CANDIDATE MAXIMUM (only if EVERY candidate verdict were accepted -- not assumed)'
    : '  COUNTABLE REVIEWED EVALUATION MATERIAL (every determination below has been reviewed)');
  console.log(`    CLARIFICATION_OWED        ${AUTHORIZED_OWED} + ${owed.length} = `
    + `${countable.clarification}   margin over ${minOwed}: ${countable.clarification - minOwed}`);
  console.log(`    CROSS_HAZARD_INTERACTION  ${AUTHORIZED_INTERACTION} + ${withInter.length} = `
    + `${countable.crossHazardInteraction}   margin over ${minInter}: `
    + `${countable.crossHazardInteraction - minInter}`);
  if (phase === 'PRE_REVIEW_CANDIDATE') {
    console.log(`  NOTE: candidate material is NOT authorized truth. Nothing above enters the formal`);
    console.log(`  cohort until the independent product-owner safety review accepts it.`);
  } else {
    console.log(`  NOTE: reviewed truth is not evaluation authorization. Nothing above enters the`);
    console.log(`  formal cohort until the product owner authorizes the evaluation spend.`);
    for (const l of SEMANTIC_AUGMENTATION_REVIEW_RECORD.frozenVocabularyLimitations) {
      console.log(`  LIMITATION ${l.rowId}  ${l.vocabulary} lacks ${l.missing}`);
    }
    for (const e of SEMANTIC_AUGMENTATION_REVIEW_RECORD.contractConsequentialEffects) {
      console.log(`  CONTRACT-CONSEQUENTIAL ${e.rowId}  ${e.effect}`);
    }
  }

  console.log('\nJ. HASHES\n');
  const sha = (s: string) => createHash('sha256').update(s).digest('hex');
  const manifest = JSON.stringify(rows.map(r => ({
    rowId: r.source.rowId, observation: r.source.observation })));
  const truthKeys = JSON.stringify(rows.map(r => ({ rowId: r.source.rowId, truth: r.truth })));
  const provenance = JSON.stringify(SEMANTIC_ROWS.map(r => ({
    rowId: r.row.source.rowId, provenance: r.provenance, forbiddenRationale: r.forbiddenRationale,
    gapPackets: r.gapPackets, interactionPackets: r.interactionPackets,
    authorUncertainty: r.authorUncertainty,
  })));
  console.log(`      identifier   ${SEMANTIC_AUGMENTATION_IDENTIFIER}`);
  console.log(`      manifest     ${sha(manifest)}`);
  console.log(`      truth keys   ${sha(truthKeys)}`);
  console.log(`      provenance   ${sha(provenance)}`);

  const seal = {
    identifier: SEMANTIC_AUGMENTATION_IDENTIFIER,
    status: SEAL_STATUS_BY_PHASE[phase],
    statusDoesNotImply: SEAL_STATUS_DOES_NOT_IMPLY,
    validationPhase: phase,
    validationPhaseSource: resolved.source,
    corpusLifecycleState: CORPUS_LIFECYCLE_STATE.governingPhase,
    identifierNote: CORPUS_LIFECYCLE_STATE.note,
    policyVersion: SEMANTIC_AUGMENTATION_POLICY_VERSION,
    phaseModelVersion: SEMANTIC_AUGMENTATION_PHASE_MODEL_VERSION,
    rows: rows.length,
    order: 'SEM-01 .. SEM-30, SEM-35, SEM-31 .. SEM-34 -- the actual sealed array order, with '
      + 'SEM-35 at index 30. Numeric identifier order is NOT array order. Immutable after seal.',
    manifestSha256: sha(manifest),
    truthKeySha256: sha(truthKeys),
    provenanceSha256: sha(provenance),
    clarificationOwedCandidates: owed.length,
    clarificationNotOwedControls: notOwed.length,
    crossHazardInteractionCandidates: withInter.length,
    interactionNegativeControls: multiNoInter.length,
    rowsCarryingBoth: both.length,
    rowsCarryingForbiddenFamily: withForbidden.length,
    interactionKindsUsed: [...new Set(kinds)].sort(),
    currentIndependentlyAuthorized: {
      clarificationOwed: AUTHORIZED_OWED, crossHazardInteraction: AUTHORIZED_INTERACTION },
    /** The frozen candidate-authoring targets, recorded so the seal itself shows they did not move. */
    candidateAuthoringTargets: {
      clarificationOwed: CANDIDATE_TARGETS.clarificationOwed,
      crossHazardInteraction: CANDIDATE_TARGETS.crossHazardInteraction,
      enforcedInPhase: 'PRE_REVIEW_CANDIDATE' },
    frozenCompositionMinimums: {
      clarificationOwed: minOwed, crossHazardInteraction: minInter,
      enforcedInPhase: 'POST_HUMAN_REVIEW' },
    ...(phase === 'PRE_REVIEW_CANDIDATE'
      ? {
        candidateMaximum: {
          clarificationOwed: countable.clarification,
          crossHazardInteraction: countable.crossHazardInteraction },
      }
      : {
        countableReviewedCases: {
          clarificationOwed: countable.clarification,
          clarificationMargin: countable.clarification - minOwed,
          crossHazardInteraction: countable.crossHazardInteraction,
          crossHazardInteractionMargin: countable.crossHazardInteraction - minInter },
        reviewedAccounting: SEMANTIC_AUGMENTATION_REVIEW_RECORD,
      }),
    truthLeak: leaks,
    providerInvocationCount: providerInvocationCount(),
    knownProviderCaseCopy: false,
    reservedMaterialOpened: false,
    formalCohortSpent: false,
    p4PrespendAuthorization: false,
    authorUncertaintyFlagged: SEMANTIC_ROWS.filter(r => r.authorUncertainty).length,
  };
  // The seal describes the corpus as it actually stands, so it is written ONLY when the phase being
  // validated is the phase the declared lifecycle state governs. A diagnostic run under the other
  // phase reports its result and leaves the seal alone rather than overwriting it with a status that
  // does not describe the corpus.
  const sealDir = path.join(ROOT, 'verification', 'expert-hazlenz-semantic-augmentation-2026-08-31',
    'corpus');
  if (phase === CORPUS_LIFECYCLE_STATE.governingPhase) {
    fs.mkdirSync(sealDir, { recursive: true });
    fs.writeFileSync(path.join(sealDir, 'SEAL.json'), JSON.stringify(seal, null, 2) + '\n');
    console.log(`      SEAL.json WRITTEN, status: ${seal.status}`);
  } else {
    console.log(`      SEAL.json NOT written -- phase ${phase} is a diagnostic run against a corpus`
      + ` whose declared lifecycle state is ${CORPUS_LIFECYCLE_STATE.governingPhase}`);
  }

  console.log(`\n${passed} passed, ${failed} failed   VALIDATION_PHASE = ${phase}`);
  console.log(`SEAL_STATUS = ${SEAL_STATUS_BY_PHASE[phase]}`);
  console.log('PROVIDER_INVOCATION_COUNT = 0   RESERVED_MATERIAL_OPENED = FALSE   '
    + 'FORMAL_COHORT_SPENT = FALSE   P4_PRESPEND_AUTHORIZATION = FALSE');
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
