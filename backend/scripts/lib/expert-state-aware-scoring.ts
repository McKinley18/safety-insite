/**
 * DIAGNOSTIC-ONLY, RECORDING-ONLY -- state-aware Expert measurement (§116).
 *
 * ==================== WHAT THIS IS AND IS NOT ====================
 *
 * IS: an ADDITIONAL record computed beside `scoreRouting`, exposing the axes the frozen scorer
 * cannot see.
 *
 * IS NOT: a change to any pass/fail gate. `expert-routing-metrics.ts` is untouched, `verdictFor`
 * is untouched, `ROUTING_EXPECTATIONS` is untouched, and no historical score is recomputed or
 * rewritten. §115/D-127 authorised instrumentation, explicitly "RECORDING ONLY, because changing
 * what verdictFor() scores would alter a frozen protected metric and needs its own authorization."
 *
 * ==================== THE DEFECT THIS EXISTS TO MAKE VISIBLE ====================
 *
 * `verdictFor(expectation, count)` receives only a cardinality. Across the nine frozen hosted R6
 * responses the asserted state moved `UNKNOWN`x3 (v4) -> `ACTIVE`x3 (v5) -> `ACTIVE`x3 (v6) while
 * every one of them scored the identical `INCORRECT_POPULATED`. §114.2 therefore recorded "no
 * movement" for a sequence that had moved, adversely. This module makes that difference a number.
 *
 * The headline measure is NOT candidate count. It is `overridePathwaySupplied`: when Expert emits a
 * same-family candidate against a deterministic `CONTROLLED` or `NOT_APPLICABLE` assessment, did it
 * identify a concrete current fact that defeats the deterministic rationale, or did it simply
 * restate the physical fact the engine already weighed?
 */

import type { ExpertAnalysis } from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import type { DeterministicFamilyDisposition } from './expert-deterministic-projection';

/**
 * Phrases that mark a consequence as conditional on something the responder supplied rather than
 * on a stated fact. Drawn from the ACTUAL hosted transcripts (§110/§112/§114) rather than invented,
 * so they match the model's own vocabulary -- the same discipline `ConceptProbe` patterns use.
 */
const HYPOTHETICAL_MARKERS: readonly RegExp[] = [
  /\bif\s+(?:the\s+)?(?:machine|press|equipment|guard|worker|personnel|anyone|someone)\b/i,
  /\bif\s+re-?energiz/i,
  /\bonce\s+re-?energiz/i,
  /\bwere\s+to\s+(?:approach|contact|reach|start)/i,
  /\bcould\s+(?:contact|approach|be\s+exposed)/i,
  /\bwould\s+be\s+exposed/i,
  /\bany\s+worker\s+approaching/i,
  /\bbefore\s+(?:the\s+)?(?:press|machine|equipment)\s+is\s+(?:re-?energiz|return)/i,
  /\bunless\s+the\s+guard\s+is\s+restored/i,
];

/**
 * Phrases that mark a CURRENT, stated exposure -- the thing an override must supply. Also drawn
 * from the corpus's own adversarial fixtures (`V7`: "is currently reaching into the point of
 * operation"; `V8`: "is currently grinding"), not from invented wording.
 */
const CURRENT_EXPOSURE_MARKERS: readonly RegExp[] = [
  /\bis\s+currently\s+(?:reaching|grinding|working|positioned|exposed|standing)/i,
  /\bcurrently\s+(?:reaching|grinding)\s+into|\bwith\s+both\s+hands\b/i,
  /\bremains?\s+(?:connected|charged|live|energiz)/i,
  /\bwas\s+not\s+bled\s+down\b|\bnot\s+yet\s+been\s+bled\b/i,
  /\bno\s+lock\s+or\s+tag\s+was\s+applied\b/i,
  /\bre-?energize\s+circuits\s+without\s+operator\s+action\b/i,
  /\bhas\s+been\s+returned\s+to\s+(?:operation|service)\b|\bis\s+running\b|\bis\s+in\s+operation\b/i,
  /\bsecond\b[^.]{0,40}\b(?:energy\s+source|circuit|supply)\b/i,
];

export interface StateAwareCandidateRecord {
  candidateKey: string;
  hazardFamily: string;
  /** THE axis the frozen scorer cannot see. */
  assertedConditionState: string;
  confidence: string;
  relationshipToDeterministic: string;
  requiresUserConfirmation: boolean;
  groundingStatus: string;
  evidenceQuoteCount: number;
  /** True when this candidate names a family the deterministic layer already assessed. */
  sameFamilyAsDeterministicAssessment: boolean;
  /** The deterministic disposition it stands against, when there is one. */
  standsAgainstDisposition: string | null;
  /**
   * The headline measure. True only when the candidate BOTH declares
   * `CONTRADICTS_DETERMINISTIC` AND names a concrete current fact -- not merely a hypothetical it
   * supplied itself.
   */
  overridePathwaySupplied: boolean;
  /** Recorded so an override claim can be audited rather than trusted. */
  currentExposureMarkersMatched: string[];
  hypotheticalMarkersMatched: string[];
}

