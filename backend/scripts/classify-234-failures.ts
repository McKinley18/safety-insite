/**
 * §234 — POST-EXECUTION FAILURE CLASSIFICATION. ZERO provider calls, ZERO database operations.
 *
 * ADDITIVE. It does not touch SECTION-234-JUDGMENT.json, which stands exactly as the frozen scorer
 * produced it. The §234 authorization requires that, if the cohort fails, each failure is CLASSIFIED
 * before any remediation is discussed. This produces that classification and the evidence for it.
 *
 * TWO DISCIPLINES ARE ENFORCED HERE.
 *
 *   1. A STRUCTURAL, CONTRACT OR TOOLING FAILURE IS NEVER CONVERTED INTO A SEMANTIC VERDICT. Where
 *      the wire output was malformed, the case is classified on the malformation and NOT scored as
 *      a posture-degree judgment in either direction.
 *
 *   2. NO OUTPUT IS REPAIRED. A diagnostic read of a malformed field is performed and labelled
 *      DIAGNOSTIC ONLY. It does not enter the judgment, it does not change a single verdict, and
 *      the frozen 5/16 stands.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { POSTURE_CASES_234, INSTRUMENT_234_VERSION }
  from './lib/expert-234-posture-discrimination-instrument';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-234-posture-discrimination-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

const judgment = JSON.parse(readFileSync(join(EVID, 'SECTION-234-JUDGMENT.json'), 'utf8')) as any;
const rows = readFileSync(join(EVID, 'RAW-234-FIRST-PASS.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l) as Record<string, any>);

const BASE_REQUIRED_ROOT_FIELDS = ['expertHazardCandidates', 'unresolvedFactDeclarations',
  'decisionCriticalClarifications', 'crossHazardInsights', 'disagreements', 'uncertainty',
  'outcome', 'expertExplanation'];
const POSTURE_FIELD = 'immediateSafetyPosture';
const STRUCTURED_FIELDS_THE_PROJECTION_READS = ['expertHazardCandidates',
  'unresolvedFactDeclarations', 'decisionCriticalClarifications', POSTURE_FIELD];

/** Wire-shape anomaly families, named before any of them is attributed to anything. */
type WireAnomaly = 'TOOL_CALL_ENVELOPE' | 'REQUIRED_ROOT_FIELD_ABSENT'
  | 'STRUCTURED_FIELD_EMITTED_AS_STRING' | 'DUPLICATED_ROOT_KEY' | 'NONE';

function wireShape(parsed: Record<string, any> | null): {
  anomalies: WireAnomaly[]; detail: string[]; unwrapped: Record<string, any> | null;
} {
  if (parsed === null) return { anomalies: ['REQUIRED_ROOT_FIELD_ABSENT'], detail: ['no tool_use input'], unwrapped: null };
  const keys = Object.keys(parsed);
  const anomalies: WireAnomaly[] = []; const detail: string[] = [];

  // the whole answer wrapped in a tool-parameter envelope the contract never defines
  const envelopeKey = keys.find(k => /^parameters?$|^parameter[ _-]?name$/i.test(k));
  let body = parsed;
  if (envelopeKey !== undefined && keys.length <= 2) {
    anomalies.push('TOOL_CALL_ENVELOPE');
    detail.push(`the entire answer is wrapped in a "${envelopeKey}" envelope`);
    body = parsed[envelopeKey] as Record<string, any>;
  }
  const bodyKeys = Object.keys(body ?? {});
  const missing = [...BASE_REQUIRED_ROOT_FIELDS, POSTURE_FIELD].filter(f => !bodyKeys.includes(f));
  if (missing.length > 0) {
    anomalies.push('REQUIRED_ROOT_FIELD_ABSENT');
    detail.push(`required root fields absent: ${missing.join(', ')}`);
  }
  const strung = STRUCTURED_FIELDS_THE_PROJECTION_READS.filter(f => typeof body?.[f] === 'string');
  if (strung.length > 0) {
    anomalies.push('STRUCTURED_FIELD_EMITTED_AS_STRING');
    for (const f of strung) {
      let parses = false;
      try { JSON.parse(body[f] as string); parses = true; } catch { parses = false; }
      detail.push(`${f} emitted as a string; the string ${parses ? 'parses' : 'DOES NOT PARSE'}`);
    }
  }
  const dup = bodyKeys.filter(k => /\d$/.test(k)
    && bodyKeys.includes(k.replace(/\d+$/, '')) && !BASE_REQUIRED_ROOT_FIELDS.includes(k));
  if (dup.length > 0) {
    anomalies.push('DUPLICATED_ROOT_KEY');
    detail.push(`invented near-duplicate root keys: ${dup.join(', ')}`);
  }
  if (anomalies.length === 0) anomalies.push('NONE');
  return { anomalies, detail, unwrapped: body ?? null };
}

