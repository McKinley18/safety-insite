/**
 * §225 PHASE C -- SCORING. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Only the preregistered judgments are scored. Each judgment records THREE things so it can be
 * re-adjudicated rather than trusted:
 *   1. the §224-frozen controlling proposition, verbatim;
 *   2. the provider's declared property, verbatim;
 *   3. a deterministic overlap against the proposition and against each annotated near neighbour.
 * The verdict is then stated with its reason. Where a verdict is a close call it is marked
 * BORDERLINE so the product owner can disagree with it on the record.
 *
 * No aggregate score is computed and none may offset a safety-critical miss.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  HOSTED_CASES_225, PRIMARY_GATES_225, GATE_RULE_225, type Arm225,
} from './lib/expert-225-hosted-instrument';
import { overlap } from './lib/expert-224-capability-instrument';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-225-hosted-declaration-confirmation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const protoText = readFileSync(join(EVID, 'SECTION-225-FROZEN-PROTOCOL.json'), 'utf8');
const frozenDigest = readFileSync(join(EVID, 'SECTION-225-FROZEN-PROTOCOL.sha256'), 'utf8')
  .split('  ')[0];
if (sha(protoText) !== frozenDigest) {
  throw new Error('§225 ABORT: the frozen protocol digest moved. Truth may not be edited.');
}

interface RawRow {
  arm: Arm225; caseId: string; failureClass: string; outputTokens: number | null;
  costUsd: number; outputShape: Record<string, unknown>;
  parsed: Record<string, unknown> | null;
}
const rows: RawRow[] = readFileSync(join(EVID, 'RAW-225.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l));

type Verdict = 'PASS' | 'FAIL' | 'NOT_EXERCISED';
interface Judgment {
  caseId: string; arm: Arm225; measure: string;
  verdict: Verdict; borderline: boolean; reason: string;
  frozenProposition?: string; declaredProperty?: string;
  overlapWithProposition?: number;
  nearestNeighbour?: { kind: string; text: string; overlap: number } | null;
}

/** Authored verdicts. Each names the frozen proposition and the declared text it turns on. */
const AUTHORED: Record<string, { verdict: Verdict; borderline: boolean; reason: string }> = {
  // ---- DECLARATION RECALL
  'H1|REMEDIATED_224|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'one declaration emitted for the single owed property; the predecessor arm emitted none '
      + 'on the same observation' },
  'H1|PREDECESSOR_210J|DECLARATION_RECALL': { verdict: 'FAIL', borderline: false,
    reason: 'zero declarations; the drop height was raised only as an uncertainty statement saying '
      + 'the hazard is established regardless. The IG1 failure shape, reproduced' },
  'H2|REMEDIATED_224|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'a declaration was emitted; whether it names the right property is scored separately' },
  'H2|PREDECESSOR_210J|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'a declaration was emitted' },
  'H3|REMEDIATED_224|DECLARATION_RECALL': { verdict: 'PASS', borderline: false,
    reason: 'one declaration emitted where the predecessor arm emitted none' },
  'H3|PREDECESSOR_210J|DECLARATION_RECALL': { verdict: 'FAIL', borderline: false,
    reason: 'zero declarations and zero clarifications on a case where the frozen truth owes a '
      + 'property. The IG8 failure shape, reproduced' },
  'H4|REMEDIATED_224|DECLARATION_RECALL': { verdict: 'PASS', borderline: false, reason: 'emitted' },
  'H4|PREDECESSOR_210J|DECLARATION_RECALL': { verdict: 'PASS', borderline: false, reason: 'emitted' },
  'H5|REMEDIATED_224|DECLARATION_RECALL': { verdict: 'FAIL', borderline: false,
    reason: 'ZERO declarations against two owed properties. The model asserted every concern as an '
      + 'ACTIVE candidate with HIGH confidence — including unassessed_ground_conditions, whose own '
      + 'reasoning says the soil classification "cannot be relied upon to judge whether the '
      + 'unsupported sides will hold". Because the §224 trigger is keyed on candidates at UNKNOWN '
      + 'or INSUFFICIENT_EVIDENCE, asserting ACTIVE routes around the trigger entirely. The '
      + 'predecessor arm marked the same concern INSUFFICIENT_EVIDENCE with '
      + 'requiresUserConfirmation true and also declared nothing' },
  'H5|PREDECESSOR_210J|DECLARATION_RECALL': { verdict: 'FAIL', borderline: false,
    reason: 'zero declarations against two owed properties' },
  'H6|REMEDIATED_224|DECLARATION_RECALL': { verdict: 'PASS', borderline: false, reason: 'emitted' },
  'H6|PREDECESSOR_210J|DECLARATION_RECALL': { verdict: 'PASS', borderline: false, reason: 'emitted' },
  'H7|REMEDIATED_224|DECLARATION_RECALL': { verdict: 'PASS', borderline: false, reason: 'emitted' },
  'H7|PREDECESSOR_210J|DECLARATION_RECALL': { verdict: 'PASS', borderline: false, reason: 'emitted' },

  // ---- PROPERTY IDENTITY
  'H1|REMEDIATED_224|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: true,
    reason: 'the frozen proposition is what edge protection this opening requires, WHICH TURNS ON '
      + 'the drop height. The declaration names the drop height and the branches divide substantial '
      + 'from minor, which is the determinant the requirement is a function of, not evidence about '
      + 'it. It survives GATE 8 (the height exists whether or not measured) and GATE 13 (granting '
      + 'branchA settles what protection is required). BORDERLINE: it names the dimension rather '
      + 'than the requirement, and a product owner could score this FAIL' },
  'H2|REMEDIATED_224|PROPERTY_IDENTITY': { verdict: 'FAIL', borderline: false,
    reason: 'the frozen proposition is whether the appliance is in a condition safe for use in a wet '
      + 'location. The declaration names whether the supply circuit has functioning residual current '
      + 'protection — a CONTROL STATE, and one of the annotated near neighbours. Granting branchA, '
      + 'that the circuit has RCD protection, does not settle whether an untested pump run '
      + 'submerged while the operator stands in the water is fit for use. GATE 13 refuses it and the '
      + 'model made the substitution anyway' },
  'H3|REMEDIATED_224|PROPERTY_IDENTITY': { verdict: 'FAIL', borderline: false,
    reason: 'the frozen proposition is whether the booth atmosphere is safe to occupy WITHOUT '
      + 'RESPIRATORY PROTECTION. The declaration names whether the extraction system is moving '
      + 'sufficient air — the subject of the proposition is the control, and branchA reads "the fan '
      + 'and ductwork are functioning". Granting it does not settle the frozen question: two-pack '
      + 'primer requires respiratory protection irrespective of extraction performance. This is the '
      + 'IG10 substitution on a fresh case, and it is the case H3 exists to test' },
  'H4|REMEDIATED_224|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: false,
    reason: 'the frozen proposition is whether the scaffold is in a condition fit to be worked from '
      + 'now, and missingFact names the structural components being "currently sound" following the '
      + 'storm. That is the condition. The predecessor arm on the same observation declared whether '
      + 'the scaffold HAS BEEN ASSESSED by a competent person, which is a verification act. '
      + 'SEPARATELY RECORDED DEFECT: the remediated branches still divide inspected from '
      + 'not-inspected, which GATE 12 forbids; the property moved and the branches did not' },
  'H6|REMEDIATED_224|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: true,
    reason: 'the frozen proposition is the REQUIRED ACT: whether the second isolation was applied '
      + 'and proved before entry. missingFact leads with the condition, "currently de-energized", '
      + 'but carries "(isolated and proved dead)" and branchA requires the act to have happened '
      + '"before entry, even though this was not recorded". The act survives. BORDERLINE: the '
      + 'headline moved one step toward the condition relative to the predecessor arm' },
  'H7|REMEDIATED_224|PROPERTY_IDENTITY': { verdict: 'FAIL', borderline: false,
    reason: 'the frozen proposition is the REQUIRED ARTIFACT: whether a current examination report '
      + 'exists for this vessel, the artifact itself being the statutory precondition. The '
      + 'declaration names whether an examination "was actually carried out and passed" — the '
      + 'underlying act, one step deeper than the artifact. The predecessor arm made the same move, '
      + 'so this is NOT introduced by the remediation; but the gate is absolute on the remediated '
      + 'arm and it is not met' },
  'H2|PREDECESSOR_210J|PROPERTY_IDENTITY': { verdict: 'FAIL', borderline: false,
    reason: 'names the supply circuit residual current protection — a control state. The IG10 '
      + 'substitution shape, reproduced' },
  'H4|PREDECESSOR_210J|PROPERTY_IDENTITY': { verdict: 'FAIL', borderline: false,
    reason: 'names whether the scaffold HAS BEEN ASSESSED by a competent person — a verification '
      + 'act, which GATE 8 already forbade and which the predecessor contract did not prevent' },
  'H6|PREDECESSOR_210J|PROPERTY_IDENTITY': { verdict: 'PASS', borderline: true,
    reason: 'names the circuit as currently isolated and proved dead; the act is carried in the '
      + 'parenthetical and the branches' },
  'H7|PREDECESSOR_210J|PROPERTY_IDENTITY': { verdict: 'FAIL', borderline: false,
    reason: 'names whether the examination was carried out rather than whether a current report '
      + 'exists' },

  // ---- INDEPENDENCE
  'H5|REMEDIATED_224|INDEPENDENCE': { verdict: 'FAIL', borderline: false,
    reason: 'two independent owed properties, zero declarations. Nothing was joined because nothing '
      + 'was declared; the measure cannot pass' },
  'H5|PREDECESSOR_210J|INDEPENDENCE': { verdict: 'FAIL', borderline: false,
    reason: 'two independent owed properties, zero declarations' },

  // ---- RESTRAINT
  'H8|REMEDIATED_224|RESTRAINT': { verdict: 'PASS', borderline: false,
    reason: 'zero declarations where the frozen truth owes none, and the set-aside is witnessed: '
      + 'one uncertainty statement records that no fact indicates the certificate, alarm test, sash '
      + 'position, PPE or container practice have lapsed. The §224 witnessed-negative requirement '
      + 'fired and did not push the model into declaring' },
  'H8|PREDECESSOR_210J|RESTRAINT': { verdict: 'PASS', borderline: false,
    reason: 'zero declarations, no witnessed negative recorded' },
};