export interface StateAwareRecord {
  fixtureId: string;
  arm: string;
  rep: number;
  outcome: string;
  counts: { candidates: number; clarifications: number; insights: number; disagreements: number };
  candidates: StateAwareCandidateRecord[];
  /** Clarification criticality distribution -- survival, not just presence. */
  clarificationCriticalities: string[];
  clarificationAffectedDecisions: string[];
  disagreementSurfaces: string[];
  disagreementTypes: string[];
  /**
   * Summary verdicts, all RECORDING-ONLY.
   * `UNSUPPORTED_SAME_FAMILY_ACTIVE` is the R6 defect stated as a measurement: a same-family
   * ACTIVE candidate raised against a CONTROLLED/NOT_APPLICABLE assessment with no override
   * pathway.
   */
  unsupportedSameFamilyActive: number;
  supportedOverrides: number;
  agreedSilently: boolean;
}

function matched(text: string, patterns: readonly RegExp[]): string[] {
  return patterns.filter(p => p.test(text)).map(p => p.source);
}

export function recordStateAware(
  fixtureId: string,
  arm: string,
  rep: number,
  analysis: ExpertAnalysis,
  dispositions: readonly DeterministicFamilyDisposition[],
): StateAwareRecord {
  const byFamily = new Map(dispositions.map(d => [d.hazardFamily, d]));

  const candidates: StateAwareCandidateRecord[] = analysis.expertHazardCandidates.map(c => {
    const disposition = byFamily.get(c.hazardFamily) ?? null;
    const text = `${c.evidenceBasis} ${c.reasoning}`;
    const current = matched(text, CURRENT_EXPOSURE_MARKERS);
    const hypothetical = matched(text, HYPOTHETICAL_MARKERS);
    const standsAgainst = disposition
      && (disposition.disposition === 'CONTROLLED' || disposition.disposition === 'NOT_APPLICABLE')
      ? disposition.disposition : null;
    const overridePathwaySupplied =
      standsAgainst !== null
      && c.relationshipToDeterministic === 'CONTRADICTS_DETERMINISTIC'
      && current.length > 0;
    return {
      candidateKey: c.candidateKey,
      hazardFamily: c.hazardFamily,
      assertedConditionState: c.assertedConditionState,
      confidence: c.confidence,
      relationshipToDeterministic: c.relationshipToDeterministic,
      requiresUserConfirmation: c.requiresUserConfirmation,
      groundingStatus: c.evidence.length > 0 ? 'EXACT_QUOTE_SUPPLIED' : 'NO_EXACT_QUOTE_AVAILABLE',
      evidenceQuoteCount: c.evidence.length,
      sameFamilyAsDeterministicAssessment: disposition !== null,
      standsAgainstDisposition: standsAgainst,
      overridePathwaySupplied,
      currentExposureMarkersMatched: current,
      hypotheticalMarkersMatched: hypothetical,
    };
  });

  const unsupportedSameFamilyActive = candidates.filter(c =>
    c.standsAgainstDisposition !== null
    && c.assertedConditionState === 'ACTIVE'
    && !c.overridePathwaySupplied).length;

  return {
    fixtureId, arm, rep,
    outcome: analysis.outcome,
    counts: {
      candidates: analysis.expertHazardCandidates.length,
      clarifications: analysis.decisionCriticalClarifications.length,
      insights: analysis.crossHazardInsights.length,
      disagreements: analysis.disagreements.length,
    },
    candidates,
    clarificationCriticalities: analysis.decisionCriticalClarifications.map(c => c.criticality),
    clarificationAffectedDecisions: analysis.decisionCriticalClarifications.map(c => c.affectedDecision),
    disagreementSurfaces: analysis.disagreements.map(d => d.surface),
    disagreementTypes: analysis.disagreements.map(d => d.disagreementType),
    unsupportedSameFamilyActive,
    supportedOverrides: candidates.filter(c => c.overridePathwaySupplied).length,
    agreedSilently: analysis.expertHazardCandidates.length === 0
      && analysis.decisionCriticalClarifications.length === 0,
  };
}

/** Aggregate for reporting. Recording-only; produces no verdict and gates nothing. */
export function summarizeStateAware(records: readonly StateAwareRecord[]) {
  const stateCounts: Record<string, number> = {};
  for (const r of records) {
    for (const c of r.candidates) {
      stateCounts[c.assertedConditionState] = (stateCounts[c.assertedConditionState] ?? 0) + 1;
    }
  }
  return {
    reps: records.length,
    assertedConditionStateDistribution: stateCounts,
    totalCandidates: records.reduce((a, r) => a + r.counts.candidates, 0),
    totalClarifications: records.reduce((a, r) => a + r.counts.clarifications, 0),
    totalDisagreements: records.reduce((a, r) => a + r.counts.disagreements, 0),
    unsupportedSameFamilyActive: records.reduce((a, r) => a + r.unsupportedSameFamilyActive, 0),
    supportedOverrides: records.reduce((a, r) => a + r.supportedOverrides, 0),
    silentAgreementReps: records.filter(r => r.agreedSilently).length,
  };
}
