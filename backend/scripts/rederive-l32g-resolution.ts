/**
 * L3-2g -- DETERMINISTIC RESOLUTION ABLATION, over FROZEN provider facts.
 *
 * WHY THIS IS A SEPARATE PROGRAM FROM THE INFERENCE ABLATION. Question B asks whether a
 * deterministic layer can safely consume independently-emitted semantic facts. That question is
 * about the RESOLVER, and mixing it into a run that also re-queries the provider would confound the
 * two: any change in the result could be the new rule OR a different model answer.
 *
 * So this program performs NO INFERENCE AT ALL. It reads the `stateFacts` the provider already
 * emitted in `ablation-run-1.json` and re-resolves them under competing rule orderings. Provider
 * variance is therefore EXACTLY ZERO by construction, and every difference reported here is
 * attributable to the resolution rule and to nothing else.
 *
 * THE ORDERINGS UNDER TEST
 *
 *   R0_HAZARD_FIRST     `state-facts.ts` as written: an asserted hazard is resolved before a missing
 *                       decision-critical fact is consulted. This is the design the phase opened
 *                       with, and the ablation measured it dropping the clarification on `F-OA-01`
 *                       and `F-OA-02` -- the model emitted BOTH `hazardAsserted: true` and
 *                       `decisionCriticalFactMissing: true`, and the hazard arm ran first.
 *
 *   R1_MISSING_FIRST    the decision-critical-fact arm is consulted BEFORE the hazard arm. This is
 *                       §35.2's rule taken literally: *is the thing that could not be observed the
 *                       fact that DECIDES this candidate?* -- and if the model says yes, that is the
 *                       answer, whatever else it also said.
 *
 *   R2_MISSING_UNLESS_CONTROL_STATED  the middle position: a missing decision-critical fact outranks
 *                       an asserted hazard ONLY when the control reading is `NOT_STATED`. Where the
 *                       text affirmatively says a control is ABSENT, DEFEATED or WARNS_ONLY, the
 *                       hazard is established and §36.1's rule holds -- the missing control IS the
 *                       finding, and retreating to INSUFFICIENT_EVIDENCE there is the `H-NG-02`
 *                       failure that cost L3-2c an entire phase.
 *
 * WHAT MAY AND MAY NOT BE CONCLUDED. These orderings are being selected against KNOWN cases, which
 * the entry contract permits for architecture selection and explicitly forbids being reported as
 * generalisation evidence. Whichever ordering wins here has been TUNED ON DIAGNOSTIC EVIDENCE and
 * carries no advancement claim whatsoever.
 *
 * ============================ L3-2i CORRECTION (D-56) ============================
 *
 * `A_SCENARIO_THE_SCORER_CANNOT_SEE_IS_NOT_A_SCENARIO_THE_PROVIDER_PASSED`
 *
 * The row filter below (`r.derived && r.derived.length`) removes every scenario where the provider
 * emitted ZERO candidates. Because a clarification can only ride on a hazard candidate (§39.5.1),
 * that filter removed exactly the scenarios where the clarification was LOST -- so clarification
 * recall was computed on a reduced denominator and a provider was never charged for a clarification
 * it failed to raise by emitting nothing at all.
 *
 * The filter is DELIBERATELY KEPT for every metric it already governed. Those metrics are
 * candidate-conditioned by construction (you cannot resolve facts that were never emitted), and
 * §37/§38/§39 recorded them under exactly this filter. Changing them here would silently rewrite
 * history that `UPDATE POLICY` item 4 preserves.
 *
 * What is ADDED is a second, separately-named measurement over the UNFILTERED rows:
 *
 *   candidateConditionedClarification  denominator = CLARIFICATION_REQUIRED scenarios in which the
 *                                      provider emitted at least one candidate. Diagnostic. This is
 *                                      the metric behind §37's and §38's recorded 75%.
 *
 *   scenarioLevelClarification         denominator = ALL CLARIFICATION_REQUIRED scenarios. A
 *                                      zero-candidate row counts as a MISS, because the inspector
 *                                      was owed a question and did not get one. THIS is the
 *                                      advancement-relevant metric.
 *
 * The two are reported side by side and NEVER renamed into each other. High-consequence scoring and
 * false-ACTIVE scoring are UNTOUCHED and remain candidate-conditioned exactly as recorded.
 *
 * Run: IN=... OUT=... npx ts-node scripts/rederive-l32g-resolution.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { L3ConditionState } from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import {
  resolveConditionState, type L3StateFacts, type L3StateResolution,
} from '../src/safescope-v2/reasoning-l3/state-facts';

type Ordering = 'R0_HAZARD_FIRST' | 'R1_MISSING_FIRST' | 'R2_MISSING_UNLESS_CONTROL_STATED';

/** Bumped by L3-2i. v1 reported only the candidate-conditioned clarification metric. */
const SCORER_VERSION = 'hazlenz.l32g.resolution-scorer.v2' as const;

