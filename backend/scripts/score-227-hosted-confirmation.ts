/**
 * §227 PHASE C -- SCORING. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Only the preregistered judgment slots are scored. Each judgment records enough to be
 * re-adjudicated rather than trusted:
 *   1. the §227-frozen controlling proposition, verbatim;
 *   2. the provider's declared property, verbatim;
 *   3. a deterministic overlap against the proposition and against each annotated near neighbour.
 * The verdict is then stated with its reason. A close call is marked BORDERLINE so the product
 * owner can disagree with it on the record.
 *
 * No aggregate score is computed and none may offset a capability-gate failure.
 *
 * NOTHING HERE REPAIRS, RECONSTRUCTS OR REINTERPRETS PROVIDER OUTPUT. A property is judged on what
 * `missingFact` and the branches say. Recognition in prose, candidate reasoning, uncertainty, a
 * clarification or the explanation never substitutes for a structured declaration.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  HOSTED_CASES_227, PRIMARY_GATES_227, GATE_RULE_227, AUTHORING_LIMITATION_227,
  MEASURES_227, overlap227, type Measure227,
} from './lib/expert-227-hosted-instrument';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-227-hosted-semantic-capability-confirmation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const protoText = readFileSync(join(EVID, 'SECTION-227-FROZEN-PROTOCOL.json'), 'utf8');
const frozenDigest = readFileSync(join(EVID, 'SECTION-227-FROZEN-PROTOCOL.sha256'), 'utf8')
  .split('  ')[0];
if (sha(protoText) !== frozenDigest) {
  throw new Error('§227 ABORT: the frozen protocol digest moved. Truth may not be edited.');
}

interface RawRow {
  caseId: string; callKind: string; failureClass: string; outputTokens: number | null;
  costUsd: number; outputShape: Record<string, unknown>;
  parsed: Record<string, any> | null;
}
const rows: RawRow[] = readFileSync(join(EVID, 'RAW-227.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l));

type Verdict = 'PASS' | 'FAIL' | 'NOT_EXERCISED' | 'AMBIGUOUS';

/**
 * AUTHORED VERDICTS. Each names the frozen proposition and the declared text it turns on. The truth
 * was frozen before execution; only the verdict against it is authored here, which is the same
 * discipline §222 and §225 used.
 */
