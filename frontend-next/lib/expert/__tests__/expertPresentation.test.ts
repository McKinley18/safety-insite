/**
 * §265 — THE FRONTEND AUTHORITY BOUNDARY AND THE EIGHT STATE PRESENTATIONS.
 *
 * Runs with `npx tsx lib/expert/__tests__/expertPresentation.test.ts` (no test runner is configured
 * in this workspace, so this is a self-checking script rather than a framework suite — the same
 * convention as `lib/inspection/__tests__/standardDisplayBacking.test.ts`).
 *
 * ---------------------------------------------------------------------------------------------
 * THIS IS WHERE ACCEPTANCE CASE K IS EXECUTED.
 *
 * K: the frontend does not expose a settled decision while an analysis awaits confirmation. The
 * server suite cannot prove that — it can only prove the server said so. What must be checked here
 * is that the browser, handed that response, does not turn it into a conclusion anyway.
 *
 * ---------------------------------------------------------------------------------------------
 * THE FIXTURES ARE THE REAL SERVER SHAPE.
 *
 * `analysisAvailable()` below is built from the payload the §265 backend acceptance actually
 * captured, at `verification/expert-hazlenz-265-.../SECTION-265-READ-PAYLOAD-SHAPE.json`. Writing
 * these against an imagined shape would test the presentation module against a contract the server
 * does not serve, which is how a UI passes its own tests and renders blanks in production.
 */
import {
  classificationLabel,
  readFromExecution,
  hazardFamilyLabel,
  historyEntryLabel,
  posturePresentation,
  posturePresentationLabel,
  presentExpertAnalysis,
  subjectDisplayText,
  type ExpertPresentation,
} from "../expertPresentation";
import type { ExpertAnalysisRead, ExpertAnalysisState } from "../expertTypes";

const failures: string[] = [];
function check(condition: unknown, message: string) {
  if (condition) {
    console.log(`ok  ${message}`);
  } else {
    failures.push(message);
    console.error(`FAILED  ${message}`);
  }
}

// The vocabulary that may never describe an unsettled conclusion.
const SETTLED_WORDS = /\b(approved|final|finali[sz]ed|safe to proceed|cleared|signed off)\b/i;
/**
 * THE CLAIM A REFUSAL OR A FAILURE MUST NEVER BE TURNED INTO.
 *
 * Checked against the DENIAL REMOVED, deliberately. The product's own failure sentence is "This is
 * not a finding that there are no hazards", which is the correct sentence and which a naive
 * substring check reads as the very thing it denies — the same trap §261's P0-A assertion
 * documents on the server. So the explicit denial is stripped first, and what remains is tested
 * for an assertion of absence.
 */
const NO_HAZARDS_DENIAL = /\bnot a finding that there (are|were) no hazards\b/gi;
const assertsNoHazards = (text: string): boolean =>
  /no hazards?\b/i.test(String(text).replace(NO_HAZARDS_DENIAL, ""));

const QUOTE = "the drive motor is still connected to power with no lock or tag applied";

