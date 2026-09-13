/**
 * §153 EXPERT HAZLENZ — HARDENED v9 / v13 REPLICATE 2. RUN-TO-RUN VARIANCE CHARACTERIZATION.
 *
 * The SAME sixteen v9 rows, the SAME frozen v13 prompt, the SAME provider configuration, run a
 * second time. **Nothing about Expert's semantics is modified, proposed or repaired.** v14 does not
 * exist and this operation does not reopen it.
 *
 *      THE PROGRAMME HAS NEVER MEASURED RUN-TO-RUN VARIANCE ON ANYTHING.
 *
 * §150 and §152 ran an IDENTICAL frozen v13 prompt and produced `HAZARD_SEVERITY` 4-of-7 and 0-of-9.
 * Every semantic conclusion drawn in §147–§152 rests on ONE execution of a nondeterministic model,
 * and none of them can currently be separated from sampling noise. This run is the first controlled
 * comparison, and it exists to answer four questions:
 *
 *   A  what does a second execution of the same material look like?
 *   B  does `HS-H1`'s selector-prioritization miss RECUR?
 *   C  does §150's `HAZARD_SEVERITY` behaviour recur under the hardened instrument?
 *   D  which §152 conclusions survive a second draw, and which were noise?
 *
 * ==================== THIS RUN IS NOT DETERMINISTIC ====================
 *
 *   >>> `temperature`, `top_p` and `top_k` are REMOVED on Claude Sonnet 5 and return HTTP 400. The
 *   >>> model has NO seed parameter. **NO EXACT REPRODUCTION IS POSSIBLE OR ATTEMPTED.** A row that
 *   >>> differs between replicate 1 and replicate 2 is evidence of variance, never of a change in
 *   >>> anything else — nothing else changed.
 *
 * ==================== WHAT WAS REPAIRED BEFORE SPEND, AND WHAT WAS NOT ====================
 *
 * MEASUREMENT ONLY. Three instruments, all development-side:
 *
 *   1. THE PROSPECTIVE ADJUDICATION SIDECAR — the §152 row dispositions frozen and hashed BEFORE any
 *      provider call, so no denominator can be chosen after seeing the data. §151 found four
 *      answer-key defects, every one in the model's favour; a post-hoc denominator would be the same
 *      failure wearing a different hat.
 *   2. THE DEGENERATE OUTPUT DETECTOR — §152's HS-A1 returned `candidateKey "placeholder"` with empty
 *      prose and `summary "placeholder"`, scored `PRESENT`, and contaminated two denominators.
 *   3. THE FAMILY COMPARISON MAP — §151's canonical list was populated with Expert-side names while
 *      the engine emits an entirely different routing vocabulary.
 *
 *   >>> THE FIXTURE BYTES AND DIGEST ARE UNTOUCHED. v13, `analysis.v2`, arbitration and the
 *   >>> normalizer's accepted-output behaviour are all byte-unchanged. The v9 digest must be exactly
 *   >>> 434c127c…a7fe194 or this script refuses to spend.
 *
 * ==================== NO RERUN, UNDER ANY CIRCUMSTANCE ====================
 *
 *   >>> A degenerate row is RECORDED AND CONTINUED PAST. It keeps its request and its cost, keeps its
 *   >>> raw response and its normalized result, and is excluded only from semantic denominators —
 *   >>> reported, never silently. This operation authorizes no retries and no re-execution of any row.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID, createHash } from 'crypto';

/** Minimal, auditable credential path. THE VALUE IS NEVER LOGGED, RETURNED OR PERSISTED. */
function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const s = line.trim();
    if (!s || s.startsWith('#') || !s.includes('=')) continue;
    const key = s.slice(0, s.indexOf('=')).trim().replace(/^export\s+/, '');
    const value = s.slice(s.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvFile(join(__dirname, '..', '.env'));

import {
  AnthropicExpertProvider, EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  HARDENED_FIXTURES, HARDENED_ROWS, HARDENED_SET_VERSION, HARDENED_SET_STATUS,
  CANONICAL_DETERMINISTIC_FAMILIES,
  HARDENED_FORMS, hardenedFixtureByRowId, type HardenedFixture,
} from '../src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9';
import {
  classifyRow, truthOnlyStrings, validateCohortRow,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import {
  EXPERT_SYSTEM_PROMPT, buildExpertUserPrompt, expertPromptIdentity,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  CITATION_SHAPED_PATTERN, EXPERT_AFFECTED_DECISIONS, EXPERT_ANALYSIS_CONTRACT_VERSION,
  EXPERT_INPUT_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION, type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import type {
  ExpertProvider, ExpertProviderResult,
} from '../src/hazlenz/expert-hazlenz/expert-provider';
import { EXPERT_MEASUREMENT_CONTRACT_VERSION } from
  '../src/hazlenz/expert-hazlenz/expert-measurement-contract';
import {
  runFormalCohort, providerInvocationCount, resetProviderInvocationCount,
  EXPERT_COHORT_HARNESS_VERSION,
} from './lib/expert-cohort-harness';
import { WORST_CASE_REQUEST_USD, assertBudgetInternallyConsistent } from './lib/expert-execution-budget';
import {
  createRunRecordStore, readRunRecordStore, runRecordCompletenessProblems, RUN_RECORD_FILE,
  RUN_RECORD_STORE_VERSION,
} from './lib/expert-run-record-store';
import { lintFixtureSet, type LintableFixtureRow } from './lib/expert-fixture-linter';
import {
  degenerateOutputReport, DEGENERATE_DETECTOR_VERSION, type DegenerateCheckInput,
} from './lib/expert-degenerate-output-detector';
import {
  unionCoverage, FAMILY_COMPARISON_MAP_VERSION,
} from './lib/expert-family-comparison-map';
import {
  citationDiagnostics, coverageDiagnostics, linkageDiagnostics, PROBE_MEASURES_VERSION,
  type CitationCallInput, type CoverageCallInput, type LinkageCallInput,
} from './lib/expert-probe-measures';
import {
  rawLinkageDiagnostics, RAW_LINKAGE_DIAGNOSTICS_VERSION, type RawLinkageCallInput,
} from './lib/expert-raw-linkage-diagnostics';
import {
  IdentityAlreadyWrittenError, sha256File, writePreSpendIdentityOnce,
  writeRemeasureIdentity, type PreSpendIdentity,
} from './lib/expert-probe-identity';
import type { CallRecord, CohortRunRecord } from
  '../src/hazlenz/expert-hazlenz/expert-measure-scorers';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-hardened-v13-replicate2-2026-09-03');

/**
 * THE §153 BUDGET, DECLARED HERE AND NOT IN THE FIXTURE MODULE.
 *
 * §151 deliberately exported no budget with the v9 set, because declaring one would have implied a
 * spend decision nobody had made. The authorization now makes it, so the budget belongs to the
 * OPERATION rather than to the material -- and keeping it out of the fixture file is what lets that
 * file stay byte-identical from §151's semantic review through this run.
 *
 * Sixteen calls against a sixteen-request ceiling leaves NO headroom, so the retry budget is ZERO and
 * a retry is refused rather than exceeding the cap. "No discretionary retries", read literally.
 */
const HARDENED_SET_BUDGET = {
  targetLogicalCalls: 16,
  hardLogicalCallCeiling: 16,
  hardProviderRequestCeiling: 16,
  hardSpendCeilingUsd: 2.50,
  arms: ['BASE'] as const,
  maxRetriesPerLogicalCall: 0,
} as const;

/**
 * §153 gates. NOT acceptance thresholds -- this is a BASELINE and its job is to measure. They are
 * fixed here before the data exists so the report is scored against a number it did not choose after
 * the fact. There is deliberately NO `hazardSeverity*` target: the §151 falsifier is a DIRECTION, not
 * a threshold, and giving it a number would let a count decide a question that is semantic.
 */
const HARDENED_SET_GATES = {
  strictRequiredRecall: 1.0,
  maxForbiddenViolations: 0,
  maxRetainedButNotAsked: 0,
  maxUnsupportedSettlements: 0,
  affectedDecisionSurvival: 1.0,
  maxAcceptedInvalidLinkages: 0,
  rawLinkageReconciliationRequired: true,
  trueContradictionDeterministicProofRequired: true,
  hostedTrueContradictionIsObservational: true,
  maxInvalidClarificationObjects: 0,
  maxCitationContainmentViolations: 0,
  maxProtectedAuthorityContradictions: 0,
} as const;

const B = HARDENED_SET_BUDGET;
const MODEL_PRICED_CEILING = B.hardProviderRequestCeiling * WORST_CASE_REQUEST_USD;
const SPEND_CEILING_USD = Math.min(B.hardSpendCeilingUsd, MODEL_PRICED_CEILING);
const RETRY_BUDGET = B.hardProviderRequestCeiling - B.targetLogicalCalls;
const BOUND_PROVIDER = 'anthropic';
const BOUND_MODEL = 'claude-sonnet-5';
const HISTORICAL_PROVIDER_INVOCATION_COUNT = 195;

const SCRIPT = 'backend/scripts/probe-expert-hardened-v13-replicate2-2026-09-03.ts';
const FIXTURES = 'backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts';
const PROMPT = 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts';
const NORMALIZATION = 'backend/src/hazlenz/expert-hazlenz/expert-normalization.ts';
const CONTRACT_TYPES = 'backend/src/hazlenz/expert-hazlenz/expert-contract.types.ts';

/**
 * §151's frozen digest. A mismatch blocks the run at $0.00: the whole value of this baseline is that
 * it measures the material a human actually reviewed, and a digest drift would mean it does not.
 */
const EXPECTED_SET_DIGEST =
  '434c127c44a8d6d8592c1b6e6c1cd01599428143f44737b19335a3123a7fe194';
/** The write-once §153 sidecar, frozen and hashed before this script may spend. */
const SIDECAR_PATH = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-hardened-v13-replicate2-2026-09-03', 'ADJUDICATION-SIDECAR.json');
const EXPECTED_SIDECAR_SHA =
  '38de42ab951653dcf7c0d84ee3bb3e7fbbf8b648492fc46eaa31dba50f23062e';
const sidecarRaw = existsSync(SIDECAR_PATH) ? readFileSync(SIDECAR_PATH, 'utf8') : '';
const sidecarSha = createHash('sha256').update(sidecarRaw).digest('hex');
const sidecar = sidecarRaw ? JSON.parse(sidecarRaw) as {
  preregisteredDenominators: Record<string, string[]> } : null;
/** §152's replicate-1 wire, for the row-by-row comparison. Read-only. */
const R1_DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-hardened-v13-baseline-2026-09-03');
/** The fixture FILE hash, captured at first run and re-verified after spend. */
const fixtureFileSha = createHash('sha256')
  .update(readFileSync(join(__dirname, '..', '..', FIXTURES))).digest('hex');
const EXPECTED_FIXTURE_FILE_SHA =
  process.env.PROBE_EXPECTED_FIXTURE_FILE_SHA || fixtureFileSha;

/** Project a v9 fixture into the linter's structural view, so the linter runs LIVE before spend. */
const lintable = (f: HardenedFixture): LintableFixtureRow => ({
  rowId: f.row.source.rowId, domain: f.domain, observation: f.row.source.observation,
  expectation: f.expectation.kind,
  allowedHazardFamilies: f.row.source.allowedHazardFamilies,
  truthPresent: f.row.truth.presentHazardFamilies,
  truthDefensible: f.row.truth.defensibleHazardFamilies,
  truthForbidden: f.row.truth.forbiddenHazardFamilies,
  truthNegatedOrSafe: f.row.truth.negatedOrSafeStateFamilies,
  truthLifeCritical: f.row.truth.lifeCriticalHazardFamilies,
  gaps: f.row.truth.decisionCriticalGaps,
  expectedAffectedDecision: f.expectation.kind === 'REQUIRED'
    ? String((f.expectation as unknown as { truth: { affectedDecision: string } })
        .truth.affectedDecision)
    : undefined,
  denominators: f.denominators, review: f.review, familyAliases: f.familyAliases,
});

const gate: Array<{ id: string; ok: boolean; detail: string }> = [];
let gateFailed = false;
function check(id: string, ok: boolean, detail: string): void {
  gate.push({ id, ok, detail });
  if (!ok) gateFailed = true;
  console.log(`${ok ? 'ok   ' : 'FAIL '} ${id}  ${detail}`);
}
function strings(v: unknown, out: string[] = [], d = 0): string[] {
  if (d > 12 || v === null || v === undefined) return out;
  if (typeof v === 'string') { out.push(v); return out; }
  if (typeof v !== 'object') return out;
  if (Array.isArray(v)) { v.forEach(x => strings(x, out, d + 1)); return out; }
  Object.values(v as Record<string, unknown>).forEach(x => strings(x, out, d + 1));
  return out;
}
const csv = (rows: string[][]) =>
  rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') + '\n';

interface View {
  rowId: string; fx: HardenedFixture; call: CallRecord; rec: CohortRunRecord;
}
const isRequired = (f: HardenedFixture) => f.expectation.kind === 'REQUIRED';
const reqTruth = (f: HardenedFixture) =>
  (f.expectation as unknown as { truth: Record<string, string | boolean> }).truth;

/** One clarification as the MODEL sent it, before normalization or arbitration touched it. */
interface WireClarification {
  clarificationId: string; question: string; whyItMatters: string;
  affectedDecision: string; evidenceGap: string; relatesToCandidateKey: string | null;
}
/**
 * A candidate as the MODEL sent it, INCLUDING ITS PROSE.
 *
 * §148 kept only key, family and state. §153 needs `evidenceBasis` and `reasoning` because that is
 * exactly where TR-E1 crossed: the quote was exact and in-bounds, and the field beside it said
 * something stronger than the span it cited. Without these two strings the unsupported-settlement
 * gate cannot be adjudicated at all.
 */
interface WireCandidate {
  candidateKey: string; hazardFamily: string; assertedConditionState: string;
  evidenceBasis: string; reasoning: string; quotedEvidence: string[];
}
const wireClarifications = new Map<string, WireClarification[]>();
const wireCandidates = new Map<string, WireCandidate[]>();
const wireSummary = new Map<string, string>();
const wireUncertainty = new Map<string, string[]>();

/**
 * DEVELOPMENT-ONLY capture of the raw wire, so a clarification destroyed by arbitration is still
 * adjudicable. See the header. It implements the `ExpertProvider` interface and nothing else: the
 * harness consumes only that interface, so the decorator is indistinguishable from the adapter to
 * every layer below it, and the ANALYSED PATH IS UNCHANGED -- the same `raw` object goes on to the
 * same runner and the same normalizer.
 */
class WireCapturingProvider implements ExpertProvider {
  constructor(private readonly inner: ExpertProvider) {}
  get providerId(): string { return this.inner.providerId; }
  get qualifiedModelIdentity(): string | null { return this.inner.qualifiedModelIdentity; }
  async analyze(input: ExpertAnalysisInput): Promise<ExpertProviderResult> {
    const result = await this.inner.analyze(input);
    if (result.ok && result.raw && typeof result.raw === 'object') {
      const raw = result.raw as Record<string, unknown>;
      const clars = Array.isArray(raw.decisionCriticalClarifications)
        ? raw.decisionCriticalClarifications : [];
      wireClarifications.set(input.analysisId, clars.map(c => {
        const o = (c ?? {}) as Record<string, unknown>;
        return {
          clarificationId: String(o.clarificationId ?? ''),
          question: String(o.question ?? ''),
          whyItMatters: String(o.whyItMatters ?? ''),
          affectedDecision: String(o.affectedDecision ?? ''),
          evidenceGap: String(o.evidenceGap ?? ''),
          relatesToCandidateKey: typeof o.relatesToCandidateKey === 'string'
            ? o.relatesToCandidateKey : null,
        };
      }));
      const cands = Array.isArray(raw.expertHazardCandidates) ? raw.expertHazardCandidates : [];
      wireCandidates.set(input.analysisId, cands.map(c => {
        const o = (c ?? {}) as Record<string, unknown>;
        const ev = Array.isArray(o.evidence) ? o.evidence : [];
        return {
          candidateKey: String(o.candidateKey ?? ''),
          hazardFamily: String(o.hazardFamily ?? ''),
          assertedConditionState: String(o.assertedConditionState ?? ''),
          evidenceBasis: String(o.evidenceBasis ?? ''),
          reasoning: String(o.reasoning ?? ''),
          quotedEvidence: ev.map(e => String(((e ?? {}) as Record<string, unknown>).quotedText ?? '')),
        };
      }));
      const expl = (raw.expertExplanation ?? {}) as Record<string, unknown>;
      wireSummary.set(input.analysisId, String(expl.summary ?? ''));
      const unc = (raw.uncertainty ?? {}) as Record<string, unknown>;
      wireUncertainty.set(input.analysisId,
        (Array.isArray(unc.statements) ? unc.statements : []).map(x => String(x)));
    }
    return result;
  }
}

(async () => {
  console.log('§153 EXPERT HAZLENZ — BOUNDED HOSTED THRESHOLD/ARBITRATION PROBE');
  console.log('='.repeat(100));
  const dryRun = process.env.PROBE_DRY_RUN === '1';
  const measureOnly = process.env.PROBE_MEASURE_ONLY === '1';
  console.log(`\n--- PRE-SPEND GATE${dryRun ? '  (DRY RUN)' : ''}\n`);

  const rows = HARDENED_ROWS;
  const fx = HARDENED_FIXTURES;

  // ---- A. structure, scale and DIGEST. The digest is the gate that matters: it proves the run is
  //      against the material §151 reviewed, and it covers the SIGNATURES as well as the rows.
  check('A.1 sixteen logical calls, matching the authorization',
    rows.length === B.targetLogicalCalls && rows.length === 16,
    `${rows.length} rows (request ceiling ${B.hardProviderRequestCeiling})`);
  const structural = rows.map(r => validateCohortRow(r)).filter(p => p.length > 0);
  check('A.2 every row is structurally scoreable', structural.length === 0,
    `${structural.length} problems`);
  const ids = rows.map(r => r.source.rowId);
  check('A.3 ids are fresh HS-* development ids',
    ids.every(i => /^HS-[A-R]\d$/.test(i)) && new Set(ids).size === ids.length, ids.join(' '));
  check('A.4 sixteen distinct domains',
    new Set(fx.map(f => f.domain)).size === rows.length, String(new Set(fx.map(f => f.domain)).size));

  const setDigest = createHash('sha256').update(JSON.stringify(
    [...fx].map(f => ({ id: f.row.source.rowId, form: f.form, obs: f.row.source.observation,
      allowed: f.row.source.allowedHazardFamilies, truth: f.row.truth,
      records: f.row.source.governedStandards.map(g => g.citation),
      expectation: f.expectation, denominators: f.denominators,
      review: f.review.map(x => [x.claim, x.note]) }))
      .sort((a, b) => a.id.localeCompare(b.id)))).digest('hex');
  check('A.5 THE v9 DIGEST MATCHES §151 EXACTLY — this run is against the reviewed material',
    setDigest === EXPECTED_SET_DIGEST, `${setDigest.slice(0, 24)}…`);
  check('A.5b and the fixture FILE is byte-identical to its §151 state',
    fixtureFileSha === EXPECTED_FIXTURE_FILE_SHA, `${fixtureFileSha.slice(0, 24)}…`);
  check('A.5c the set is declared UNSPENT with no prior hosted authorization',
    HARDENED_SET_STATUS.spent === false
      && HARDENED_SET_STATUS.authoredUnder === 'hazlenz.expert.prompt.v13',
    `authored under ${HARDENED_SET_STATUS.authoredUnder}`);

  // ---- B. THE LINTER, run live rather than trusted from §151, and every signature checked.
  const lint = lintFixtureSet(fx.map(lintable), {
    canonicalFamilies: [...CANONICAL_DETERMINISTIC_FAMILIES],
    declaredDenominators: ['STRICT_REQUIRED_RECALL', 'FORBIDDEN_SILENCE', 'RETAINED_BUT_NOT_ASKED',
      'UNSUPPORTED_SETTLEMENT', 'AFFECTED_DECISION_ACCURACY'],
  });
  check('B.1 the fixture linter PASSES live, at $0.00',
    lint.passed && lint.rowsLinted === 16,
    lint.passed ? `${lint.rowsLinted} rows, 0 mechanical, 0 unsigned`
      : lint.findings.map(x => `${x.rowId}:${x.code}`).join(' | '));
  const required = fx.filter(isRequired);
  const forbidden = fx.filter(f => !isRequired(f));
  check('B.2 eight REQUIRED and eight FORBIDDEN', required.length === 8 && forbidden.length === 8,
    `${required.length} / ${forbidden.length}`);
  check('B.3 every row carries its full signature set, none re-signed to a hollow value',
    fx.every(f => f.review.length === (isRequired(f) ? 8 : 5)
      && f.review.every(x => x.note.trim().length >= 25)),
    fx.filter(f => f.review.length !== (isRequired(f) ? 8 : 5))
      .map(f => f.row.source.rowId).join(', ') || 'all sixteen complete');

  // ---- THE RB-D1 REPAIR, gated before spend: a correct question must not be scored a miss for
  //      choosing a different one of several equally exact selectors.
  check('B.4 every REQUIRED row enumerates at least two acceptable selectors',
    required.every(f => reqTruth(f).acceptableSelectors !== undefined
      && (reqTruth(f).acceptableSelectors as unknown as string[]).length >= 2),
    'the §151 selector-over-specification repair');

  // ---- THE RESIDUAL-AXIS PROBE and its falsifier, declared before the data exists.
  const probe = fx.filter(f => f.form === 'SEVERITY_REFINEMENT_ONLY');
  check('B.5 the CONSEQUENCE-MAGNITUDE probe row is present, owed SILENCE, and declares its own '
    + 'falsifier BEFORE the run',
    probe.length === 1 && !isRequired(probe[0])
      && typeof probe[0].expectedToFailUnderV13 === 'string'
      && /FALSIFIES/.test(probe[0].expectedToFailUnderV13!),
    probe.map(f => f.row.source.rowId).join(' '));
  check('B.5b and NO row authors HAZARD_SEVERITY or HAZARD_EXISTENCE as an expected label — §151 '
    + 'measured HAZARD_SEVERITY correct 0 of 7, so it is not a label to expect',
    required.every(f => reqTruth(f).affectedDecision !== 'HAZARD_SEVERITY'
      && reqTruth(f).affectedDecision !== 'HAZARD_EXISTENCE'),
    [...new Set(required.map(f => String(reqTruth(f).affectedDecision)))].join(', '));

  // ---- NON-REGRESSION COVERAGE, so the baseline is not only about the new axis.
  const forms = new Set(fx.map(f => f.form));
  check('B.6 v11, v12 and v13 each keep a non-regression row in the set',
    forms.has('NOT_VISIBLE') && forms.has('AGGREGATION_AGAINST_A_RECORD')
      && forms.has('SETTLED_THRESHOLD') && forms.has('EXPLICITLY_ABSENT')
      && forms.has('TRUE_DETERMINISTIC_DERIVATION') && forms.has('RETAINED_CANDIDATE_SHAPED'),
    `${forms.size} forms`);
  check('B.7 all sixteen forms appear exactly once — a result names its own mechanism',
    HARDENED_FORMS.every(x => forms.has(x)) && forms.size === HARDENED_FORMS.length,
    `${forms.size} of ${HARDENED_FORMS.length}`);

  // ---- §153 MEASUREMENT LAYER. All three instruments frozen and proved BEFORE any request.
  check('B.8 THE ADJUDICATION SIDECAR IS FROZEN and hashes to its pre-registered value — no '
    + 'denominator can be chosen after seeing the data',
    sidecarSha === EXPECTED_SIDECAR_SHA && sidecar !== null, `${sidecarSha.slice(0, 24)}…`);
  const preReq = sidecar?.preregisteredDenominators?.PRIMARY_REQUIRED ?? [];
  const preForb = sidecar?.preregisteredDenominators?.PRIMARY_FORBIDDEN ?? [];
  check('B.8b and its denominators are exactly the §152 dispositions the authorization fixed',
    preReq.length === 7 && preForb.length === 7
      && !preReq.includes('HS-F1') && !preForb.includes('HS-M1')
      && preReq.includes('HS-H1') && preReq.includes('HS-A1'),
    `REQUIRED ${preReq.length} (HS-F1 excluded, HS-H1 and HS-A1 included); `
    + `FORBIDDEN ${preForb.length} (HS-M1 excluded)`);
  check('B.9 the degenerate-output detector is armed and versioned',
    DEGENERATE_DETECTOR_VERSION.endsWith('.v1'), DEGENERATE_DETECTOR_VERSION);
  check('B.9b the family comparison map is armed and versioned',
    FAMILY_COMPARISON_MAP_VERSION.endsWith('.v1'), FAMILY_COMPARISON_MAP_VERSION);
  check('B.10 replicate 1 artifacts are present and readable for the row-by-row comparison',
    existsSync(join(R1_DIR, 'RAW-WIRE.jsonl')) && existsSync(join(R1_DIR, 'RUN-RECORDS.jsonl')),
    'the §152 evidence directory');

  // ---- C. fixture-truth quality. §140's DP-B4, enforced rather than trusted.
  const brokenCounterfactual = required.filter(f => {
    const t = reqTruth(f);
    return !t.missingFact || !t.answerA || !t.answerB || !t.outcomeA || !t.outcomeB
      || String(t.outcomeA).trim() === String(t.outcomeB).trim();
  });
  check('C.1 every REQUIRED row states BOTH answers and BOTH DIFFERENT current outcomes',
    brokenCounterfactual.length === 0,
    brokenCounterfactual.length === 0 ? `${required.length} complete counterfactuals`
      : brokenCounterfactual.map(f => f.row.source.rowId).join(', '));
  check('C.2 exactly one authored gap per REQUIRED row, none on any FORBIDDEN row',
    fx.every(f => f.row.truth.decisionCriticalGaps.length === (isRequired(f) ? 1 : 0)),
    'retention is unambiguous per row');
  check('C.3 every FORBIDDEN row states the tempting question AND a per-row reason',
    forbidden.every(f => {
      const t = (f.expectation as unknown as { truth: Record<string, string> }).truth;
      return t.temptingQuestion.length > 10 && t.whyNotDecisionCritical.length > 60
        && t.whatMakesItSettled.length > 60;
    }), 'no blanket labels; each names the value, the basis and the side');
  const affected = required.map(f => String(reqTruth(f).affectedDecision));
  check('C.4 every authored affectedDecision is in the frozen vocabulary',
    affected.every(a => (EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(a)),
    [...new Set(affected)].join(', '));
  check('C.5 REGULATORY_INTERPRETATION is never claimed without a SUPPLIED record',
    required.every(f => reqTruth(f).affectedDecision !== 'REGULATORY_INTERPRETATION'
      || f.row.source.governedStandards.length > 0), 'checked');
  check('C.6 and NO row authors HAZARD_EXISTENCE as the owed label — on a row whose hazard the text '
    + 'establishes, an existence question IS the contradiction',
    required.every(f => reqTruth(f).affectedDecision !== 'HAZARD_EXISTENCE'), 'checked');

  // ---- D. containment
  const src = readFileSync(join(ROOT, SCRIPT), 'utf8');
  const fixtureSrc = readFileSync(join(ROOT, FIXTURES), 'utf8');
  const forbiddenPaths = /formal-cohort-65|frozen-formal-cohort|reserved|RESERVED_|expanded-validation-v4|hosted-linkage-probe|linkage-confirmation-probe|clarification-recall-probe-v5/;
  const importsOf = (s: string) => s.split('\n').filter(l => l.trim().startsWith('import')
    || /^\s+'\.\./.test(l)).join('\n');
  check('D.1 no formal-cohort, reserved or SPENT-probe path is imported',
    !forbiddenPaths.test(importsOf(src)) && !forbiddenPaths.test(importsOf(fixtureSrc)),
    'clean — and the spent v5 fixture set is not reused either');

  // ---- E. provider identity
  const cfg = EXPERT_HOSTED_INFERENCE_CONFIG;
  check('E.1 model bound exactly', cfg.model === BOUND_MODEL, cfg.model);
  check('E.2 vendor endpoint', cfg.endpoint.startsWith('https://api.anthropic.com'), cfg.endpoint);
  check('E.3 thinking disabled', cfg.thinking === 'disabled', cfg.thinking);
  check('E.4 credential present (never logged or persisted)',
    typeof process.env.ANTHROPIC_API_KEY === 'string'
      && process.env.ANTHROPIC_API_KEY.length > 0, 'set');

  // ---- F. dry build. Every request is constructed and NOTHING is called.
  resetProviderInvocationCount();
  const identity = expertPromptIdentity({
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: 'probe',
    authoritativeSources: [{ sourceId: 'observation', sourceType: 'observation',
      text: rows[0].source.observation }],
    inspectionContext: { location: null, task: null },
    jurisdiction: rows[0].source.jurisdiction,
    allowedHazardFamilies: [...rows[0].source.allowedHazardFamilies],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
  });
  const built: string[][] = rows.map(r => {
    const inp: ExpertAnalysisInput = {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: r.source.rowId,
      authoritativeSources: [{ sourceId: 'observation', sourceType: 'observation' as const,
        text: r.source.observation }],
      inspectionContext: { location: null, task: null },
      jurisdiction: r.source.jurisdiction,
      allowedHazardFamilies: [...r.source.allowedHazardFamilies],
      deterministicFindings: [], governedStandards: [...r.source.governedStandards],
      answeredClarifications: [],
    };
    return [EXPERT_SYSTEM_PROMPT, buildExpertUserPrompt(inp)];
  });
  check('F.1 built one request per row, called nothing',
    built.length === rows.length && providerInvocationCount() === 0,
    `${built.length} built, ${providerInvocationCount()} invocations`);
  check('F.2 ONE ARM ONLY — M14 not attempted', B.arms.length === 1 && B.arms[0] === 'BASE', 'BASE');
  // §153 IS NOT A REMEDIATION RUN. The §151 v14 change must still be unimplemented at spend time,
  // and the §139 collision rule it proposes to amend must still be the shipped one.
  const promptSrc = readFileSync(join(ROOT, PROMPT), 'utf8');
  check('F.2b v14 IS UNIMPLEMENTED — v13 is the shipped version and no v14 block exists',
    !/prompt\.v14/.test(promptSrc) && /prompt\.v13/.test(promptSrc),
    'this is a baseline, not a remediation');
  check('F.2c and the §139 collision rule §151 proposes to amend is UNTOUCHED',
    built.every(([sysText]) =>
      sysText.includes('"how much / how many / how long / how far" is HAZARD_SEVERITY')),
    'the baseline measures shipped behaviour, not an edited contract');
  console.log(`\n      prompt ${identity.promptVersion}   contract ${EXPERT_ANALYSIS_CONTRACT_VERSION}`);
  console.log(`      system ${identity.systemPromptSha256}`);
  console.log(`      schema ${identity.wireSchemaSha256}\n`);
  check('F.3 the prospective repaired prompt is v13',
    identity.promptVersion === 'hazlenz.expert.prompt.v13', identity.promptVersion);
  check('F.4 the analysis contract is UNCHANGED at v2 — the schema gained no field',
    EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    EXPERT_ANALYSIS_CONTRACT_VERSION);

  // The §153 bridge must be in the text that ACTUALLY GOES TO THE MODEL, placed LAST, and
  // conjunctive. These are the checks that tie the probe to the thing it is probing.
  check('F.5 THE RETENTION BRIDGE is in the system prompt this probe will send, and placed LAST',
    built.every(([sys]) => sys.includes('THE RETENTION BRIDGE')
      && sys.includes('Run this LAST, over everything you have just written')
      && sys.indexOf('THE SETTLEMENT CHECK') < sys.indexOf('THE RETENTION BRIDGE')),
    'present and after the settlement check in all requests');
  check('F.5b with the distinction from the settlement check stated — RESOLVED versus left OPEN',
    built.every(([sys]) =>
      sys.includes('catches a fact you RESOLVED. This one catches a fact you correctly left OPEN')),
    'the diagnosis, in one sentence, in every request');
  check('F.5c and all four retention channels named',
    built.every(([sys]) => sys.includes('a candidate you left INSUFFICIENT_EVIDENCE or UNKNOWN')
      && sys.includes('reasoning or an evidenceBasis that calls something unconfirmed')
      && sys.includes('a summary sentence that says a fact is not settled')
      && sys.includes('an uncertainty statement')),
    'candidate state, reasoning, summary, uncertainty');
  check('F.6 THE ANTI-OVERFIRE CLAUSE is present — the state alone is never a reason to ask',
    built.every(([sys]) => /INSUFFICIENT_EVIDENCE[\s\S]{0,20}ON ITS OWN IS NEVER A REASON TO ASK/
        .test(sys)
      && sys.includes('THIS DOES NOT LOWER THE BAR AND IT IS NOT A QUOTA')
      && sys.includes('If NO, say nothing')),
    'the conjunction and the deference to the counterfactual test, in all requests');
  check('F.6b and the no-duplicate rule',
    built.every(([sys]) => sys.includes('One question per fact')), 'present in all requests');
  check('F.7 NOTHING from v9-v12 was dropped from the text being sent — §149\'s closure especially',
    built.every(([sys]) => sys.includes('NOT OBSERVED IS NOT ABSENT')
      && sys.includes('THIS IS NOT AN INSTRUCTION TO DOUBT THE TEXT')
      && sys.includes('LIKELY IS NOT ESTABLISHED')
      && sys.includes('WORST CASE MAY EXPLAIN. IT MUST NEVER SETTLE')
      && sys.includes('YOUR EVIDENCE BASIS MUST NOT SAY MORE THAN YOUR QUOTE DOES')
      && sys.includes('A THRESHOLD IS NOT A GAP')
      && sys.includes('It is unsettled ONLY where BOTH of these hold')
      && sys.includes('BEFORE YOU WRITE HAZARD_EXISTENCE, RE-READ YOUR OWN CANDIDATE LIST')
      && sys.includes('THE SETTLEMENT CHECK')
      && sys.includes('THIS LIST STARTS EMPTY AND STAYS EMPTY')
      && sys.includes('Both are real answers')),
    'v12 settlement, v11 threshold and routing, v10 checks, v9 precision and the '
    + 'INSUFFICIENT_EVIDENCE state all intact');

  // ---- G. nothing about the answer key reaches the model
  const truthLeak = rows.map((r, i) => {
    const leak = truthOnlyStrings(r).filter(s => s.length > 12
      && built[i].some(text => text.includes(s)));
    return { rowId: r.source.rowId, leak };
  }).filter(x => x.leak.length > 0);
  check('G.1 no truth-key-only string reaches any request', truthLeak.length === 0,
    `${rows.length} scanned`);
  const citationLeak = built.map((b, i) => ({ rowId: rows[i].source.rowId,
    hits: b.filter(t => CITATION_SHAPED_PATTERN.test(t)).length })).filter(x => x.hits > 0);
  check('G.2 no built prompt carries citation-shaped text', citationLeak.length === 0,
    `${rows.length} scanned`);
  const suppliedWithCitations = rows.flatMap(r => r.source.governedStandards)
    .flatMap(g => strings(g)).filter(s => CITATION_SHAPED_PATTERN.test(s)).length;
  check('G.3 redaction is exercised', suppliedWithCitations > 0,
    `${suppliedWithCitations} supplied record fields carried a citation pre-render`);

  // ---- H. budget, store, identity
  assertBudgetInternallyConsistent();
  check('H.1 spend ceiling is the LOWER of authorized and model-priced',
    Math.abs(SPEND_CEILING_USD - Math.min(B.hardSpendCeilingUsd, MODEL_PRICED_CEILING)) < 1e-9,
    `authorized $${B.hardSpendCeilingUsd.toFixed(2)}, priced `
    + `$${MODEL_PRICED_CEILING.toFixed(4)} -> enforcing $${SPEND_CEILING_USD.toFixed(4)}`);
  // §153 reads the authorization literally: 10 calls against a 10-request cap leaves NO headroom,
  // so the retry budget is ZERO and a retry is REFUSED rather than silently exceeding the cap. A
  // transport failure therefore leaves that row PROVIDER_FAILED with the suppression recorded, and
  // nothing is fabricated into a success.
  check('H.1b the retry allowance is ZERO, and a retry would be refused rather than overspend',
    RETRY_BUDGET === B.hardProviderRequestCeiling - B.targetLogicalCalls && RETRY_BUDGET === 0
      && B.maxRetriesPerLogicalCall === 0,
    `${RETRY_BUDGET} retry requests against a ${B.hardProviderRequestCeiling}-request cap`);
  mkdirSync(OUT, { recursive: true });
  const storePath = join(OUT, RUN_RECORD_FILE);
  const idPath = join(OUT, 'PRE-SPEND-IDENTITY.json');
  if (measureOnly) {
    check('H.2 MEASURE-ONLY: store exists', existsSync(storePath)
      && readFileSync(storePath, 'utf8').trim().length > 0, 'no provider request will be issued');
  } else {
    check('H.2 store is empty or absent',
      !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0, 'clean');
    check('H.3 PRE-SPEND-IDENTITY.json does not already exist', !existsSync(idPath), 'clean');
  }

  const preSpend: PreSpendIdentity = {
    operation: '§153 Expert HazLenz bounded hosted settlement-threshold + affectedDecision routing probe',
    capturedAt: new Date().toISOString(), isFormalEvaluation: false,
    hashes: {
      probeScriptSha256: sha256File(join(ROOT, SCRIPT)),
      fixtureManifestSha256: sha256File(join(ROOT, FIXTURES)),
      systemPromptSha256: identity.systemPromptSha256,
      wireSchemaSha256: identity.wireSchemaSha256,
      normalizationSha256: sha256File(join(ROOT, NORMALIZATION)),
      contractTypesSha256: sha256File(join(ROOT, CONTRACT_TYPES)),
    },
    execution: { provider: BOUND_PROVIDER, model: cfg.model,
      promptVersion: identity.promptVersion,
      analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION },
    budget: { targetLogicalCalls: B.targetLogicalCalls,
      hardProviderRequestCeiling: B.hardProviderRequestCeiling,
      retryRequestBudget: RETRY_BUDGET,
      enforcedSpendCeilingUsd: Number(SPEND_CEILING_USD.toFixed(6)),
      worstCaseRequestUsd: Number(WORST_CASE_REQUEST_USD.toFixed(6)) },
    extra: {
      git: { head: process.env.PROBE_GIT_HEAD ?? null, branch: process.env.PROBE_GIT_BRANCH ?? null,
        upstream: process.env.PROBE_GIT_UPSTREAM ?? null, dirty: process.env.PROBE_GIT_DIRTY ?? null },
      historicalProviderInvocationCount: HISTORICAL_PROVIDER_INVOCATION_COUNT,
      operation: 'hardened-v9-v13-baseline-replicate-2',
      relationToPriorRun: 'REPLICATE_OF §152 expert-hazlenz-hardened-v13-baseline-2026-09-03',
      THIS_RUN_IS_NOT_DETERMINISTIC: true,
      NO_SEED_IS_AVAILABLE: true,
      PURPOSE: 'RUN-TO-RUN VARIANCE CHARACTERIZATION, NOT EXACT REPRODUCTION. No exact reproduction '
        + 'is possible or attempted; a row that differs between replicates is evidence of variance, '
        + 'because nothing else changed.',
      adjudicationSidecarSha256: sidecarSha,
      degenerateDetectorVersion: DEGENERATE_DETECTOR_VERSION,
      familyComparisonMapVersion: FAMILY_COMPARISON_MAP_VERSION,
      retryPolicy: 'NONE — zero retries, and no rerun of a degenerate row under any circumstance',
      // ---- THE MATERIAL THIS RUN IS AGAINST, pinned two ways.
      fixtureSetVersion: HARDENED_SET_VERSION,
      fixtureSetDigest: setDigest,
      fixtureFileSha256: fixtureFileSha,
      fixtureDigestCoversSignatures: true,
      // ---- SAMPLING DETERMINISM, stated precisely rather than left to be assumed.
      samplingDeterminism: {
        temperature: 'NOT_SENT — removed on Claude Sonnet 5; sending it returns HTTP 400',
        top_p: 'NOT_SENT — same',
        top_k: 'NOT_SENT — same',
        seed: 'NOT_AVAILABLE — the model has no seed parameter',
        reproducibility: 'THIS RUN IS NOT REPRODUCIBLE BY SEED. No repeat-run variance is '
          + 'controlled or measured, and a single replicate cannot separate model behaviour from '
          + 'sampling noise.',
      },
      // ---- WHAT THIS RUN IS NOT.
      isRemediationRun: false,
      v14Implemented: false,
      promptFrozenSince: '§151',
      // The prompt MODULE hash, alongside the rendered system-prompt hash. `PreSpendIdentity.hashes`
      // is a frozen shape shared with spent probes and is deliberately not widened for this.
      promptModuleSha256: sha256File(join(ROOT, PROMPT)),
      contractVersions: { input: EXPERT_INPUT_CONTRACT_VERSION, validator: EXPERT_VALIDATOR_VERSION,
        measurement: EXPERT_MEASUREMENT_CONTRACT_VERSION, harness: EXPERT_COHORT_HARNESS_VERSION,
        runRecordStore: RUN_RECORD_STORE_VERSION, probeMeasures: PROBE_MEASURES_VERSION,
        fixtureSet: HARDENED_SET_VERSION },
      arms: ['BASE'], m14RemediationStatus: 'NOT_ATTEMPTED',
      endpoint: cfg.endpoint, apiVersion: cfg.apiVersion, maxTokens: cfg.maxTokens,
      thinking: cfg.thinking,
      frozenGates: HARDENED_SET_GATES,
      rawWireCapture: 'DEVELOPMENT-ONLY provider decorator in this script; production runner, '
        + 'normalizer and customer path are byte-unchanged and offendingText is NOT broadened',
      gate,
    },
  };

  if (gateFailed) {
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      'EXPERT_HAZLENZ_THRESHOLD_ARBITRATION_PROBE_BLOCKED — PRESPEND_REGRESSION_OR_HARNESS_FAILURE\n'
      + gate.filter(x => !x.ok).map(x => `${x.id}: ${x.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.'); process.exit(1);
  }
  console.log(`\n  PRE-SPEND GATE: ${gate.length}/${gate.length} PASS. $0.00 spent so far.\n`);

  // A $0.00 rehearsal must never consume the write-once artifact. §142 learned this by consuming it.
  if (dryRun) {
    console.log('ACTIVE_SCRIPT_EXECUTABLE_PROOF = TRUE');
    console.log('PROBE_DRY_RUN=1 — stopping BEFORE the identity write and before any spend.');
    process.exit(0);
  }

  // ================================================================ SPEND
  type RunFacts = { stopReason: string; identityViolation: string | null;
    accounting: Record<string, number>; retryCauses: string[]; retriesSuppressed: unknown[];
    startedAt: string; finishedAt: string; providerInvocations: number };
  let runFacts: RunFacts;
  let readBackProof: { rowId: string; provenBeforeExit: boolean; recordsOnDisk: number } | null = null;

  if (measureOnly) {
    console.log('--- MEASURE-ONLY. $0.00.\n');
    const prior = JSON.parse(readFileSync(join(OUT, 'RESULTS-SUMMARY.json'), 'utf8'));
    runFacts = { stopReason: prior.stopReason, identityViolation: prior.identityViolation,
      accounting: prior.accounting, retryCauses: prior.retryCauses,
      retriesSuppressed: prior.retriesSuppressed, startedAt: prior.startedAt,
      finishedAt: prior.finishedAt, providerInvocations: prior.providerInvocationsThisProcess };
    readBackProof = prior.persistence?.midRunReadBackProof ?? null;
    // The captured wire is re-read from its own artifact so a measure-only pass reports the same
    // reasoned-but-destroyed figures rather than silently reporting zero.
    const wirePath = join(OUT, 'RAW-WIRE.jsonl');
    if (existsSync(wirePath)) {
      for (const line of readFileSync(wirePath, 'utf8').trim().split('\n').filter(Boolean)) {
        const o = JSON.parse(line) as { rowId: string; clarifications: WireClarification[];
          candidates: WireCandidate[]; summary?: string; uncertainty?: string[] };
        wireClarifications.set(o.rowId, o.clarifications);
        wireCandidates.set(o.rowId, o.candidates);
        wireSummary.set(o.rowId, o.summary ?? '');
        wireUncertainty.set(o.rowId, o.uncertainty ?? []);
      }
    }
    writeRemeasureIdentity(join(OUT, 'PRE-SPEND-IDENTITY.remeasure.json'), preSpend);
  } else {
    writePreSpendIdentityOnce(idPath, preSpend);
    let refused = false; const before = sha256File(idPath);
    try { writePreSpendIdentityOnce(idPath, { ...preSpend, operation: 'SECOND WRITE' }); }
    catch (e) { refused = e instanceof IdentityAlreadyWrittenError; }
    check('H.4 a SECOND write to the live identity is refused, bytes unchanged',
      refused && sha256File(idPath) === before, `sha256 ${before.slice(0, 16)}… stable`);
    if (!refused || sha256File(idPath) !== before) {
      console.log('\nIDENTITY WRITE-ONCE PROOF FAILED. Nothing was spent.'); process.exit(1);
    }

    console.log('\n--- SPEND. The probe is SPENT at the first request.\n');
    const store = createRunRecordStore(OUT);
    const provider = new WireCapturingProvider(new AnthropicExpertProvider(cfg));
    resetProviderInvocationCount();
    const startedAt = new Date().toISOString();
    const run = await runFormalCohort(rows, {
      mode: 'ENABLED', provider,
      callCeiling: B.targetLogicalCalls,
      requestCeiling: B.hardProviderRequestCeiling,
      retryRequestBudget: RETRY_BUDGET,
      worstCaseRequestUsd: WORST_CASE_REQUEST_USD,
      spendCeilingUsd: SPEND_CEILING_USD,
      frozenIdentity: { provider: BOUND_PROVIDER, model: BOUND_MODEL },
      arms: ['BASE'], processId: randomUUID().slice(0, 8),
      nowIso: new Date().toISOString(),
      recordSink: (rec: CohortRunRecord) => {
        store.append(rec);
        if (!readBackProof) {
          const back0 = readRunRecordStore(OUT);
          readBackProof = { rowId: rec.row.source.rowId,
            provenBeforeExit: back0.problems.length === 0 && back0.records.length >= 1
              && back0.records[0].row?.source?.rowId === rec.row.source.rowId,
            recordsOnDisk: back0.records.length };
          console.log(`      [persistence proof] ${back0.records.length} record(s) read back from `
            + `disk with ${rows.length - 1} calls outstanding`);
        }
        const c = rec.calls[0]; const a = c?.analysis;
        const f = hardenedFixtureByRowId(rec.row.source.rowId)!;
        const wire = wireClarifications.get(rec.row.source.rowId) ?? [];
        const kept = a?.decisionCriticalClarifications.length ?? 0;
        console.log(`      ${rec.row.source.rowId.padEnd(6)} `
          + `${(isRequired(f) ? 'REQUIRED ' : 'FORBIDDEN')} ${String(c?.layerStatus).padEnd(9)}`
          + ` wire ${String(wire.length).padStart(2)} -> kept ${String(kept).padStart(2)}`
          + ` cand ${String(a?.expertHazardCandidates.length ?? '-').padStart(2)}`
          + `  ${String(c?.latencyMs ?? 0).padStart(6)}ms $${(c?.costUsd ?? 0).toFixed(5)}`);
      },
    });
    store.close();
    runFacts = { stopReason: run.stopReason, identityViolation: run.identityViolation,
      accounting: run.accounting as unknown as Record<string, number>,
      retryCauses: run.retryCauses, retriesSuppressed: run.retriesSuppressed,
      startedAt, finishedAt: new Date().toISOString(),
      providerInvocations: providerInvocationCount() };
    console.log(`\n  stop ${run.stopReason}   calls ${run.accounting.callsAttempted}/`
      + `${run.accounting.callsCompleted}   requests ${run.accounting.providerRequestsAttempted}`
      + ` (${run.accounting.retryRequestsAttempted} retries)`);
    console.log(`  tokens ${run.accounting.inputTokens} in / ${run.accounting.outputTokens} out`
      + `   spend $${run.accounting.spendUsd.toFixed(6)} of $${SPEND_CEILING_USD.toFixed(4)}`);

    // The captured wire, written once, citation-scanned like every other artifact.
    const wireLines = rows.map(r => JSON.stringify({
      rowId: r.source.rowId,
      clarifications: wireClarifications.get(r.source.rowId) ?? [],
      candidates: wireCandidates.get(r.source.rowId) ?? [],
      summary: wireSummary.get(r.source.rowId) ?? '',
      uncertainty: wireUncertainty.get(r.source.rowId) ?? [],
    }));
    writeFileSync(join(OUT, 'RAW-WIRE.jsonl'), wireLines.join('\n') + '\n');
  }

  // ================================================================ MEASURE
  const back = readRunRecordStore(OUT);
  const completeness = runRecordCompletenessProblems(back.records, {
    rowOrder: rows.map(r => r.source.rowId), arms: ['BASE'] });
  const views: View[] = back.records.flatMap(rec => (rec.calls ?? []).map(call => ({
    rowId: rec.row.source.rowId, fx: hardenedFixtureByRowId(rec.row.source.rowId)!, call, rec })));
  const present = views.filter(v => v.call.layerStatus === 'PRESENT' && v.call.analysis);
  const clar = (v: View) => v.call.analysis?.decisionCriticalClarifications ?? [];
  const cands = (v: View) => v.call.analysis?.expertHazardCandidates ?? [];
  const codes = (v: View) => (v.call.issues ?? []).map(i => i.code);
  const wireOf = (v: View) => wireClarifications.get(v.rowId) ?? [];

  // ---- REQUIRED recall, LOOSE only. The STRICT call is a human one, as §146 established.
  const requiredViews = present.filter(v => isRequired(v.fx));
  const forbiddenViews = present.filter(v => !isRequired(v.fx));
  const requiredSpoke = requiredViews.filter(v => clar(v).length > 0);
  const forbiddenSilent = forbiddenViews.filter(v => clar(v).length === 0);

  // ---- THE §153 MEASURE. Reasoned-but-destroyed, reported SEPARATELY and never as recall.
  //
  // A clarification the model EMITTED that did not survive to the validated analysis. Matched by
  // clarificationId where the model supplied one, and by question text otherwise, so a re-issued id
  // cannot silently hide a drop.
  const destroyed = present.flatMap(v => {
    const keptIds = new Set(clar(v).map(c => String(c.clarificationId)));
    const keptQuestions = new Set(clar(v).map(c => String(c.question)));
    return wireOf(v)
      .filter(w => !keptIds.has(w.clarificationId) && !keptQuestions.has(w.question))
      .map(w => ({
        rowId: v.rowId, expectation: v.fx.expectation.kind, form: v.fx.form,
        clarificationId: w.clarificationId, question: w.question,
        affectedDecision: w.affectedDecision, evidenceGap: w.evidenceGap,
        whyItMatters: w.whyItMatters, relatesToCandidateKey: w.relatesToCandidateKey,
        authoredAffectedDecision: isRequired(v.fx)
          ? String(reqTruth(v.fx).affectedDecision) : 'NONE_OWED',
        issueCodes: codes(v).filter(c => c.startsWith('CLARIFICATION_')),
        // The candidate it named, and that candidate's state, so the drop is attributable without
        // re-reading the run record.
        namedCandidateState: (wireCandidates.get(v.rowId) ?? [])
          .find(c => c.candidateKey === w.relatesToCandidateKey)?.assertedConditionState ?? null,
      }));
  });

  // AFFECTEDDECISION SURVIVAL. The denominator is clarifications the model emitted on a row where a
  // clarification was OWED and whose authored label is not HAZARD_EXISTENCE -- i.e. opportunities
  // that a correct label would have carried through arbitration intact. A drop here is a ROUTING
  // failure, never an arbitration defect.
  const survivalDenominator = present.filter(v => isRequired(v.fx))
    .reduce((t, v) => t + wireOf(v).length, 0);
  const survivalLost = destroyed.filter(d => d.expectation === 'REQUIRED').length;

  // TRUE CONTRADICTION REJECTION. A drop is CORRECT whenever the emitted label was HAZARD_EXISTENCE
  // and it named a candidate the model itself asserted ACTIVE. Every such drop must have happened.
  const trueContradictions = present.flatMap(v => wireOf(v)
    .filter(w => w.affectedDecision === 'HAZARD_EXISTENCE'
      && typeof w.relatesToCandidateKey === 'string'
      && (wireCandidates.get(v.rowId) ?? []).some(c => c.candidateKey === w.relatesToCandidateKey
        && c.assertedConditionState === 'ACTIVE'))
    .map(w => ({ rowId: v.rowId, clarificationId: w.clarificationId, question: w.question })));
  const trueContradictionsRejected = trueContradictions.filter(t =>
    destroyed.some(d => d.rowId === t.rowId && d.clarificationId === t.clarificationId));

  // AFFECTEDDECISION ACCURACY on the REQUIRED rows, against the authored label. Reported as a
  // diagnostic beside survival, because a label can be wrong without being destructive.
  const labelled = present.filter(v => isRequired(v.fx)).flatMap(v =>
    wireOf(v).map(w => ({ rowId: v.rowId, emitted: w.affectedDecision,
      authored: String(reqTruth(v.fx).affectedDecision) })));
  const labelExistenceOnActiveRow = labelled.filter(x => x.emitted === 'HAZARD_EXISTENCE').length;

  // ---- Object validity. An emitted question must be a legal object, not merely present.
  const invalidObjects: string[] = [];
  for (const v of present) {
    for (const c of clar(v)) {
      const problems: string[] = [];
      if (!(EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(String(c.affectedDecision))) {
        problems.push(`affectedDecision=${String(c.affectedDecision)}`);
      }
      if (!c.question || String(c.question).trim().length < 10) problems.push('question too short');
      if (!c.whyItMatters || String(c.whyItMatters).trim().length < 20) problems.push('no branches');
      if (!c.evidenceGap || String(c.evidenceGap).trim().length < 5) problems.push('no evidenceGap');
      if (c.affectedDecision === 'REGULATORY_INTERPRETATION'
          && v.rec.row.source.governedStandards.length === 0) {
        problems.push('REGULATORY_INTERPRETATION with no supplied record');
      }
      if (problems.length > 0) {
        invalidObjects.push(`${v.rowId}/${String(c.clarificationId)}: ${problems.join('; ')}`);
      }
    }
  }

  // ---- Regression axes. None of these may move.
  const citation = citationDiagnostics(present.map((v): CitationCallInput => ({
    modelInputText: built[rows.findIndex(r => r.source.rowId === v.rowId)] ?? [],
    suppliedGovernedRecordText: v.rec.row.source.governedStandards.flatMap(g => strings(g)),
    validatedAnalysis: v.call.analysis ?? null,
    mergedExpertAdvisory: (v.call as unknown as { merged?: { expertAdvisory?: unknown } })
      .merged?.expertAdvisory ?? null,
    mergedGovernedBlock: (v.call as unknown as { merged?: { governed?: unknown } })
      .merged?.governed ?? null,
    issueCodes: codes(v),
  })));
  const coverage = coverageDiagnostics(views.map((v): CoverageCallInput => ({
    rowId: v.rowId,
    truthPresentFamilies: [...v.rec.row.truth.presentHazardFamilies],
    deterministicFamilies: [...(v.rec.deterministicFamiliesEmitted ?? [])],
    acceptedExpertFamilies: cands(v).map(c => String(c.hazardFamily)),
  })));
  const linkage = linkageDiagnostics(present.map((v): LinkageCallInput => ({
    rowId: v.rowId,
    expectation: 'NOT_A_LINKAGE_TEST',
    emittedCandidateKeys: cands(v).map(c => String(c.candidateKey)),
    emittedClarifications: clar(v).map(c => ({
      clarificationId: String(c.clarificationId),
      relatesToCandidateKey: (c.relatesToCandidateKey as string | null) ?? null })),
    issueCodes: codes(v),
  })));
  // ---- §153 PHASE 5. RAW LINKAGE, computed from the wire BEFORE normalization stripped anything.
  //
  // §148 reported INVALID_LINKAGE_ATTEMPTS = 0 on the very row that made an invalid attempt, because
  // that counter reads the VALIDATED analysis and the key had already been removed. The four figures
  // are reported SEPARATELY and reconciled; nothing here is collapsed into a single number, and no
  // historical run is back-inferred — a call with no captured wire yields null, never zero.
  const rawLinkage = rawLinkageDiagnostics(present.map((v): RawLinkageCallInput => ({
    rowId: v.rowId,
    wire: wireClarifications.has(v.rowId)
      ? { clarifications: (wireClarifications.get(v.rowId) ?? [])
            .map(w => ({ clarificationId: w.clarificationId,
                         relatesToCandidateKey: w.relatesToCandidateKey })),
          candidates: (wireCandidates.get(v.rowId) ?? [])
            .map(c => ({ candidateKey: c.candidateKey })) }
      : null,
    normalizedClarifications: clar(v).map(c => ({
      relatesToCandidateKey: (c.relatesToCandidateKey as string | null) ?? null })),
    issueCodes: codes(v),
  })));

  // ---- §153 THE affectedDecision / HAZARD_SEVERITY PACKET. THE CENTRAL MEASUREMENT.
  //
  // For EVERY emitted clarification: the question, the label the model chose, the label the row
  // expects, the linked candidate and its state, and the row's acceptable selectors. A human decides
  // which label the question actually warrants -- the script computes NONE of that, because deciding
  // what a question turns on is semantic judgement and §148 measured what a keyword rule does with
  // one: in sample it looked perfect, and out of sample an adverb produced the deleting label.
  //
  // TWO things ARE computed, because both are arithmetic: how often HAZARD_SEVERITY was selected,
  // and the raw emitted-vs-expected pairs on REQUIRED rows. Neither decides correctness.
  const labelPacket = present.flatMap(v => {
    const wc = wireCandidates.get(v.rowId) ?? [];
    const stateOfKey = (k: string | null) => k === null ? null
      : wc.find(c => c.candidateKey === k)?.assertedConditionState ?? 'UNRESOLVED';
    return (wireClarifications.get(v.rowId) ?? []).map(w => ({
      rowId: v.rowId,
      form: v.fx.form,
      expectation: v.fx.expectation.kind,
      hazardEstablished: v.fx.hazardEstablished,
      question: w.question,
      emittedAffectedDecision: w.affectedDecision,
      expectedAffectedDecision: isRequired(v.fx)
        ? String(reqTruth(v.fx).affectedDecision) : 'NONE_OWED',
      acceptableSelectors: isRequired(v.fx)
        ? (reqTruth(v.fx).acceptableSelectors as unknown as string[]) : [],
      evidenceGap: w.evidenceGap,
      whyItMatters: w.whyItMatters,
      relatesToCandidateKey: w.relatesToCandidateKey,
      linkedCandidateState: stateOfKey(w.relatesToCandidateKey),
      candidateStates: wc.map(c => `${c.candidateKey}=${c.assertedConditionState}`),
      delivered: clar(v).some(c => String(c.clarificationId) === w.clarificationId
        || String(c.question) === w.question),
      ADJUDICATION: 'HUMAN_REQUIRED — what decision does the ANSWER change? Is the emitted label '
        + 'that decision? Is another member equally valid?',
    }));
  });

  // Arithmetic only. Correctness is adjudicated, never computed.
  const hazardSeverityUses = labelPacket.filter(x =>
    x.emittedAffectedDecision === 'HAZARD_SEVERITY');
  const labelPairsOnRequired = labelPacket
    .filter(x => x.expectation === 'REQUIRED')
    .map(x => ({ rowId: x.rowId, emitted: x.emittedAffectedDecision,
      expected: x.expectedAffectedDecision,
      exact: x.emittedAffectedDecision === x.expectedAffectedDecision }));
  const labelExact = labelPairsOnRequired.filter(x => x.exact).length;

  // The raw emitted-vs-expected confusion counts, on REQUIRED rows where an expectation exists.
  const confusion: Record<string, Record<string, number>> = {};
  for (const x of labelPairsOnRequired) {
    confusion[x.expected] = confusion[x.expected] ?? {};
    confusion[x.expected][x.emitted] = (confusion[x.expected][x.emitted] ?? 0) + 1;
  }

  // ---- RETAINED-BUT-NOT-ASKED, carried forward from §150 as a regression axis rather than the
  // subject. The screening signal is arithmetic; the verdict is not.
  const retentionSignalRows = present
    .filter(v => isRequired(v.fx))
    .map(v => {
      const wc = wireCandidates.get(v.rowId) ?? [];
      const signals = wc.filter(c => c.assertedConditionState === 'INSUFFICIENT_EVIDENCE'
        || c.assertedConditionState === 'UNKNOWN');
      return { rowId: v.rowId, form: v.fx.form,
        RETENTION_SIGNALS: signals.length,
        signalKeys: signals.map(c => c.candidateKey),
        clarificationDelivered: clar(v).length > 0,
        candidateProse: wc.map(c => ({ candidateKey: c.candidateKey,
          state: c.assertedConditionState, evidenceBasis: c.evidenceBasis, reasoning: c.reasoning })),
        uncertainty: wireUncertainty.get(v.rowId) ?? [],
        summary: wireSummary.get(v.rowId) ?? '',
        VERDICT: 'HUMAN_REQUIRED — does the output hold a decision-critical fact OPEN with no '
          + 'clarification carrying it?' };
    })
    .filter(r => r.RETENTION_SIGNALS > 0 || !r.clarificationDelivered);

  // The unsupported-settlement axis is CARRIED FORWARD as a regression check, not re-litigated:
  // §149 closed it at 0/10 and §153 must not reopen it.
  const settlementRegression = present.map(v => ({
    rowId: v.rowId,
    candidateProse: (wireCandidates.get(v.rowId) ?? []).map(c =>
      ({ candidateKey: c.candidateKey, state: c.assertedConditionState,
         quotedEvidence: c.quotedEvidence, evidenceBasis: c.evidenceBasis, reasoning: c.reasoning })),
    summary: wireSummary.get(v.rowId) ?? '',
    VERDICT: 'HUMAN_ADJUDICATION_REQUIRED — did the model promote an unobserved fact to an '
      + 'affirmative state? §149 measured 0/10 and this is the regression check.',
  }));

  // ---- THE CANDIDATE NON-SUPPRESSION AXIS. §153 must not buy silence with lost hazards, so the
  // rows that establish a hazard are checked for one having been raised at all.
  const suppressedHazardRows = present
    .filter(v => v.fx.hazardEstablished && cands(v).length === 0)
    .map(v => v.rowId);

  const forbiddenFamilyEmitted = present.flatMap(v =>
    cands(v).filter(c => v.rec.row.truth.forbiddenHazardFamilies.includes(String(c.hazardFamily)))
      .map(c => `${v.rowId}:${String(c.hazardFamily)}`));
  const protectedContradictions = present.flatMap(v =>
    codes(v).filter(c => c === 'DISAGREEMENT_SURFACE_NOT_CHALLENGEABLE')
      .map(c => `${v.rowId}:${c}`));

  // ---- The citation scan the captured wire owes, exactly like every other artifact.
  const wireCitationHits = [...wireClarifications.values()].flat()
    .flatMap(w => strings(w)).filter(s => CITATION_SHAPED_PATTERN.test(s)).length;

  // ---- adjudication packet. EVERY EMITTED QUESTION, INCLUDING THE DESTROYED ONES.
  const adjudication: string[][] = [
    ['rowId', 'form', 'hazardEstablished', 'expectation', 'authoredMissingFact',
      'expectedAffectedDecision', 'acceptableSelectors',
      'emittedQuestion', 'emittedAffectedDecision', 'survived', 'emittedEvidenceGap',
      'emittedWhyItMatters', 'relatesToCandidateKey', 'namedCandidateState', 'issueCodes',
      'candidateStates', 'candidateEvidenceBasis', 'candidateReasoning', 'explanationSummary',
      'uncertaintyStatements'],
  ];
  for (const v of views) {
    const t = isRequired(v.fx) ? reqTruth(v.fx) : null;
    const base = [v.rowId, v.fx.form, String(v.fx.hazardEstablished), v.fx.expectation.kind,
      t ? String(t.missingFact) : (v.fx.expectation as unknown as
        { truth: { temptingQuestion: string } }).truth.temptingQuestion,
      t ? String(t.affectedDecision) : 'NONE_OWED',
      t ? (t.acceptableSelectors as unknown as string[]).join('  ||  ') : ''];
    const wc = wireCandidates.get(v.rowId) ?? [];
    const candStates = wc.map(c => `${c.candidateKey}=${c.assertedConditionState}`).join(' | ');
    const candBasis = wc.map(c => `[${c.candidateKey}] ${c.evidenceBasis}`).join('  ||  ');
    const candReasoning = wc.map(c => `[${c.candidateKey}] ${c.reasoning}`).join('  ||  ');
    const summary = String(v.call.analysis?.expertExplanation?.summary ?? '');
    const unc = (v.call.analysis?.uncertainty?.statements ?? []).join(' | ');
    const keptIds = new Set(clar(v).map(c => String(c.clarificationId)));
    const keptQuestions = new Set(clar(v).map(c => String(c.question)));
    const emitted = wireOf(v);
    const stateOf = (key: string | null) => key === null ? ''
      : (wireCandidates.get(v.rowId) ?? []).find(c => c.candidateKey === key)
        ?.assertedConditionState ?? 'UNRESOLVED';
    if (emitted.length === 0) {
      adjudication.push([...base, '(none emitted)', '', '', '', '', '', '',
        codes(v).join(' '), candStates, candBasis, candReasoning, summary, unc]);
    } else {
      for (const w of emitted) {
        const survived = keptIds.has(w.clarificationId) || keptQuestions.has(w.question);
        adjudication.push([...base, w.question, w.affectedDecision,
          survived ? 'SURVIVED' : 'DESTROYED', w.evidenceGap, w.whyItMatters,
          w.relatesToCandidateKey ?? '', stateOf(w.relatesToCandidateKey),
          codes(v).join(' '), candStates, candBasis, candReasoning, summary, unc]);
      }
    }
  }

  const results0RequiredSilent = requiredViews.filter(v => clar(v).length === 0).map(v => v.rowId);
  const results = {
    operation: '§153 bounded hosted clarification retention-bridge probe',
    isFormalEvaluation: false, historicalProviderInvocationCount: HISTORICAL_PROVIDER_INVOCATION_COUNT,
    startedAt: runFacts.startedAt, finishedAt: runFacts.finishedAt,
    stopReason: runFacts.stopReason, identityViolation: runFacts.identityViolation,
    accounting: runFacts.accounting, retryCauses: runFacts.retryCauses,
    retriesSuppressed: runFacts.retriesSuppressed,
    providerInvocationsThisProcess: runFacts.providerInvocations,
    identity: { provider: BOUND_PROVIDER, model: cfg.model,
      promptVersion: identity.promptVersion,
      systemPromptSha256: identity.systemPromptSha256,
      wireSchemaSha256: identity.wireSchemaSha256,
      analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION },
    persistence: { recordsOnDisk: back.records.length, parseProblems: back.problems,
      completenessProblems: completeness, midRunReadBackProof: readBackProof },
    callDisposition: {
      present: present.length,
      outputRejected: views.filter(v => v.call.layerStatus === 'OUTPUT_REJECTED').length,
      providerFailed: views.filter(v => v.call.layerStatus === 'PROVIDER_FAILED').length,
    },
    rejectionDiagnostics: views.filter(v => v.call.layerStatus === 'OUTPUT_REJECTED')
      .map(v => ({ rowId: v.rowId, issues: v.call.issues })),
    clarification: {
      REQUIRED_ROWS: requiredViews.length,
      REQUIRED_ROWS_THAT_SPOKE_LOOSE: requiredSpoke.length,
      REQUIRED_ROWS_SILENT: requiredViews.length - requiredSpoke.length,
      REQUIRED_SILENT_ROW_IDS: requiredViews.filter(v => clar(v).length === 0).map(v => v.rowId),
      FORBIDDEN_ROWS: forbiddenViews.length,
      FORBIDDEN_ROWS_SILENT: forbiddenSilent.length,
      FORBIDDEN_ROWS_THAT_SPOKE: forbiddenViews.filter(v => clar(v).length > 0)
        .map(v => ({ rowId: v.rowId, form: v.fx.form,
          questions: clar(v).map(c => String(c.question)) })),
      TOTAL_CLARIFICATIONS_DELIVERED: present.reduce((t, v) => t + clar(v).length, 0),
      TOTAL_CLARIFICATIONS_EMITTED_ON_THE_WIRE: present.reduce((t, v) => t + wireOf(v).length, 0),
      CLARIFICATIONS_PER_CALL: present.length === 0 ? 0
        : Number((present.reduce((t, v) => t + clar(v).length, 0) / present.length).toFixed(3)),
      INVALID_CLARIFICATION_OBJECTS: invalidObjects,
      STRICT_RECALL: 'NOT_COMPUTED_BY_SCRIPT — adjudicate from CLARIFICATION-ADJUDICATION.csv; a '
        + 'semantically different question is not recall, and a DESTROYED question is not delivered',
    },
    // ---- THE §153 MEASURES. Reported separately, exactly as the authorization requires.
    affectedDecisionRouting: {
      REASONED_BUT_DESTROYED_COUNT: destroyed.length,
      REASONED_BUT_DESTROYED: destroyed,
      SURVIVAL_DENOMINATOR_REQUIRED_ROWS: survivalDenominator,
      SURVIVAL_LOST_ON_REQUIRED_ROWS: survivalLost,
      AFFECTED_DECISION_SURVIVAL: survivalDenominator === 0 ? null
        : Number(((survivalDenominator - survivalLost) / survivalDenominator).toFixed(4)),
      TRUE_CONTRADICTIONS_EMITTED: trueContradictions,
      TRUE_CONTRADICTIONS_REJECTED: trueContradictionsRejected.length,
      TRUE_CONTRADICTION_REJECTION: trueContradictions.length === 0 ? null
        : Number((trueContradictionsRejected.length / trueContradictions.length).toFixed(4)),
      ARBITRATION_EVENTS: linkage.ARBITRATION_EVENTS,
      LABEL_EXACT_MATCH_ON_REQUIRED_ROWS: `${labelled.filter(x => x.emitted === x.authored).length}`
        + `/${labelled.length}`,
      LABEL_HAZARD_EXISTENCE_ON_ESTABLISHED_HAZARD_ROWS: labelExistenceOnActiveRow,
      NOTE: 'A drop whose emitted label was HAZARD_EXISTENCE beside the model\'s own ACTIVE '
        + 'candidate is CORRECT arbitration and a ROUTING failure. It is never recorded as an '
        + 'arbitration defect, and it never counts as delivered recall.',
      REALIZED_CONTRADICTION_NOTE: trueContradictions.length === 0
        ? 'NOT_EXERCISED — denominator 0. A realized contradiction requires the MODEL to emit '
          + 'HAZARD_EXISTENCE naming its own ACTIVE candidate, which v12 tells it not to do. It '
          + 'cannot be commissioned. The rejection PROPERTY is proved deterministically against the '
          + 'real normalizer in test-expert-unsupported-settlement.ts (N.4). This is NOT reported '
          + 'as 100%.'
        : 'REALIZED — see TRUE_CONTRADICTIONS_EMITTED and TRUE_CONTRADICTIONS_REJECTED.',
    },
    // ---- §153 PHASE 5. Four figures, reported separately and reconciled. Never collapsed.
    rawLinkage: {
      instrumentVersion: RAW_LINKAGE_DIAGNOSTICS_VERSION,
      RAW_LINKAGE_ATTEMPTS: rawLinkage.RAW_LINKAGE_ATTEMPTS,
      RAW_INVALID_LINKAGE_ATTEMPTS: rawLinkage.RAW_INVALID_LINKAGE_ATTEMPTS,
      NORMALIZED_VALID_LINKAGES: rawLinkage.NORMALIZED_VALID_LINKAGES,
      STRIPPED_INVALID_LINKAGES: rawLinkage.STRIPPED_INVALID_LINKAGES,
      ACCEPTED_INVALID_LINKAGES: linkage.INVALID_LINKAGE_ATTEMPTS,
      rawCaptureAvailable: rawLinkage.rawCaptureAvailable,
      reconciled: rawLinkage.reconciled,
      reconciliationDetail: rawLinkage.reconciliationDetail,
      perRow: rawLinkage.perRow.filter(r => (r.rawAttempts ?? 0) > 0 || r.stripped > 0),
      NOTE: 'Computed from the captured wire BEFORE normalization stripped anything. The §148 '
        + 'blind spot was that INVALID_LINKAGE_ATTEMPTS reads the VALIDATED analysis, from which a '
        + 'broken key has already been removed. Historical runs have no captured wire and are NOT '
        + 'back-inferred; §141-§148 metrics are unchanged.',
    },
    // ---- §153 THE RETENTION-BRIDGE MEASURES. Assembled, never scored.
    // ---- §153 THE CENTRAL MEASUREMENT. Arithmetic computed; correctness adjudicated.
    affectedDecisionBaseline: {
      TOTAL_CLARIFICATIONS_LABELLED: labelPacket.length,
      HAZARD_SEVERITY_USAGE_COUNT: hazardSeverityUses.length,
      HAZARD_SEVERITY_USAGE_RATE: labelPacket.length === 0 ? null
        : Number((hazardSeverityUses.length / labelPacket.length).toFixed(4)),
      HAZARD_SEVERITY_CORRECT_COUNT: 'NOT_COMPUTED_BY_SCRIPT — adjudicate each entry of '
        + 'adjudication[] by asking what decision the ANSWER changes. §151 measured 0 correct of 7 '
        + 'across three probes; this run is the test of that on hardened material.',
      HAZARD_SEVERITY_INCORRECT_COUNT: 'NOT_COMPUTED_BY_SCRIPT — see above.',
      HAZARD_SEVERITY_FALSE_SELECTION_RATE: 'NOT_COMPUTED_BY_SCRIPT — derived from the adjudicated '
        + 'correct/incorrect counts, never from a keyword rule.',
      LABEL_EXACT_MATCH_ON_REQUIRED_ROWS: `${labelExact}/${labelPairsOnRequired.length}`,
      EMITTED_VS_EXPECTED_CONFUSION: confusion,
      CONFUSION_NOTE: 'Raw emitted-vs-expected counts on REQUIRED rows only. A cell is a '
        + 'DISAGREEMENT, not automatically a model error — §151 re-derived every expected label and '
        + 'found them all correct, but that adjudication must be redone here, not assumed.',
      LABEL_USAGE_BY_MEMBER: labelPacket.reduce((acc: Record<string, number>, x) => {
        acc[x.emittedAffectedDecision] = (acc[x.emittedAffectedDecision] ?? 0) + 1; return acc; },
        {} as Record<string, number>),
      V14_FALSIFIER: 'APPLY BEFORE INTERPRETING. §151 predicts v13 disproportionately selects '
        + 'HAZARD_SEVERITY when the missing fact governs another decision category. Recurrence on '
        + 'authoring-valid hardened rows SUPPORTS the diagnosis; absence WEAKENS or FALSIFIES it. '
        + 'Do NOT implement v14 automatically either way.',
      adjudication: labelPacket,
    },
    retentionRegression: {
      RETAINED_BUT_NOT_ASKED: 'NOT_COMPUTED_BY_SCRIPT — adjudicate the rows below against the '
        + 'model\'s own candidate states, reasoning, uncertainty and summary.',
      REQUIRED_ROWS_SILENT: results0RequiredSilent,
      RETENTION_SIGNALS_TOTAL: retentionSignalRows.reduce((t, r) => t + r.RETENTION_SIGNALS, 0),
      RETENTION_SIGNALS_NOTE: 'Candidates left INSUFFICIENT_EVIDENCE or UNKNOWN on REQUIRED rows. A '
        + 'SCREENING AID ONLY, never a gate: §149 measured this signal on 5 rows, all REQUIRED, and '
        + '4 of those 5 emitted the clarification anyway, so it predicts neither direction alone.',
      rows: retentionSignalRows,
    },
    unsupportedSettlementRegression: {
      UNSUPPORTED_SETTLEMENT_COUNT: 'NOT_COMPUTED_BY_SCRIPT — §149 closed this at 0/10 and this is '
        + 'the REGRESSION check, not a re-litigation. Adjudicate whether any row promoted an '
        + 'unobserved fact to an affirmative state.',
      CANDIDATE_SUPPRESSION_ROWS: suppressedHazardRows,
      CANDIDATE_SUPPRESSION_NOTE: '§153 must not buy questions by suppressing hazards, nor silence '
        + 'by suppressing them. These are rows whose text establishes a hazard and where the model '
        + 'raised NO candidate at all.',
      perRow: settlementRegression,
    },
    regression: {
      citation, coverage, linkage,
      FORBIDDEN_FAMILY_CANDIDATES_EMITTED: forbiddenFamilyEmitted,
      PROTECTED_AUTHORITY_CONTRADICTIONS: protectedContradictions.length,
      TOTAL_CANDIDATES: present.reduce((t, v) => t + cands(v).length, 0),
      RAW_WIRE_CITATION_HITS: wireCitationHits,
    },
    frozenGates: HARDENED_SET_GATES,
    budget: { targetLogicalCalls: B.targetLogicalCalls,
      hardProviderRequestCeiling: B.hardProviderRequestCeiling,
      enforcedSpendCeilingUsd: Number(SPEND_CEILING_USD.toFixed(6)) },
    gate,
  };

  // ---- §153 PHASE 8. THE FIXTURE MUST BE BYTE-IDENTICAL TO ITS PRE-SPEND STATE. §151 found four
  //      answer-key defects, all in the model's favour, so a post-hoc edit after seeing output is the
  //      exact failure this check exists to make impossible.
  const postDigest = createHash('sha256').update(JSON.stringify(
    [...fx].map(f => ({ id: f.row.source.rowId, form: f.form, obs: f.row.source.observation,
      allowed: f.row.source.allowedHazardFamilies, truth: f.row.truth,
      records: f.row.source.governedStandards.map(g => g.citation),
      expectation: f.expectation, denominators: f.denominators,
      review: f.review.map(x => [x.claim, x.note]) }))
      .sort((a, b) => a.id.localeCompare(b.id)))).digest('hex');
  const postFileSha = createHash('sha256')
    .update(readFileSync(join(ROOT, FIXTURES))).digest('hex');
  const postLint = lintFixtureSet(fx.map(lintable), {
    canonicalFamilies: [...CANONICAL_DETERMINISTIC_FAMILIES],
    declaredDenominators: ['STRICT_REQUIRED_RECALL', 'FORBIDDEN_SILENCE', 'RETAINED_BUT_NOT_ASKED',
      'UNSUPPORTED_SETTLEMENT', 'AFFECTED_DECISION_ACCURACY'],
  });
  const instrumentIntegrity = {
    setDigestBefore: EXPECTED_SET_DIGEST,
    setDigestAfter: postDigest,
    setDigestUnchanged: postDigest === EXPECTED_SET_DIGEST,
    fixtureFileShaBefore: fixtureFileSha,
    fixtureFileShaAfter: postFileSha,
    fixtureFileUnchanged: postFileSha === fixtureFileSha,
    linterPassedAfter: postLint.passed,
    linterFindingsAfter: postLint.findings,
    NOTE: 'NO FIXTURE WAS MODIFIED AFTER THE FIRST PROVIDER REQUEST. Verified two ways — the row '
      + 'digest, which covers the signatures, and the raw file hash.',
  };
  console.log(`\n  instrument integrity     digest ${instrumentIntegrity.setDigestUnchanged}`
    + `   file ${instrumentIntegrity.fixtureFileUnchanged}`
    + `   lint ${instrumentIntegrity.linterPassedAfter}`);

  // ================================================================ §153 MEASUREMENT LAYER
  // ---- 1. DEGENERATE OUTPUT. Applied AFTER the run and BEFORE semantic scoring, exactly as the
  //         authorization requires, and it authorizes nothing.
  const degenerate = degenerateOutputReport(rows.map((r): DegenerateCheckInput => ({
    rowId: r.source.rowId,
    candidates: (wireCandidates.get(r.source.rowId) ?? []) as never,
    clarifications: (wireClarifications.get(r.source.rowId) ?? []) as never,
    summary: wireSummary.get(r.source.rowId),
    uncertainty: wireUncertainty.get(r.source.rowId),
  })));

  // ---- 2. THE THREE VIEWS. Never collapsed, never substituted for one another.
  const preRequired: string[] = sidecar?.preregisteredDenominators?.PRIMARY_REQUIRED ?? [];
  const preForbidden: string[] = sidecar?.preregisteredDenominators?.PRIMARY_FORBIDDEN ?? [];
  const spoke = (id: string) => (clar(present.find(v => v.rowId === id)!) ?? []).length > 0;
  const inRun = (id: string) => present.some(v => v.rowId === id);
  const view = (reqIds: string[], forbIds: string[]) => ({
    requiredDenominator: reqIds.filter(inRun).length,
    requiredSpoke: reqIds.filter(id => inRun(id) && spoke(id)).length,
    requiredSilent: reqIds.filter(id => inRun(id) && !spoke(id)),
    forbiddenDenominator: forbIds.filter(inRun).length,
    forbiddenSilent: forbIds.filter(id => inRun(id) && !spoke(id)).length,
    forbiddenSpoke: forbIds.filter(id => inRun(id) && spoke(id)),
  });
  const allReq = fx.filter(isRequired).map(f => f.row.source.rowId);
  const allForb = fx.filter(f => !isRequired(f)).map(f => f.row.source.rowId);
  const degen = new Set(degenerate.DEGENERATE_ROW_IDS);
  const threeViews = {
    A_LITERAL: view(allReq, allForb),
    B_PREREGISTERED_ADJUDICATED: view(preRequired, preForbidden),
    C_EXECUTION_VALID: view(preRequired.filter(id => !degen.has(id)),
                            preForbidden.filter(id => !degen.has(id))),
    NOTE: 'A = every authored v9 row as frozen. B = A minus the PRE-SPEND sidecar exclusions '
      + '(HS-F1 fixture-confounded, HS-M1 fixture-defect). C = B minus only rows the degenerate '
      + 'detector condemned in THIS replicate. THE THREE ARE REPORTED SEPARATELY AND NEVER '
      + 'SUBSTITUTED FOR ONE ANOTHER. LOOSE counts only; STRICT recall is adjudicated by a human.',
  };

  // ---- 3. ROW-BY-ROW REPLICATE COMPARISON against §152.
  const r1wire: Record<string, { candidates: Array<{ candidateKey: string; hazardFamily: string;
    assertedConditionState: string }>; clarifications: Array<{ question: string;
    affectedDecision: string; relatesToCandidateKey: string | null }> }> = {};
  for (const line of readFileSync(join(R1_DIR, 'RAW-WIRE.jsonl'), 'utf8').trim().split('\n')) {
    const o = JSON.parse(line) as { rowId: string; candidates: never[]; clarifications: never[] };
    r1wire[o.rowId] = { candidates: o.candidates, clarifications: o.clarifications };
  }
  const replicateRows = rows.map(r => {
    const id = r.source.rowId;
    const a = r1wire[id] ?? { candidates: [], clarifications: [] };
    const b = { candidates: wireCandidates.get(id) ?? [],
      clarifications: wireClarifications.get(id) ?? [] };
    const clarPresence = (a.clarifications.length > 0) === (b.clarifications.length > 0);
    const labelsA = a.clarifications.map(c => c.affectedDecision).sort().join(',');
    const labelsB = b.clarifications.map(c => c.affectedDecision).sort().join(',');
    const statesA = a.candidates.map(c => c.assertedConditionState).sort().join(',');
    const statesB = b.candidates.map(c => c.assertedConditionState).sort().join(',');
    const famA = a.candidates.map(c => c.hazardFamily).sort().join(',');
    const famB = b.candidates.map(c => c.hazardFamily).sort().join(',');
    const linkA = a.clarifications.filter(c => c.relatesToCandidateKey).length;
    const linkB = b.clarifications.filter(c => c.relatesToCandidateKey).length;
    return { rowId: id,
      r1: { candidates: a.candidates.length, clarifications: a.clarifications.length,
        labels: labelsA, states: statesA, families: famA, links: linkA },
      r2: { candidates: b.candidates.length, clarifications: b.clarifications.length,
        labels: labelsB, states: statesB, families: famB, links: linkB },
      clarificationPresenceAgrees: clarPresence,
      affectedDecisionAgrees: labelsA === labelsB,
      candidateStateAgrees: statesA === statesB,
      candidateFamilyAgrees: famA === famB,
      linkageAgrees: linkA === linkB,
      fullyStable: clarPresence && labelsA === labelsB && statesA === statesB && famA === famB
        && linkA === linkB,
      QUESTION_SEMANTICS: 'HUMAN_REQUIRED — see CLARIFICATION-ADJUDICATION.csv and the §152 CSV',
    };
  });
  const agree = replicateRows.filter(r => r.fullyStable).length;
  const twoReplicateStability = {
    REPLICATE_ROW_AGREEMENT_COUNT: agree,
    REPLICATE_ROW_DISAGREEMENT_COUNT: replicateRows.length - agree,
    CLARIFICATION_PRESENCE_AGREEMENT:
      `${replicateRows.filter(r => r.clarificationPresenceAgrees).length}/${replicateRows.length}`,
    AFFECTED_DECISION_AGREEMENT:
      `${replicateRows.filter(r => r.affectedDecisionAgrees).length}/${replicateRows.length}`,
    CANDIDATE_STATE_AGREEMENT:
      `${replicateRows.filter(r => r.candidateStateAgrees).length}/${replicateRows.length}`,
    CANDIDATE_FAMILY_AGREEMENT:
      `${replicateRows.filter(r => r.candidateFamilyAgrees).length}/${replicateRows.length}`,
    LINKAGE_AGREEMENT: `${replicateRows.filter(r => r.linkageAgrees).length}/${replicateRows.length}`,
    stableRows: replicateRows.filter(r => r.fullyStable).map(r => r.rowId),
    variableRows: replicateRows.filter(r => !r.fullyStable).map(r => r.rowId),
    LABEL: 'TWO-REPLICATE RUN-TO-RUN STABILITY EVIDENCE',
    NOT_A_POPULATION_ESTIMATE: 'ONLY TWO NONDETERMINISTIC EXECUTIONS EXIST. This is not a variance '
      + 'estimate, a distribution, or a reproducibility claim. It is two draws.',
    perRow: replicateRows,
  };

  // ---- 4. COVERAGE, recomputed with the honest map beside the raw figure.
  const covRows = views.map(v => ({ rowId: v.rowId,
    truthPresent: [...v.rec.row.truth.presentHazardFamilies],
    deterministicEmitted: [...(v.rec.deterministicFamiliesEmitted ?? [])],
    expertEmitted: cands(v).map(c => String(c.hazardFamily)) }));
  const mappedCoverage = unionCoverage(covRows);

  console.log(`\n  degenerate rows          ${degenerate.DEGENERATE_ROW_IDS.length}`
    + `   ${degenerate.DEGENERATE_ROW_IDS.join(' ') || 'none'}`
    + `   suspects ${degenerate.SUSPECT_ROW_IDS.join(' ') || 'none'}`);
  console.log(`  view A literal           REQ spoke ${threeViews.A_LITERAL.requiredSpoke}`
    + `/${threeViews.A_LITERAL.requiredDenominator}`
    + `   FORB silent ${threeViews.A_LITERAL.forbiddenSilent}`
    + `/${threeViews.A_LITERAL.forbiddenDenominator}`);
  console.log(`  view B preregistered     REQ spoke ${threeViews.B_PREREGISTERED_ADJUDICATED.requiredSpoke}`
    + `/${threeViews.B_PREREGISTERED_ADJUDICATED.requiredDenominator}`
    + `   FORB silent ${threeViews.B_PREREGISTERED_ADJUDICATED.forbiddenSilent}`
    + `/${threeViews.B_PREREGISTERED_ADJUDICATED.forbiddenDenominator}`);
  console.log(`  view C execution-valid   REQ spoke ${threeViews.C_EXECUTION_VALID.requiredSpoke}`
    + `/${threeViews.C_EXECUTION_VALID.requiredDenominator}`
    + `   FORB silent ${threeViews.C_EXECUTION_VALID.forbiddenSilent}`
    + `/${threeViews.C_EXECUTION_VALID.forbiddenDenominator}`);
  console.log(`  replicate agreement      ${agree}/${replicateRows.length} rows fully stable`
    + `   variable: ${twoReplicateStability.variableRows.join(' ') || 'none'}`);
  console.log(`  coverage (mapped)        ${mappedCoverage.coveredByEither}`
    + `/${mappedCoverage.truthPresentTotal}`);

  writeFileSync(join(OUT, 'RESULTS-SUMMARY.json'),
    JSON.stringify({ ...results, instrumentIntegrity,
      measurementLayer: {
        sidecarSha256: sidecarSha,
        degenerateDetectorVersion: DEGENERATE_DETECTOR_VERSION,
        familyMapVersion: FAMILY_COMPARISON_MAP_VERSION,
        degenerateOutput: degenerate,
        threeViews,
        twoReplicateStability,
        mappedCoverage,
      } }, null, 1) + '\n');
  writeFileSync(join(OUT, 'CLARIFICATION-ADJUDICATION.csv'), csv(adjudication));
  writeFileSync(join(OUT, 'FIXTURE-MANIFEST.json'), JSON.stringify({
    fixtureSetVersion: HARDENED_SET_VERSION,
    fixtureFileSha256: sha256File(join(ROOT, FIXTURES)),
    rows: fx.map(f => ({ rowId: f.row.source.rowId, domain: f.domain,
      form: f.form, hazardEstablished: f.hazardEstablished,
      review: f.review, denominators: f.denominators,
      expectedToFailUnderV13: f.expectedToFailUnderV13 ?? null,
      expectation: f.expectation.kind,
      caseClasses: classifyRow(f.row), truth: f.row.truth, expected: f.expectation })),
  }, null, 1) + '\n');
  writeFileSync(join(OUT, 'ATTEMPT-LEDGER.json'), JSON.stringify({
    perCall: views.map(v => ({ rowId: v.rowId, layerStatus: v.call.layerStatus,
      attempts: v.call.attempts, latencyMs: v.call.latencyMs, costUsd: v.call.costUsd,
      inputTokens: v.call.inputTokens, outputTokens: v.call.outputTokens,
      modelIdentity: v.call.modelIdentity, issues: v.call.issues,
      retrySuppressed: v.call.retrySuppressed })),
  }, null, 1) + '\n');

  console.log(`\n  artifacts -> ${OUT.replace(ROOT + '/', '')}`);
  console.log(`  REQUIRED spoke (LOOSE)   ${requiredSpoke.length}/${requiredViews.length}`
    + `   silent: ${results.clarification.REQUIRED_SILENT_ROW_IDS.join(' ') || 'none'}`);
  console.log(`  FORBIDDEN silent         ${forbiddenSilent.length}/${forbiddenViews.length}`
    + `   spoke: ${results.clarification.FORBIDDEN_ROWS_THAT_SPOKE.map(x => x.rowId).join(' ') || 'none'}`);
  console.log(`  emitted on the wire      ${results.clarification.TOTAL_CLARIFICATIONS_EMITTED_ON_THE_WIRE}`
    + `   delivered ${results.clarification.TOTAL_CLARIFICATIONS_DELIVERED}`);
  console.log(`  reasoned but DESTROYED   ${destroyed.length}`
    + `   ${destroyed.map(d => `${d.rowId}(${d.affectedDecision})`).join(' ')}`);
  console.log(`  affectedDecision surv.   ${results.affectedDecisionRouting.AFFECTED_DECISION_SURVIVAL}`
    + `   (${survivalDenominator - survivalLost}/${survivalDenominator} on REQUIRED rows)`);
  console.log(`  true contradictions      ${trueContradictions.length} emitted, `
    + `${trueContradictionsRejected.length} rejected`);
  console.log(`  arbitration events       ${linkage.ARBITRATION_EVENTS}`);
  console.log(`  RAW linkage attempts     ${rawLinkage.RAW_LINKAGE_ATTEMPTS}`
    + `   invalid ${rawLinkage.RAW_INVALID_LINKAGE_ATTEMPTS}`
    + `   normalized-valid ${rawLinkage.NORMALIZED_VALID_LINKAGES}`
    + `   stripped ${rawLinkage.STRIPPED_INVALID_LINKAGES}`);
  console.log(`  RAW linkage reconciled   ${rawLinkage.reconciled}`);
  console.log(`  candidate suppression    ${suppressedHazardRows.length}`
    + `   ${suppressedHazardRows.join(' ')}`);
  console.log(`  retention signals (REQ)  `
    + `${retentionSignalRows.reduce((t, r) => t + r.RETENTION_SIGNALS, 0)}`
    + `   (screening aid only, never a gate)`);
  console.log(`  labelled clarifications  ${labelPacket.length}`);
  console.log(`  HAZARD_SEVERITY used     ${hazardSeverityUses.length}`
    + `   ${hazardSeverityUses.map(x => x.rowId).join(' ')}`);
  console.log(`  label usage by member    `
    + Object.entries(labelPacket.reduce((a: Record<string, number>, x) => {
        a[x.emittedAffectedDecision] = (a[x.emittedAffectedDecision] ?? 0) + 1; return a; },
        {} as Record<string, number>)).map(([k, n]) => `${k}=${n}`).join(' '));
  console.log(`  label exact (REQUIRED)   ${labelExact}/${labelPairsOnRequired.length}`);
  console.log(`  label exact (REQUIRED)   ${labelExact}/${labelled.length}`);
  console.log(`  invalid objects          ${invalidObjects.length}`);
  console.log(`  citations acc/merged     ${citation.ACCEPTED_CITATION_COUNT}/${citation.MERGED_CITATION_COUNT}`
    + `   raw-wire hits ${wireCitationHits}`);
  console.log(`  forbidden families       ${forbiddenFamilyEmitted.length}`);
  console.log(`  protected contradictions ${protectedContradictions.length}`);
  console.log(`  invalid linkage          ${linkage.INVALID_LINKAGE_ATTEMPTS}`);
  console.log(`  union coverage           ${coverage.combinedCoveredCount}/${coverage.truthPresentTotal}`);
  console.log('\nSTRICT recall is adjudicated from CLARIFICATION-ADJUDICATION.csv, not by this script.');
})().catch(e => { console.error(e); process.exit(1); });
