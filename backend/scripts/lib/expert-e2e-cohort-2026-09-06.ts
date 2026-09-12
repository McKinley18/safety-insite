/**
 * §195 -- FRESH END-TO-END DEVELOPMENT COHORT. ZERO PROVIDER CALLS.
 *
 * Twelve fresh observations, authored for the end-to-end pipeline validation. NOTHING is reused from
 * §187 or §192: no observation, no owed fact, no question, no hazard scenario, no wording.
 *
 * ==================== WHAT IS AND IS NOT AUTHORED HERE ====================
 *
 * AUTHORED: the raw observation, the governed evidence supplied with it, and the EXPECTED truth.
 * The expected truth exists ONLY for scoring and is never injected into the pipeline -- the hosted
 * system receives the raw observation and the normal allowed context, nothing else.
 *
 * NOT AUTHORED, and this is the point of §195: the owed facts the first pass produces, and the
 * clarifications it asks. Those must emerge from the live system. A miss propagates and is scored as
 * an end-to-end failure; nothing downstream is rescued.
 *
 * ==================== TWO FAMILIES CANNOT BE GUARANTEED, ONLY MADE LIKELY ====================
 *
 * The authorization lists EXISTING-SUFFICIENT-FIRST-PASS-QUESTION and FIRST-PASS-INSUFFICIENT-
 * QUESTION as required fixture families. In a genuine end-to-end run they are OUTCOMES, not fixture
 * properties: the first pass writes its own question and nobody may author it. §192 could guarantee
 * them only because its first-pass sets were hand-authored, which is exactly what §195 forbids.
 *
 * So rows carry `sufficientQuestionLikelihood` -- a design intent, not a truth claim -- and the
 * scoring must record what actually happened rather than assume the family was hit.
 */

export const E2E_COHORT_VERSION = 'hazlenz.expert.e2e-cohort.2026-09-06' as const;

export const E2E_FAMILIES = [
  'SIMPLE_REQUIRED_CONTROL',
  'CONJUNCTIVE_REQUIRED_CONTROL',
  'ADJACENT_PROPERTY_TRAP',
  'FULLY_ESTABLISHED_CONTROL',
  'NON_DECISION_CRITICAL_MISSING_DETAIL',
  'MULTI_GAP',
  'GOVERNED_EVIDENCE_VALID_RELIANCE',
  'GOVERNED_EVIDENCE_UNRELATED',
  'GOVERNED_EVIDENCE_TOO_NARROW',
  'GOVERNED_EVIDENCE_ABSENT',
] as const;
export type E2EFamily = (typeof E2E_FAMILIES)[number];

/** Canonical shape, matching `ExpertVerifierInput.governedEvidence`. */
export interface GovernedEvidenceItem { readonly sourceId: string; readonly text: string }

export interface ExpectedOwedFact {
  readonly factKeyIntent: string;
  readonly owedProperty: string;
  readonly conjuncts: readonly string[];
  readonly evidenceSpan: string;
  readonly affectedDecision: 'REQUIRED_CONTROL' | 'HAZARD_EXISTENCE' | 'EXPOSURE' | 'APPLICABILITY';
}

export interface E2ERow {
  readonly rowId: string;
  readonly observation: string;
  readonly governedEvidence: readonly GovernedEvidenceItem[];
  readonly families: readonly E2EFamily[];
  /** Facts a correct first pass should raise. Scoring truth only; never supplied to the pipeline. */
  readonly expectedOwedFacts: readonly ExpectedOwedFact[];
  /** Nearby properties the observation DOES establish, which must not stand in for the owed one. */
  readonly adjacentPropertiesEstablished: readonly string[];
  readonly EXPECTED_ALLOWED_RELIANCE: readonly string[];
  readonly EXPECTED_FORBIDDEN_RELIANCE: string;
  readonly sufficientQuestionLikelihood: 'LIKELY' | 'UNLIKELY' | 'NOT_APPLICABLE';
  readonly designIntent: string;
}

const RC = 'REQUIRED_CONTROL' as const;

