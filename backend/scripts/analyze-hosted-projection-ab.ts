/**
 * §118 -- ANALYSIS of the frozen hosted projection A/B. ZERO provider calls.
 *
 * Reads the frozen transport JSONL and computes the accounting the authorization requires:
 * routing, grounding/boundary, asserted-condition-state comparison, unsupported-current-pathway
 * counts, and the DERIVED contradiction classification (§117 established that the model's own
 * `relationshipToDeterministic` label is poorly calibrated, so the derived class is the primary
 * diagnostic and the declared label is reported beside it, never instead of it).
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { scoreRouting } from '../src/hazlenz/expert-hazlenz/expert-routing-metrics';
import { ROUTING_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/routing-fixtures';
import { ADVERSARIAL_RECALL_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/hazard-actuality-fixtures';
import { RESTORATION_TRANSITION_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/restoration-transition-fixtures';

const OUT = join(__dirname, '..', '..', 'verification', 'expert-hazlenz-hosted-projection-ab-2026-08-31');
const rows = readFileSync(join(OUT, 'transport', 'projection-ab.jsonl'), 'utf8')
  .trim().split('\n').map(l => JSON.parse(l));

/** Expectations per case. `V1-CTRL` reuses V1's. */
function expectationsFor(caseId: string) {
  if (caseId === 'R6') return ROUTING_FIXTURES.find(f => f.id === 'R6')!.expectations;
  if (caseId === 'R6-I') return RESTORATION_TRANSITION_FIXTURES.find(f => f.id === 'R6-I')!.expectations;
  if (caseId === 'R6-H') return RESTORATION_TRANSITION_FIXTURES.find(f => f.id === 'R6-H')!.expectations;
  const id = caseId === 'V1-CTRL' ? 'V1' : caseId;
  return ADVERSARIAL_RECALL_FIXTURES.find(f => f.id === id)!.expectations;
}

/** A stated current fact, drawn from the observations themselves rather than invented wording. */
const CURRENT_PATHWAY = /\bis\s+(?:currently\s+)?(?:running|operating|reaching|grinding|cycling)\b|\bcurrently\s+\w+ing\b|\bnow\s+running\b|\bactively\s+cycling\b|\bremain(?:s|ed|ing)?\s+(?:connected|charged|live|energi[sz]ed)\b|\bnot\s+(?:yet\s+)?(?:been\s+)?(?:bled|verified|relieved)\b|\bno\s+lock\s+or\s+tag\b|\bwithout\s+operator\s+action\b|\bpoint\s+of\s+operation\s+exposed\b|\bnot\s+locked\s+out\b/i;
/** A consequence conditional on something the responder supplied. */
const HYPOTHETICAL = /\bif\s+(?:the\s+)?(?:machine|press|equipment|guard|worker|personnel|anyone|someone|it)\b|\bif\s+re-?energiz|\bonce\s+re-?energiz|\bwere\s+to\s+(?:approach|contact|reach|start|cycle)|\bcould\s+(?:contact|approach|be\s+exposed)|\bwould\s+be\s+exposed|\bany\s+worker\s+approaching|\bunless\s+the\s+guard\s+is\s+restored/i;

type Derived = 'TRUE_DETERMINISTIC_CONTRADICTION' | 'UNSUPPORTED_CONTRADICTION' | 'AGREES_WITH_DETERMINISTIC'
  | 'ADDITIONAL_NOT_CONTRADICTING' | 'CROSS_FAMILY_ADDITION';

const perArm: Record<string, {
  calls: number; candidates: number; clarifications: number; insights: number; disagreements: number;
  states: Record<string, number>; declared: Record<string, number>; derived: Record<string, number>;
  supportedPathway: number; unsupportedPathway: number;
  routingOpportunities: number; hits: number; misses: number; overRouted: number;
  explanationOnlyLosses: number;
  groundingOpportunities: number; quotesEmitted: number; exactBound: number; unbindable: number;
  evidenceOutOfBounds: number; itemRejections: number; analysisRejections: number;
  malformed: number; outcomeInconsistencies: number;
  inputTokens: number; outputTokens: number; costUsd: number; latencies: number[];
}> = {};