const AUTHORED: Record<string, { verdict: Verdict; borderline: boolean; reason: string }> = {
  // ---------------------------------------------------------------- DECLARATION RECALL
  'K1|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'one structured declaration for the one owed property. The controlling candidate '
      + 'unknown-residue-ignition was asserted ACTIVE at MODERATE confidence and the entry was '
      + 'emitted anyway, which is the §225 H5 failure shape not taken' },
  'K2|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'one structured declaration for the one owed property; whether it names the right '
      + 'property is scored separately' },
  'K3|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'one structured declaration for the one owed property, emitted alongside two ACTIVE '
      + 'HIGH candidates that could have absorbed it' },
  'K4|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'one structured declaration for the one owed property' },
  'K5|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'one structured declaration for the one owed property' },
  'K6|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'two structured declarations for the two owed properties; neither was left in prose' },

  // ---------------------------------------------------------------- PROPERTY IDENTITY
  'K1|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: false,
    reason: 'the frozen proposition is whether the residue inside the pipe can ignite or explode '
      + 'when the pipe is cut. missingFact names whether flammable, combustible or reactive residue '
      + 'is present inside the pipe being hot-cut, and BOTH branches carry the capability limb '
      + '"capable of ignition or harmful release". It is the condition, not the fire watch (control '
      + 'state), not whether the pipe has been tested (verification act), and not whether the '
      + 'product records can be found (document). Granting branchA settles the decision: standard '
      + 'hot-work precautions suffice' },
  'K2|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: true,
    reason: 'the frozen proposition is whether the noise these operators are actually exposed to AT '
      + 'THE EAR is within the exposure limit value. missingFact names the current noise level at '
      + 'the workstations with the new press running. That is the source term the ear exposure is a '
      + 'function of given the attenuation, which the observation states and which is therefore not '
      + 'open; it is none of the annotated near neighbours, which are all control state, '
      + 'verification act or document. Granting branchA settles the decision and decisionIfA says '
      + 'so. BORDERLINE, and a product owner could score this FAIL: the declaration names the '
      + 'ambient level rather than the exposure at the ear, and this is the same shape §225 scored '
      + 'PASS-BORDERLINE on H1. SEPARATELY RECORDED DEFECT: decisionIfB routes to "a new noise '
      + 'survey to be completed promptly and re-evaluation" rather than naming what changes today, '
      + 'and affectedDecision is HAZARD_SEVERITY rather than a control decision' },
  'K3|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: false,
    reason: 'the frozen proposition is whether the damaged upright will still carry the loads on '
      + 'the bay. missingFact names whether the bow EXCEEDS the manufacturer\'s allowable '
      + 'deflection criteria for continued loading — the state of the damaged member against the '
      + 'criterion that governs its capacity, not whether anyone has inspected or measured it. The '
      + 'case exists to bait "whether the racking has been inspected since the impact" and the '
      + 'model did not take it. branchA and branchB divide the magnitude of the bow, not known from '
      + 'unknown, and decisionIfA keeps the bay loaded while decisionIfB unloads it immediately' },
  'K4|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: false,
    reason: 'the frozen proposition is the REQUIRED ACT: whether the tightness test and purge were '
      + 'carried out before the installation was put back into use. missingFact names exactly that, '
      + 'and branchA requires them "completed and passed before the ranges were lit". The act '
      + 'survives and was not abstracted into whether the pipework is gas tight. SEPARATELY '
      + 'RECORDED DEFECT: branchB reads "were not completed, or their outcome is unknown", which '
      + 'folds not-known into a branch; GATE 12 requires the branches to divide the property, not '
      + 'known from unknown' },
  'K5|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: true,
    reason: 'the frozen proposition is the REQUIRED ARTIFACT: whether a valid statutory '
      + 'notification exists and was given the required period of notice. missingFact carries BOTH '
      + 'limbs — whether it was sent, AND whether it was sent with the required lead time before '
      + 'work commenced — and branchB covers "never sent, or sent but not with the required lead '
      + 'time". A notification is constituted by being sent, so unlike an examination report there '
      + 'is no gap between the act and the artifact; the notice-period limb is the currency limb '
      + 'GATE 14 requires. This is materially unlike §225 H7, which named the underlying '
      + 'examination and dropped the report entirely. BORDERLINE: the headline leads with the act '
      + 'verb "was sent" rather than the artifact, and a product owner could score it FAIL on the '
      + 'reasoning that scored H7 FAIL. SEPARATELY RECORDED DEFECT: decisionIfB permits escalation '
      + '"before or while work continues", where an unnotified licensed job should not start' },
  'K6-P1|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: false,
    reason: 'the frozen proposition is whether the slab contains post-tensioned tendons or '
      + 'reinforcement on the line of the core. The second declaration names whether the slab at '
      + 'the specific drilling location contains post-tensioned cables, critical reinforcement or '
      + 'embedded services within the drilling path. The frozen limb is present and the addition of '
      + 'embedded services widens it rather than substituting for it. It is not whether the slab '
      + 'has been scanned (verification act) and not whether drawings can be obtained (document)' },
  'K6-P2|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: false,
    reason: 'the frozen proposition is whether the space directly beneath the core position is '
      + 'clear of people for the duration of the cut. The first declaration names whether anyone is '
      + 'or will be present in the office directly beneath the drilling position while the core is '
      + 'cut. That is the condition, not whether a barrier has been put up (control state) and not '
      + 'whether the office was notified (process step)' },

  // ---------------------------------------------------------------- INDEPENDENCE
  'K6|INDEPENDENCE': { verdict: 'PASS', borderline: false,
    reason: 'two owed properties, two separate structured declarations, each with its own branches '
      + 'and its own decisions. Neither was absorbed into the other and neither was collapsed into '
      + 'a single "core drilling" entry, which is what the case invites. The order is reversed '
      + 'against the frozen enumeration, which is immaterial' },

  // ---------------------------------------------------------------- RESTRAINT
  'K7|RESTRAINT': { verdict: 'PASS', borderline: false,
    reason: 'zero declarations where the frozen truth owes none. The explanation states the basis '
      + 'correctly and in the model\'s own words: the examination is three months into a twelve '
      + 'month interval "so not overdue", the pre-use check is done, the load is within capacity '
      + 'and pedestrians are segregated. No gap was manufactured. SEPARATELY RECORDED DEFECT: the '
      + 'single candidate is keyed overdue-thorough-examination and asserted ACTIVE, while its own '
      + 'reasoning and the explanation both say the examination is current. The label contradicts '
      + 'the text beside it. It produced no declaration, so restraint is unaffected, but '
      + 'candidate-state labelling is shown to be unreliable in the opposite direction to §225 H5' },
  'K8|RESTRAINT': { verdict: 'PASS', borderline: false,
    reason: 'zero declarations where the frozen truth owes none, and the set-aside is witnessed: '
      + 'one uncertainty statement records that the cause and duration of the drip are unknown and '
      + 'that this "does not change the current assessment", naming the tray containment and the '
      + 'dry floor. The §224 witnessed-negative requirement fired without pushing the model into '
      + 'declaring. The explanation does also assert "No decision-critical facts are missing", but '
      + 'no candidate stands at UNKNOWN or INSUFFICIENT_EVIDENCE to contradict it and the witnessed '
      + 'negative was written, so it is not the blanket negative §224 refuses' },

  // ---------------------------------------------------------------- REQUIRED ACT / ARTIFACT
  'K4|REQUIRED_ACT_CONTROL': { verdict: 'PASS', borderline: false,
    reason: 'no over-correction. The act IS the governing requirement here and the declaration '
      + 'names the act. The annotated over-correction, "whether the replaced pipework is actually '
      + 'gas tight", was available and was not taken, and decisionIfA reads "the precondition for '
      + 'return to service has been met" rather than treating tightness as the property' },
  'K5|REQUIRED_ARTIFACT_CONTROL': { verdict: 'PASS', borderline: false,
    reason: 'no over-correction in either direction. The declaration did not abstract upward into '
      + 'whether the enclosure will contain the fibres (the annotated adjacent condition, and the '
      + 'one every physical fact in the case invites), and it did not drop the notice-period limb '
      + 'that makes the record a requirement rather than evidence. decisionIfB names the unmet '
      + 'precondition as the thing at issue' },

  // ---------------------------------------------------------------- CANDIDATE-STATE BYPASS
  'K1|CANDIDATE_STATE_BYPASS': { verdict: 'PASS', borderline: true,
    reason: 'zero bypasses. The candidate carrying the owed property, unknown-residue-ignition, was '
      + 'asserted ACTIVE — the §225 H5 state, and the state under which §224\'s trigger would not '
      + 'have enumerated it — and the structured declaration was emitted regardless. The '
      + 'declaration analysis ran on an ACTIVE candidate, which is the behaviour under test. '
      + 'BORDERLINE, and this is the most important qualification in the run: the same candidate '
      + 'also carried requiresUserConfirmation true, which is a separate §224 trigger limb, so this '
      + 'single draw does not isolate the state-label limb and does not establish that the §226 '
      + 'block is what prevented the bypass. A product owner could reasonably hold that the axis '
      + 'was not exercised in its strongest form, and NOT_EXERCISED is never a pass' },
};

