import type {
  ExpertAnalysisExecuted,
  ExpertAnalysisRead,
  ExpertAnalysisState,
  ExpertEffectiveDecision,
} from "./expertTypes";

/**
 * §265 — WHAT THE INTERFACE SHOWS, DERIVED ONLY FROM WHAT THE SERVER SAID.
 *
 * ---------------------------------------------------------------------------------------------
 * THE ONE RULE THIS FILE EXISTS TO ENFORCE.
 *
 * The browser is a presentation and decision-capture layer. It does NOT determine whether
 * confirmation is required, derive the effective decision, classify drivers, infer posture
 * permissiveness, decide whether an analysis is authoritative, reconstruct settlement state, or
 * manufacture Expert provenance. Every one of those is a field on the server response, and every
 * function below either copies such a field or turns a server-supplied enum into a label.
 *
 * The single most important line in this module is `mayPresentAsSettled`, and it is a copy:
 *
 *     mayPresentAsSettled: read.effectiveDecision.settledForUse
 *
 * Not `state === "CONFIRMED" || state === "AVAILABLE"`. Not `!confirmationRequired`. A copy. Any
 * expression there would be a second opinion about authority formed in a browser, and the failure
 * mode of getting it wrong is telling an inspector that work may continue when no one has said so.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE VIEW KEY IS A TOTAL MAP AND NOT A CHAIN OF CONDITIONS.
 *
 * A conditional chain has a final `else`, and the benign-looking `else` for an unrecognised state
 * is "show the analysis". A map with an explicit unrecognised branch cannot do that: a state this
 * build does not know renders as "this cannot be displayed", never as a result.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY PRESENTATION AND AUTHORITY ARE SEPARATE FIELDS ON THE SAME OBJECT.
 *
 * `view` decides layout. `mayPresentAsSettled` decides whether a posture may be spoken of as a
 * conclusion. They are deliberately not the same thing: `ANALYSIS_AWAITING_CONFIRMATION` shows the
 * whole analysis — the hazards, the evidence, the unresolved facts, all of it — and still may not
 * present the posture as settled. Collapsing them would force a choice between hiding useful
 * analysis and overstating an unconfirmed one.
 */

export type ExpertView =
  | "ABSENT"
  | "RUNNING"
  | "AVAILABLE"
  | "AWAITING_CONFIRMATION"
  | "CONFIRMED"
  | "OVERRIDDEN"
  | "REFUSED"
  | "UNRESOLVED"
  | "FAILED"
  | "UNRECOGNISED";

export type ExpertTone = "neutral" | "info" | "attention" | "settled" | "problem";

/**
 * ONE ENTRY PER STATE, AND NO STATE WITHOUT ONE. Typed as a total record so a server state added
 * later fails to compile here rather than falling through to a benign default at runtime.
 */
const VIEW_FOR_STATE: Record<ExpertAnalysisState, ExpertView> = {
  ANALYSIS_RUNNING: "RUNNING",
  ANALYSIS_FAILED: "FAILED",
  ANALYSIS_REFUSED: "REFUSED",
  ANALYSIS_UNRESOLVED: "UNRESOLVED",
  ANALYSIS_AVAILABLE: "AVAILABLE",
  ANALYSIS_AWAITING_CONFIRMATION: "AWAITING_CONFIRMATION",
  ANALYSIS_CONFIRMED: "CONFIRMED",
  ANALYSIS_OVERRIDDEN: "OVERRIDDEN",
};

/**
 * THE HEADLINE FOR EACH VIEW.
 *
 * None of the unsettled headlines may say approved, final, cleared or safe to proceed, and none of
 * the failure headlines may say "no hazards". Those two prohibitions are asserted by
 * `__tests__/expertPresentation.test.ts` over every entry in this table, so a later edit that
 * introduces one fails a test rather than reaching an inspector.
 */
const HEADLINE: Record<ExpertView, string> = {
  ABSENT: "Expert analysis has not been run for this observation",
  RUNNING: "HazLenz Expert is analysing this observation",
  AVAILABLE: "Expert analysis complete",
  AWAITING_CONFIRMATION: "Expert analysis complete — one decision needs you",
  CONFIRMED: "You confirmed this analysis",
  OVERRIDDEN: "You changed this analysis",
  REFUSED: "Expert analysis could not be used",
  UNRESOLVED: "Expert analysis left a safety question open",
  FAILED: "Expert analysis could not run",
  UNRECOGNISED: "This Expert analysis cannot be displayed by this version of the app",
};

