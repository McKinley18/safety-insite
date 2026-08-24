/**
 * L3-2k -- DISPOSABLE DIAGNOSTIC INSTRUMENT. `F-WC-09` and `C-CS-05`, traced end to end.
 *
 * ============================ WHY THIS EXISTS ============================
 *
 * Every existing artifact records SUMMARY fields -- `modelStates`, `raisedClarification`,
 * `validationState`. None records the raw proposal, the candidate identity, the evidence spans, the
 * rationale, the clarification TEXT, or the semantic binder's output. Two causal questions survive
 * artifact analysis and neither can be answered from what is already on disk:
 *
 *   F-WC-09  WHICH hazard does the single ladder candidate name, and on what evidence, when qwen
 *            labels it CONTROLLED? The structural runs emit TWO candidates (`DEFEATED` + `WARNS_ONLY`,
 *            both -> ACTIVE). The ladder emits ONE. Collapsing and mislabelling are different faults.
 *
 *   C-CS-05  Does the unnecessary question SURVIVE the full shipped sequence? The L3-2j corpus runner
 *            stops at `validateReasoningProposal`; §34.2's clarification gate lives in
 *            `bindEvidenceSemantically`, which runs AFTER it in `reasoning-runner.ts:81` and which NO
 *            existing artifact ever ran. Reading `validationIssues: []` as "the gate did not drop it"
 *            would be §42.4's error exactly -- a boundary the instrument never reached.
 *
 * ============================ WHAT IT MAY AND MAY NOT TOUCH ============================
 *
 * It IMPORTS the shipped prompt, the shipped schema builder, the shipped user-prompt builder, the
 * shipped normalizer, the shipped validator and the shipped semantic binder, and REPRODUCES NONE of
 * them. It modifies no production file, no shipped prompt, no shipped schema, no provider adapter, no
 * historical harness and no historical scorer. It is verification-side and disposable.
 *
 * Variant A is §36.7's ALREADY-OPEN prompt variant, reconstructed by the same manipulation the locked
 * harness uses and then ASSERTED against the sha256 the frozen L3-2g artifact recorded. A variant that
 * cannot reproduce the string the record says was measured is not that variant.
 *
 * §38.3: ONE variant per process. The runner REFUSES more, and every artifact records its own pid.
 *
 * Run: ONLY=<variant> OUT=... npx ts-node scripts/diagnose-l32k-shipped-residual.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { createHash } from 'crypto';
import type { ReasoningInput, L3RegulatoryContextValue } from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { L3_PROMPT_VERSION, L3_SYSTEM_PROMPT, bindProposal, buildProposalSchema, buildUserPrompt }
  from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import { L3_2_INFERENCE_CONFIG } from '../src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';

const CFG = L3_2_INFERENCE_CONFIG;
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

const V6_PROMPT_SHA = 'b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf';
/** The sha256 the FROZEN L3-2g artifact recorded for §36.7's variant A. */
const V_A_LADDER_SHA = 'a6dea73fcbc52140c091275d3bca327b61cacec5f8775d43fb977faa08724988';
const HARNESS = join(__dirname, 'ablate-l32g-state-separation.ts');
const FROZEN_L32G = join(__dirname, '..', '..', 'verification',
  'hazlenz-l3-2g-state-separation-2026-08-23', 'rootcause', 'ablation-run-1.json');

// ---------------------------------------------------------------- variant A, reconstructed then PINNED
// The same manipulation `ablate-l32g-state-separation.ts::buildVariantA` performs. It is reproduced
// here rather than imported because the locked harness exports nothing, and it is then checked
// against the recorded digest so the reproduction cannot silently differ.
const LADDER_ANCHOR_ACTIVE = "  ACTIVE              a required control is ABSENT, MISSING, DAMAGED, BYPASSED or NOT USED right now,";
const ABSENT_CONTROLS_HEADER = 'ABSENT CONTROLS -- HOW AN ABSENCE GETS WRITTEN.';
const ASKING_HEADER = 'ASKING A QUESTION -- AND WHEN NOT TO.';

