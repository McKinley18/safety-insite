/**
 * EXPERT HAZLENZ -- ROUTING METRICS. Did the reasoning land in the right collection?
 *
 * ==================== WHY THIS IS NOT A QUALITY METRIC ====================
 *
 * This module measures REPRESENTATION, not reasoning. It never asks whether a hazard was correctly
 * identified; it asks whether information the model demonstrably produced arrived in the typed
 * collection whose criteria it satisfies, or drained into free text instead.
 *
 * That distinction is the whole point of the §100 finding. The model reasoned correctly about a
 * wet/electrical interaction and four decision-critical missing facts, and every one of them landed
 * in `expertExplanation`. Counting non-empty collections would have scored that as a reasoning
 * failure and sent the next phase off to change the wrong thing.
 *
 * ==================== FOUR VERDICTS, NOT TWO ====================
 *
 * `Do not infer success merely from non-empty collections.` A metric with only "populated" and
 * "empty" cannot tell a correct silence from a miss, and it rewards a model that fills every list
 * on every observation. So each collection on each fixture resolves to exactly one of:
 *
 *      CORRECT_EMPTY        expected nothing, produced nothing        <- negative controls live here
 *      INCORRECT_EMPTY      expected something, produced nothing      <- the routing MISS
 *      CORRECT_POPULATED    expected something, produced something
 *      INCORRECT_POPULATED  expected nothing, produced something      <- over-routing
 *
 * Only `REQUIRED` and `FORBIDDEN` expectations create an opportunity. `OPTIONAL` is scored as
 * neither hit nor miss, because a fixture that cannot say what the right answer is must not
 * contribute to a rate.
 *
 * ==================== EXPLANATION-ONLY LOSS ====================
 *
 * The headline measure, and it is defined precisely so it cannot be argued with. A concept probe
 * carries a pattern and the collection it belongs in. A loss is recorded when the pattern matches
 * the FREE TEXT (summary plus uncertainty statements) and does NOT match the text of its target
 * collection. That is exactly the sentence "information satisfying a typed criterion exists only in
 * free text", made checkable.
 *
 * A concept that appears in neither is not a loss -- the model simply did not raise it, which is a
 * reasoning observation and belongs to the evaluation, not here.
 */

import type { ExpertAnalysis } from './expert-contract.types';

export const ROUTING_COLLECTIONS = [
  'expertHazardCandidates',
  'decisionCriticalClarifications',
  'crossHazardInsights',
  'disagreements',
] as const;
export type RoutingCollection = (typeof ROUTING_COLLECTIONS)[number];

export const ROUTING_EXPECTATIONS = ['REQUIRED', 'FORBIDDEN', 'OPTIONAL'] as const;
export type RoutingExpectation = (typeof ROUTING_EXPECTATIONS)[number];

export const ROUTING_VERDICTS = [
  'CORRECT_EMPTY', 'INCORRECT_EMPTY', 'CORRECT_POPULATED', 'INCORRECT_POPULATED', 'NOT_SCORED',
] as const;
export type RoutingVerdict = (typeof ROUTING_VERDICTS)[number];

/** A concept that, if the model raises it at all, must appear in `collection`. */
export interface ConceptProbe {
  label: string;
  collection: RoutingCollection;
  /** Matched case-insensitively against free text and against the collection's own text. */
  pattern: RegExp;
}

export interface RoutingExpectations {
  expertHazardCandidates: RoutingExpectation;
  decisionCriticalClarifications: RoutingExpectation;
  crossHazardInsights: RoutingExpectation;
  disagreements: RoutingExpectation;
}

export interface ExplanationOnlyLoss {
  label: string;
  collection: RoutingCollection;
  /** Where the concept was found instead. */
  foundIn: 'summary' | 'uncertainty' | 'both';
}

export interface CollectionScore {
  collection: RoutingCollection;
  expectation: RoutingExpectation;
  count: number;
  verdict: RoutingVerdict;
}

export interface RoutingScore {
  fixtureId: string;
  perCollection: CollectionScore[];
  opportunities: number;
  hits: number;
  misses: number;
  overRouted: number;
  explanationOnlyLosses: ExplanationOnlyLoss[];
  /** Recorded separately: did a question survive with no candidate beside it? */
  zeroCandidateClarificationPresent: boolean;
  /** Recorded separately: uncertainty used as an overflow channel is a routing smell. */
  uncertaintyStatementCount: number;
}

// ---------------------------------------------------------------- text extraction