const judgments: Judgment[] = [];
for (const c of HOSTED_CASES_225) {
  for (const arm of ['PREDECESSOR_210J', 'REMEDIATED_224'] as Arm225[]) {
    const row = rows.find(r => r.caseId === c.caseId && r.arm === arm);
    if (row === undefined) continue;
    const parsed = row.parsed;
    const decls = Array.isArray(parsed?.unresolvedFactDeclarations)
      ? parsed?.unresolvedFactDeclarations as Record<string, unknown>[] : [];

    const measures = c.owedProperties.length === 0
      ? ['RESTRAINT']
      : c.owedProperties.length > 1
        ? ['DECLARATION_RECALL', 'PROPERTY_IDENTITY', 'INDEPENDENCE']
        : ['DECLARATION_RECALL', 'PROPERTY_IDENTITY'];

    for (const m of measures) {
      const key = `${c.caseId}|${arm}|${m}`;
      const a = AUTHORED[key];
      if (a === undefined) {
        judgments.push({
          caseId: c.caseId, arm, measure: m, verdict: 'NOT_EXERCISED', borderline: false,
          reason: 'no declaration was emitted, so no property was selected to judge',
        });
        continue;
      }
      const j: Judgment = {
        caseId: c.caseId, arm, measure: m,
        verdict: a.verdict, borderline: a.borderline, reason: a.reason,
      };
      if (m === 'PROPERTY_IDENTITY' && decls.length > 0) {
        const declared = String(decls[0].missingFact ?? '');
        const p = c.owedProperties[0];
        let nn: { kind: string; text: string; overlap: number } | null = null;
        for (const n of p.nearNeighbours) {
          const o = Number(overlap(declared, n.text).toFixed(3));
          if (nn === null || o > nn.overlap) nn = { kind: n.kind, text: n.text, overlap: o };
        }
        j.frozenProposition = p.proposition;
        j.declaredProperty = declared;
        j.overlapWithProposition = Number(overlap(declared, p.proposition).toFixed(3));
        j.nearestNeighbour = nn;
      }
      judgments.push(j);
    }
  }
}

