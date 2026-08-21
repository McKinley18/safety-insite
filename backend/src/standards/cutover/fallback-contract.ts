/**
 * KG-4A Phases 3, 4 and 6 -- the FALLBACK CONTRACT.
 *
 * THE QUESTION THIS ANSWERS. HazLenz decides whether a regulation applies. The governed corpus
 * decides whether anybody has attested to that regulation's exact text. These are different
 * questions with different evidence and different failure modes, and the entire risk of a cutover
 * is that they get collapsed into one number.
 *
 * THE GOVERNING PRINCIPLE, stated once and enforced by the table below:
 *
 *      Governance controls CLAIMS ABOUT VERIFIED REGULATORY TEXT.
 *      It does not control WHICH REGULATION HAZLENZ CITES,
 *      and it does not erase HazLenz's applicability reasoning.
 *
 * So a citation is never deleted because the governance layer could not supply approved text. The
 * customer keeps the citation, keeps the reasoning, and is told plainly that verified standard text
 * is unavailable. This is option (B) from `governed-corpus-lookup.ts` -- recommended by KG-3B,
 * deferred by KG-3C for want of a display state, and implemented here.
 *
 * THREE THINGS THIS FILE REFUSES TO DO, each because it would manufacture a claim:
 *
 *   1. It never substitutes a NEIGHBOURING regulation because that one happens to be approved.
 *      `resolvedCitation` is always the requested citation. There is no "nearest approved match".
 *   2. It never PROMOTES between a section and its paragraph to obtain approved backing. If
 *      HazLenz cited 56.14132(b)(1) and only 56.14132 is approved, the customer does not receive
 *      56.14132's text labelled as the paragraph's -- that is exactly the granularity error KG-3D
 *      refused for 1910.303(g)(2)(i) and KG-3E refused for 56.14132(b)(1). The state is recorded as
 *      `APPROVED_SECTION_ONLY` and is observable, but it does not confer verified text.
 *   3. It never lets governed availability upgrade an UNCERTAIN applicability to a certain one.
 *      Approved text may be shown next to an uncertain applicability -- the text is true regardless
 *      of whether the rule applies here -- but the missing trigger stays disclosed.
 */

import type { GovernedCutoverMode } from './cutover-mode';

// ------------------------------------------------------------------ axis 1: applicability

/**
 * Does the evidence support this regulation applying to this finding? HazLenz's question,
 * answered by `evidence-foundation.ts` before governance is consulted at all.
 *
 * Mapped from `ApplicabilityDecision.status` (`PredicateStatus`) by `toApplicabilityState()`.
 */
export type ApplicabilityState =
  /** Every required predicate is established. `PredicateStatus` SUPPORTED. */
  | 'SUPPORTED'
  /**
   * The rule is a defensible candidate but at least one applicability trigger is unestablished.
   * `PredicateStatus` UNKNOWN. This is the state KG-3F Phases 5-7 built deliberately: 56.14132(b)(1)
   * is withheld from certainty when rear visibility is unstated. It is NOT a governance condition
   * and must never be reported as one -- see `EVIDENCE_UNKNOWN` vs `GOVERNANCE_FILTER_EMPTY` below.
   */
  | 'UNCERTAIN'
  /** Evidence contradicts or fails a required predicate. NOT_SUPPORTED / CONTRADICTED. */
  | 'UNSUPPORTED';

