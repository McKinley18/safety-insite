/**
 * EXPERT HAZLENZ -- LOCAL-ONLY R4/R6 REPRODUCTION DIAGNOSTIC (2026-08-30/31).
 *
 * ZERO HOSTED CALLS. This answers Phase 2/3/4 of the R4/R6 local repair authorization: does the
 * §108 hosted R4 candidate/explanation failure and the R6 negative-control over-routing reproduce
 * against the LOCAL provider (qwen3-coder:30b via Ollama), under the CURRENT prompt v4 / analysis.v2
 * / shared wire schema / normalization / boundary -- unmodified?
 *
 * WHY SEED VARIES ACROSS REPETITIONS. `EXPERT_PROBE_INFERENCE_CONFIG` pins `seed: 20260829` so a
 * single probe run is replayable. Ten repetitions at the SAME seed would just print the same
 * deterministic answer ten times and characterize nothing. This script varies the seed
 * (`baseSeed + i`) per repetition instead, which is still $0.00 and still fully local, and is the
 * only way a bounded local sample can say anything about RELIABILITY rather than about one draw.
 *
 * WHAT THIS SCRIPT DOES NOT DO. It does not call `stripAnthropicUnsupportedKeywords()` or the
 * Anthropic adapter -- that would not be a local call, and this phase's authorization forbids
 * hosted calls entirely, including through the compatibility-stripped schema. What it DOES do,
 * separately, is a pure offline structural comparison: whether the ANTHROPIC-facing schema (as
 * actually built by the real `buildAnthropicRequestBody`) still requires the fields the boundary
 * demands be non-empty, now that `minLength`/`minItems` are stripped from it. That comparison makes
 * no network call and mutates nothing.
 */

import { mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import {
  OllamaExpertProvider, EXPERT_PROBE_INFERENCE_CONFIG,
} from '../src/hazlenz/expert-hazlenz-adapters/ollama-expert-provider';
import {
  buildAnthropicRequestBody,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { buildExpertWireSchema } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { normalizeExpertOutput } from '../src/hazlenz/expert-hazlenz/expert-normalization';
import { ROUTING_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/routing-fixtures';
import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';

const REPEATS = Number(process.env.DIAG_REPEATS || 10);
const NOW = '2026-08-30T00:00:00.000Z';

const OUT = join(__dirname, '..', '..', 'verification', 'expert-hazlenz-r4-r6-local-repair-2026-08-30');
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });
const LOG = join(OUT, 'transport', 'r4-r6-diagnostic.jsonl');
writeFileSync(LOG, '');

const R4 = ROUTING_FIXTURES.find(f => f.id === 'R4')!;
const R6 = ROUTING_FIXTURES.find(f => f.id === 'R6')!;

type Classification =
  | 'MODEL_DID_NOT_PRODUCE_CANDIDATE'
  | 'MODEL_PRODUCED_CANDIDATE_BOUNDARY_REJECTED'
  | 'MODEL_REASONED_ONLY_IN_EXPLANATION'
  | 'STRUCTURED_OUTPUT_MALFORMED'
  | 'CANDIDATE_SURVIVED';

const CONFINED_SPACE_PATTERN = /confined space|permit.required|entrapment|asphyxiat|oxygen deficien/i;

/** Field-by-field replay of the boundary's own candidate-shape check, for diagnostic attribution only. */
function explainCandidateShape(item: unknown): string[] {
  const reasons: string[] = [];
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return ['not an object'];
  const c = item as Record<string, unknown>;
  const nonEmpty = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
  if (!nonEmpty(c.candidateKey)) reasons.push(`candidateKey=${JSON.stringify(c.candidateKey)}`);
  if (!nonEmpty(c.evidenceBasis)) reasons.push(`evidenceBasis=${JSON.stringify(c.evidenceBasis)}`);
  if (!nonEmpty(c.reasoning)) reasons.push(`reasoning=${JSON.stringify(c.reasoning)}`);
  if (typeof c.confidence !== 'string') reasons.push(`confidence=${JSON.stringify(c.confidence)}`);
  if (typeof c.relationshipToDeterministic !== 'string') {
    reasons.push(`relationshipToDeterministic=${JSON.stringify(c.relationshipToDeterministic)}`);
  }
  if (typeof c.requiresUserConfirmation !== 'boolean') {
    reasons.push(`requiresUserConfirmation=${JSON.stringify(c.requiresUserConfirmation)}`);
  }
  return reasons;
}

interface R4Row {
  rep: number;
  seed: number;
  ok: boolean;
  failureKind: string | null;
  outcome: unknown;
  candidatesBeforeNormalization: number;
  candidatesAfterNormalization: number;
  rawCandidates: unknown[];
  issues: unknown[];
  candidateShapeExplain: string[][];
  explanationPresent: boolean;
  explanationSummary: string | null;
  explanationMentionsConfinedSpace: boolean;
  uncertaintyStatements: string[];
  classification: Classification;
}

interface R6Row {
  rep: number;
  seed: number;
  ok: boolean;
  failureKind: string | null;
  outcome: unknown;
  counts: { candidates: number; clarifications: number; insights: number; disagreements: number };
  overRoutedItems: Array<{
    collection: string; index: number; exactText: string; reasonViolatesExpectation: string;
  }>;
  uncertaintyStatements: string[];
  totalOverRouted: number;
}

async function runOnce(
  fixtureInput: ExpertAnalysisInput, seed: number,
): Promise<{ ok: boolean; failureKind: string | null; raw: Record<string, unknown> | null; issues: unknown[] }> {
  const provider = new OllamaExpertProvider({ ...EXPERT_PROBE_INFERENCE_CONFIG, seed });
  const result = await provider.analyze(fixtureInput);
  if (!result.ok) {
    return { ok: false, failureKind: result.kind, raw: null, issues: [] };
  }
  const normalized = normalizeExpertOutput(result.raw, fixtureInput, NOW);
  return {
    ok: true, failureKind: null,
    raw: result.raw as Record<string, unknown>,
    issues: normalized.issues,
  };
}

(async function main() {
  console.log('EXPERT HAZLENZ -- R4/R6 LOCAL REPRODUCTION DIAGNOSTIC');
  console.log(`provider   local-ollama   model ${EXPERT_PROBE_INFERENCE_CONFIG.model}   repeats ${REPEATS}\n`);

  // ============================================================ R4
  console.log('== R4 -- EXTRA PLAUSIBLE HAZARD (HG10) ==\n');
  const r4Rows: R4Row[] = [];
  for (let i = 0; i < REPEATS; i++) {
    const seed = EXPERT_PROBE_INFERENCE_CONFIG.seed + i;
    const r = await runOnce(R4.input, seed);
    if (!r.ok) {
      const row: R4Row = {
        rep: i, seed, ok: false, failureKind: r.failureKind, outcome: null,
        candidatesBeforeNormalization: 0, candidatesAfterNormalization: 0, rawCandidates: [],
        issues: [], candidateShapeExplain: [], explanationPresent: false, explanationSummary: null,
        explanationMentionsConfinedSpace: false, uncertaintyStatements: [],
        classification: 'STRUCTURED_OUTPUT_MALFORMED',
      };
      r4Rows.push(row);
      appendFileSync(LOG, JSON.stringify({ fixture: 'R4', ...row }) + '\n');
      console.log(`  rep ${i} seed=${seed}  PROVIDER_FAILED  ${r.failureKind}`);
      continue;
    }
    const raw = r.raw!;
    const rawCandidates = Array.isArray(raw.expertHazardCandidates) ? raw.expertHazardCandidates : [];
    const normalized = normalizeExpertOutput(raw, R4.input, NOW);
    const afterCount = normalized.state === 'VALID' ? normalized.validated!.analysis.expertHazardCandidates.length : 0;
    const explanationRaw = raw.expertExplanation as Record<string, unknown> | null | undefined;
    const explanationSummary = explanationRaw && typeof explanationRaw.summary === 'string'
      ? explanationRaw.summary : null;
    const uncertaintyRaw = raw.uncertainty as { statements?: unknown } | null | undefined;
    const uncertaintyStatements = Array.isArray(uncertaintyRaw?.statements)
      ? uncertaintyRaw!.statements as string[] : [];

    let classification: Classification;
    if (afterCount > 0) classification = 'CANDIDATE_SURVIVED';
    else if (rawCandidates.length > 0) classification = 'MODEL_PRODUCED_CANDIDATE_BOUNDARY_REJECTED';
    else if (CONFINED_SPACE_PATTERN.test(explanationSummary ?? '')
             || uncertaintyStatements.some(s => CONFINED_SPACE_PATTERN.test(s))) {
      classification = 'MODEL_REASONED_ONLY_IN_EXPLANATION';
    } else classification = 'MODEL_DID_NOT_PRODUCE_CANDIDATE';

    const row: R4Row = {
      rep: i, seed, ok: true, failureKind: null, outcome: raw.outcome,
      candidatesBeforeNormalization: rawCandidates.length,
      candidatesAfterNormalization: afterCount,
      rawCandidates,
      issues: normalized.issues,
      candidateShapeExplain: rawCandidates.map(explainCandidateShape),
      explanationPresent: raw.expertExplanation !== null && raw.expertExplanation !== undefined,
      explanationSummary,
      explanationMentionsConfinedSpace: CONFINED_SPACE_PATTERN.test(explanationSummary ?? ''),
      uncertaintyStatements,
      classification,
    };
    r4Rows.push(row);
    appendFileSync(LOG, JSON.stringify({ fixture: 'R4', ...row }) + '\n');
    console.log(`  rep ${i} seed=${seed}  ${classification}  before=${row.candidatesBeforeNormalization} `
      + `after=${row.candidatesAfterNormalization} outcome=${row.outcome} `
      + `issues=${(row.issues as { code: string }[]).map(x => x.code).join(',') || '-'}`);
    if (row.candidateShapeExplain.some(e => e.length > 0)) {
      row.candidateShapeExplain.forEach((e, idx) => {
        if (e.length > 0) console.log(`        candidate[${idx}] malformed fields: ${e.join(', ')}`);
      });
    }
  }

  const r4Tally = r4Rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.classification] = (acc[r.classification] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\nR4 tally over ${REPEATS} reps:`, r4Tally);
  const r4Reproduced = (r4Tally['MODEL_PRODUCED_CANDIDATE_BOUNDARY_REJECTED'] ?? 0) > 0
    || (r4Tally['MODEL_DID_NOT_PRODUCE_CANDIDATE'] ?? 0) === REPEATS;

  // ============================================================ R6
  console.log('\n== R6 -- EXPLANATION-ONLY NEGATIVE CONTROL (HG12) ==\n');
  const r6Rows: R6Row[] = [];
  for (let i = 0; i < REPEATS; i++) {
    const seed = EXPERT_PROBE_INFERENCE_CONFIG.seed + i;
    const r = await runOnce(R6.input, seed);
    if (!r.ok) {
      console.log(`  rep ${i} seed=${seed}  PROVIDER_FAILED  ${r.failureKind}`);
      continue;
    }
    const raw = r.raw!;
    const cand = Array.isArray(raw.expertHazardCandidates) ? raw.expertHazardCandidates : [];
    const clar = Array.isArray(raw.decisionCriticalClarifications) ? raw.decisionCriticalClarifications : [];
    const ins = Array.isArray(raw.crossHazardInsights) ? raw.crossHazardInsights : [];
    const dis = Array.isArray(raw.disagreements) ? raw.disagreements : [];
    const uncertaintyRaw = raw.uncertainty as { statements?: unknown } | null | undefined;
    const uncertaintyStatements = Array.isArray(uncertaintyRaw?.statements)
      ? uncertaintyRaw!.statements as string[] : [];

    const overRoutedItems: R6Row['overRoutedItems'] = [];
    cand.forEach((c: unknown, idx: number) => {
      const item = (c ?? {}) as Record<string, unknown>;
      overRoutedItems.push({
        collection: 'expertHazardCandidates', index: idx,
        exactText: `${String(item.hazardFamily)} / ${String(item.evidenceBasis)}`,
        reasonViolatesExpectation: 'fixture requires FORBIDDEN: everything is stated as locked out, '
          + 'tagged, bled down, verified at zero, and second-person verified -- an unsupported hazard candidate',
      });
    });
    clar.forEach((c: unknown, idx: number) => {
      const item = (c ?? {}) as Record<string, unknown>;
      overRoutedItems.push({
        collection: 'decisionCriticalClarifications', index: idx,
        exactText: String(item.question),
        reasonViolatesExpectation: 'fixture requires FORBIDDEN: every fact needed to answer is already '
          + 'stated in the observation, so any question here is manufactured, not decision-critical',
      });
    });
    ins.forEach((c: unknown, idx: number) => {
      const item = (c ?? {}) as Record<string, unknown>;
      overRoutedItems.push({
        collection: 'crossHazardInsights', index: idx,
        exactText: String(item.reasoning),
        reasonViolatesExpectation: 'fixture requires FORBIDDEN: a single controlled LOTO condition has '
          + 'no second condition to interact with',
      });
    });
    dis.forEach((c: unknown, idx: number) => {
      const item = (c ?? {}) as Record<string, unknown>;
      overRoutedItems.push({
        collection: 'disagreements', index: idx,
        exactText: String(item.reasoning),
        reasonViolatesExpectation: 'fixture requires FORBIDDEN: the deterministic CONTROLLED finding '
          + 'is correct and unchallenged by the observation',
      });
    });

    const row: R6Row = {
      rep: i, seed, ok: true, failureKind: null, outcome: raw.outcome,
      counts: { candidates: cand.length, clarifications: clar.length, insights: ins.length, disagreements: dis.length },
      overRoutedItems,
      uncertaintyStatements,
      totalOverRouted: overRoutedItems.length,
    };
    r6Rows.push(row);
    appendFileSync(LOG, JSON.stringify({ fixture: 'R6', ...row }) + '\n');
    console.log(`  rep ${i} seed=${seed}  over-routed=${row.totalOverRouted}  `
      + `c=${row.counts.candidates} q=${row.counts.clarifications} i=${row.counts.insights} `
      + `d=${row.counts.disagreements}  outcome=${row.outcome}`);
    for (const o of overRoutedItems) {
      console.log(`        OVER-ROUTE  ${o.collection}[${o.index}]  "${o.exactText}"`);
    }
  }

  const r6CleanReps = r6Rows.filter(r => r.totalOverRouted === 0).length;
  const r6OverRoutedCollections = new Set(r6Rows.flatMap(r => r.overRoutedItems.map(o => o.collection)));
  console.log(`\nR6: ${r6CleanReps}/${r6Rows.length} reps fully clean (empty). `
    + `Collections ever over-routed: ${[...r6OverRoutedCollections].join(', ') || 'none'}`);

  // ============================================================ Anthropic-strip structural comparison (offline, $0.00, no network)
  console.log('\n== OFFLINE STRUCTURAL COMPARISON: local canonical schema vs Anthropic-stripped schema ==\n');
  const canonical = buildExpertWireSchema(R4.input);
  const anthropicBody = buildAnthropicRequestBody(R4.input);
  const anthropicSchema = (anthropicBody.tools as Array<{ input_schema: unknown }>)[0].input_schema;

  function countKeyword(node: unknown, key: string): number {
    if (Array.isArray(node)) return node.reduce((a, n) => a + countKeyword(n, key), 0);
    if (node && typeof node === 'object') {
      let n = 0;
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (k === key) n += 1;
        n += countKeyword(v, key);
      }
      return n;
    }
    return 0;
  }
  const canonicalMinLength = countKeyword(canonical, 'minLength');
  const canonicalMinItems = countKeyword(canonical, 'minItems');
  const anthropicMinLength = countKeyword(anthropicSchema, 'minLength');
  const anthropicMinItems = countKeyword(anthropicSchema, 'minItems');
  console.log(`  local/canonical schema:    minLength=${canonicalMinLength}  minItems=${canonicalMinItems}`);
  console.log(`  Anthropic-facing schema:   minLength=${anthropicMinLength}  minItems=${anthropicMinItems}`);
  console.log('  (Anthropic-facing schema is built by the REAL, unmodified buildAnthropicRequestBody();'
    + ' this makes no network call.)');

  // A candidate object legal under the Anthropic-facing schema (empty required strings, since
  // minLength is stripped there) but illegal under the boundary -- proves the loss-point CLASS
  // without needing the actual hosted raw payload, which was never persisted.
  const syntheticEmptyStringCandidate = {
    contractVersion: 'analysis.v2', analysisId: R4.input.analysisId,
    expertHazardCandidates: [{
      candidateKey: '', hazardFamily: 'confined_space', assertedConditionState: 'ACTIVE',
      groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
      evidenceBasis: '', reasoning: '', confidence: 'LOW',
      relationshipToDeterministic: 'ADDITIONAL', requiresUserConfirmation: true,
    }],
    decisionCriticalClarifications: [], crossHazardInsights: [], disagreements: [],
    expertExplanation: { summary: '' },
    uncertainty: { statements: [] },
    outcome: 'ANALYZED',
  };
  const proof = normalizeExpertOutput(syntheticEmptyStringCandidate, R4.input, NOW);
  console.log('\n  SYNTHETIC PROOF -- a candidate + explanation with empty required strings (illegal only');
  console.log('  by minLength, which the Anthropic-facing schema no longer carries):');
  console.log(`    state=${proof.state}  candidates=${proof.validated?.analysis.expertHazardCandidates.length ?? 0}  `
    + `issues=${proof.issues.map(i => i.code).join(',')}`);
  const matchesHostedSignature = proof.state === 'VALID'
    && (proof.validated?.analysis.expertHazardCandidates.length ?? -1) === 0
    && proof.issues.some(i => i.code === 'CANDIDATE_MALFORMED')
    && proof.issues.some(i => i.code === 'EXPLANATION_MALFORMED');
  console.log(`    matches hosted R4 signature (PRESENT layer, 0 candidates, `
    + `CANDIDATE_MALFORMED + EXPLANATION_MALFORMED)?  ${matchesHostedSignature}`);

  const summary = {
    repeats: REPEATS,
    r4: { rows: r4Rows, tally: r4Tally, reproducedLocally: r4Reproduced },
    r6: {
      rows: r6Rows, cleanReps: r6CleanReps, totalReps: r6Rows.length,
      collectionsEverOverRouted: [...r6OverRoutedCollections],
    },
    anthropicStripComparison: {
      canonicalMinLength, canonicalMinItems, anthropicMinLength, anthropicMinItems,
      syntheticProofIssues: proof.issues,
      syntheticProofMatchesHostedSignature: matchesHostedSignature,
    },
  };
  writeFileSync(join(OUT, 'results', 'r4-r6-diagnostic-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(`\nevidence written to ${OUT}`);
})();
