/**
 * §145 -- PROSPECTIVE INSTRUMENT-CORRECTED RE-DERIVATION of the v9 hosted confirmation probe.
 *
 * ==================== WHAT THIS IS, AND WHAT IT EXPLICITLY IS NOT ====================
 *
 * ZERO provider calls. It reads ONLY the persisted `RUN-RECORDS.jsonl` of
 * `verification/expert-hazlenz-v9-linkage-confirmation-2026-09-03/` and re-scores it under the
 * output-relative construct.
 *
 * **IT DOES NOT REPLACE THE HISTORICAL RESULT.** That probe's recorded terminal remains
 * `EXPERT_HAZLENZ_V9_LINKAGE_CONFIRMATION_FAILED — LINKAGE_SEMANTICS_OR_MODEL_BEHAVIOR_REVIEW_REQUIRED`
 * with `LINKAGE_V9_HOSTED_CONFIRMATION = FAIL_FORBIDDEN_LINKAGE`, and not one byte of its artifacts
 * is written. Everything below is labelled `PROSPECTIVE_INSTRUMENT_CORRECTED_REDERIVATION` and is a
 * statement about the INSTRUMENT, not a re-run of the probe.
 *
 * ==================== THE CORRECTION ====================
 *
 * The historical FORBIDDEN denominator was authored from a PRESUMED candidate set. Ambiguity is a
 * property of the candidate set, and the candidate set is model-generated, so a fixture cannot
 * author it. Here a FORBIDDEN opportunity exists only when the intended scenario was actually
 * REALIZED by the candidates the model emitted, and linkage validity is judged against that accepted
 * set. Candidate quality is reported on a separate axis and never folded into a linkage count.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import {
  CONFIRMATION_PROBE_FIXTURES, confirmationFixtureByRowId,
} from '../src/safescope-v2/expert-hazlenz/fixtures/linkage-confirmation-probe-v3';
import {
  evaluateScenarioIntent, classifyCandidateQuality,
  type ScenarioIntent, type ScenarioIntentResult,
} from './lib/expert-probe-measures';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'verification', 'expert-hazlenz-v9-linkage-confirmation-2026-09-03');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-linkage-instrument-closure-2026-09-03');

/**
 * The scenario intent each v3 row was BUILT to challenge, recorded here rather than back-edited into
 * the frozen v3 manifest — that manifest is the instrument the spent probe ran against and its hash
 * is in the probe's pre-spend identity. `intentPresumedFamilies` records the candidate-set SHAPE the
 * fixture author presumed, which is exactly the presumption the correction exists to test.
 */
const SCENARIO_INTENT: Record<string, { intent: ScenarioIntent; presumed?: string[] }> = {
  'CL-R1': { intent: 'REQUIRED_LINKAGE_CHALLENGE' },
  'CL-R2': { intent: 'REQUIRED_LINKAGE_CHALLENGE' },
  'CL-R3': { intent: 'REQUIRED_LINKAGE_CHALLENGE' },
  'CL-F1': { intent: 'AMBIGUOUS_CANDIDATE_CHALLENGE', presumed: ['machine_guarding'] },
  'CL-F2': { intent: 'DIFFERENT_HAZARD_CHALLENGE' },
  'CL-F3': { intent: 'GENERIC_FOLLOWUP_CHALLENGE' },
  'CL-N1': { intent: 'NO_LINKAGE_CLAIM' },
  'CL-T1': { intent: 'REQUIRED_LINKAGE_CHALLENGE' },   // authored ALLOWED; omission is legal
  'CL-T2': { intent: 'REQUIRED_LINKAGE_CHALLENGE' },
};

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');

interface Rec {
  row: { source: { rowId: string }; truth: {
    presentHazardFamilies: string[]; defensibleHazardFamilies: string[];
    forbiddenHazardFamilies: string[] } };
  deterministicFamiliesEmitted: string[];
  calls: Array<{
    layerStatus: string; issues: Array<{ code: string }>;
    analysis: null | {
      expertHazardCandidates: Array<{ candidateKey: string; hazardFamily: string;
        assertedConditionState: string; confidence: string; evidence: unknown[] }>;
      decisionCriticalClarifications: Array<{ clarificationId: string; question: string;
        affectedDecision: string; relatesToCandidateKey: string | null }>;
    };
  }>;
}