/** DIAGNOSTIC ONLY. Reads what the model appears to have chosen. Never enters the judgment. */
function diagnosticPosture(body: Record<string, any> | null): string | null {
  const v = body?.[POSTURE_FIELD];
  if (v === undefined || v === null) return null;
  if (typeof v === 'object' && !Array.isArray(v)) return (v.posture as string | undefined) ?? null;
  if (typeof v === 'string') {
    try { return (JSON.parse(v) as Record<string, unknown>).posture as string ?? null; }
    catch { return null; }
  }
  return null;
}

const perCase = POSTURE_CASES_234.map(c => {
  const row = rows.filter(r => r.caseId === c.caseId).slice(-1)[0];
  const scored = judgment.perCase.find((s: any) => s.caseId === c.caseId);
  const shape = wireShape((row?.parsed ?? null) as Record<string, any> | null);
  const diag = diagnosticPosture(shape.unwrapped);

  const codes: string[] = scored.structural.codes;
  const structurallyAdmitted: boolean = scored.structural.checks.ST1_postureAdmitted;

  let primaryClass: string; let rootCause: string;
  if (shape.anomalies.includes('TOOL_CALL_ENVELOPE')) {
    primaryClass = 'PROVIDER_OR_TRANSPORT_ANOMALY';
    rootCause = 'the provider returned the whole analysis inside an undefined tool-parameter '
      + 'envelope. Nothing about the posture contract was exercised.';
  } else if (shape.anomalies.includes('STRUCTURED_FIELD_EMITTED_AS_STRING')) {
    primaryClass = 'MALFORMED_OR_INCOMPLETE_STRUCTURED_POSTURE';
    rootCause = 'a field the projection reads was emitted as a JSON string rather than an object '
      + 'or array, and the string does not parse. Repairing it would be output repair.';
  } else if (shape.anomalies.includes('REQUIRED_ROOT_FIELD_ABSENT')) {
    primaryClass = 'MALFORMED_OR_INCOMPLETE_STRUCTURED_POSTURE';
    rootCause = 'the provider omitted root fields the wire schema marks required, the posture '
      + 'among them.';
  } else if (!structurallyAdmitted) {
    primaryClass = 'MALFORMED_OR_INCOMPLETE_STRUCTURED_POSTURE';
    rootCause = `the posture was well formed on the wire and the §233 projection refused it on `
      + `${codes.join(', ')}.`;
  } else if (scored.primary === 'INCORRECT') {
    primaryClass = 'WRONG_POSTURE_DEGREE';
    rootCause = 'a structurally valid posture of the wrong degree.';
  } else {
    primaryClass = 'NO_FAILURE';
    rootCause = 'exact posture identity, structurally valid.';
  }

  const manufactured: string[] = scored.manufacturedDeclarations;
  return {
    caseId: c.caseId,
    expectedPosture: c.expectedPosture,
    judgedPosture: scored.actualPosture,
    primaryFailureClass: primaryClass,
    rootCause,
    refusalCodes: codes,
    wireAnomalies: shape.anomalies,
    wireAnomalyDetail: shape.detail,
    manufacturedDeclarations: manufactured,
    secondaryFailureClasses: [
      ...(manufactured.length > 0 ? ['MANUFACTURED_DECLARATION_CARRYING_ACTION'] : []),
      ...(scored.secondary.SC5_recommendationFaithful === false
        ? ['RECOMMENDATION_PROJECTION_DEFECT'] : []),
    ],
    diagnosticPostureNotPartOfTheJudgment: diag,
    diagnosticAgreesWithFrozenTruth: diag === c.expectedPosture,
  };
});

const byClass = (cl: string): string[] =>
  perCase.filter(p => p.primaryFailureClass === cl).map(p => p.caseId);

