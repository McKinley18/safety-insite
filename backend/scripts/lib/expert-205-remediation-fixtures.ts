/**
 * §205 -- LOCAL REMEDIATION TEST MATRIX. FIFTEEN DEVELOPMENT FIXTURES.
 * DEVELOPMENT ONLY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHAT THESE FIXTURES ARE, AND WHAT THEY ARE NOT ====================
 *
 * THEY ARE hand-written deterministic inputs that exercise the §205 code paths: the projection, the
 * RR-7 preservation boundary, the RR-4 annotation audit, the T1 append machinery, and the governed
 * transport construction. Every assertion made against them is about DETERMINISTIC BEHAVIOUR --
 * does the boundary refuse this, does the record preserve that, does the view derive to those bytes.
 *
 * THEY ARE NOT model output, and NO HOSTED BEHAVIOUR CLAIM MAY BE MADE FROM THEM. A fixture that
 * "shows the third verification state" shows that the representation can carry it; it shows nothing
 * whatever about whether a model will produce it. That question is what the fresh acceptance cohort
 * exists for, and answering it from these fixtures would be the fitting error §204 already warned
 * about. `HOSTED_BEHAVIOUR_CLAIMS_PERMITTED` is `false` and the suite asserts it.
 *
 * THEY ARE NOT the acceptance cohort. They carry no frozen truth specification, no product-owner
 * review, and no adjudication instrument. See `expert-205-acceptance-cohort.ts`.
 */

import type {
  ProjectionInput, ProjectionSource, StructuredUnresolvedFactDeclaration,
} from './expert-first-pass-owed-fact-projection';
import type { AnnotatedFactFixture } from './expert-205-property-preservation-audit';

export const REMEDIATION_FIXTURES_205_VERSION =
  'hazlenz.expert.205.remediation-fixtures.v1' as const;

export const HOSTED_BEHAVIOUR_CLAIMS_PERMITTED = false;
export const FIXTURE_SCOPE_STATEMENT =
  'These fixtures exercise deterministic code paths only. They establish nothing about what a '
  + 'model will emit, and no §205 result derived from them may be reported as hosted behaviour.';

// ---------------------------------------------------------------- sources

const SRC = (sourceId: string, text: string): ProjectionSource => ({ sourceId, text });

export const FIXTURE_SOURCES: readonly ProjectionSource[] = [
  SRC('OBS-R1', 'Confined space entry at the pump pit. A permit was displayed at the entry point '
    + 'and an attendant was standing at the opening. The inspector could not establish whether a '
    + 'rescue winch was rigged, nor whether the atmosphere had been tested since the pump was '
    + 'opened.'),
  SRC('OBS-R2', 'Portable ladder in the stores aisle, footed on a level concrete floor and tied at '
    + 'the stile. The ladder carried a current inspection tag. No work was in progress at the time '
    + 'of the visit.'),
  SRC('OBS-R3', 'Electrical panel maintenance. The isolator is off and a personal padlock is '
    + 'fitted. A voltage test was carried out at the point of work after isolation. The tester was '
    + 'not proved on a known live source before or after the test.'),
  SRC('OBS-R4', 'Overhead crane in the fabrication bay. The brake was adjusted last week. The '
    + 'inspector could not establish whether a load test was carried out before the crane was '
    + 'returned to use.'),
  SRC('OBS-R5', 'Solvent wiping at the parts bench. A local exhaust hood is fitted and the fan is '
    + 'running. Operators wipe at a position about 600 mm forward of the hood face. Nobody present '
    + 'could say whether the hood draws vapour away from that position.'),
  SRC('OBS-R6', 'Warehouse aisle. A counterbalance forklift was operating in the aisle. There is '
    + 'no marked pedestrian walkway and no barrier at either end. No pedestrians were seen during '
    + 'the ten minutes observed. The supervisor said pedestrian access depends on the job.'),
  SRC('OBS-R7', 'Guarded press in the toolroom. The interlocked gate was closed and the green '
    + 'status lamp was lit. The interlock switch was not accessible for inspection and no '
    + 'functional test history was available.'),
  SRC('OBS-R8', 'Bench grinder in the maintenance shop. The tool rest is set 2 mm from the wheel '
    + 'and the eye shield is fitted and clear. The wheel carries a current dressing record.'),
];