const TONE: Record<ExpertView, ExpertTone> = {
  ABSENT: "neutral",
  RUNNING: "info",
  AVAILABLE: "info",
  AWAITING_CONFIRMATION: "attention",
  CONFIRMED: "settled",
  OVERRIDDEN: "settled",
  REFUSED: "problem",
  UNRESOLVED: "attention",
  FAILED: "problem",
  UNRECOGNISED: "problem",
};

export type ExpertHazardView = {
  title: string;
  reasoning: string;
  evidenceBasis: string;
  quotes: string[];
  confidence: string;
};

export type ExpertControlView = { control: string; timing: string };

export type ExpertUnresolvedView = {
  id: string;
  missingFact: string;
  whyItMattersNow: string;
  whatToDoMeanwhile: string;
  ifResolvedOneWay: string;
  ifResolvedTheOther: string;
};

export type ExpertPresentation = {
  view: ExpertView;
  tone: ExpertTone;
  headline: string;
  /** The SERVER'S sentence about authority. Rendered verbatim. */
  statement: string;
  /**
   * TRUE only when the server said the conclusion is settled. A direct copy of
   * `effectiveDecision.settledForUse`; never a locally computed expression.
   */
  mayPresentAsSettled: boolean;
  /** TRUE when a person settled it, whichever way. Copied from the server. */
  humanSettled: boolean;
  /** TRUE when the confirm / change controls should be offered. Usability only. */
  offerSettlementControls: boolean;
  /** Present only when the analysis is admitted AND the server permits it to be spoken of. */
  posture: { label: string; whatHappensNow: string } | null;
  hazards: ExpertHazardView[];
  controls: ExpertControlView[];
  unresolved: ExpertUnresolvedView[];
  uncertainty: string[];
  /** How many declarations the engine refused to use. Surfaced as a count, never as a fact. */
  containedRefusalCount: number;
  /** What HazLenz proposed vs what the reviewer settled, when they differ. */
  reviewerChanges: Array<{ subject: string; hazLenzProposed: string; reviewerDecided: string }>;
};

// ---------------------------------------------------------------- narrow readers over the jsonb

const asRecord = (value: unknown): Record<string, unknown> =>
  (value !== null && typeof value === "object" && !Array.isArray(value))
    ? (value as Record<string, unknown>)
    : {};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const asText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/**
 * POSTURE LABELS. A one-to-one rename of the server's enum into the inspector's language, with an
 * explicit fallback that states the posture is unreadable rather than guessing at it. Nothing here
 * infers permissiveness: the label is chosen by the value, not by what it seems to allow.
 */
const POSTURE_LABEL: Record<string, string> = {
  STOP_WORK: "Stop this work",
  DO_NOT_START: "Do not start this work",
  CONTINUE_WITH_CONTROLS: "Continue only with the controls below in place",
  CONTINUE: "Work may continue",
  NO_IMMEDIATE_RESTRICTION: "No immediate restriction identified",
};

export function posturePresentationLabel(posture: string): string {
  return POSTURE_LABEL[posture] ?? "The operational posture could not be read";
}

/**
 * HAZARD FAMILY LABELS ARE DERIVED BY FORMATTING, NOT BY A TABLE THIS FILE OWNS.
 *
 * A lookup table would be a client-held copy of the engine's taxonomy — 41 families at last count —
 * and a family the table missed would render as blank. Underscores become spaces and the first
 * letter is capitalised: the family names are already written to be read.
 */
