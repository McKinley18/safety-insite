/**
 * L3-2i -- TARGETED ZERO-CANDIDATE CLARIFICATION PROOF.
 *
 * THE PROVEN REQUIREMENT (blueprint §39.5.1, D-56):
 *
 *   When a provider correctly concludes an observation is underdetermined and returns
 *   `INSUFFICIENT_EVIDENCE` with `hazardCandidates: []`, the typed proposal MUST still be able to
 *   carry the decision-critical clarification the inspector is owed -- and the deterministic
 *   validator must accept it WITHOUT a hazard candidate.
 *
 * ============================ SCOPE, AND WHY IT IS THIS NARROW ============================
 *
 * The cohort is the entry contract's mandatory pair (`F-CL-01`, `B10`) plus three CONTROLS drawn
 * from the same already-opened locked diagnostic set. The controls are not decoration: without them
 * every gate below is vacuous, which is `D-54`'s failure exactly.
 *
 *   F-CL-01, B10   MUST ask. These are the two scenarios §39.5.1 measured losing the clarification.
 *   C-CS-05        MUST NOT ask. Proves the carrier does not fire on a decided candidate.
 *   F-PS-04        NEGATIVE CONTROL. Proves no false ACTIVE is introduced.
 *   H-FLD-141      HIGH CONSEQUENCE. Proves the high-consequence path did not regress.
 *
 * Scenario texts are ASSERTED byte-identical to the locked L3-2h harness at startup. A proof that
 * silently drifted off the cohort it claims to exercise would prove nothing.
 *
 * ============================ WHAT IS AND IS NOT VARIED ============================
 *
 * The shipped `L3_SYSTEM_PROMPT` is used VERBATIM as a prefix and is NEVER edited -- §36.7 and §37
 * both measured that moving shipped ladder material changes behaviour, and the locked L3-2h
 * instrument reads that exact string. What is APPENDED is a CONTRACT DECLARATION: the model cannot
 * emit a field it has not been told exists, so declaring `unresolvedDecisions` is a precondition of
 * exercising the contract at all. It is not prompt tuning: no rung is reworded, nothing is moved,
 * and no emphasis is changed. The prefix identity is asserted, not asserted-to.
 *
 * Three variants exist to satisfy §38.3, and each MUST be run in its own process:
 *   V_CARRIER          declaration appended after the shipped prompt
 *   V_CARRIER_MOVE1    the same declaration, moved ahead of ASKING A QUESTION -- position control
 *   V_CARRIER_REPEAT   V_CARRIER byte-identical, re-run -- the NOISE FLOOR
 *
 * `AN IDENTICAL PROMPT REPEATED INSIDE ONE PROCESS IS NOT A NOISE-FLOOR CONTROL` (§38.3). The runner
 * refuses to execute more than one variant per invocation.
 *
 * Run: ONLY=V_CARRIER OUT=... npx ts-node scripts/prove-l32i-clarification-carrier.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { createHash } from 'crypto';
import {
  L3_CONDITION_STATES, L3_CONTROL_HIERARCHY_LEVELS,
  type ReasoningInput, type L3RegulatoryContextValue,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { L3_SYSTEM_PROMPT, buildUserPrompt, bindProposal } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import { L3_2_INFERENCE_CONFIG } from '../src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';

const CFG = L3_2_INFERENCE_CONFIG;
const SHIPPED_PROMPT_SHA = 'b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf';
const LOCKED_HARNESS_SHA = '73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521';

// =====================================================================================
// THE CONTRACT DECLARATION. Additive only. Nothing in the shipped prompt is edited or moved.
// =====================================================================================

const CARRIER_DECLARATION = [
  '',
  'UNRESOLVED DECISIONS -- A QUESTION THAT BELONGS TO NO CANDIDATE.',
  '`unresolvedDecisions` is a TOP-LEVEL array on your answer, beside `hazardCandidates`. Use it when',
  'the observation leaves a decision open and there is no hazard candidate for the question to hang',
  'on -- above all when you set outcome INSUFFICIENT_EVIDENCE and return an EMPTY hazardCandidates',
  'array. Previously the question was simply lost in that case, which is the worst case to lose it in.',
  'Each entry takes the same four fields a candidate clarification takes: the missing fact, the',
  'decision it changes, at least two branches it could resolve to, and the question to ask.',
  'Emit it ONLY on outcome INSUFFICIENT_EVIDENCE. When you reached a determination -- ANALYZED or',
  'NO_HAZARD_ESTABLISHED -- the decision was made and `unresolvedDecisions` MUST be an empty array.',
  'It carries a QUESTION only. It never asserts a hazard, a condition state or a control.',
].join('\n');

const ASKING_HEADER = 'ASKING A QUESTION -- AND WHEN NOT TO.';

function buildPrompt(placement: 'APPEND' | 'MOVE1'): string {
  if (placement === 'APPEND') return `${L3_SYSTEM_PROMPT}\n${CARRIER_DECLARATION}`;
  const lines = L3_SYSTEM_PROMPT.split('\n');
  const idx = lines.findIndex(l => l === ASKING_HEADER);
  if (idx < 0) throw new Error('MOVE1 anchor not found -- shipped prompt changed shape');
  return [...lines.slice(0, idx), ...CARRIER_DECLARATION.split('\n'), '', ...lines.slice(idx)].join('\n');
}

interface Variant { id: string; label: string; prompt: string; carrier: boolean }
const ALL_VARIANTS: Variant[] = [
  // THE BEFORE. Shipped prompt verbatim, shipped schema, NO carrier anywhere. Without this every
  // "no regression" claim below would be an assertion rather than a measurement (§24, D-54).
  { id: 'V_BASELINE_NO_CARRIER', label: 'shipped prompt + shipped schema, carrier ABSENT -- the BEFORE', prompt: L3_SYSTEM_PROMPT, carrier: false },
  { id: 'V_CARRIER', label: 'shipped prompt + carrier declaration APPENDED', prompt: buildPrompt('APPEND'), carrier: true },
  { id: 'V_CARRIER_MOVE1', label: 'the same declaration MOVED before ASKING A QUESTION', prompt: buildPrompt('MOVE1'), carrier: true },
  { id: 'V_CARRIER_REPEAT', label: 'V_CARRIER byte-identical -- NOISE FLOOR', prompt: buildPrompt('APPEND'), carrier: true },
];

// =====================================================================================
// COHORT. All already-opened. NO SEALED SET IS TOUCHED.
// =====================================================================================

type Pole = 'CLARIFICATION_REQUIRED' | 'CLARIFICATION_MUST_NOT_ASK' | 'NEGATIVE_CONTROL' | 'HIGH_CONSEQUENCE';
interface Scen {
  id: string; pole: Pole; regime: L3RegulatoryContextValue;
  expectActive: boolean; expectClarification: boolean; text: string;
}

const S: Scen[] = [
  { id: 'F-CL-01', pole: 'CLARIFICATION_REQUIRED', regime: 'osha-general-industry', expectActive: false, expectClarification: true,
    text: 'The anchor bracket on the davit arm did not look right to me.' },
  { id: 'B10', pole: 'CLARIFICATION_REQUIRED', regime: 'osha-general-industry', expectActive: false, expectClarification: true,
    text: 'The rail on the platform did not look right to me.' },
  { id: 'C-CS-05', pole: 'CLARIFICATION_MUST_NOT_ASK', regime: 'osha-general-industry', expectActive: false, expectClarification: false,
    text: 'If the level probe on the caustic tank were to fail closed during a transfer, the vent could pressurise and lift the manway gasket.' },
  { id: 'F-PS-04', pole: 'NEGATIVE_CONTROL', regime: 'osha-general-industry', expectActive: false, expectClarification: false,
    text: 'The audit found no fall from height reported for the quarter and no lost time injury on any shift.' },
  { id: 'H-FLD-141', pole: 'HIGH_CONSEQUENCE', regime: 'osha-general-industry', expectActive: true, expectClarification: false,
    text: 'Crew was changing the knives on the granulator; no LOTO is applied and the guard is missing.' },
];

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'housekeeping', 'confined_space',
  'noise_exposure', 'lifting_rigging', 'mobile_equipment', 'ground_control', 'scaffolds',
  'personal_protective_equipment', 'fire', 'hot_work', 'struck_by', 'emergency_egress',
  'material_handling', 'trenching_shoring', 'compressed_gas_cylinders', 'ergonomics', 'respiratory_protection'];

/** The cohort must be the LOCKED one. Drift here would invalidate every comparison downstream. */
function assertCohortMatchesLockedHarness(): Record<string, boolean> {
  const src = readFileSync(join(__dirname, 'ablate-l32g-state-separation.ts'), 'utf8');
  const result: Record<string, boolean> = {};
  for (const s of S) {
    result[s.id] = src.includes(`text: '${s.text.replace(/'/g, "\\'")}'`);
    if (!result[s.id]) throw new Error(`cohort drift: ${s.id} text is not the locked harness's text`);
  }
  return result;
}