const raw = readFileSync(join(SRC, 'RUN-RECORDS.jsonl'), 'utf8');
const records: Rec[] = raw.trim().split('\n').map(l => JSON.parse(l) as Rec);

console.log('§145 PROSPECTIVE INSTRUMENT-CORRECTED RE-DERIVATION — ZERO provider calls, $0.00');
console.log('='.repeat(100));
console.log(`source: ${SRC.replace(ROOT + '/', '')}/RUN-RECORDS.jsonl  sha256 ${sha(raw)}`);
console.log('THE HISTORICAL RESULT IS NOT REPLACED. FAIL_FORBIDDEN_LINKAGE stands as recorded.\n');

const intents: ScenarioIntentResult[] = [];
const perRow: Array<Record<string, unknown>> = [];
const candidateAnomalies: Array<Record<string, unknown>> = [];

let REQ_OPP = 0, REQ_POP = 0, REQ_VALID = 0;
let ALW_OPP = 0, ALW_VALID = 0;
let FORB_INTENTS = 0, FORB_REALIZED = 0, FORB_OPP = 0, FORB_ACCEPTED = 0;
let INTENT_NOT_REALIZED = 0, INVALID_ACCEPTED = 0, NO_OPP = 0;

for (const r of records) {
  const rowId = r.row.source.rowId;
  const fixture = confirmationFixtureByRowId(rowId)!;
  const call = r.calls[0];
  const a = call.analysis;
  const accepted = (a?.expertHazardCandidates ?? [])
    .map(c => ({ candidateKey: c.candidateKey, hazardFamily: c.hazardFamily }));
  const clars = (a?.decisionCriticalClarifications ?? [])
    .map(q => ({ clarificationId: q.clarificationId, relatesToCandidateKey: q.relatesToCandidateKey }));
  const spec = SCENARIO_INTENT[rowId];

  const intentResult = evaluateScenarioIntent({
    rowId, intent: spec.intent, intentPresumedFamilies: spec.presumed,
    acceptedCandidates: accepted, emittedClarifications: clars,
  });
  intents.push(intentResult);

  const keys = new Set(accepted.map(c => c.candidateKey));
  const links = clars.map(q => q.relatesToCandidateKey)
    .filter((k): k is string => typeof k === 'string' && k.length > 0);
  const validLinks = links.filter(k => keys.has(k));
  const invalidLinks = links.length - validLinks.length;
  INVALID_ACCEPTED += invalidLinks;

  const isForbiddenIntent = spec.intent === 'AMBIGUOUS_CANDIDATE_CHALLENGE'
    || spec.intent === 'DIFFERENT_HAZARD_CHALLENGE'
    || spec.intent === 'GENERIC_FOLLOWUP_CHALLENGE';
  if (isForbiddenIntent) {
    FORB_INTENTS += 1;
    if (intentResult.realized) { FORB_REALIZED += 1; FORB_OPP += 1; FORB_ACCEPTED += validLinks.length; }
    else INTENT_NOT_REALIZED += 1;
  }
  if (clars.length === 0) NO_OPP += 1;

  if (fixture.linkageTruth === 'REQUIRED' && clars.length > 0) {
    REQ_OPP += 1;
    if (links.length > 0) REQ_POP += 1;
    if (validLinks.length > 0) REQ_VALID += 1;
  }
  if (fixture.linkageTruth === 'ALLOWED' && clars.length > 0) {
    ALW_OPP += 1;
    if (validLinks.length > 0) ALW_VALID += 1;
  }

  // CANDIDATE-QUALITY AXIS — reported separately, never folded into a linkage count.
  for (const c of a?.expertHazardCandidates ?? []) {
    const q = classifyCandidateQuality(c.hazardFamily, r.row.truth);
    if (q.quality !== 'SUPPORTED_ADDITIVE_CANDIDATE') {
      candidateAnomalies.push({ rowId, candidateKey: c.candidateKey, hazardFamily: c.hazardFamily,
        assertedConditionState: c.assertedConditionState, boundQuotes: c.evidence.length,
        quality: q.quality, reason: q.reason });
    }
  }

  perRow.push({
    rowId, authoredLinkageTruth: fixture.linkageTruth, scenarioIntent: spec.intent,
    SCENARIO_INTENT_REALIZED: intentResult.realized, intentReason: intentResult.reason,
    acceptedCandidates: accepted.map(c => `${c.candidateKey}:${c.hazardFamily}`),
    clarificationsEmitted: clars.length,
    emittedLinks: links, validLinks: validLinks.length, invalidLinks,
    countsInForbiddenDenominator: intentResult.countsInForbiddenDenominator,
  });

  console.log(`${rowId.padEnd(6)} intent=${spec.intent.padEnd(30)} realized=${String(intentResult.realized).padEnd(5)}`
    + ` clar=${clars.length} link=${links.length} valid=${validLinks.length}`);
  console.log(`        ${intentResult.reason}`);
}