function buildVariantA(): string {
  const lines = L3_SYSTEM_PROMPT.split('\n');
  const absentIdx = lines.findIndex(l => l === ABSENT_CONTROLS_HEADER);
  const askingIdx = lines.findIndex(l => l === ASKING_HEADER);
  if (absentIdx < 0 || askingIdx < 0) throw new Error('variant A anchors not found -- shipped prompt changed shape');
  let block = lines.slice(absentIdx, askingIdx);
  while (block.length && block[block.length - 1].trim() === '') block = block.slice(0, -1);
  const rest = [...lines.slice(0, absentIdx), ...lines.slice(askingIdx)];
  const activeIdx = rest.findIndex(l => l === LADDER_ANCHOR_ACTIVE);
  if (activeIdx < 0) throw new Error('variant A ACTIVE rung anchor not found');
  const indented = block.map(l => (l.trim() === '' ? '' : `                      ${l}`));
  let insertAt = activeIdx + 1;
  while (insertAt < rest.length && rest[insertAt].startsWith('                      ')) insertAt += 1;
  return [...rest.slice(0, insertAt), ...indented, ...rest.slice(insertAt)].join('\n');
}

// ---------------------------------------------------------------- the cohort, from the locked harness
interface Scen { id: string; pole: string; regime: L3RegulatoryContextValue; expectActive: boolean; expectClarification: boolean; provenance: string; text: string; }

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
      id: m[1], pole: m[2], regime: m[3] as L3RegulatoryContextValue,
      expectActive: evalBool(m[4]), expectClarification: m[5] === 'true',
      provenance: m[6], text: m[7].replace(/\\'/g, "'").replace(/\\\\/g, '\\'),
    });
  }
  return out;
}

/** Second opinion on the cohort: the frozen L3-2g artifact's own labels must agree. */
function crossCheck(sel: Scen[]) {
  const rows: any[] = JSON.parse(readFileSync(FROZEN_L32G, 'utf8')).rows;
  const byId = new Map<string, any>();
  for (const r of rows) if (!byId.has(r.scenarioId)) byId.set(r.scenarioId, r);
  const bad: string[] = [];
  for (const s of sel) {
    const r = byId.get(s.id);
    if (!r) { bad.push(`${s.id}: absent from the frozen artifact`); continue; }
    if (r.pole !== s.pole) bad.push(`${s.id}: pole`);
    if (r.expectActive !== s.expectActive) bad.push(`${s.id}: expectActive`);
    if (r.expectClarification !== s.expectClarification) bad.push(`${s.id}: expectClarification`);
  }
  if (bad.length) throw new Error(`COHORT DRIFT: ${bad.join('; ')}`);
  return { scenariosSelected: sel.length, disagreementsWithFrozenArtifact: 0 };
}

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'housekeeping', 'confined_space',
  'noise_exposure', 'lifting_rigging', 'mobile_equipment', 'ground_control', 'scaffolds',
  'personal_protective_equipment', 'fire', 'hot_work', 'struck_by', 'emergency_egress',
  'material_handling', 'trenching_shoring', 'compressed_gas_cylinders', 'ergonomics', 'respiratory_protection'];

