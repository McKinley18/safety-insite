/**
 * §281 (D-040) — WHAT HAZLENZ ALREADY SAID, PROJECTED FOR A SAFETY PROFESSIONAL TO READ.
 *
 * ==================== THE DEFECT ====================
 *
 * Three fields are computed by the engine, carried in the contract, and rendered nowhere:
 *
 *   `evidenceSnapshot.criticalUnknowns`   — the engine's own statement of the fact it could not
 *                                           establish, and which controls the decision.
 *   `guidedFinding.multiHazardReview`     — the engine's instruction that one observation holds
 *                                           several independent hazards needing separate review.
 *   `primaryStandard.confidenceLimitReason` — the engine's reason its confidence is limited. Read
 *                                           into the presentation projection at two call sites
 *                                           and never consumed.
 *
 * §280 measured the consequence: in the unresolved state the HazLenz step is nearly
 * indistinguishable from the resolved one. The engine states the decision-controlling unknown and
 * the product withholds it. This is not a concision problem and its fix is an ADDITION.
 *
 * ==================== WHAT THIS MODULE MAY AND MAY NOT DO ====================
 *
 * It PROJECTS. It copies text the engine authored and decides where it belongs on the page.
 *
 * It does NOT author safety semantics. There is no sentence in this file that makes a claim about
 * a hazard, and there must never be one: deterministic code may validate, project and refuse
 * model-authored safety semantics, and must never invent, repair or reconstruct them. Every
 * user-visible safety statement below is either copied verbatim from the analysis or is a fixed
 * label that describes the PRODUCT's state ("HazLenz could not establish the following"), never
 * the WORKPLACE's state.
 *
 * The one thing it decides is STRUCTURAL, not semantic: whether the analysis contains an
 * unresolved decision-controlling fact. That is `criticalUnknowns` being non-empty, or a
 * clarification question the engine itself marked `decisionCritical`. Both are the engine's own
 * flags, read rather than judged.
 *
 * ==================== WHAT "UNRESOLVED" MUST NOT BE TAKEN TO MEAN ====================
 *
 * Not safe. Not hazardous. The product owner's constraint is explicit and it is the right one: an
 * unresolved analysis says the ENGINE could not establish a fact, and nothing whatever about
 * whether the workplace is dangerous. Every label here is written so that neither reading is
 * available — which is also why the distinction is carried by a word and a shape, not by a colour
 * that a glancing reader would translate into "alarm" or "all clear".
 */

import type { HazLenzAnalysisResult } from "@/lib/canonicalWorkflowApi";

export type HazLenzResolution =
  /** The analysis states no outstanding decision-controlling fact. */
  | "ESTABLISHED"
  /** The analysis itself names a fact it could not establish. */
  | "NEEDS_INFORMATION"
  /**
   * The analysis ran and produced NO finding. Structurally distinct from both of the above,
   * because there is no conclusion for information to be missing FROM.
   *
   * §281 measured the cost of not having this state: the negated fixture rendered "HazLenz has
   * what it needs for this conclusion" and "No standard has been established for this finding"
   * on a screen with no finding on it at all — the product describing a conclusion that does not
   * exist, on the one screen a reader is most likely to misread as "all clear".
   */
  | "NO_HAZARD_IDENTIFIED";

export type HazLenzClarificationLink = {
  id: string;
  question: string;
  /** Why the engine is asking. Shown under the question; omitted when the engine gave none. */
  reason: string | null;
  /** The engine's own options. Falls back to nothing — the caller supplies no answers of its own. */
  options: string[];
  decisionCritical: boolean;
};

export type HazLenzDecisionView = {
  resolution: HazLenzResolution;

  /** 3. WHAT IMPORTANT INFORMATION IS STILL MISSING? The engine's sentences, verbatim. */
  criticalUnknowns: string[];

  /** 4. IS MORE THAN ONE INDEPENDENT HAZARD INVOLVED? The engine's instruction, verbatim. */
  multiHazard: { instruction: string } | null;

  /** 5. WHAT LIMITS THE CURRENT CONCLUSION? The engine's reason, verbatim. */
  confidenceLimitReason: string | null;

  /**
   * 6. WHAT SHOULD THE USER DO NEXT? Only questions the engine actually asked. When an unknown
   * exists and a question can settle it, the presentation connects the two; when it cannot, the
   * product says so rather than offering an action that would not help.
   */
  settlingQuestions: HazLenzClarificationLink[];

  /**
   * Whether a question the engine asked is capable of settling an unknown at all. False with
   * unknowns present is a real and important state: the evidence itself is the limit, and the way
   * forward is a better observation, not an answer to a question.
   */
  hasSettlingQuestion: boolean;

  /** True when the analysis is one a person must confirm before it may be acted on. */
  awaitingHumanConfirmation: boolean;

  /**
   * Limitations the engine attached that are NOT the standing advisory caveat. The caveat is
   * already on the page once, at the top of the workspace; repeating it inside every result is
   * how a caveat stops being read.
   */
  specificLimitations: string[];
};