export function toApplicabilityState(status: string | null | undefined): ApplicabilityState {
  const value = String(status || '').trim().toUpperCase().replace(/-/g, '_');
  if (value === 'SUPPORTED' || value === 'NOT_APPLICABLE') return 'SUPPORTED';
  if (value === 'NOT_SUPPORTED' || value === 'CONTRADICTED') return 'UNSUPPORTED';
  // KG-4B. The display-layer applicability vocabulary that `hazlenz-evidence-boundary.ts` writes
  // onto each standard decision. It is a DIFFERENT vocabulary from `PredicateStatus`, and mapping it
  // here keeps one function responsible for the whole applicability axis rather than letting each
  // caller invent its own translation.
  //
  // Found by the KG-4B corpus run: reading `standardDecisions[].status` -- which is
  // `applicable_after_human_review`, a review-state label and not an applicability signal at all --
  // classified 51 of 83 comparisons as APPLICABILITY_DIFFERENCE. The authoritative axis is
  // `applicabilityDecisions[].status`, with `applicabilityStatus` as the per-decision fallback.
  if (value === 'CONFIRMED' || value === 'PROBABLE') return 'SUPPORTED';
  if (value === 'NEEDS_MORE_EVIDENCE') return 'UNCERTAIN';
  // UNKNOWN, empty, and anything unrecognised. Defaulting an unrecognised status to UNCERTAIN
  // rather than SUPPORTED means a vocabulary change can never silently strengthen a claim.
  return 'UNCERTAIN';
}

// ------------------------------------------------------------------ axis 2: governed backing

/**
 * What the governed release can supply for the EXACT citation requested.
 *
 * A superset of `CorpusBackingState` from `governed-corpus-lookup.ts`: that type answers "what does
 * this release hold", this one additionally distinguishes the ways the resolver itself can fail,
 * because a resolver failure and an empty release are opposite operational situations that a single
 * "not backed" value would merge.
 */
export type GovernedBackingState =
  /** Reviewer-approved, non-placeholder provenance, carries regulatory content, exact citation. */
  | 'APPROVED_EXACT'
  /**
   * The exact paragraph is absent from the release but its parent SECTION is approved. Recorded
   * so it is measurable; it confers nothing. See refusal (2) in the header.
   */
  | 'APPROVED_SECTION_ONLY'
  /** Approved with registered provenance, but the release carries no text or summary. */
  | 'APPROVED_NO_TEXT'
  /** A record exists and is not reviewer-approved (unreviewed, mechanically validated, revoked). */
  | 'UNAPPROVED_RECORD'
  /** The active release holds no record for this citation. */
  | 'NOT_IN_RELEASE'
  /** No release is active. Ordinary, expected, not an error -- it is every environment today. */
  | 'NO_ACTIVE_RELEASE'
  /**
   * The resolver could not answer: database error, stale schema, malformed payload, or an approval
   * identity that does not match the content it claims to approve. Distinguished from
   * `NOT_IN_RELEASE` because "we do not know" must never be silently reported as "there is none".
   */
  | 'RESOLVER_UNAVAILABLE';

/** Whether a state is an expected outcome of the contract or a genuine integrity problem (Phase 10). */
export type BackingFailureClass = 'EXPECTED_FALLBACK' | 'INTEGRITY_FAILURE' | 'NONE';

// ------------------------------------------------------------------ axis 3: delivery

/**
 * What the customer actually receives. The output of the table; never an input to it.
 *
 * There is no `SUPPRESSED` value. Suppression is an APPLICABILITY decision made upstream in
 * `evidence-foundation.ts` (an UNSUPPORTED rule emits no decision at all), never a governance
 * decision. Adding a governance-driven suppression state here is precisely the failure mode KG-4A
 * exists to prevent, so the type makes it unrepresentable.
 */
export type DeliveryState =
  /** Governed approved text, presented as verified regulatory text. Only `APPROVED_EXACT` reaches this. */
  | 'GOVERNED_VERIFIED_TEXT'
  /**
   * The existing HazLenz-authored corpus text, shown and labelled as HazLenz's own summary, with no
   * claim of verification. This is today's behaviour for every citation in the product.
   */
  | 'LEGACY_TEXT_UNVERIFIED'
  /**
   * Citation and applicability reasoning only, with an explicit statement that verified standard
   * text is unavailable. The customer keeps the finding; nobody claims text nobody attested to.
   */
  | 'CITATION_ONLY_NO_TEXT';

