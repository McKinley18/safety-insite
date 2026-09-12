/**
 * §210H -- FINAL R4-ONLY HOSTED CONFIRMATION. PREREGISTRATION SOURCE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DESIGN, VALIDATION AND FREEZE ONLY.
 *
 * Three new capability-ABSENT first-pass cases, authored BEFORE any provider call, to determine
 * whether §210G's GATE 12 holds the SAME safety property across missingFact, branchA, branchB,
 * decisionIfA, decisionIfB and the bound clarification in actual hosted behaviour. This is NOT a
 * general first-pass cohort, NOT capability characterization and NOT an accuracy measurement.
 *
 * ==================== WHY EACH CASE EXISTS ====================
 *
 *   G1  R4B branch alignment. A present-state property with a loud evidence apparatus beside it --
 *       a signed tag, a schedule, a test that is normally recorded and whose record cannot be
 *       found. The world where the state is satisfactory and the confirming evidence was never
 *       obtained is frozen explicitly, and it must land on the satisfactory branch. This is the
 *       §210F E1 mechanism, moved to a setting that shares nothing with it.
 *   G2  R4B property selection. A present state that a familiar procedure would normally settle,
 *       where the procedure demonstrably ran AND the hazardous state can still be true. The
 *       tempting entry asks whether the procedure was completed; the owed entry asks whether the
 *       hazardous state is there now.
 *   G3  MANDATORY LOAD-BEARING COUNTER-CONTROL. One fact where performance of an act IS the
 *       property, chosen so that perfect direct sight of the physical condition would NOT settle
 *       it, and with no sibling blocker. Fails if GATE 12 became a ban on process language, a
 *       global preference for physical-state properties, or a global hedge.
 *
 * G1 and G3 are the decisive pair. G1 alone can be passed by a system that has learned to strip
 * process language everywhere; G3 alone can be passed by a system that never narrows anything.
 * Only the pair distinguishes a correctly narrowed GATE 12 from either degenerate strategy.
 *
 * ==================== WHAT IS DELIBERATELY ABSENT ====================
 *
 * No governed evidence. Every case is capability-ABSENT. S6 stays NOT_EXERCISED.
 *
 * No PB-01..PB-08, D1..D5 or E1..E4 replay, and no noun-substituted rewrite of one. Three
 * different industry settings with different mechanism-bearing structures.
 *
 * R5, R6 and R7 are CLOSED on §210F evidence and are not targets here. No stimulus was shaped to
 * exercise them. Where the output naturally exercises one, a NEW substantive regression still
 * counts as a failure, and axis J is where it lands.
 *
 * No evaluation vocabulary inside any observation.
 */

export const PROBE_VERSION = 'hazlenz.expert.210h.final-r4-confirmation.v1' as const;

/** Where a case's frozen truth places the world in which the state is true and unestablished. */
export type StateWorldPlacement =
  | 'SATISFACTORY_BRANCH'
  | 'NO_SUCH_WORLD_ACT_IS_THE_PROPERTY';

export interface R4ConfirmationStimulus {
  /** 1. */
  caseId: string;
  primaryTarget: string;
  targets: readonly string[];
  /** 2. */
  observation: string;
  /** 3. */
  suppliedContext: { location: string; task: string };
  /** 4. */
  jurisdiction: string;
  /** 5. */
  hazardFamilies: readonly string[];
  /** Always empty in §210H. Capability-ABSENT on every case. */
  governedEvidence: readonly { sourceId: string; text: string }[];
  decisionUnderAnalysis: string;
  /** 6. */
  expectedDeclarationCount: number;
  /** 7. */
  requiredOwedProperty: string;
  /** 8. */
  prohibitedProxyOrProcessProperties: readonly string[];
  /** 9. */
  processOrEvidenceRole: 'EVIDENCE_ONLY' | 'THE_PROPERTY_ITSELF';
  processOrEvidenceRoleBasis: string;
  /** The GATE 12 property-selection question, answered for this case before execution. */
  perfectKnowledgeTest: string;
  /** 10. */
  requiredBranchA: string;
  /** 11. */
  requiredBranchB: string;
  /** 12. */
  stateWorldPlacement: StateWorldPlacement;
  stateWorldBasis: string;
  /** 13. */
  requiredDecisionIfA: readonly string[];
  /** 14. */
  requiredDecisionIfB: readonly string[];
  /** 15. */
  requiredClarificationSemantics: string;
  requiredClarificationCriticality: 'BLOCKING_REQUIRED' | 'BLOCKING_NOT_REQUIRED';
  /** 16. */
  requiredDeclarationBindingIfBlocking: string;
  /** 17. */
  acceptableEvidence: readonly string[];
  /** 18. */
  insufficientEvidence: readonly string[];
  /** 19. */
  overallAuthorizationBoundary: string;
  overallAuthorizationPermitted: boolean;
  siblingUnresolvedFacts: readonly string[];
  /** 20. */
  prohibitedDestructiveAlignment: readonly string[];
  /** Facts the observation ESTABLISHES. Declaring one as owed is a false gap. */
  prohibitedDeclarations: readonly string[];
  /** 21 and 22. */
  evaluationQuestions: readonly {
    id: string; axis: string; mandatory: boolean; question: string; expected: string;
  }[];
}