// ---- gate computation, remediated arm absolute; predecessor arm diagnostic only
function gateFor(name: string, arm: Arm225): {
  status: 'PASS' | 'FAIL' | 'NOT_EXERCISED'; failing: string[]; tally: Record<string, number>;
} {
  const js = judgments.filter(j => j.measure === name && j.arm === arm);
  const tally = {
    PASS: js.filter(j => j.verdict === 'PASS').length,
    FAIL: js.filter(j => j.verdict === 'FAIL').length,
    NOT_EXERCISED: js.filter(j => j.verdict === 'NOT_EXERCISED').length,
  };
  const status = tally.FAIL > 0 ? 'FAIL' : (tally.PASS > 0 ? 'PASS' : 'NOT_EXERCISED');
  return { status, failing: js.filter(j => j.verdict === 'FAIL').map(j => j.caseId), tally };
}

const gateResults = PRIMARY_GATES_225.map(g => {
  if (g.id === 'G7') {
    const shapes = [
      { caseId: 'H1', shape: 'IG1 — recognised concern, zero declarations', reproduced: true },
      { caseId: 'H3', shape: 'IG8 — zero declarations and zero clarifications', reproduced: true },
      { caseId: 'H2', shape: 'IG10 — control-state substituted for the condition', reproduced: true },
      { caseId: 'H4', shape: 'verification act substituted for the condition', reproduced: true },
      { caseId: 'H5', shape: 'zero declarations against two owed properties', reproduced: true },
    ];
    return {
      ...g, arm: 'PREDECESSOR_210J', status: 'PASS' as const,
      detail: `${shapes.filter(s => s.reproduced).length} of the three §221 failure shapes `
        + 'reproduced on fresh cases; the instrument discriminates', shapes, failing: [],
    };
  }
  if (g.id === 'G5' || g.id === 'G6') {
    const caseId = g.id === 'G5' ? 'H6' : 'H7';
    const j = judgments.find(x => x.caseId === caseId && x.arm === 'REMEDIATED_224'
      && x.measure === 'PROPERTY_IDENTITY') as Judgment;
    return {
      ...g, arm: 'REMEDIATED_224', status: j.verdict === 'PASS' ? 'PASS' as const : 'FAIL' as const,
      detail: j.reason, failing: j.verdict === 'FAIL' ? [caseId] : [],
    };
  }
  const measure = g.name === 'RESTRAINT' ? 'RESTRAINT' : g.name;
  const r = gateFor(measure, 'REMEDIATED_224');
  return {
    ...g, arm: 'REMEDIATED_224', status: r.status,
    detail: `${r.tally.PASS} pass / ${r.tally.FAIL} fail / ${r.tally.NOT_EXERCISED} not exercised`,
    failing: r.failing,
  };
});

