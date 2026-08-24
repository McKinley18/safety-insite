/**
 * L3-2j -- THE SHIPPED PIPELINE, OVER THE FULL ALREADY-OPEN DIAGNOSTIC CORPUS.
 *
 * WHY THIS EXISTS SEPARATELY FROM THE LOCKED HARNESS. `ablate-l32g-state-separation.ts` is byte-
 * locked and builds its OWN schema, which has no carrier field in it. Re-running it against the new
 * prompt answers one question -- did declaring the field disturb the comparison L3-2h's numbers were
 * taken under -- and it is run, unmodified, for exactly that. It cannot answer the other question,
 * because a model told about a field its schema forbids cannot emit one.
 *
 * This program answers the other question: WITH THE SHIPPED PROMPT AND THE SHIPPED SCHEMA, over the
 * same 24 scenarios, does the activated pipeline produce the clarification the inspector is owed,
 * and does anything else move? It performs the full shipped sequence -- `buildProposalSchema`,
 * `buildUserPrompt`, `bindProposal`, `validateReasoningProposal` -- and imports every one of them
 * rather than reproducing any of it.
 *
 * ============================ WHERE THE DECLARATION LIVES, AND WHY ============================
 *
 * L3-2j DID put the declaration in `L3_SYSTEM_PROMPT` -- that was the authorized next action, and it
 * is what produced every artifact under `results/decl1/` and `results/decl2/`. It was then REMOVED
 * again on the evidence those artifacts carry (blueprint section 41), so the declaration now lives
 * HERE, harness-side, exactly where L3-2i kept it. The reconstruction is machine-checked: the prompt
 * this program builds must hash to the value the recorded artifacts say was actually sent, or it
 * refuses to run. A variant that cannot reproduce the string it claims to have measured is not a
 * variant, it is a story.
 *
 * ============================ THE BEFORE IS MEASURED, NOT ASSERTED (D-54) ============================
 *
 *   V_PRE_ACTIVATION      the shipped prompt and the shipped schema as they stand -- the BASELINE.
 *   V_ACTIVATED_REV1      revision 1 of the declaration: the byte-identical `CARRIER_DECLARATION`
 *                         L3-2i proved on five scenarios, appended. REJECTED: 12/13 -> 9/13.
 *   V_ACTIVATED_REV2      revision 2: the empty-list licence removed, precedence stated instead.
 *                         ALSO REJECTED: 12/13 -> 10/13, and the carrier went unused on all 24.
 *   V_SCHEMA_ONLY         the schema half alone, prompt silent -- the attribution control. The
 *                         schema is sent to the provider as `format`, so adding a REQUIRED top-level
 *                         key is not a silent change and must be measured on its own.
 *   *_REPEAT              each of the above again, in its OWN PROCESS -- the noise floor. Section
 *                         38.3: `AN IDENTICAL PROMPT REPEATED INSIDE ONE PROCESS IS NOT A
 *                         NOISE-FLOOR CONTROL`, so the runner REFUSES more than one variant per
 *                         invocation.
 *
 * ============================ EVIDENCE CLASS ============================
 *
 * `DIAGNOSTIC. NOT ADVANCEMENT EVIDENCE.` Every scenario is already-opened development or
 * retired-holdout material, taken from the locked harness and asserted byte-identical to it at
 * startup. NO SEALED SET IS OPENED.
 *
 * Run: ONLY=V_ACTIVATED OUT=... npx ts-node scripts/activate-l32j-shipped-corpus.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { createHash } from 'crypto';
import type {
  ReasoningInput, L3RegulatoryContextValue,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import {
  L3_CARRIER_DECLARATION_ANCHOR, L3_PROMPT_VERSION, L3_SYSTEM_PROMPT,
  bindProposal, buildProposalSchema, buildUserPrompt,
} from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import { L3_2_INFERENCE_CONFIG } from '../src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';

const CFG = L3_2_INFERENCE_CONFIG;
const V6_PROMPT_SHA = 'b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf';
const LOCKED_HARNESS_SHA = '73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521';
const HARNESS = join(__dirname, 'ablate-l32g-state-separation.ts');

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');

// =====================================================================================
// THE COHORT IS READ OUT OF THE LOCKED HARNESS, NOT RETYPED BESIDE IT.
//
// L3-2i asserted its five scenario texts matched the locked harness. That catches an edited text but
// not a MISSING scenario, and this phase must run the FULL corpus -- so the list is PARSED from the
// harness source and then cross-checked, field by field, against the FROZEN L3-2g artifact's rows.
// Two independent sources agreeing on all 24 is what makes cohort drift unrepresentable here.
// =====================================================================================

type Pole = 'HIGH_CONSEQUENCE' | 'CLARIFICATION_REQUIRED' | 'CLARIFICATION_MUST_NOT_ASK'
  | 'NEGATIVE_CONTROL' | 'DECIDED_NON_ACTIVE' | 'REGRESSION_ACTIVE';

interface Scen {
  id: string; pole: Pole; regime: L3RegulatoryContextValue;
  expectActive: boolean; expectClarification: boolean; provenance: string; text: string;
}

/** `NON_ACTIVE` is `true` in the harness, so `!NON_ACTIVE ? true : false` evaluates to false. */
function evalBool(expr: string): boolean {
  const e = expr.trim();
  if (e === 'true') return true;
  if (e === 'false') return false;
  if (e === '!NON_ACTIVE ? true : false') return false;
  throw new Error(`unrecognised boolean expression in the locked harness: ${e}`);
}

