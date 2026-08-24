/**
 * L3-2 -- offline contract, failure-injection and data-boundary suite. NO NETWORK, NO DATABASE.
 *
 * The corpus run measures whether the model reasons well. This suite measures something different
 * and more important: that when it reasons BADLY, or the transport fails, nothing unsafe survives.
 * Every case below drives the real pipeline -- `runValidatedReasoning` over the real validator and
 * the real semantic binder -- through a scripted provider, and asserts the same four things Phase 12
 * requires: unsafe output never reaches VALIDATED, the failure is represented explicitly, the
 * Level-1 customer path is untouched, and it remains callable.
 *
 * Run: npm run test:l32-semantic-contract
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import type { HazLenzReasoningProvider, ReasoningProviderResult } from '../src/safescope-v2/reasoning-l3/hazlenz-reasoning-provider';
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { runValidatedReasoning } from '../src/safescope-v2/reasoning-l3/reasoning-runner';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { buildReasoningInput, describeEgress, redactForProvider } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { bindProposal, buildProposalSchema, buildUserPrompt } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import { carriesHazardConclusion } from '../src/safescope-v2/reasoning-l3/reasoning-outcome';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = ''): void {
  if (condition) { passed += 1; return; }
  failed += 1;
  failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
}

// ---------------------------------------------------------------- fixtures

const OBS = 'The bench grinder is missing its tongue guard, and the adjacent extension cord was replaced this morning.';

function input(overrides: Partial<ReasoningInput> = {}): ReasoningInput {
  const built = buildReasoningInput({
    analysisId: 'test-1',
    observationText: OBS,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: ['machine_guarding', 'electrical', 'loto_stored_energy'],
    eligibleRegulatoryCandidates: [{ candidateId: 'cand-1', citation: '1910.215(b)(9)' }],
  });
  return { ...built.input, ...overrides };
}

function span(text: string, quote: string) {
  const start = text.indexOf(quote);
  return { sourceId: 'observation-1', sourceType: 'observation' as const, startOffset: start, endOffset: start + quote.length, quotedText: quote };
}

function candidate(over: Partial<HazardCandidate> = {}): HazardCandidate {
  return {
    candidateKey: 'c1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
    evidence: [span(OBS, 'missing its tongue guard')],
    conditionRationale: 'The tongue guard is described as missing, so the required control is absent now.',
    independentHazardRationale: 'The only guarding hazard described.',
    uncertainties: [], clarification: null, correctiveActionIntent: null, riskFactors: null,
    regulatoryCandidateRefs: [], ...over,
  };
}

function proposal(over: Partial<ReasoningProposal> = {}): ReasoningProposal {
  return {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION,
    analysisId: 'test-1', outcome: 'ANALYZED',
    observationInterpretation: 'A grinder guard is missing.',
    hazardCandidates: [candidate()], jurisdictionProposal: null, ...over,
  };
}

class ScriptedProvider implements HazLenzReasoningProvider {
  readonly providerId = 'scripted-test-double';
  calls = 0;
  constructor(private readonly script: ReasoningProviderResult[]) {}
  async analyzeObservation(): Promise<ReasoningProviderResult> {
    const next = this.script[Math.min(this.calls, this.script.length - 1)];
    this.calls += 1;
    return next;
  }
}

const fail = (kind: any, detail = 'injected'): ReasoningProviderResult => ({ ok: false, kind, detail });
const ok = (p: ReasoningProposal): ReasoningProviderResult => ({ ok: true, proposal: p });

// ================================================================ 1. PROVIDER FAILURE INJECTION

async function providerFailures(): Promise<void> {
  const cases: Array<[string, any, string, boolean]> = [
    // kind, expected outcome kind, retried?
    ['UNAVAILABLE', 'UNAVAILABLE', 'PROVIDER_UNAVAILABLE', false],
    ['TIMEOUT', 'TIMEOUT', 'PROVIDER_TIMEOUT', true],
    ['MALFORMED_STRUCTURED_OUTPUT', 'MALFORMED_STRUCTURED_OUTPUT', 'MALFORMED_OUTPUT', true],
    ['PROVIDER_REFUSAL', 'PROVIDER_REFUSAL', 'PROVIDER_UNAVAILABLE', false],
    ['TRANSIENT_ERROR', 'TRANSIENT_ERROR', 'PROVIDER_UNAVAILABLE', true],
    ['PERMANENT_CONFIGURATION_ERROR', 'PERMANENT_CONFIGURATION_ERROR', 'PROVIDER_UNAVAILABLE', false],
  ];
  for (const [label, kind, expectedOutcome, retried] of cases) {
    const provider = new ScriptedProvider([fail(kind)]);
    const run = await runValidatedReasoning(provider, input());
    check(`failure/${label}: outcome is ${expectedOutcome}`, run.outcome.kind === expectedOutcome, run.outcome.kind);
    check(`failure/${label}: carries no hazard conclusion`, !carriesHazardConclusion(run.outcome));
    check(`failure/${label}: no validated object`, run.validation === null);
    check(`failure/${label}: retry ceiling honoured`, provider.calls === (retried ? 2 : 1), `calls=${provider.calls}`);
  }

  // A retryable failure that succeeds on the second attempt must still validate normally.
  const recovering = new ScriptedProvider([fail('TIMEOUT'), ok(proposal())]);
  const run = await runValidatedReasoning(recovering, input());
  check('failure/recovery: second attempt validates', run.outcome.kind === 'VALIDATED', run.outcome.kind);
  check('failure/recovery: exactly two attempts', run.attempts === 2, String(run.attempts));
}

// ================================================================ 2. UNSAFE MODEL OUTPUT

async function unsafeOutput(): Promise<void> {
  const scenarios: Array<[string, ReasoningProposal, string]> = [
    ['missing condition state',
      proposal({ hazardCandidates: [candidate({ conditionState: undefined as any })] }), 'INVALID_CONDITION_STATE'],
    ['invalid condition state',
      proposal({ hazardCandidates: [candidate({ conditionState: 'PROBABLY_ACTIVE' as any })] }), 'INVALID_CONDITION_STATE'],
    ['nonexistent evidence source',
      proposal({ hazardCandidates: [candidate({ evidence: [{ ...span(OBS, 'tongue guard'), sourceId: 'no-such-source' }] })] }), 'EVIDENCE_SOURCE_UNKNOWN'],
    ['invalid offsets',
      proposal({ hazardCandidates: [candidate({ evidence: [{ ...span(OBS, 'tongue guard'), startOffset: -1, endOffset: -1 }] })] }), 'EVIDENCE_OUT_OF_BOUNDS'],
    ['quotation mismatch',
      proposal({ hazardCandidates: [candidate({ evidence: [{ ...span(OBS, 'tongue guard'), quotedText: 'guard was present' }] })] }), 'EVIDENCE_TEXT_MISMATCH'],
    ['unsupported hazard family',
      proposal({ hazardCandidates: [candidate({ hazardFamily: 'invented_family' })] }), 'UNSUPPORTED_HAZARD_FAMILY'],
    ['invented regulatory candidate reference',
      proposal({ hazardCandidates: [candidate({ regulatoryCandidateRefs: ['cand-999'] })] }), 'UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE'],
    ['free-form citation string',
      proposal({ hazardCandidates: [candidate({ citation: '1910.215(b)(9)' } as any)] }), 'INVENTED_REGULATORY_CANDIDATE'],
    ['governance field',
      proposal({ hazardCandidates: [candidate({ reviewState: 'APPROVED' } as any)] }), 'GOVERNANCE_FIELD_NOT_PERMITTED'],
    ['regulatory text',
      proposal({ hazardCandidates: [candidate({ standardText: 'Work rests shall be adjusted...' } as any)] }), 'REGULATORY_TEXT_NOT_PERMITTED'],
    ['asserting state with no evidence',
      proposal({ hazardCandidates: [candidate({ evidence: [] })] }), 'EVIDENCE_MISSING'],
    ['duplicate candidate',
      proposal({ hazardCandidates: [candidate(), candidate({ candidateKey: 'c2' })] }), 'DUPLICATE_CANDIDATE'],
    ['ungrounded corrective action',
      proposal({ hazardCandidates: [candidate({ correctiveActionIntent: { objective: 'Install a guard', hierarchyLevel: 'engineering', groundedInEvidence: [span(OBS, 'extension cord')] } })] }), 'UNGROUNDED_CORRECTIVE_ACTION'],
    ['clarification with no decision',
      proposal({ hazardCandidates: [candidate({ clarification: { unresolvedFact: 'x', affectedDecision: 'risk', branches: ['only-one'], question: 'q' } })] }), 'INVALID_CLARIFICATION_DEPENDENCY'],
    ['jurisdiction claims user confirmation',
      proposal({ jurisdictionProposal: { value: 'msha', provenance: 'USER_CONFIRMED' as any, basis: [] } }), 'JURISDICTION_PROVENANCE_NOT_PERMITTED'],
    ['unavailable carrying candidates',
      proposal({ outcome: 'ANALYSIS_UNAVAILABLE' }), 'UNAVAILABLE_CANNOT_CARRY_CANDIDATES'],
    ['analysis id mismatch',
      proposal({ analysisId: 'someone-elses-analysis' }), 'ANALYSIS_ID_MISMATCH'],
  ];

  for (const [label, bad, expectedCode] of scenarios) {
    const provider = new ScriptedProvider([ok(bad)]);
    const run = await runValidatedReasoning(provider, input());
    check(`unsafe/${label}: never VALIDATED`, run.outcome.kind !== 'VALIDATED', run.outcome.kind);
    check(`unsafe/${label}: no hazard conclusion`, !carriesHazardConclusion(run.outcome));
    const codes = (run.validation?.issues ?? []).map(i => i.code);
    check(`unsafe/${label}: reports ${expectedCode}`, codes.includes(expectedCode as any), codes.join(',') || 'none');
    check(`unsafe/${label}: validated object is null`, run.validation?.validated === null);
  }

  // Partial multi-hazard: one good candidate, one fabricated. The proposal is rejected as a whole --
  // a response that invented evidence is not partially trusted.
  const partial = proposal({
    hazardCandidates: [
      candidate(),
      candidate({ candidateKey: 'c2', hazardFamily: 'electrical', evidence: [{ ...span(OBS, 'extension cord'), quotedText: 'exposed live conductor' }] }),
    ],
  });
  const partialRun = await runValidatedReasoning(new ScriptedProvider([ok(partial)]), input());
  check('unsafe/partial multi-hazard: whole proposal rejected', partialRun.outcome.kind === 'REJECTED_OUTPUT', partialRun.outcome.kind);
  check('unsafe/partial multi-hazard: no partial hazard survives', !carriesHazardConclusion(partialRun.outcome));

  // A fabricated quote must NOT be retried (blueprint section 29.6).
  const fabricator = new ScriptedProvider([ok(proposal({ hazardCandidates: [candidate({ evidence: [{ ...span(OBS, 'tongue guard'), quotedText: 'not real text' }] })] }))]);
  const fabRun = await runValidatedReasoning(fabricator, input());
  check('unsafe/fabricated evidence: not retried', fabricator.calls === 1, `calls=${fabricator.calls}`);
  check('unsafe/fabricated evidence: rejected', fabRun.outcome.kind === 'REJECTED_OUTPUT');
}

// ================================================================ 3. SEMANTIC EVIDENCE BINDING

/** Empty outcome used when a fixture unexpectedly fails deterministic validation. */
const NO_SEMANTIC = { boundHazards: [] as any[], rejected: [] as any[], issues: [] as any[], binderVersion: 'n/a' as any };

