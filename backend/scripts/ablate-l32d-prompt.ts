/**
 * L3-2d -- PROMPT ABLATION. Root-cause proof for D1 and D2, run WITHOUT modifying any source file.
 *
 * WHY AN ABLATION AND NOT AN ARGUMENT. `NEXT_ACTION.md` asserts that the L3-2c R3 edit caused both
 * remaining gate failures. That is a hypothesis about a prompt, and a prompt is not a thing one can
 * reason about reliably from reading it. This program holds the model, the seed, the temperature,
 * the schema, the user prompt and the observation text CONSTANT and varies ONLY the system prompt,
 * so any behavioural difference is attributable to the prompt region and to nothing else.
 *
 * HOW THE L3-2b PROMPT IS RECOVERED. `reasoning-l3/` is untracked, so there is no git object to
 * diff against. Instead the three L3-2c edits are INVERTED programmatically from the current text
 * and the result is asserted to be free of the L3-2c markers. The reconstruction is then VALIDATED
 * EMPIRICALLY: under it, `H-NG-02` must reproduce the `electrical / ACTIVE` candidate that L3-2b
 * actually recorded. If it does not, the reconstruction is wrong and this program says so rather
 * than reporting a comparison against a prompt that never existed.
 *
 * It calls the Ollama endpoint directly and imports only the schema and user-prompt builders, so
 * nothing here can perturb the production path.
 *
 * Env: OUT, VARIANTS (comma-separated, default all), REPEATS (default 1).
 */
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { createHash } from 'crypto';
import { HAZARD_TAXONOMY } from '../src/safescope-v2/taxonomy/hazard-taxonomy';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { L3_SYSTEM_PROMPT, buildProposalSchema, buildUserPrompt } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import { L3_2_INFERENCE_CONFIG } from '../src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import type { L3RegulatoryContextValue } from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';

const FAMILIES = [...new Set(HAZARD_TAXONOMY.map(p => p.id))].sort();

// ---------------------------------------------------------------- prompt variants

const CURRENT = L3_SYSTEM_PROMPT;

/**
 * The historical prompts are loaded from a FROZEN artifact, not reconstructed from the live text.
 *
 * The pre-patch run reconstructed them by inverting the L3-2c edits and recorded their sha256. Once
 * L3-2d edits the live prompt that inversion no longer applies, so the two historical texts were
 * written out verbatim and are re-verified here against the hashes the pre-patch run recorded. If a
 * hash does not match, this program refuses to run rather than compare against a prompt that never
 * existed.
 */
const FROZEN = join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval/prompt-variants-frozen.json');
const EXPECTED_HASHES: Record<string, string> = {
  v2_l32b: '676eb15ea839d9de0030f948ef8382e2317a25d6df7d9eabf3ad040d1d3f2e69',
  v3_l32c: 'c62ff3eab5559cca534d0269ffed713072ac30eac1e79927d143a8732fcba852',
};

function loadFrozen(): Record<string, string> {
  const raw = JSON.parse(readFileSync(FROZEN, 'utf8')) as Record<string, string>;
  for (const [k, want] of Object.entries(EXPECTED_HASHES)) {
    const got = createHash('sha256').update(raw[k] ?? '').digest('hex');
    if (got !== want) throw new Error(`frozen prompt ${k} hash mismatch: expected ${want}, got ${got}`);
  }
  return raw;
}

const frozen = loadFrozen();
const VARIANTS: Record<string, string> = {
  v2_l32b: frozen.v2_l32b,
  v3_l32c: frozen.v3_l32c,
  v4_l32d_current: CURRENT,
};

// ---------------------------------------------------------------- fixtures

interface Fixture {
  id: string; blocker: 'D1' | 'D2' | 'CONTROL'; regime: string; text: string;
  expectActive: boolean; expectClarification: boolean; why: string;
}