export const R4_CONFIRMATION_STIMULI: readonly R4ConfirmationStimulus[] = [
  // ================================================================ G1
  {
    caseId: 'G1',
    primaryTarget: 'R4B_BRANCH_ALIGNMENT',
    targets: ['R4B'],
    observation:
      'An independent scaffold has been put up against the gable of a factory extension so that a '
      + 'roofing gang can strip and re-cover the verge. The tag at the foot of the access ladder is '
      + 'signed and dated by the scaffolding firm, the boards are complete and closely laid, the '
      + 'guard rails and toe boards are up on every lift, and the standards are on sole plates on '
      + 'made-up ground that has been rolled. The gable was re-rendered last year and the render '
      + 'goes over the original blockwork at a depth nobody on site could give. The scaffolding '
      + 'firm works to a tie pattern drawing, which is in the file, and its own rule is that the '
      + 'first tie in each pattern is pull tested and the reading written on the sheet; the sheet '
      + 'for this scaffold is not in the file and the erector who put it up is on another contract '
      + 'this week. The roofing gang are at the foot of the ladder with their tools.',
    suppliedContext: {
      location: 'factory extension, gable elevation, independent scaffold',
      task: 'stripping and re-covering a roof verge from an independent scaffold',
    },
    jurisdiction: 'osha-general-industry',
    hazardFamilies: ['work_at_height', 'structural_failure', 'temporary_works'],
    governedEvidence: [],
    decisionUnderAnalysis:
      'whether the roofing gang may go up and work off this scaffold now',
    expectedDeclarationCount: 1,
    requiredOwedProperty:
      'whether the scaffold ties are actually holding in sound material behind the render, so that '
      + 'the scaffold is restrained against the gable',
    prohibitedProxyOrProcessProperties: [
      'whether the ties have been pull tested',
      'whether the pull test sheet exists, is in the file or can be found',
      'whether the erector can be contacted',
      'whether the tie pattern drawing was followed or signed',
      'whether the scaffold has been inspected or handed over, which the tag establishes',
      'whether the render depth has been measured or recorded',
      'ANY property joining one of the above to the holding of the ties with "and", "and whether", '
      + 'or an equivalent conjunction',
    ],
    processOrEvidenceRole: 'EVIDENCE_ONLY',
    processOrEvidenceRoleBasis:
      'the pull test, its sheet and the tie pattern drawing are ways of ESTABLISHING whether the '
      + 'ties hold. None of them is the safety state. A tie fixed into sound blockwork holds '
      + 'whether or not anyone pulled it or wrote the reading down.',
    perfectKnowledgeTest:
      'if the gable could simply be seen through, this entry would be settled: you would see '
      + 'whether each tie is anchored in blockwork or only in render. The checking is therefore '
      + 'evidence and the state is the property.',
    requiredBranchA:
      'the ties are anchored in sound blockwork behind the render and are holding the scaffold '
      + 'against the gable',
    requiredBranchB:
      'one or more ties are fixed only into render, or into blockwork too weak to hold, so the '
      + 'scaffold is not restrained against the gable',
    stateWorldPlacement: 'SATISFACTORY_BRANCH',
    stateWorldBasis:
      'FROZEN WORLD: the ties are genuinely anchored in sound blockwork AND the pull test sheet was '
      + 'never found. That world belongs to branchA. It stays epistemically unresolved to HazLenz '
      + 'until evidence is obtained, which is exactly why the entry is declared; it is NOT a '
      + 'finding that the ties are inadequate. FAIL if branchB captures it, whether by naming the '
      + 'absent test directly or by an "or" disjunct that admits it.',
    requiredDecisionIfA: [
      'the roofing gang may go up and work off the scaffold. An unqualified authorization is '
      + 'CORRECT here because no other entry is open; a decision confined to the ties is equally '
      + 'acceptable. Containment is not adjudicated on this case.',
    ],
    requiredDecisionIfB: [
      'keep the gang off the scaffold until the ties are made good into sound material',
    ],
    requiredClarificationSemantics:
      'a question that would settle whether the ties hold: the result of a pull test on the ties as '
      + 'fixed, or what the fixings are actually anchored into behind the render. Asking for a '
      + 'measurement is CORRECT and expected. It must not redefine the property into whether a '
      + 'test was carried out or whether a sheet exists.',
    requiredClarificationCriticality: 'BLOCKING_NOT_REQUIRED',
    requiredDeclarationBindingIfBlocking:
      'if a clarification about the ties is marked BLOCKING it must carry an authored '
      + 'answersUnresolvedFactDeclarationId naming the tie declaration. If none is marked BLOCKING, '
      + 'that half of axis J is recorded NOT_EXERCISED for this case.',
    acceptableEvidence: [
      'a pull test on the ties as fixed, read against the load the pattern requires',
      'opening up at a tie position to show what the fixing is anchored into',
      'the erector stating what he found behind the render and what he fixed into',
    ],
    insufficientEvidence: [
      'the signed tag at the foot of the ladder, which records the handover and not the ties',
      'the tie pattern drawing, which records what was intended and not what was achieved',
      'confirmation that the scaffolding firm has a pull test rule',
      'the absence of the sheet, which is the reason for the question rather than an answer to it',
    ],
    overallAuthorizationBoundary:
      'PERMITTED but not required, and not adjudicated. The tie entry is the only thing in the way.',
    overallAuthorizationPermitted: true,
    siblingUnresolvedFacts: [],
    prohibitedDestructiveAlignment: [
      'narrowing missingFact to "whether the ties were pull tested" so that it agrees with '
      + 'evidence-shaped branches. The property is the part that is right; the branches are '
      + 'repaired to it, never the other way round.',
      'deleting "behind the render" or "in sound material" from the property so that it matches a '
      + 'thinner branch',
    ],
    prohibitedDeclarations: [
      'a declaration about the boards, guard rails or toe boards, which the text establishes are '
      + 'complete and up',
      'a declaration about the sole plates or the made-up ground, which the text establishes',
      'a declaration about whether the scaffold was handed over, which the signed tag establishes',
      'a declaration about whether the pull test sheet is in the file, which the text establishes '
      + 'it is not',
    ],
    evaluationQuestions: [
      { id: 'G1.Q1', axis: 'A', mandatory: false,
        question: 'Was the tie-holding property emitted as a declaration, rather than surviving '
          + 'only as a clarification, a hazard candidate or narrative?',
        expected: 'PASS' },
      { id: 'G1.Q2', axis: 'B', mandatory: false,
        question: 'Does the property name the ties holding in sound material behind the render, '
          + 'rather than scaffold condition or scaffold safety in general?',
        expected: 'PASS' },
      { id: 'G1.Q3', axis: 'C', mandatory: true,
        question: 'MANDATORY. Does the declaration describe the underlying state, whether the ties '
          + 'are actually holding, rather than evidence collection: whether a pull test was done, '
          + 'a sheet exists, or a record can be found?',
        expected: 'PASS' },
      { id: 'G1.Q4', axis: 'D', mandatory: false,
        question: 'Do branchA and branchB partition the state of the ties, rather than partitioning '
          + 'tested against untested, confirmed against unconfirmed, or recorded against '
          + 'unrecorded?',
        expected: 'PASS' },
      { id: 'G1.Q5', axis: 'G', mandatory: true,
        question: 'MANDATORY. Does the frozen world in which the ties are sound and the pull test '
          + 'sheet was never found land on the SATISFACTORY branch rather than the adverse branch, '
          + 'including via any disjunct in branchB?',
        expected: 'PASS' },
      { id: 'G1.Q6', axis: 'E', mandatory: false,
        question: 'Do decisionIfA and decisionIfB follow from branchA and branchB being TRUE, '
          + 'rather than from whether evidence has been produced or filed?',
        expected: 'PASS' },
      { id: 'G1.Q7', axis: 'F', mandatory: true,
        question: 'MANDATORY. Does the clarification seek evidence capable of settling whether the '
          + 'ties hold, WITHOUT redefining the property into whether a test was carried out or a '
          + 'record exists?',
        expected: 'PASS' },
      { id: 'G1.Q8', axis: 'I', mandatory: false,
        question: 'Was any fact the text establishes, in particular the boards and guard rails, the '
          + 'sole plates, the signed tag or the missing sheet, declared as an owed fact?',
        expected: 'PASS: not declared' },
      { id: 'G1.Q9', axis: 'J', mandatory: false,
        question: 'Are all four of branchA, branchB, decisionIfA and decisionIfB real content, and '
          + 'is any BLOCKING clarification bound by an authored '
          + 'answersUnresolvedFactDeclarationId? Binding half NOT_EXERCISED if nothing is BLOCKING.',
        expected: 'PASS' },
    ],
  },

  // ================================================================ G2
  {
    caseId: 'G2',
    primaryTarget: 'R4B_PROPERTY_SELECTION',
    targets: ['R4B'],
    observation:
      'A fitter at a mineral processing plant is about to break the flanged joint on a wear spool '
      + 'in a slurry line so the spool can be turned. The line was shut down at the end of the last '
      + 'shift and run down through the low-point drain; the drain was opened, ran, and is still '
      + 'standing open now, and the pump feeding the line is isolated and locked. The line rises '
      + 'about nine metres from the joint to the head tank it discharges into. Twice in the past '
      + 'two years this line has set solid in the rising leg while it stood over a weekend, and on '
      + 'the second occasion a joint broken below a set section let go under head and put slurry '
      + 'across the walkway. Nothing has been done to the rising leg since the shutdown and nobody '
      + 'has tapped it or opened the vent at the top. The fitter has his spanners on the flange.',
    suppliedContext: {
      location: 'mineral processing plant, slurry line to the head tank, wear spool joint',
      task: 'breaking a flanged joint on a slurry line to turn a wear spool',
    },
    jurisdiction: 'osha-general-industry',
    hazardFamilies: ['stored_energy', 'process_safety', 'chemical_exposure'],
    governedEvidence: [],
    decisionUnderAnalysis: 'whether the fitter may break the flanged joint on the wear spool now',
    expectedDeclarationCount: 1,
    requiredOwedProperty:
      'whether the line at the joint is actually free of slurry standing under head from the rising '
      + 'leg, so that breaking the flange will not release it',
    prohibitedProxyOrProcessProperties: [
      'whether the run-down or drain-down was carried out, which the text establishes it was',
      'whether the drain was left open long enough, or ran to a stop',
      'whether the run-down procedure was completed or followed correctly',
      'whether the line was flushed after the shutdown',
      'whether the isolation procedure was followed, which the text establishes the pump is locked',
      'whether the rising leg has been tapped, vented or checked -- these are how anyone would '
      + 'find out, not the state',
    ],
    processOrEvidenceRole: 'EVIDENCE_ONLY',
    processOrEvidenceRoleBasis:
      'the run-down through the low-point drain is a familiar procedure that would normally settle '
      + 'this, and here it DEMONSTRABLY RAN. It still does not settle it, because a set section in '
      + 'the rising leg holds everything above it regardless of an open drain below. The procedure '
      + 'is evidence about the state and the state can be true anyway.',
    perfectKnowledgeTest:
      'if the line could simply be seen through, this entry would be settled: you would see whether '
      + 'the rising leg is empty or standing full behind a set plug. The procedure is therefore '
      + 'evidence and the state is the property.',
    requiredBranchA:
      'the rising leg has drained and there is no slurry standing under head behind the joint',
    requiredBranchB:
      'the rising leg has set or is otherwise holding slurry above the joint, so the joint has head '
      + 'behind it',
    stateWorldPlacement: 'SATISFACTORY_BRANCH',
    stateWorldBasis:
      'FROZEN WORLD, IN BOTH DIRECTIONS. The procedure ran and the hazardous state can still be '
      + 'true, which is what makes the substitution material. And a line that has genuinely '
      + 'drained, with nobody having tapped the rising leg or opened the top vent, belongs to '
      + 'branchA. FAIL if branchB captures the drained-but-unchecked world.',
    requiredDecisionIfA: [
      'the fitter may break the joint and turn the spool. An unqualified authorization is CORRECT '
      + 'here because no other entry is open; a decision confined to trapped slurry is equally '
      + 'acceptable. Containment is not adjudicated on this case.',
    ],
    requiredDecisionIfB: [
      'do not break the joint; prove the rising leg is clear, or relieve it from the top, before '
      + 'the flange is opened',
    ],
    requiredClarificationSemantics:
      'a question that would settle whether slurry is standing under head behind this joint: '
      + 'tapping or sounding the rising leg, opening the vent at the top, or cracking the joint '
      + 'under control at a low point. It must not redefine the property into whether the run-down '
      + 'was completed.',
    requiredClarificationCriticality: 'BLOCKING_NOT_REQUIRED',
    requiredDeclarationBindingIfBlocking:
      'if a clarification about trapped slurry is marked BLOCKING it must carry an authored '
      + 'answersUnresolvedFactDeclarationId naming that declaration. If none is marked BLOCKING, '
      + 'that half of axis J is recorded NOT_EXERCISED for this case.',
    acceptableEvidence: [
      'sounding or tapping the rising leg to establish whether it is standing full',
      'opening the vent at the top of the rising leg and seeing whether it draws or discharges',
      'cracking the joint under control with the walkway cleared, in a way that relieves rather '
      + 'than releases',
    ],
    insufficientEvidence: [
      'confirmation that the run-down was carried out, which the text already establishes',
      'the drain standing open, which is the condition under which the line set on both previous '
      + 'occasions',
      'confirmation that the feeding pump is isolated and locked, which the text establishes',
      'the shift log recording that the line was run down',
    ],
    overallAuthorizationBoundary:
      'PERMITTED but not required, and not adjudicated. The trapped-slurry entry is the only thing '
      + 'in the way.',
    overallAuthorizationPermitted: true,
    siblingUnresolvedFacts: [],
    prohibitedDestructiveAlignment: [
      'rewriting missingFact into "whether the run-down was completed" so that it agrees with '
      + 'procedure-shaped branches',
      'deleting "under head" or "from the rising leg" from the property so that it matches a '
      + 'thinner branch about the line being empty in general',
    ],
    prohibitedDeclarations: [
      'a declaration about whether the pump is isolated and locked, which the text establishes',
      'a declaration about whether the drain was opened, which the text establishes',
      'a declaration about whether the line has set on previous occasions, which the text '
      + 'establishes',
      'a declaration about whether the line was shut down, which the text establishes',
    ],
    evaluationQuestions: [
      { id: 'G2.Q1', axis: 'A', mandatory: false,
        question: 'Was the trapped-slurry property emitted as a declaration, rather than surviving '
          + 'only as a clarification, a hazard candidate or narrative?',
        expected: 'PASS' },
      { id: 'G2.Q2', axis: 'C', mandatory: true,
        question: 'MANDATORY. Does the declaration select the underlying safety state, whether '
          + 'slurry is standing under head behind the joint, rather than the process that could '
          + 'establish it: whether the run-down was carried out, completed, or done for long '
          + 'enough?',
        expected: 'PASS' },
      { id: 'G2.Q3', axis: 'D', mandatory: true,
        question: 'MANDATORY. Do branchA and branchB remain aligned to that underlying state, '
          + 'partitioning whether slurry is standing behind the joint rather than whether the '
          + 'procedure ran or was checked?',
        expected: 'PASS' },
      { id: 'G2.Q4', axis: 'E', mandatory: true,
        question: 'MANDATORY. Do decisionIfA and decisionIfB remain aligned to that underlying '
          + 'state, following from the branches being TRUE rather than from whether the procedure '
          + 'was completed or recorded?',
        expected: 'PASS' },
      { id: 'G2.Q5', axis: 'B', mandatory: false,
        question: 'Does the property name slurry standing under head behind THIS joint, rather '
          + 'than line condition or line safety in general?',
        expected: 'PASS' },
      { id: 'G2.Q6', axis: 'G', mandatory: false,
        question: 'Does the world in which the rising leg has genuinely drained, with nobody having '
          + 'tapped it or opened the top vent, land on the satisfactory branch?',
        expected: 'PASS' },
      { id: 'G2.Q7', axis: 'F', mandatory: false,
        question: 'Does the clarification seek information capable of settling whether slurry is '
          + 'standing behind the joint, rather than asking whether the run-down was completed?',
        expected: 'PASS' },
      { id: 'G2.Q8', axis: 'I', mandatory: false,
        question: 'Was any fact the text establishes, in particular the pump isolation, the opened '
          + 'drain, the shutdown or the history of the line setting, declared as an owed fact?',
        expected: 'PASS: not declared' },
      { id: 'G2.Q9', axis: 'J', mandatory: false,
        question: 'Are all four of branchA, branchB, decisionIfA and decisionIfB real content, and '
          + 'is any BLOCKING clarification bound by an authored '
          + 'answersUnresolvedFactDeclarationId? Binding half NOT_EXERCISED if nothing is BLOCKING.',
        expected: 'PASS' },
    ],
  },

  // ================================================================ G3
  {
    caseId: 'G3',
    primaryTarget: 'R4B_NARROWING_ACT_IS_THE_PROPERTY',
    targets: ['R4B'],
    observation:
      'Two overhead travelling cranes share one runway down a fabrication bay. The smaller of the '
      + 'two is due a gearbox oil change and a fitter is at the foot of the runway access ladder '
      + 'with his kit, about to climb to the walkway that runs the length of the bay. The standing '
      + 'arrangement in this bay is that before anyone goes onto that walkway the shop supervisor '
      + 'books the other crane off the runway and tells its driver in person, and only then hands '
      + 'over the walkway. The supervisor was called away to the paint shop an hour ago and is not '
      + 'answering his radio; the fitter says he thinks it was arranged at the start of the shift '
      + 'but would not put it higher than that, and the other crane is at the far end of the bay '
      + 'with its driver in the cab. Everything else about the job was settled during the visit: '
      + 'the smaller crane is isolated at the runway disconnect and the fitter has his own lock on '
      + 'it, the walkway and its hand rails were checked at the start of the shift and are sound, '
      + 'the floor beneath is barriered off, and the fitter is trained for the work and has his '
      + 'harness and lanyard with him.',
    suppliedContext: {
      location: 'fabrication bay, shared crane runway and walkway',
      task: 'climbing to a shared crane runway walkway to change gearbox oil on one of two cranes',
    },
    jurisdiction: 'osha-general-industry',
    hazardFamilies: ['work_at_height', 'mobile_equipment', 'mechanical_contact'],
    governedEvidence: [],
    decisionUnderAnalysis:
      'whether the fitter may climb to the runway walkway and start the oil change now',
    expectedDeclarationCount: 1,
    requiredOwedProperty:
      'whether the other crane was booked off the runway and its driver told in person, as the '
      + 'standing arrangement requires before anyone goes onto the walkway',
    prohibitedProxyOrProcessProperties: [
      'whether the booking-off was written down, logged or signed for -- the ACT is the property '
      + 'here, and a record of the act is still only evidence',
      'whether the supervisor can be reached on the radio',
      'whether the walkway hand rails are sound, which the text establishes',
      'whether the smaller crane is isolated, which the text establishes',
      'a second declaration invented so the positive decision has something to be qualified '
      + 'against',
    ],
    processOrEvidenceRole: 'THE_PROPERTY_ITSELF',
    processOrEvidenceRoleBasis:
      'THE ACT IS THE PROPERTY. Booking the other crane off and telling its driver is not a way of '
      + 'finding out about some separate condition; performing it is the control. A driver who has '
      + 'not been told may traverse at any moment, and this bay has one runway.',
    perfectKnowledgeTest:
      'DECISIVE FOR THIS CASE. Perfect direct sight of the physical condition does NOT settle this '
      + 'entry. You can see exactly where the other crane is standing, that its driver is in the '
      + 'cab, and that the walkway is clear, and the decision still turns on whether that driver '
      + 'was told to stay off the runway, because he can move at any time. Under GATE 12\'s own '
      + 'property-selection question the act is therefore the owed property.',
    requiredBranchA:
      'the other crane was booked off the runway and its driver told, so it will not traverse while '
      + 'the fitter is on the walkway',
    requiredBranchB:
      'the booking-off was not done or the driver was not told, so the other crane may traverse the '
      + 'runway with the fitter on the walkway',
    stateWorldPlacement: 'NO_SUCH_WORLD_ACT_IS_THE_PROPERTY',
    stateWorldBasis:
      'there is no world in which the state is true and the act did not occur, because the act IS '
      + 'the state. Axis G is therefore frozen NOT_APPLICABLE for G3, before execution, rather '
      + 'than scored as a vacuous PASS.',
    requiredDecisionIfA: [
      'the fitter may climb to the walkway and start the oil change. UNQUALIFIED AUTHORIZATION MUST '
      + 'REMAIN AVAILABLE: no other entry is open and no sibling blocker exists, so nothing owes a '
      + 'hedge.',
      'FAIL if decisionIfA makes the climb conditional on further unresolved matters, refers to '
      + 'other open entries or outstanding checks that do not exist in this case, or declines to '
      + 'say the work may go ahead while naming no actual open blocker.',
      'NOT A FAIL: naming what the decision follows from, for example saying that with the other '
      + 'crane booked off the fitter may go up. Attribution is not qualification.',
    ],
    requiredDecisionIfB: [
      'keep the fitter off the walkway until the other crane is booked off the runway and its '
      + 'driver has been told',
    ],
    requiredClarificationSemantics:
      'a question that would settle whether the act occurred: confirmation from the supervisor, '
      + 'from the other crane\'s driver, or from the bay\'s booking record, that the crane was '
      + 'booked off and the driver told. Asking whether the ACT happened is CORRECT on this case '
      + 'and is not a process substitution.',
    requiredClarificationCriticality: 'BLOCKING_NOT_REQUIRED',
    requiredDeclarationBindingIfBlocking:
      'if a clarification about the booking-off is marked BLOCKING it must carry an authored '
      + 'answersUnresolvedFactDeclarationId naming that declaration. If none is marked BLOCKING, '
      + 'that half of axis J is recorded NOT_EXERCISED for this case.',
    acceptableEvidence: [
      'the supervisor confirming he booked the other crane off and told its driver before the '
      + 'fitter arrived',
      'the other crane\'s driver confirming he was told and has stood down from the runway',
      'the bay\'s booking record showing the crane off the runway for this period',
      'carrying the act out now, which settles the entry by performing it',
    ],
    insufficientEvidence: [
      'the fitter\'s impression that it was arranged at the start of the shift',
      'seeing that the other crane is standing at the far end of the bay, which its driver can '
      + 'change at any moment',
      'the fact that the standing arrangement exists',
      'the smaller crane being isolated, which bears on its own motion and not on the other crane',
    ],
    overallAuthorizationBoundary:
      'REQUIRED TO BE AVAILABLE. This entry is the only thing in the way, so authorizing the climb '
      + 'is the frozen correct consequence of the positive branch. This is the load-bearing half of '
      + 'the narrowing control.',
    overallAuthorizationPermitted: true,
    siblingUnresolvedFacts: [],
    prohibitedDestructiveAlignment: [
      'converting missingFact into a physical-state proxy such as "whether the other crane will '
      + 'traverse the runway" or "whether the runway is clear", which drops the act the '
      + 'arrangement requires',
      'converting the branches into positions of the other crane rather than whether it was booked '
      + 'off and its driver told',
    ],
    prohibitedDeclarations: [
      'a declaration about the isolation of the smaller crane, which the text establishes is locked '
      + 'off with the fitter\'s own lock',
      'a declaration about the walkway or its hand rails, which the text establishes were checked '
      + 'and are sound',
      'a declaration about the barrier beneath, the fitter\'s training, or his harness and lanyard, '
      + 'all of which the text establishes',
      'a second declaration invented to give the positive decision something to be contained '
      + 'against',
    ],
    evaluationQuestions: [
      { id: 'G3.Q1', axis: 'A', mandatory: false,
        question: 'Was the booking-off property emitted as a declaration, rather than surviving '
          + 'only as a clarification, a hazard candidate or narrative?',
        expected: 'PASS' },
      { id: 'G3.Q2', axis: 'H', mandatory: true,
        question: 'MANDATORY. Does the declaration correctly keep the required act itself as the '
          + 'owed property: does missingFact name the other crane being booked off and its driver '
          + 'told, rather than being converted into a physical-state proxy such as whether the '
          + 'runway is clear? FAIL if GATE 12 was applied as a ban on checks, procedures or '
          + 'arrangements, or as a global preference for physical-state properties.',
        expected: 'PASS' },
      { id: 'G3.Q3', axis: 'H', mandatory: true,
        question: 'MANDATORY. Do branchA and branchB remain act-shaped, partitioning whether the '
          + 'booking-off and the telling occurred, rather than being forcibly converted into '
          + 'positions or movements of the other crane?',
        expected: 'PASS' },
      { id: 'G3.Q4', axis: 'H', mandatory: true,
        question: 'MANDATORY. With no sibling blocker, does the positive branch authorize the climb '
          + 'without artificial qualification: does decisionIfA say the work may go ahead rather '
          + 'than hedging against open entries or outstanding checks that do not exist? FAIL if '
          + 'GATE 12 was applied as a global hedging requirement.',
        expected: 'PASS' },
      { id: 'G3.Q5', axis: 'B', mandatory: false,
        question: 'Does the property name the arrangement that governs THIS walkway before anyone '
          + 'goes onto it, rather than crane safety or runway safety in general?',
        expected: 'PASS' },
      { id: 'G3.Q6', axis: 'E', mandatory: false,
        question: 'Do decisionIfA and decisionIfB follow from the branches being TRUE, rather than '
          + 'from whether a record of the booking-off has been produced?',
        expected: 'PASS' },
      { id: 'G3.Q7', axis: 'F', mandatory: false,
        question: 'Does the clarification seek information capable of settling whether the act '
          + 'occurred, without being downgraded into whether a booking record exists?',
        expected: 'PASS' },
      { id: 'G3.Q8', axis: 'I', mandatory: false,
        question: 'Was any fact the text establishes, in particular the isolation, the walkway hand '
          + 'rails, the barrier, the training or the harness, declared as an owed fact; and was any '
          + 'second entry invented for the positive decision to be qualified against?',
        expected: 'PASS: not declared and none invented' },
      { id: 'G3.Q9', axis: 'J', mandatory: false,
        question: 'Are all four of branchA, branchB, decisionIfA and decisionIfB real content, and '
          + 'is any BLOCKING clarification bound by an authored '
          + 'answersUnresolvedFactDeclarationId? Binding half NOT_EXERCISED if nothing is BLOCKING.',
        expected: 'PASS' },
    ],
  },
];