/**
 * A resume condition emitted under a posture that PERMITS continued work. This is the only genuine
 * control/timing/resume inconsistency in the cohort, and it is NOT the same thing as a manufactured
 * declaration, which is a separate gate with its own count.
 */
const resumeUnderPermittingPosture = judgment.perCase
  .filter((s: any) => s.structural.pass
    && (s.actualPosture === 'CONTINUE' || s.actualPosture === 'CONTINUE_WITH_CONTROLS')
    && ((s.adjudicationPayload.modelResumeCondition?.resolvedByDeclarationIds.length ?? 0)
      + (s.adjudicationPayload.modelResumeCondition?.correctionsRequired.length ?? 0)) > 0)
  .map((s: any) => s.caseId as string);

// ---- the §231 base rate for the same wire-shape families, from spent evidence, for diagnosis only
const R231 = join(ROOT, 'verification', 'expert-hazlenz-231-final-fresh-acceptance-2026-09-11',
  'RAW-231-FIRST-PASS.jsonl');
const rows231 = readFileSync(R231, 'utf8').split('\n').filter(Boolean)
  .map(l => JSON.parse(l) as Record<string, any>).filter(r => r.callKind === 'PRIMARY');
let e231 = 0; let m231 = 0; let s231 = 0; let o231 = 0;
for (const r of rows231) {
  const p = (r.parsed ?? {}) as Record<string, any>;
  const keys = Object.keys(p);
  const env = keys.find(k => /^parameters?$|^parameter[ _-]?name$/i.test(k));
  const body = (env !== undefined && keys.length <= 2) ? p[env] as Record<string, any> : p;
  if (env !== undefined && keys.length <= 2) e231 += 1;
  else if (BASE_REQUIRED_ROOT_FIELDS.some(f => !(f in body))) m231 += 1;
  if (['expertHazardCandidates', 'unresolvedFactDeclarations']
    .some(f => typeof body?.[f] === 'string')) s231 += 1;
  if (typeof body?.outcome === 'string') o231 += 1;
}

const wireCount = (a: WireAnomaly): number =>
  perCase.filter(p => (p.wireAnomalies as string[]).includes(a)).length;