function admittedSnapshot(options: {
  withDeclaration?: boolean;
  declarationRefusals?: number;
} = {}) {
  const declaration = {
    declarationId: "decl-stored-energy-state",
    missingFact: "whether stored energy in the drive has been dissipated",
    whyNecessaryNow: "the millwright is inside the guard opening now",
    decisionWhileUnresolved: "treat the drive as carrying stored energy and keep the millwright clear",
    decisionIfA: "isolation alone is sufficient before work continues",
    decisionIfB: "the stored energy is released and verified before work continues",
  };
  return {
    kind: "EXPERT_HAZLENZ_SERVER_AUTHORED_ANALYSIS",
    status: "COMPLETE",
    admission: "ADMIT",
    candidateIdentity: "0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee",
    contractVersion: "hazlenz.expert.first-pass.259",
    declarationRefusals: Array.from({ length: options.declarationRefusals ?? 0 }, () => ({
      declarationId: "decl-stored-energy-state", codes: ["EVIDENCE_SPAN_NOT_VERBATIM"],
    })),
    postureRefusalCodes: [],
    conformanceViolations: [],
    posture: {
      posture: "CONTINUE_WITH_CONTROLS",
      whatHappensNow: "the drive is isolated and locked out before the millwright continues",
      requiredControls: [{
        control: "isolate and lock out the drive motor before any further work",
        timing: "BEFORE_WORK_RESUMES",
        controlId: "ctl-isolate-drive",
      }],
      resumeCondition: { correctionsRequired: [], resolvedByDeclarationIds: [] },
      acceptedWithoutImmediateAction: [],
      requiredBy: [{
        ref: "drive-stored-energy", refKind: "HAZARD_CANDIDATE",
        driverRole: "ESTABLISHED_CONDITION_REQUIRING_CONTROLS",
      }],
    },
    analysis: {
      outcome: "ANALYZED",
      expertHazardCandidates: [{
        candidateKey: "drive-stored-energy",
        hazardFamily: "lockout_tagout",
        confidence: "HIGH",
        reasoning: "a person working inside a guard opening on a live drive is exposed to start-up",
        evidenceBasis: "the observation states the drive motor is still connected to power",
        evidence: [{ sourceId: "observation", quotedText: QUOTE }],
        groundingStatus: "EXACT_QUOTE_SUPPLIED",
        relationshipToDeterministic: "ADDITIONAL_TO_DETERMINISTIC",
      }],
      unresolvedFactDeclarations: options.withDeclaration ? [declaration] : [],
      decisionCriticalClarifications: [],
      crossHazardInsights: [],
      disagreements: [],
      expertExplanation: { summary: "the drive must be isolated before work continues" },
      uncertainty: { statements: ["whether stored energy in the drive has been dissipated"] },
      immediateSafetyPosture: { posture: "CONTINUE_WITH_CONTROLS" },
    },
  };
}

function read(overrides: Partial<ExpertAnalysisRead>): ExpertAnalysisRead {
  return {
    responseVersion: "hazlenz.expert.265.read-response.v1",
    present: true,
    analysisId: "a1",
    analysisState: "ANALYSIS_AVAILABLE",
    producer: "server_authored",
    confirmationRequired: false,
    confirmationSubject: null,
    answerOptions: [],
    effectiveDecision: {
      version: "hazlenz.expert.264.effective-decision.v1",
      source: "EXPERT_ADMITTED_NO_CONFIRMATION_REQUIRED",
      settledForUse: true,
      humanSettled: false,
      entries: [],
      reviewer: null,
      statement: "This Expert analysis was admitted and required no human confirmation.",
    },
    authorityStatement: "This Expert analysis is available for review.",
    analysis: admittedSnapshot(),
    settlement: null,
    provenance: null,
    failure: null,
    history: [],
    findingsReconciled: false,
    ...overrides,
  };
}

const awaiting = (): ExpertAnalysisRead => read({
  analysisState: "ANALYSIS_AWAITING_CONFIRMATION",
  confirmationRequired: true,
  confirmationSubject: {
    resolvable: true,
    entries: [{
      refKind: "UNRESOLVED_DECLARATION",
      ref: "decl-stored-energy-state",
      expertClassification: "DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES",
    }],
    refusalCode: null,
    statement: "HazLenz classified one unresolved item.",
  },
  answerOptions: [
    { value: "CONTROLS_WHETHER_WORK_CONTINUES", label: "It decides whether work continues", detail: "" },
    { value: "DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES", label: "It is a follow-up", detail: "" },
  ],
  analysis: admittedSnapshot({ withDeclaration: true }),
  effectiveDecision: {
    version: "hazlenz.expert.264.effective-decision.v1",
    source: "NONE_AWAITING_HUMAN_CONFIRMATION",
    settledForUse: false,
    humanSettled: false,
    entries: [],
    reviewer: null,
    statement: "This analysis requires a person to settle its operational conclusion, and no one "
      + "has. It is not confirmed and it is not rejected.",
  },
  authorityStatement: "This Expert analysis is available for review, and its operational "
    + "conclusion requires a person to confirm it before it is acted on. It has not been confirmed.",
});

// ================================================================ K. the authority boundary

console.log("\n---- K. the frontend never exposes a settled decision while awaiting ----\n");

const awaitingView: ExpertPresentation = presentExpertAnalysis(awaiting());
check(awaitingView.view === "AWAITING_CONFIRMATION",
  "An awaiting analysis renders its own view, not the ordinary available one.");
check(awaitingView.mayPresentAsSettled === false,
  "K: an awaiting analysis may NOT be presented as settled.");
check(awaitingView.humanSettled === false,
  "K: an awaiting analysis reports that no human has settled it.");
