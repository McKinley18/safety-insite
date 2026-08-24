/**
 * L3-2e -- scores a captured run at THREE TIERS, which Phase 9 requires be kept apart.
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
  semanticClarificationsDropped?: Array<{ candidateKey: string; conditionState: string; question: string }>;
  semanticObservationAvailability?: Array<{ sourceId: string; availability: string; unobservedFacts: string[] }>;
  expect: {
    hazardEstablished?: boolean | null; conditionState?: string; familyPattern?: string;
    acceptableStates?: string[]; highConsequence?: boolean; ambiguous?: boolean; negativeControl?: boolean;
    decisionIsMade?: boolean; whyQuestion?: string; whyNoQuestion?: string;
    roleUnderTest?: string; tokenUnderTest?: string; observationAvailability?: string;
    unobservedFactIsDeciding?: boolean; clausePositionTrap?: boolean; coversFamily?: string;
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
    correctedStateScored: 0, correctedStateCorrect: 0, correctedStateWrongIds: [] as string[],
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
      // Corrected/controlled/removed/negated/hypothetical: the "decided, non-active" family.
      if ((r.cohort || '').includes('condition_state')) {
        g.correctedStateScored += 1;
        if (!asserts) g.correctedStateCorrect += 1; else g.correctedStateWrongIds.push(r.id);
      }
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
    correctedStateAccuracy: g.correctedStateScored ? `${g.correctedStateCorrect} of ${g.correctedStateScored}` : 'n/a',
    correctedStateWrongIds: g.correctedStateWrongIds,
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
    // L3-2d: recall alone is not a report. TP/FP/FN with the reason each scenario was labelled.
    clarificationMatrix: tiers.map(t => {
      const rows = records.map(r => {
        const hz = t.hazardsOf(r);
        const actual = hz.some(h => h.clarification);
        const expected = r.expect.clarificationExpected === true;
        return {
          id: r.id, provenanceClass: r.provenanceClass ?? null,
          expectedClarification: expected, actualClarification: actual,
          verdict: expected && actual ? 'TP' : (!expected && actual ? 'FP' : (expected && !actual ? 'FN' : 'TN')),
          conditionStates: hz.map(h => h.conditionState),
          evidenceSufficient: r.expect.decisionIsMade ?? null,
          reason: (r.expect.whyQuestion as string) ?? (r.expect.whyNoQuestion as string) ?? null,
          triggerClass: r.cohort ?? null,
          droppedByBinder: (r.semanticClarificationsDropped ?? []).map(d => d.conditionState),
        };
      });
      const tp = rows.filter(x => x.verdict === 'TP').length;
      const fp = rows.filter(x => x.verdict === 'FP').length;
      const fn = rows.filter(x => x.verdict === 'FN').length;
      const tn = rows.filter(x => x.verdict === 'TN').length;
      return {
        tier: t.name, TP: tp, FP: fp, FN: fn, TN: tn,
        precision: tp + fp ? +(tp / (tp + fp) * 100).toFixed(1) : null,
        recall: tp + fn ? +(tp / (tp + fn) * 100).toFixed(1) : null,
        unnecessaryClarifications: fp,
        falsePositiveIds: rows.filter(x => x.verdict === 'FP').map(x => x.id),
        falseNegativeIds: rows.filter(x => x.verdict === 'FN').map(x => x.id),
        rows: rows.filter(x => x.expectedClarification || x.actualClarification),
      };
    }),
    // L3-2d: every high-consequence scenario, at every stage, with attribution for any loss.
    highConsequenceReport: records.filter(r => r.expect.highConsequence === true).map(r => {
      const raw = r.preSemanticHazards ?? [];
      const post = r.validationState === 'VALID' ? raw : [];
      const shipped = r.reasoning?.hazards ?? [];
      const act = (h: Array<{ conditionState: string }>) => h.some(x => x.conditionState === 'ACTIVE');
      const lostAt = act(raw) ? (act(post) ? (act(shipped) ? null : 'binder') : 'validator') : 'provider';
      return {
        id: r.id, provenanceClass: r.provenanceClass ?? null,
        providerCandidates: raw.length, providerActive: act(raw),
        postValidatorCandidates: post.length, postValidatorActive: act(post),
        shippedCandidates: shipped.length, shippedActive: act(shipped),
        conditionStates: shipped.map(h => h.conditionState),
        evidenceBound: shipped.reduce((n, h) => n + (h.evidence?.length ?? 0), 0),
        fabricatedQuotes: r.telemetry?.binding?.unbound ?? 0,
        stageAttributionOfLoss: act(shipped) ? null : lostAt,
      };
    }),
    // L3-2e: per-family hazard recall at the shipped tier, and which families the sealed set covers.
    perFamilyRecall: (() => {
      const fam: Record<string, { expected: number; found: number; highConsequenceExpected: number; highConsequenceFound: number; ids: string[] }> = {};
      for (const r of records) {
        if (r.expect.hazardEstablished !== true || !r.expect.familyPattern) continue;
        const re = new RegExp(r.expect.familyPattern, 'i');
        const hz = r.reasoning?.hazards ?? [];
        const hit = hz.some(h => h.conditionState === ACTIVE && re.test(h.hazardFamily));
        const anyActive = hz.some(h => h.conditionState === ACTIVE);
        for (const f of String(r.expect.familyPattern).split('|')) {
          fam[f] = fam[f] || { expected: 0, found: 0, highConsequenceExpected: 0, highConsequenceFound: 0, ids: [] };
          fam[f].expected += 1;
          if (hit || anyActive) fam[f].found += 1; else fam[f].ids.push(r.id);
          if (r.expect.highConsequence) {
            fam[f].highConsequenceExpected += 1;
            if (anyActive) fam[f].highConsequenceFound += 1;
          }
        }
      }
      return fam;
    })(),
    // L3-2e: every scenario carrying a hazard/correction token in a declared non-predicate role.
    syntacticRoleReport: records.filter(r => r.expect.roleUnderTest).map(r => {
      const hz = r.reasoning?.hazards ?? [];
      const codes = [...new Set(r.semanticIssues.filter(i => i.severity === 'FATAL').map(i => i.code))];
      const expectedInfluence = r.expect.hazardEstablished === true ? 'must NOT delete the finding' : 'may legitimately refuse ACTIVE';
      const actualInfluence = codes.length ? `fired ${codes.join(',')}` : 'no fatal check fired';
      return {
        id: r.id, token: r.expect.tokenUnderTest ?? null, role: r.expect.roleUnderTest ?? null,
        candidateFamilies: hz.map(h => h.hazardFamily),
        polarity: /\bno\b|\bnot\b|without|never|none/i.test(r.text) ? 'negated context present' : 'affirmative',
        checkInvoked: codes.length ? codes : ['none'],
        influencedAcceptance: codes.length > 0,
        expectedInfluence, actualInfluence,
        shippedStates: hz.map(h => h.conditionState),
        correct: (r.expect.hazardEstablished === true) === hz.some(h => h.conditionState === ACTIVE),
      };
    }),
    // L3-2e: every observation-availability scenario, judged against decision-criticality.
    observationAvailabilityReport: records.filter(r => r.expect.observationAvailability || (r.semanticObservationAvailability?.length ?? 0) > 0).map(r => {
      const hz = r.reasoning?.hazards ?? [];
      return {
        id: r.id,
        declaredAvailability: r.expect.observationAvailability ?? null,
        detectedAvailability: r.semanticObservationAvailability?.[0]?.availability ?? 'UNSPECIFIED',
        unobservedFacts: r.semanticObservationAvailability?.[0]?.unobservedFacts ?? [],
        unobservedFactIsDeciding: r.expect.unobservedFactIsDeciding ?? null,
        otherFactualPredicateEstablishesHazard: r.expect.hazardEstablished === true,
        expectedState: r.expect.hazardEstablished === true ? 'ACTIVE' : (r.expect.acceptableStates ?? []).join('|'),
        actualStates: hz.map(h => h.conditionState),
        expectedClarification: r.expect.clarificationExpected ?? null,
        actualClarification: hz.some(h => h.clarification),
        triggerClass: r.cohort ?? null,
        correct: ((r.expect.hazardEstablished === true) === hz.some(h => h.conditionState === ACTIVE))
          && ((r.expect.clarificationExpected === true) === hz.some(h => h.clarification)),
      };
    }),
    clarificationsDroppedByBinder: {
      total: records.reduce((n, r) => n + (r.semanticClarificationsDropped?.length ?? 0), 0),
      ids: records.filter(r => (r.semanticClarificationsDropped?.length ?? 0) > 0).map(r => r.id),
    },
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
      contradictionCheckRejections: semanticCodeTally['SEMANTIC_EVIDENCE_CONTRADICTS_STATE'] ?? 0,
      stateSupportCheckRejections: semanticCodeTally['SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE'] ?? 0,
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
  process.stdout.write(JSON.stringify({
    scenarios: report.scenarios, tiers: report.tiers,
    clarificationMatrix: report.clarificationMatrix.map(m => ({ ...m, rows: undefined })),
    perFamilyRecall: report.perFamilyRecall,
    demotions: report.demotions, clarificationsDroppedByBinder: report.clarificationsDroppedByBinder,
    pipeline: report.pipeline,
  }, null, 2) + '\n');
}

main();
