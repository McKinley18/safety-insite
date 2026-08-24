/**
 * L3-2 -- scores a captured Level-3 run against the expectations that shipped with the eval set.
 *
 * Separate program from the runner on purpose (KG-4D precedent): scoring never re-runs inference,
 * so an expectation cannot be quietly adjusted between seeing a result and recording it.
 *
 * The axes are the ones EVALUATION_AND_GATES.md gates on, and nothing else.
 *
 * Env: RUN (capture artifact), OUT (report path).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

interface Record_ {
  id: string; cohort: string | null; failureMode: string | null; regime: string; text: string;
  expect: {
    hazardEstablished?: boolean | null; conditionState?: string; familyPattern?: string;
    acceptableStates?: string[]; highConsequence?: boolean; ambiguous?: boolean;
    minCandidates?: number; maxCandidates?: number;
  };
  outcomeKind: string;
  attempts: number; totalMs: number;
  telemetry: { promptTokens: number | null; outputTokens: number | null; latencyMs: number;
    binding: { total: number; unbound: number; ambiguous: number } | null; failureKind: string | null } | null;
  validationState: string | null;
  validationIssues: Array<{ code: string }>;
  semanticIssues: Array<{ code: string; candidateKey: string }>;
  reasoning: { outcome: string; hazards: Array<{ candidateKey: string; hazardFamily: string; conditionState: string;
    evidence: Array<{ quotedText: string; startOffset: number; endOffset: number }>;
    clarification: unknown | null }> } | null;
}

const ACTIVE = 'ACTIVE';

function main(): void {
  const runPath = process.env.RUN || '';
  const outPath = process.env.OUT || '';
  if (!runPath || !outPath) throw new Error('RUN and OUT are required');
  const capture = JSON.parse(readFileSync(runPath, 'utf8')) as { setId: string; role: string; records: Record_[] };

  const rows: Array<Record<string, unknown>> = [];
  const g = {
    scenarios: 0,
    hazardExpected: 0, hazardFound: 0,
    highConsequenceExpected: 0, highConsequenceMissed: 0, highConsequenceMisses: [] as string[],
    noActiveExpected: 0, falseActive: 0, falseActiveIds: [] as string[],
    ambiguous: 0,
    familyExpected: 0, familyCorrect: 0,
    stateScored: 0, stateCorrect: 0,
    fabricatedQuotes: 0, quotesTotal: 0,
    providerFailures: 0, malformed: 0, rejected: 0, retries: 0,
    clarifications: 0,
    semanticRejections: 0,
    decompositionScored: 0, decompositionWithinTolerance: 0,
  };

  for (const r of capture.records) {
    g.scenarios += 1;
    if (r.attempts > 1) g.retries += 1;
    if (r.outcomeKind === 'PROVIDER_UNAVAILABLE' || r.outcomeKind === 'PROVIDER_TIMEOUT') g.providerFailures += 1;
    if (r.outcomeKind === 'MALFORMED_OUTPUT') g.malformed += 1;
    if (r.outcomeKind === 'REJECTED_OUTPUT') g.rejected += 1;
    g.semanticRejections += new Set(r.semanticIssues.map(i => i.candidateKey)).size;
    if (r.telemetry?.binding) { g.quotesTotal += r.telemetry.binding.total; g.fabricatedQuotes += r.telemetry.binding.unbound; }

    const hazards = r.reasoning?.hazards ?? [];
    const activeHazards = hazards.filter(h => h.conditionState === ACTIVE);
    const assertsActive = activeHazards.length > 0;
    g.clarifications += hazards.filter(h => h.clarification).length;

    const familyRe = r.expect.familyPattern ? new RegExp(r.expect.familyPattern, 'i') : null;
    const familyHit = familyRe ? hazards.some(h => familyRe.test(h.hazardFamily)) : null;

    let verdict: string;
    if (r.expect.ambiguous) {
      g.ambiguous += 1;
      verdict = 'AMBIGUOUS_NOT_SCORED';
    } else if (r.expect.hazardEstablished === true) {
      g.hazardExpected += 1;
      if (r.expect.highConsequence) g.highConsequenceExpected += 1;
      if (assertsActive) {
        g.hazardFound += 1;
        verdict = 'HAZARD_FOUND';
      } else {
        if (r.expect.highConsequence) { g.highConsequenceMissed += 1; g.highConsequenceMisses.push(r.id); }
        verdict = 'HAZARD_MISSED';
      }
      g.stateScored += 1;
      if (assertsActive) g.stateCorrect += 1;
      if (familyRe) { g.familyExpected += 1; if (familyHit) g.familyCorrect += 1; }
      if (r.expect.minCandidates !== undefined) {
        g.decompositionScored += 1;
        const n = hazards.length;
        const lo = (r.expect.minCandidates ?? 1) - 1;
        const hi = (r.expect.maxCandidates ?? r.expect.minCandidates ?? 1) + 1;
        if (n >= lo && n <= hi) g.decompositionWithinTolerance += 1;
      }
    } else {
      g.noActiveExpected += 1;
      if (assertsActive) { g.falseActive += 1; g.falseActiveIds.push(r.id); verdict = 'FALSE_ACTIVE'; }
      else verdict = 'CORRECTLY_NOT_ACTIVE';
      g.stateScored += 1;
      if (!assertsActive) g.stateCorrect += 1;
    }

    rows.push({
      id: r.id, cohort: r.cohort, failureMode: r.failureMode, verdict,
      outcomeKind: r.outcomeKind, validationState: r.validationState,
      hazardCount: hazards.length,
      states: hazards.map(h => h.conditionState),
      families: hazards.map(h => h.hazardFamily),
      familyExpected: r.expect.familyPattern ?? null, familyHit,
      fabricatedQuotes: r.telemetry?.binding?.unbound ?? 0,
      semanticIssueCodes: [...new Set(r.semanticIssues.map(i => i.code))],
      validationIssueCodes: [...new Set(r.validationIssues.map(i => i.code))],
      latencyMs: r.totalMs,
    });
  }

  const latencies = capture.records.map(r => r.totalMs).sort((a, b) => a - b);
  const pct = (p: number) => latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))] : 0;
  const inTok = capture.records.map(r => r.telemetry?.promptTokens ?? 0);
  const outTok = capture.records.map(r => r.telemetry?.outputTokens ?? 0);
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const report = {
    setId: capture.setId, role: capture.role, scoredAt: new Date().toISOString(),
    gates: {
      fabricatedEvidenceQuotes: g.fabricatedQuotes,
      falseActiveOnNoActiveExpected: `${g.falseActive} of ${g.noActiveExpected}`,
      highConsequenceMisses: g.highConsequenceMissed,
      highConsequenceMissIds: g.highConsequenceMisses,
      falseActiveIds: g.falseActiveIds,
    },
    quality: {
      hazardDetection: `${g.hazardFound} of ${g.hazardExpected}`,
      conditionStateAccuracy: g.stateScored ? +(g.stateCorrect / g.stateScored * 100).toFixed(1) : null,
      familyAccuracy: g.familyExpected ? `${g.familyCorrect} of ${g.familyExpected}` : 'n/a',
      decompositionWithinTolerance: g.decompositionScored ? `${g.decompositionWithinTolerance} of ${g.decompositionScored}` : 'n/a',
      clarificationsRaised: `${g.clarifications} of ${g.scenarios}`,
      ambiguousNotScored: g.ambiguous,
    },
    pipeline: {
      providerFailures: g.providerFailures, malformedOutput: g.malformed,
      validatorRejections: g.rejected, retries: g.retries,
      semanticCandidateRejections: g.semanticRejections,
      quotesEmitted: g.quotesTotal, quotesNotVerbatim: g.fabricatedQuotes,
      verbatimQuoteRate: g.quotesTotal ? +((1 - g.fabricatedQuotes / g.quotesTotal) * 100).toFixed(1) : null,
    },
    operational: {
      requests: capture.records.length,
      medianLatencyMs: pct(0.5), p90LatencyMs: pct(0.9), p95LatencyMs: pct(0.95),
      maxLatencyMs: latencies[latencies.length - 1] ?? 0,
      meanInputTokens: Math.round(sum(inTok) / Math.max(1, inTok.length)),
      meanOutputTokens: Math.round(sum(outTok) / Math.max(1, outTok.length)),
      totalInputTokens: sum(inTok), totalOutputTokens: sum(outTok),
    },
    rows,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ gates: report.gates, quality: report.quality, pipeline: report.pipeline, operational: report.operational }, null, 2) + '\n');
}

main();