export const E2E_COHORT: readonly E2ERow[] = [
  {
    rowId: 'EE-01',
    observation: 'A powered roller shutter serves the goods bay. Its safety edge was replaced on '
      + 'Tuesday and the engineer signed the job sheet, which records the edge replacement and a '
      + 'lubrication. Nothing on the sheet records a reversal test. The shutter is in use.',
    governedEvidence: [],
    families: ['SIMPLE_REQUIRED_CONTROL', 'GOVERNED_EVIDENCE_ABSENT'],
    expectedOwedFacts: [{
      factKeyIntent: 'shutter safety edge reversal function verified after replacement',
      owedProperty: 'the safety edge has been verified to reverse the shutter on contact, after the '
        + 'replacement and before the shutter was returned to use',
      conjuncts: ['the reversal function was verified', 'verification happened after the replacement'],
      evidenceSpan: 'Nothing on the sheet records a reversal test',
      affectedDecision: RC,
    }],
    adjacentPropertiesEstablished: ['the edge was replaced', 'a job sheet was signed', 'lubrication was done'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'any — no governed evidence is supplied, so reliance must be NONE',
    sufficientQuestionLikelihood: 'LIKELY',
    designIntent: 'One clear decision-critical gap with no governed evidence. Baseline for ordinary '
      + 'NONE reasoning and for first-pass recall.',
  },
  {
    rowId: 'EE-02',
    observation: 'A tanker is being prepared for internal cleaning at the wash bay. The discharge '
      + 'valve is closed and padlocked and the driver holds the key. The manway is still bolted. '
      + 'The vent line log carries no entry for this vehicle today.',
    governedEvidence: [],
    families: ['CONJUNCTIVE_REQUIRED_CONTROL', 'GOVERNED_EVIDENCE_ABSENT'],
    expectedOwedFacts: [{
      factKeyIntent: 'tanker isolated AND vented before the manway is opened',
      owedProperty: 'the tanker is isolated AND vented to atmosphere before the manway is opened',
      conjuncts: ['the tanker is isolated', 'the tanker is vented to atmosphere'],
      evidenceSpan: 'The vent line log carries no entry for this vehicle today',
      affectedDecision: RC,
    }],
    adjacentPropertiesEstablished: ['the discharge valve is closed and padlocked', 'the manway is still bolted'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'any',
    sufficientQuestionLikelihood: 'UNLIKELY',
    designIntent: 'A AND B, with A stated done in the observation. A topic-level question about '
      + 'isolation would be insufficient. Tests conjunctive recall end to end.',
  },
  {
    rowId: 'EE-03',
    observation: 'A fitter is about to enter a below-ground valve chamber to change a gasket. The '
      + 'feed line has been isolated at the surface valve and locked. The line was steam-purged on '
      + 'the previous shift. The chamber gas monitor sits on the van seat and the entry log has no '
      + 'atmosphere reading recorded for today.',
    governedEvidence: [],
    families: ['CONJUNCTIVE_REQUIRED_CONTROL', 'GOVERNED_EVIDENCE_ABSENT'],
    expectedOwedFacts: [{
      factKeyIntent: 'line isolated AND purged AND chamber atmosphere confirmed safe before entry',
      owedProperty: 'the line is isolated AND purged AND the chamber atmosphere is confirmed safe '
        + 'before the fitter enters',
      conjuncts: ['the line is isolated', 'the line is purged',
        'the chamber atmosphere is confirmed safe before entry'],
      evidenceSpan: 'the entry log has no atmosphere reading recorded for today',
      affectedDecision: RC,
    }],
    adjacentPropertiesEstablished: ['the surface valve is isolated and locked',
      'the line was steam-purged on the previous shift', 'a gas monitor exists'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'any',
    sufficientQuestionLikelihood: 'UNLIKELY',
    designIntent: 'A AND B AND C with two conjuncts already stated satisfied. The hard conjunctive '
      + 'case: a question covering isolation and purge reads complete but leaves the atmosphere open.',
  },
  {
    rowId: 'EE-04',
    observation: 'A storage mezzanine overlooks the pick face. The edge handrail is in position '
      + 'along the full run and its uprights are bolted through the deck. A pallet was struck '
      + 'against the handrail by a truck last week and the damage report is closed. No one has '
      + 'recorded a check of the upright fixings since.',
    governedEvidence: [],
    families: ['ADJACENT_PROPERTY_TRAP', 'GOVERNED_EVIDENCE_ABSENT'],
    expectedOwedFacts: [{
      factKeyIntent: 'mezzanine handrail upright fixings currently secure after the impact',
      owedProperty: 'the handrail upright fixings are currently secure following the impact',
      conjuncts: ['the fixings are currently secure'],
      evidenceSpan: 'No one has recorded a check of the upright fixings since',
      affectedDecision: RC,
    }],
    adjacentPropertiesEstablished: ['the handrail is in position along the full run',
      'the uprights are bolted through the deck', 'the damage report is closed'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'any',
    sufficientQuestionLikelihood: 'UNLIKELY',
    designIntent: 'presence != securement, with a closed damage report as an extra temptation. A '
      + 'closed report is an administrative state, not a physical check.',
  },
  {
    rowId: 'EE-05',
    observation: 'Emergency lighting covers the packing hall. The monthly test sheet is initialled '
      + 'for this month; the sheet covers the escape-route luminaires on the north side. The three '
      + 'luminaires above the new south mezzanine stair were installed after the sheet was drawn up '
      + 'and are not listed on it.',
    governedEvidence: [],
    families: ['ADJACENT_PROPERTY_TRAP', 'GOVERNED_EVIDENCE_ABSENT'],
    expectedOwedFacts: [{
      factKeyIntent: 'south stair emergency luminaires function-tested',
      owedProperty: 'the three luminaires above the south mezzanine stair have been function-tested',
      conjuncts: ['those specific luminaires have been function-tested'],
      evidenceSpan: 'are not listed on it',
      affectedDecision: RC,
    }],
    adjacentPropertiesEstablished: ['a monthly test sheet is initialled',
      'the north-side escape-route luminaires are covered', 'the luminaires are installed'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'any',
    sufficientQuestionLikelihood: 'UNLIKELY',
    designIntent: 'inspection occurred != this specific property verified. The sheet\'s stated scope '
      + 'excludes the very luminaires at issue, and installation is not testing.',
  },
  {
    rowId: 'EE-06',
    observation: 'A two-tonne chain hoist is rigged over the press bed. Its current thorough '
      + 'examination certificate is displayed, dated six weeks ago, and lists this hoist by serial '
      + 'number. The serial on the certificate matches the plate on the hoist. The slinger '
      + 'confirmed the SWL against the load before lifting and a second person witnessed it.',
    governedEvidence: [],
    families: ['FULLY_ESTABLISHED_CONTROL', 'GOVERNED_EVIDENCE_ABSENT'],
    expectedOwedFacts: [],
    adjacentPropertiesEstablished: ['certificate current and serial-matched',
      'SWL checked against the load', 'a second person witnessed'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'any',
    sufficientQuestionLikelihood: 'NOT_APPLICABLE',
    designIntent: 'The property is genuinely established, serial-matched and witnessed. NO owed fact '
      + 'and NO clarification should be manufactured. Tests first-pass precision.',
  },
  {
    rowId: 'EE-07',
    observation: 'A wheeled bin of offcuts stands at the end of the saw bench. It is emptied when '
      + 'full, and nobody records how many times a shift that happens. The bin is on a marked '
      + 'standing clear of the walkway, the saw has a fitted crown guard and the operator uses a '
      + 'push stick.',
    governedEvidence: [],
    families: ['NON_DECISION_CRITICAL_MISSING_DETAIL', 'GOVERNED_EVIDENCE_ABSENT'],
    expectedOwedFacts: [],
    adjacentPropertiesEstablished: ['bin clear of the walkway', 'crown guard fitted', 'push stick in use'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'any',
    sufficientQuestionLikelihood: 'NOT_APPLICABLE',
    designIntent: 'Emptying frequency is a magnitude detail whose governing controls are stated '
      + 'present. Both answers lead to the same action today. NO REQUIRED_CONTROL fact should be '
      + 'manufactured.',
  },
  {
    rowId: 'EE-08',
    observation: 'A roofer is replacing flashing at a plant-room parapet. He is clipped to a running '
      + 'line whose end anchor was installed last year; the installation certificate is in the '
      + 'office and no periodic check is recorded. Below him, the plant room itself is entered '
      + 'through a floor hatch, and the hatch has been propped open with no barrier round the '
      + 'opening while he works.',
    governedEvidence: [],
    families: ['MULTI_GAP', 'GOVERNED_EVIDENCE_ABSENT'],
    expectedOwedFacts: [
      {
        factKeyIntent: 'running line end anchor currently fit for arrest',
        owedProperty: 'the running line end anchor is currently fit for fall arrest',
        conjuncts: ['the anchor is currently fit for arrest'],
        evidenceSpan: 'no periodic check is recorded',
        affectedDecision: RC,
      },
      {
        factKeyIntent: 'open floor hatch protected against fall through the opening',
        owedProperty: 'the propped-open floor hatch is protected against a person falling through it',
        conjuncts: ['the opening is protected'],
        evidenceSpan: 'propped open with no barrier round the opening',
        affectedDecision: RC,
      },
    ],
    adjacentPropertiesEstablished: ['the roofer is clipped to a running line',
      'an installation certificate exists'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'any',
    sufficientQuestionLikelihood: 'UNLIKELY',
    designIntent: 'TWO independent facts governing different decisions and different people. Both '
      + 'must survive; neither may substitute for the other. Tests MULTI_GAP_PRESERVATION.',
  },
  {
    rowId: 'EE-09',
    observation: 'A bench grinder in the maintenance shop is in use. The wheel was changed this '
      + 'morning and the guard refitted. The work rest is in place. The shop check sheet records '
      + 'the wheel change and a visual guard check; it records no measurement of the work rest gap.',
    governedEvidence: [{
      sourceId: 'GOV-ABRASIVE-WHEEL-WORKREST-01',
      text: 'Approved knowledge record, abrasive wheels. Required fact: the distance between the '
        + 'work rest and the wheel face is maintained as small as practicable and re-set after every '
        + 'wheel change. Recognised verification methods: direct measurement of the gap with a rule '
        + 'or feeler gauge, recorded against the wheel change. Commonly accepted weak actions to '
        + 'avoid: visual estimation of the gap; relying on the guard having been refitted.',
    }],
    families: ['GOVERNED_EVIDENCE_VALID_RELIANCE', 'ADJACENT_PROPERTY_TRAP'],
    expectedOwedFacts: [{
      factKeyIntent: 'work rest gap re-set and measured after the wheel change',
      owedProperty: 'the work rest gap has been re-set and measured following this morning\'s wheel change',
      conjuncts: ['the gap has been re-set after the wheel change', 'the gap has been measured'],
      evidenceSpan: 'it records no measurement of the work rest gap',
      affectedDecision: RC,
    }],
    adjacentPropertiesEstablished: ['the guard was refitted', 'the work rest is in place',
      'a visual guard check was recorded'],
    EXPECTED_ALLOWED_RELIANCE: ['GOV-ABRASIVE-WHEEL-WORKREST-01'],
    EXPECTED_FORBIDDEN_RELIANCE: 'any source id not supplied; any regulatory proposition beyond '
      + 'what this record states',
    sufficientQuestionLikelihood: 'UNLIKELY',
    designIntent: 'LEGITIMATE RELIANCE. The supplied record squarely supports the proposition that '
      + 'the gap must be re-set and measured after a wheel change, and names visual estimation as a '
      + 'weak action. Deliberately contains NO citation-shaped string — see the §193/§194 collision '
      + 'recorded in the §195 evidence.',
  },
  {
    rowId: 'EE-10',
    observation: 'An electrician is about to work on a motor starter. He has opened the local '
      + 'isolator and fitted his own lock. His test lamp is in the van. The permit records the '
      + 'isolation point and the time, and carries no entry against the proving step.',
    governedEvidence: [{
      sourceId: 'GOV-ISOLATION-PROVING-01',
      text: 'Approved knowledge record, electrical isolation. Required fact: the conductors worked '
        + 'on are proved dead at the point of work after isolation and before work starts. '
        + 'Recognised verification methods: test with an approved voltage indicator proved '
        + 'immediately before and immediately after the dead test. Commonly accepted weak actions to '
        + 'avoid: relying on the isolator position; relying on a permit entry alone.',
    }],
    families: ['GOVERNED_EVIDENCE_VALID_RELIANCE'],
    expectedOwedFacts: [{
      factKeyIntent: 'conductors proved dead at the point of work before work starts',
      owedProperty: 'the conductors have been proved dead at the point of work after isolation and '
        + 'before work starts',
      conjuncts: ['the conductors were proved dead at the point of work',
        'the proving happened after isolation and before work started'],
      evidenceSpan: 'carries no entry against the proving step',
      affectedDecision: RC,
    }],
    adjacentPropertiesEstablished: ['the isolator is open', 'a personal lock is fitted',
      'the permit records the isolation point and time'],
    EXPECTED_ALLOWED_RELIANCE: ['GOV-ISOLATION-PROVING-01'],
    EXPECTED_FORBIDDEN_RELIANCE: 'any source id not supplied',
    sufficientQuestionLikelihood: 'UNLIKELY',
    designIntent: 'LEGITIMATE RELIANCE, second family. The record names both weak actions the '
      + 'observation actually exhibits — isolator position and a permit entry. Isolation is stated '
      + 'done; proving is the open conjunct.',
  },
  {
    rowId: 'EE-11',
    observation: 'A fixed guard over a conveyor drive coupling is held by four bolts. Two of the '
      + 'bolt heads are visible and the other two sit behind the frame and cannot be seen from the '
      + 'walkway. The maintenance record shows the guard was removed for a belt change last month '
      + 'and carries no note of it being refitted or checked since.',
    governedEvidence: [{
      sourceId: 'GOV-RPE-FACEFIT-01',
      text: 'Approved knowledge record, respiratory protective equipment. Required fact: tight-'
        + 'fitting facepieces are face-fit tested to the wearer before first use and at the '
        + 'prescribed interval. Recognised verification methods: a recorded qualitative or '
        + 'quantitative fit test naming the wearer and the facepiece model.',
    }],
    families: ['GOVERNED_EVIDENCE_UNRELATED', 'ADJACENT_PROPERTY_TRAP'],
    expectedOwedFacts: [{
      factKeyIntent: 'conveyor coupling guard fully refitted and secure after the belt change',
      owedProperty: 'the coupling guard has been fully refitted and its fixings are secure after the '
        + 'belt change',
      conjuncts: ['the guard was refitted after the belt change', 'its fixings are currently secure'],
      evidenceSpan: 'carries no note of it being refitted or checked since',
      affectedDecision: RC,
    }],
    adjacentPropertiesEstablished: ['two bolt heads are visible', 'a maintenance record exists'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'GOV-RPE-FACEFIT-01 — it is real governed evidence but concerns '
      + 'respiratory protection and has nothing to do with guard securement. Declaring reliance on '
      + 'it would be stretching the source.',
    sufficientQuestionLikelihood: 'UNLIKELY',
    designIntent: 'UNRELATED governed evidence. The temptation is that evidence is present, so '
      + 'reliance looks available. The correct answer is NONE, and reliance on the supplied source '
      + 'would be a semantic failure even though it is structurally admissible.',
  },
  {
    rowId: 'EE-12',
    observation: 'A mobile tower scaffold stands at the end of the production line and an operative '
      + 'is working from the top platform. The tower was built this morning. The handover tag on '
      + 'the base is signed. The guardrails on the platform are fitted on three sides; the fourth '
      + 'side faces the line and is open.',
    governedEvidence: [{
      sourceId: 'GOV-FIXED-LADDER-CAGE-01',
      text: 'Approved knowledge record, fixed ladders. Required fact: fixed ladders rising above '
        + 'the prescribed height are fitted with a suitable fall-protection feature. Recognised '
        + 'verification methods: recorded inspection of the ladder installation against the design '
        + 'drawing. Scope note: this record covers fixed ladder installations only and does not '
        + 'address mobile access equipment or working platforms.',
    }],
    families: ['GOVERNED_EVIDENCE_TOO_NARROW'],
    expectedOwedFacts: [{
      factKeyIntent: 'open fourth side of the tower platform protected against a fall',
      owedProperty: 'the open fourth side of the tower platform is protected against a fall',
      conjuncts: ['the open side is protected'],
      evidenceSpan: 'the fourth side faces the line and is open',
      affectedDecision: RC,
    }],
    adjacentPropertiesEstablished: ['a signed handover tag', 'guardrails on three sides',
      'the tower was built this morning'],
    EXPECTED_ALLOWED_RELIANCE: [],
    EXPECTED_FORBIDDEN_RELIANCE: 'GOV-FIXED-LADDER-CAGE-01 — topically adjacent (fall protection) '
      + 'but its own scope note excludes mobile access equipment and working platforms. Relying on '
      + 'it to support a proposition about a tower platform overreaches the source.',
    sufficientQuestionLikelihood: 'LIKELY',
    designIntent: 'TOO NARROW governed evidence, with the limit stated inside the record itself. '
      + 'Tests bounded reasoning and abstention: the right answer is NONE plus ordinary reasoning '
      + 'from the observation, which alone establishes the open side.',
  },
];

// ------------------------------------------------------------------ coverage, checked before freeze

export const E2E_COVERAGE = {
  rows: E2E_COHORT.length,
  replicatesPlanned: 3,
  executions: E2E_COHORT.length * 3,
  validRelianceRows: E2E_COHORT.filter(r => r.EXPECTED_ALLOWED_RELIANCE.length > 0).map(r => r.rowId),
  validRelianceExecutions: E2E_COHORT.filter(r => r.EXPECTED_ALLOWED_RELIANCE.length > 0).length * 3,
  unsupportedRelianceRows: E2E_COHORT
    .filter(r => r.governedEvidence.length > 0 && r.EXPECTED_ALLOWED_RELIANCE.length === 0)
    .map(r => r.rowId),
  unsupportedRelianceExecutions: E2E_COHORT
    .filter(r => r.governedEvidence.length > 0 && r.EXPECTED_ALLOWED_RELIANCE.length === 0).length * 3,
  absentEvidenceRows: E2E_COHORT.filter(r => r.governedEvidence.length === 0).length,
  noneExpectedExecutions: E2E_COHORT.filter(r => r.EXPECTED_ALLOWED_RELIANCE.length === 0).length * 3,
  conjunctiveRows: E2E_COHORT.filter(r => r.expectedOwedFacts.some(f => f.conjuncts.length > 1))
    .map(r => ({ rowId: r.rowId, maxConjuncts: Math.max(...r.expectedOwedFacts.map(f => f.conjuncts.length)) })),
  multiGapRows: E2E_COHORT.filter(r => r.expectedOwedFacts.length > 1).map(r => r.rowId),
  zeroOwedFactRows: E2E_COHORT.filter(r => r.expectedOwedFacts.length === 0).map(r => r.rowId),
  familiesCovered: [...new Set(E2E_COHORT.flatMap(r => r.families))].sort(),
  totalExpectedOwedFacts: E2E_COHORT.reduce((n, r) => n + r.expectedOwedFacts.length, 0),
} as const;

/** Every evidenceSpan in the expected truth must be a verbatim span of its observation. */
export function verifyExpectedSpansVerbatim(): string[] {
  const bad: string[] = [];
  for (const r of E2E_COHORT) {
    for (const f of r.expectedOwedFacts) {
      if (!r.observation.includes(f.evidenceSpan)) bad.push(`${r.rowId}: ${f.evidenceSpan}`);
    }
  }
  return bad;
}

/** No supplied governed text may contain a citation-shaped string. See the §195 collision finding. */
export function governedEvidenceCitationShaped(pattern: RegExp): string[] {
  return E2E_COHORT.flatMap(r => r.governedEvidence
    .filter(g => pattern.test(g.text))
    .map(g => `${r.rowId}:${g.sourceId}`));
}