const rederivation = {
  label: 'PROSPECTIVE_INSTRUMENT_CORRECTED_REDERIVATION',
  isReplacementOfHistoricalResult: false,
  historicalResultUnchanged: {
    LINKAGE_V9_HOSTED_CONFIRMATION: 'FAIL_FORBIDDEN_LINKAGE',
    terminal: 'EXPERT_HAZLENZ_V9_LINKAGE_CONFIRMATION_FAILED — '
      + 'LINKAGE_SEMANTICS_OR_MODEL_BEHAVIOR_REVIEW_REQUIRED',
  },
  sourceRunRecordsSha256: sha(raw),
  providerCalls: 0, costUsd: 0,
  metrics: {
    REQUIRED_LINKAGE_OPPORTUNITIES: REQ_OPP,
    REQUIRED_LINKAGE_POPULATED: REQ_POP,
    REQUIRED_LINKAGE_VALID: REQ_VALID,
    ALLOWED_LINKAGE_OPPORTUNITIES: ALW_OPP,
    ALLOWED_LINKAGE_VALID: ALW_VALID,
    FORBIDDEN_SCENARIO_INTENTS: FORB_INTENTS,
    FORBIDDEN_SCENARIO_INTENTS_REALIZED: FORB_REALIZED,
    FORBIDDEN_LINKAGE_OPPORTUNITIES: FORB_OPP,
    FORBIDDEN_LINKAGE_ACCEPTED: FORB_ACCEPTED,
    SCENARIO_INTENT_NOT_REALIZED: INTENT_NOT_REALIZED,
    INVALID_LINKAGE_ACCEPTED: INVALID_ACCEPTED,
    NO_LINKAGE_OPPORTUNITY: NO_OPP,
  },
  scenarioIntents: intents,
  perRow,
  candidateDecompositionAnomalies: candidateAnomalies,
  note: 'Candidate-quality anomalies are reported on their own axis. A valid link to a non-supported '
    + 'candidate is LINKAGE_VALID = TRUE and a CANDIDATE_PRECISION question — never a linkage defect.',
};

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'REDERIVATION.json'), JSON.stringify(rederivation, null, 2));

console.log('\n' + '='.repeat(100));
console.log('PROSPECTIVE_INSTRUMENT_CORRECTED_REDERIVATION');
for (const [k, v] of Object.entries(rederivation.metrics)) console.log(`  ${k.padEnd(38)} ${v}`);
console.log(`\n  candidate-decomposition anomalies (SEPARATE AXIS): ${candidateAnomalies.length}`);
for (const c of candidateAnomalies) console.log(`    ${c.rowId} ${c.candidateKey} -> ${c.quality}`);
console.log(`\n  artifacts -> ${OUT.replace(ROOT + '/', '')}/REDERIVATION.json`);
console.log('  HISTORICAL RESULT UNCHANGED: FAIL_FORBIDDEN_LINKAGE stands as recorded.');