function parseCohort(): Scen[] {
  const src = readFileSync(HARNESS, 'utf8');
  const block = src.slice(src.indexOf('const S: Scen[] = ['), src.indexOf('\nconst FAM = ['));
  const re = /\{\s*id:\s*'([^']+)',\s*pole:\s*'([^']+)',\s*regime:\s*'([^']+)',\s*expectActive:\s*([^,]+),\s*expectClarification:\s*(true|false),\s*provenance:\s*'([^']+)',\s*\n\s*text:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
  const out: Scen[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    out.push({
      id: m[1], pole: m[2] as Pole, regime: m[3] as L3RegulatoryContextValue,
      expectActive: evalBool(m[4]), expectClarification: m[5] === 'true',
      provenance: m[6], text: m[7].replace(/\\'/g, "'").replace(/\\\\/g, '\\'),
    });
  }
  return out;
}

/**
 * The FROZEN L3-2g ablation artifact records `pole`, `expectActive` and `expectClarification` for
 * every scenario it ran. It is an artifact, not the harness, so agreement between the two is a
 * genuine second opinion on what the cohort is.
 */
function crossCheckAgainstFrozenArtifact(cohort: Scen[]): Record<string, unknown> {
  const frozen = join(
    __dirname, '..', '..', 'verification', 'hazlenz-l3-2g-state-separation-2026-08-23',
    'rootcause', 'ablation-run-1.json',
  );
  const rows: any[] = JSON.parse(readFileSync(frozen, 'utf8')).rows;
  const byId = new Map<string, any>();
  for (const r of rows) if (!byId.has(r.scenarioId)) byId.set(r.scenarioId, r);

  const disagreements: string[] = [];
  for (const s of cohort) {
    const r = byId.get(s.id);
    if (!r) { disagreements.push(`${s.id}: absent from the frozen artifact`); continue; }
    if (r.pole !== s.pole) disagreements.push(`${s.id}: pole ${r.pole} vs ${s.pole}`);
    if (r.expectActive !== s.expectActive) disagreements.push(`${s.id}: expectActive`);
    if (r.expectClarification !== s.expectClarification) disagreements.push(`${s.id}: expectClarification`);
  }
  const missing = Array.from(byId.keys()).filter(id => !cohort.some(s => s.id === id));
  if (disagreements.length || missing.length || cohort.length !== byId.size) {
    throw new Error(`COHORT DRIFT: ${[...disagreements, ...missing.map(m => `${m}: in artifact, not parsed`)].join('; ')}`);
  }
  return { scenariosParsed: cohort.length, scenariosInFrozenArtifact: byId.size, disagreements: 0 };
}

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'housekeeping', 'confined_space',
  'noise_exposure', 'lifting_rigging', 'mobile_equipment', 'ground_control', 'scaffolds',
  'personal_protective_equipment', 'fire', 'hot_work', 'struck_by', 'emergency_egress',
  'material_handling', 'trenching_shoring', 'compressed_gas_cylinders', 'ergonomics', 'respiratory_protection'];

// =====================================================================================
// VARIANTS. The BEFORE is DERIVED from the shipped artefacts, never retyped (section 34.1).
// =====================================================================================

const carrierAt = L3_SYSTEM_PROMPT.indexOf(L3_CARRIER_DECLARATION_ANCHOR);
const V6_PROMPT = carrierAt < 0 ? L3_SYSTEM_PROMPT : L3_SYSTEM_PROMPT.slice(0, carrierAt);
if (sha(V6_PROMPT) !== V6_PROMPT_SHA) {
  throw new Error(`the v6 prompt body is NOT byte-identical (${sha(V6_PROMPT)}) -- the BEFORE would be a different experiment`);
}

/**
 * REVISION 1. Byte-identical to `CARRIER_DECLARATION` in `prove-l32i-clarification-carrier.ts`, the
 * text that harness ran as `V_CARRIER` and measured 0% -> 100% scenario-level recall on five
 * scenarios. Kept here verbatim BECAUSE it was rejected: the record of what was tried is the record
 * of why the conclusion is what it is, and a rejected variant that has been deleted cannot be
 * re-measured by the phase that doubts the rejection.
 */
const DECLARATION_REV1 = [
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

/**
 * REVISION 2. Revision 1's sentence about returning `an EMPTY hazardCandidates array` read to the
 * provider as permission to return one, contradicting ASKING A QUESTION above, which says in terms
 * that an empty list there is WRONG. This revision removes the licence and states the precedence.
 * It recovered two of the three lost high-consequence cases and was STILL rejected.
 */
const DECLARATION_REV2 = [
  '',
  'UNRESOLVED DECISIONS -- A LAST-RESORT CARRIER, NOT AN ALTERNATIVE TO ASKING A QUESTION.',
  '`unresolvedDecisions` is a TOP-LEVEL array on your answer, beside `hazardCandidates`. It exists for',
  'ONE case: you owe a decision-critical question and there is genuinely no hazard candidate for it to',
  'hang on. Each entry takes the same four fields a candidate clarification takes: the missing fact,',
  'the decision it changes, at least two branches it could resolve to, and the question to ask.',
  'ASKING A QUESTION ABOVE STILL GOVERNS, AND THIS DOES NOT WEAKEN IT. Where that section tells you to',
  'emit a candidate with conditionState INSUFFICIENT_EVIDENCE and a filled-in `clarification`, do',
  'exactly that -- the candidate carrier is still the required shape, and this field is not a way out',
  'of it. This field NEVER justifies returning an empty hazardCandidates list, dropping a candidate you',
  'would otherwise have emitted, or leaving the ladder before it reaches the rung the text supports.',
  'Emit it ONLY on outcome INSUFFICIENT_EVIDENCE. When you reached a determination -- ANALYZED or',
  'NO_HAZARD_ESTABLISHED -- the decision was made and `unresolvedDecisions` MUST be an empty array.',
  'It carries a QUESTION only. It never asserts a hazard, a condition state or a control.',
].join('\n');

/**
 * The sha256 each reconstruction MUST produce. These are read from the recorded artifacts' own
 * `shippedPath.promptUsedSha256`, taken when the declaration sat in `L3_SYSTEM_PROMPT` itself. If a
 * reconstruction ever stops matching, the variant is no longer the thing that was measured and this
 * program must fail rather than quietly measure something else.
 */
const RECORDED_PROMPT_SHA: Record<string, string> = {
  REV1: 'b7f351115d71c6e51992c4430e4f88c46c5560bbe7f691e0bd52afacd52ea9b2',
  REV2: '45862b26e880faf317de73949872b72746d903737514acbb87764258ab8fd382',
};

function activatedPrompt(rev: 'REV1' | 'REV2'): string {
  const built = `${V6_PROMPT}\n${rev === 'REV1' ? DECLARATION_REV1 : DECLARATION_REV2}`;
  if (sha(built) !== RECORDED_PROMPT_SHA[rev]) {
    throw new Error(`${rev} does not reproduce the prompt that was measured: ${sha(built)} != ${RECORDED_PROMPT_SHA[rev]}`);
  }
  return built;
}

/**
 * The shipped schema PLUS the carrier. L3-2j added this to `buildProposalSchema` itself, measured it,
 * and took it out again, so the addition is expressed here -- derived from the shipped schema rather
 * than retyped beside it, which is what makes "the only difference is the carrier" a fact.
 *
 * KEY ORDER IS PART OF THE INPUT, NOT A DETAIL. This schema is serialised and sent to the provider as
 * `format`, so where the new key sits changes the bytes the model is constrained by. Rebuilding it
 * with the key appended instead of inserted moved SIX measured fields across the corpus -- `B10` lost
 * its candidate, `F-TB-02` lost its candidate, three rows changed which carrier held the question --
 * on a prompt whose sha256 was identical. The key therefore goes back exactly where it sat when the
 * recorded runs were taken: between `observationInterpretation` and `hazardCandidates`. The schema's
 * own sha256 is written into every artifact so this can never again be checked by reading the code.
 */
function schemaWithCarrier(input: ReasoningInput): Record<string, unknown> {
  const base: any = JSON.parse(JSON.stringify(buildProposalSchema(input)));
  const candidateClarification = base.properties.hazardCandidates.items.properties.clarification;
  const props: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(base.properties)) {
    if (k === 'hazardCandidates') {
      // The candidate clarification's own shape, made non-nullable. Taken from the schema, never
      // written out again, so the two carriers cannot drift apart in this harness.
      props.unresolvedDecisions = { type: 'array', items: { ...candidateClarification, type: 'object' } };
    }
    props[k] = v;
  }
  return {
    ...base,
    required: [...(base.required as string[]), 'unresolvedDecisions'],
    properties: props,
  };
}

interface Variant {
  id: string; label: string;
  declaration: 'NONE' | 'REV1' | 'REV2';
  carrierSchema: boolean;
}
const ALL_VARIANTS: Variant[] = [
  { id: 'V_PRE_ACTIVATION', label: 'shipped prompt + shipped schema, carrier ABSENT -- the BASELINE', declaration: 'NONE', carrierSchema: false },
  { id: 'V_ACTIVATED_REV1', label: 'declaration revision 1 (the L3-2i text) + carrier schema', declaration: 'REV1', carrierSchema: true },
  { id: 'V_ACTIVATED_REV1_REPEAT', label: 'V_ACTIVATED_REV1 again, own process -- NOISE FLOOR', declaration: 'REV1', carrierSchema: true },
  { id: 'V_ACTIVATED_REV2', label: 'declaration revision 2 + carrier schema', declaration: 'REV2', carrierSchema: true },
  { id: 'V_ACTIVATED_REV2_REPEAT', label: 'V_ACTIVATED_REV2 again, own process -- NOISE FLOOR', declaration: 'REV2', carrierSchema: true },
  { id: 'V_SCHEMA_ONLY', label: 'shipped prompt + carrier schema -- the schema half, alone', declaration: 'NONE', carrierSchema: true },
  { id: 'V_SCHEMA_ONLY_REPEAT', label: 'V_SCHEMA_ONLY again, own process -- NOISE FLOOR', declaration: 'NONE', carrierSchema: true },
];

// =====================================================================================

async function infer(systemPrompt: string, schema: Record<string, unknown>, input: ReasoningInput): Promise<any> {
  const body = {
    model: CFG.model, stream: false, format: schema,
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
    analysisId: `l32j-${s.id}`, observationText: s.text,
    regulatoryContext: { value: s.regime, provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}

async function main() {
  const only = (process.env.ONLY || '').trim();
  if (!only) throw new Error('ONLY=<variant> is REQUIRED -- section 38.3 forbids sharing a process between variants');
  const picked = ALL_VARIANTS.filter(v => v.id === only);
  if (picked.length !== 1) throw new Error(`ONLY must name exactly ONE variant; got '${only}'`);
  const v = picked[0];
  const prompt = v.declaration === 'NONE' ? V6_PROMPT : activatedPrompt(v.declaration);

  const cohort = parseCohort();
  const cohortCheck = crossCheckAgainstFrozenArtifact(cohort);

  const out: any = {
    phase: 'L3-2j', role: 'SHIPPED_PIPELINE_OVER_FULL_DIAGNOSTIC_CORPUS_NOT_ADVANCEMENT_EVIDENCE',
    generatedAt: new Date().toISOString(),
    processIsolation: {
      rule: 'AN IDENTICAL PROMPT REPEATED INSIDE ONE PROCESS IS NOT A NOISE-FLOOR CONTROL (section 38.3)',
      variantsInThisProcess: 1, variant: v.id, pid: process.pid,
    },
    provider: {
      model: CFG.model, endpoint: CFG.endpoint, temperature: CFG.temperature,
      seed: CFG.seed, numCtx: CFG.numCtx, timeoutMs: CFG.timeoutMs,
    },
    shippedPath: {
      note: 'schema, user prompt, binder and validator are the SHIPPED functions, imported not reproduced',
      promptVersion: L3_PROMPT_VERSION,
      v6PromptSha256: sha(V6_PROMPT),
      v6PromptIsByteIdentical: sha(V6_PROMPT) === V6_PROMPT_SHA,
      declarationLivesInTheShippedPrompt: carrierAt >= 0,
      shippedPromptSha256: sha(L3_SYSTEM_PROMPT),
      promptUsedSha256: sha(prompt),
      lockedAblationHarnessSha256: sha(readFileSync(HARNESS)),
      lockedAblationHarnessUnchanged: sha(readFileSync(HARNESS)) === LOCKED_HARNESS_SHA,
    },
    variant: { id: v.id, label: v.label, declarationRevision: v.declaration, carrierPresentInSchema: v.carrierSchema },
    // The first scenario's serialised schema. It is sent to the provider as `format`, so it is an
    // INPUT, and two runs that agree on the prompt but not on this did not run the same experiment.
    schemaSha256: null as string | null,
    cohort: { ...cohortCheck, source: 'parsed from the locked harness, cross-checked against the frozen L3-2g artifact' },
    rows: [] as any[],
  };

  for (const s of cohort) {
    const input = mk(s);
    const schema = v.carrierSchema ? schemaWithCarrier(input) : buildProposalSchema(input);
    if (!out.schemaSha256) out.schemaSha256 = sha(JSON.stringify(schema));
    const t0 = Date.now();
    const raw = await infer(prompt, schema, input);
    const ms = Date.now() - t0;

    const bound = raw?.__error ? null : bindProposal(raw, input);
    const validation = bound ? validateReasoningProposal(bound.proposal, input) : null;
    const cands: any[] = Array.isArray(raw?.hazardCandidates) ? raw.hazardCandidates : [];

    const candidateBorneClarification = cands.some(c => c?.clarification);
    const proposalLevelClarification = Array.isArray(raw?.unresolvedDecisions) && raw.unresolvedDecisions.length > 0;
    const validatedProposalLevel = (validation?.validated?.unresolvedDecisions?.length ?? 0) > 0;

    out.rows.push({
      scenarioId: s.id, pole: s.pole, provenance: s.provenance, variant: v.id,
      declarationRevision: v.declaration, carrierPresentInSchema: v.carrierSchema,
      expectActive: s.expectActive, expectClarification: s.expectClarification,
      error: raw?.__error ?? null,
      outcome: raw?.outcome ?? null,
      candidateCount: cands.length,
      zeroCandidate: cands.length === 0,
      modelStates: cands.map(c => c?.conditionState).filter(Boolean),
      modelAssertsActive: cands.some(c => c?.conditionState === 'ACTIVE'),
      raisedClarification: candidateBorneClarification,
      candidateBorneClarification,
      proposalLevelClarification,
      validationState: validation?.state ?? null,
      validationIssues: (validation?.issues ?? []).map(i => i.code),
      validatedAssertsActive: (validation?.validated?.hazards ?? []).some(h => h.conditionState === 'ACTIVE'),
      validatedHazardCount: validation?.validated?.hazards?.length ?? null,
      validatedProposalLevelClarification: validatedProposalLevel,
      validatedProposalLevelCount: validation?.validated?.unresolvedDecisions?.length ?? 0,
      clarificationCarriedAnywhere: candidateBorneClarification || validatedProposalLevel,
      unresolvedDecisions: validation?.validated?.unresolvedDecisions ?? null,
      // The locked scorer reads `derived` and treats null as "no candidate facts". The shipped
      // prompt is the LADDER, which emits no `stateFacts`, so this is null by construction and the
      // candidate-conditioned denominator is UNDEFINED on these rows -- exactly as it was on L3-2i's
      // proof rows, and exactly why D-58 keeps the two denominators separately named.
      derived: null,
      latencyMs: ms,
    });
    process.stdout.write(`${s.id} `);
  }
  process.stdout.write('\n');

  const dest = process.env.OUT || `activate-l32j-${v.id}.json`;
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`wrote ${dest}  (${out.rows.length} rows, 1 variant, pid ${process.pid})`);
}

main().catch(e => { console.error(e); process.exit(1); });
