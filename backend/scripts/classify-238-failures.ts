/**
 * §238 — POST-EXECUTION FAILURE CLASSIFICATION. ZERO provider calls, ZERO database operations.
 *
 * ADDITIVE. SECTION-238-JUDGMENT.json stands exactly as the frozen scorer produced it.
 *
 * The authorization requires each failure classified against the four product-level options
 * preregistered in §237. It also requires the evidence frozen before any remediation is discussed,
 * and none is performed here.
 *
 * The two standing disciplines apply. A structural or contract failure is never converted into a
 * semantic verdict, and no output is repaired. A diagnostic read of a refused output is recorded to
 * inform the decision and changes no verdict.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { CONFIRMATION_CASES_238, INSTRUMENT_238_VERSION }
  from './lib/expert-238-confirmation-instrument';
import { NO_FURTHER_EXPERIMENT_LOOP_238 } from './lib/expert-238-final-confirmation-design';
import {
  DRIVER_ROLE_FIELD, DRIVER_ROLE_REF_KIND_237, CESSATION_ROLE_237,
} from './lib/expert-237-posture-contract';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-238-final-posture-confirmation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

const judgment = JSON.parse(readFileSync(join(EVID, 'SECTION-238-JUDGMENT.json'), 'utf8')) as any;
const rows = readFileSync(join(EVID, 'RAW-238-FIRST-PASS.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l) as Record<string, any>);

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const perCase = CONFIRMATION_CASES_238.map(c => {
  const row = rows.find(r => r.caseId === c.caseId)!;
  const scored = judgment.perCase.find((s: any) => s.caseId === c.caseId);
  const parsed = row.parsed as Record<string, any>;
  const posture = parsed?.immediateSafetyPosture as Record<string, any> | undefined;
  const basis = Array.isArray(posture?.requiredBy)
    ? posture!.requiredBy as Record<string, any>[] : [];
  const candidateState = new Map((Array.isArray(parsed?.expertHazardCandidates)
    ? parsed.expertHazardCandidates as Record<string, any>[] : [])
    .map(x => [String(x.candidateKey), String(x.assertedConditionState)]));

  /** DIAGNOSTIC ONLY. The posture value present in the raw output, admitted or not. */
  const rawPosture = typeof posture?.posture === 'string' ? posture.posture as string : null;

  const roleMismatches = basis
    .filter(b => typeof b[DRIVER_ROLE_FIELD] === 'string'
      && DRIVER_ROLE_REF_KIND_237[b[DRIVER_ROLE_FIELD] as keyof typeof DRIVER_ROLE_REF_KIND_237]
        !== b.refKind)
    .map(b => ({
      ref: String(b.ref), refKind: String(b.refKind),
      role: String(b[DRIVER_ROLE_FIELD]),
      candidateAssertedConditionState: candidateState.get(String(b.ref)) ?? null,
      /**
       * The distinction that matters for the decision. An UNRESOLVED role on a candidate the model
       * itself marked INSUFFICIENT_EVIDENCE or UNKNOWN is COHERENT and the §237 binding forbids it.
       * The same role on a candidate the model marked ACTIVE is the model contradicting its own two
       * labels, and refusing it is the contract working.
       */
      classification: (candidateState.get(String(b.ref)) === 'INSUFFICIENT_EVIDENCE'
        || candidateState.get(String(b.ref)) === 'UNKNOWN')
        ? 'COHERENT_AND_FORBIDDEN_BY_THE_SECTION_237_BINDING'
        : 'THE_MODEL_OWN_LABELS_DISAGREE',
    }));

  const resumeUnderPermitting = (posture?.posture === 'CONTINUE'
    || posture?.posture === 'CONTINUE_WITH_CONTROLS')
    && isObj(posture?.resumeCondition)
    && (((posture!.resumeCondition as any).resolvedByDeclarationIds?.length ?? 0)
      + ((posture!.resumeCondition as any).correctionsRequired?.length ?? 0)) > 0;

  const codes: string[] = scored.adjudicationPayload.refusalCodes;
  let primaryClass: string; let rootCause: string;
  if (row.failureClass !== 'NO_FAILURE') {
    primaryClass = 'WIRE_OR_PROVIDER_REPRESENTATION';
    rootCause = 'the output did not arrive adjudicably.';
  } else if (codes.includes('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND')) {
    primaryClass = 'CONTRACT_BINDING';
    rootCause = 'a driver role was attached to a reference kind the §237 binding does not permit.';
  } else if (codes.includes('RESUME_CONDITION_UNDER_PERMITTING_POSTURE')) {
    primaryClass = 'POSTURE_OBJECT_COHERENCE';
    rootCause = 'a resume condition was emitted under a posture that permits continued work.';
  } else if (!scored.admissible) {
    primaryClass = 'OTHER_CONTRACT';
    rootCause = `refused on ${codes.join(', ')}.`;
  } else if (scored.postureIdentity === 'INCORRECT'
    || scored.driverRoleIdentity === 'INCORRECT') {
    primaryClass = 'SEMANTIC';
    rootCause = 'an admitted analysis with the wrong posture or the wrong decision-carrying roles.';
  } else {
    primaryClass = 'NO_FAILURE';
    rootCause = 'admitted, exact posture identity, correct decision-carrying roles.';
  }

  return {
    caseId: c.caseId, category: c.category,
    expectedPosture: c.expectedPosture,
    admittedPosture: scored.actualPosture,
    rawPostureDiagnosticOnly: rawPosture,
    rawPostureMatchesFrozenTruth: rawPosture === c.expectedPosture,
    admissible: scored.admissible,
    primaryFailureClass: primaryClass, rootCause,
    refusalCodes: codes,
    roleMismatches,
    resumeUnderPermittingPosture: resumeUnderPermitting,
    expectedRolePresence: c.expectedRolePresence,
    rolesEmitted: basis.map(b => ({ refKind: b.refKind, role: b[DRIVER_ROLE_FIELD], ref: b.ref })),
    cessationRolesEmitted: basis.filter(b => b[DRIVER_ROLE_FIELD] === CESSATION_ROLE_237).length,
    controllingRolesEmitted: basis
      .filter(b => b[DRIVER_ROLE_FIELD] === 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION').length,
    responseRolesEmitted: basis
      .filter(b => b[DRIVER_ROLE_FIELD] === 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP').length,
    distractorKind: c.distractor.kind,
    wireAnomalies: scored.normalization.anomaliesObserved as string[],
    outputTokens: row.outputTokens as number,
  };
});