export function hazardFamilyLabel(family: string): string {
  const cleaned = asText(family).replace(/[_-]+/g, " ").trim();
  if (!cleaned) return "Hazard";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// ---------------------------------------------------------------- the projection

/**
 * The label a reviewer sees for one classification value. These are the two product-facing values
 * the SERVER supplies in `answerOptions`; this map exists only so a settled decision can be
 * rendered after the fact, when the options list is no longer the subject of a question.
 */
const CLASSIFICATION_LABEL: Record<string, string> = {
  CONTROLS_WHETHER_WORK_CONTINUES: "Decides whether work continues",
  DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES: "A follow-up, not a stop condition",
};

export function classificationLabel(value: string): string {
  return CLASSIFICATION_LABEL[value] ?? value;
}

/**
 * Resolve a `refKind:ref` pair to something an inspector can read.
 *
 * The pair is the server's key and it stays the server's key — it is sent back verbatim on a
 * settlement and is never shown. What is shown is the unresolved fact the reference points at,
 * looked up in the analysis the server already sent. Where no match exists, the fallback says the
 * reference could not be resolved rather than printing the internal identifier at an inspector.
 */
export function subjectDisplayText(
  read: ExpertAnalysisRead,
  entry: { refKind: string; ref: string },
): string {
  const declarations = asArray(asRecord(asRecord(read.analysis).analysis).unresolvedFactDeclarations);
  for (const raw of declarations) {
    const declaration = asRecord(raw);
    if (asText(declaration.declarationId) === entry.ref) {
      const fact = asText(declaration.missingFact);
      if (fact) return fact;
    }
  }
  const hazards = asArray(asRecord(asRecord(read.analysis).analysis).expertHazardCandidates);
  for (const raw of hazards) {
    const hazard = asRecord(raw);
    if (asText(hazard.candidateKey) === entry.ref) {
      const family = asText(hazard.hazardFamily);
      if (family) return hazardFamilyLabel(family);
    }
  }
  return "An unresolved item in this analysis";
}

/**
 * THE WHOLE PRESENTATION, FROM THE SERVER'S READ RESPONSE AND NOTHING ELSE.
 *
 * It takes no previous analysis, no cached state and no local flags — deliberately. A function
 * that could see a previous result is a function that could render one while the current request
 * is still running, which §265 names as the specific thing not to do.
 */
export function presentExpertAnalysis(read: ExpertAnalysisRead | null): ExpertPresentation {
  // ABSENT is "nothing has been produced here", which is a DIFFERENT fact from a refusal, a
  // failure or a run in progress. Where the server named a state, that state renders — even with
  // no analysis row behind it, because ANALYSIS_FAILED has none by design.
  if (read === null || read.analysisState === null) {
    return {
      view: "ABSENT",
      tone: TONE.ABSENT,
      headline: HEADLINE.ABSENT,
      statement: read?.authorityStatement
        ?? "No Expert analysis has been produced for this observation. That is not a finding that "
        + "there are no hazards.",
      mayPresentAsSettled: false,
      humanSettled: false,
      offerSettlementControls: false,
      posture: null,
      hazards: [],
      controls: [],
      unresolved: [],
      uncertainty: [],
      containedRefusalCount: 0,
      reviewerChanges: [],
    };
  }

  const view: ExpertView = VIEW_FOR_STATE[read.analysisState] ?? "UNRECOGNISED";
  const decision: ExpertEffectiveDecision | null = read.effectiveDecision;

  // THE AUTHORITY FIELDS ARE COPIED. See the file header — these three lines are the boundary.
  const mayPresentAsSettled = decision?.settledForUse === true;
  const humanSettled = decision?.humanSettled === true;
  // Offering the controls is a usability decision read off the server's state and its own subject
  // resolution. It is not an authorization: the server refuses a settlement on any analysis that is
  // not awaiting one, whatever this returns.
  const offerSettlementControls =
    read.analysisState === "ANALYSIS_AWAITING_CONFIRMATION"
    && read.confirmationSubject?.resolvable === true;

  const snapshot = asRecord(read.analysis);
  const admitted = asRecord(snapshot.analysis);
  const projectedPosture = asRecord(snapshot.posture);

  // ONLY ADMITTED VIEWS CARRY CONTENT. A refused or failed analysis renders its statement and
  // nothing else, so no fragment of a refused output can appear as though it were a result.
  const admittedView =
    view === "AVAILABLE" || view === "AWAITING_CONFIRMATION"
    || view === "CONFIRMED" || view === "OVERRIDDEN";

  const hazards: ExpertHazardView[] = !admittedView ? [] :
    asArray(admitted.expertHazardCandidates).map((raw) => {
      const hazard = asRecord(raw);
      return {
        title: hazardFamilyLabel(asText(hazard.hazardFamily)),
        reasoning: asText(hazard.reasoning),
        evidenceBasis: asText(hazard.evidenceBasis),
        quotes: asArray(hazard.evidence)
          .map((e) => asText(asRecord(e).quotedText))
          .filter((quote) => quote.length > 0),
        confidence: asText(hazard.confidence),
      };
    });

  const controls: ExpertControlView[] = !admittedView ? [] :
    asArray(projectedPosture.requiredControls).map((raw) => {
      const control = asRecord(raw);
      return { control: asText(control.control), timing: asText(control.timing) };
    }).filter((entry) => entry.control.length > 0);

  // UNRESOLVED FACTS ARE SHOWN ON EVERY VIEW THAT HAS THEM, including the unresolved one — RR-7
  // exists to keep them visible, and hiding them on a refusal would be the exact silence this
  // product is built to prevent.
  const unresolved: ExpertUnresolvedView[] =
    asArray(admitted.unresolvedFactDeclarations).map((raw) => {
      const declaration = asRecord(raw);
      return {
        id: asText(declaration.declarationId),
        missingFact: asText(declaration.missingFact),
        whyItMattersNow: asText(declaration.whyNecessaryNow),
        whatToDoMeanwhile: asText(declaration.decisionWhileUnresolved),
        ifResolvedOneWay: asText(declaration.decisionIfA),
        ifResolvedTheOther: asText(declaration.decisionIfB),
      };
    }).filter((entry) => entry.missingFact.length > 0);

  const uncertainty = asArray(asRecord(admitted.uncertainty).statements)
    .map((statement) => asText(statement))
    .filter((statement) => statement.length > 0);

  // THE POSTURE IS SHOWN ONLY WHERE THE ANALYSIS WAS ADMITTED. Whether it may be spoken of as a
  // settled conclusion is `mayPresentAsSettled`, which the rendering layer consults separately —
  // an awaiting analysis shows its proposed posture, clearly marked as not yet settled.
  const postureValue = asText(projectedPosture.posture);
  const posture = admittedView && postureValue
    ? {
      label: posturePresentationLabel(postureValue),
      whatHappensNow: asText(projectedPosture.whatHappensNow),
    }
    : null;

  const reviewerChanges = (read.settlement?.entries ?? [])
    .filter((entry) => entry.changedByHuman)
    .map((entry) => ({
      subject: subjectDisplayText(read, entry),
      hazLenzProposed: classificationLabel(entry.expertClassification),
      reviewerDecided: classificationLabel(entry.effectiveClassification),
    }));

  return {
    view,
    tone: TONE[view],
    headline: HEADLINE[view],
    // THE SERVER'S OWN SENTENCE, PREFERRED OVER ANYTHING COMPOSED HERE. `effectiveDecision` speaks
    // about authority; `authorityStatement` speaks about the state. Both are the server's.
    statement: decision?.statement ?? read.authorityStatement ?? HEADLINE[view],
    mayPresentAsSettled,
    humanSettled,
    offerSettlementControls,
    posture,
    hazards,
    controls,
    unresolved,
    uncertainty,
    containedRefusalCount: asArray(snapshot.declarationRefusals).length,
    reviewerChanges,
  };
}

/**
 * §265 — HOW ONE HISTORY ROW IS DESCRIBED.
 *
 * The two producers are NOT normalised into one word. `client_supplied` means the server does not
 * establish that what it stored equals what it returned; `server_authored` means the server ran it.
 * That is a real difference in what is known, and a history that hid it would be claiming a trust
 * boundary the older rows never had.
 */
export function historyEntryLabel(entry: { producer: string; humanSettled: boolean }): string {
  const origin = entry.producer === "server_authored"
    ? "HazLenz Expert (run by Safety InSite)"
    : "Saved from this device";
  return entry.humanSettled ? `${origin} — settled by a person` : origin;
}

/**
 * §265 — THE EXECUTION RESPONSE, RENDERED THROUGH THE SAME PROJECTION AS THE READ.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY AN ADAPTER RATHER THAN A SECOND PRESENTER.
 *
 * `ANALYSIS_FAILED` is reachable ONLY here. A provider failure writes no analysis row at all, so
 * the read answers `present: false` and the interface would otherwise show "not run yet" for an
 * execution that just failed — which is the collapse of failure into absence that §265 forbids.
 *
 * A second presenter for the execution response would mean two implementations of the eight-state
 * table, and the one that drifted would be the one the inspector sees immediately after pressing
 * the button. So the execution response is adapted into the read shape and passed through the same
 * total map. Nothing is invented in the adaptation: every field is copied, and `present` is set
 * from whether the server actually persisted an analysis.
 */
export function readFromExecution(executed: ExpertAnalysisExecuted): ExpertAnalysisRead {
  return {
    responseVersion: executed.responseVersion,
    present: executed.analysisId !== null,
    analysisId: executed.analysisId,
    // Where no analysis row exists the EXECUTION state is what happened, and it is the state the
    // interface must render. Reporting `null` here would erase a failure into an absence.
    analysisState: (executed.analysisState
      ?? (executed.executionState as ExpertAnalysisState | null)),
    producer: executed.producer,
    confirmationRequired: executed.confirmationRequired,
    confirmationSubject: executed.confirmationSubject,
    answerOptions: [],
    effectiveDecision: executed.effectiveDecision,
    authorityStatement: executed.authorityStatement,
    analysis: executed.analysis,
    settlement: null,
    provenance: executed.provenance,
    failure: executed.failure,
    history: [],
    findingsReconciled: false,
  };
}