const doc = {
  artifact: 'SECTION-234-FAILURE-CLASSIFICATION', version: INSTRUMENT_234_VERSION,
  additiveOnly: true,
  judgmentModified: false,
  judgmentDigestClassified: sha(readFileSync(join(EVID, 'SECTION-234-JUDGMENT.json'), 'utf8')),
  providerCalls: 0, databaseOperations: 0,

  classification: {
    NO_FAILURE: byClass('NO_FAILURE'),
    WRONG_POSTURE_DEGREE: byClass('WRONG_POSTURE_DEGREE'),
    WRONG_CONTROLLING_PROPERTY: [],
    MALFORMED_OR_INCOMPLETE_STRUCTURED_POSTURE: byClass('MALFORMED_OR_INCOMPLETE_STRUCTURED_POSTURE'),
    RECOMMENDATION_PROJECTION_DEFECT: perCase
      .filter(p => p.secondaryFailureClasses.includes('RECOMMENDATION_PROJECTION_DEFECT')
        && judgment.perCase.find((s: any) => s.caseId === p.caseId).structural.pass)
      .map(p => p.caseId),
    CONTROL_TIMING_OR_RESUME_INCONSISTENCY: perCase
      .filter(p => resumeUnderPermittingPosture.includes(p.caseId)).map(p => p.caseId),
    PROVIDER_OR_TRANSPORT_ANOMALY: byClass('PROVIDER_OR_TRANSPORT_ANOMALY'),
    MANUFACTURED_DECLARATION_CARRYING_ACTION: perCase
      .filter(p => p.manufacturedDeclarations.length > 0).map(p => p.caseId),
  },

  /**
   * WITHOUT THIS NOTE THE COUNT ABOVE READS AS TEN RECOMMENDATION DEFECTS, AND IT IS NOT.
   *
   * The frozen scorer marks SC5 false whenever there is no recommendation state, and there is no
   * recommendation state precisely when the posture was refused. So the ten "recommendation
   * contradictions" in the judgment are the ten refusals seen from a second angle, not ten separate
   * defects. On every case where a posture WAS admitted, the projection produced a faithful
   * recommendation state and the completeness check returned no code.
   */
  recommendationProjectionReading: {
    judgmentReportsContradictions: judgment.recommendationContradictions.length,
    ofWhichAreSimplyTheRefusedCases: judgment.recommendationContradictions
      .filter((id: string) => !judgment.perCase.find((s: any) => s.caseId === id).structural.pass)
      .length,
    independentRecommendationDefectsOnAdmittedOutputs: perCase
      .filter(p => p.secondaryFailureClasses.includes('RECOMMENDATION_PROJECTION_DEFECT')
        && judgment.perCase.find((s: any) => s.caseId === p.caseId).structural.pass)
      .map(p => p.caseId),
    conclusion: 'the recommendation projection did not fail once on an output the contract '
      + 'admitted. Recommendation silence was structurally prevented exactly as §233 claimed.',
  },

  wireShapeCensus234: {
    calls: perCase.length,
    toolCallEnvelope: wireCount('TOOL_CALL_ENVELOPE'),
    requiredRootFieldAbsent: wireCount('REQUIRED_ROOT_FIELD_ABSENT'),
    structuredFieldEmittedAsString: wireCount('STRUCTURED_FIELD_EMITTED_AS_STRING'),
    duplicatedRootKey: wireCount('DUPLICATED_ROOT_KEY'),
    clean: wireCount('NONE'),
  },
  wireShapeBaseRate231: {
    calls: rows231.length,
    toolCallEnvelope: e231,
    requiredRootFieldAbsent: m231,
    structuredCoreFieldEmittedAsString: s231,
    outcomeEmittedAsString: `${o231}/${rows231.length}`,
    note: 'measured from SPENT §231 evidence for DIAGNOSIS ONLY. §231 is not rescored, not '
      + 'reinterpreted and does not become any part of the §234 result.',
  },
  whatTheComparisonSupports:
    'Emitting `outcome` as a string is a pre-existing base-contract behaviour (29/30 in §231) and '
    + 'is harmless because nothing in the §233 projection reads it. Emitting a STRUCTURED field '
    + 'that the projection DOES read as a string was not observed once in thirty §231 calls and '
    + 'was observed three times in sixteen §234 calls, twice on the posture object itself. That is '
    + 'a hypothesis about the larger §233 payload, NOT a demonstrated cause. n=16 cannot establish '
    + 'a rate and this must not be reported as one.',

  contractInstructionGap: {
    finding: 'THE §233 PROJECTION ENFORCES THREE RULES THE TRANSMITTED INSTRUCTION NEVER STATES.',
    rules: [
      { invariant: 'P2', enforced: 'a reference may not appear in BOTH requiredBy and '
          + 'acceptedWithoutImmediateAction', statedInThePrompt: false,
        statedInTheSchemaDescription: false, casesRefused: ['D1', 'D2'] },
      { invariant: 'P3', enforced: 'EVERY emitted declaration must appear in one of the two lists',
        statedInThePrompt: false, statedInTheSchemaDescription: false, casesRefused: ['D4'] },
      { invariant: 'P3', enforced: 'EVERY self-asserted ACTIVE candidate must appear in one of the '
          + 'two lists', statedInThePrompt: false, statedInTheSchemaDescription: false,
        casesRefused: ['S1'] },
    ],
    whyThisMatters: 'this is the §139 signature the §233 implementation applied to the posture ENUM '
      + 'and did not apply to the LIST SEMANTICS. On D1 and D2 the model listed a hazard as both a '
      + 'reason for CONTINUE and as accepted without action, which is a coherent thing to mean and '
      + 'is refused by a rule it was never given. S1 is different: an ACTIVE candidate appears in '
      + 'neither list, which is a genuine model omission under any reading.',
    thisIsAContractDefectNotAPostureDegreeDefect: true,
  },

  invariantGapObserved: {
    finding: 'a resumeCondition emitted under a posture that PERMITS continued work is not refused.',
    evidence: 'E2 selected CONTINUE_WITH_CONTROLS and populated resumeCondition.'
      + 'resolvedByDeclarationIds. §233 P4 requires a resume condition when the posture does not '
      + 'permit work; nothing refuses one when it does.',
    consequence: 'the projected recommendation state carries a resume gate on work the same object '
      + 'says may continue.',
    recordedNotRemediated: true,
  },

  manufacturedDeclarationFinding: {
    count: perCase.filter(p => p.manufacturedDeclarations.length > 0).length,
    cases: perCase.filter(p => p.manufacturedDeclarations.length > 0)
      .map(p => ({ caseId: p.caseId, declarationIds: p.manufacturedDeclarations })),
    theOneThatCausedHarm: 'S2. The model declared whether the locking ring is fully engaged as an '
      + 'UNRESOLVED FACT on a case whose controlling property — a door interlock defeated by a '
      + 'jumper wire, found and logged — is established, and used that invented unknown to select '
      + 'HOLD_PENDING_VERIFICATION instead of STOP. This is the §231 M4 shape, and here it produced '
      + 'the safety-critical under-conservative error rather than merely a restraint failure.',
    p3DidNotPreventIt: 'P3 requires every declaration to be COVERED by the posture. A manufactured '
      + 'declaration placed in requiredBy is covered, so P3 admits it. Coverage was never a test of '
      + 'whether the declaration should exist.',
  },

  diagnosticPostureRead: {
    labelledDiagnosticOnly: true,
    doesNotChangeAnyVerdict: true,
    outputRepaired: false,
    whatItIs: 'for each case, the posture value recoverable from the raw output by unwrapping a '
      + 'tool envelope or parsing a stringified field. Two malformed strings do not parse and stay '
      + 'unreadable.',
    recoverable: perCase.filter(p => p.diagnosticPostureNotPartOfTheJudgment !== null).length,
    agreeingWithFrozenTruth: perCase.filter(p => p.diagnosticAgreesWithFrozenTruth).length,
    disagreeing: perCase.filter(p => p.diagnosticPostureNotPartOfTheJudgment !== null
      && !p.diagnosticAgreesWithFrozenTruth)
      .map(p => ({ caseId: p.caseId, expected: p.expectedPosture,
        diagnostic: p.diagnosticPostureNotPartOfTheJudgment })),
    whyItIsRecordedAtAll: 'the product-owner remediation decision turns on whether the degree '
      + 'judgment underneath the wire failures is sound or unsound. Withholding that would leave '
      + 'the decision less informed for no gain in rigour.',
    whyItIsNotTheResult: 'the §234 pass rule scores the AUTHORITATIVE projected posture. An output '
      + 'the contract refuses has no authoritative posture, and reading one out of it by hand is '
      + 'exactly the output repair the execution discipline forbids. The frozen judgment stands.',
  },

  scorerRenderingDefect: {
    finding: 'the frozen scorer console prints "over" for a case with NO posture at all, because '
      + 'the mark expression falls through to the over-conservative branch when the primary '
      + 'judgment is INCORRECT and the under-conservative flag is false.',
    affectsTheRecordedData: false,
    evidence: 'SECTION-234-JUDGMENT.json records conservatism NO_POSTURE for those ten cases and '
      + 'reports overConservative as an empty list. The console line is the only thing that is '
      + 'wrong.',
    notRepaired: 'the scorer digest was frozen before the spend to prove the scoring logic was not '
      + 'shaped by the output. Editing it now, after seeing the output, would destroy that '
      + 'guarantee for a cosmetic gain. The defect is recorded instead.',
  },

  perCase,
};

writeFileSync(join(EVID, 'SECTION-234-FAILURE-CLASSIFICATION.json'),
  JSON.stringify(doc, null, 2) + '\n');

console.log('§234 FAILURE CLASSIFICATION WRITTEN — 0 provider calls, 0 database operations');
for (const [k, v] of Object.entries(doc.classification)) {
  console.log(`  ${k.padEnd(44)} ${(v as string[]).length}  ${(v as string[]).join(' ')}`);
}
console.log(`  wire clean ${doc.wireShapeCensus234.clean}/16 · envelope `
  + `${doc.wireShapeCensus234.toolCallEnvelope} · absent-field `
  + `${doc.wireShapeCensus234.requiredRootFieldAbsent} · stringified `
  + `${doc.wireShapeCensus234.structuredFieldEmittedAsString}`);
console.log(`  diagnostic degree read (NOT the result): `
  + `${doc.diagnosticPostureRead.agreeingWithFrozenTruth}/16 agree, `
  + `${doc.diagnosticPostureRead.recoverable}/16 recoverable`);