const byClass = (cl: string): string[] =>
  perCase.filter(p => p.primaryFailureClass === cl).map(p => p.caseId);

const doc = {
  artifact: 'SECTION-238-FAILURE-CLASSIFICATION', version: INSTRUMENT_238_VERSION,
  additiveOnly: true, judgmentModified: false,
  judgmentDigestClassified: sha(readFileSync(join(EVID, 'SECTION-238-JUDGMENT.json'), 'utf8')),
  providerCalls: 0, databaseOperations: 0, remediationPerformed: false,

  classification: {
    NO_FAILURE: byClass('NO_FAILURE'),
    CONTRACT_BINDING: byClass('CONTRACT_BINDING'),
    POSTURE_OBJECT_COHERENCE: byClass('POSTURE_OBJECT_COHERENCE'),
    SEMANTIC: byClass('SEMANTIC'),
    WIRE_OR_PROVIDER_REPRESENTATION: byClass('WIRE_OR_PROVIDER_REPRESENTATION'),
    OTHER_CONTRACT: byClass('OTHER_CONTRACT'),
  },

  theArrivalResult: {
    finding: 'ALL SIX OUTPUTS ARRIVED CLEAN. No envelope, no stringified structured field, no '
      + 'malformed JSON, no absent root field, and the normalizer took no action on any call.',
    wireAnomalyClassesObserved: judgment.arrival.anomalyClassesObserved,
    normalizationsNeeded: perCase.filter(p => p.wireAnomalies.length > 0).length,
    driverRoleArrivedOnEveryBasisEntry: judgment.arrival.driverRoleArrivedOnEveryBasisEntry,
    comparisonWithSection236: 'the §236 field-omission failure did not recur. §236 lost three of '
      + 'nine outputs to an omitted required posture sub-field; §238 lost none, and the driverRole '
      + 'member arrived on every basis entry of every call. Relocating the obligation onto an entry '
      + 'the model already produced correctly did what §237 reasoned it would, and at n=6 that is '
      + 'not a rate.',
  },

  theSemanticResult: {
    finding: 'THE DISTINCTION §238 EXISTS TO TEST WAS MADE CORRECTLY ON ALL SIX CASES.',
    postureValuePresentInEveryRawOutput: perCase.every(p => p.rawPostureDiagnosticOnly !== null),
    rawPostureMatchesFrozenTruthOn: perCase.filter(p => p.rawPostureMatchesFrozenTruth)
      .map(p => p.caseId),
    labelledDiagnosticOnly: true,
    doesNotChangeAnyVerdict: true,
    whyItIsNotTheResult: 'the §238 pass rule requires 6 / 6 admitted and scores the ADMITTED '
      + 'posture. Three analyses were refused and have no admitted posture, so the frozen 3 / 6 '
      + 'stands. A correct posture inside an inadmissible output is still a failure.',
    zeroUnsafeUnderConservative: judgment.requirements.R4_zeroUnsafeUnderConservative.actual,
    zeroOverConservative: judgment.requirements.R5_zeroOverConservative.actual,
    zeroResponseUncertaintyElevated: judgment.requirements.R7_zeroResponseUncertaintyElevated.actual,
    zeroFalseCessationDrivers: judgment.requirements.R8_zeroFalseCessationDrivers.actual,
    zeroMissingCessationDrivers: judgment.missingCessationDrivers.length,
    theTrapsHeld: [
      'A1: a STOP that looks like nothing. Three short cracks in a saw blade were labelled as '
        + 'established conditions requiring cessation and the unavailable extraction measurement '
        + 'did not weaken it.',
      'A2: the §236 C2 distractor placed beside an established STOP. The model did not hold on '
        + 'whether anybody had ordered the part; it labelled the condemned lift as requiring '
        + 'cessation and stopped.',
      'B1: the strong overcorrection trap. Medical oxygen, an unexplained pressure loss, and the '
        + 'model held rather than stopped, with no cessation role anywhere.',
      'C1: the §236 C2 shape on the permissive side. The model labelled the lid-assignment question '
        + 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP and reached CONTINUE_WITH_CONTROLS rather than a hold.',
      'C2: the administrative case. CONTINUE with no basis entries at all and no escalation.',
    ],
  },

  theThreeFailures: {
    B1: {
      code: 'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND',
      whatTheModelDid: 'it put UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION on BOTH its declaration '
        + 'DEC-1 and on its hazard candidate reserve_bank_unexplained_pressure_loss, which it had '
        + 'itself marked INSUFFICIENT_EVIDENCE.',
      classification: 'A §237 CONTRACT-BINDING DEFECT, FOUND BY §238. The §210J condition-state '
        + 'vocabulary contains INSUFFICIENT_EVIDENCE and UNKNOWN, which are exactly an unresolved '
        + 'property represented as a candidate. §237 bound every UNRESOLVED role to declarations '
        + 'only, on the reasoning that an unresolved fact is by definition not established. That '
        + 'reasoning is right about declarations and wrong about candidates, and the model was '
        + 'refused for a coherent statement the contract had no member for.',
      isThisASemanticFailure: false,
      wasTheSemanticJudgmentCorrect: 'YES. The controlling property was identified, the role was '
        + 'right, and the same role was also correctly attached to the declaration.',
    },
    B2: {
      code: 'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND',
      whatTheModelDid: 'the same shape, but the candidate CAND-1-BLADE-FASTENER was marked ACTIVE, '
        + 'not INSUFFICIENT_EVIDENCE.',
      classification: 'DIFFERENT FROM B1 AND IT MUST NOT BE COUNTED AS THE SAME DEFECT. Here the '
        + 'model called a condition ACTIVE, meaning established and present, and then labelled it '
        + 'an unresolved property controlling continuation. Those two labels cannot both be true '
        + 'and refusing the analysis is the contract working as designed.',
      isThisASemanticFailure: 'PARTIALLY. The internal inconsistency is the model\'s, and the '
        + 'posture and the declaration-level role were both correct.',
    },
    C1: {
      code: 'RESUME_CONDITION_UNDER_PERMITTING_POSTURE',
      whatTheModelDid: 'it reached CONTINUE_WITH_CONTROLS with the right controls AND duplicated '
        + 'the control, fitting the hopper lid, into resumeCondition.correctionsRequired.',
      classification: 'POSTURE OBJECT COHERENCE. This is the §234 E2 finding recurring: the schema '
        + 'states that both resume lists must be empty when work may continue, and the model wrote '
        + 'the corrective action into both places. The rule that caught it is the one §235 added '
        + 'and §237 retained, and it is doing exactly what it was added for.',
      isThisASemanticFailure: false,
      wasTheSemanticJudgmentCorrect: 'YES. Posture, controls and the response-uncertainty role were '
        + 'all correct.',
    },
  },

  classificationAgainstTheFourPreregisteredOptions: {
    theFourOptions: NO_FURTHER_EXPERIMENT_LOOP_238.theFourOptions,
    honestReading: 'NONE OF THE FOUR IS SQUARELY ON POINT, AND SAYING SO IS MORE USEFUL THAN '
      + 'FORCING A FIT. All four presuppose that the remaining blocker is a SEMANTIC limitation in '
      + 'the disputed judgment. §238 did not find one. The decision-controlling versus response '
      + 'distinction was made correctly on six of six, both established-property traps stopped, the '
      + 'overcorrection guard held, and no unsafe or over-conservative posture appeared anywhere.',
    whatTheEvidenceActuallyShows: 'the cohort failed on THREE CONTRACT DEFECTS, two of them in the '
      + '§237 role binding written one slice ago and one a posture-object coherence error the '
      + 'existing rules caught. That is a different kind of problem from the one the four options '
      + 'were written for.',
    whyThisIsNotAnArgumentToProceed: 'the §238 pass rule is conjunctive and three of six analyses '
      + 'were inadmissible. The product requires a reliable admissible representation as well as a '
      + 'reliable semantic decision, and half this cohort did not deliver one. §238 fails.',
    whatTheProductOwnerNowHasToDecide: 'whether a contract-binding defect found by the confirmation '
      + 'that was meant to close the phase counts as the semantic blocker the four options address, '
      + 'or as a separate and smaller repair. That is a scope judgment and it is not the '
      + 'engineering session\'s to make.',
    noRemediationPerformed: true,
    noPromptTuningOrMicroCohortStarted: true,
  },

  perCase,
};

writeFileSync(join(EVID, 'SECTION-238-FAILURE-CLASSIFICATION.json'),
  JSON.stringify(doc, null, 2) + '\n');

console.log('§238 FAILURE CLASSIFICATION WRITTEN — 0 provider calls, 0 database operations');
for (const [k, v] of Object.entries(doc.classification)) {
  const a = v as string[];
  if (a.length > 0) console.log(`  ${k.padEnd(34)} ${a.length}  ${a.join(' ')}`);
}
console.log(`  wire anomalies across all six calls: ${JSON.stringify(doc.theArrivalResult.wireAnomalyClassesObserved)}`);
console.log(`  raw posture matches frozen truth on: ${doc.theSemanticResult.rawPostureMatchesFrozenTruthOn.join(' ')} (diagnostic only)`);