/** A stable, categorical explanation of a delivery decision. Loggable; drives customer disclosure. */
export type FallbackReasonCode =
  | 'LEGACY_MODE_GOVERNANCE_NOT_CONSULTED'
  | 'SHADOW_MODE_CUSTOMER_UNAFFECTED'
  | 'GOVERNED_APPROVED_EXACT'
  | 'GOVERNED_APPROVED_BUT_NO_TEXT'
  | 'GOVERNED_SECTION_ONLY_NOT_PARAGRAPH'
  | 'GOVERNED_RECORD_UNAPPROVED'
  | 'GOVERNED_RECORD_ABSENT'
  | 'NO_ACTIVE_GOVERNED_RELEASE'
  | 'GOVERNED_RESOLVER_UNAVAILABLE'
  | 'STRICT_MODE_WITHHELD_UNVERIFIED_TEXT';

export interface FallbackDecision {
  deliveryState: DeliveryState;
  reasonCode: FallbackReasonCode;
  /** May the citation be shown at all? ALWAYS true. Kept explicit so the table proves it. */
  showCitation: true;
  /** May any regulatory/summary body text be shown? */
  showText: boolean;
  /** May the text shown be labelled as VERIFIED regulatory text? Implies `showText`. */
  textIsVerified: boolean;
  /** Must the customer be told verified standard text is unavailable? */
  discloseTextUnavailable: boolean;
  /**
   * Must the customer be told the applicability trigger is unestablished? Driven ONLY by the
   * applicability axis, never by backing -- proven by `disclosureIsIndependentOfBacking()`.
   */
  discloseApplicabilityUncertain: boolean;
  /**
   * May this decision cause `knowledgeReleaseId` to be recorded? True only when governed release
   * data actually influenced what the customer sees (Phase 7 hard rule).
   */
  governedProvenanceEligible: boolean;
  failureClass: BackingFailureClass;
}

const APPLICABILITY_STATES: readonly ApplicabilityState[] =
  Object.freeze(['SUPPORTED', 'UNCERTAIN', 'UNSUPPORTED'] as const);

const BACKING_STATES: readonly GovernedBackingState[] = Object.freeze([
  'APPROVED_EXACT', 'APPROVED_SECTION_ONLY', 'APPROVED_NO_TEXT', 'UNAPPROVED_RECORD',
  'NOT_IN_RELEASE', 'NO_ACTIVE_RELEASE', 'RESOLVER_UNAVAILABLE',
] as const);

export const ALL_APPLICABILITY_STATES = APPLICABILITY_STATES;
export const ALL_BACKING_STATES = BACKING_STATES;

function failureClassOf(backing: GovernedBackingState): BackingFailureClass {
  if (backing === 'RESOLVER_UNAVAILABLE') return 'INTEGRITY_FAILURE';
  if (backing === 'APPROVED_EXACT') return 'NONE';
  return 'EXPECTED_FALLBACK';
}

/**
 * THE DECISION TABLE.
 *
 * Total over mode x applicability x backing = 4 x 3 x 7 = 84 combinations, every one of which is
 * enumerated by `buildFallbackMatrix()` and asserted by `test:kg4a-fallback-matrix`. Nothing here
 * is decided by an `if` further downstream: the two `resolveStandardsBacking()` call sites consume
 * this decision, they do not re-derive it.
 */
