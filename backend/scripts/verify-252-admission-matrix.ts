/**
 * §252 -- THE STRUCTURAL ADMISSION MATRIX. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * A finite set of representative malformed provider outputs, each with a PREREGISTERED expected
 * disposition, run through the real production admission path. No fixture may be resolved by
 * semantic inference, and none is repaired to make a row pass.
 *
 * The valid baseline is built once and every malformed fixture is a NAMED MUTATION of it, so each
 * row differs from the admitted output in exactly the one respect it is testing.
 */
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import {
  closeObjectNodes252, conformsToContract252, agreesWithSection235,
  admissionIdentity252, type AdmissionOutcome252,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-252-structural-admission';
import { admitThroughProductionPath } from './lib/expert-252-replay-path';
import { buildExpert247WireSchema } from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import { buildExpert239WireSchema } from '../src/safescope-v2/expert-hazlenz/contract/expert-239-posture-contract';
import { governedBindingFor } from '../src/safescope-v2/expert-hazlenz/contract/expert-first-pass-instruction-vnext';
import { applyStrictSchemaWrapper } from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-252-nonstrict-admission-architecture-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ---------------------------------------------------------------- the analysis context

export const OBS_TEXT =
  'A mobile elevating work platform is being operated on a slab whose loading capacity the site '
  + 'file does not record. The outriggers are deployed on spreader plates and a banksman is posted.';
export const OBS = { sourceId: 'obs-252', text: OBS_TEXT };

export const INPUT: any = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'ANL-252-MATRIX',
  authoritativeSources: [{ sourceId: OBS.sourceId, kind: 'OBSERVATION', text: OBS.text }],
  inspectionContext: { location: null, task: null },
  jurisdiction: 'GB',
  allowedHazardFamilies: ['WORK_AT_HEIGHT'],
  deterministicFindings: [], familyDispositions: [], governedStandards: [],
  answeredClarifications: [],
};

export const WIRE_SCHEMA = buildExpert247WireSchema(INPUT, governedBindingFor([]));

// ---------------------------------------------------------------- the valid baseline

const CONTROL_TEXT = 'confirm the slab loading capacity with the structural engineer before '
  + 'the platform is repositioned';
/**
 * §259. Controls carry an identity and `dischargingControlRef` names it. Before §259 the reference
 * reproduced CONTROL_TEXT verbatim, which is the H4 mechanism. The BASELINE moves to the successor
 * representation; not one expected disposition below changes.
 */
const CONTROL_ID = 'ctl-slab-capacity';

export function validOutput(): any {
  return {
    expertHazardCandidates: [{
      candidateKey: 'mewp-slab-capacity',
      hazardFamily: 'WORK_AT_HEIGHT',
      assertedConditionState: 'ACTIVE',
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: OBS.sourceId, quotedText: 'The outriggers are deployed on spreader plates' }],
      evidenceBasis: 'the observation states the outriggers are deployed on spreader plates',
      reasoning: 'a platform on a slab of unrecorded capacity is an exposure that persists while '
        + 'the work continues',
      confidence: 'MODERATE',
      relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC',
      requiresUserConfirmation: false,
    }],
    decisionCriticalClarifications: [],
    crossHazardInsights: [],
    disagreements: [],
    expertExplanation: { summary: 'the platform may continue under a control while the slab '
      + 'capacity is confirmed' },
    uncertainty: { statements: ['the slab loading capacity is not recorded in the site file'] },
    outcome: 'ANALYZED',
    unresolvedFactDeclarations: [{
      declarationId: 'slab-capacity-unrecorded',
      missingFact: 'the recorded loading capacity of the slab',
      observationSourceId: OBS.sourceId,
      observationSpan: 'a slab whose loading capacity the site file does not record',
      notEstablishedBecause: 'the site file carries no capacity entry for this slab',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the slab capacity exceeds the laden weight of the platform',
      decisionIfA: 'the platform may continue to be operated on the slab as positioned',
      branchB: 'the slab capacity is below the laden weight of the platform',
      decisionIfB: 'the platform is moved off the slab before further operation',
      whyNecessaryNow: 'the platform is on the slab now and the capacity decides whether it may stay',
      decisionWhileUnresolved: 'keep the platform on spreader plates and do not reposition it until '
        + 'the capacity is confirmed',
    }],
    immediateSafetyPosture: {
      posture: 'CONTINUE_WITH_CONTROLS',
      requiredBy: [
        {
          ref: 'mewp-slab-capacity',
          refKind: 'HAZARD_CANDIDATE',
          driverRole: 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS',
          roleJustification: {
            epistemicCharacter: 'ESTABLISHED_CONDITION',
            factualBasis: 'the observation states the outriggers are deployed on spreader plates '
              + 'and a banksman is posted',
            unresolvedElement: null,
            whyDecisionMaterial: 'whether a control is required now for the platform on this slab',
            whyControllingNotFollowUp: 'without the control the platform could be repositioned onto '
              + 'an unverified part of the slab during this shift',
            alongsideControlConsidered: null,
            whyAlongsideControlInsufficient: null,
            dischargingControlRef: CONTROL_ID,
          },
        },
        {
          ref: 'slab-capacity-unrecorded',
          refKind: 'UNRESOLVED_DECLARATION',
          driverRole: 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP',
          roleJustification: {
            epistemicCharacter: 'FOLLOW_UP_NON_CONTROLLING',
            factualBasis: 'the site file carries no capacity entry for this slab',
            unresolvedElement: 'the recorded loading capacity of the slab',
            whyDecisionMaterial: 'the recorded capacity decides whether repositioning is permitted',
            whyControllingNotFollowUp: 'the platform is stable as positioned, so what changes is '
              + 'which action is taken next rather than whether work continues',
            alongsideControlConsidered: null,
            whyAlongsideControlInsufficient: null,
            dischargingControlRef: null,
          },
        },
      ],
      acceptedWithoutImmediateAction: [],
      requiredControls: [{ controlId: CONTROL_ID, control: CONTROL_TEXT, timing: 'BEFORE_WORK_RESUMES' }],
      resumeCondition: { resolvedByDeclarationIds: [], correctionsRequired: [] },
      whatHappensNow: 'the platform continues on spreader plates and the slab capacity is confirmed '
        + 'with the structural engineer before it is repositioned',
    },
  };
}