/**
 * D-56. Written into every artifact so a future phase cannot compare the two recalls as though they
 * were one metric -- which is exactly how the 75% figure travelled through §37 and §38.
 */
const METRIC_DEFINITIONS = {
  candidateConditionedClarificationRecall:
    'clarHit / clarExpected over CLARIFICATION_REQUIRED scenarios in which the provider emitted at '
    + 'least one hazard candidate. Zero-candidate scenarios are EXCLUDED from the denominator. '
    + 'DIAGNOSTIC ONLY -- it measures the resolver given facts, not the pipeline given an '
    + 'observation. This is the metric behind the 75% recorded in blueprint 37.2/37.4 and 38.2.',
  scenarioLevelClarificationRecall:
    'clarHit / clarExpected over ALL CLARIFICATION_REQUIRED scenarios, counting a question carried '
    + 'by EITHER carrier -- a hazard candidate, or (L3-2i) the candidate-independent '
    + 'proposal-level `unresolvedDecisions`. A scenario in which the '
    + 'provider emitted zero candidates, and therefore could carry no clarification, counts as a '
    + 'MISS. ADVANCEMENT-RELEVANT -- the inspector was owed a question and did not get one. '
    + 'Corrects the 75% figure to 60% for qwen (blueprint 39.5.2, D-56).',
  clarificationPrecision:
    'clarHit / clarRaised. IDENTICAL under both denominators by construction: a zero-candidate row '
    + 'raises nothing, so it can move neither the numerator nor clarRaised. Reported once.',
  highConsequenceAndFalseActive:
    'UNCHANGED by L3-2i and deliberately still candidate-conditioned. Facts that were never emitted '
    + 'cannot be resolved, and these figures are recorded under this filter in 37, 38 and 39.',
} as const;

/**
 * The alternative orderings, expressed as a PRE-PASS over the shipped resolver rather than as three
 * forked copies of it. Only the precedence of the missing-fact arm changes; every other arm, and the
 * `L3-INV-04` no-default-ACTIVE property, is the shipped function's, unmodified.
 */
function resolveUnder(ordering: Ordering, facts: L3StateFacts): L3StateResolution {
  const missingOutranks =
    ordering === 'R1_MISSING_FIRST'
      ? facts.decisionCriticalFactMissing
      : ordering === 'R2_MISSING_UNLESS_CONTROL_STATED'
        ? facts.decisionCriticalFactMissing && facts.controlReading === 'NOT_STATED'
        : false;

  // The arms that settle the case regardless of a missing fact stay ahead of it in every ordering:
  // a denial, a correction and a service withdrawal are statements about what IS, not gaps in what
  // is known, and an explicitly contingent framing has not asserted anything to be uncertain about.
  const settledFirst = facts.hazardExplicitlyDenied && !facts.hazardAsserted
    || facts.disposition !== 'NONE'
    || (facts.framing === 'CONDITIONAL' && !facts.hazardAsserted);

  if (missingOutranks && !settledFirst) {
    return {
      state: 'INSUFFICIENT_EVIDENCE', rule: 'DECISION_CRITICAL_FACT_MISSING', clarificationOwed: true,
      why: `a fact that decides this candidate is absent: ${facts.missingFact ?? 'unspecified'}`,
    };
  }
  return resolveConditionState(facts);
}

// ---------------------------------------------------------------- scoring