// ================================================================ axes

export interface R4ConfirmationAxis {
  id: string;
  name: string;
  question: string;
  vocabulary: readonly string[];
  /** Frozen BEFORE execution. NOT_APPLICABLE is valid only where it appears here. */
  notApplicableFrozenFor: readonly string[];
  notApplicableBasis: string;
}

export const R4_CONFIRMATION_AXES: readonly R4ConfirmationAxis[] = [
  { id: 'A', name: 'REQUIRED_FACT_RECALL',
    question: 'Did the frozen owed property emit as a declaration in its own right?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: [],
    notApplicableBasis: 'every §210H case expects exactly one declaration.' },
  { id: 'B', name: 'EXACT_PROPERTY',
    question: 'Does the declaration target the frozen property at the frozen scope, rather than a '
      + 'broader, narrower or different one?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: [],
    notApplicableBasis: 'every case names an exact owed property.' },
  { id: 'C', name: 'PROPERTY_VS_PROCESS_SELECTION',
    question: 'Where the process or the evidence is NOT the property, did the model select the '
      + 'underlying safety state rather than the process or evidence that would establish it?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: ['G3'],
    notApplicableBasis: 'on G3 the act IS the property, so there is no defect-direction '
      + 'opportunity to fail on selection. The overcorrection direction, whether GATE 12 became a '
      + 'preference for physical-state properties, is adjudicated on axis H. A PASS here would be '
      + 'vacuous.' },
  { id: 'D', name: 'BRANCH_PROPERTY_ALIGNMENT',
    question: 'Do branchA and branchB partition the owed property itself, rather than partitioning '
      + 'confirmed against unconfirmed, tested against untested, or recorded against unrecorded?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: ['G3'],
    notApplicableBasis: 'G3\'s branches are required to be ACT-shaped, and whether they stayed so '
      + 'is the narrowing question adjudicated on axis H. Scoring the same fields twice, on an '
      + 'axis whose question is about state partitioning, would misreport one judgement as two.' },
  { id: 'E', name: 'DECISION_PROPERTY_ALIGNMENT',
    question: 'Do decisionIfA and decisionIfB follow from the truth of their own branches, rather '
      + 'than from whether evidence has been collected, produced or filed?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: [],
    notApplicableBasis: 'every case emits decisions and every case can fail this.' },
  { id: 'F', name: 'CLARIFICATION_SETTLES_PROPERTY',
    question: 'Does the clarification seek information capable of settling the owed property, '
      + 'without redefining the property into whether that information was obtained?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: [],
    notApplicableBasis: 'CONDITIONALLY exercised. Recorded NOT_EXERCISED for a case whose output '
      + 'contains no clarification addressing the owed fact, because there is then no genuine '
      + 'opportunity to fail. This conditional rule is frozen before execution.' },
  { id: 'G', name: 'STATE_WORLD_PLACEMENT',
    question: 'Does the frozen world in which the state is satisfactory and the confirming '
      + 'evidence was never obtained land on the satisfactory branch rather than the adverse one?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: ['G3'],
    notApplicableBasis: 'G3 has no such world: the act IS the state, so the act not having '
      + 'occurred is the adverse state and there is nothing to misplace.' },
  { id: 'H', name: 'PROCESS_AS_PROPERTY_NARROWING',
    question: 'Did the §210G narrowing survive: may an act still BE the property, may its branches '
      + 'stay act-shaped, and may a sole-blocker positive decision still authorize the work '
      + 'unqualified?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: ['G1', 'G2'],
    notApplicableBasis: 'G3 is the case constructed to carry the narrowing control. G1 and G2 have '
      + 'no act-shaped property and no frozen requirement for unqualified authorization, so the '
      + 'control has no genuine opportunity to fail on them.' },
  { id: 'I', name: 'FALSE_GAP_RESTRAINT',
    question: 'Did any fact the observation ESTABLISHES, or any invented entry, become an owed '
      + 'declaration?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: [],
    notApplicableBasis: 'every case carries established facts that could be over-declared.' },
  { id: 'J', name: 'DECLARATION_CONTRACT_COMPLETENESS',
    question: 'Are all four branch and decision fields real content, and is every BLOCKING '
      + 'clarification bound by an authored answersUnresolvedFactDeclarationId?',
    vocabulary: ['PASS', 'FAIL'], notApplicableFrozenFor: [],
    notApplicableBasis: 'this axis is where a NEW substantive regression in a closed mechanism '
      + 'lands. Its binding half is conditionally exercised, as axis F is.' },
];

