/**
 * §149 EXPERT HAZLENZ — BOUNDED HOSTED UNSUPPORTED-SETTLEMENT PROBE.
 *
 * TEN logical calls against a TEN-request ceiling and a $1.50 spend ceiling, ONE arm, ZERO retry
 * headroom, against the prospective v12 contract. It answers ONE question:
 *
 *      Does v12 stop Expert converting ABSENCE OF OBSERVED EVIDENCE into AFFIRMATIVE EVIDENCE OF
 *      ABSENCE, without making it doubt facts the text actually establishes?
 *
 * NOT a formal evaluation. NOT a cohort. NOT an acceptance run. NOT an expanded revalidation. NOT an
 * M14 experiment. The historical formal result is untouched and immutable, and the historical
 * `PROVIDER_INVOCATION_COUNT = 195` is not incremented by anything here.
 *
 * ==================== WHAT THIS SCRIPT REFUSES TO DECIDE ====================
 *
 * It does NOT score the unsupported-settlement gate. Deciding whether a paraphrase asserts a
 * forbidden strengthening is semantic judgement, and §148 measured what happens when a keyword rule
 * is trusted with that class of decision: an adverb produced the deleting label out of sample. So
 * the script EMITS the adjudication material -- for every row, what the text establishes, the
 * affirmative sentence the model must not write, and the model's own `evidenceBasis`, `reasoning`
 * and summary side by side -- and leaves the call to a reader who can see all four. Reporting a
 * settlement count the script invented would be the §140 mistake again.
 *
 * ==================== THE TWO INSTRUMENTS ====================
 *
 * 1. RAW WIRE CAPTURE, carried forward from §148 and EXTENDED to candidate prose. §148 captured only
 *    candidate keys and states; §149 needs `evidenceBasis` and `reasoning` because THAT IS WHERE
 *    TR-E1 CROSSED -- the quote was exact and in-bounds and the field beside it said something
 *    stronger. Development-only decorator around the `ExpertProvider` interface.
 *
 * 2. RAW LINKAGE DIAGNOSTICS -- §149 Phase 5, closing the blind spot §148 disclosed. On TR-C2 the
 *    model declared a key naming no candidate it emitted; the boundary stripped it correctly, and
 *    `INVALID_LINKAGE_ATTEMPTS` reported ZERO because that counter reads the VALIDATED analysis,
 *    from which the key had already been removed. **The metric read the output after the thing it
 *    counts had been removed.** Four numbers are now reported separately and never collapsed:
 *    RAW_LINKAGE_ATTEMPTS, RAW_INVALID_LINKAGE_ATTEMPTS, NORMALIZED_VALID_LINKAGES and
 *    STRIPPED_INVALID_LINKAGES, with an explicit reconciliation.
 *
 *   >>> BOTH ARE DEVELOPMENT-ONLY AND CHANGE NOTHING IN PRODUCTION. `expert-runner.ts`,
 *   >>> `expert-normalization.ts`, arbitration and the customer path are byte-unchanged: a broken
 *   >>> key is still stripped, the question is still kept, the issue is still recorded.
 *   >>> `ExpertNormalizationIssue.offendingText` is NOT widened -- that field is safe only because
 *   >>> every code carrying it is ANALYSIS_FATAL, and `CLARIFICATION_LINK_UNRESOLVED` is not.
 *
 * ==================== WHAT CANNOT BE COMMISSIONED, AND IS SAID SO ====================
 *
 * A REALIZED true contradiction needs the MODEL to emit `HAZARD_EXISTENCE` naming its own ACTIVE
 * candidate -- an error v12 explicitly tells it not to make. §148 built TR-E1 as exactly that
 * temptation and produced none, and arbitration has fired once in the programme across 85 hosted
 * calls. The rejection PROPERTY is deterministic and is proved against the real normalizer in
 * `test-expert-unsupported-settlement.ts` (N.4). Here the denominator is reported as whatever the
 * run produces, and a zero denominator is reported NOT_EXERCISED and never as 100%.
 *
 * ==================== THE SAFETY PROPERTIES, CARRIED FORWARD ====================
 *
 *   - PROSPECTIVE spend enforcement at the frozen worst case, checked BEFORE each request.
 *   - WRITE-ONCE pre-spend identity with no force or overwrite escape, PROVED live before spending.
 *   - A DRY RUN must not consume the write-once identity.
 *   - fsync-backed append-only run records with a MID-RUN read-back from disk.
 *   - The credential is read from the environment and NEVER logged, returned, persisted or
 *     interpolated into any string this script writes.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

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
  UNSUPPORTED_SETTLEMENT_FIXTURES, UNSUPPORTED_SETTLEMENT_ROWS, UNSUPPORTED_SETTLEMENT_BUDGET,
  UNSUPPORTED_SETTLEMENT_GATES, UNSUPPORTED_SETTLEMENT_FIXTURE_SET_VERSION,
  ABSENCE_FORMS, unsupportedFixtureByRowId, type UnsupportedSettlementFixture,
} from '../src/hazlenz/expert-hazlenz/fixtures/unsupported-settlement-probe-v7';
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
const OUT = join(ROOT, 'verification', 'expert-hazlenz-unsupported-settlement-remediation-2026-09-03');

const B = UNSUPPORTED_SETTLEMENT_BUDGET;
const MODEL_PRICED_CEILING = B.hardProviderRequestCeiling * WORST_CASE_REQUEST_USD;
const SPEND_CEILING_USD = Math.min(B.hardSpendCeilingUsd, MODEL_PRICED_CEILING);
const RETRY_BUDGET = B.hardProviderRequestCeiling - B.targetLogicalCalls;
const BOUND_PROVIDER = 'anthropic';
const BOUND_MODEL = 'claude-sonnet-5';
const HISTORICAL_PROVIDER_INVOCATION_COUNT = 195;

const SCRIPT = 'backend/scripts/probe-expert-unsupported-settlement-2026-09-03.ts';
const FIXTURES = 'backend/src/hazlenz/expert-hazlenz/fixtures/unsupported-settlement-probe-v7.ts';
const PROMPT = 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts';
const NORMALIZATION = 'backend/src/hazlenz/expert-hazlenz/expert-normalization.ts';
const CONTRACT_TYPES = 'backend/src/hazlenz/expert-hazlenz/expert-contract.types.ts';

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
  rowId: string; fx: UnsupportedSettlementFixture; call: CallRecord; rec: CohortRunRecord;
}
const isRequired = (f: UnsupportedSettlementFixture) => f.expectation.kind === 'REQUIRED';
const reqTruth = (f: UnsupportedSettlementFixture) =>
  (f.expectation as unknown as { truth: Record<string, string | boolean> }).truth;

/** One clarification as the MODEL sent it, before normalization or arbitration touched it. */
interface WireClarification {
  clarificationId: string; question: string; whyItMatters: string;
  affectedDecision: string; evidenceGap: string; relatesToCandidateKey: string | null;
}
/**
 * A candidate as the MODEL sent it, INCLUDING ITS PROSE.
 *
 * §148 kept only key, family and state. §149 needs `evidenceBasis` and `reasoning` because that is
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
  console.log('§149 EXPERT HAZLENZ — BOUNDED HOSTED THRESHOLD/ARBITRATION PROBE');
  console.log('='.repeat(100));
  const dryRun = process.env.PROBE_DRY_RUN === '1';
  const measureOnly = process.env.PROBE_MEASURE_ONLY === '1';
  console.log(`\n--- PRE-SPEND GATE${dryRun ? '  (DRY RUN)' : ''}\n`);

  const rows = UNSUPPORTED_SETTLEMENT_ROWS;
  const fx = UNSUPPORTED_SETTLEMENT_FIXTURES;

  // ---- A. structure and scale
  check('A.1 logical calls are within the authorized band',
    rows.length === B.targetLogicalCalls && rows.length <= B.hardLogicalCallCeiling
      && rows.length <= 12,
    `${rows.length} rows (request ceiling ${B.hardProviderRequestCeiling})`);
  const structural = rows.map(r => validateCohortRow(r)).filter(p => p.length > 0);
  check('A.2 every row is structurally scoreable', structural.length === 0,
    `${structural.length} problems`);
  const ids = rows.map(r => r.source.rowId);
  check('A.3 ids are fresh US-* development ids',
    ids.every(i => /^US-[A-J]\d$/.test(i)) && new Set(ids).size === ids.length, ids.join(' '));
  const domains = new Set(fx.map(f => f.domain));
  check('A.4 the set is not over-sampled on one family',
    domains.size === rows.length, `${domains.size} distinct domains across ${rows.length} rows`);

  // ---- B. composition. The FORBIDDEN half is what makes this a settlement probe rather than a
  //      demonstration that the model can be made to ask more questions.
  const required = fx.filter(isRequired);
  const forbidden = fx.filter(f => !isRequired(f));
  check('B.1 the halves are BALANCED', required.length === 5 && forbidden.length === 5,
    `${required.length} REQUIRED / ${forbidden.length} matched FORBIDDEN controls`);
  const forms = new Set(fx.map(f => f.absenceForm));
  check('B.2 every absence form appears exactly once, so a miss names its own MECHANISM',
    ABSENCE_FORMS.every(a => forms.has(a)) && forms.size === ABSENCE_FORMS.length,
    `${forms.size} of ${ABSENCE_FORMS.length}`);

  // The five REQUIRED forms the authorization enumerates, each present and each owed a question.
  const REQUIRED_FORMS = ['NOT_VISIBLE', 'NOT_MENTIONED', 'OBSERVER_CANNOT_DETERMINE',
    'LIKELY_BUT_UNESTABLISHED', 'WORST_CASE_TEMPTATION'] as const;
  check('B.3 all five REQUIRED absence forms are present and all five are owed a clarification',
    REQUIRED_FORMS.every(a => required.some(f => f.absenceForm === a)),
    REQUIRED_FORMS.join(' '));
  // And the five matched controls, each removing one way of being WRONGLY doubtful.
  const FORBIDDEN_FORMS = ['EXPLICITLY_ABSENT', 'EXPLICITLY_PRESENT', 'SETTLED_THRESHOLD',
    'DETERMINISTIC_DERIVATION', 'DECISION_INVARIANT_UNKNOWN'] as const;
  check('B.4 and all five matched controls, each owed SILENCE',
    FORBIDDEN_FORMS.every(a => forbidden.some(f => f.absenceForm === a)),
    FORBIDDEN_FORMS.join(' '));

  // THE TWO NON-REGRESSION CONTROLS THAT MATTER MOST, named individually because a bare count would
  // hide either of them: §148's settled threshold must stay silent, and §148's unmarked aggregation
  // gap must stay recovered. Together they bound v12 in both directions.
  const settledThreshold = fx.filter(f => f.absenceForm === 'SETTLED_THRESHOLD');
  check('B.5 the §148 settled-threshold control supplies a record and must stay SILENT',
    settledThreshold.length === 1 && !isRequired(settledThreshold[0])
      && settledThreshold[0].row.source.governedStandards.length > 0,
    settledThreshold.map(f => f.row.source.rowId).join(' '));
  const aggregation = fx.filter(f => f.absenceForm === 'NOT_MENTIONED');
  check('B.5b and the §148 unmarked AGGREGATION gap must stay RECOVERED — if it goes silent, v12 '
    + 'narrowed something v10 and v11 recovered',
    aggregation.length === 1 && isRequired(aggregation[0])
      && aggregation[0].row.source.governedStandards.length > 0
      && reqTruth(aggregation[0]).absenceIsUnmarked === true,
    aggregation.map(f => f.row.source.rowId).join(' '));

  // THE UNMARKED SHAPE. §147 established it as the defect class and it must still dominate.
  const unmarked = required.filter(f => reqTruth(f).absenceIsUnmarked === true);
  check('B.6 the UNMARKED absence shape is represented on the REQUIRED half',
    unmarked.length >= 2,
    `${unmarked.length} of ${required.length}: ${unmarked.map(f => f.row.source.rowId).join(' ')}`);
  check('B.6b and ANNOUNCED cases survive as non-regression controls on what v9-v11 already recover',
    required.some(f => reqTruth(f).absenceIsUnmarked === false), 'present');

  // THE CANDIDATE PROPERTY. §149 must not buy silence by suppressing hazards, and the set has to be
  // able to SEE that happen. Six rows establish a hazard the model must still raise.
  const established = fx.filter(f => f.hazardEstablished);
  check('B.7 rows that establish a hazard the model MUST still raise, so a repair that suppressed '
    + 'candidates would be visible',
    established.length >= 5 && established.every(f => f.row.truth.presentHazardFamilies.length > 0),
    established.map(f => f.row.source.rowId).join(' '));
  check('B.7b including at least one FORBIDDEN row, so "raise the hazard, ask nothing" is testable',
    established.some(f => !isRequired(f)),
    established.filter(f => !isRequired(f)).map(f => f.row.source.rowId).join(' '));

  // THE ADJUDICATION KEY, without which the settlement gate is a matter of opinion.
  check('B.8 every REQUIRED row states BOTH what the text establishes AND the affirmative sentence '
    + 'the model must not write',
    required.every(f => f.forbiddenStrengthening !== null
      && f.forbiddenStrengthening.textEstablishes.length > 30
      && f.forbiddenStrengthening.mustNotAssert.length > 30),
    required.filter(f => !f.forbiddenStrengthening).map(f => f.row.source.rowId).join(', ')
      || 'all five keyed');

  // A REALIZED true contradiction cannot be commissioned. Said here, before spend, rather than
  // discovered in the report.
  check('B.9 NO row commissions a true contradiction — it requires the MODEL to make an error v12 '
    + 'tells it not to make, and the rejection property is proved deterministically instead',
    required.every(f => reqTruth(f).affectedDecision !== 'HAZARD_EXISTENCE'),
    'the hosted denominator is reported as observed and never as 100% from zero');

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
  console.log(`\n      prompt ${identity.promptVersion}   contract ${EXPERT_ANALYSIS_CONTRACT_VERSION}`);
  console.log(`      system ${identity.systemPromptSha256}`);
  console.log(`      schema ${identity.wireSchemaSha256}\n`);
  check('F.3 the prospective repaired prompt is v12',
    identity.promptVersion === 'hazlenz.expert.prompt.v12', identity.promptVersion);
  check('F.4 the analysis contract is UNCHANGED at v2 — the schema gained no field',
    EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    EXPERT_ANALYSIS_CONTRACT_VERSION);

  // The §149 semantics must be in the text that ACTUALLY GOES TO THE MODEL, not merely in the
  // module. These are the checks that tie the probe to the thing it is probing.
  check('F.5 the NOT-OBSERVED-IS-NOT-ABSENT rule is in the system prompt this probe will send',
    built.every(([sys]) => sys.includes('NOT OBSERVED IS NOT ABSENT')
      && sys.includes('Read a negative sentence for EXACTLY the predicate it uses')
      && sys.indexOf('WHAT COUNTS AS ESTABLISHED') < sys.indexOf('NOT OBSERVED IS NOT ABSENT')
      && sys.indexOf('NOT OBSERVED IS NOT ABSENT') < sys.indexOf('THE COUNTERFACTUAL TEST')),
    'present, inside the ESTABLISHED block, before the counterfactual test, in all requests');
  check('F.5b including BOTH jumps TR-E1 made, named separately',
    built.every(([sys]) => sys.includes('from a THING not being there to an ACTIVITY not happening')
      && sys.includes('from the state NOW to what was or was not done BEFORE')),
    'thing->activity and now->before');
  check('F.5c and its SCOPE, so a stated absence is still a fact',
    built.every(([sys]) => sys.includes('THIS IS NOT AN INSTRUCTION TO DOUBT THE TEXT')),
    'present in all requests');
  check('F.6 likelihood and the explain/settle boundary are present',
    built.every(([sys]) => sys.includes('LIKELY IS NOT ESTABLISHED')
      && sys.includes('WORST CASE MAY EXPLAIN. IT MUST NEVER SETTLE')),
    'present in all requests');
  check('F.6b and the entailment discipline, in the EVIDENCE section where TR-E1 actually crossed',
    built.every(([sys]) => sys.includes('YOUR EVIDENCE BASIS MUST NOT SAY MORE THAN YOUR QUOTE DOES')
      && sys.includes('None of this is a reason to withhold a candidate')),
    'present, with the no-suppression clause');
  check('F.7 NOTHING v10 or v11 established was dropped from the text being sent',
    built.every(([sys]) => sys.includes('ASSUMED the worse of two possible states')
      && sys.includes('RESEMBLE the ones it covers')
      && sys.includes('A THRESHOLD IS NOT A GAP')
      && sys.includes('It is unsettled ONLY where BOTH of these hold')
      && sys.includes('near the line is a side of the line')
      && sys.includes('BEFORE YOU WRITE HAZARD_EXISTENCE, RE-READ YOUR OWN CANDIDATE LIST')
      && sys.includes('DISCARDED IN FULL')
      && sys.includes('THE SETTLEMENT CHECK')
      && sys.includes('THIS LIST STARTS EMPTY AND STAYS EMPTY')),
    'v10 settlement, v11 threshold and routing, and the v9 precision text all intact');

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
  // §149 reads the authorization literally: 10 calls against a 10-request cap leaves NO headroom,
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
    operation: '§149 Expert HazLenz bounded hosted settlement-threshold + affectedDecision routing probe',
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
      // The prompt MODULE hash, alongside the rendered system-prompt hash. `PreSpendIdentity.hashes`
      // is a frozen shape shared with spent probes and is deliberately not widened for this.
      promptModuleSha256: sha256File(join(ROOT, PROMPT)),
      contractVersions: { input: EXPERT_INPUT_CONTRACT_VERSION, validator: EXPERT_VALIDATOR_VERSION,
        measurement: EXPERT_MEASUREMENT_CONTRACT_VERSION, harness: EXPERT_COHORT_HARNESS_VERSION,
        runRecordStore: RUN_RECORD_STORE_VERSION, probeMeasures: PROBE_MEASURES_VERSION,
        fixtureSet: UNSUPPORTED_SETTLEMENT_FIXTURE_SET_VERSION },
      arms: ['BASE'], m14RemediationStatus: 'NOT_ATTEMPTED',
      endpoint: cfg.endpoint, apiVersion: cfg.apiVersion, maxTokens: cfg.maxTokens,
      thinking: cfg.thinking,
      frozenGates: UNSUPPORTED_SETTLEMENT_GATES,
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
        const f = unsupportedFixtureByRowId(rec.row.source.rowId)!;
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
    rowId: rec.row.source.rowId, fx: unsupportedFixtureByRowId(rec.row.source.rowId)!, call, rec })));
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

  // ---- THE §149 MEASURE. Reasoned-but-destroyed, reported SEPARATELY and never as recall.
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
        rowId: v.rowId, expectation: v.fx.expectation.kind, absenceForm: v.fx.absenceForm,
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
  const labelExact = labelled.filter(x => x.emitted === x.authored).length;
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
  // ---- §149 PHASE 5. RAW LINKAGE, computed from the wire BEFORE normalization stripped anything.
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

  // ---- §149 THE UNSUPPORTED-SETTLEMENT ADJUDICATION PACKET.
  //
  // NOT A SCORE. The script assembles, per REQUIRED row, the four things a human needs side by side:
  // what the text establishes, the affirmative sentence the model must not write, and the model's
  // own prose in the three places TR-E1 crossed. Deciding whether a paraphrase asserts the forbidden
  // claim is semantic judgement and the script does not attempt it — §148 measured what happens when
  // a keyword rule is trusted with that class of decision.
  const settlementPacket = present
    .filter(v => isRequired(v.fx) && v.fx.forbiddenStrengthening !== null)
    .map(v => ({
      rowId: v.rowId,
      absenceForm: v.fx.absenceForm,
      textEstablishes: v.fx.forbiddenStrengthening!.textEstablishes,
      mustNotAssert: v.fx.forbiddenStrengthening!.mustNotAssert,
      clarificationEmitted: (wireClarifications.get(v.rowId) ?? []).length > 0,
      clarificationDelivered: clar(v).length > 0,
      candidateProse: (wireCandidates.get(v.rowId) ?? []).map(c => ({
        candidateKey: c.candidateKey, state: c.assertedConditionState,
        quotedEvidence: c.quotedEvidence,
        evidenceBasis: c.evidenceBasis, reasoning: c.reasoning })),
      summary: wireSummary.get(v.rowId) ?? '',
      uncertainty: wireUncertainty.get(v.rowId) ?? [],
      VERDICT: 'HUMAN_ADJUDICATION_REQUIRED — did the model assert mustNotAssert as a FACT, and did '
        + 'that assertion eliminate the owed clarification?',
    }));

  // ---- THE CANDIDATE NON-SUPPRESSION AXIS. §149 must not buy silence with lost hazards, so the
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
    ['rowId', 'absenceForm', 'hazardEstablished', 'expectation', 'absenceIsUnmarked',
      'authoredMissingFact', 'authoredAffectedDecision', 'textEstablishes', 'mustNotAssert',
      'emittedQuestion', 'emittedAffectedDecision', 'survived', 'emittedEvidenceGap',
      'emittedWhyItMatters', 'relatesToCandidateKey', 'namedCandidateState', 'issueCodes',
      'candidateStates', 'candidateEvidenceBasis', 'candidateReasoning', 'explanationSummary',
      'uncertaintyStatements'],
  ];
  for (const v of views) {
    const t = isRequired(v.fx) ? reqTruth(v.fx) : null;
    const base = [v.rowId, v.fx.absenceForm, String(v.fx.hazardEstablished), v.fx.expectation.kind,
      String(isRequired(v.fx) ? reqTruth(v.fx).absenceIsUnmarked : ''),
      t ? String(t.missingFact) : (v.fx.expectation as unknown as
        { truth: { temptingQuestion: string } }).truth.temptingQuestion,
      t ? String(t.affectedDecision) : 'NONE_OWED',
      v.fx.forbiddenStrengthening?.textEstablishes ?? '',
      v.fx.forbiddenStrengthening?.mustNotAssert ?? ''];
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

  const results = {
    operation: '§149 bounded hosted settlement-threshold + affectedDecision routing probe',
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
        .map(v => ({ rowId: v.rowId, absenceForm: v.fx.absenceForm,
          questions: clar(v).map(c => String(c.question)) })),
      TOTAL_CLARIFICATIONS_DELIVERED: present.reduce((t, v) => t + clar(v).length, 0),
      TOTAL_CLARIFICATIONS_EMITTED_ON_THE_WIRE: present.reduce((t, v) => t + wireOf(v).length, 0),
      CLARIFICATIONS_PER_CALL: present.length === 0 ? 0
        : Number((present.reduce((t, v) => t + clar(v).length, 0) / present.length).toFixed(3)),
      INVALID_CLARIFICATION_OBJECTS: invalidObjects,
      STRICT_RECALL: 'NOT_COMPUTED_BY_SCRIPT — adjudicate from CLARIFICATION-ADJUDICATION.csv; a '
        + 'semantically different question is not recall, and a DESTROYED question is not delivered',
    },
    // ---- THE §149 MEASURES. Reported separately, exactly as the authorization requires.
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
      LABEL_EXACT_MATCH_ON_REQUIRED_ROWS: `${labelExact}/${labelled.length}`,
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
    // ---- §149 PHASE 5. Four figures, reported separately and reconciled. Never collapsed.
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
    // ---- §149 THE UNSUPPORTED-SETTLEMENT PACKET. Assembled, never scored.
    unsupportedSettlement: {
      UNSUPPORTED_SETTLEMENT_COUNT: 'NOT_COMPUTED_BY_SCRIPT — adjudicate each row of '
        + 'adjudication[] against textEstablishes / mustNotAssert and the model\'s own '
        + 'evidenceBasis, reasoning and summary. A count the script invented would be the §140 '
        + 'mistake and the §148 keyword-rule mistake at once.',
      CANDIDATE_SUPPRESSION_ROWS: suppressedHazardRows,
      CANDIDATE_SUPPRESSION_NOTE: '§149 must not buy silence with lost hazards. These are rows '
        + 'whose text establishes a hazard and where the model raised NO candidate at all.',
      adjudication: settlementPacket,
    },
    regression: {
      citation, coverage, linkage,
      FORBIDDEN_FAMILY_CANDIDATES_EMITTED: forbiddenFamilyEmitted,
      PROTECTED_AUTHORITY_CONTRADICTIONS: protectedContradictions.length,
      TOTAL_CANDIDATES: present.reduce((t, v) => t + cands(v).length, 0),
      RAW_WIRE_CITATION_HITS: wireCitationHits,
    },
    frozenGates: UNSUPPORTED_SETTLEMENT_GATES,
    budget: { targetLogicalCalls: B.targetLogicalCalls,
      hardProviderRequestCeiling: B.hardProviderRequestCeiling,
      enforcedSpendCeilingUsd: Number(SPEND_CEILING_USD.toFixed(6)) },
    gate,
  };

  writeFileSync(join(OUT, 'RESULTS-SUMMARY.json'), JSON.stringify(results, null, 1) + '\n');
  writeFileSync(join(OUT, 'CLARIFICATION-ADJUDICATION.csv'), csv(adjudication));
  writeFileSync(join(OUT, 'FIXTURE-MANIFEST.json'), JSON.stringify({
    fixtureSetVersion: UNSUPPORTED_SETTLEMENT_FIXTURE_SET_VERSION,
    fixtureFileSha256: sha256File(join(ROOT, FIXTURES)),
    rows: fx.map(f => ({ rowId: f.row.source.rowId, domain: f.domain,
      absenceForm: f.absenceForm, hazardEstablished: f.hazardEstablished,
      forbiddenStrengthening: f.forbiddenStrengthening, expectation: f.expectation.kind,
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
