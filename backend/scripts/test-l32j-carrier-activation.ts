/**
 * L3-2j -- SHIPPED CLARIFICATION CARRIER ACTIVATION: MEASURED, AND REFUSED. Deterministic only.
 *
 * WHAT THIS PHASE DID. L3-2i proved the typed proposal can carry a candidate-independent
 * clarification and that the deterministic validator accepts one WITHOUT a hazard candidate, but
 * deliberately left `L3_SYSTEM_PROMPT` byte-unchanged, so the SHIPPED pipeline could never produce
 * one. L3-2j declared the field in the shipped prompt and the shipped schema, ran the FULL
 * 24-scenario diagnostic corpus, and PUT IT BACK -- because every configuration that activates the
 * carrier on this prompt costs high-consequence recall while improving nothing.
 *
 * ============================ WHY IT WAS REFUSED, IN ONE PARAGRAPH ============================
 *
 * `THE_SHIPPED_LADDER_DOES_NOT_HAVE_THE_DEFECT_THE_CARRIER_WAS_BUILT_TO_FIX`
 *
 * `D-56`/section 39.5.1's zero-candidate clarification loss was measured on `V_S_STRUCT`, the
 * STRUCTURAL representation, which is architecture-selection evidence and is NOT what ships. On the
 * shipped ladder the question already rides a hazard candidate on 5 of 5 `CLARIFICATION_REQUIRED`
 * scenarios -- measured twice, ten days apart, by two different harnesses. A carrier cannot improve
 * a metric already at ceiling, and both declaration revisions measurably reduced high-consequence
 * recall with a ZERO-difference noise floor across separate processes.
 *
 * ============================ WHAT THIS SUITE ASSERTS ============================
 *
 * That the shipped path is back in the state the measurements say is safe, that L3-2i's capability
 * is intact underneath it, and that the rejected variants remain reproducible. It does NOT assert
 * the behavioural finding -- that is the corpus artifacts' job, and no deterministic test can stand
 * in for them.
 *
 * Run: npx ts-node scripts/test-l32j-carrier-activation.ts
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import {
  L3_UNDECIDED_STATES, REASONING_PROPOSAL_CONTRACT_VERSION,
  type ReasoningInput,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import {
  L3_CARRIER_DECLARATION_ANCHOR, L3_PROMPT_VERSION, L3_SYSTEM_PROMPT,
  bindProposal, buildProposalSchema,
} from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';

let passed = 0;
const failures: string[] = [];
function ok(cond: boolean, label: string, detail?: unknown) {
  if (cond) { passed += 1; return; }
  failures.push(detail === undefined ? label : `${label}  [${String(detail)}]`);
}

const SCRIPTS = __dirname;
const SRC = join(__dirname, '..', 'src', 'safescope-v2', 'reasoning-l3');
const EVIDENCE = join(__dirname, '..', '..', 'verification', 'hazlenz-l3-2j-carrier-activation-2026-08-24');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');

const V6_PROMPT_SHA = 'b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf';
const LOCKED_HARNESS_SHA = '73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521';
/** The serialised shipped schema for THIS suite's fixture input. Pins shape AND key order (D-60). */
const SHIPPED_SCHEMA_SHA = '30f195846bc09af0a92e8150a320ace5d160d59a2bbba605e7312852a6ba33ee';
/** What the post-revert baseline corpus run recorded, over its own (24-family) input. */
const BASELINE_RUN_SCHEMA_SHA = 'a522cf5aa2d556824100139adf4951e75b9135c42f6d0c771009cc97e99da385';
/** The two rejected prompts, by the sha256 the recorded runs were taken under. */
const REJECTED_PROMPT_SHA = {
  REV1: 'b7f351115d71c6e51992c4430e4f88c46c5560bbe7f691e0bd52afacd52ea9b2',
  REV2: '45862b26e880faf317de73949872b72746d903737514acbb87764258ab8fd382',
};

function mkInput(text: string): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32j-fixture', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: ['falls', 'machine_guarding', 'loto_stored_energy'],
  }).input;
}