// ---------------------------------------------------------------- variants
interface Variant { id: string; label: string; prompt: () => string; promptSha: string; scenarios: string[]; }
const ALL: Variant[] = [
  { id: 'D_WC09_LADDER', label: 'F-WC-09 + the F-WC-03 control, SHIPPED v6 ladder', prompt: () => L3_SYSTEM_PROMPT, promptSha: V6_PROMPT_SHA, scenarios: ['F-WC-09', 'F-WC-03'] },
  { id: 'D_CS05_LADDER_B', label: 'C-CS-05, SHIPPED v6 ladder (§36.7 variant B) -- the BEFORE', prompt: () => L3_SYSTEM_PROMPT, promptSha: V6_PROMPT_SHA, scenarios: ['C-CS-05'] },
  { id: 'D_CS05_LADDER_A', label: 'C-CS-05, §36.7 variant A -- the one-block move that moved it', prompt: buildVariantA, promptSha: V_A_LADDER_SHA, scenarios: ['C-CS-05'] },
  { id: 'D_CS05_LADDER_A_REPEAT', label: 'D_CS05_LADDER_A again, OWN PROCESS -- noise floor (§38.3)', prompt: buildVariantA, promptSha: V_A_LADDER_SHA, scenarios: ['C-CS-05'] },
  { id: 'D_CS05_LADDER_B_REPEAT', label: 'D_CS05_LADDER_B again, OWN PROCESS -- noise floor (§38.3)', prompt: () => L3_SYSTEM_PROMPT, promptSha: V6_PROMPT_SHA, scenarios: ['C-CS-05'] },
  // Added AFTER the first four runs, and why is recorded rather than hidden: D_CS05_LADDER_A and its
  // first repeat -- byte-identical prompts in separate processes -- returned DIFFERENT states. Two
  // observations establish "not deterministic" but cannot quantify a rate, so the variant-A cell is
  // deepened. The B cell is deepened by the same amount so the comparison stays balanced.
  { id: 'D_CS05_LADDER_A_REPEAT2', label: 'variant A, third isolated process', prompt: buildVariantA, promptSha: V_A_LADDER_SHA, scenarios: ['C-CS-05'] },
  { id: 'D_CS05_LADDER_A_REPEAT3', label: 'variant A, fourth isolated process', prompt: buildVariantA, promptSha: V_A_LADDER_SHA, scenarios: ['C-CS-05'] },
  { id: 'D_CS05_LADDER_B_REPEAT2', label: 'variant B, third isolated process', prompt: () => L3_SYSTEM_PROMPT, promptSha: V6_PROMPT_SHA, scenarios: ['C-CS-05'] },
  { id: 'D_CS05_LADDER_B_REPEAT3', label: 'variant B, fourth isolated process', prompt: () => L3_SYSTEM_PROMPT, promptSha: V6_PROMPT_SHA, scenarios: ['C-CS-05'] },
  { id: 'D_WC09_LADDER_REPEAT', label: 'F-WC-09 + F-WC-03 again, OWN PROCESS -- is the binder rejection deterministic?', prompt: () => L3_SYSTEM_PROMPT, promptSha: V6_PROMPT_SHA, scenarios: ['F-WC-09', 'F-WC-03'] },
];

async function infer(systemPrompt: string, schema: Record<string, unknown>, input: ReasoningInput) {
  const body = {
    model: CFG.model, stream: false, format: schema,
    options: { temperature: CFG.temperature, seed: CFG.seed, num_ctx: CFG.numCtx },
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: buildUserPrompt(input) }],
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
    try { return JSON.parse(j?.message?.content ?? ''); } catch { return { __error: 'MALFORMED_STRUCTURED_OUTPUT' }; }
  } catch (e: any) {
    return { __error: e?.name === 'AbortError' ? 'TIMEOUT' : String(e?.message || e) };
  } finally { clearTimeout(t); }
}