// ---------------------------------------------------------------- fixtures

const clone = (o: any): any => JSON.parse(JSON.stringify(o));

export interface Fixture {
  id: string; shape: string; expected: AdmissionOutcome252; why: string; build: () => any;
  /** Declaration-level refusals the contract requires this fixture to contain and report. */
  containedDeclarationRefusals?: number;
}

export const FIXTURES: Fixture[] = [
  { id: 'F00', shape: 'valid complete output', expected: 'ADMIT',
    why: 'the baseline every other fixture mutates; if this does not admit the matrix proves nothing',
    build: () => validOutput() },

  { id: 'F01', shape: 'missing required top-level field', expected: 'REFUSE',
    why: 'a required root field is absent; nothing is supplied for it',
    build: () => { const o = clone(validOutput()); delete o.outcome; return o; } },

  { id: 'F02', shape: 'null where forbidden', expected: 'REFUSE',
    why: 'the contract declares a string and the output carries null',
    build: () => { const o = clone(validOutput()); o.immediateSafetyPosture.whatHappensNow = null; return o; } },

  { id: 'F03', shape: 'wrong primitive type', expected: 'REFUSE',
    why: 'a boolean field arrives as a string',
    build: () => { const o = clone(validOutput());
      o.expertHazardCandidates[0].requiresUserConfirmation = 'no'; return o; } },

  { id: 'F04', shape: 'unknown enum member', expected: 'REFUSE',
    why: 'a candidate state outside the governed vocabulary',
    build: () => { const o = clone(validOutput());
      o.expertHazardCandidates[0].assertedConditionState = 'PROBABLY_FINE'; return o; } },

  { id: 'F05', shape: 'invalid K6 role/carrier pair', expected: 'REFUSE',
    why: 'the follow-up role on a hazard candidate is one of the four inadmissible pairs',
    build: () => { const o = clone(validOutput());
      o.immediateSafetyPosture.requiredBy[1].refKind = 'HAZARD_CANDIDATE';
      o.immediateSafetyPosture.requiredBy[1].ref = 'mewp-slab-capacity'; return o; } },

  { id: 'F06', shape: 'malformed roleJustification', expected: 'REFUSE',
    why: 'the justification is a string rather than the structured object the contract declares',
    build: () => { const o = clone(validOutput());
      o.immediateSafetyPosture.requiredBy[0].roleJustification = 'because the slab is unverified';
      return o; } },

  { id: 'F07', shape: 'missing decision-critical justification member', expected: 'REFUSE',
    why: 'whyDecisionMaterial is absent from a justification the contract requires it in',
    build: () => { const o = clone(validOutput());
      delete o.immediateSafetyPosture.requiredBy[0].roleJustification.whyDecisionMaterial;
      return o; } },

  { id: 'F08', shape: 'invalid driver-role reference', expected: 'REFUSE',
    why: 'a basis entry names a candidateKey and a declarationId that do not exist',
    build: () => { const o = clone(validOutput());
      o.immediateSafetyPosture.requiredBy[0].ref = 'no-such-candidate'; return o; } },

  { id: 'F09', shape: 'inconsistent posture / driver relation', expected: 'REFUSE',
    why: 'a cessation driver under a posture that permits continued work',
    build: () => { const o = clone(validOutput());
      const e = o.immediateSafetyPosture.requiredBy[0];
      e.driverRole = 'ESTABLISHED_CONDITION_REQUIRING_CESSATION';
      e.roleJustification.alongsideControlConsidered = 'the banksman posted at the platform';
      e.roleJustification.whyAlongsideControlInsufficient = 'a banksman does not change what the '
        + 'slab will carry';
      e.roleJustification.dischargingControlRef = null;
      return o; } },

  { id: 'F10', shape: 'missing required-control target', expected: 'REFUSE',
    why: 'a controls driver names a discharging control that is not among the model\'s own controls',
    build: () => { const o = clone(validOutput());
      o.immediateSafetyPosture.requiredBy[0].roleJustification.dischargingControlRef =
        'a control the analysis never wrote'; return o; } },

  /**
   * Expected ADMIT, derived from the contract rather than from the run. `DUPLICATE_DECLARATION_ID`
   * refuses the SECOND copy only; the first is admitted and carries the property into canonical
   * state, so no unresolved truth is lost and there is nothing for RR-7 to preserve. The duplicate
   * is contained at the declaration level and reported, which is what the contained-refusal
   * assertion below checks, so this row cannot pass vacuously.
   */
  { id: 'F11', shape: 'duplicate declaration identity', expected: 'ADMIT',
    containedDeclarationRefusals: 1,
    why: 'the second copy is refused as DUPLICATE_DECLARATION_ID and contained; the first copy '
      + 'already carries the identified property into canonical state, so nothing is lost and '
      + 'nothing is preserved',
    build: () => { const o = clone(validOutput());
      o.unresolvedFactDeclarations.push(clone(o.unresolvedFactDeclarations[0])); return o; } },

  { id: 'F12', shape: 'malformed evidence relationship', expected: 'REFUSE',
    why: 'a candidate evidence member is missing its quotedText',
    build: () => { const o = clone(validOutput());
      delete o.expertHazardCandidates[0].evidence[0].quotedText; return o; } },

  { id: 'F13', shape: 'malformed authority-bearing field', expected: 'PRESERVE_UNRESOLVED',
    why: 'the declaration names a source id no supplied source carries, so the declaration cannot '
      + 'be admitted; the identified property survives',
    build: () => { const o = clone(validOutput());
      o.unresolvedFactDeclarations[0].observationSpan = 'a span that was never observed'; return o; } },

  { id: 'F14', shape: 'placeholder / no-content result', expected: 'REFUSE',
    why: 'the §243 C7 and M5 shape: a tool input whose only key is a schema artifact',
    build: () => ({ $PARAMETER_NAME: 'value' }) },

  { id: 'F15', shape: 'truncated partial object', expected: 'REFUSE',
    why: 'generation stopped mid-analysis; the posture and three root fields never arrived',
    build: () => { const o = clone(validOutput());
      delete o.immediateSafetyPosture; delete o.unresolvedFactDeclarations;
      delete o.uncertainty; delete o.outcome; return o; } },

  { id: 'F16', shape: 'undeclared property injected', expected: 'REFUSE',
    why: 'a property the contract does not declare, which non-strict transport no longer refuses',
    build: () => { const o = clone(validOutput());
      o.immediateSafetyPosture.overrideApproval = 'granted'; return o; } },

  { id: 'F17', shape: 'structured field transported as a JSON string', expected: 'ADMIT',
    why: 'a container anomaly §235 can undo with certainty; the content is untouched and the '
      + 'unwrapped value satisfies the contract exactly',
    build: () => { const o = clone(validOutput());
      o.expertHazardCandidates = JSON.stringify(o.expertHazardCandidates); return o; } },
];

