/**
 * EXPERT HAZLENZ -- LOCAL, ZERO-COST behaviour probe for the §105 hosted-behaviour repair.
 *
 * ==================== WHY THIS SCRIPT EXISTS SEPARATELY FROM probe:expert-routing ====================
 *
 * `probe:expert-routing` measures ROUTING and nothing else, and it already scores 14/14 locally. The
 * hosted probe failed on three routing gates and on grounding, and the two questions need different
 * instrumentation:
 *
 *   1. `outcome` WAS NEVER RECORDED. Neither the hosted probe nor the routing scorer captures it, so
 *      when hosted R1 and R5 returned every collection empty there was no way to tell a considered
 *      "ANALYZED with nothing to say" from a premature `NOTHING_TO_ADD` commitment. This script
 *      records it on every call. That is an INSTRUMENTATION ADDITION, not a gate change.
 *   2. Grounding needs REPETITION. One call cannot distinguish a structural repair from a lucky
 *      generation, so every case runs REPEATS times and the per-case result is reported as a rate.
 *
 * NO HOSTED PROVIDER IS REACHABLE FROM THIS FILE. It imports the Ollama adapter only. $0.00.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { OllamaExpertProvider, EXPERT_PROBE_INFERENCE_CONFIG } from
  '../src/safescope-v2/expert-hazlenz-adapters/ollama-expert-provider';
import { runExpertAnalysis } from '../src/safescope-v2/expert-hazlenz/expert-runner';
import { ROUTING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures';
import { GROUNDING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/grounding-fixtures';
import { scoreRouting, totalRouting, type RoutingScore } from
  '../src/safescope-v2/expert-hazlenz/expert-routing-metrics';
import { EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysis, type ExpertAnalysisInput }
  from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import type { ConceptProbe, RoutingExpectations } from
  '../src/safescope-v2/expert-hazlenz/expert-routing-metrics';

const REPEATS = Number(process.env.PROBE_REPEATS || 3);
const NOW = '2026-08-30T00:00:00.000Z';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-hosted-behavior-repair-2026-08-30');
mkdirSync(join(OUT, 'local'), { recursive: true });

interface Case {
  id: string;
  title: string;
  fixture: { input: ExpertAnalysisInput; expectations: RoutingExpectations; probes: readonly ConceptProbe[] };
  anchor?: string;
  /** True for the control whose CORRECT answer is NO_EXACT_QUOTE_AVAILABLE. */
  evidenceUnavailable?: boolean;
}

/**
 * G1 -- THE EVIDENCE-UNAVAILABLE CONTROL, and it is the counterweight to H7/H8.
 *
 * H7 and H8 ask whether a model that CAN quote does. This one asks the opposite question, and
 * without it the repair could be "passed" by a model that simply declares EXACT_QUOTE_SUPPLIED
 * every time. The observation below states a bare fact and nothing about the hazard that follows
 * from it: the exposure is INFERRED from the location, not written down. There is no span that
 * supports "the mezzanine edge is unprotected", because the observation never says it.
 *
 * The correct answer is therefore NO_EXACT_QUOTE_AVAILABLE with an empty evidence list. A model
 * that fabricates a quote here fails closed at the boundary, which is exactly what should happen.
 */
const G1_OBS = 'A pallet of fittings was staged on the mezzanine deck at the end of the shift.';

const G1: Case = {
  id: 'G1',
  title: 'EVIDENCE-UNAVAILABLE CONTROL — the hazard is inferred, not stated',
  evidenceUnavailable: true,
  fixture: {
    input: {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      analysisId: 'ground-g1',
      authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: G1_OBS }],
      inspectionContext: { location: 'Plant 2', task: 'routine walkthrough' },
      jurisdiction: 'osha-general-industry',
      allowedHazardFamilies: ['electrical', 'lockout_tagout', 'fall_protection', 'confined_space',
        'machine_guarding', 'chemical_exposure', 'mobile_equipment', 'wet_environment'],
      deterministicFindings: [], governedStandards: [], answeredClarifications: [],
    },
    // Everything OPTIONAL: this control measures GROUNDING HONESTY, not routing. Scoring routing
    // here would let a defensible answer count against the model.
    expectations: {
      expertHazardCandidates: 'OPTIONAL', decisionCriticalClarifications: 'OPTIONAL',
      crossHazardInsights: 'OPTIONAL', disagreements: 'OPTIONAL',
    },
    probes: [],
  },
};