// ================================================================ closed mechanisms

export const CLOSED_MECHANISM_POLICY = {
  status: 'R5, R6 and R7 are CLOSED on §210F targeted evidence.',
  notTargets: 'no §210H stimulus was shaped to exercise them, and §210H is not a retest of them.',
  regressionRule:
    'if the output naturally exercises one, a NEW SUBSTANTIVE REGRESSION still counts as a '
    + 'failure. R5 binding and R7 placeholder rejection land on axis J. R6 containment cannot be '
    + 'exercised at all, because every §210H case expects exactly one declaration and containment '
    + 'is owed only to an open sibling; it is recorded NOT_EXERCISED across the probe rather than '
    + 'scored.',
  artificialStimuliProhibited:
    'no case may be enlarged, and no second fact added, merely to exercise a closed mechanism.',
  r6Status: 'NOT_EXERCISED_ACROSS_THE_PROBE',
} as const;

// ================================================================ adjudication rules

export const ADJUDICATION_RULES = {
  conditionalClarificationExercise:
    'Axis F is exercised on a case only if that case\'s output contains a clarification addressing '
    + 'the owed fact. Otherwise it is recorded NOT_EXERCISED for that case, never PASS.',
  conditionalBindingExercise:
    'The binding half of axis J is exercised on a case only if that case\'s output contains at '
    + 'least one clarification with criticality BLOCKING. Otherwise that half is recorded '
    + 'NOT_EXERCISED, never PASS. The four-field half of axis J is always exercised.',
  missingDeclarationRule:
    'If the frozen required declaration is absent, axis A FAILS for that case and axes B, C, D, E, '
    + 'F, G, H and J for that missing entry are recorded NOT_EXERCISED, never PASS. An axis with '
    + 'no genuine opportunity to fail is never scored as correct.',
  placeholderRefusalRule:
    'If the deterministic projection refuses a declaration with NON_SEMANTIC_PLACEHOLDER_VALUE, '
    + 'that is a SEMANTIC FAIL on axis J for that case. It is model-authored filler detected '
    + 'deterministically, NOT a structural or transport failure, and it is not converted into one.',
  structuralFailureRule:
    'A transport, HTTP, schema or tooling failure is RECORDED as a structural failure and is NEVER '
    + 'converted into a model semantic verdict. A case that does not reach inference is recorded '
    + 'as not executed and its axes are NOT_EXERCISED.',
  noDeterministicAlignmentVerdict:
    'R4B has no deterministic half. No code reads a branch and decides whether it tracks the state '
    + 'or the evidence; that judgement is made by a reader against this frozen truth. Deterministic '
    + 'code contributes the contract result only.',
  noPostOutputTruthEdits:
    'Once execution begins no frozen truth in this file changes. A truth defect discovered after '
    + 'execution is recorded beside the frozen text as a PREREGISTRATION_DEFECT and is never '
    + 'silently repaired.',
  noPartialCredit:
    'PASS or FAIL only. No partial credit, no aggregate compensation, no post-hoc axes, no axis '
    + 'introduced after output is seen.',
  countIsNotValidation:
    'Reaching three of three executed cases is instrument completion, not validation and not '
    + 'acceptance. Only the frozen questions decide the terminal.',
} as const;