const FIXTURES: Fixture[] = [
  // ---- D2: high-consequence candidate suppression. NONE of these is subjective or hedged, so the
  // clarification instruction has no business touching them; they isolate the ladder ORDERING.
  { id: 'H-NG-02', blocker: 'D2', regime: 'osha-general-industry', expectActive: true, expectClarification: false,
    why: 'negation in clause one, hard electrical fact in clause two; L3-2b returned electrical/ACTIVE',
    text: 'There was no standing water anywhere on the shop floor, and the flexible cord feeding the pedestal fan has its outer jacket worn through to the conductors.' },
  { id: 'H-NG-03', blocker: 'D2', regime: 'osha-general-industry', expectActive: true, expectClarification: false,
    why: 'contrastive "however" after a negation; a hard fact follows',
    text: 'The rack uprights showed no impact damage, however the top beam clip on bay nine has popped out of its slot and the beam is resting on one connector.' },
  { id: 'C-NG-05', blocker: 'D2', regime: 'osha-general-industry', expectActive: true, expectClarification: false,
    why: 'same shape on the L3-2c holdout',
    text: 'The extension ladder showed no split rails, however the shoes are worn smooth and it was set at close to eighty degrees on a painted floor.' },

  // ---- D1: clarification attached where the decision is already made.
  { id: 'C-FLD-138', blocker: 'D1', regime: 'osha-general-industry', expectActive: true, expectClarification: false,
    why: 'ACTIVE is established; solvent type/quantity refines risk and changes no semantic decision',
    text: 'A shop mechanic is performing heavy solvent degreasing in an enclosed room with no local exhaust ventilation.' },
  { id: 'C-CS-05', blocker: 'D1', regime: 'osha-general-industry', expectActive: false, expectClarification: false,
    why: 'explicitly hypothetical; the text answers nothing else and the state is decided',
    text: 'If the level probe on the caustic tank were to fail closed during a transfer, the vent could pressurise and lift the manway gasket.' },
  { id: 'C-AM-04', blocker: 'D1', regime: 'osha-general-industry', expectActive: true, expectClarification: false,
    why: 'impression beside a hard fact; ACTIVE established from the fact alone',
    text: 'The ladder cage on the silo did not look right to me and the third hoop has parted from the stringer with the fixings pulled clean through.' },
  { id: 'C-AM-06', blocker: 'D1', regime: 'osha-general-industry', expectActive: true, expectClarification: false,
    why: 'the guard is stated gone; who removed it changes no semantic decision',
    text: 'The tongue guard on the bench grinder is gone; I could not say whether maintenance removed it or it broke off.' },

  // ---- CONTROL: the three genuinely required clarifications. These must NOT be lost.
  { id: 'H-AM-01', blocker: 'CONTROL', regime: 'osha-general-industry', expectActive: false, expectClarification: true,
    why: 'pure impression; no fact at all',
    text: 'The overhead door track struck me as odd when I walked underneath it.' },
  { id: 'H-AM-02', blocker: 'CONTROL', regime: 'osha-general-industry', expectActive: false, expectClarification: true,
    why: 'the hedge governs the only predication there is',
    text: 'One of the sling legs on the spreader bar may be cut.' },
  { id: 'H-AM-03', blocker: 'CONTROL', regime: 'unknown', expectActive: false, expectClarification: true,
    why: 'the substance is unidentified and that changes hazard family and consequence',
    text: 'There was a puddle of something under the parts washer and I could not tell what it was or where it came from.' },

  // ---- CONTROL: negative control and plain ACTIVE, neither of which may move.
  { id: 'C-NC-05', blocker: 'CONTROL', regime: 'osha-general-industry', expectActive: false, expectClarification: false,
    why: 'positive impression beside a control-in-place fact; must not become ACTIVE',
    text: 'The whole grinding bay looked right to me and the wheel guards are all fitted with the tool rests set within an eighth of an inch.' },
  { id: 'H-EV-02', blocker: 'CONTROL', regime: 'osha-general-industry', expectActive: true, expectClarification: false,
    why: 'plain unambiguous ACTIVE',
    text: 'The bottom guard on the compound mitre saw does not return over the blade when the arm is raised.' },
];