const CASES: Case[] = [
  ...ROUTING_FIXTURES.map(f => ({ id: f.id, title: f.title, fixture: f })),
  ...GROUNDING_FIXTURES.map(f => ({ id: f.id, title: f.title, fixture: f, anchor: f.anchor })),
  G1,
];

interface Obs {
  caseId: string;
  iteration: number;
  ok: boolean;
  outcome: string | null;
  counts: { candidates: number; clarifications: number; insights: number; disagreements: number };
  issues: string[];
  score: RoutingScore | null;
  /** grounding, on the two grounding fixtures only */
  evidenceEmitted: number;
  evidenceExactlyBound: number;
  evidenceUnbindable: number;
  quotesSupportingAnchor: number;
  groundedObjects: number;
  ungroundedObjects: number;
  /** Attempted quote text. These fixtures are SYNTHETIC, so no customer observation is recorded. */
  attemptedQuotes: { text: string; bound: boolean }[];
}

function groundingOf(analysis: ExpertAnalysis, anchor: string | undefined) {
  let emitted = 0, bound = 0, unbindable = 0, supporting = 0, grounded = 0, ungrounded = 0;
  const attempted: { text: string; bound: boolean }[] = [];
  for (const c of analysis.expertHazardCandidates) {
    const refs = c.evidence ?? [];
    emitted += refs.length;
    let thisBound = 0;
    for (const r of refs) {
      const didBind = r.startOffset >= 0 && r.endOffset > r.startOffset;
      attempted.push({ text: r.quotedText, bound: didBind });
      if (didBind) { bound += 1; thisBound += 1; } else unbindable += 1;
      if (anchor && r.quotedText && anchor.includes(r.quotedText) && r.startOffset >= 0) supporting += 1;
    }
    if (thisBound > 0) grounded += 1; else ungrounded += 1;
  }
  return { emitted, bound, unbindable, supporting, grounded, ungrounded, attempted };
}