const decl = (d: Partial<StructuredUnresolvedFactDeclaration> & { declarationId: string })
  : Record<string, unknown> => ({
    missingFact: '', observationSourceId: '', observationSpan: '', notEstablishedBecause: '',
    affectedDecision: 'REQUIRED_CONTROL', branchA: '', decisionIfA: '', branchB: '',
    decisionIfB: '', whyNecessaryNow: '', governedEvidenceSourceIds: [], ...d,
  });

// ---------------------------------------------------------------- the fifteen cases

export const FIXTURE_IDS = [
  'FX-01_INDEPENDENT_TWO_GAP_RECALL',
  'FX-02_DECISION_NEUTRAL_UNKNOWN_WITH_TEMPTING_ADVERSE_HYPOTHETICAL',
  'FX-03_VERIFICATION_PERFORMED_AND_PASSED',
  'FX-04_VERIFICATION_NOT_PERFORMED',
  'FX-05_VERIFICATION_PERFORMED_AND_FAILED_TO_ESTABLISH',
  'FX-06_TEMPORAL_BEFORE_RETURN_TO_USE',
  'FX-07_CONJUNCTIVE_TWO_COMPONENT_PROPERTY',
  'FX-08_DOWNSTREAM_OVERREACH_POSITIVE_BRANCH',
  'FX-09_DOWNSTREAM_OVERREACH_NEGATIVE_BRANCH',
  'FX-10_VALID_SEMANTIC_FACT_MALFORMED_CONTRACT',
  'FX-11_EXPOSURE_NOT_OBSERVED_IS_NOT_ABSENT',
  'FX-12_ORDINARY_NON_ESCALATING_CONTROL',
  'FX-13_GOVERNED_CAPABILITY_ABSENT_REQUEST',
  'FX-14_GOVERNED_CAPABILITY_PRESENT_REQUEST',
  'FX-15_REPEATED_RECORD_ADDITIVE_APPEND_INTEGRITY',
] as const;
export type FixtureId = (typeof FIXTURE_IDS)[number];

/** What each fixture is FOR. `expectation` is about deterministic behaviour, never about a model. */
export interface RemediationFixture {
  readonly fixtureId: FixtureId;
  readonly exercises: readonly string[];
  readonly projection: ProjectionInput | null;
  readonly expectation: string;
  /** Fixtures 13-15 exercise transport and tooling, not the projection. */
  readonly kind: 'PROJECTION' | 'TRANSPORT' | 'TOOLING';
}

const base = (declarations: readonly Record<string, unknown>[]): ProjectionInput => ({
  declarations, sources: FIXTURE_SOURCES, suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
});