check(!SETTLED_WORDS.test(awaitingView.headline),
  "K: the awaiting headline does not call the conclusion approved, final or cleared.");
check(!SETTLED_WORDS.test(awaitingView.statement),
  "K: the awaiting statement does not call the conclusion approved, final or cleared.");
check(awaitingView.posture !== null,
  "The proposed posture is still SHOWN while awaiting -- withholding the analysis would be the "
  + "opposite failure from overstating it.");
check(awaitingView.hazards.length === 1 && awaitingView.unresolved.length === 1,
  "The hazards and the unresolved fact are both available to render while awaiting.");
check(awaitingView.offerSettlementControls === true,
  "The confirm / change controls are offered when the server says the subject is resolvable.");

// THE CRITICAL NEGATIVE: the module must READ settledForUse, not infer it. A response whose state
// says awaiting but whose derivation says settled must follow the DERIVATION, because that is the
// field the server and every downstream consumer agree on.
const contradictory = awaiting();
contradictory.effectiveDecision = { ...contradictory.effectiveDecision!, settledForUse: true };
check(presentExpertAnalysis(contradictory).mayPresentAsSettled === true,
  "`mayPresentAsSettled` is a COPY of the server's settledForUse, not a local inference from the "
  + "state name.");

// And the reverse: an AVAILABLE state whose derivation says unsettled must not be presentable.
const availableButUnsettled = read({});
availableButUnsettled.effectiveDecision = {
  ...availableButUnsettled.effectiveDecision!, settledForUse: false,
};
check(presentExpertAnalysis(availableButUnsettled).mayPresentAsSettled === false,
  "An AVAILABLE state whose derivation says unsettled is NOT presentable as settled.");

// A response with no derivation at all fails closed.
const noDecision = read({ effectiveDecision: null });
check(presentExpertAnalysis(noDecision).mayPresentAsSettled === false,
  "A response carrying no effective decision fails closed rather than defaulting to settled.");

// ================================================================ the subject

console.log("\n---- awaiting-confirmation card ----\n");

const subjectText = subjectDisplayText(awaiting(), {
  refKind: "UNRESOLVED_DECLARATION", ref: "decl-stored-energy-state",
});
check(subjectText === "whether stored energy in the drive has been dissipated",
  "The confirmation subject is shown as the unresolved fact it points at.");
check(!/UNRESOLVED_DECLARATION|decl-stored-energy-state|refKind/.test(subjectText),
  "The internal refKind:ref pair is never shown to the reviewer.");
check(subjectDisplayText(awaiting(), { refKind: "UNRESOLVED_DECLARATION", ref: "no-such-ref" })
  === "An unresolved item in this analysis",
  "An unresolvable reference says so rather than printing an internal identifier.");

const unresolvableSubject = awaiting();
unresolvableSubject.confirmationSubject = {
  resolvable: false, entries: [], refusalCode: "CONFIRMATION_RULE_VERSION_DRIFTED",
  statement: "the product cannot currently establish exactly what it is asking",
};
check(presentExpertAnalysis(unresolvableSubject).offerSettlementControls === false,
  "A subject the server could not establish withdraws the confirm control rather than offering a "
  + "decision on an unknown question.");
check(presentExpertAnalysis(unresolvableSubject).mayPresentAsSettled === false,
  "An unresolvable subject still leaves the conclusion unsettled.");

// ================================================================ settled states

console.log("\n---- confirmed and overridden ----\n");

const confirmed = read({
  analysisState: "ANALYSIS_CONFIRMED",
  confirmationRequired: true,
  analysis: admittedSnapshot({ withDeclaration: true }),
  settlement: {
    reviewId: "r1", decision: "classification_confirmed", reviewedByUserId: "u1",
    reviewedAt: "2026-09-12T00:00:00.000Z", rationale: "matches what I saw",
    entries: [{
      refKind: "UNRESOLVED_DECLARATION", ref: "decl-stored-energy-state",
      expertClassification: "DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES",
      effectiveClassification: "DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES",
      changedByHuman: false,
    }],
  },
  effectiveDecision: {
    version: "v", source: "HUMAN_CONFIRMED_AS_AUTHORED", settledForUse: true, humanSettled: true,
    entries: [], reviewer: { userId: "u1", at: "2026-09-12T00:00:00.000Z" },
    statement: "A person reviewed this Expert analysis and confirmed its operational "
      + "classification as authored.",
  },
});
const confirmedView = presentExpertAnalysis(confirmed);
check(confirmedView.view === "CONFIRMED" && confirmedView.mayPresentAsSettled === true,
  "A confirmed analysis is settled and renders as confirmed.");
