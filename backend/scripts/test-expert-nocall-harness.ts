/**
 * EXPERT HAZLENZ -- the NO-CALL harness.
 *
 * `PROVIDER_CALLS = 0` and `API_COST = $0.00`, and section D proves it from the source rather than
 * asserting it in a comment: it reads every file in `src/safescope-v2/expert-hazlenz/` and fails if
 * any of them contains a network primitive.
 *
 * WHAT THIS HARNESS IS FOR. Before a single paid call is authorized, everything downstream of the
 * provider must already be proven on fixtures: parsing, normalization, the independent clarification
 * carrier, the merge invariants, disagreement handling, failure handling, source labelling, and the
 * retention of both protected authorities. A provider evaluation that discovers a pipeline defect is
 * a provider evaluation that wasted a single-use corpus -- which is the mistake L3 Run-2 paid for.
 *
 * Ten scenarios, each making a different invariant falsifiable. See `fixtures/no-call-scenarios.ts`.
 *
 * Run: npx ts-node scripts/test-expert-nocall-harness.ts
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { NO_CALL_SCENARIOS } from '../src/safescope-v2/expert-hazlenz/fixtures/no-call-scenarios';
import { ReplayExpertProvider } from '../src/safescope-v2/expert-hazlenz/replay-expert-provider';
import { runExpertAnalysis } from '../src/safescope-v2/expert-hazlenz/expert-runner';
import {
  mergeExpertIntelligence, verifyMergeInvariants,
} from '../src/safescope-v2/expert-hazlenz/expert-authority-merge';
import {
  EXPERT_EVALUATION_MEASURES, EVALUATION_CORPUS_POLICY, EVALUATION_PRECONDITIONS,
  evaluateGateFamilies,
} from '../src/safescope-v2/expert-hazlenz/expert-evaluation-plan';

let passed = 0, failed = 0;
const assert = (c: unknown, m: string) => { if (c) { passed++; console.log(`ok    ${m}`); } else { failed++; console.log(`FAIL  ${m}`); } };
const section = (t: string) => console.log(`\n--- ${t}`);

const NOW = '2026-08-29T00:00:00.000Z';
let totalProviderCalls = 0;

(async function main() {
  // =====================================================================================
  section('A. the ten scenarios');
  // =====================================================================================

  assert(NO_CALL_SCENARIOS.length === 10, 'A.0 ten representative scenarios');

  for (const s of NO_CALL_SCENARIOS) {
    const provider = new ReplayExpertProvider(s.script);
    const run = await runExpertAnalysis(provider, s.input, { nowIso: NOW });
    totalProviderCalls += provider.calls;

    const merged = mergeExpertIntelligence(s.deterministic, s.governed, run.layer);
    const violations = verifyMergeInvariants(merged, s.deterministic, s.governed);
    const label = `${s.id} ${s.title}`;

    // 1. the layer status is what the scenario predicted -- schema parsing plus failure handling.
    assert(merged.expertLayer.status === s.expect.layerStatus,
      `A.1 ${label}: layer status ${s.expect.layerStatus} (got ${merged.expertLayer.status})`);

    // 2. every collection lands where it was addressed, independently of the others.
    assert(merged.expertAdvisory.hazardCandidates.length === s.expect.advisoryCandidates,
      `A.2 ${label}: ${s.expect.advisoryCandidates} advisory candidate(s)`);
    assert(merged.expertAdvisory.clarifications.length === s.expect.advisoryClarifications,
      `A.3 ${label}: ${s.expect.advisoryClarifications} clarification(s)`);
    assert(merged.expertAdvisory.crossHazardInsights.length === s.expect.advisoryInsights,
      `A.4 ${label}: ${s.expect.advisoryInsights} cross-hazard insight(s)`);
    assert(merged.expertAdvisory.disagreements.length === s.expect.advisoryDisagreements,
      `A.5 ${label}: ${s.expect.advisoryDisagreements} disagreement(s)`);

    // 3. the reason codes the scenario requires are present.
    const codes = run.issues.map(i => i.code);
    const missing = s.expect.requiredIssueCodes.filter(c => !codes.includes(c as never));
    assert(missing.length === 0, `A.6 ${label}: required issue codes present [${missing.join(',')}]`);

    // 4. DETERMINISTIC AUTHORITY RETENTION -- on every scenario, without exception.
    assert(merged.authoritative.length === s.deterministic.findings.length,
      `A.7 ${label}: every deterministic finding retained`);
    assert(merged.authoritative.every(f => f.source === 'DETERMINISTIC_AUTHORITY'),
      `A.8 ${label}: deterministic findings are source-labelled`);

    // 5. GOVERNED AUTHORITY RETENTION, including the release id.
    assert(merged.governed.knowledgeReleaseId === s.governed.knowledgeReleaseId,
      `A.9 ${label}: knowledge release id unchanged`);
    assert(merged.governed.citations.length === s.governed.citations.length
        && merged.governed.citations.every(c => c.source === 'GOVERNED_REGULATORY_AUTHORITY'),
      `A.10 ${label}: governed citations retained and source-labelled`);

    // 6. and the invariants, all eleven, on every scenario.
    assert(violations.length === 0,
      `A.11 ${label}: no merge invariant violated [${violations.map(v => v.invariant).join(',')}]`);
  }

  // =====================================================================================
  section('B. the scenarios that carry a specific proof');
  // =====================================================================================

  const byId = new Map(NO_CALL_SCENARIOS.map(s => [s.id, s]));
  const runOf = async (id: string) => {
    const s = byId.get(id)!;
    const provider = new ReplayExpertProvider(s.script);
    const run = await runExpertAnalysis(provider, s.input, { nowIso: NOW });
    totalProviderCalls += provider.calls;
    return { s, run, merged: mergeExpertIntelligence(s.deterministic, s.governed, run.layer) };
  };

  // S04 -- THE carrier case, end to end rather than at the normalizer alone.
  const s04 = await runOf('S04');
  assert(s04.merged.authoritative.length === 0
      && s04.merged.expertAdvisory.clarifications.length === 1
      && s04.merged.expertAdvisory.hazardCandidates.length === 0,
    'B.1 S04: zero deterministic findings, zero Expert candidates, and the clarification SURVIVES the merge');
  assert(s04.merged.expertAdvisory.clarifications[0].criticality === 'BLOCKING',
    'B.2 S04: the clarification keeps its criticality through the merge');

  // S03 -- an Expert candidate on a described safe state does not become a finding.
  const s03 = await runOf('S03');
  assert(s03.merged.authoritative.length === 0 && s03.merged.expertAdvisory.hazardCandidates.length === 1,
    'B.3 S03: an Expert candidate on a safe state stays ADVISORY and creates no finding');
  assert(s03.merged.expertAdvisory.source === 'EXPERT_ADVISORY',
    'B.4 S03: it is labelled so a consumer cannot mistake it for authority');

  // S06/S07 -- disagreement handling against both protected authorities.
  const s06 = await runOf('S06');
  assert(s06.merged.expertAdvisory.disagreements[0].surface === 'CONDITION_STATE_INTERPRETATION'
      && s06.merged.authoritative[0].conditionState === 'ACTIVE',
    'B.5 S06: a challenge to the condition state is recorded and the state is unchanged');

  const s07 = await runOf('S07');
  const rejected = s07.merged.governed.citations.find(c => c.citation === 'GOVERNED-RECORD-1');
  assert(s07.merged.expertAdvisory.disagreements.length === 1
      && rejected?.isApproved === false && rejected?.governedProvenanceEligible === false,
    'B.6 S07: a governed challenge is recorded and approval is NOT conferred');

  // S08 -- malformed output; the deterministic finding is untouched.
  const s08 = await runOf('S08');
  assert(s08.run.layer.status === 'OUTPUT_REJECTED'
      && s08.merged.authoritative[0].requiredActions.includes('close and label the drum'),
    'B.7 S08: rejected Expert output leaves the required action intact');

  // S09 vs S10 -- an unavailable provider and a silent omission must be indistinguishable on the
  // protected side. This is the strongest single statement the harness makes.
  const s09 = await runOf('S09');
  const s10 = await runOf('S10');
  assert(s09.merged.authoritative.length === 1 && s09.merged.expertLayer.status === 'NOT_CONFIGURED',
    'B.8 S09: the inspection is unaffected by an absent provider');
  assert(s10.merged.authoritative[0].isLifeCritical
      && s10.merged.authoritative[0].requiredActions.length === 4,
    'B.9 S10: a life-critical finding survives a total Expert omission with all four actions');
  assert(s10.merged.expertAdvisory.hazardCandidates.length === 0
      && s10.merged.expertLayer.status === 'PRESENT',
    'B.10 S10: the omission is recorded as a PRESENT layer that added nothing -- not as a failure');

  // S02/S05 -- cross-hazard reasoning arrives and stays advisory.
  const s02 = await runOf('S02');
  assert(s02.merged.expertAdvisory.crossHazardInsights[0].interactionKind === 'ELECTRICAL_WET_ENVIRONMENT'
      && s02.merged.authoritative.length === 2,
    'B.11 S02: a cross-hazard insight is added beside two unchanged deterministic findings');

  // =====================================================================================
  section('C. the evaluation plan is specified and NOT executed');
  // =====================================================================================

  assert(EXPERT_EVALUATION_MEASURES.length === 17,
    'C.1 seventeen measures pre-registered (the fourteen required, split where precision and recall differ)');
  const families = new Set(EXPERT_EVALUATION_MEASURES.map(m => m.family));
  assert(families.size === 4, 'C.2 four independent gate families');

  const hard = EXPERT_EVALUATION_MEASURES.filter(m => m.disposition === 'HARD_GATE');
  assert(hard.every(m => m.threshold !== null && m.direction !== null),
    'C.3 every hard gate carries a direction and a threshold');
  assert(EXPERT_EVALUATION_MEASURES.every(m => m.rationale.trim().length > 0),
    'C.4 every measure states why its threshold is where it is');

  const zeroTolerance = ['M03_CONTRADICTION_WITH_PROTECTED_AUTHORITY', 'M05_FABRICATED_CITATIONS',
                         'M08_GOVERNED_PROVENANCE_INTEGRITY'];
  for (const id of zeroTolerance) {
    const m = EXPERT_EVALUATION_MEASURES.find(x => x.id === id);
    assert(m?.threshold === 0 && m?.direction === 'MAX', `C.5 ${id} is a zero-tolerance gate`);
  }
  const lifeCritical = EXPERT_EVALUATION_MEASURES.find(m => m.id === 'M04_LIFE_CRITICAL_RETENTION');
  assert(lifeCritical?.threshold === 1.0 && lifeCritical?.direction === 'MIN',
    'C.6 life-critical retention is a 100% floor');

  // THE G9 LESSON: reproducibility is REPORTED, not gated, until a determinism control is measured.
  const repro = EXPERT_EVALUATION_MEASURES.find(m => m.id === 'M17_CROSS_PROCESS_REPRODUCIBILITY');
  assert(repro?.disposition === 'MEASURED_AND_REPORTED',
    'C.7 cross-process reproducibility is REPORTED, not a hard gate -- the G9 lesson');
  assert(EVALUATION_PRECONDITIONS.some(p => p.id === 'P2_DETERMINISM_CONTROL'),
    'C.8 a determinism-control precondition exists and is established before a corpus is opened');
  assert(EVALUATION_PRECONDITIONS.some(p => p.id === 'P4_PRESPEND_AUTHORIZATION'),
    'C.9 a pre-spend authorization is a precondition, not an assumption');

  // No aggregate. Four verdicts, and an unmeasured hard gate FAILS rather than being skipped.
  const verdicts = evaluateGateFamilies({});
  assert(verdicts.length === 4 && verdicts.every(v => !v.passed),
    'C.10 with nothing measured, every gated family fails -- an unmeasured gate is not a passed one');
  assert(!('overall' in (verdicts as unknown as Record<string, unknown>)),
    'C.11 there is no aggregate score that could hide a safety failure');

  assert(EVALUATION_CORPUS_POLICY.closed.length === 4 && EVALUATION_CORPUS_POLICY.reserved.length === 3,
    'C.12 the corpus policy names what is burnt and what is reserved');
  assert(EVALUATION_CORPUS_POLICY.closed.some(c => c.includes('Run 2')),
    'C.13 the spent Run-2 holdout is CLOSED and cannot be re-scored');

  // =====================================================================================
  section('D. zero provider calls, proved from the source');
  // =====================================================================================

  console.log(`      replay provider invocations this run: ${totalProviderCalls}`);
  assert(totalProviderCalls > 0,
    'D.1 the replay provider was actually exercised (a harness that ran nothing proves nothing)');

  const MODULE_DIR = join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz');
  const NETWORK_PRIMITIVES = [
    'fetch(', 'require(\'http', 'require("http', 'from \'http', 'from "http',
    'axios', 'XMLHttpRequest', 'WebSocket', 'net.connect', 'https://', 'http://',
    'process.env.ANTHROPIC', 'process.env.OPENAI', 'process.env.GEMINI', 'apiKey',
  ];
  const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
  const files = walk(MODULE_DIR).filter(f => f.endsWith('.ts'));
  assert(files.length >= 7, `D.2 the module has ${files.length} source files to scan`);

  const offenders: string[] = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const needle of NETWORK_PRIMITIVES) {
      if (text.includes(needle)) offenders.push(`${file.replace(MODULE_DIR, '')} :: ${needle}`);
    }
  }
  assert(offenders.length === 0,
    `D.3 no network primitive, endpoint or credential appears anywhere in the module [${offenders.join(' | ')}]`);

  // Provider neutrality, checked the same way: no vendor name in the core.
  const vendorOffenders: string[] = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8').toLowerCase();
    // Comments may DISCUSS the L3 provider comparison; identifiers and imports may not name a vendor.
    const codeOnly = text.split('\n')
      .filter(line => !line.trim().startsWith('*') && !line.trim().startsWith('//') && !line.trim().startsWith('/*'))
      .join('\n');
    for (const vendor of ['anthropic', 'gemini', 'openai', 'ollama', 'qwen', 'claude', 'gpt-']) {
      if (codeOnly.includes(vendor)) vendorOffenders.push(`${file.replace(MODULE_DIR, '')} :: ${vendor}`);
    }
  }
  assert(vendorOffenders.length === 0,
    `D.4 no vendor name appears in module CODE [${vendorOffenders.join(' | ')}]`);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