interface Row {
  scenarioId: string; pole: string; variant: string;
  expectActive: boolean; expectClarification: boolean;
  derived: Array<{ facts?: L3StateFacts; factsMissing?: boolean; modelState?: L3ConditionState }> | null;
  modelAssertsActive: boolean; raisedClarification: boolean;
  /**
   * L3-2i. Present only on rows produced by a run whose contract declared the candidate-independent
   * carrier. ABSENT on every frozen L3-2g/L3-2h artifact, so scoring them is unchanged -- asserted
   * by re-scoring them and diffing.
   */
  validatedProposalLevelClarification?: boolean;
}

const ORDERINGS: Ordering[] = ['R0_HAZARD_FIRST', 'R1_MISSING_FIRST', 'R2_MISSING_UNLESS_CONTROL_STATED'];

function main() {
  const inPaths = [process.env.IN, process.env.IN1, process.env.IN2].filter(Boolean) as string[];
  const rows: Row[] = [];
  const allRows: Row[] = [];
  for (const p of inPaths) {
    const parsed: Row[] = JSON.parse(readFileSync(p, 'utf8')).rows;
    allRows.push(...parsed);
    // KEPT (D-56): every metric below this line is candidate-conditioned by construction and was
    // recorded under this exact filter in §37/§38/§39. The zero-candidate omission is measured
    // separately, over `allRows`, and reported under its own name.
    rows.push(...parsed.filter((r: Row) => r.derived && r.derived.length));
  }

  const out: any = {
    phase: 'L3-2g', role: 'DETERMINISTIC_RESOLUTION_ABLATION_OVER_FROZEN_FACTS',
    generatedAt: new Date().toISOString(),
    source: inPaths,
    providerVariance: 'ZERO_BY_CONSTRUCTION -- no inference is performed; facts are read from the source run',
    caveat: 'orderings selected against KNOWN cases. ARCHITECTURE SELECTION ONLY. NOT generalisation evidence.',
    scorerVersion: SCORER_VERSION,
    rowsScored: { candidateConditioned: rows.length, allScenarios: allRows.length },
    metricDefinitions: METRIC_DEFINITIONS,
    orderings: {},
    scenarioLevelClarification: {},
  };

  for (const ordering of ORDERINGS) {
    const perVariant: Record<string, any> = {};
    for (const r of rows) {
      const v = perVariant[r.variant] ||= {
        hcExpected: 0, hcRecovered: 0, hcMissedIds: [],
        clarExpected: 0, clarRaised: 0, clarHit: 0, clarMissedIds: [], clarUnnecessaryIds: [],
        falseActive: 0, falseActiveIds: [],
        nonActiveExpected: 0,
      };
      const res = (r.derived || [])
        .filter(d => d.facts)
        .map(d => resolveUnder(ordering, d.facts as L3StateFacts));
      const assertsActive = res.some(x => x.state === 'ACTIVE');
      const owesClar = res.some(x => x.clarificationOwed);

      if (r.expectActive) {
        if (r.pole === 'HIGH_CONSEQUENCE' || r.pole === 'REGRESSION_ACTIVE') {
          v.hcExpected += 1;
          if (assertsActive) v.hcRecovered += 1; else v.hcMissedIds.push(r.scenarioId);
        }
      } else {
        v.nonActiveExpected += 1;
        if (assertsActive) { v.falseActive += 1; v.falseActiveIds.push(r.scenarioId); }
      }
      if (r.expectClarification) {
        v.clarExpected += 1;
        if (owesClar) v.clarHit += 1; else v.clarMissedIds.push(r.scenarioId);
      } else if (owesClar) {
        v.clarUnnecessaryIds.push(r.scenarioId);
      }
      if (owesClar) v.clarRaised += 1;
    }
    for (const v of Object.values<any>(perVariant)) {
      v.clarificationPrecision = v.clarRaised ? +(v.clarHit / v.clarRaised * 100).toFixed(1) : null;
      v.clarificationRecall = v.clarExpected ? +(v.clarHit / v.clarExpected * 100).toFixed(1) : null;
    }
    out.orderings[ordering] = perVariant;

    // ---- D-56: the SAME resolution, scored over the UNFILTERED scenario set. Nothing above this
    // line is affected; nothing below it touches high-consequence or false-ACTIVE scoring.
    const perVariantScenario: Record<string, any> = {};
    for (const r of allRows) {
      const v = perVariantScenario[r.variant] ||= {
        clarExpected: 0, clarHit: 0,
        missedIds: [], zeroCandidateMissIds: [], candidateBearingMissIds: [],
        zeroCandidateScenarioIds: [], carriedByProposalLevelCarrier: [],
      };
      const hasFacts = Boolean(r.derived && r.derived.length);
      if (!hasFacts) v.zeroCandidateScenarioIds.push(r.scenarioId);
      if (!r.expectClarification) continue;

      v.clarExpected += 1;
      const owesViaCandidate = hasFacts && (r.derived || [])
        .filter(d => d.facts)
        .map(d => resolveUnder(ordering, d.facts as L3StateFacts))
        .some(x => x.clarificationOwed);

      // L3-2i. EITHER carrier satisfies the inspector: what the scenario-level metric asks is
      // "was the owed question asked", not "which field carried it". A zero-candidate row can now
      // score a HIT -- which is precisely what the representation change made possible, and what
      // this denominator was corrected in order to be able to see.
      const owesViaProposal = r.validatedProposalLevelClarification === true;
      const owesClar = owesViaCandidate || owesViaProposal;
      if (owesViaProposal && !owesViaCandidate) v.carriedByProposalLevelCarrier.push(r.scenarioId);

      if (owesClar) { v.clarHit += 1; continue; }
      v.missedIds.push(r.scenarioId);
      // A miss with NO candidate is the representation defect (39.5.1). A miss WITH candidates is a
      // resolution or provider miss. They have different owners, so they are never merged.
      (hasFacts ? v.candidateBearingMissIds : v.zeroCandidateMissIds).push(r.scenarioId);
    }
    for (const v of Object.values<any>(perVariantScenario)) {
      v.clarificationRecall = v.clarExpected ? +(v.clarHit / v.clarExpected * 100).toFixed(1) : null;
      v.zeroCandidateClarificationMisses = v.zeroCandidateMissIds.length;
      v.carriedByProposalLevelCarrierCount = v.carriedByProposalLevelCarrier.length;
    }
    out.scenarioLevelClarification[ordering] = perVariantScenario;
  }

  const dest = process.env.OUT || 'rederive-l32g.json';
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2));

  // ---- console table
  const pad = (s: any, n: number) => String(s).padEnd(n);
  console.log(`\nresolution ablation over frozen facts  (${rows.length} structural runs)\n`);
  console.log(pad('ordering', 34) + pad('variant', 16) + pad('HC', 9) + pad('falseACT', 10)
    + pad('clarP', 8) + pad('clarR', 8) + 'unnecessary / missed');
  for (const ordering of ORDERINGS) {
    for (const [variant, v] of Object.entries<any>(out.orderings[ordering])) {
      console.log(
        pad(ordering, 34) + pad(variant, 16)
        + pad(`${v.hcRecovered}/${v.hcExpected}`, 9)
        + pad(`${v.falseActive}/${v.nonActiveExpected}`, 10)
        + pad(v.clarificationPrecision ?? '-', 8)
        + pad(v.clarificationRecall ?? '-', 8)
        + `${v.clarUnnecessaryIds.join(',') || '-'} / ${v.clarMissedIds.join(',') || '-'}`);
    }
    console.log('');
  }

  // ---- D-56: both clarification denominators, side by side, never one renamed as the other.
  console.log(`\nCLARIFICATION RECALL -- two denominators (${SCORER_VERSION})\n`);
  console.log(pad('ordering', 34) + pad('variant', 18)
    + pad('cand-cond', 12) + pad('scenario', 12) + 'zero-candidate misses');
  for (const ordering of ORDERINGS) {
    for (const [variant, sv] of Object.entries<any>(out.scenarioLevelClarification[ordering])) {
      const cc = out.orderings[ordering][variant];
      console.log(
        pad(ordering, 34) + pad(variant, 18)
        + pad(cc ? `${cc.clarHit}/${cc.clarExpected}` : '-', 12)
        + pad(`${sv.clarHit}/${sv.clarExpected}`, 12)
        + (sv.zeroCandidateMissIds.join(',') || '-'));
    }
    console.log('');
  }
  console.log('cand-cond = candidate-conditioned (DIAGNOSTIC). scenario = scenario-level (ADVANCEMENT-RELEVANT).');

  console.log(`wrote ${dest}`);
}

main();