function semanticOf(label: string, v: ReturnType<typeof validateReasoningProposal>, i: ReasoningInput) {
  if (!v.validated) { check(`${label}: reached the semantic binder`, false, 'deterministic validator rejected the fixture'); return NO_SEMANTIC; }
  return bindEvidenceSemantically(v.validated, i);
}

/** Fails loudly with the validator's own reason instead of throwing on a null dereference. */
function mustValidate(label: string, p: ReasoningProposal, i: ReasoningInput) {
  const v = validateReasoningProposal(p, i);
  check(`${label}: deterministic validator accepts it`, v.state === 'VALID', v.issues.map(x => x.code).join(',') || 'none');
  return v;
}

function semanticBinding(): void {
  // Each case: a proposal the DETERMINISTIC validator accepts, which the semantic binder must refuse.
  // The negation must be DISTANT: an immediately-preceding one is already caught mechanically by
  // L3-1, so a fixture using adjacency would test the wrong layer.
  const negText = 'The inspector confirmed that at no time during the walkthrough was the west platform guardrail found missing.';
  const negInput = buildReasoningInput({
    analysisId: 'sem-1', observationText: negText,
    regulatoryContext: { value: 'osha-construction', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: ['falls', 'scaffolds'],
  }).input;
  const negSpan = (q: string) => {
    const s = negText.indexOf(q);
    return { sourceId: 'observation-1', sourceType: 'observation' as const, startOffset: s, endOffset: s + q.length, quotedText: q };
  };
  const negProposal: ReasoningProposal = {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION, analysisId: 'sem-1', outcome: 'ANALYZED',
    observationInterpretation: 'x', jurisdictionProposal: null,
    hazardCandidates: [{
      candidateKey: 'n1', hazardFamily: 'falls', conditionState: 'ACTIVE',
      evidence: [negSpan('guardrail found missing')],
      conditionRationale: 'A guardrail is missing.', independentHazardRationale: 'only hazard',
      uncertainties: [], clarification: null, correctiveActionIntent: null, riskFactors: null, regulatoryCandidateRefs: [],
    }],
  };
  const negValidation = mustValidate('semantic/negation', negProposal, negInput);
  const negSemantic = semanticOf('semantic/negation', negValidation, negInput);
  check('semantic/negation: binder catches the governing "no"',
    negSemantic.issues.some(i => i.code === 'SEMANTIC_NEGATION_UNADDRESSED'), JSON.stringify(negSemantic.issues));
  check('semantic/negation: candidate does not survive', negSemantic.boundHazards.length === 0);

  // State unsupported by the cited text: CORRECTED with no correction language anywhere near it.
  const corrInput = input();
  const corrProposal = proposal({ hazardCandidates: [candidate({ conditionState: 'CORRECTED', evidence: [span(OBS, 'missing its tongue guard')] })] });
  const corrValidation = mustValidate('semantic/state CORRECTED', corrProposal, corrInput);
  const corrSemantic = semanticOf('semantic/state CORRECTED', corrValidation, corrInput);
  check('semantic/state: binder refuses unsupported CORRECTED',
    corrSemantic.issues.some(i => i.code === 'SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE'), JSON.stringify(corrSemantic.issues));

  // A CORRECTED claim that IS supported must pass, or the check is just a blanket ban.
  const okCorr = proposal({ outcome: 'ANALYZED', hazardCandidates: [candidate({ hazardFamily: 'electrical', conditionState: 'CORRECTED', evidence: [span(OBS, 'extension cord was replaced this morning')], conditionRationale: 'replaced' })] });
  const okCorrValidation = mustValidate('semantic/state supported-CORRECTED', okCorr, corrInput);
  const okCorrSemantic = semanticOf('semantic/state supported-CORRECTED', okCorrValidation, corrInput);
  check('semantic/state: supported CORRECTED survives', okCorrSemantic.boundHazards.length === 1, JSON.stringify(okCorrSemantic.issues));

  // Action language is not condition evidence (RC-07).
  const actText = 'We will schedule a lockout tagout refresher for the maintenance crew next quarter.';
  const actInput = buildReasoningInput({
    analysisId: 'sem-2', observationText: actText,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: ['loto_stored_energy'],
  }).input;
  const aq = 'schedule a lockout tagout refresher';
  const aIdx = actText.indexOf(aq);
  const actProposal: ReasoningProposal = {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION, analysisId: 'sem-2', outcome: 'ANALYZED',
    observationInterpretation: 'x', jurisdictionProposal: null,
    hazardCandidates: [{
      candidateKey: 'a1', hazardFamily: 'loto_stored_energy', conditionState: 'ACTIVE',
      evidence: [{ sourceId: 'observation-1', sourceType: 'observation', startOffset: aIdx, endOffset: aIdx + aq.length, quotedText: aq }],
      conditionRationale: 'Training is being scheduled.', independentHazardRationale: 'only hazard',
      uncertainties: [], clarification: null, correctiveActionIntent: null, riskFactors: null, regulatoryCandidateRefs: [],
    }],
  };
  const actValidation = mustValidate('semantic/action', actProposal, actInput);
  const actSemantic = semanticOf('semantic/action', actValidation, actInput);
  check('semantic/action: binder refuses planned-action grounding',
    actSemantic.issues.some(i => i.code === 'SEMANTIC_ACTION_NOT_CONDITION_EVIDENCE'), JSON.stringify(actSemantic.issues));

  // Non-selective evidence: two candidates, both citing the entire source.
  const whole = span(OBS, OBS);
  const selProposal = proposal({
    hazardCandidates: [
      candidate({ candidateKey: 's1', evidence: [whole] }),
      candidate({ candidateKey: 's2', hazardFamily: 'electrical', evidence: [whole] }),
    ],
  });
  const selValidation = mustValidate('semantic/selectivity', selProposal, corrInput);
  const selSemantic = semanticOf('semantic/selectivity', selValidation, corrInput);
  check('semantic/selectivity: whole-source citations refused',
    selSemantic.issues.filter(i => i.code === 'SEMANTIC_EVIDENCE_NOT_SELECTIVE').length === 2, JSON.stringify(selSemantic.issues));

  // Two candidates, same family, same span, no distinguishing rationale.
  const indProposal = proposal({
    hazardCandidates: [
      candidate({ candidateKey: 'i1', conditionState: 'ACTIVE' }),
      candidate({ candidateKey: 'i2', conditionState: 'CONTROLLED', evidence: [span(OBS, 'missing its tongue guard')] }),
    ],
  });
  const indValidation = mustValidate('semantic/independence', indProposal, corrInput);
  const indSemantic = semanticOf('semantic/independence', indValidation, corrInput);
  check('semantic/independence: duplicate-family shared span refused',
    indSemantic.issues.some(i => i.code === 'SEMANTIC_CANDIDATES_NOT_INDEPENDENT'), JSON.stringify(indSemantic.issues));

  // Advisory-only grounding: the family came from the hint, the cited text does not support it.
  const advInput = buildReasoningInput({
    analysisId: 'test-1', observationText: OBS,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: ['machine_guarding', 'noise_exposure'],
    advisorySignals: [{ signalId: 's1', kind: 'lexical_family_hint', value: 'noise_exposure' }],
  }).input;
  // L3-2b: the evidence must carry NOTHING supporting the hinted family. "bench grinder" no longer
  // works as a fixture -- with the engine's real taxonomy vocabulary in play, `grinder` IS a noise
  // signal, so that span genuinely supports the claim and refusing it would be the wrong answer.
  const advProposal = proposal({
    hazardCandidates: [candidate({ hazardFamily: 'noise_exposure', evidence: [span(OBS, 'extension cord was replaced this morning')], conditionRationale: 'loud' })],
  });
  const advValidation = mustValidate('semantic/advisory', advProposal, advInput);
  const advSemantic = semanticOf('semantic/advisory', advValidation, advInput);
  check('semantic/advisory: binder flags the echo',
    advSemantic.issues.some(i => i.code === 'SEMANTIC_ADVISORY_ECHO'), JSON.stringify(advSemantic.issues));

  // The honest counter-case: a well-grounded ACTIVE claim must survive every check.
  const goodValidation = mustValidate('semantic/control', proposal(), corrInput);
  const goodSemantic = semanticOf('semantic/control', goodValidation, corrInput);
  check('semantic/control: a sound candidate survives', goodSemantic.boundHazards.length === 1, JSON.stringify(goodSemantic.issues));
}

// ================================================================ 4. OFFSET BINDING

function offsetBinding(): void {
  const i = input();
  const bound = bindProposal({
    outcome: 'ANALYZED', observationInterpretation: 'x',
    hazardCandidates: [{
      candidateKey: 'b1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
      evidence: [{ sourceId: 'observation-1', quotedText: 'missing its tongue guard' }],
      conditionRationale: 'r', independentHazardRationale: 'r', uncertainties: [],
    }],
  }, i);
  const ev = bound.proposal.hazardCandidates[0].evidence[0];
  check('binding: offsets resolve to the exact quote',
    i.authoritativeSources[0].text.slice(ev.startOffset, ev.endOffset) === ev.quotedText);
  check('binding: no unbound quotes on a verbatim answer', bound.binding.unbound === 0);

  const fabricated = bindProposal({
    outcome: 'ANALYZED', observationInterpretation: 'x',
    hazardCandidates: [{
      candidateKey: 'b2', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
      evidence: [{ sourceId: 'observation-1', quotedText: 'the guard was clearly absent' }],
      conditionRationale: 'r', independentHazardRationale: 'r', uncertainties: [],
    }],
  }, i);
  check('binding: a paraphrase is counted unbound', fabricated.binding.unbound === 1);
  const fev = fabricated.proposal.hazardCandidates[0].evidence[0];
  check('binding: an unbindable quote gets a failing span', fev.startOffset === -1 && fev.endOffset === -1);
  const rejected = validateReasoningProposal(fabricated.proposal, i);
  check('binding: the validator rejects it rather than the binder repairing it',
    rejected.state === 'REJECTED_MODEL_OUTPUT' && rejected.issues.some(x => x.code === 'EVIDENCE_OUT_OF_BOUNDS'));
}

// ================================================================ 5. DATA BOUNDARY (section 15)

function dataBoundary(): void {
  const dirty = 'Operator J. Smith (badge id A-4471, jsmith@acme-quarry.com, 555-212-9090) at 1400 Foundry Road '
    + 'reported the grinder guard missing. MSHA ID: 46-08721. See https://intranet.acme/report/91.';
  const { text, redactions } = redactForProvider(dirty);
  const rules = redactions.map(r => r.rule);
  check('boundary: email redacted', !text.includes('jsmith@acme-quarry.com') && rules.includes('email'));
  check('boundary: phone redacted', !text.includes('555-212-9090') && rules.includes('phone'));
  check('boundary: street address redacted', !text.includes('1400 Foundry Road') && rules.includes('street_address'));
  check('boundary: mine id redacted', !text.includes('46-08721') && rules.includes('mine_id'));
  check('boundary: employee id redacted', !text.includes('A-4471') && rules.includes('employee_id'));
  check('boundary: url redacted', !text.includes('intranet.acme') && rules.includes('url'));
  check('boundary: hazard content survives redaction', text.includes('grinder guard missing'));

  const built = buildReasoningInput({
    analysisId: 'b1', observationText: dirty,
    regulatoryContext: { value: 'msha', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: ['machine_guarding'],
    eligibleRegulatoryCandidates: [{ candidateId: 'cand-1', citation: '56.14107', title: 'Moving machine parts' }],
  });
  // Offsets are offsets into the REDACTED text, so a span can never quote something not sent.
  check('boundary: canonical source is the redacted text', built.input.authoritativeSources[0].text === text);

  const prompt = buildUserPrompt(built.input);
  check('boundary: prompt carries no citation string', !prompt.includes('56.14107'));
  check('boundary: prompt carries the candidate id only', prompt.includes('cand-1'));
  for (const secret of ['jsmith@acme-quarry.com', '555-212-9090', '1400 Foundry Road', '46-08721', 'A-4471']) {
    check(`boundary: prompt excludes ${secret}`, !prompt.includes(secret));
  }

  const schema = JSON.stringify(buildProposalSchema(built.input));
  check('boundary: schema carries no citation string', !schema.includes('56.14107'));

  const egress = describeEgress(built.input);
  check('boundary: egress inventory reports no citation strings sent', egress.regulatoryCitationStringsSent === false);
  check('boundary: egress inventory lists only the two allowed source kinds',
    (egress.sourceTypes as string[]).every(t => ['observation', 'inspection_context', 'clarification_answer'].includes(t)));

  // Structural exclusion: the request type has no field through which identity could be supplied.
  const builderSource = readFileSync(join(__dirname, '..', 'src/safescope-v2/reasoning-l3/reasoning-input-builder.ts'), 'utf8');
  const requestBlock = builderSource.slice(
    builderSource.indexOf('export interface ReasoningInputRequest'),
    builderSource.indexOf('export interface RedactionRecord'));
  for (const forbidden of ['customerName', 'siteName', 'organizationId', 'userId', 'email', 'address', 'reviewState', 'releaseId', 'standardText']) {
    check(`boundary: ReasoningInputRequest has no '${forbidden}' field`, !requestBlock.includes(forbidden));
  }
}

// ================================================================ 6. CUSTOMER-AUTHORITY REACHABILITY

function customerAuthority(): void {
  const root = join(__dirname, '..', 'src');
  const seam = readFileSync(join(root, 'safescope-v2/orchestration/intelligence-orchestrator.service.ts'), 'utf8');
  const service = readFileSync(join(root, 'safescope-v2/safescope-v2.service.ts'), 'utf8');
  check('authority: the seam does not import reasoning-l3', !seam.includes('reasoning-l3'));
  check('authority: safescope-v2.service does not import reasoning-l3', !service.includes('reasoning-l3'));
  check('authority: the seam still exposes evaluate()', seam.includes('evaluate('));
  check('authority: the customer call site still calls it', service.includes('orchestrator.evaluate('));

  // The L3 tree must remain un-injectable: nothing may register it with Nest.
  const l3Dir = join(root, 'safescope-v2/reasoning-l3');
  const files = require('fs').readdirSync(l3Dir).filter((f: string) => f.endsWith('.ts'));
  for (const f of files) {
    const src = readFileSync(join(l3Dir, f), 'utf8');
    check(`authority: ${f} carries no Nest decorator`, !/@(Injectable|Module|Controller)\s*\(/.test(src));
    check(`authority: ${f} imports no repository or entity`, !/@nestjs\/typeorm|InjectRepository/.test(src));
  }
}

// ================================================================

async function main(): Promise<void> {
  await providerFailures();
  await unsafeOutput();
  semanticBinding();
  offsetBinding();
  dataBoundary();
  customerAuthority();

  process.stdout.write(`\nL3-2 semantic contract suite: ${passed} passed, ${failed} failed\n`);
  if (failures.length) {
    process.stdout.write('\nFAILURES:\n');
    for (const f of failures) process.stdout.write(`  - ${f}\n`);
  }
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
