/**
 * §262 — THE DETERMINISTIC PROVIDER OUTPUTS THE LOCAL ACCEPTANCE CASES REPLAY.
 *
 * These are RECORDED PROVIDER OUTPUTS, not expected answers. Nothing here is a semantic benchmark:
 * §262 measures whether the SERVER handles each deterministic outcome correctly — authority, state,
 * confirmation, provenance, structural identity — and each fixture exists to reach one of those
 * outcomes through the real §259 entry point. No hosted answer is reproduced and none is tuned to.
 *
 * Every fixture is written against the ONE observation the acceptance suite seeds, because the
 * §210J projection binds quoted evidence to the observation the server holds: a quote that is not a
 * literal span of that text is refused, which is exactly the grounding contract working.
 */
export const OBS_TEXT =
  'The conveyor drive guard has been removed for servicing and the drive motor is still connected '
  + 'to power with no lock or tag applied. A millwright is working inside the guard opening.';

/** A verbatim span of OBS_TEXT. Asserted below so a later edit to the text cannot silently unbind. */
const QUOTE = 'the drive motor is still connected to power with no lock or tag applied';
const QUOTE_2 = 'A millwright is working inside the guard opening';
for (const q of [QUOTE, QUOTE_2]) {
  if (!OBS_TEXT.includes(q)) {
    throw new Error(`§262 FIXTURE ABORT: ${JSON.stringify(q)} is not a span of the observation`);
  }
}

const SOURCE_ID = 'observation';
const CONTROL_ID = 'ctl-isolate-drive';
const DECLARATION_ID = 'decl-stored-energy-state';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/**
 * The baseline the fixtures vary. One candidate, grounded in a verbatim span, in a hazard family
 * the server's own taxonomy admits, with a posture that names the control by identity — the §259
 * representation, not the §253 prose reference.
 */
function baseline(): any {
  return {
    expertHazardCandidates: [{
      candidateKey: 'drive-stored-energy',
      hazardFamily: 'lockout_tagout',
      assertedConditionState: 'ACTIVE',
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: SOURCE_ID, quotedText: QUOTE }],
      evidenceBasis: 'the observation states the drive motor is still connected to power with no '
        + 'lock or tag applied',
      reasoning: 'a person working inside a guard opening on a drive that is still connected to '
        + 'power is exposed to unexpected start-up for as long as the work continues',
      confidence: 'HIGH',
      relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC',
      requiresUserConfirmation: false,
    }],
    decisionCriticalClarifications: [],
    crossHazardInsights: [],
    disagreements: [],
    expertExplanation: {
      summary: 'the drive must be isolated before work inside the guard opening continues',
    },
    uncertainty: { statements: ['whether stored energy in the drive has been dissipated'] },
    outcome: 'ANALYZED',
    unresolvedFactDeclarations: [],
    immediateSafetyPosture: {
      posture: 'CONTINUE_WITH_CONTROLS',
      requiredBy: [{
        ref: 'drive-stored-energy',
        refKind: 'HAZARD_CANDIDATE',
        driverRole: 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS',
        roleJustification: {
          epistemicCharacter: 'ESTABLISHED_CONDITION',
          factualBasis: 'the observation states the drive motor is still connected to power with '
            + 'no lock or tag applied',
          unresolvedElement: null,
          whyDecisionMaterial: 'whether a control is required now for the person inside the guard '
            + 'opening',
          whyControllingNotFollowUp: 'without the control the drive could start while the '
            + 'millwright is inside the opening during this shift',
          alongsideControlConsidered: null,
          whyAlongsideControlInsufficient: null,
          dischargingControlRef: CONTROL_ID,
        },
      }],
      acceptedWithoutImmediateAction: [],
      requiredControls: [{
        controlId: CONTROL_ID,
        control: 'isolate and lock out the drive motor before any further work inside the guard '
          + 'opening',
        timing: 'BEFORE_WORK_RESUMES',
      }],
      resumeCondition: { resolvedByDeclarationIds: [], correctionsRequired: [] },
      whatHappensNow: 'the drive is isolated and locked out before the millwright continues work '
        + 'inside the guard opening',
    },
  };
}

/** The declaration case B and G share: a genuinely unresolved fact the model states for itself. */
function declaration(): any {
  return {
    declarationId: DECLARATION_ID,
    missingFact: 'whether stored energy in the drive has been dissipated',
    observationSourceId: SOURCE_ID,
    observationSpan: QUOTE_2,
    notEstablishedBecause: 'the observation records no verification of a zero-energy state',
    affectedDecision: 'REQUIRED_CONTROL',
    branchA: 'the stored energy in the drive has been dissipated',
    decisionIfA: 'isolation alone is sufficient before work continues',
    branchB: 'stored energy remains in the drive',
    decisionIfB: 'the stored energy is released and verified before work continues',
    whyNecessaryNow: 'the millwright is inside the guard opening now',
    decisionWhileUnresolved: 'treat the drive as carrying stored energy and keep the millwright '
      + 'clear until a zero-energy state is verified',
  };
}