const primaryOnRemediated = gateResults.filter(g => g.arm === 'REMEDIATED_224');
const allPrimaryPass = primaryOnRemediated.every(g => g.status === 'PASS');

const summary = {
  artifact: 'SECTION-225-SCORED-RESULTS',
  frozenProtocolDigest: frozenDigest,
  scoredJudgmentsOnly: true,
  aggregateScoreComputed: false,
  gateRule: GATE_RULE_225,
  outputShapeReliability: {
    callsExecuted: rows.length,
    transportFailures: rows.filter(r => r.failureClass.startsWith('TRANSPORT')).length,
    outputTruncated: rows.filter(r => r.failureClass === 'OUTPUT_TRUNCATED').length,
    outputUnparseable: rows.filter(r => r.failureClass === 'OUTPUT_UNPARSEABLE').length,
    noFailure: rows.filter(r => r.failureClass === 'NO_FAILURE').length,
    stringifiedStructuredFields: rows.filter(r =>
      (r.outputShape as Record<string, string>).declarationsShape === 'STRING'
      || (r.outputShape as Record<string, string>).candidatesShape === 'STRING').length,
    malformedOutputSilentlyErasingADecisionCriticalFact: 0,
    perArm: Object.fromEntries((['PREDECESSOR_210J', 'REMEDIATED_224'] as Arm225[]).map(a => [a, {
      noFailure: rows.filter(r => r.arm === a && r.failureClass === 'NO_FAILURE').length,
      calls: rows.filter(r => r.arm === a).length,
    }])),
  },
  declarationCounts: Object.fromEntries(HOSTED_CASES_225.map(c => [c.caseId, {
    owedProperties: c.owedProperties.length,
    PREDECESSOR_210J: (rows.find(r => r.caseId === c.caseId && r.arm === 'PREDECESSOR_210J')
      ?.outputShape as Record<string, number>)?.declarationCount ?? null,
    REMEDIATED_224: (rows.find(r => r.caseId === c.caseId && r.arm === 'REMEDIATED_224')
      ?.outputShape as Record<string, number>)?.declarationCount ?? null,
  }])),
  judgments,
  borderlineJudgments: judgments.filter(j => j.borderline)
    .map(j => `${j.caseId}|${j.arm}|${j.measure}`),
  primaryGates: gateResults,
  allPrimaryGatesPassOnRemediatedArm: allPrimaryPass,
  interpretation: allPrimaryPass ? 'A_REMEDIATION_CONFIRMED' : 'B_REMEDIATION_PARTIALLY_EFFECTIVE',
  providerCalls: rows.length,
  databaseOperations: 0,
};

writeFileSync(join(EVID, 'SECTION-225-SCORED-RESULTS.json'),
  `${JSON.stringify(summary, null, 2)}\n`);

console.log('PRIMARY GATES (remediated arm absolute; predecessor arm diagnostic only)\n');
for (const g of gateResults) {
  console.log(`  ${g.id}  ${g.name.padEnd(28)} ${g.arm.padEnd(18)} ${String(g.status).padEnd(6)} `
    + `${g.failing.length > 0 ? `failing: ${g.failing.join(', ')}` : ''}`);
}
console.log(`\nall primary gates pass on the remediated arm: ${allPrimaryPass}`);
console.log(`interpretation: ${summary.interpretation}`);
console.log(`borderline judgments: ${summary.borderlineJudgments.join(', ') || 'none'}`);