function mk(s: Scen): ReasoningInput {
  return buildReasoningInput({
    analysisId: `l32k-${s.id}`, observationText: s.text,
    regulatoryContext: { value: s.regime, provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}

async function main() {
  const only = (process.env.ONLY || '').trim();
  if (!only) throw new Error('ONLY=<variant> is REQUIRED -- §38.3 forbids sharing a process between variants');
  const picked = ALL.filter(v => v.id === only);
  if (picked.length !== 1) throw new Error(`ONLY must name exactly ONE variant; got '${only}'`);
  const v = picked[0];

  const prompt = v.prompt();
  if (sha(prompt) !== v.promptSha) {
    throw new Error(`${v.id} does not reproduce the prompt the record says was measured: ${sha(prompt)} != ${v.promptSha}`);
  }
  if (sha(L3_SYSTEM_PROMPT) !== V6_PROMPT_SHA) throw new Error('the SHIPPED prompt is not restored v6 -- refusing to run');

  const cohort = parseCohort();
  const sel = v.scenarios.map(id => {
    const s = cohort.find(x => x.id === id);
    if (!s) throw new Error(`scenario ${id} not present in the locked harness`);
    return s;
  });

  const out: any = {
    phase: 'L3-2k', role: 'DIAGNOSIS_ONLY_MINIMUM_REPRODUCTION_NOT_ADVANCEMENT_EVIDENCE',
    generatedAt: new Date().toISOString(),
    processIsolation: {
      rule: 'AN IDENTICAL PROMPT REPEATED INSIDE ONE PROCESS IS NOT A NOISE-FLOOR CONTROL (§38.3)',
      variantsInThisProcess: 1, variant: v.id, pid: process.pid,
    },
    provider: { model: CFG.model, endpoint: CFG.endpoint, temperature: CFG.temperature, seed: CFG.seed, numCtx: CFG.numCtx },
    shippedPath: {
      note: 'schema, user prompt, normalizer, validator AND semantic binder are the SHIPPED functions, imported not reproduced',
      sequence: 'buildProposalSchema -> infer -> bindProposal -> validateReasoningProposal -> bindEvidenceSemantically (reasoning-runner.ts:81 order)',
      promptVersion: L3_PROMPT_VERSION,
      shippedPromptSha256: sha(L3_SYSTEM_PROMPT),
      shippedPromptIsRestoredV6: sha(L3_SYSTEM_PROMPT) === V6_PROMPT_SHA,
      promptUsedSha256: sha(prompt),
      promptUsedMatchesRecordedDigest: true,
    },
    variant: { id: v.id, label: v.label },
    schemaSha256: null as string | null,
    cohort: crossCheck(sel),
    rows: [] as any[],
  };

  for (const s of sel) {
    const input = mk(s);
    const schema = buildProposalSchema(input);
    if (!out.schemaSha256) out.schemaSha256 = sha(JSON.stringify(schema));
    const t0 = Date.now();
    const raw: any = await infer(prompt, schema, input);
    const ms = Date.now() - t0;

    const bound = raw?.__error ? null : bindProposal(raw, input);
    const validation = bound ? validateReasoningProposal(bound.proposal, input) : null;
    const semantic = validation?.state === 'VALID' && validation.validated
      ? bindEvidenceSemantically(validation.validated, input) : null;

    out.rows.push({
      scenarioId: s.id, pole: s.pole, provenance: s.provenance, variant: v.id,
      expectActive: s.expectActive, expectClarification: s.expectClarification,
      observationText: s.text,
      error: raw?.__error ?? null,
      // ---- STAGE 1: the raw proposal, verbatim ----
      rawProposal: raw?.__error ? null : raw,
      // ---- STAGE 2: normalization ----
      binding: bound?.binding ?? null,
      normalizedCandidates: (bound?.proposal?.hazardCandidates ?? []).map((c: any) => ({
        candidateKey: c.candidateKey, hazardFamily: c.hazardFamily, conditionState: c.conditionState,
        conditionRationale: c.conditionRationale,
        evidence: (c.evidence ?? []).map((e: any) => ({ quote: e.quote, bound: e.bound, sourceId: e.sourceId })),
        clarification: c.clarification ?? null,
      })),
      // ---- STAGE 3: the deterministic validator ----
      validationState: validation?.state ?? null,
      validationIssues: (validation?.issues ?? []).map((i: any) => ({ code: i.code, detail: i.detail })),
      validatedHazards: (validation?.validated?.hazards ?? []).map((h: any) => ({
        candidateKey: h.candidateKey, hazardFamily: h.hazardFamily, conditionState: h.conditionState,
        clarification: h.clarification ?? null,
      })),
      // ---- STAGE 4: the SEMANTIC BINDER -- the stage no existing artifact ever ran ----
      semanticRan: semantic !== null,
      boundHazards: (semantic?.boundHazards ?? []).map((h: any) => ({
        candidateKey: h.candidateKey, hazardFamily: h.hazardFamily, conditionState: h.conditionState,
        clarification: h.clarification ?? null,
      })),
      semanticIssues: (semantic?.issues ?? []).map((i: any) => ({ code: i.code, candidateKey: i.candidateKey, detail: i.detail })),
      clarificationsDropped: semantic?.clarificationsDropped ?? null,
      demoted: semantic?.demoted ?? null,
      semanticRejected: semantic?.rejected ?? null,
      controlAdequacy: semantic?.controlAdequacy ?? null,
      // ---- the two decision axes the gates are written against ----
      finalAssertsActive: (semantic?.boundHazards ?? []).some((h: any) => h.conditionState === 'ACTIVE'),
      finalCarriesClarification: (semantic?.boundHazards ?? []).some((h: any) => h.clarification),
      latencyMs: ms,
    });
    process.stdout.write(`${s.id} `);
  }
  process.stdout.write('\n');

  const dest = process.env.OUT || `diagnose-l32k-${v.id}.json`;
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`wrote ${dest}  (${out.rows.length} rows, variant ${v.id}, pid ${process.pid})`);
}

main().catch(e => { console.error(e); process.exit(1); });