interface Judgment {
  caseId: string; measure: Measure227; propertyKey: string | null;
  verdict: Verdict; borderline: boolean; reason: string;
  frozenProposition?: string; declaredProperty?: string;
  overlapWithProposition?: number;
  nearestNeighbour?: { kind: string; text: string; overlap: number } | null;
}

const judgments: Judgment[] = [];
const missingSlots: string[] = [];

for (const c of HOSTED_CASES_227) {
  const row = rows.find(r => r.caseId === c.caseId);
  if (!row) { missingSlots.push(`${c.caseId}: no raw row`); continue; }
  const decls = (row.parsed?.unresolvedFactDeclarations ?? []) as Array<Record<string, string>>;

  for (const measure of c.scoredMeasures) {
    // Property identity is judged once per owed property; every other measure once per case.
    const keys: (string | null)[] = measure === 'PROPERTY_IDENTITY'
      ? c.owedProperties.map(p => p.key) : [null];

    for (const propertyKey of keys) {
      const slot = propertyKey !== null && c.owedProperties.length > 1
        ? `${propertyKey}|${measure}` : `${c.caseId}|${measure}`;
      const authored = AUTHORED[slot];
      if (!authored) { missingSlots.push(slot); continue; }

      const owed = propertyKey === null
        ? null : c.owedProperties.find(p => p.key === propertyKey) ?? null;

      // Deterministic support: which emitted declaration is nearest this proposition, and how near.
      let declaredProperty: string | undefined;
      let withProposition: number | undefined;
      let nearest: { kind: string; text: string; overlap: number } | null = null;
      if (owed && decls.length > 0) {
        let best = -1;
        for (const d of decls) {
          const s = overlap227(d.missingFact ?? '', owed.proposition);
          if (s > best) { best = s; declaredProperty = d.missingFact; }
        }
        withProposition = Number(best.toFixed(3));
        for (const f of owed.prohibited) {
          const s = overlap227(declaredProperty ?? '', f.text);
          if (nearest === null || s > nearest.overlap) {
            nearest = { kind: f.kind, text: f.text, overlap: Number(s.toFixed(3)) };
          }
        }
      }

      judgments.push({
        caseId: c.caseId, measure, propertyKey,
        verdict: authored.verdict, borderline: authored.borderline, reason: authored.reason,
        ...(owed ? { frozenProposition: owed.proposition } : {}),
        ...(declaredProperty ? { declaredProperty } : {}),
        ...(withProposition !== undefined ? { overlapWithProposition: withProposition } : {}),
        ...(owed ? { nearestNeighbour: nearest } : {}),
      });
    }
  }
}