export const REMEDIATION_FIXTURES: readonly RemediationFixture[] = [
  {
    fixtureId: 'FX-01_INDEPENDENT_TWO_GAP_RECALL',
    exercises: ['RR-1', 'F1'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r1-rescue',
        missingFact: 'Whether a rescue winch was rigged for the confined space entry',
        observationSourceId: 'OBS-R1',
        observationSpan: 'could not establish whether a rescue winch was rigged',
        notEstablishedBecause: 'The observation records that the inspector could not establish it.',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'A rescue winch is rigged and ready at the entry point',
        decisionIfA: 'Entry may continue under the existing rescue arrangement',
        branchB: 'No rescue winch is rigged',
        decisionIfB: 'Entry stops until a rescue arrangement is in place and proved',
        whyNecessaryNow: 'A person is in the space now and rescue capability decides whether entry '
          + 'may continue.',
      }),
      decl({
        declarationId: 'r1-atmosphere',
        missingFact: 'Whether the atmosphere was tested since the pump was opened',
        observationSourceId: 'OBS-R1',
        observationSpan: 'nor whether the atmosphere had been tested since the pump was opened',
        notEstablishedBecause: 'The observation records that the inspector could not establish it.',
        affectedDecision: 'EXPOSURE',
        branchA: 'The atmosphere was tested after the pump was opened and was within limits',
        decisionIfA: 'Entry may continue under the existing atmospheric controls',
        branchB: 'The atmosphere has not been tested since the pump was opened',
        decisionIfB: 'Entry stops until the atmosphere is tested at the breathing zone',
        whyNecessaryNow: 'Opening the pump can change the atmosphere and a person is inside now.',
      }),
    ]),
    expectation: 'BOTH declarations are admitted as separate facts with distinct factKeys. The '
      + 'projection never merges two independent declarations, and RR-7 preservation reports '
      + 'safetyStateComplete = true because nothing was refused.',
  },
  {
    fixtureId: 'FX-02_DECISION_NEUTRAL_UNKNOWN_WITH_TEMPTING_ADVERSE_HYPOTHETICAL',
    exercises: ['RR-2A', 'F2'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r2-neutral',
        missingFact: 'Whether the ladder was inspected by a competent person',
        observationSourceId: 'OBS-R2',
        observationSpan: 'The ladder carried a current inspection tag',
        notEstablishedBecause: 'The tag does not name who applied it.',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'The inspection was carried out by a competent person',
        decisionIfA: 'The ladder remains in service',
        branchB: 'The inspection was carried out by a competent person',
        decisionIfB: 'The ladder remains in service',
        whyNecessaryNow: 'The ladder is in the aisle.',
      }),
    ]),
    expectation: 'The declaration is REFUSED: branchA and branchB are identical and the two '
      + 'decisions do not diverge, which is exactly what a manufactured gap looks like at the '
      + 'boundary. RR-7 preservation classifies it PRESERVED_STRUCTURALLY_INVALID because a '
      + 'property was named — the refusal is visible, and the reviewer sees a manufactured gap '
      + 'rather than an invented fact.',
  },
  {
    fixtureId: 'FX-03_VERIFICATION_PERFORMED_AND_PASSED',
    exercises: ['RR-3 state 2'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r3-proved',
        missingFact: 'Whether the voltage tester was proved on a known live source, so that the '
          + 'dead reading actually established a de-energised condition',
        observationSourceId: 'OBS-R3',
        observationSpan: 'The tester was not proved on a known live source before or after the test',
        notEstablishedBecause: 'The observation states the tester was not proved, so the test '
          + 'result does not establish the condition it appears to establish.',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'The tester was proved and the circuit was established as de-energised',
        decisionIfA: 'Work at the point of work may continue under the existing isolation',
        branchB: 'The tester was not proved, so the de-energised condition is not established',
        decisionIfB: 'Work stops until the circuit is re-proved with a proved tester',
        whyNecessaryNow: 'The enclosure is open and the reading is currently being relied on.',
      }),
    ]),
    expectation: 'Admitted. The branch pair distinguishes "established" from "not established" '
      + 'rather than "tested" from "not tested" — the RR-3 state-3 distinction carried in the '
      + 'representation.',
  },
  {
    fixtureId: 'FX-04_VERIFICATION_NOT_PERFORMED',
    exercises: ['RR-3 state 1'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r4-nottested',
        missingFact: 'Whether a load test was carried out before the crane was returned to use',
        observationSourceId: 'OBS-R4',
        observationSpan: 'could not establish whether a load test was carried out before the crane '
          + 'was returned to use',
        notEstablishedBecause: 'The observation records that the inspector could not establish it.',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'A load test was carried out before return to use and the brake held',
        decisionIfA: 'The crane remains in service under the existing brake adjustment',
        branchB: 'No load test was carried out before the crane was returned to use',
        decisionIfB: 'The crane is taken out of service until a load test is carried out',
        whyNecessaryNow: 'The crane is in use now and the brake was adjusted last week.',
      }),
    ]),
    expectation: 'Admitted, and the BEFORE-return-to-use qualifier is present in evidenceSpan, both '
      + 'branches and both decisions — i.e. in fields that reach the verifier.',
  },
  {
    fixtureId: 'FX-05_VERIFICATION_PERFORMED_AND_FAILED_TO_ESTABLISH',
    exercises: ['RR-3 state 3', 'F4'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r5-failed',
        missingFact: 'Whether the load test that was carried out actually established that the '
          + 'brake holds the rated load',
        observationSourceId: 'OBS-R4',
        observationSpan: 'The brake was adjusted last week',
        notEstablishedBecause: 'Adjustment records the work done, not the result the test produced.',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'The test was carried out and established that the brake holds the rated load',
        decisionIfA: 'The crane remains in service on the strength of that result',
        branchB: 'The test was carried out and did NOT establish that the brake holds the rated load',
        decisionIfB: 'The crane is taken out of service pending brake repair and re-test',
        whyNecessaryNow: 'Loads are being lifted over the bay now.',
      }),
    ]),
    expectation: 'Admitted. This is the state §204 F4 showed missing from SF-08: performed-and-'
      + 'did-not-establish is representable and distinguishable from not-performed (FX-04).',
  },
  {
    fixtureId: 'FX-06_TEMPORAL_BEFORE_RETURN_TO_USE',
    exercises: ['RR-4', 'F3'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r6-temporal',
        missingFact: 'Whether the load test was carried out BEFORE the crane was returned to use',
        observationSourceId: 'OBS-R4',
        observationSpan: 'before the crane was returned to use',
        notEstablishedBecause: 'The sequence is not established by the observation.',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'The load test preceded the return to use',
        decisionIfA: 'The crane remains in service; the sequence is satisfied',
        branchB: 'The crane was returned to use before any load test',
        decisionIfB: 'The crane is taken out of service until tested, and the return-to-use '
          + 'procedure is reviewed',
        whyNecessaryNow: 'The crane is lifting now under a brake adjusted last week.',
      }),
    ]),
    expectation: 'Admitted, and the RR-4 audit finds the BEFORE_AFTER_SEQUENCING qualifier carried '
      + 'by evidenceSpan, branchA, branchB and both decisions — all verifier-visible. This is the '
      + 'SF-06 mechanism with the qualifier surviving.',
  },
  {
    fixtureId: 'FX-07_CONJUNCTIVE_TWO_COMPONENT_PROPERTY',
    exercises: ['RR-1 boundary', 'S5 preservation'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r7-conjunctive',
        missingFact: 'Whether the press interlock both stops hazardous motion when the gate opens '
          + 'and prevents restart while the gate is open',
        observationSourceId: 'OBS-R7',
        observationSpan: 'The interlock switch was not accessible for inspection and no functional '
          + 'test history was available',
        notEstablishedBecause: 'Neither component of the protective function is established by the '
          + 'closed gate or the lit lamp.',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'The interlock both stops motion on opening and prevents restart while open',
        decisionIfA: 'The press remains in service under the existing guard arrangement',
        branchB: 'The interlock fails either to stop motion on opening or to prevent restart',
        decisionIfB: 'The press is taken out of service until the interlock function is proved',
        whyNecessaryNow: 'The press is in production use now.',
      }),
    ]),
    expectation: 'Admitted as ONE fact with both components, per RR-1: a property whose parts must '
      + 'both hold is one fact, not two. The contrast with FX-01 is the point of the pair.',
  },
  {
    fixtureId: 'FX-08_DOWNSTREAM_OVERREACH_POSITIVE_BRANCH',
    exercises: ['RR-2B', 'F7 (SF-07 shape)'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r8-overreach-a',
        missingFact: 'Whether the local exhaust hood captures vapour at the actual wiping position',
        observationSourceId: 'OBS-R5',
        observationSpan: 'Nobody present could say whether the hood draws vapour away from that '
          + 'position',
        notEstablishedBecause: 'Capture effectiveness at the work position is not established by a '
          + 'running fan.',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'Measurement establishes effective capture at the wiping position',
        decisionIfA: 'The existing LEV arrangement continues and no additional respiratory or '
          + 'engineering control of any kind is required for this task',
        branchB: 'Measurement establishes that effective capture does not reach that position',
        decisionIfB: 'Wiping stops or relocates until capture is achieved and re-verified',
        whyNecessaryNow: 'Operators are wiping with a ketone-based cleaner now.',
      }),
    ]),
    expectation: 'STRUCTURALLY ADMITTED — and that is the finding. The boundary cannot detect '
      + 'downstream overreach, because "no additional control of any kind is required" is a '
      + 'well-formed diverging decision. F7 is therefore reachable ONLY by the RR-2B instruction '
      + 'and by adjudication, never by deterministic code. Recorded as a stated residual limit.',
  },
  {
    fixtureId: 'FX-09_DOWNSTREAM_OVERREACH_NEGATIVE_BRANCH',
    exercises: ['RR-2B', 'F7 (SF-11 shape)'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r9-overreach-b',
        missingFact: 'Whether pedestrians enter the aisle while the forklift is operating',
        observationSourceId: 'OBS-R6',
        observationSpan: 'The supervisor said pedestrian access depends on the job',
        notEstablishedBecause: 'A variable policy does not establish whether entry occurs during '
          + 'forklift operation.',
        affectedDecision: 'EXPOSURE',
        branchA: 'Pedestrians do enter the aisle during forklift operation',
        decisionIfA: 'Segregation or a controlled crossing is required before forklift work '
          + 'continues in the aisle',
        branchB: 'Pedestrians do not enter the aisle while the forklift is operating',
        decisionIfB: 'The exposure pathway is controlled by procedure and the missing barrier '
          + 'becomes a low-priority gap',
        whyNecessaryNow: 'The forklift is operating in the aisle now.',
      }),
    ]),
    expectation: 'STRUCTURALLY ADMITTED, same as FX-08 and for the same reason. The pair proves F7 '
      + 'is symmetric across branch sides and is not a boundary-enforceable defect.',
  },
  {
    fixtureId: 'FX-10_VALID_SEMANTIC_FACT_MALFORMED_CONTRACT',
    exercises: ['RR-7', 'F8 — the SF-05 signature'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r10-sf05-shape',
        missingFact: 'Whether opening the interlocked gate actually stops hazardous motion',
        observationSourceId: 'OBS-R7',
        observationSpan: 'The interlock switch was not accessible for inspection',
        notEstablishedBecause: 'A closed gate and a lit lamp do not establish the protective '
          + 'function.',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'Opening the gate stops hazardous motion',
        decisionIfA: '',
        branchB: 'Opening the gate does not stop hazardous motion',
        decisionIfB: '',
        whyNecessaryNow: 'The press is in production use now.',
      }),
    ]),
    expectation: 'REFUSED REQUIRED_FIELD_MISSING ×2 — byte-for-byte the SF-05 failure. Under §204 '
      + 'this row admitted nothing and the safety question vanished. Under RR-7: facts = 0, '
      + 'preserved = 1, safetyStateComplete = FALSE, totalLossOnThisRow = TRUE, and the identified '
      + 'property is carried verbatim with decisionIfA/decisionIfB reported ABSENT and never '
      + 'invented.',
  },
  {
    fixtureId: 'FX-11_EXPOSURE_NOT_OBSERVED_IS_NOT_ABSENT',
    exercises: ['S8 preservation', 'EXPOSURE coverage'],
    kind: 'PROJECTION',
    projection: base([
      decl({
        declarationId: 'r11-exposure',
        missingFact: 'Whether pedestrians enter the aisle while the forklift is operating',
        observationSourceId: 'OBS-R6',
        observationSpan: 'No pedestrians were seen during the ten minutes observed',
        notEstablishedBecause: 'Ten minutes without a pedestrian is evidence about ten minutes and '
          + 'does not establish that none enter.',
        affectedDecision: 'EXPOSURE',
        branchA: 'Pedestrians do enter the aisle during forklift operation',
        decisionIfA: 'Segregation or a controlled crossing is required before work continues',
        branchB: 'Pedestrians do not enter the aisle while the forklift is operating',
        decisionIfB: 'Forklift work continues and the arrangement is reviewed at the next audit',
        whyNecessaryNow: 'The forklift is operating in the aisle now.',
      }),
    ]),
    expectation: 'Admitted with affectedDecision EXPOSURE, and decisionIfB stays inside what '
      + 'branch B establishes — the RR-2B-compliant counterpart to FX-09.',
  },
  {
    fixtureId: 'FX-12_ORDINARY_NON_ESCALATING_CONTROL',
    exercises: ['S2 preservation', 'RR-2A negative control'],
    kind: 'PROJECTION',
    projection: base([]),
    expectation: 'ZERO declarations on a sufficient-text row is the correct answer, and the '
      + 'projection returns facts = 0, refusedCount = 0, and RR-7 safetyStateComplete = TRUE. An '
      + 'empty result must stay distinguishable from FX-10\'s total loss, and this pair is the '
      + 'assertion that it is.',
  },
  {
    fixtureId: 'FX-13_GOVERNED_CAPABILITY_ABSENT_REQUEST',
    exercises: ['transport C1'],
    kind: 'TRANSPORT',
    projection: null,
    expectation: 'The capability-ABSENT first-pass schema is constructible and is the shape §199 '
      + 'executed on ten of ten rows.',
  },
  {
    fixtureId: 'FX-14_GOVERNED_CAPABILITY_PRESENT_REQUEST',
    exercises: ['transport C1-C5'],
    kind: 'TRANSPORT',
    projection: null,
    expectation: 'A governed row routes to the capability-ABSENT first pass plus a separate small '
      + 'governed-stage request. The retired PRESENT first-pass shape is never sent.',
  },
  {
    fixtureId: 'FX-15_REPEATED_RECORD_ADDITIVE_APPEND_INTEGRITY',
    exercises: ['T1'],
    kind: 'TOOLING',
    projection: null,
    expectation: 'Three appends to one field preserve all three texts in order with batch identity '
      + 'visible; prior text survives exactly once; legacy flat text is adopted byte-identically.',
  },
];