const perCase: Record<string, Record<string, unknown>> = {};

for (const r of rows) {
  const arm = r.arm as string;
  perArm[arm] = perArm[arm] ?? {
    calls: 0, candidates: 0, clarifications: 0, insights: 0, disagreements: 0,
    states: {}, declared: {}, derived: {}, supportedPathway: 0, unsupportedPathway: 0,
    routingOpportunities: 0, hits: 0, misses: 0, overRouted: 0, explanationOnlyLosses: 0,
    groundingOpportunities: 0, quotesEmitted: 0, exactBound: 0, unbindable: 0,
    evidenceOutOfBounds: 0, itemRejections: 0, analysisRejections: 0,
    malformed: 0, outcomeInconsistencies: 0,
    inputTokens: 0, outputTokens: 0, costUsd: 0, latencies: [],
  };
  const A = perArm[arm];
  A.calls += 1;
  A.inputTokens += r.inputTokens ?? 0;
  A.outputTokens += r.outputTokens ?? 0;
  A.costUsd += r.costUsd ?? 0;
  A.latencies.push(r.latencyMs ?? 0);

  if (!r.ok) { A.malformed += 1; continue; }
  if (r.normalizationState !== 'VALID') { A.analysisRejections += 1; continue; }

  const a = r.analysis;
  A.candidates += a.expertHazardCandidates.length;
  A.clarifications += a.decisionCriticalClarifications.length;
  A.insights += a.crossHazardInsights.length;
  A.disagreements += a.disagreements.length;

  // grounding / boundary
  A.groundingOpportunities += a.expertHazardCandidates.length;
  A.quotesEmitted += r.binding?.total ?? 0;
  A.exactBound += r.binding?.bound ?? 0;
  A.unbindable += r.binding?.unbindable ?? 0;
  for (const code of (r.issues ?? [])) {
    if (code === 'EVIDENCE_OUT_OF_BOUNDS') A.evidenceOutOfBounds += 1;
    else A.itemRejections += 1;
  }
  // outcome/content consistency: NOTHING_TO_ADD must mean every typed list is empty.
  const anyTyped = a.expertHazardCandidates.length + a.decisionCriticalClarifications.length
    + a.crossHazardInsights.length + a.disagreements.length;
  if ((a.outcome === 'NOTHING_TO_ADD' && anyTyped > 0) || (a.outcome === 'ANALYZED' && anyTyped === 0)) {
    A.outcomeInconsistencies += 1;
  }

  // routing
  const score = scoreRouting(r.caseId, a, expectationsFor(r.caseId), []);
  A.routingOpportunities += score.opportunities;
  A.hits += score.hits;
  A.misses += score.misses;
  A.overRouted += score.overRouted;
  A.explanationOnlyLosses += score.explanationOnlyLosses.length;

  const dispositions = new Map<string, string>();
  for (const s of (r.projectedDispositions ?? []) as string[]) {
    const [fam, rest] = s.split('=');
    dispositions.set(fam, (rest ?? '').split('@')[0]);
  }

  const candDetail: unknown[] = [];
  for (const c of a.expertHazardCandidates) {
    A.states[c.assertedConditionState] = (A.states[c.assertedConditionState] ?? 0) + 1;
    A.declared[c.relationshipToDeterministic] = (A.declared[c.relationshipToDeterministic] ?? 0) + 1;
    const text = `${c.evidenceBasis} ${c.reasoning}`;
    const supported = CURRENT_PATHWAY.test(text);
    const hypothetical = HYPOTHETICAL.test(text);
    if (supported) A.supportedPathway += 1; else A.unsupportedPathway += 1;

    const d = dispositions.get(c.hazardFamily);
    let derived: Derived;
    if (!d) derived = 'CROSS_FAMILY_ADDITION';
    else if (d === 'CONTROLLED' || d === 'NOT_APPLICABLE' || d === 'UNKNOWN') {
      if (c.assertedConditionState !== 'ACTIVE') derived = 'AGREES_WITH_DETERMINISTIC';
      else derived = supported ? 'TRUE_DETERMINISTIC_CONTRADICTION' : 'UNSUPPORTED_CONTRADICTION';
    } else derived = c.assertedConditionState === 'ACTIVE'
      ? 'ADDITIONAL_NOT_CONTRADICTING' : 'AGREES_WITH_DETERMINISTIC';
    A.derived[derived] = (A.derived[derived] ?? 0) + 1;
    candDetail.push({
      family: c.hazardFamily, state: c.assertedConditionState, confidence: c.confidence,
      declared: c.relationshipToDeterministic, derived,
      supportedCurrentPathway: supported, hypotheticalMarkerPresent: hypothetical,
      quotes: c.evidence.length,
    });
  }

  perCase[`${r.caseId}|${r.arm}|rep${r.rep}`] = {
    outcome: a.outcome,
    counts: { candidates: a.expertHazardCandidates.length, clarifications: a.decisionCriticalClarifications.length,
      insights: a.crossHazardInsights.length, disagreements: a.disagreements.length },
    clarificationCriticalities: a.decisionCriticalClarifications.map((q: { criticality: string }) => q.criticality),
    disagreementSurfaces: a.disagreements.map((d: { surface: string }) => d.surface),
    uncertaintyStatements: a.uncertainty?.statements?.length ?? 0,
    projectedDispositions: r.projectedDispositions,
    routing: { opportunities: score.opportunities, hits: score.hits, misses: score.misses, overRouted: score.overRouted },
    candidates: candDetail,
    issues: r.issues,
  };
}