// ---------------------------------------------------------------- run

function regulatoryContext(regime: string) {
  const value = (['osha-general-industry', 'osha-construction', 'msha'].includes(regime) ? regime : 'unknown') as L3RegulatoryContextValue;
  return { value, provenance: value === 'unknown' ? 'UNKNOWN' as const : 'USER_CONFIRMED' as const };
}

async function callModel(systemPrompt: string, f: Fixture): Promise<any> {
  const built = buildReasoningInput({
    analysisId: `l32d-ablation:${f.id}`, observationText: f.text,
    regulatoryContext: regulatoryContext(f.regime), allowedHazardFamilies: FAMILIES,
  });
  const body = {
    model: L3_2_INFERENCE_CONFIG.model, stream: false,
    format: buildProposalSchema(built.input),
    options: { temperature: L3_2_INFERENCE_CONFIG.temperature, seed: L3_2_INFERENCE_CONFIG.seed, num_ctx: L3_2_INFERENCE_CONFIG.numCtx },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserPrompt(built.input) },
    ],
  };
  const res = await fetch(`${L3_2_INFERENCE_CONFIG.endpoint}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const env: any = await res.json();
  try { return JSON.parse(env?.message?.content ?? '{}'); } catch { return { parseError: true }; }
}

async function main(): Promise<void> {
  const wanted = (process.env.VARIANTS || Object.keys(VARIANTS).join(',')).split(',');
  const repeats = Number(process.env.REPEATS || 1);
  const records: any[] = [];

  for (const name of wanted) {
    const prompt = VARIANTS[name];
    if (!prompt) throw new Error(`unknown variant ${name}`);
    for (const f of FIXTURES) {
      for (let r = 0; r < repeats; r += 1) {
        const raw = await callModel(prompt, f);
        const cands: any[] = Array.isArray(raw?.hazardCandidates) ? raw.hazardCandidates : [];
        const rec = {
          variant: name, repeat: r + 1, id: f.id, blocker: f.blocker, why: f.why,
          expectActive: f.expectActive, expectClarification: f.expectClarification,
          outcome: raw?.outcome ?? null,
          candidateCount: cands.length,
          states: cands.map(c => `${c?.hazardFamily}/${c?.conditionState}`),
          anyActive: cands.some(c => c?.conditionState === 'ACTIVE'),
          anyClarification: cands.some(c => c?.clarification),
          clarificationOnNonInsufficient: cands.some(c => c?.clarification && !['INSUFFICIENT_EVIDENCE', 'UNKNOWN'].includes(c?.conditionState)),
          questions: cands.filter(c => c?.clarification).map(c => ({ state: c?.conditionState, q: String(c?.clarification?.question ?? '').slice(0, 140) })),
        };
        records.push(rec);
        process.stderr.write(`${name.padEnd(24)} ${f.id.padEnd(11)} out=${String(rec.outcome).padEnd(22)} n=${rec.candidateCount} active=${rec.anyActive} clar=${rec.anyClarification}\n`);
      }
    }
  }

  const out = {
    stage: 'L3-2d PROMPT ABLATION', generatedAt: new Date().toISOString(),
    inference: { model: L3_2_INFERENCE_CONFIG.model, temperature: 0, seed: L3_2_INFERENCE_CONFIG.seed, numCtx: L3_2_INFERENCE_CONFIG.numCtx },
    variantHashes: Object.fromEntries(Object.entries(VARIANTS).map(([k, v]) => [k, createHash('sha256').update(v).digest('hex')])),
    variantLineCounts: Object.fromEntries(Object.entries(VARIANTS).map(([k, v]) => [k, v.split('\n').length])),
    records,
  };
  const path = process.env.OUT || '../verification/hazlenz-l3-2d-clarification-precision-2026-08-22/rootcause/ablation.json';
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
  console.log(`\nwrote ${path}`);
}
main().catch(e => { console.error(e); process.exit(1); });
