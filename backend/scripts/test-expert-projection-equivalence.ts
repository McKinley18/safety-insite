/**
 * §119 -- PROTOTYPE / PERMANENT-PATH EQUIVALENCE GATE. ZERO provider calls.
 *
 * The central acceptance gate for promoting the §116 deterministic-family projection onto the
 * permanent Expert path. §118/D-130 hosted-confirmed the PROTOTYPE's behaviour (baseline R6 0/3
 * clean vs projected R6 3/3 clean, all six anti-rubber-stamp controls preserved). That measurement
 * transfers to the permanent path only if the permanent path produces the SAME request. This suite
 * proves it, field by field, for every §118 projected-arm case.
 *
 * It also proves the three structural properties the promotion must not lose:
 *   - R6's permanent request carries `machine_guarding = NOT_APPLICABLE @ 0.96` with its rationale;
 *   - "projection absent" stays distinguishable from "evaluated and NOT_APPLICABLE";
 *   - the override licence survives, so Expert can still contradict a projected disposition.
 *
 * Behaviour is compared through `buildAnthropicRequestBody`, i.e. the real request the provider
 * would receive -- system prompt, user prompt, wire schema, strict wrapper and Anthropic
 * compatibility strip included -- not through an intermediate representation.
 */

import { applyEvidenceFoundation } from '../src/hazlenz/evidence/evidence-foundation';
import { buildAnthropicRequestBody } from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { buildExpertUserPrompt } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { ROUTING_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/routing-fixtures';
import { ADVERSARIAL_RECALL_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/hazard-actuality-fixtures';
import { RESTORATION_TRANSITION_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/restoration-transition-fixtures';
import type {
  DeterministicFamilyDisposition, ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
// PERMANENT production projection (the promotion under test).
import {
  projectDeterministicDispositions as projectPermanent,
} from '../src/hazlenz/expert-hazlenz/expert-deterministic-projection';
// PROTOTYPE, frozen: the exact artifact whose behaviour §118 measured hosted.
import {
  projectDeterministicDispositions as projectPrototype,
  renderDeterministicDispositionBlock as renderPrototype,
} from './lib/expert-deterministic-projection';

let passed = 0;
let failed = 0;
function assert(condition: boolean, label: string, detail?: unknown) {
  if (condition) { passed++; console.log(`PASS ${label}`); return; }
  failed++;
  console.error(`FAIL ${label}`, detail !== undefined ? JSON.stringify(detail, null, 1) : '');
}

const routing = (id: string) => ROUTING_FIXTURES.find(f => f.id === id)!;
const adversarial = (id: string) => ADVERSARIAL_RECALL_FIXTURES.find(f => f.id === id)!;
const restoration = (id: string) => RESTORATION_TRANSITION_FIXTURES.find(f => f.id === id)!;

/** The §118 projected-arm matrix, verbatim. `V1-CTRL` carries the constructed disposition. */
const CONSTRUCTED_V1_CTRL: DeterministicFamilyDisposition[] = [{
  hazardFamily: 'lockout_tagout', disposition: 'CONTROLLED', isActionable: false, confidence: 0.94,
  controllingFacts: [
    { fact: 'general-industry jurisdiction', status: 'SUPPORTED' },
    { fact: 'energy isolated and locked', status: 'SUPPORTED' },
  ],
  rationale: 'The deterministic layer evaluated this family and found the condition present but '
    + 'controlled by a stated, verified control.',
  evidenceQuotes: ['The press was locked out with the supervisor tag applied'],
  provenance: 'CONSTRUCTED_FOR_DIAGNOSTIC',
}];

interface Case { id: string; input: ExpertAnalysisInput; constructed?: DeterministicFamilyDisposition[] }
const CASES: Case[] = [
  { id: 'R6', input: routing('R6').input },
  { id: 'V7', input: adversarial('V7').input },
  { id: 'R6-I', input: restoration('R6-I').input },
  { id: 'V1-CTRL', input: adversarial('V1').input, constructed: CONSTRUCTED_V1_CTRL },
  { id: 'R6-H', input: restoration('R6-H').input },
  { id: 'V8', input: adversarial('V8').input },
  { id: 'V5', input: adversarial('V5').input },
];

/** The REAL deterministic decisions for an observation. No second applicability engine. */
function decisionsFor(input: ExpertAnalysisInput) {
  const result: Record<string, unknown> = {};
  applyEvidenceFoundation(result,
    { text: input.authoritativeSources[0].text, scopes: ['osha_general_industry'] } as never);
  return (result.applicabilityDecisions ?? []) as Array<{
    family: string; status: string; confidence: number;
    requiredPredicates: Array<{ name: string; status: string }>;
  }>;
}

// =====================================================================================
console.log('\nA. the permanent projection derives the SAME rows as the frozen prototype');
// =====================================================================================
for (const c of CASES) {
  if (c.constructed) continue;                       // constructed rows bypass both projectors
  const decisions = decisionsFor(c.input);
  const proto = projectPrototype(decisions);
  const perm = projectPermanent(decisions);
  assert(JSON.stringify(perm) === JSON.stringify(proto),
    `A.${c.id} permanent projection === prototype projection`,
    { prototype: proto, permanent: perm });
}

// =====================================================================================
console.log('\nB. FULL REQUEST EQUIVALENCE — prototype path vs permanent path');
// =====================================================================================
/**
 * Prototype path: build the request WITHOUT dispositions, then append the block, exactly as the
 * §118 probe did. Permanent path: put the dispositions on the input and let the prompt builder
 * render them. The two request bodies must be identical.
 */
const perCaseEquivalence: Array<Record<string, unknown>> = [];
for (const c of CASES) {
  const dispositions = c.constructed ?? projectPermanent(decisionsFor(c.input));

  const prototypeBody = buildAnthropicRequestBody(c.input) as Record<string, unknown>;
  const block = renderPrototype(dispositions);
  if (block) {
    const messages = prototypeBody.messages as Array<{ role: string; content: string }>;
    messages[0].content = `${messages[0].content}\n\n${block}`;
  }

  const permanentInput: ExpertAnalysisInput = { ...c.input, deterministicFamilyDispositions: dispositions };
  const permanentBody = buildAnthropicRequestBody(permanentInput) as Record<string, unknown>;

  const protoJson = JSON.stringify(prototypeBody);
  const permJson = JSON.stringify(permanentBody);
  assert(protoJson === permJson, `B.${c.id} full provider request body is byte-identical`);

  // Field-by-field, so a failure names the field rather than dumping two 23KB strings.
  const fields = ['model', 'max_tokens', 'system', 'tools', 'tool_choice', 'thinking'] as const;
  for (const f of fields) {
    assert(JSON.stringify(prototypeBody[f]) === JSON.stringify(permanentBody[f]),
      `B.${c.id}.${f} identical`);
  }
  const pm = (prototypeBody.messages as Array<{ content: string }>)[0].content;
  const qm = (permanentBody.messages as Array<{ content: string }>)[0].content;
  assert(pm === qm, `B.${c.id}.userPrompt identical`, {
    prototypeLength: pm.length, permanentLength: qm.length,
    firstDivergenceIndex: (() => { for (let i = 0; i < Math.max(pm.length, qm.length); i++) if (pm[i] !== qm[i]) return i; return -1; })(),
  });

  perCaseEquivalence.push({
    caseId: c.id, identical: protoJson === permJson,
    requestChars: permJson.length,
    dispositions: dispositions.map(d => `${d.hazardFamily}=${d.disposition}@${d.confidence}[${d.provenance}]`),
  });
}

// =====================================================================================
console.log('\nC. R6 permanent-path structural proof');
// =====================================================================================
{
  const r6 = routing('R6').input;
  const dispositions = projectPermanent(decisionsFor(r6));
  const mg = dispositions.find(d => d.hazardFamily === 'machine_guarding');
  assert(!!mg, 'C.1 the permanent path derives a machine_guarding disposition for R6');
  assert(mg?.disposition === 'NOT_APPLICABLE', 'C.2 it is NOT_APPLICABLE', mg?.disposition);
  assert(mg?.confidence === 0.96, 'C.3 confidence is 0.96', mg?.confidence);
  assert(mg?.provenance === 'DERIVED_FROM_PRODUCTION_ENGINE',
    'C.4 provenance is DERIVED_FROM_PRODUCTION_ENGINE (not hand-written)', mg?.provenance);
  assert(mg!.controllingFacts.some(f => f.fact === 'moving or accessible energy' && f.status === 'CONTRADICTED'),
    'C.5 the controlling fact "moving or accessible energy = CONTRADICTED" is carried',
    mg?.controllingFacts);
  assert(/affirmatively contradicts "moving or accessible energy"/.test(mg!.rationale),
    'C.6 the derived rationale names the contradicted predicate', mg?.rationale);

  const prompt = buildExpertUserPrompt({ ...r6, deterministicFamilyDispositions: dispositions });
  assert(prompt.includes('machine_guarding: NOT_APPLICABLE, not actionable, confidence 0.96'),
    'C.7 the rendered prompt states the disposition verbatim');
  assert(prompt.includes('controlling fact: moving or accessible energy = CONTRADICTED'),
    'C.8 the rendered prompt states the controlling fact');
  assert(prompt.includes('These families were EVALUATED by the deterministic engine. This is different from a'),
    'C.9 the prompt distinguishes EVALUATED from never-considered');
}

// =====================================================================================
console.log('\nD. PROJECTION ABSENCE is distinguishable from EVALUATED-AND-NOT_APPLICABLE');
// =====================================================================================
{
  const r6 = routing('R6').input;
  const absent = buildExpertUserPrompt(r6);                                   // field undefined
  const empty = buildExpertUserPrompt({ ...r6, deterministicFamilyDispositions: [] });
  const projected = buildExpertUserPrompt({
    ...r6, deterministicFamilyDispositions: projectPermanent(decisionsFor(r6)),
  });

  assert(absent === empty,
    'D.1 undefined and [] both render NO section (neither fabricates a determination)');
  assert(!absent.includes('DETERMINISTIC FAMILY ASSESSMENTS ALREADY PERFORMED'),
    'D.2 an absent projection renders no assessment section at all');
  assert(!absent.includes('NOT_APPLICABLE'),
    'D.3 an absent projection never synthesises a NOT_APPLICABLE state');
  assert(projected.includes('DETERMINISTIC FAMILY ASSESSMENTS ALREADY PERFORMED'),
    'D.4 a populated projection DOES render the section');
  assert(projected !== absent && projected.length > absent.length,
    'D.5 projected and absent requests are distinguishable');

  // Backward compatibility: a caller that never heard of this field gets the pre-§119 prompt.
  const legacyShaped: ExpertAnalysisInput = { ...r6 };
  delete (legacyShaped as { deterministicFamilyDispositions?: unknown }).deterministicFamilyDispositions;
  assert(buildExpertUserPrompt(legacyShaped) === absent,
    'D.6 a legacy input with no such field is byte-identical to the absent case');
}

// =====================================================================================
console.log('\nE. anti-rubber-stamp: the corrected §117 states reach Expert, override survives');
// =====================================================================================
{
  const expectations: Array<[string, string, (d?: DeterministicFamilyDisposition) => boolean, string]> = [
    ['V7', 'machine_guarding', d => d?.disposition === 'ACTIVE',
      'a stated point-of-operation contact must NOT be projected as a false NOT_APPLICABLE'],
    ['R6-I', 'machine_guarding', d => d?.disposition !== 'NOT_APPLICABLE',
      'a machine returned to operation with the guard absent must not be projected as excluded'],
    ['R6-H', 'machine_guarding', d => d?.disposition !== 'NOT_APPLICABLE',
      'a stated re-energization transition must not be projected as excluded'],
    ['V5', 'machine_guarding', d => d?.disposition === 'UNKNOWN',
      'a merely-stopped machine must project UNKNOWN, which can carry a clarification'],
  ];
  for (const [caseId, family, ok, why] of expectations) {
    const c = CASES.find(x => x.id === caseId)!;
    const rows = projectPermanent(decisionsFor(c.input));
    const d = rows.find(r => r.hazardFamily === family);
    assert(ok(d), `E.${caseId} ${why}`, { got: d?.disposition ?? 'ABSENT', rows });
  }

  // V8: a family the engine never assessed must remain addable -- it must simply be absent from
  // the projection rather than projected as excluded.
  const v8 = CASES.find(c => c.id === 'V8')!;
  const v8rows = projectPermanent(decisionsFor(v8.input));
  assert(!v8rows.some(r => r.hazardFamily === 'chemical_exposure'),
    'E.V8 chemical_exposure is absent from the projection, so Expert may still add it', v8rows);

  // V1-CTRL: a CONTROLLED assessment must reach Expert in a form it can explicitly override.
  const block = renderPrototype(CONSTRUCTED_V1_CTRL);
  assert(block.includes('lockout_tagout: CONTROLLED'),
    'E.V1-CTRL the CONTROLLED assessment is rendered for Expert to see');
  assert(block.includes('You MAY override any assessment above, including a NOT_APPLICABLE one'),
    'E.V1-CTRL the override licence is present');
  assert(block.includes('high deterministic confidence is not a reason to withhold one'),
    'E.V1-CTRL high confidence is explicitly not a reason to defer');
  assert(block.includes('CONTRADICTS_DETERMINISTIC'),
    'E.V1-CTRL the override channel is named');
}

// =====================================================================================
console.log('\nF. the promotion changed no frozen vocabulary and added no suppression');
// =====================================================================================
{
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz', 'expert-normalization.ts'),
    'utf8') as string;
  assert(!src.includes('deterministicFamilyDispositions'),
    'F.1 normalization does not read the projection (no boundary suppression path exists)');
  const prompt = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz', 'expert-prompt.ts'),
    'utf8') as string;
  // §139 RE-ANCHORED, NOT RELAXED. F.2 asserted the literal v6 to prove that the §119 PROJECTION
  // promotion was input data rather than a prompt revision. That property is unchanged and is what
  // F.2b below now proves directly. The literal moved because a LATER and separately authorized
  // operation (§139) did revise the prompt, for reasons that have nothing to do with the
  // projection. Pinning the old literal would make this test assert "no one may ever change the
  // prompt again for any reason", which is not the property it was written to protect.
  // §141 re-anchored again, on exactly the reasoning the paragraph above already states: the
  // linkage remediation revised the prompt under its own authorization and touched nothing in the
  // projection. F.2b/F.2c below assert the real property directly and are unchanged.
  // §147 re-anchored a THIRD time, v9 -> v10, for the clarification-recall remediation, which
  // touched the clarification licence and nothing in the projection. This pin is written with
  // escaped dots inside a regex literal, which is why a plain `prompt.v9` grep misses it -- it was
  // the one pin missed in §143 too, and it caught the regression both times. That is the pin
  // working, not the pin being a nuisance: F.2b/F.2c below assert the real property directly.
  // §177 re-anchored a FOURTH time, v13 -> v14, for the §176 temporal-sufficiency repair, which
  // touched the clarification licence and nothing in the projection. The escaped-dot regex caught a
  // string-level rename a THIRD time here: a bulk replace of the plain literal updated this
  // assertion's MESSAGE while leaving the regex on v13, so the pin failed loudly instead of
  // silently passing under the wrong version. Leave it written this way.
  // §178 re-anchored a FIFTH time, v14 -> v15, for the control-property-sufficiency repair,
  // which again touches the clarification licence and nothing in the projection. The regex and
  // its message were moved together this time, deliberately.
  assert(/EXPERT_PROMPT_VERSION = 'hazlenz\.expert\.prompt\.v15'/.test(prompt),
    'F.2 EXPERT_PROMPT_VERSION is pinned to the current authorized version (v15)');
  // F.2b is the ACTUAL projection property, asserted directly instead of by proxy: the disposition
  // block is rendered from caller-supplied input and the system prompt knows nothing about it.
  assert(!/EXPERT_SYSTEM_PROMPT = \[[\s\S]*?DETERMINISTIC FAMILY ASSESSMENTS[\s\S]*?\]\.join/.test(prompt),
    'F.2b the projection block lives in the per-request input, NOT in the system prompt');
  assert(/export function renderDeterministicDispositionBlock/.test(prompt),
    'F.2c and it is still rendered by the projection renderer, from supplied dispositions');
}

console.log('\n' + '='.repeat(70));
console.log(JSON.stringify({ perCaseEquivalence }, null, 1));
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