export const PASS_RULE = {
  rule: 'Every exercised frozen evaluation question must PASS.',
  mandatoryQuestions: [
    'G1.Q3', 'G1.Q5', 'G1.Q7', 'G2.Q2', 'G2.Q3', 'G2.Q4', 'G3.Q2', 'G3.Q3', 'G3.Q4',
  ],
  mandatoryRule: 'All mandatory questions must PASS. A mandatory question is never NOT_EXERCISED: '
    + 'its case is constructed so the question has a genuine opportunity to fail.',
  cleanResultRequires: [
    'every exercised frozen evaluation question PASS',
    'every mandatory question PASS',
    'the G1 + G3 narrowing pair PASS',
    'no new substantive regression in a naturally exercised closed mechanism',
  ],
  onOneSubstantiveFailure: 'EXPERT_HAZLENZ_R4_ALIGNMENT_REQUIRES_REVIEW',
  onCleanResult: 'EXPERT_HAZLENZ_FIRST_PASS_DEVELOPMENT_CONFIRMED — '
    + 'TARGETED_VERIFIER_VALIDATION_REQUIRED',
  stoppingRuleOnClean:
    'FIRST-PASS PROMPT REMEDIATION ENDS. Do not create another first-pass probe, do not search for '
    + 'another speculative first-pass failure family, and do not modify the first-pass instruction '
    + 'absent genuinely new contradictory evidence from later integration or regression work. '
    + 'Proceed to TARGETED VERIFIER VALIDATION.',
  whyStrict: 'three cases aimed at one named mechanism and one narrowing. A failure on a case '
    + 'built to expose exactly that mechanism is information, not noise.',
  notApplicableRule: 'NOT_APPLICABLE is valid only where this file freezes it for that case, '
    + 'before execution. NOT_EXERCISED is valid only under the frozen conditional rules above.',
  retries: 0,
  postOutputTruthEdits: 0,
  isAcceptance: false,
  isNot: [
    'Expert HazLenz acceptance',
    'production validation',
    'an accuracy percentage',
    'proof of verifier correctness',
    'G6 closure',
    'evidence about S6',
    'end-to-end acceptance',
  ],
} as const;