// =====================================================================================
// A. THE SHIPPED PATH IS BACK WHERE THE MEASUREMENTS SAY IT IS SAFE
// =====================================================================================
console.log('\n== A. the shipped path ==\n');
{
  ok(sha(L3_SYSTEM_PROMPT) === V6_PROMPT_SHA,
    'A1 the shipped prompt is BYTE-IDENTICAL to v6 -- the locked L3-2h instrument reads it unchanged',
    sha(L3_SYSTEM_PROMPT));
  ok(L3_PROMPT_VERSION === 'hazlenz.l3.prompt.v6',
    'A2 the version matches the bytes -- a version that advanced over identical text would be a lie',
    L3_PROMPT_VERSION);
  ok(!L3_SYSTEM_PROMPT.includes(L3_CARRIER_DECLARATION_ANCHOR),
    'A3 the shipped prompt declares NO carrier');
  ok(sha(L3_SYSTEM_PROMPT) !== REJECTED_PROMPT_SHA.REV1 && sha(L3_SYSTEM_PROMPT) !== REJECTED_PROMPT_SHA.REV2,
    'A4 and it is neither of the two prompts the corpus rejected');

  const schema: any = buildProposalSchema(mkInput('The rail on the platform did not look right to me.'));
  ok(schema.additionalProperties === false,
    'A5 the top-level schema is closed -- which is why a declaration alone could never have worked');
  ok(!('unresolvedDecisions' in schema.properties),
    'A6 the shipped schema carries NO carrier property');
  ok(!(schema.required as string[]).includes('unresolvedDecisions'),
    'A7 and does not require one');
  ok(JSON.stringify(schema.required) === JSON.stringify(['outcome', 'observationInterpretation', 'hazardCandidates']),
    'A8 required is exactly the v6 list, in the v6 order -- key order is an INPUT, see D-60');

  // The whole serialised schema, pinned. D-60 is the reason this is a hash and not a spot check: the
  // schema is sent to the provider as `format`, moving ONE key moved six measured fields, and a
  // property-by-property assertion would not have caught that. The value is the `schemaSha256`
  // recorded by the post-revert baseline run, so the pin and the evidence are the same number.
  ok(sha(JSON.stringify(schema)) === SHIPPED_SCHEMA_SHA,
    'A9 the serialised shipped schema is byte-identical, key order included',
    sha(JSON.stringify(schema)));

  // The pin above covers this suite's fixture. This one anchors the same guarantee to the EVIDENCE:
  // the post-revert baseline run recorded the schema it actually sent, and it must still be that.
  const postRevert = JSON.parse(readFileSync(
    join(EVIDENCE, 'results/reproduction/post-revert-V_PRE_ACTIVATION.json'), 'utf8'));
  ok(postRevert.schemaSha256 === BASELINE_RUN_SCHEMA_SHA
    && postRevert.shippedPath.promptUsedSha256 === V6_PROMPT_SHA,
    'A10 the post-revert baseline run recorded the v6 prompt and the v6 schema it actually sent');
}