// =====================================================================================
// SCHEMA. The shipped candidate shape, plus the new top-level carrier and nothing else.
// =====================================================================================

function clarificationSchema(nullable: boolean): Record<string, unknown> {
  return {
    type: nullable ? ['object', 'null'] : 'object', additionalProperties: false,
    required: ['unresolvedFact', 'affectedDecision', 'branches', 'question'],
    properties: {
      unresolvedFact: { type: 'string' },
      affectedDecision: { type: 'string', enum: ['hazard_identity', 'condition_state', 'regulatory_applicability', 'risk', 'corrective_action'] },
      branches: { type: 'array', items: { type: 'string' } },
      question: { type: 'string' },
    },
  };
}

function buildSchema(input: ReasoningInput, carrier: boolean): Record<string, unknown> {
  const candidateIds = (input.eligibleRegulatoryCandidates || []).map(c => c.candidateId);
  const sourceIds = input.authoritativeSources.map(s => s.sourceId);
  const evidenceItem = {
    type: 'object', additionalProperties: false,
    required: ['sourceId', 'quotedText'],
    properties: { sourceId: { type: 'string', enum: sourceIds }, quotedText: { type: 'string' } },
  };
  return {
    type: 'object', additionalProperties: false,
    required: carrier
      ? ['outcome', 'observationInterpretation', 'hazardCandidates', 'unresolvedDecisions']
      : ['outcome', 'observationInterpretation', 'hazardCandidates'],
    properties: {
      outcome: { type: 'string', enum: ['ANALYZED', 'NO_HAZARD_ESTABLISHED', 'INSUFFICIENT_EVIDENCE'] },
      observationInterpretation: { type: 'string' },
      hazardCandidates: {
        type: 'array',
        items: {
          type: 'object', additionalProperties: false,
          required: ['candidateKey', 'hazardFamily', 'conditionState', 'evidence',
            'conditionRationale', 'independentHazardRationale', 'uncertainties'],
          properties: {
            candidateKey: { type: 'string' },
            hazardFamily: { type: 'string', enum: input.allowedHazardFamilies },
            conditionState: { type: 'string', enum: [...L3_CONDITION_STATES] },
            evidence: { type: 'array', items: evidenceItem },
            conditionRationale: { type: 'string' },
            independentHazardRationale: { type: 'string' },
            uncertainties: { type: 'array', items: { type: 'string' } },
            clarification: clarificationSchema(true),
            correctiveActionIntent: {
              type: ['object', 'null'], additionalProperties: false,
              required: ['objective', 'hierarchyLevel', 'groundedInEvidence'],
              properties: {
                objective: { type: 'string' },
                hierarchyLevel: { type: 'string', enum: [...L3_CONTROL_HIERARCHY_LEVELS] },
                groundedInEvidence: { type: 'array', items: evidenceItem },
              },
            },
            regulatoryCandidateRefs: candidateIds.length
              ? { type: 'array', items: { type: 'string', enum: candidateIds } }
              : { type: 'array', items: { type: 'string', enum: [] }, maxItems: 0 },
          },
        },
      },
      // THE CONTRACT CHANGE UNDER TEST. Absent entirely on the baseline variant.
      ...(carrier ? { unresolvedDecisions: { type: 'array', items: clarificationSchema(false) } } : {}),
    },
  };
}