check(confirmedView.humanSettled === true, "A confirmed analysis records that a human settled it.");
check(confirmedView.reviewerChanges.length === 0,
  "A confirmation that changed nothing produces no reviewer-change entries.");

const overridden = read({
  analysisState: "ANALYSIS_OVERRIDDEN",
  confirmationRequired: true,
  analysis: admittedSnapshot({ withDeclaration: true }),
  settlement: {
    reviewId: "r2", decision: "classification_changed", reviewedByUserId: "u1",
    reviewedAt: "2026-09-12T00:00:00.000Z", rationale: "stored energy decides this job",
    entries: [{
      refKind: "UNRESOLVED_DECLARATION", ref: "decl-stored-energy-state",
      expertClassification: "DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES",
      effectiveClassification: "CONTROLS_WHETHER_WORK_CONTINUES",
      changedByHuman: true,
    }],
  },
  effectiveDecision: {
    version: "v", source: "HUMAN_REPLACED", settledForUse: true, humanSettled: true,
    entries: [], reviewer: { userId: "u1", at: "2026-09-12T00:00:00.000Z" },
    statement: "A person reviewed this Expert analysis and replaced its operational "
      + "classification. The human decision is authoritative.",
  },
});
const overriddenView = presentExpertAnalysis(overridden);
check(overriddenView.view === "OVERRIDDEN" && overriddenView.mayPresentAsSettled === true,
  "An overridden analysis is settled and renders as overridden.");
check(overriddenView.reviewerChanges.length === 1,
  "An override produces exactly one reviewer-change entry for the one changed subject.");
check(overriddenView.reviewerChanges[0].hazLenzProposed === "A follow-up, not a stop condition"
  && overriddenView.reviewerChanges[0].reviewerDecided === "Decides whether work continues",
  "The change entry states BOTH what HazLenz proposed and what the reviewer decided, so the "
  + "human value is never attributed to HazLenz.");
check(overriddenView.reviewerChanges[0].subject
  === "whether stored energy in the drive has been dissipated",
  "The change entry names the subject in the reviewer's language.");

// ================================================================ refusal, unresolved, failure

console.log("\n---- refusal, unresolved and failure ----\n");

const refused = read({
  analysisState: "ANALYSIS_REFUSED",
  analysis: admittedSnapshot(),
  effectiveDecision: {
    version: "v", source: "NONE_REFUSED", settledForUse: false, humanSettled: false,
    entries: [], reviewer: null,
    statement: "The Expert layer answered and the answer was refused in full. No conclusion is "
      + "offered.",
  },
});
const refusedView = presentExpertAnalysis(refused);
check(refusedView.view === "REFUSED" && refusedView.mayPresentAsSettled === false,
  "A refused analysis is not settled.");
check(refusedView.hazards.length === 0 && refusedView.controls.length === 0
  && refusedView.posture === null,
  "NO part of a refused output is rendered as a result -- not one hazard, not one control, not a "
  + "posture -- even though the snapshot still carries them.");
check(!assertsNoHazards(refusedView.headline) && !assertsNoHazards(refusedView.statement),
  "A refusal is never turned into 'no hazards found'.");

const unresolvedRead = read({
  analysisState: "ANALYSIS_UNRESOLVED",
  analysis: admittedSnapshot({ withDeclaration: true, declarationRefusals: 1 }),
  effectiveDecision: {
    version: "v", source: "NONE_UNRESOLVED_TRUTH_PRESERVED", settledForUse: false,
    humanSettled: false, entries: [], reviewer: null,
    statement: "The Expert output was refused and the unresolved facts it stated for itself are "
      + "preserved. No operational conclusion is offered.",
  },
});
const unresolvedView = presentExpertAnalysis(unresolvedRead);
check(unresolvedView.view === "UNRESOLVED" && unresolvedView.mayPresentAsSettled === false,
  "An unresolved analysis is not settled.");
check(unresolvedView.posture === null,
  "No posture is presented for an unresolved analysis.");
check(unresolvedView.unresolved.length === 1,
  "The PRESERVED unresolved fact IS shown -- that is what RR-7 preserved it for.");