export interface ExpertFixture {
  readonly firstPass: () => unknown;
  readonly verifier?: unknown;
  /** Answer the verifier leg with a transport failure, leaving the first pass admitted. */
  readonly failVerifierLeg?: boolean;
}

export const VERIFIER_VERDICT = {
  factKey: 'placeholder',
  propertyReview: [],
};

export const EXPERT_FIXTURES: Record<string, ExpertFixture> = {
  // ---- A. admitted, and the confirmation rule finds nothing to settle.
  A_ADMITTED_NO_CONFIRMATION: { firstPass: () => baseline() },

  // ---- B. admitted, and the analysis classified an unresolved fact as a non-controlling
  // ---- follow-up WHILE the posture permits continued work. Branch (b): confirmation required.
  B_ADMITTED_CONFIRMATION_REQUIRED: {
    firstPass: () => {
      const o = baseline();
      o.unresolvedFactDeclarations = [declaration()];
      o.immediateSafetyPosture.requiredBy.push({
        ref: DECLARATION_ID,
        refKind: 'UNRESOLVED_DECLARATION',
        driverRole: 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP',
        roleJustification: {
          epistemicCharacter: 'FOLLOW_UP_NON_CONTROLLING',
          factualBasis: 'the observation records no verification of a zero-energy state',
          unresolvedElement: 'whether stored energy in the drive has been dissipated',
          whyDecisionMaterial: 'the answer decides whether isolation alone is sufficient',
          whyControllingNotFollowUp: 'the drive is already to be isolated, so what changes is '
            + 'which additional step is taken rather than whether work continues',
          alongsideControlConsidered: null,
          whyAlongsideControlInsufficient: null,
          dischargingControlRef: null,
        },
      });
      return o;
    },
  },

  // ---- E. whole-analysis refusal. The declaration is emitted and appears in NO consequential
  // ---- relationship at all, which the §259 coverage rule refuses for the whole output.
  E_WHOLE_ANALYSIS_REFUSAL: {
    firstPass: () => {
      const o = baseline();
      o.unresolvedFactDeclarations = [declaration()];
      return o;
    },
  },

  // ---- F. A CONTAINED DECLARATION REFUSAL, and an otherwise usable analysis.
  // ---- The declaration's span does not bind to the observation, so §210J refuses THAT
  // ---- declaration. The posture still admits: containment is the point, and escalating one
  // ---- malformed declaration into a refusal of the whole analysis would be over-restriction.
  F_CONTAINED_DECLARATION_REFUSAL: {
    firstPass: () => {
      const o = baseline();
      const bad = declaration();
      bad.observationSpan = 'a span that does not appear anywhere in the observation';
      o.unresolvedFactDeclarations = [bad];
      o.immediateSafetyPosture.requiredBy.push({
        ref: DECLARATION_ID,
        refKind: 'UNRESOLVED_DECLARATION',
        driverRole: 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP',
        roleJustification: {
          epistemicCharacter: 'FOLLOW_UP_NON_CONTROLLING',
          factualBasis: 'the observation records no verification of a zero-energy state',
          unresolvedElement: 'whether stored energy in the drive has been dissipated',
          whyDecisionMaterial: 'the answer decides whether isolation alone is sufficient',
          whyControllingNotFollowUp: 'the drive is already to be isolated, so what changes is '
            + 'which additional step is taken rather than whether work continues',
          alongsideControlConsidered: null,
          whyAlongsideControlInsufficient: null,
          dischargingControlRef: null,
        },
      });
      return o;
    },
  },

  // ---- G. PRESERVED UNRESOLVED TRUTH. The whole output is refused -- the declaration appears in
  // ---- no consequential relationship, which the §259 coverage rule refuses -- and RR-7 still
  // ---- preserves the property the model identified. Nothing admitted; nothing lost.
  G_PRESERVED_UNRESOLVED: {
    firstPass: () => {
      const o = baseline();
      const bad = declaration();
      bad.observationSpan = 'a span that does not appear anywhere in the observation';
      o.unresolvedFactDeclarations = [bad];
      return o;
    },
  },

  // ---- The verifier leg failed while the first pass was ADMITTED. §260 section 15: a verifier
  // ---- failure does not invalidate an admitted first pass, and it is reported as NOT REACHED
  // ---- rather than as a pass. Driven by a transport that answers the second leg with a failure.
  V_VERIFIER_LEG_FAILED: {
    firstPass: () => EXPERT_FIXTURES.B_ADMITTED_CONFIRMATION_REQUIRED.firstPass(),
    failVerifierLeg: true,
  },
};