// ---------------------------------------------------------------- run

async function main(): Promise<void> {
  const rows: any[] = [];
  for (const f of FIXTURES) {
    const raw = f.build();
    // Admitted through the REAL production entry point, never through a local reassembly.
    const { result: r } = await admitThroughProductionPath({
      input: INPUT, observation: OBS, toolInput: raw,
    });
    const containedExpected = f.containedDeclarationRefusals ?? null;
    const containedOk = containedExpected === null
      || r.declarationRefusals.length === containedExpected;
    rows.push({
      id: f.id, shape: f.shape, expected: f.expected, observed: r.admission,
      expectedContainedDeclarationRefusals: containedExpected,
      observedContainedDeclarationRefusals: r.declarationRefusals.length,
      pass: r.admission === f.expected && containedOk, why: f.why,
      status: r.status,
      conformanceCodes: [...new Set(r.conformanceViolations.map(v => v.code))],
      postureCodes: r.postureRefusalCodes,
      roleJustificationCodes: r.roleJustificationCodes,
      declarationRefusalCodes: [...new Set(r.declarationRefusals.flatMap(d => d.codes))],
      semanticInventions: r.semanticInventions,
      admittedFactCount: r.admittedFacts.length,
      fixtureSha: sha(JSON.stringify(raw)),
    });
  }

  // ---- the two validators must not have drifted apart on the subset §235 models.
  const s239 = buildExpert239WireSchema(INPUT, governedBindingFor([]));
  const closed239 = closeObjectNodes252(s239);
  const agreementProbes = FIXTURES.map(f => ({
    id: f.id, agrees: agreesWithSection235(f.build(), closed239),
  }));

  // ---- schema closure must be exactly what the transport's own strict wrapper produces.
  const closureMatchesTransport =
    JSON.stringify(closeObjectNodes252(WIRE_SCHEMA)) === JSON.stringify(applyStrictSchemaWrapper(WIRE_SCHEMA));

  const failures = rows.filter(r => !r.pass);
  const inventions = rows.reduce((a, r) => a + r.semanticInventions.length, 0);
  const unsafeAdmitted = rows.filter(r => r.observed === 'ADMIT' && r.expected !== 'ADMIT');

  const doc = {
    section: '252', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    admissionIdentity: admissionIdentity252(),
    admittedThrough: 'runExpertHazLenzAnalysis, the production entry point',
    wireSchemaSha: sha(JSON.stringify(WIRE_SCHEMA)),
    closedSchemaSha: sha(JSON.stringify(closeObjectNodes252(WIRE_SCHEMA))),
    closureMatchesTransportStrictWrapper: closureMatchesTransport,
    validatorAgreementWithSection235: {
      probes: agreementProbes.length,
      disagreements: agreementProbes.filter(a => !a.agrees).map(a => a.id),
      note: 'run against the §239 schema, which carries no union and no nullable field, so it is '
        + 'entirely inside the subset §235 models. A disagreement would mean §252 is a second and '
        + 'laxer standard rather than a superset.',
    },
    summary: {
      fixtures: rows.length,
      passed: rows.length - failures.length,
      failed: failures.length,
      unsafeMalformedOutputsAdmitted: unsafeAdmitted.length,
      semanticInventionEvents: inventions,
      allGreen: failures.length === 0 && inventions === 0 && closureMatchesTransport
        && agreementProbes.every(a => a.agrees),
    },
    rows,
  };
  writeFileSync(join(OUT, 'SECTION-252-ADMISSION-MATRIX.json'), JSON.stringify(doc, null, 2));

  for (const r of rows) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id}  expected=${r.expected.padEnd(19)} `
      + `observed=${String(r.observed).padEnd(19)} ${r.shape}`);
    if (!r.pass) {
      console.log(`        conformance=${JSON.stringify(r.conformanceCodes)}`);
      console.log(`        posture=${JSON.stringify(r.postureCodes)}`);
      console.log(`        justification=${JSON.stringify(r.roleJustificationCodes)}`);
      console.log(`        declarations=${JSON.stringify(r.declarationRefusalCodes)} preserved=${r.preservedUnresolvedCount}`);
    }
  }
  console.log(`\nfixtures=${rows.length} failed=${failures.length} `
    + `unsafeAdmitted=${unsafeAdmitted.length} inventions=${inventions} `
    + `closureMatchesTransport=${closureMatchesTransport} `
    + `validatorDisagreements=${doc.validatorAgreementWithSection235.disagreements.length}`);
  if (!doc.summary.allGreen) process.exitCode = 1;
}
if (require.main === module) void main();