export function decideFallback(
  mode: GovernedCutoverMode,
  applicability: ApplicabilityState,
  backing: GovernedBackingState,
): FallbackDecision {
  // Applicability disclosure is computed FIRST and independently. It is a function of the
  // applicability axis alone. Governed backing cannot raise or lower it, in any mode. This single
  // line is the "do not collapse the two concepts" rule, expressed as code rather than as a comment.
  const discloseApplicabilityUncertain = applicability === 'UNCERTAIN';

  const base = {
    showCitation: true as const,
    discloseApplicabilityUncertain,
    failureClass: failureClassOf(backing),
  };

  // ---- LEGACY and SHADOW: the customer sees exactly what ships today.
  //
  // SHADOW is byte-identical to LEGACY here BY CONSTRUCTION, not by coincidence: it ignores the
  // `backing` argument entirely, so no governed resolution -- successful, empty, or failed -- can
  // reach a shadow customer. `governedProvenanceEligible` is false for the same reason: a
  // background comparison is not consumption (Phase 7).
  if (mode === 'LEGACY' || mode === 'SHADOW') {
    return {
      ...base,
      failureClass: 'NONE',
      deliveryState: 'LEGACY_TEXT_UNVERIFIED',
      reasonCode: mode === 'LEGACY'
        ? 'LEGACY_MODE_GOVERNANCE_NOT_CONSULTED'
        : 'SHADOW_MODE_CUSTOMER_UNAFFECTED',
      showText: true,
      textIsVerified: false,
      discloseTextUnavailable: false,
      governedProvenanceEligible: false,
    };
  }

  // ---- APPROVED_EXACT: the only state that may be presented as verified regulation.
  //
  // Reached identically under SUPPORTED and UNCERTAIN applicability, and that is correct: the text
  // of 56.14132(b)(1) is what a reviewer approved it to be whether or not the rule governs this
  // particular finding. Showing it while `discloseApplicabilityUncertain` stays true is the honest
  // combination -- "here is the verified requirement; we cannot yet confirm it applies here".
  if (backing === 'APPROVED_EXACT') {
    return {
      ...base,
      deliveryState: 'GOVERNED_VERIFIED_TEXT',
      reasonCode: 'GOVERNED_APPROVED_EXACT',
      showText: true,
      textIsVerified: true,
      discloseTextUnavailable: false,
      // The ONLY branch that may write governed provenance: governed content is on screen.
      governedProvenanceEligible: true,
    };
  }

  // ---- APPROVED_NO_TEXT: attested, but there is nothing to show.
  // Citation-only in both governed modes. The customer-visible consequence is identical to having
  // no content, which is why KG-3C declined to make it a fourth public backing state.
  if (backing === 'APPROVED_NO_TEXT') {
    return {
      ...base,
      deliveryState: 'CITATION_ONLY_NO_TEXT',
      reasonCode: 'GOVERNED_APPROVED_BUT_NO_TEXT',
      showText: false,
      textIsVerified: false,
      discloseTextUnavailable: true,
      // The release DID decide this citation's fate -- it is the reason no text is shown, and the
      // customer-visible output differs from legacy because of it. Truthful to name the release.
      governedProvenanceEligible: true,
    };
  }

  // ---- GOVERNED_STRICT: only exact approved content may be shown as regulatory text.
  // Everything that is not APPROVED_EXACT (handled above) becomes citation-only. Deliberately NOT
  // a candidate for the customer default -- see the mode's doc comment.
  if (mode === 'GOVERNED_STRICT') {
    return {
      ...base,
      deliveryState: 'CITATION_ONLY_NO_TEXT',
      reasonCode: backing === 'APPROVED_SECTION_ONLY'
        ? 'GOVERNED_SECTION_ONLY_NOT_PARAGRAPH'
        : 'STRICT_MODE_WITHHELD_UNVERIFIED_TEXT',
      showText: false,
      textIsVerified: false,
      discloseTextUnavailable: true,
      // A resolver failure produced no governed data, so nothing governed influenced the output
      // even though the mode did. Naming a release here would be false provenance.
      governedProvenanceEligible: backing !== 'RESOLVER_UNAVAILABLE' && backing !== 'NO_ACTIVE_RELEASE',
    };
  }

  // ---- GOVERNED_WITH_FALLBACK: keep the useful reasoning, refuse the unearned claim.
  //
  // Every remaining backing state delivers the SAME customer experience -- today's HazLenz-authored
  // text, labelled as HazLenz's own, with no verification claim. That is not a shortcut: it is the
  // point. The customer's experience should not degrade because of a governance gap they cannot
  // see, act on, or be responsible for. What differs between these states is the REASON CODE, which
  // is what operators and the corpus backlog need, and which never reaches the customer.
  const reasonCode: FallbackReasonCode =
    backing === 'APPROVED_SECTION_ONLY' ? 'GOVERNED_SECTION_ONLY_NOT_PARAGRAPH'
    : backing === 'UNAPPROVED_RECORD' ? 'GOVERNED_RECORD_UNAPPROVED'
    : backing === 'NOT_IN_RELEASE' ? 'GOVERNED_RECORD_ABSENT'
    : backing === 'NO_ACTIVE_RELEASE' ? 'NO_ACTIVE_GOVERNED_RELEASE'
    : 'GOVERNED_RESOLVER_UNAVAILABLE';

  return {
    ...base,
    deliveryState: 'LEGACY_TEXT_UNVERIFIED',
    reasonCode,
    showText: true,
    textIsVerified: false,
    // The text on screen is legacy text and is already labelled as a HazLenz summary. Adding
    // "verified text unavailable" on top of it would attach a caution to essentially every standard
    // in the product (KG-3F: 137 of 160 declared citations are unemitted or unapproved), which
    // reads as breakage rather than as precision. KG-3C made this same call for UNAPPROVED_CONTENT.
    discloseTextUnavailable: false,
    // Governed data did NOT influence what the customer sees -- the output is identical to LEGACY.
    // Recording a release id here would claim the analysis was governed when it demonstrably was
    // not. This is the Phase 7 rule at its sharpest, and it is why fallback and provenance are
    // decided by the same function.
    governedProvenanceEligible: false,
  };
}

