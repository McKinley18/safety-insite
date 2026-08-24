/**
 * L3-2c -- scores a captured run at THREE TIERS, which Phase 9 requires be kept apart.
 *
 *   RAW           what the provider proposed
 *   POST_VALIDATOR what survived deterministic validation
 *   SHIPPED        what survived the semantic binder -- the only tier the gate is read from
 *
 * L3-2 collapsed these and the result was misleading in the flattering direction: the model looked
 * worse than it was because the binder was deleting correct findings. Keeping them apart is how the
 * cause of a gate failure stays visible.
 *
 * Scoring is a separate program from capture so expectations cannot be tuned while results are
 * visible. Env: RUN, OUT.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

interface Hazard { hazardFamily: string; conditionState: string; evidence: any[]; clarification: unknown | null }
interface Rec {
  id: string; cohort: string | null; failureMode: string | null; text: string;
  provenanceClass?: string | null;
  semanticDemoted?: Array<{ candidateKey: string; from: string; to: string; clarificationSynthesized: boolean }>;
  expect: {
    hazardEstablished?: boolean | null; conditionState?: string; familyPattern?: string;
    acceptableStates?: string[]; highConsequence?: boolean; ambiguous?: boolean; negativeControl?: boolean;
    minCandidates?: number; maxCandidates?: number; clarificationExpected?: boolean;
  };
  outcomeKind: string; attempts: number; totalMs: number;
  telemetry: any; validationState: string | null;
  validationIssues: Array<{ code: string }>;
  semanticIssues: Array<{ code: string; severity?: string; candidateKey: string }>;
  reasoning: { hazards: Hazard[] } | null;
  preSemanticHazards?: Array<{ hazardFamily: string; conditionState: string; clarification: unknown | null }>;
}

const ACTIVE = 'ACTIVE';

interface Tier { name: string; hazardsOf: (r: Rec) => Array<{ hazardFamily: string; conditionState: string; clarification?: unknown | null }> }

function scoreTier(records: Rec[], tier: Tier) {
  const g = {
    hazardExpected: 0, hazardFound: 0,
    highConsequenceExpected: 0, highConsequenceMissed: 0, highConsequenceMissIds: [] as string[],
    noActiveExpected: 0, falseActive: 0, falseActiveIds: [] as string[],
    negativeControlExpected: 0, negativeControlFalseActive: 0, negativeControlFalseActiveIds: [] as string[],
    familyExpected: 0, familyCorrect: 0,
    stateScored: 0, stateCorrect: 0,
    ambiguous: 0,
    decompositionScored: 0, decompositionOk: 0,
    clarificationExpectedCount: 0, clarificationHit: 0,
    clarificationRaisedCount: 0, clarificationUnnecessary: 0, clarificationUnnecessaryIds: [] as string[],
  };
  for (const r of records) {
    const hz = tier.hazardsOf(r);
    const asserts = hz.some(h => h.conditionState === ACTIVE);
    const raised = hz.some(h => h.clarification);
    if (raised) g.clarificationRaisedCount += 1;

    if (r.expect.clarificationExpected === true) {
      g.clarificationExpectedCount += 1;
      if (raised) g.clarificationHit += 1;
    } else if (r.expect.clarificationExpected === false && raised) {
      g.clarificationUnnecessary += 1; g.clarificationUnnecessaryIds.push(r.id);
    }

    if (r.expect.ambiguous) { g.ambiguous += 1; continue; }

    if (r.expect.hazardEstablished === true) {
      g.hazardExpected += 1;
      if (r.expect.highConsequence) g.highConsequenceExpected += 1;
      if (asserts) g.hazardFound += 1;
      else if (r.expect.highConsequence) { g.highConsequenceMissed += 1; g.highConsequenceMissIds.push(r.id); }
      g.stateScored += 1; if (asserts) g.stateCorrect += 1;
      if (r.expect.familyPattern) {
        g.familyExpected += 1;
        const re = new RegExp(r.expect.familyPattern, 'i');
        if (hz.some(h => re.test(h.hazardFamily))) g.familyCorrect += 1;
      }
      if (r.expect.minCandidates !== undefined) {
        g.decompositionScored += 1;
        const n = hz.length;
        if (n >= (r.expect.minCandidates - 1) && n <= ((r.expect.maxCandidates ?? r.expect.minCandidates) + 1)) g.decompositionOk += 1;
      }
    } else {
      g.noActiveExpected += 1;
      if (r.expect.negativeControl === true) g.negativeControlExpected += 1;
      if (asserts) {
        g.falseActive += 1; g.falseActiveIds.push(r.id);
        if (r.expect.negativeControl === true) { g.negativeControlFalseActive += 1; g.negativeControlFalseActiveIds.push(r.id); }
      }
      g.stateScored += 1; if (!asserts) g.stateCorrect += 1;
    }
  }
  const pct = (n: number, d: number) => (d ? +(n / d * 100).toFixed(1) : null);
  return {
    tier: tier.name,
    hazardDetection: `${g.hazardFound} of ${g.hazardExpected}`,
    highConsequenceMisses: g.highConsequenceMissed,
    highConsequenceMissIds: g.highConsequenceMissIds,
    falseActive: `${g.falseActive} of ${g.noActiveExpected}`,
    falseActiveIds: g.falseActiveIds,
    negativeControlFalseActive: `${g.negativeControlFalseActive} of ${g.negativeControlExpected}`,
    negativeControlFalseActiveIds: g.negativeControlFalseActiveIds,
    conditionStateAccuracyPct: pct(g.stateCorrect, g.stateScored),
    familyAccuracy: g.familyExpected ? `${g.familyCorrect} of ${g.familyExpected}` : 'n/a',
    multiHazardWithinTolerance: g.decompositionScored ? `${g.decompositionOk} of ${g.decompositionScored}` : 'n/a',
    clarificationRecall: g.clarificationExpectedCount ? `${g.clarificationHit} of ${g.clarificationExpectedCount}` : 'n/a',
    clarificationRecallPct: pct(g.clarificationHit, g.clarificationExpectedCount),
    clarificationPrecision: g.clarificationRaisedCount ? `${g.clarificationHit} of ${g.clarificationRaisedCount}` : 'n/a',
    clarificationPrecisionPct: pct(g.clarificationHit, g.clarificationRaisedCount),
    clarificationsRaised: g.clarificationRaisedCount,
    clarificationUnnecessary: g.clarificationUnnecessary,
    clarificationUnnecessaryIds: g.clarificationUnnecessaryIds,
    ambiguousNotScored: g.ambiguous,
  };
}

function main(): void {
  const runPath = process.env.RUN || '';
  const outPath = process.env.OUT || '';
  const capture = JSON.parse(readFileSync(runPath, 'utf8')) as { setId: string; role: string; records: Rec[] };
  const records = capture.records;

  const tiers = [
    { name: 'RAW_PROVIDER', hazardsOf: (r: Rec) => (r.preSemanticHazards ?? []) },
    { name: 'POST_VALIDATOR', hazardsOf: (r: Rec) => (r.validationState === 'VALID' ? (r.preSemanticHazards ?? []) : []) },
    { name: 'SHIPPED_PIPELINE', hazardsOf: (r: Rec) => (r.reasoning?.hazards ?? []) },
  ];

  // pipeline health
  let quotes = 0, unbound = 0, retries = 0, malformed = 0, providerFail = 0, rejected = 0;
  let fatalRejections = 0, advisories = 0;
  for (const r of records) {
    if (r.telemetry?.binding) { quotes += r.telemetry.binding.total; unbound += r.telemetry.binding.unbound; }
    if (r.attempts > 1) retries += 1;
    if (r.outcomeKind === 'MALFORMED_OUTPUT') malformed += 1;
    if (r.outcomeKind === 'PROVIDER_UNAVAILABLE' || r.outcomeKind === 'PROVIDER_TIMEOUT') providerFail += 1;
    if (r.outcomeKind === 'REJECTED_OUTPUT') rejected += 1;
    fatalRejections += new Set(r.semanticIssues.filter(i => i.severity === 'FATAL').map(i => i.candidateKey)).size;
    advisories += r.semanticIssues.filter(i => i.severity === 'ADVISORY').length;
  }
  const lat = records.map(r => r.totalMs).sort((a, b) => a - b);
  const pctl = (q: number) => lat.length ? lat[Math.min(lat.length - 1, Math.floor(lat.length * q))] : 0;
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const semanticCodeTally: Record<string, number> = {};
  for (const r of records) for (const i of r.semanticIssues) semanticCodeTally[i.code] = (semanticCodeTally[i.code] || 0) + 1;

  const report = {
    setId: capture.setId, role: capture.role, scoredAt: new Date().toISOString(),
    scenarios: records.length,
    tiers: tiers.map(t => scoreTier(records, t)),
    // L3-2c requires independent-source and authored-complement results be reported separately as
    // well as combined, so the weaker provenance of the authored half is never concealed.
    byProvenance: ['INDEPENDENT', 'AUTHORED_COMPLEMENT'].map(pc => ({
      provenanceClass: pc,
      scenarios: records.filter(r => r.provenanceClass === pc).length,
      tiers: tiers.map(t => scoreTier(records.filter(r => r.provenanceClass === pc), t)),
    })),
    demotions: {
      total: records.reduce((n, r) => n + (r.semanticDemoted?.length ?? 0), 0),
      synthesizedClarifications: records.reduce((n, r) => n + (r.semanticDemoted ?? []).filter(d => d.clarificationSynthesized).length, 0),
      ids: records.filter(r => (r.semanticDemoted?.length ?? 0) > 0).map(r => r.id),
    },
    pipeline: {
      providerFailures: providerFail, malformedOutput: malformed, validatorRejections: rejected,
      retries, quotationsEmitted: quotes, quotationsNotVerbatim: unbound,
      verbatimQuoteRatePct: quotes ? +((1 - unbound / quotes) * 100).toFixed(1) : null,
      semanticFatalRejections: fatalRejections, semanticAdvisories: advisories,
      semanticCodeTally,
    },
    operational: {
      medianLatencyMs: pctl(0.5), p90LatencyMs: pctl(0.9), p95LatencyMs: pctl(0.95), maxLatencyMs: lat[lat.length - 1] ?? 0,
      meanInputTokens: Math.round(sum(records.map(r => r.telemetry?.promptTokens ?? 0)) / Math.max(1, records.length)),
      meanOutputTokens: Math.round(sum(records.map(r => r.telemetry?.outputTokens ?? 0)) / Math.max(1, records.length)),
    },
    rows: records.map(r => ({
      id: r.id, provenanceClass: r.provenanceClass ?? null, failureMode: r.failureMode,
      expected: r.expect.ambiguous ? 'ambiguous' : r.expect.hazardEstablished,
      clarificationExpected: r.expect.clarificationExpected ?? null,
      outcomeKind: r.outcomeKind,
      rawStates: (r.preSemanticHazards ?? []).map(h => `${h.hazardFamily}/${h.conditionState}`),
      shippedStates: (r.reasoning?.hazards ?? []).map(h => `${h.hazardFamily}/${h.conditionState}`),
      clarificationRaised: (r.reasoning?.hazards ?? []).some(h => h.clarification),
      semanticCodes: [...new Set(r.semanticIssues.map(i => `${i.severity ?? '?'}:${i.code}`))],
      fabricatedQuotes: r.telemetry?.binding?.unbound ?? 0,
      demoted: (r.semanticDemoted ?? []).map(d => d.candidateKey),
    })),
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ scenarios: report.scenarios, tiers: report.tiers, demotions: report.demotions, pipeline: report.pipeline }, null, 2) + '\n');
}

main();