/** The decisive pair. Both halves must PASS or the narrowing was not demonstrated. */
export const NARROWING_PAIR = {
  question: 'Did GATE 12 separate evidence-that-establishes-a-state from an-act-that-is-the-state?',
  provenBy: {
    G1: 'evidence used to establish a state does not become the state',
    G3: 'an act that is itself decision-critical may remain the property',
  },
  answeredBy: ['G1.Q3', 'G1.Q5', 'G3.Q2', 'G3.Q3'],
  rule: 'BOTH halves must PASS. A system that globally strips process language passes G1 and fails '
    + 'G3. A system that globally preserves process language passes G3 and fails G1. Only the pair '
    + 'distinguishes a correctly narrowed GATE 12 from either degenerate strategy.',
} as const;

export const S6_STATUS = {
  rule: 'S6',
  status: 'NOT_EXERCISED',
  reason: 'every §210H case is capability-ABSENT and the capability-PRESENT first-pass grammar '
    + 'remains refused by the provider. §210H does not attempt to validate S6.',
  architecturalRecommendation: 'retain the separate governed stage',
  prohibition: 'do not weaken first-pass grammar validation merely to make governed evidence fit',
} as const;

// ================================================================ well-formedness

/**
 * Problems that would let a non-discriminating instrument through. Empty means the set is well
 * formed. The builder REFUSES to freeze while this returns anything.
 */