// =====================================================================================
// B. L3-2i'S CAPABILITY IS INTACT UNDERNEATH. Refusing to ACTIVATE is not undoing.
// =====================================================================================
console.log('\n== B. the L3-2i capability is intact ==\n');
{
  ok(REASONING_PROPOSAL_CONTRACT_VERSION === 'hazlenz.l3.proposal.v1',
    'B1 the proposal contract version is still not bumped', REASONING_PROPOSAL_CONTRACT_VERSION);
  ok(L3_UNDECIDED_STATES.length === 2
    && L3_UNDECIDED_STATES.includes('INSUFFICIENT_EVIDENCE') && L3_UNDECIDED_STATES.includes('UNKNOWN'),
    'B2 L3_UNDECIDED_STATES still has ONE definition and the same two members');

  const input = mkInput('The rail on the platform did not look right to me.');

  // The capability itself: a ZERO-CANDIDATE proposal still carries the clarification and the
  // validator still accepts it without a hazard. This is what L3-2i built and L3-2j did not touch.
  const zeroCandidate = bindProposal({
    outcome: 'INSUFFICIENT_EVIDENCE', observationInterpretation: 'x', hazardCandidates: [],
    unresolvedDecisions: [{
      unresolvedFact: 'whether the rail is damaged', affectedDecision: 'condition_state',
      branches: ['damaged', 'sound'], question: 'Is the rail damaged?',
    }],
  }, input);
  const zv = validateReasoningProposal(zeroCandidate.proposal, input);
  ok(zv.state === 'VALID' && zv.validated?.unresolvedDecisions.length === 1,
    'B3 a zero-candidate proposal STILL carries the clarification through validation', zv.state);

  // And a pre-L3-2i answer still binds with the key absent.
  const legacy = bindProposal({
    outcome: 'INSUFFICIENT_EVIDENCE', observationInterpretation: 'x', hazardCandidates: [],
  }, input);
  ok(!('unresolvedDecisions' in legacy.proposal),
    'B4 a pre-L3-2i answer still binds with the key ABSENT, not defaulted to []');
  ok(validateReasoningProposal(legacy.proposal, input).validated?.unresolvedDecisions?.length === 0,
    'B5 and the validated result is still ALWAYS an array');

  // The MUST-NOT-ASK gate L3-2i corrected in its own first answer.
  const decided = bindProposal({
    outcome: 'INSUFFICIENT_EVIDENCE', observationInterpretation: 'x',
    hazardCandidates: [{
      candidateKey: 'k1', hazardFamily: 'falls', conditionState: 'HYPOTHETICAL',
      evidence: [{ sourceId: 'observation-1', quotedText: 'did not look right' }],
      conditionRationale: 'r', independentHazardRationale: 'r', uncertainties: [],
    }],
    unresolvedDecisions: [{
      unresolvedFact: 'f', affectedDecision: 'condition_state', branches: ['a', 'b'], question: 'q?',
    }],
  }, input);
  const dv = validateReasoningProposal(decided.proposal, input);
  ok(dv.issues.some(i => i.code === 'UNRESOLVED_DECISION_NOT_DECISION_CRITICAL'),
    'B6 a question on an all-decided proposal is still refused');
  ok((dv.validated?.hazards?.length ?? 0) === 1,
    'B7 and refusing it still DROPS THE QUESTION, never the analysis that carried it');
}

// =====================================================================================
// C. THE REJECTED VARIANTS REMAIN REPRODUCIBLE. A conclusion whose evidence cannot be
//    re-derived is an opinion.
// =====================================================================================
console.log('\n== C. the rejected variants are still reproducible ==\n');
{
  const runner = readFileSync(join(SCRIPTS, 'activate-l32j-shipped-corpus.ts'), 'utf8');
  ok(runner.includes('const DECLARATION_REV1 = ['),
    'C1 the REJECTED revision 1 text is kept, not deleted -- a rejection nobody can re-measure is folklore');
  ok(runner.includes('const DECLARATION_REV2 = ['),
    'C2 revision 2 is kept too');
  ok(runner.includes(REJECTED_PROMPT_SHA.REV1) && runner.includes(REJECTED_PROMPT_SHA.REV2),
    'C3 the runner pins the sha256 of both prompts it claims to have measured, and refuses to run otherwise');
  ok(/KEY ORDER IS PART OF THE INPUT/.test(runner),
    'C4 D-60 is recorded where the mistake would be repeated, not only in the blueprint');

  // The evidence itself must be present and must say what this suite says it says.
  const read = (p: string) => JSON.parse(readFileSync(join(EVIDENCE, p), 'utf8'));
  const pre = read('results/shipped-qwen-V_PRE_ACTIVATION.json');
  const rev1 = read('results/decl1/shipped-qwen-V_ACTIVATED.json');
  const rev2 = read('results/decl2/shipped-qwen-V_ACTIVATED.json');
  const hc = (a: any) => {
    const rows = a.rows.filter((r: any) => r.expectActive);
    return `${rows.filter((r: any) => r.modelAssertsActive).length}/${rows.length}`;
  };
  ok(pre.rows.length === 24 && rev1.rows.length === 24 && rev2.rows.length === 24,
    'C5 all three corpus runs cover the FULL 24-scenario diagnostic set');
  ok(hc(pre) === '12/13', 'C6 the baseline high-consequence figure is 12/13', hc(pre));
  ok(hc(rev1) === '9/13', 'C7 revision 1 measured 9/13 -- the rejection', hc(rev1));
  ok(hc(rev2) === '10/13', 'C8 revision 2 measured 10/13 -- also a rejection', hc(rev2));
  ok(rev1.processIsolation.variantsInThisProcess === 1 && rev2.processIsolation.variantsInThisProcess === 1,
    'C9 one variant per process, section 38.3');
  ok(rev1.processIsolation.pid !== rev2.processIsolation.pid && rev1.processIsolation.pid !== pre.processIsolation.pid,
    'C10 and the pids differ, so the noise floor is a cross-process measurement');
  ok(pre.shippedPath.promptUsedSha256 === V6_PROMPT_SHA
    && rev1.shippedPath.promptUsedSha256 === REJECTED_PROMPT_SHA.REV1
    && rev2.shippedPath.promptUsedSha256 === REJECTED_PROMPT_SHA.REV2,
    'C11 each artifact records the prompt it actually sent, and they are the three distinct prompts');
}