const summary = {
  generatedAt: new Date().toISOString(),
  note: 'Analysis only. ZERO provider calls. Nothing repaired.',
  perArm: Object.fromEntries(Object.entries(perArm).map(([k, v]) => [k, {
    ...v,
    latencyP50Ms: v.latencies.sort((a, b) => a - b)[Math.floor(v.latencies.length / 2)],
    latencyMaxMs: Math.max(...v.latencies),
    latencies: undefined,
    costUsd: Number(v.costUsd.toFixed(6)),
  }])),
  perCase,
};
writeFileSync(join(OUT, 'results', 'analysis.json'), JSON.stringify(summary, null, 2) + '\n');

for (const [arm, v] of Object.entries(summary.perArm)) {
  const a = v as Record<string, unknown>;
  console.log(`===== ARM ${arm}`);
  console.log(`  calls=${a.calls} cand=${a.candidates} clar=${a.clarifications} insights=${a.insights} disagreements=${a.disagreements}`);
  console.log(`  assertedConditionState: ${JSON.stringify(a.states)}`);
  console.log(`  declared relationship  : ${JSON.stringify(a.declared)}`);
  console.log(`  DERIVED classification : ${JSON.stringify(a.derived)}`);
  console.log(`  supportedPathway=${a.supportedPathway}  UNSUPPORTED_PATHWAY=${a.unsupportedPathway}`);
  console.log(`  routing: opp=${a.routingOpportunities} hits=${a.hits} misses=${a.misses} overRouted=${a.overRouted} explOnlyLoss=${a.explanationOnlyLosses}`);
  console.log(`  grounding: opp=${a.groundingOpportunities} quotes=${a.quotesEmitted} bound=${a.exactBound} unbindable=${a.unbindable} OOB=${a.evidenceOutOfBounds} itemRej=${a.itemRejections} analysisRej=${a.analysisRejections} malformed=${a.malformed} outcomeInconsist=${a.outcomeInconsistencies}`);
  console.log(`  tokens in/out=${a.inputTokens}/${a.outputTokens} cost=$${a.costUsd} latency p50=${a.latencyP50Ms}ms max=${a.latencyMaxMs}ms`);
}
console.log('\nwritten:', join(OUT, 'results', 'analysis.json'));