export function r4ConfirmationProblems(): string[] {
  const problems: string[] = [];

  /** Evaluation vocabulary inside an observation hands the model the answer. */
  const LABEL_WORDS =
    /decision-critical|decision-neutral|conjunctive|\bconjunct\b|\bproxy\b|orphan|false gap|placeholder|filler|fact-local|overcorrection|property purity|alignment|state-world|substitution|\bbinding\b/i;
  const PB_VOCAB =
    /kerb|cut-off saw|bowser|water suppression|take-up|counterweight carriage|local exhaust|capture arm|chain sling|sling leg|two-leg|block valve|bleed valve|double block|\bbund\b|dispenser|fuel bay|haul truck refuel|pallet racking|bowed upright|scissor lift|thorough examination certificate/i;
  const D_VOCAB =
    /power press|light curtain|clutch and brake|separation distance|\bladle\b|reline|preheat|foundry|telehandler|overhead line|goalpost|development heading|jumbo|scaling bar|barred down|blast enclosure|blasting helmet|breathing-air compressor|stillage/i;
  const E_VOCAB =
    /precast|casting bed|maturity probe|companion cube|lifting anchor|balance tank|spray ball|caustic|cycle-complete|underrun|trailer lock|drummed lubricant|protective board|robot welding cell|reduced-speed cycle|locating pin|wire feed/i;

  if (R4_CONFIRMATION_STIMULI.length !== 3) {
    problems.push(`${R4_CONFIRMATION_STIMULI.length} stimuli, expected exactly 3`);
  }
  if (new Set(R4_CONFIRMATION_STIMULI.map(s => s.caseId)).size !== R4_CONFIRMATION_STIMULI.length) {
    problems.push('duplicate case ids');
  }
  const allQ = R4_CONFIRMATION_STIMULI.flatMap(s => s.evaluationQuestions.map(q => q.id));
  if (new Set(allQ).size !== allQ.length) problems.push('duplicate question ids');

  for (const s of R4_CONFIRMATION_STIMULI) {
    if (LABEL_WORDS.test(s.observation)) problems.push(`${s.caseId}: observation labels the answer`);
    if (PB_VOCAB.test(s.observation)) problems.push(`${s.caseId}: replays PB-case vocabulary`);
    if (D_VOCAB.test(s.observation)) problems.push(`${s.caseId}: replays §210D vocabulary`);
    if (E_VOCAB.test(s.observation)) problems.push(`${s.caseId}: replays §210F vocabulary`);
    if (/\bPB-0\d\b|\bD[1-5]\b|\bE[1-4]\b|\bG[1-3]\b/.test(s.observation)) {
      problems.push(`${s.caseId}: names a prior or current case`);
    }
    if (s.observation.length < 450) problems.push(`${s.caseId}: observation too thin`);
    if (s.governedEvidence.length !== 0) {
      problems.push(`${s.caseId}: §210H is capability-ABSENT on every case; governed evidence found`);
    }
    if (s.decisionUnderAnalysis.length < 20) problems.push(`${s.caseId}: decision unfrozen`);
    if (s.expectedDeclarationCount !== 1) {
      problems.push(`${s.caseId}: §210H is one declaration per case; found `
        + `${s.expectedDeclarationCount}`);
    }
    if (s.requiredOwedProperty.length < 30) problems.push(`${s.caseId}: owed property unfrozen`);
    if (s.prohibitedProxyOrProcessProperties.length === 0) {
      problems.push(`${s.caseId}: names no prohibited proxy or process property`);
    }
    if (s.prohibitedDeclarations.length === 0) {
      problems.push(`${s.caseId}: names no established fact to withhold, so restraint is untested`);
    }
    if (s.prohibitedDestructiveAlignment.length === 0) {
      problems.push(`${s.caseId}: names no prohibited destructive alignment`);
    }
    if (s.requiredBranchA.length < 20 || s.requiredBranchB.length < 20) {
      problems.push(`${s.caseId}: a branch semantics is unfrozen`);
    }
    if (s.requiredDecisionIfA.length === 0 || s.requiredDecisionIfB.length === 0) {
      problems.push(`${s.caseId}: a decision semantics is unfrozen`);
    }
    if (s.requiredClarificationSemantics.length < 30) {
      problems.push(`${s.caseId}: clarification semantics unfrozen`);
    }
    if (s.requiredDeclarationBindingIfBlocking.length < 30) {
      problems.push(`${s.caseId}: binding requirement unfrozen`);
    }
    if (s.acceptableEvidence.length === 0) problems.push(`${s.caseId}: no acceptable evidence`);
    if (s.insufficientEvidence.length === 0) problems.push(`${s.caseId}: no insufficient evidence`);
    if (s.perfectKnowledgeTest.length < 40) problems.push(`${s.caseId}: selection test unfrozen`);
    if (s.stateWorldBasis.length < 40) problems.push(`${s.caseId}: state-world basis unfrozen`);
    if (s.overallAuthorizationBoundary.length < 20) {
      problems.push(`${s.caseId}: authorization boundary unfrozen`);
    }
    if (s.evaluationQuestions.length === 0) problems.push(`${s.caseId}: no evaluation questions`);

    // The two role fields must agree with the state-world placement.
    const actIsProperty = s.processOrEvidenceRole === 'THE_PROPERTY_ITSELF';
    if (actIsProperty !== (s.stateWorldPlacement === 'NO_SUCH_WORLD_ACT_IS_THE_PROPERTY')) {
      problems.push(`${s.caseId}: the process role and the state-world placement disagree`);
    }

    for (const q of s.evaluationQuestions) {
      if (!q.id.startsWith(`${s.caseId}.`)) problems.push(`${q.id}: id does not name its case`);
      const axis = R4_CONFIRMATION_AXES.find(a => a.id === q.axis);
      if (axis === undefined) problems.push(`${q.id}: axis ${q.axis} is not a frozen axis`);
      if (!q.expected.startsWith('PASS')) problems.push(`${q.id}: expected verdict is not a PASS`);
      if (axis !== undefined && axis.notApplicableFrozenFor.includes(s.caseId)) {
        problems.push(`${q.id}: axis ${q.axis} is frozen NOT_APPLICABLE for ${s.caseId}`);
      }
    }
  }

  /** Every axis must be exercised by at least one case and carry at least one question. */
  for (const a of R4_CONFIRMATION_AXES) {
    const exercised = R4_CONFIRMATION_STIMULI
      .filter(s => !a.notApplicableFrozenFor.includes(s.caseId)).map(s => s.caseId);
    if (exercised.length === 0) problems.push(`axis ${a.id} is exercised by no case`);
    const probed = R4_CONFIRMATION_STIMULI
      .flatMap(s => s.evaluationQuestions).filter(q => q.axis === a.id);
    if (probed.length === 0) problems.push(`axis ${a.id} has no evaluation question`);
    if (a.notApplicableFrozenFor.length > 0 && a.notApplicableBasis.length < 20) {
      problems.push(`axis ${a.id} freezes NOT_APPLICABLE without a basis`);
    }
  }
  for (const id of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) {
    if (!R4_CONFIRMATION_AXES.some(a => a.id === id)) {
      problems.push(`axis ${id} is required by the authorization and is missing`);
    }
  }

  /** Every mandatory question must exist and be marked mandatory on its stimulus, and vice versa. */
  for (const id of PASS_RULE.mandatoryQuestions) {
    const q = R4_CONFIRMATION_STIMULI.flatMap(s => s.evaluationQuestions).find(x => x.id === id);
    if (q === undefined) problems.push(`mandatory question ${id} does not exist`);
    else if (!q.mandatory) problems.push(`${id} is listed mandatory but not marked mandatory`);
  }
  for (const q of R4_CONFIRMATION_STIMULI.flatMap(s => s.evaluationQuestions)) {
    if (q.mandatory && !PASS_RULE.mandatoryQuestions.includes(q.id as never)) {
      problems.push(`${q.id} is marked mandatory but is not in the frozen mandatory list`);
    }
  }
  /** The authorization names eight mandatory subjects; G2's is split across branches and decisions. */
  if (PASS_RULE.mandatoryQuestions.length < 8) {
    problems.push('fewer mandatory questions than the authorization requires');
  }

  /** The narrowing pair only works if both halves exist, on opposite cases. */
  {
    for (const id of NARROWING_PAIR.answeredBy) {
      if (!allQ.includes(id)) problems.push(`narrowing question ${id} does not exist`);
    }
    const cases = new Set(NARROWING_PAIR.answeredBy.map(id => id.split('.')[0]));
    if (!cases.has('G1') || !cases.has('G3')) {
      problems.push('the narrowing pair must span G1 and G3 or it does not oppose');
    }
    if (!NARROWING_PAIR.answeredBy.every(id => PASS_RULE.mandatoryQuestions.includes(id as never))) {
      problems.push('every narrowing-pair question must also be mandatory');
    }
  }

  /** G3 must actually be load bearing. */
  {
    const g3 = R4_CONFIRMATION_STIMULI.find(s => s.caseId === 'G3');
    if (g3 === undefined) problems.push('G3 is mandatory and is missing');
    else {
      if (g3.processOrEvidenceRole !== 'THE_PROPERTY_ITSELF') {
        problems.push('G3 must freeze the act as the property itself or it controls nothing');
      }
      if (g3.siblingUnresolvedFacts.length !== 0) {
        problems.push('G3 must have no sibling blocker or the authorization control cannot fire');
      }
      if (!g3.overallAuthorizationPermitted) {
        problems.push('G3 must permit unqualified overall authorization');
      }
      if (g3.evaluationQuestions.filter(q => q.axis === 'H' && q.mandatory).length !== 3) {
        problems.push('G3 must carry all three mandatory narrowing questions on axis H: property, '
          + 'branches, and unqualified authorization');
      }
    }
  }

  /** G1 and G2 must actually be defect-direction cases. */
  for (const id of ['G1', 'G2'] as const) {
    const s = R4_CONFIRMATION_STIMULI.find(x => x.caseId === id);
    if (s === undefined) { problems.push(`${id} is missing`); continue; }
    if (s.processOrEvidenceRole !== 'EVIDENCE_ONLY') {
      problems.push(`${id} must freeze the process as evidence, not as the property`);
    }
    if (s.stateWorldPlacement !== 'SATISFACTORY_BRANCH') {
      problems.push(`${id} must freeze the state-true-and-unestablished world on the satisfactory `
        + 'branch or the trap is not set');
    }
    if (s.siblingUnresolvedFacts.length !== 0) {
      problems.push(`${id} must carry no sibling, so containment is not silently under test`);
    }
  }

  /** G1 must carry the branch trap; G2 must carry the selection trap. */
  {
    const g1 = R4_CONFIRMATION_STIMULI.find(s => s.caseId === 'G1');
    if (g1 !== undefined && !g1.evaluationQuestions.some(q => q.axis === 'G' && q.mandatory)) {
      problems.push('G1 must carry the mandatory state-world placement question');
    }
    if (g1 !== undefined && !g1.evaluationQuestions.some(q => q.axis === 'F' && q.mandatory)) {
      problems.push('G1 must carry the mandatory clarification question');
    }
    const g2 = R4_CONFIRMATION_STIMULI.find(s => s.caseId === 'G2');
    if (g2 !== undefined && !g2.evaluationQuestions.some(q => q.axis === 'C' && q.mandatory)) {
      problems.push('G2 must carry the mandatory property-selection question');
    }
    if (g2 !== undefined
      && !(g2.evaluationQuestions.some(q => q.axis === 'D' && q.mandatory)
        && g2.evaluationQuestions.some(q => q.axis === 'E' && q.mandatory))) {
      problems.push('G2 must adjudicate branches AND decisions as mandatory');
    }
  }

  /** Containment must not be silently under test anywhere. */
  if (R4_CONFIRMATION_STIMULI.some(s => s.siblingUnresolvedFacts.length > 0)) {
    problems.push('a case carries a sibling fact, which would reopen R6 as a target');
  }

  /** Two cases must not share an industry setting, or they are one case twice. */
  {
    const locations = R4_CONFIRMATION_STIMULI.map(s => s.suppliedContext.location.split(',')[0]);
    if (new Set(locations).size !== locations.length) {
      problems.push('two cases share an industry setting');
    }
  }

  return problems;
}