export interface FallbackMatrixRow extends FallbackDecision {
  mode: GovernedCutoverMode;
  applicability: ApplicabilityState;
  backing: GovernedBackingState;
}

/** Enumerates all 84 combinations. The machine-readable artefact required by Phase 3. */
export function buildFallbackMatrix(
  modes: readonly GovernedCutoverMode[] = ['LEGACY', 'SHADOW', 'GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT'],
): FallbackMatrixRow[] {
  const rows: FallbackMatrixRow[] = [];
  for (const mode of modes) {
    for (const applicability of APPLICABILITY_STATES) {
      for (const backing of BACKING_STATES) {
        rows.push({ mode, applicability, backing, ...decideFallback(mode, applicability, backing) });
      }
    }
  }
  return rows;
}

/**
 * The customer-facing disclosure for a decision, or null when none is warranted.
 *
 * Product voice; no governance vocabulary. Reuses the exact sentence KG-3C shipped for
 * CITATION_ONLY so the cutover introduces no new copy for a state the customer already meets today.
 */
export function fallbackCustomerDisclosure(decision: FallbackDecision): string | null {
  return decision.discloseTextUnavailable
    ? 'Verified standard text is not currently available for this citation.'
    : null;
}

/**
 * Proof obligation, expressed as an executable predicate rather than as prose.
 *
 * For a fixed mode and backing state, changing ONLY the applicability axis must change only
 * `discloseApplicabilityUncertain` -- never the text/verification/provenance decisions. And for a
 * fixed mode and applicability, changing ONLY the backing axis must never change
 * `discloseApplicabilityUncertain`. That is what "do not collapse the two concepts into one
 * confidence score" means operationally, and `test:kg4a-fallback-matrix` asserts it over all 84 rows.
 */
export function disclosureIsIndependentOfBacking(
  mode: GovernedCutoverMode,
  applicability: ApplicabilityState,
): boolean {
  const decisions = BACKING_STATES.map((backing) => decideFallback(mode, applicability, backing));
  return decisions.every((d) => d.discloseApplicabilityUncertain === decisions[0].discloseApplicabilityUncertain);
}

export function backingDecisionIsIndependentOfApplicability(
  mode: GovernedCutoverMode,
  backing: GovernedBackingState,
): boolean {
  const decisions = APPLICABILITY_STATES.map((applicability) => decideFallback(mode, applicability, backing));
  const key = (d: FallbackDecision) =>
    `${d.deliveryState}|${d.reasonCode}|${d.showText}|${d.textIsVerified}|` +
    `${d.discloseTextUnavailable}|${d.governedProvenanceEligible}`;
  return decisions.every((d) => key(d) === key(decisions[0]));
}