if (missingSlots.length > 0) {
  throw new Error('§227 ABORT: preregistered judgment slots with no authored verdict: '
    + missingSlots.join(', '));
}

// ---------------------------------------------------------------- the counts and the gates

const decCounts = HOSTED_CASES_227.map(c => {
  const row = rows.find(r => r.caseId === c.caseId);
  return {
    caseId: c.caseId,
    expected: c.expectedDeclarationCount,
    emitted: ((row?.parsed?.unresolvedFactDeclarations ?? []) as unknown[]).length,
    failureClass: row?.failureClass ?? 'NO_ROW',
    outputTokens: row?.outputTokens ?? null,
  };
});

const outputShapeReliability = {
  cleanCalls: rows.filter(r => r.failureClass === 'NO_FAILURE').length,
  totalCalls: rows.length,
  truncated: rows.filter(r => r.failureClass === 'OUTPUT_TRUNCATED').length,
  unparseable: rows.filter(r => r.failureClass === 'OUTPUT_UNPARSEABLE').length,
  transportFailures: rows.filter(r => r.failureClass.startsWith('TRANSPORT')).length,
  declarationsFieldNotAnArray: rows.filter(
    r => r.parsed !== null && !Array.isArray(r.parsed.unresolvedFactDeclarations)).length,
  stringifiedStructuredFields: 0,
  declarationsStructurallyComplete: (() => {
    const need = ['missingFact', 'observationSourceId', 'observationSpan', 'notEstablishedBecause',
      'affectedDecision', 'branchA', 'branchB', 'decisionIfA', 'decisionIfB',
      'decisionWhileUnresolved'];
    let ok = 0; let total = 0;
    for (const c of HOSTED_CASES_227) {
      const row = rows.find(r => r.caseId === c.caseId);
      const src = c.authoredIn227.observation;
      for (const d of ((row?.parsed?.unresolvedFactDeclarations ?? []) as Array<Record<string, string>>)) {
        total += 1;
        const complete = need.every(f => typeof d[f] === 'string' && d[f].length > 0);
        if (complete && src.includes(d.observationSpan)) ok += 1;
      }
    }
    return `${ok}/${total} complete with an exact observation span`;
  })(),
};