check(unresolvedView.containedRefusalCount === 1,
  "The count of declarations the engine refused to use is surfaced rather than hidden.");
check(!assertsNoHazards(unresolvedView.statement),
  "An unresolved result is never described as an absence of hazards.");

const failed = read({
  present: false, analysisId: null, analysisState: null, analysis: null,
  effectiveDecision: null,
  authorityStatement: null,
});
const failedView = presentExpertAnalysis(failed);
check(failedView.view === "ABSENT" && failedView.mayPresentAsSettled === false,
  "An absent analysis is not settled.");
check(!assertsNoHazards(failedView.statement),
  "An absent analysis is never described as an absence of hazards.");
check(presentExpertAnalysis(null).view === "ABSENT",
  "A null response renders the absent view rather than throwing.");

// ---- ANALYSIS_FAILED is reachable ONLY from the execution response: a provider failure writes
// ---- no analysis row, so the read would report absence. The adapter is what keeps the two apart.
const executedFailure = readFromExecution({
  responseVersion: "hazlenz.expert.262.response.v1",
  outcome: "FAILED",
  executionId: "e1",
  executionState: "ANALYSIS_FAILED",
  analysisState: null,
  confirmationRequired: false,
  confirmationSubject: null,
  effectiveDecision: {
    version: "v", source: "NONE_EXPERT_UNAVAILABLE", settledForUse: false, humanSettled: false,
    entries: [], reviewer: null,
    statement: "The Expert layer could not be reached, so it produced no conclusion. This is not "
      + "a finding that there are no hazards.",
  },
  authorityStatement: "The Expert layer could not be reached, so it produced no analysis. This is "
    + "not a finding that there are no hazards. The deterministic analysis is unaffected.",
  analysisId: null,
  producer: null,
  analysis: null,
  provenance: {
    candidateIdentity: null, contractVersion: null, entryVersion: null, admissionVersion: null,
    projectionVersion: null, confirmationRuleVersion: null, admission: null,
    verifierReached: false, verifierNotReachedBecause: null, requestedAt: null, completedAt: null,
  },
  failure: { kind: "TRANSPORT_TIMEOUT", detail: "the provider did not answer" },
  findingsReconciled: false,
});
const executedFailureView = presentExpertAnalysis(executedFailure);
check(executedFailureView.view === "FAILED",
  "A provider failure renders the FAILED view, NOT the absent one -- a system failure and "
  + "'nothing has been run' are different facts.");
check(executedFailureView.mayPresentAsSettled === false,
  "A failed analysis is not settled.");
check(!assertsNoHazards(executedFailureView.headline)
  && !assertsNoHazards(executedFailureView.statement),
  "A failure is never turned into an absence of hazards.");
check(executedFailureView.hazards.length === 0 && executedFailureView.posture === null,
  "A failed analysis renders no content.");
check(!/TRANSPORT_TIMEOUT|provider|stack/i.test(
  executedFailureView.headline + executedFailureView.statement),
  "No provider or transport internals reach the failure's customer-facing strings.");

const executedAwaiting = readFromExecution({
  responseVersion: "hazlenz.expert.262.response.v1",
  outcome: "COMPLETED",
  executionId: "e2",
  executionState: "COMPLETED",
  analysisState: "ANALYSIS_AWAITING_CONFIRMATION",
  confirmationRequired: true,
  confirmationSubject: awaiting().confirmationSubject,
  effectiveDecision: awaiting().effectiveDecision!,
  authorityStatement: awaiting().authorityStatement!,
  analysisId: "a2",
  producer: "server_authored",
  analysis: admittedSnapshot({ withDeclaration: true }),
  provenance: executedFailure.provenance!,
  failure: null,
  findingsReconciled: false,
});
check(presentExpertAnalysis(executedAwaiting).view === "AWAITING_CONFIRMATION"
  && presentExpertAnalysis(executedAwaiting).mayPresentAsSettled === false,
  "The execution response and the read response produce the SAME presentation for one state.");

const running = read({
  analysisState: "ANALYSIS_RUNNING",
  analysis: null,
  effectiveDecision: {
    version: "v", source: "NONE_RUNNING", settledForUse: false, humanSettled: false,
    entries: [], reviewer: null,
    statement: "An Expert analysis is in progress. No conclusion exists yet.",
  },
});
const runningView = presentExpertAnalysis(running);
check(runningView.view === "RUNNING" && runningView.mayPresentAsSettled === false,
  "A running analysis is not settled.");