/**
 * The standing advisory caveat, matched so it can be excluded from the per-result limitations.
 * Matched on its two load-bearing phrases rather than on an exact string, because the sentence is
 * authored upstream and a comma moving must not silently turn it into a "specific" limitation
 * that then appears twice on the screen.
 */
function isStandingCaveat(limitation: string) {
  const text = limitation.toLowerCase();
  return text.includes("advisory") && text.includes("qualified safety professional");
}

function cleanStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function buildHazLenzDecisionView(
  analysis: HazLenzAnalysisResult | null,
  /**
   * The confidence-limit reason belonging to the standard actually on screen. Passed in rather
   * than read from `guidedFinding.primaryStandard`, because the workspace resolves a FINDING-SCOPED
   * standard and the observation's primary may describe a sibling hazard entirely — showing the
   * primary's reason beside a different finding's citation would attach the engine's reasoning to
   * a conclusion it was not about.
   */
  confidenceLimitReason?: string | null,
  /**
   * Whether a finding exists for the observation on screen. Passed in rather than inferred from
   * the snapshot: the finding is a PERSISTED record and the snapshot cannot see whether one was
   * written, so asking the analysis would be guessing at the answer.
   */
  hasFinding: boolean = true,
): HazLenzDecisionView | null {
  if (!analysis) return null;

  const guided = analysis.guidedFinding;
  const criticalUnknowns = cleanStrings(analysis.evidenceSnapshot?.criticalUnknowns);

  const questions = Array.isArray(guided?.clarificationQuestions) ? guided.clarificationQuestions : [];
  const settlingQuestions: HazLenzClarificationLink[] = questions
    .filter((question) => question && typeof question.question === "string" && question.question.trim())
    .map((question) => ({
      id: String(question.id || ""),
      question: question.question.trim(),
      reason: typeof question.reason === "string" && question.reason.trim() ? question.reason.trim() : null,
      options: cleanStrings(question.options),
      decisionCritical: question.decisionCritical === true,
    }));

  const decisionCriticalQuestion = settlingQuestions.some((question) => question.decisionCritical);

  // STRUCTURAL, not semantic. Every input is a flag the ENGINE set, or the presence of a record.
  //
  // NO_HAZARD_IDENTIFIED is tested FIRST and wins: an analysis that produced no finding has no
  // conclusion, so it can be neither established nor short of information. Ordering it after the
  // others would let a negated observation carrying an unknown be labelled "needs information"
  // about a conclusion that was never reached.
  const resolution: HazLenzResolution = !hasFinding
    ? "NO_HAZARD_IDENTIFIED"
    : criticalUnknowns.length > 0 || decisionCriticalQuestion
      ? "NEEDS_INFORMATION"
      : "ESTABLISHED";

  const multi = guided?.multiHazardReview;
  const multiHazard =
    multi && multi.requiresSplitReview === true && typeof multi.instruction === "string" && multi.instruction.trim()
      ? { instruction: multi.instruction.trim() }
      : null;

  const limitReason = typeof confidenceLimitReason === "string" && confidenceLimitReason.trim()
    ? confidenceLimitReason.trim()
    : null;

  return {
    resolution,
    criticalUnknowns,
    multiHazard,
    confidenceLimitReason: limitReason,
    settlingQuestions,
    hasSettlingQuestion: settlingQuestions.length > 0,
    awaitingHumanConfirmation: String(guided?.reviewStatus?.status || "") === "awaiting_human_confirmation",
    specificLimitations: cleanStrings(guided?.limitations).filter((limitation) => !isStandingCaveat(limitation)),
  };
}

/**
 * Whether the decision view has anything at all to render.
 *
 * A view with nothing in it must render NOTHING — not an empty panel explaining what HazLenz did
 * not say. An "Important information needed: none" heading on a straightforward finding is how a
 * result that is fine starts to look like one that is not, which is the specific failure mode the
 * product owner warned against: do not make ordinary resolved findings look alarming.
 */
export function hasDecisionContent(view: HazLenzDecisionView | null): boolean {
  if (!view) return false;
  return (
    // A negated result ALWAYS has something to say. Saying nothing on the one screen that could be
    // read as "all clear" is the worst available option.
    view.resolution === "NO_HAZARD_IDENTIFIED" ||
    // So does a result short of information — including one whose only gap is a decision-critical
    // QUESTION with no separately stated unknown. Returning false there would let the status line
    // announce a missing fact on a screen that then shows nothing about it.
    view.resolution === "NEEDS_INFORMATION" ||
    view.criticalUnknowns.length > 0 ||
    view.multiHazard !== null ||
    view.confidenceLimitReason !== null ||
    view.specificLimitations.length > 0 ||
    view.awaitingHumanConfirmation
  );
}