// =====================================================================================
// D. CONTAINMENT -- the locked instrument, the customer path, the deferred items
// =====================================================================================
console.log('\n== D. containment ==\n');
{
  ok(sha(readFileSync(join(SCRIPTS, 'ablate-l32g-state-separation.ts'))) === LOCKED_HARNESS_SHA,
    'D1 the locked L3-2g/L3-2h ablation harness is BYTE-UNCHANGED');

  // Its INPUT is unchanged too, which is a STRONGER claim than D1 and the one that matters: the
  // restored baseline run reproduced the frozen L3-2g V_B_LADDER rows with ZERO differences.
  const restored = JSON.parse(readFileSync(join(EVIDENCE, 'rootcause/locked-restored-V_B_LADDER.json'), 'utf8'));
  ok(restored.variants[0].promptSha256 === V6_PROMPT_SHA,
    'D2 the restored locked run read the v6 prompt -- the instrument\'s input is back');

  for (const [f, want] of [
    ['score-l32g-fact-coherence.ts', '4ecaada4730821590f0f675701c341179662ef6daf96443d0a79d15f69dfd1fe'],
    ['score-l32g-order-sensitivity.ts', '7e3481f9360095d694b4a15b0c351e1d7677e9ac6a95fc267af7c4cb67608da1'],
  ] as const) {
    ok(sha(readFileSync(join(SCRIPTS, f))) === want,
      `D3 ${f} is byte-unchanged -- TERMINAL_A's two axes cannot be reached by this phase`);
  }

  ok(sha(readFileSync(join(SRC, 'state-facts.ts')))
    === '2098ac936267c2a0badd8ab26017f03c2204bd77e0d249f60fae0d53c159cbc7',
    'D4 state-facts.ts is byte-unchanged -- R1_MISSING_FIRST is still NOT promoted');

  const { execSync } = require('child_process');
  const importers: string[] = execSync(
    `grep -rl "reasoning-l3" ${join(__dirname, '..', 'src')} || true`, { encoding: 'utf8' },
  ).split('\n').map((s: string) => s.trim()).filter(Boolean);
  ok(importers.every(p => p.includes('reasoning-l3')),
    'D5 nothing outside reasoning-l3 imports it -- CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE');

  ok(!readFileSync(join(SRC, 'reasoning-runner.ts'), 'utf8').includes('state-facts'),
    'D6 the shipped validation sequence still does not consume state-facts');
  ok(!/@Injectable|@Entity|@InjectRepository/.test(readFileSync(join(SRC, 'deterministic-safety-validator.ts'), 'utf8')),
    'D7 the validator carries no Nest or TypeORM decorator');
  ok(!/state-facts|stateFacts/.test(readFileSync(join(SRC, 'reasoning-prompt.ts'), 'utf8')),
    'D8 the structural schema still lives in the harness, not in the shipped prompt');
}

console.log(`\nL3-2j shipped carrier activation (measured and refused): ${passed} assertions passed, ${failures.length} failed`);
for (const f of failures) console.log(`  FAILED  ${f}`);
process.exit(failures.length ? 1 : 0);