check(runningView.hazards.length === 0 && runningView.posture === null,
  "A running analysis renders NO partial result -- there is nothing yet to show.");

// A state this build does not know must not fall through to something benign.
const unknownState = read({ analysisState: "ANALYSIS_SOMETHING_NEW" as ExpertAnalysisState });
const unknownView = presentExpertAnalysis(unknownState);
check(unknownView.view === "UNRECOGNISED",
  "An unrecognised server state renders as unrecognised, never as an available analysis.");
check(unknownView.hazards.length === 0 && unknownView.posture === null,
  "An unrecognised state renders no content.");

// ================================================================ no internal vocabulary leaks

console.log("\n---- internal implementation noise stays internal ----\n");

const INTERNAL_TERMS =
  /RR-7|\bC2\b|driverRole|refKind|epistemicCharacter|roleJustification|PRESERVE_UNRESOLVED|ADMIT\b|conformanceViolation|postureRefusalCode|candidateIdentity|EXACT_QUOTE_SUPPLIED|ADDITIONAL_TO_DETERMINISTIC|hazlenz\.expert\./;

for (const [name, presentation] of Object.entries({
  awaiting: awaitingView, confirmed: confirmedView, overridden: overriddenView,
  refused: refusedView, unresolved: unresolvedView, running: runningView, absent: failedView,
  unrecognised: unknownView,
})) {
  const rendered = JSON.stringify({
    headline: presentation.headline,
    statement: presentation.statement,
    posture: presentation.posture,
    hazards: presentation.hazards.map((h) => ({ title: h.title, reasoning: h.reasoning })),
    controls: presentation.controls.map((c) => c.control),
    unresolved: presentation.unresolved.map((u) => u.missingFact),
    reviewerChanges: presentation.reviewerChanges,
  });
  check(!INTERNAL_TERMS.test(rendered),
    `No internal contract vocabulary reaches the ${name} view's customer-facing strings.`);
}

check(hazardFamilyLabel("lockout_tagout") === "Lockout tagout",
  "A hazard family is formatted rather than looked up in a client-held copy of the taxonomy.");
check(hazardFamilyLabel("") === "Hazard",
  "An empty hazard family falls back to a neutral word rather than rendering blank.");
/*
 * §299 / HZ-5 extended the fallback sentence, so this assertion no longer pins the literal — a
 * byte-exact expectation on user-facing prose fails on every wording change and says nothing about
 * the property. The PROPERTY is what §265 cared about, and it is now asserted directly, together
 * with the fail-closed half §299 added. The full posture vocabulary is exercised in
 * `posturePresentation299.test.ts`.
 */
const unreadable = posturePresentation("NOT_A_REAL_POSTURE");
check(/could not be read/i.test(unreadable.label),
  "An unreadable posture says so rather than being guessed at.");
check(unreadable.known === false,
  "An unreadable posture is not admitted into the known vocabulary.");
check(unreadable.label !== posturePresentationLabel("CONTINUE")
  && unreadable.label !== posturePresentationLabel("CONTINUE_WITH_CONTROLS"),
  "An unreadable posture never borrows a permissive posture's label.");
check(unreadable.restrictsWork === true,
  "An unreadable posture FAILS CLOSED: it is presented as restricting work, never as permitting it.");
check(classificationLabel("SOMETHING_ELSE") === "SOMETHING_ELSE",
  "An unknown classification is passed through rather than relabelled into a meaning it may "
  + "not have.");

// ================================================================ history

console.log("\n---- history keeps the two trust boundaries apart ----\n");

check(historyEntryLabel({ producer: "server_authored", humanSettled: false })
  !== historyEntryLabel({ producer: "client_supplied", humanSettled: false }),
  "A server-authored analysis and a client-supplied one are described differently.");
check(/settled by a person/.test(historyEntryLabel({
  producer: "server_authored", humanSettled: true,
})), "A settled analysis is marked as settled by a person in the history.");
check(!/settled by a person/.test(historyEntryLabel({
  producer: "client_supplied", humanSettled: false,
})), "A legacy client-supplied row is not rewritten into the new authority model.");

// ================================================================

console.log(`\n${failures.length === 0 ? "ALL CHECKS PASSED" : `${failures.length} FAILED`}`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