// =====================================================================================

async function infer(systemPrompt: string, input: ReasoningInput, carrier: boolean): Promise<any> {
  const body = {
    model: CFG.model, stream: false, format: buildSchema(input, carrier),
    options: { temperature: CFG.temperature, seed: CFG.seed, num_ctx: CFG.numCtx },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserPrompt(input) },
    ],
  };
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), CFG.timeoutMs);
  try {
    const res = await fetch(`${CFG.endpoint}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body), signal: ac.signal,
    });
    if (!res.ok) return { __error: `HTTP ${res.status}` };
    const j: any = await res.json();
    try { return JSON.parse(j?.message?.content ?? ''); }
    catch { return { __error: 'MALFORMED_STRUCTURED_OUTPUT' }; }
  } catch (e: any) {
    return { __error: e?.name === 'AbortError' ? 'TIMEOUT' : String(e?.message || e) };
  } finally { clearTimeout(t); }
}

function mk(s: Scen): ReasoningInput {
  return buildReasoningInput({
    analysisId: `l32i-${s.id}`, observationText: s.text,
    regulatoryContext: { value: s.regime, provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}

async function main() {
  const only = (process.env.ONLY || '').trim();
  if (!only) throw new Error('ONLY=<variant> is REQUIRED -- §38.3 forbids sharing a process between variants');
  const variants = ALL_VARIANTS.filter(v => v.id === only);
  if (variants.length !== 1) throw new Error(`ONLY must name exactly ONE variant; got '${only}'`);
  const v = variants[0];

  const shippedSha = createHash('sha256').update(L3_SYSTEM_PROMPT).digest('hex');
  const harnessSha = createHash('sha256')
    .update(readFileSync(join(__dirname, 'ablate-l32g-state-separation.ts'))).digest('hex');

  const out: any = {
    phase: 'L3-2i', role: 'TARGETED_ZERO_CANDIDATE_CLARIFICATION_PROOF',
    generatedAt: new Date().toISOString(),
    processIsolation: {
      rule: 'AN IDENTICAL PROMPT REPEATED INSIDE ONE PROCESS IS NOT A NOISE-FLOOR CONTROL (§38.3)',
      variantsInThisProcess: 1, variant: v.id, pid: process.pid,
    },
    provider: { model: CFG.model, endpoint: CFG.endpoint, temperature: CFG.temperature, seed: CFG.seed, numCtx: CFG.numCtx },
    containment: {
      shippedSystemPromptSha256: shippedSha,
      shippedSystemPromptUnchanged: shippedSha === SHIPPED_PROMPT_SHA,
      lockedAblationHarnessSha256: harnessSha,
      lockedAblationHarnessUnchanged: harnessSha === LOCKED_HARNESS_SHA,
      declarationIsAdditive: v.prompt.includes(L3_SYSTEM_PROMPT.split('\n')[0]),
      shippedPromptIsAVerbatimPrefix: v.id === 'V_CARRIER_MOVE1' ? null : v.prompt.startsWith(L3_SYSTEM_PROMPT),
      note: 'The declaration is a CONTRACT DECLARATION, not prompt tuning: no rung is reworded, '
        + 'nothing shipped is moved, no emphasis is changed. A model cannot emit a field it has not '
        + 'been told exists, so this is a precondition of exercising the contract at all.',
    },
    variant: { id: v.id, label: v.label, carrierDeclared: v.carrier, promptSha256: createHash('sha256').update(v.prompt).digest('hex') },
    cohortMatchesLockedHarness: assertCohortMatchesLockedHarness(),
    rows: [] as any[],
  };

  for (const s of S) {
    const input = mk(s);
    const t0 = Date.now();
    const raw = await infer(v.prompt, input, v.carrier);
    const ms = Date.now() - t0;

    const bound = raw?.__error ? null : bindProposal(raw, input);
    const validation = bound ? validateReasoningProposal(bound.proposal, input) : null;
    const cands: any[] = Array.isArray(raw?.hazardCandidates) ? raw.hazardCandidates : [];

    // The two carriers, measured SEPARATELY so the proof is about the new one.
    const candidateBorneClarification = cands.some(c => c?.clarification);
    const proposalLevelClarification = Array.isArray(raw?.unresolvedDecisions) && raw.unresolvedDecisions.length > 0;
    const validatedProposalLevel = (validation?.validated?.unresolvedDecisions?.length ?? 0) > 0;

    out.rows.push({
      scenarioId: s.id, pole: s.pole, variant: v.id, carrierDeclared: v.carrier,
      expectActive: s.expectActive, expectClarification: s.expectClarification,
      error: raw?.__error ?? null,
      outcome: raw?.outcome ?? null,
      candidateCount: cands.length,
      zeroCandidate: cands.length === 0,
      modelStates: cands.map(c => c?.conditionState).filter(Boolean),
      assertsActive: cands.some(c => c?.conditionState === 'ACTIVE'),
      candidateBorneClarification,
      proposalLevelClarification,
      // THE PROOF: did the clarification survive binding AND deterministic validation?
      validationState: validation?.state ?? null,
      validationIssues: (validation?.issues ?? []).map(i => i.code),
      validatedProposalLevelClarification: validatedProposalLevel,
      validatedProposalLevelCount: validation?.validated?.unresolvedDecisions?.length ?? 0,
      // Scenario-level: ANY carrier satisfies the inspector's need for a question.
      clarificationCarriedAnywhere: candidateBorneClarification || validatedProposalLevel,
      unresolvedDecisions: validation?.validated?.unresolvedDecisions ?? null,
      latencyMs: ms,
    });
    process.stdout.write(`${s.id}/${v.id} `);
  }
  process.stdout.write('\n');

  const dest = process.env.OUT || `prove-l32i-${v.id}.json`;
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`wrote ${dest}  (${out.rows.length} rows, 1 variant, pid ${process.pid})`);
}

main().catch(e => { console.error(e); process.exit(1); });