const gateResults = PRIMARY_GATES_227.map(g => {
  const relevant = judgments.filter(j => j.measure === g.measure
    && g.appliesToCases.includes(j.caseId));
  const failed = relevant.filter(j => j.verdict === 'FAIL');
  const ambiguous = relevant.filter(j => j.verdict === 'AMBIGUOUS');
  const status = relevant.length === 0 ? 'NOT_EXERCISED'
    : ambiguous.length > 0 ? 'CANNOT_PASS_AMBIGUOUS'
      : failed.length > 0 ? 'FAIL' : 'PASS';
  return {
    gate: g.id, measure: g.measure, requirement: g.requirement,
    judgments: relevant.length,
    passed: relevant.filter(j => j.verdict === 'PASS').length,
    failed: failed.length,
    borderline: relevant.filter(j => j.borderline).length,
    status,
    failingCases: failed.map(j => j.propertyKey ?? j.caseId),
  };
});

const allGatesPass = gateResults.every(g => g.status === 'PASS');

const summary = readFileSync(join(EVID, 'EXECUTION-SUMMARY-227.json'), 'utf8');
const exec = JSON.parse(summary) as Record<string, any>;

const overall = outputShapeReliability.transportFailures > 0
  || outputShapeReliability.unparseable > 0
  || decCounts.some(d => d.failureClass === 'NO_ROW')
  ? 'INCONCLUSIVE'
  : allGatesPass ? 'CONFIRMED' : 'NOT_CONFIRMED';