(async function main() {
  const provider = new OllamaExpertProvider();
  console.log('EXPERT HAZLENZ — LOCAL BEHAVIOUR PROBE (zero cost)');
  console.log(`provider   local-ollama   model ${EXPERT_PROBE_INFERENCE_CONFIG.model}`);
  console.log(`cases      ${CASES.length}   repeats ${REPEATS}   total calls ${CASES.length * REPEATS}`);
  console.log('hosted     NONE — this script imports no hosted adapter\n');

  const obs: Obs[] = [];
  for (const c of CASES) {
    for (let i = 1; i <= REPEATS; i += 1) {
      const run = await runExpertAnalysis(provider, c.fixture.input, { nowIso: NOW });
      const analysis = run.layer.validated?.analysis ?? null;
      const g = analysis ? groundingOf(analysis, c.anchor) :
        { emitted: 0, bound: 0, unbindable: 0, supporting: 0, grounded: 0, ungrounded: 0,
          attempted: [] as { text: string; bound: boolean }[] };
      const row: Obs = {
        caseId: c.id, iteration: i, ok: analysis !== null,
        outcome: analysis ? analysis.outcome : null,
        counts: {
          candidates: analysis?.expertHazardCandidates.length ?? 0,
          clarifications: analysis?.decisionCriticalClarifications.length ?? 0,
          insights: analysis?.crossHazardInsights.length ?? 0,
          disagreements: analysis?.disagreements.length ?? 0,
        },
        issues: run.issues.map(x => x.code),
        score: analysis ? scoreRouting(c.id, analysis, c.fixture.expectations, c.fixture.probes) : null,
        evidenceEmitted: g.emitted, evidenceExactlyBound: g.bound, evidenceUnbindable: g.unbindable,
        quotesSupportingAnchor: g.supporting, groundedObjects: g.grounded, ungroundedObjects: g.ungrounded,
        attemptedQuotes: g.attempted,
      };
      obs.push(row);
      console.log(`  ${c.id} #${i}  outcome=${row.outcome ?? 'FAILED'}`
        + `  cand=${row.counts.candidates} clar=${row.counts.clarifications}`
        + ` ins=${row.counts.insights} dis=${row.counts.disagreements}`
        + (c.anchor ? `  quotes=${g.emitted} bound=${g.bound} supporting=${g.supporting}` : '')
        + (row.issues.length ? `  issues=${[...new Set(row.issues)].join(',')}` : ''));
    }
  }

  const scores = obs.map(o => o.score).filter((s): s is RoutingScore => s !== null);
  const totals = totalRouting(scores);
  const groundingCases = obs.filter(o => CASES.find(c => c.id === o.caseId)?.anchor !== undefined);
  const summary = {
    provider: 'local-ollama', model: EXPERT_PROBE_INFERENCE_CONFIG.model,
    repeats: REPEATS, calls: obs.length, hostedCalls: 0, costUsd: 0,
    routing: totals,
    outcomesByCase: Object.fromEntries(CASES.map(c => [c.id,
      obs.filter(o => o.caseId === c.id).map(o => o.outcome)])),
    grounding: {
      EVIDENCE_OPPORTUNITIES: groundingCases.length,
      EVIDENCE_QUOTES_EMITTED: groundingCases.reduce((a, o) => a + o.evidenceEmitted, 0),
      EVIDENCE_QUOTES_EXACTLY_BOUND: groundingCases.reduce((a, o) => a + o.evidenceExactlyBound, 0),
      EVIDENCE_QUOTES_UNBINDABLE: groundingCases.reduce((a, o) => a + o.evidenceUnbindable, 0),
      QUOTES_SUPPORTING_ANCHOR: groundingCases.reduce((a, o) => a + o.quotesSupportingAnchor, 0),
      GROUNDED_TYPED_OBJECTS: groundingCases.reduce((a, o) => a + o.groundedObjects, 0),
      UNGROUNDED_TYPED_OBJECTS: groundingCases.reduce((a, o) => a + o.ungroundedObjects, 0),
      iterationsWithSupportingQuote: groundingCases.filter(o => o.quotesSupportingAnchor > 0).length,
      iterationsTotal: groundingCases.length,
    },
    evidenceUnavailableControl: {
      iterations: obs.filter(o => o.caseId === 'G1').length,
      // The control passes by ABSTAINING honestly: no candidate claimed a quote it could not bind,
      // so nothing failed closed and nothing was fabricated.
      iterationsWithFailClosed: obs.filter(o => o.caseId === 'G1'
        && o.issues.some(i => i === 'GROUNDING_CLAIM_UNSUPPORTED' || i === 'EVIDENCE_OUT_OF_BOUNDS')).length,
      candidatesRaised: obs.filter(o => o.caseId === 'G1').reduce((a, o) => a + o.counts.candidates, 0),
      quotesEmitted: obs.filter(o => o.caseId === 'G1').reduce((a, o) => a + o.evidenceEmitted, 0),
    },
    outcomeInconsistencies: obs.filter(o => o.issues.includes('OUTCOME_INCONSISTENT_WITH_CONTENT')).length,
    groundingClaimFailures: obs.filter(o => o.issues.includes('GROUNDING_CLAIM_UNSUPPORTED')).length,
    groundingStatusInvalid: obs.filter(o => o.issues.includes('GROUNDING_STATUS_INVALID')).length,
    observations: obs,
  };
  const tag = process.env.PROBE_TAG || 'run';
  writeFileSync(join(OUT, 'local', `local-behaviour-${tag}.json`), JSON.stringify(summary, null, 2));

  console.log('\n---------------- ROUTING ----------------');
  console.log(`opportunities ${totals.TYPED_ROUTING_OPPORTUNITIES}  hits ${totals.TYPED_ROUTING_HITS}`
    + `  misses ${totals.TYPED_ROUTING_MISSES}  over-routed ${totals.TYPED_ROUTING_OVER_ROUTED}`
    + `  explanation-only losses ${totals.EXPLANATION_ONLY_LOSSES}`);
  console.log('---------------- GROUNDING ----------------');
  console.log(JSON.stringify(summary.grounding, null, 1));
  console.log(`\nwritten  local/local-behaviour-${tag}.json`);
})();