function collectionText(analysis: ExpertAnalysis, collection: RoutingCollection): string {
  switch (collection) {
    case 'expertHazardCandidates':
      return analysis.expertHazardCandidates
        .map(c => `${c.hazardFamily} ${c.evidenceBasis} ${c.reasoning}`).join(' \n');
    case 'decisionCriticalClarifications':
      return analysis.decisionCriticalClarifications
        .map(c => `${c.question} ${c.whyItMatters} ${c.evidenceGap}`).join(' \n');
    case 'crossHazardInsights':
      return analysis.crossHazardInsights
        .map(i => `${i.interactionKind} ${i.participants.join(' ')} ${i.reasoning}`).join(' \n');
    case 'disagreements':
      return analysis.disagreements.map(d => `${d.surface} ${d.reasoning}`).join(' \n');
  }
}

function collectionCount(analysis: ExpertAnalysis, collection: RoutingCollection): number {
  return analysis[collection].length;
}

function verdictFor(expectation: RoutingExpectation, count: number): RoutingVerdict {
  if (expectation === 'OPTIONAL') return 'NOT_SCORED';
  if (expectation === 'REQUIRED') return count > 0 ? 'CORRECT_POPULATED' : 'INCORRECT_EMPTY';
  return count > 0 ? 'INCORRECT_POPULATED' : 'CORRECT_EMPTY';
}

// ---------------------------------------------------------------- the score

export function scoreRouting(
  fixtureId: string,
  analysis: ExpertAnalysis,
  expectations: RoutingExpectations,
  probes: readonly ConceptProbe[],
): RoutingScore {
  const perCollection: CollectionScore[] = ROUTING_COLLECTIONS.map(collection => {
    const expectation = expectations[collection];
    const count = collectionCount(analysis, collection);
    return { collection, expectation, count, verdict: verdictFor(expectation, count) };
  });

  const summary = analysis.expertExplanation?.summary ?? '';
  const uncertainty = analysis.uncertainty.statements.join(' \n');

  const explanationOnlyLosses: ExplanationOnlyLoss[] = [];
  for (const probe of probes) {
    const inSummary = probe.pattern.test(summary);
    const inUncertainty = probe.pattern.test(uncertainty);
    if (!inSummary && !inUncertainty) continue;              // never raised -- not a routing loss
    if (probe.pattern.test(collectionText(analysis, probe.collection))) continue;  // routed correctly
    explanationOnlyLosses.push({
      label: probe.label,
      collection: probe.collection,
      foundIn: inSummary && inUncertainty ? 'both' : inSummary ? 'summary' : 'uncertainty',
    });
  }

  const scored = perCollection.filter(c => c.verdict !== 'NOT_SCORED');
  return {
    fixtureId,
    perCollection,
    opportunities: scored.length,
    hits: scored.filter(c => c.verdict === 'CORRECT_POPULATED' || c.verdict === 'CORRECT_EMPTY').length,
    misses: scored.filter(c => c.verdict === 'INCORRECT_EMPTY').length,
    overRouted: scored.filter(c => c.verdict === 'INCORRECT_POPULATED').length,
    explanationOnlyLosses,
    zeroCandidateClarificationPresent:
      analysis.expertHazardCandidates.length === 0
      && analysis.decisionCriticalClarifications.length > 0,
    uncertaintyStatementCount: analysis.uncertainty.statements.length,
  };
}

export interface RoutingTotals {
  TYPED_ROUTING_OPPORTUNITIES: number;
  TYPED_ROUTING_HITS: number;
  TYPED_ROUTING_MISSES: number;
  TYPED_ROUTING_OVER_ROUTED: number;
  EXPLANATION_ONLY_LOSSES: number;
  byCollection: Record<RoutingCollection, { opportunities: number; hits: number; misses: number; overRouted: number }>;
}

export function totalRouting(scores: readonly RoutingScore[]): RoutingTotals {
  const byCollection = Object.fromEntries(ROUTING_COLLECTIONS.map(c =>
    [c, { opportunities: 0, hits: 0, misses: 0, overRouted: 0 }])) as RoutingTotals['byCollection'];

  for (const s of scores) {
    for (const c of s.perCollection) {
      if (c.verdict === 'NOT_SCORED') continue;
      const b = byCollection[c.collection];
      b.opportunities += 1;
      if (c.verdict === 'CORRECT_POPULATED' || c.verdict === 'CORRECT_EMPTY') b.hits += 1;
      if (c.verdict === 'INCORRECT_EMPTY') b.misses += 1;
      if (c.verdict === 'INCORRECT_POPULATED') b.overRouted += 1;
    }
  }

  return {
    TYPED_ROUTING_OPPORTUNITIES: scores.reduce((a, s) => a + s.opportunities, 0),
    TYPED_ROUTING_HITS: scores.reduce((a, s) => a + s.hits, 0),
    TYPED_ROUTING_MISSES: scores.reduce((a, s) => a + s.misses, 0),
    TYPED_ROUTING_OVER_ROUTED: scores.reduce((a, s) => a + s.overRouted, 0),
    EXPLANATION_ONLY_LOSSES: scores.reduce((a, s) => a + s.explanationOnlyLosses.length, 0),
    byCollection,
  };
}