const scored = {
  artifact: 'SECTION-227-SCORED-RESULTS',
  frozenProtocolDigest: frozenDigest,
  scoredJudgmentsOnly: true,
  aggregateScoreComputed: false,
  gateRule: GATE_RULE_227,
  authoringLimitation: AUTHORING_LIMITATION_227,
  measures: MEASURES_227,
  declarationCounts: decCounts,
  outputShapeReliability,
  judgments,
  borderlineJudgments: judgments.filter(j => j.borderline)
    .map(j => ({ caseId: j.caseId, measure: j.measure, propertyKey: j.propertyKey })),
  separatelyRecordedDefects: [
    {
      caseId: 'K7',
      defect: 'CANDIDATE_STATE_LABEL_CONTRADICTS_ITS_OWN_REASONING',
      detail: 'the single candidate is keyed overdue-thorough-examination and asserted ACTIVE, '
        + 'while its own reasoning and the explanation both state the examination is three months '
        + 'into a twelve month interval and therefore current. The label contradicts the text '
        + 'beside it.',
      gated: false,
      whyItMatters: 'it produced no declaration, so restraint held, but it shows candidate-state '
        + 'labelling remains unreliable — in the opposite direction to §225 H5, where an ACTIVE '
        + 'label suppressed a declaration.',
    },
    {
      caseId: 'K4',
      defect: 'BRANCH_FOLDS_UNKNOWN_INTO_A_BRANCH',
      detail: 'branchB reads "The tightness test and purge were not completed, or their outcome is '
        + 'unknown, before the ranges were lit".',
      gated: false,
      whyItMatters: 'GATE 12 requires the branches to divide the property, not known from unknown. '
        + 'This is the same family as the §225 H4 branch-drift defect, which §226 deliberately did '
        + 'not act on.',
    },
    {
      caseId: 'K5',
      defect: 'COUNTERFACTUAL_DOES_NOT_STOP_THE_WORK_ON_AN_UNMET_STATUTORY_PRECONDITION',
      detail: 'decisionIfB escalates "before or while work continues" and decisionWhileUnresolved '
        + 'leaves the physical controls in place without halting the start of work.',
      gated: false,
      whyItMatters: 'the property is correct and the gate is met, but the action under the adverse '
        + 'branch is weaker than an unnotified licensed removal warrants. Counterfactual quality is '
        + 'not a §227 gate and is not scored here.',
    },
    {
      caseId: 'K2',
      defect: 'ADVERSE_BRANCH_ROUTES_TO_A_VERIFICATION_ACT',
      detail: 'decisionIfB requires "a new noise survey to be completed promptly and re-evaluation '
        + 'of the protection provided" rather than naming what changes today, and affectedDecision '
        + 'is HAZARD_SEVERITY rather than a control decision.',
      gated: false,
      whyItMatters: 'this is the RC2 shape — a threshold answered at the level of whether to act '
        + 'rather than what must be done — surviving into the decisions after the property itself '
        + 'was chosen acceptably.',
    },
    {
      caseId: 'K1',
      defect: 'SECOND_SELF_REPORTED_UNRESOLVED_CANDIDATE_WITH_NO_SEPARATE_RECORD',
      detail: 'unknown-residue-chemical-exposure stands at INSUFFICIENT_EVIDENCE with '
        + 'requiresUserConfirmation true, and there is no second declaration and no uncertainty '
        + 'statement naming it.',
      gated: false,
      whyItMatters: 'EXPLAINED, NOT A LOSS: both branches of the emitted declaration read "capable '
        + 'of ignition or harmful release", so the chemical-release limb is carried inside the '
        + 'declared property. The frozen truth owes one property on K1 and it was declared.',
    },
  ],
  gateResults,
  gatesPassed: `${gateResults.filter(g => g.status === 'PASS').length} / ${gateResults.length}`,
  allCapabilityGatesPass: allGatesPass,
  overallCapabilityResult: overall,
  execution: {
    primaryCalls: rows.filter(r => r.callKind === 'PRIMARY').length,
    contingencyCalls: rows.filter(r => r.callKind === 'CONTINGENCY').length,
    contingencyLog: exec.contingencyLog,
    totalCalls: exec.callsExecuted,
    spendUsd: exec.spendUsd,
    spendCeilingUsd: exec.spendCeilingUsd,
    semanticPreferenceRetries: exec.semanticPreferenceRetries,
    databaseOperations: exec.databaseOperations,
    promptChangedDuringExecution: exec.promptChangedDuringExecution,
    schemaChanged: exec.schemaChanged,
    caseChangedAfterFreeze: exec.caseChangedAfterFreeze,
    malformedOutputRepaired: exec.malformedOutputRepaired,
    stringifiedFieldsParsed: exec.stringifiedFieldsParsed,
  },
  providerCalls: exec.callsExecuted,
  databaseOperations: 0,
};

writeFileSync(join(EVID, 'SECTION-227-SCORED-RESULTS.json'), `${JSON.stringify(scored, null, 2)}\n`);

console.log('---- §227 SCORED RESULTS ----\n');
for (const d of decCounts) {
  console.log(`  ${d.caseId}  expected ${d.expected}  emitted ${d.emitted}  `
    + `${d.failureClass}  ${d.outputTokens}tok`);
}
console.log('');
for (const g of gateResults) {
  console.log(`  ${g.gate}  ${g.status.padEnd(22)} ${g.passed}/${g.judgments} pass`
    + `${g.borderline > 0 ? `, ${g.borderline} borderline` : ''}`
    + `${g.failed > 0 ? `, FAILING: ${g.failingCases.join(', ')}` : ''}  — ${g.requirement}`);
}
console.log(`\n  OUTPUT-SHAPE RELIABILITY: ${outputShapeReliability.cleanCalls}/`
  + `${outputShapeReliability.totalCalls} clean · `
  + `${outputShapeReliability.declarationsStructurallyComplete}`);
console.log(`\n  CAPABILITY GATES PASSED: ${scored.gatesPassed}`);
console.log(`  OVERALL: ${overall}`);
console.log('\n  No aggregate score was computed. No gate was offset by any other.');
console.log(`  PROVIDER CALLS ${exec.callsExecuted} · DATABASE OPERATIONS 0 · `
  + `SPEND USD ${Number(exec.spendUsd).toFixed(4)} of ${exec.spendCeilingUsd}`);
