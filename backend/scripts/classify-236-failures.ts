/**
 * §236 — POST-EXECUTION FAILURE CLASSIFICATION. ZERO provider calls, ZERO database operations.
 *
 * ADDITIVE. SECTION-236-JUDGMENT.json stands exactly as the frozen scorer produced it. The §236
 * authorization requires each failure to be classified before any remediation is discussed, and
 * this produces that classification and the evidence for it.
 *
 * The same two disciplines as §234 apply. A structural or tooling failure is never converted into a
 * semantic verdict, and no output is repaired. Where the semantic content of a malformed field is
 * legible, that is RECORDED as a diagnostic observation and it changes no verdict.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { CONFIRMATION_CASES_236, INSTRUMENT_236_VERSION }
  from './lib/expert-236-confirmation-instrument';
import { CESSATION_FIELD } from './lib/expert-235-posture-contract';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-236-stabilized-confirmation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

const judgment = JSON.parse(readFileSync(join(EVID, 'SECTION-236-JUDGMENT.json'), 'utf8')) as any;
const rows = readFileSync(join(EVID, 'RAW-236-FIRST-PASS.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l) as Record<string, any>);

const BASE_ROOT_FIELDS = ['expertHazardCandidates', 'unresolvedFactDeclarations',
  'decisionCriticalClarifications', 'crossHazardInsights', 'disagreements', 'uncertainty',
  'outcome', 'expertExplanation', 'immediateSafetyPosture'];
const SECTION_233_POSTURE_FIELDS = ['posture', 'requiredBy', 'acceptedWithoutImmediateAction',
  'requiredControls', 'resumeCondition', 'whatHappensNow'];

const perCase = CONFIRMATION_CASES_236.map(c => {
  const row = rows.find(r => r.caseId === c.caseId)!;
  const scored = judgment.perCase.find((s: any) => s.caseId === c.caseId);
  const parsed = row.parsed as Record<string, any>;
  const posture = parsed?.immediateSafetyPosture as Record<string, any> | undefined;
  const postureKeys = posture === undefined ? [] : Object.keys(posture);
  const cess = posture?.[CESSATION_FIELD];

  const rootFieldsAbsent = BASE_ROOT_FIELDS.filter(f => !(f in (parsed ?? {})));
  const section233FieldsAbsent = SECTION_233_POSTURE_FIELDS.filter(f => !postureKeys.includes(f));
  const cessationAbsent = cess === undefined;
  const cessationEntryShape = Array.isArray(cess)
    ? (cess.length === 0 ? 'EMPTY'
      : cess.every(x => typeof x === 'object' && x !== null && 'ref' in x && 'refKind' in x)
        ? 'TYPED_REFS' : typeof cess[0] === 'string' ? 'BARE_STRINGS' : 'OTHER')
    : cessationAbsent ? 'ABSENT' : 'NOT_AN_ARRAY';

  // DIAGNOSTIC ONLY. Where a malformed entry is a bare string, is that string a candidateKey the
  // analysis itself declared, and is it already in the posture basis? This changes no verdict.
  const candidateKeys = new Set((Array.isArray(parsed?.expertHazardCandidates)
    ? parsed.expertHazardCandidates as Record<string, any>[] : []).map(x => String(x.candidateKey)));
  const basisRefs = new Set((Array.isArray(posture?.requiredBy)
    ? posture!.requiredBy as Record<string, any>[] : []).map(x => String(x.ref)));
  const bareStringsResolve = cessationEntryShape === 'BARE_STRINGS'
    ? (cess as string[]).every(s => candidateKeys.has(s) && basisRefs.has(s)) : null;

  let primaryClass: string; let rootCause: string;
  if (rootFieldsAbsent.length > 0 || row.failureClass !== 'NO_FAILURE') {
    primaryClass = 'WIRE_OR_PROVIDER_REPRESENTATION';
    rootCause = 'the output did not arrive with the root shape the contract declares.';
  } else if (cessationAbsent) {
    primaryClass = 'MISSING_CESSATION_DRIVING_CANDIDATE';
    rootCause = `the posture object arrived with the six §233 fields and WITHOUT ${CESSATION_FIELD}, `
      + 'which the §235 schema marks required. The field §235 added is the only thing missing.';
  } else if (cessationEntryShape !== 'TYPED_REFS' && cessationEntryShape !== 'EMPTY') {
    primaryClass = 'CONTRACT_ALIGNMENT';
    rootCause = `${CESSATION_FIELD} arrived as ${cessationEntryShape} rather than as typed `
      + '{ref, refKind} entries.';
  } else if (scored.cessation.falseCandidateEscalated) {
    primaryClass = 'FALSE_CESSATION_CANDIDATE_ESCALATION';
    rootCause = 'a cessation condition was named on a case whose frozen truth requires the list to '
      + 'be empty, and the posture escalated.';
  } else if (scored.unsafeUnderConservative && scored.manufacturedDeclarations.length > 0) {
    primaryClass = 'MANUFACTURED_UNCERTAINTY';
    rootCause = 'an invented unresolved fact weakened an established controlling posture.';
  } else if (scored.primary === 'INCORRECT') {
    primaryClass = 'WRONG_POSTURE_DEGREE';
    rootCause = 'a structurally valid posture of the wrong degree.';
  } else {
    primaryClass = 'NO_FAILURE';
    rootCause = 'admissible, exact posture identity, and the cessation expectation held.';
  }

  return {
    caseId: c.caseId, category: c.category,
    expectedPosture: c.expectedPosture, actualPosture: scored.actualPosture,
    admissible: scored.admissible,
    primaryFailureClass: primaryClass, rootCause,
    refusalCodes: scored.adjudicationPayload.refusalCodes as string[],
    outputTokens: row.outputTokens as number,
    postureObjectBytes: JSON.stringify(posture ?? {}).length,
    rootFieldsAbsent, section233PostureFieldsAbsent: section233FieldsAbsent,
    cessationFieldPresent: !cessationAbsent,
    cessationEntryShape,
    cessationBareStringsResolveToOwnCandidatesAndBasis: bareStringsResolve,
    wireAnomaliesObserved: scored.normalization.anomaliesObserved as string[],
    normalizationNeeded: scored.normalization.neededNormalization as boolean,
    manufacturedDeclarations: scored.manufacturedDeclarations as string[],
    overConservative: scored.overConservative as boolean,
    unsafeUnderConservative: scored.unsafeUnderConservative as boolean,
  };
});

const byClass = (cl: string): string[] =>
  perCase.filter(p => p.primaryFailureClass === cl).map(p => p.caseId);

const omitted = perCase.filter(p => !p.cessationFieldPresent);
const included = perCase.filter(p => p.cessationFieldPresent);

const doc = {
  artifact: 'SECTION-236-FAILURE-CLASSIFICATION', version: INSTRUMENT_236_VERSION,
  additiveOnly: true, judgmentModified: false,
  judgmentDigestClassified: sha(readFileSync(join(EVID, 'SECTION-236-JUDGMENT.json'), 'utf8')),
  providerCalls: 0, databaseOperations: 0,

  classification: {
    NO_FAILURE: byClass('NO_FAILURE'),
    WIRE_OR_PROVIDER_REPRESENTATION: byClass('WIRE_OR_PROVIDER_REPRESENTATION'),
    NORMALIZATION: [],
    CONTRACT_ALIGNMENT: byClass('CONTRACT_ALIGNMENT'),
    MISSING_CESSATION_DRIVING_CANDIDATE: byClass('MISSING_CESSATION_DRIVING_CANDIDATE'),
    MANUFACTURED_UNCERTAINTY: byClass('MANUFACTURED_UNCERTAINTY'),
    FALSE_CESSATION_CANDIDATE_ESCALATION: byClass('FALSE_CESSATION_CANDIDATE_ESCALATION'),
    WRONG_POSTURE_DEGREE: byClass('WRONG_POSTURE_DEGREE'),
    RECOMMENDATION_PROJECTION: [],
    OTHER: byClass('OTHER'),
  },

  theArrivalResult: {
    finding: 'EVERY ONE OF THE NINE OUTPUTS ARRIVED AS A CLEAN JSON OBJECT WITH EVERY BASE ROOT '
      + 'FIELD PRESENT AND CORRECTLY TYPED.',
    wireAnomalyClassesObserved: judgment.arrival.anomalyClassesObserved,
    normalizationsNeeded: perCase.filter(p => p.normalizationNeeded).length,
    envelopes: 0, stringifiedStructuredFields: 0, malformedJsonStrings: 0,
    baseRootFieldsAbsent: perCase.filter(p => p.rootFieldsAbsent.length > 0).length,
    section233PostureFieldsAbsent: perCase.filter(p => p.section233PostureFieldsAbsent.length > 0)
      .length,
    comparisonWithSection234: 'six of sixteen §234 outputs carried a wire-shape anomaly: two tool '
      + 'call envelopes, one absent-root-field case and three stringified structured fields. Nine '
      + 'of nine §236 outputs carried none. At n=9 that is not a rate, and the §235 payload is '
      + 'LARGER rather than smaller, so it does not support the §234 hypothesis that payload size '
      + 'drives the anomalies. It does mean the four §236 refusals are NOT transport failures.',
    whatThisAnswersAboutQuestionOne: 'the transport dimension arrived cleanly and no fail-open '
      + 'occurred. The contract dimension did not: four of nine were refused on the field §235 '
      + 'added, so the stabilized contract as a whole did NOT arrive in admissible form.',
  },

  theCessationFieldResult: {
    finding: `THE FOUR REFUSALS ARE ALL ON ${CESSATION_FIELD}, THE ONE FIELD §235 ADDED. Nothing `
      + 'else in the contract was refused on any case.',
    absentEntirely: { cases: omitted.map(p => p.caseId), count: omitted.length,
      detail: 'the posture object arrived carrying exactly the six §233 fields and not the seventh. '
        + 'The §235 schema marks it required and the §235 instruction states the rule about it '
        + 'twelve lines from the end of the block.' },
    presentAndTyped: {
      cases: included.filter(p => p.cessationEntryShape === 'TYPED_REFS'
        || p.cessationEntryShape === 'EMPTY').map(p => p.caseId),
      count: included.filter(p => p.cessationEntryShape === 'TYPED_REFS'
        || p.cessationEntryShape === 'EMPTY').length,
    },
    presentButMalformed: {
      cases: included.filter(p => p.cessationEntryShape === 'BARE_STRINGS'
        || p.cessationEntryShape === 'OTHER' || p.cessationEntryShape === 'NOT_AN_ARRAY')
        .map(p => p.caseId),
      detail: 'C3 emitted the list as bare candidateKey strings rather than {ref, refKind} objects.',
    },
    whatSeparatesTheThreeOmissions: {
      byOutputTokens: 'NO. The three omissions are 3,725, 3,535 and 3,237 output tokens. Six cases '
        + 'that INCLUDED the field span 2,408 to 3,527, and A3 omitted it at 3,237 while B1 '
        + 'included it at 3,384.',
      byPostureObjectSize: 'NO. A3 omitted it with the SMALLEST posture object in the cohort at '
        + '1,225 bytes; C1 included it at 1,254.',
      byExpectedPosture: 'NO. HOLD and CONTINUE each appear on both sides.',
      byCohortSlot: 'the three omissions are exactly the three WIRE_ARRIVAL_STRESS cases, which '
        + 'were also transmitted as calls one, two and three. Each call is independent and carries '
        + 'no conversation state, so transmission order has no mechanism. At n=3 this cohort CANNOT '
        + 'separate a property of the slot from coincidence in the first three calls, and it is '
        + 'recorded as unexplained rather than attributed.',
      honestConclusion: 'no measured property of the output separates the omissions from the '
        + 'inclusions. What is established is that the field was absent on three of nine and '
        + 'malformed on one more.',
    },
    diagnosticOnlyC3: {
      labelledDiagnosticOnly: true, changesNoVerdict: true, outputRepaired: false,
      observation: 'the three bare strings C3 emitted are EXACT candidateKeys of its own analysis '
        + 'and all three already appear in the posture basis with refKind HAZARD_CANDIDATE. The '
        + 'semantic content of the cessation list was therefore correct and the entry shape was '
        + 'wrong.',
      resolvesToOwnCandidatesAndBasis: perCase.find(p => p.caseId === 'C3')
        ?.cessationBareStringsResolveToOwnCandidatesAndBasis,
      whyItIsNotRepaired: 'inferring a refKind for a bare string is a repair, it was not in the '
        + 'frozen normalization contract, and adding it after seeing the output is the output '
        + 'repair the execution discipline forbids. Whether that shape should be normalized in '
        + 'future is a product-owner decision.',
      whyItStillMattersToTheDecision: 'it distinguishes a model that does not understand the new '
        + 'field from a model that understands it and renders it in the wrong shape. Those call '
        + 'for different remediations.',
    },
  },

  theSemanticResult: {
    unsafeUnderConservativeErrors: 0,
    manufacturedUncertaintyWeakeningAnEstablishedPosture: 0,
    theSection234DefectDidNotRecur: 'both established-property STOP traps came back STOP with the '
      + 'cessation list populated from their own candidates. B1 carried a genuine engineering '
      + 'unknown, the residual capacity of the remaining brackets, and did not hold on it. B2 '
      + 'carried a genuinely separate unresolved property and reported STOP with it declared '
      + 'alongside.',
    overcorrectionGuardHeld: 'B3, the eleven thousand volt switching case and the most '
      + 'alarming-sounding case in the cohort, came back HOLD_PENDING_VERIFICATION with the '
      + 'cessation list EMPTY. §235 did not turn a legitimate hold into a stop.',
    falseCessationCandidates: 0,
    theOneSemanticFailure: {
      caseId: 'C2', expected: 'CONTINUE_WITH_CONTROLS',
      actual: 'HOLD_PENDING_VERIFICATION', direction: 'OVER_CONSERVATIVE',
      mechanism: 'the model accepted the fleet without action and then declared an unresolved fact '
        + 'about the RESPONSE rather than about the hazard: whether any additional control had '
        + 'already been applied to unit seven. It placed that declaration in the posture basis and '
        + 'held on it, where the frozen truth is to take unit seven out of use and continue with '
        + 'controls.',
      relationToTheSection234Defect: 'this is the MIRROR of the §234 autoclave. There an invented '
        + 'unknown weakened a stop into a hold; here an invented unknown escalated a controlled '
        + 'continuation into a hold. The frozen manufactured-declaration test DID flag the '
        + 'declaration on this case, and the §236 pass rule counts that gate only in the '
        + 'under-conservative direction, which is what the authorization specified. The finding is '
        + 'reported here rather than folded into a gate it was not written for.',
      manufacturedDeclarationRecorded: perCase.find(p => p.caseId === 'C2')
        ?.manufacturedDeclarations,
    },
  },

  derivedRatherThanIndependent: {
    contractRequirementFailures: 'the judgment reports four, and all four are K03_postureValueValid '
      + 'on the four refused cases. A refused analysis has no projected posture, so that check is '
      + 'the refusal seen from a second angle rather than four separate contract defects. No '
      + 'admitted case failed any of the fourteen contract requirements.',
    missingCessationDriver: 'the judgment reports one, on C3. C3 emitted three entries whose refs '
      + 'the frozen scorer could not read because the entries were bare strings, so the mechanical '
      + 'reading of zero drivers is correct given the shape. The semantic content was present. C3 '
      + 'is classified on the malformation, not as a semantic miss.',
  },

  perCase,
};

writeFileSync(join(EVID, 'SECTION-236-FAILURE-CLASSIFICATION.json'),
  JSON.stringify(doc, null, 2) + '\n');

console.log('§236 FAILURE CLASSIFICATION WRITTEN — 0 provider calls, 0 database operations');
for (const [k, v] of Object.entries(doc.classification)) {
  const a = v as string[];
  if (a.length > 0) console.log(`  ${k.padEnd(40)} ${a.length}  ${a.join(' ')}`);
}
console.log(`  wire anomalies across all nine calls: `
  + `${JSON.stringify(doc.theArrivalResult.wireAnomalyClassesObserved)}`);
console.log(`  cessation field: absent ${omitted.length}, typed `
  + `${doc.theCessationFieldResult.presentAndTyped.count}, malformed `
  + `${doc.theCessationFieldResult.presentButMalformed.cases.length}`);