// ---------------------------------------------------------------- RR-4 annotations

/**
 * Product-owner-reviewable qualifier annotations for the fixtures whose properties depend on one.
 * These are the input to `auditPropertyPreservation`, and they are DECLARED, never inferred.
 */
export const ANNOTATED_FIXTURES: readonly AnnotatedFactFixture[] = [
  {
    fixtureId: 'FX-06_TEMPORAL_BEFORE_RETURN_TO_USE',
    sourceRow: 'OBS-R4',
    declaration: (REMEDIATION_FIXTURES.find(
      f => f.fixtureId === 'FX-06_TEMPORAL_BEFORE_RETURN_TO_USE',
    )!.projection!.declarations[0]) as unknown as StructuredUnresolvedFactDeclaration,
    annotations: [
      {
        qualifier: 'BEFORE_AFTER_SEQUENCING',
        carriedBy: ['missingFact', 'evidenceSpan', 'branchA', 'branchB', 'decisionDivergence.ifB'],
        whyDecisionCritical: 'A load test carried out AFTER return to use leaves the crane having '
          + 'lifted untested. The sequence is the property; without it the question is answerable '
          + 'YES while the fact stays open — the recorded SF-06 mechanism.',
      },
    ],
    section204AxisQVerdict: 'CLARIFICATION_INSUFFICIENCY on the SF-06 original',
  },
  {
    fixtureId: 'FX-05_VERIFICATION_PERFORMED_AND_FAILED_TO_ESTABLISH',
    sourceRow: 'OBS-R4',
    declaration: (REMEDIATION_FIXTURES.find(
      f => f.fixtureId === 'FX-05_VERIFICATION_PERFORMED_AND_FAILED_TO_ESTABLISH',
    )!.projection!.declarations[0]) as unknown as StructuredUnresolvedFactDeclaration,
    annotations: [
      {
        qualifier: 'ACTUAL_CONTROL_RESULT',
        carriedBy: ['missingFact', 'branchA', 'branchB', 'decisionDivergence.ifA',
          'decisionDivergence.ifB'],
        whyDecisionCritical: 'The property is what the test ESTABLISHED, not that it happened. '
          + 'Losing this class reduces the fact to performance and reproduces F5.',
      },
    ],
    section204AxisQVerdict: 'NO_OBSERVABLE_LOSS on the SF-08 sibling',
  },
  {
    fixtureId: 'FX-08_DOWNSTREAM_OVERREACH_POSITIVE_BRANCH',
    sourceRow: 'OBS-R5',
    declaration: (REMEDIATION_FIXTURES.find(
      f => f.fixtureId === 'FX-08_DOWNSTREAM_OVERREACH_POSITIVE_BRANCH',
    )!.projection!.declarations[0]) as unknown as StructuredUnresolvedFactDeclaration,
    annotations: [
      {
        qualifier: 'POINT_OR_LOCATION_OF_VERIFICATION',
        carriedBy: ['missingFact', 'evidenceSpan', 'branchA', 'branchB'],
        whyDecisionCritical: 'Capture at the hood face and capture at the wiping position are '
          + 'different facts. Losing the position turns the fact into "is there LEV".',
      },
    ],
    section204AxisQVerdict: 'NO_OBSERVABLE_LOSS on the SF-07 original',
  },
  {
    fixtureId: 'FX-11_EXPOSURE_NOT_OBSERVED_IS_NOT_ABSENT',
    sourceRow: 'OBS-R6',
    declaration: (REMEDIATION_FIXTURES.find(
      f => f.fixtureId === 'FX-11_EXPOSURE_NOT_OBSERVED_IS_NOT_ABSENT',
    )!.projection!.declarations[0]) as unknown as StructuredUnresolvedFactDeclaration,
    annotations: [
      {
        qualifier: 'EXPOSURE_CONDITION',
        carriedBy: ['missingFact', 'branchA', 'branchB', 'decisionDivergence.ifA'],
        whyDecisionCritical: 'The property is simultaneity — people in the aisle WHILE the forklift '
          + 'operates. Losing it turns the fact into "do people ever use the aisle".',
      },
    ],
    section204AxisQVerdict: 'NO_OBSERVABLE_LOSS on the SF-11 original',
  },
  {
    fixtureId: 'FX-07_CONJUNCTIVE_TWO_COMPONENT_PROPERTY',
    sourceRow: 'OBS-R7',
    declaration: (REMEDIATION_FIXTURES.find(
      f => f.fixtureId === 'FX-07_CONJUNCTIVE_TWO_COMPONENT_PROPERTY',
    )!.projection!.declarations[0]) as unknown as StructuredUnresolvedFactDeclaration,
    annotations: [
      {
        qualifier: 'CONJUNCTION',
        carriedBy: ['missingFact', 'branchA', 'branchB'],
        whyDecisionCritical: 'Both components must hold before the guard is effective. A branch '
          + 'pair that carries only one component silently settles half the property.',
      },
    ],
    section204AxisQVerdict: 'NO_OBSERVABLE_LOSS on the SF-08 conjunctive pair',
  },
];
