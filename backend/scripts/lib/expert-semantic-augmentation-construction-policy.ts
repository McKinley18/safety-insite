/**
 * §127 -- CONSTRUCTION POLICY for FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1.
 *
 * FROZEN BEFORE A SINGLE CASE EXISTS. Hash this file before authoring; if its hash changes after a
 * row is written, the policy was fitted to the cases rather than the cases to the policy.
 *
 * ==================== WHY THIS CORPUS EXISTS ====================
 *
 * §126 measured two frozen composition minimums that NO authorized corpus can supply:
 *
 *   CLARIFICATION_OWED         required 20, maximum achievable 3   (short 17)
 *   CROSS_HAZARD_INTERACTION   required 10, maximum achievable 5   (short 5)
 *
 * and proved that opening GAUNTLET_OFFSET_2/_3 changes neither number, because that artifact
 * carries no gap label and no interaction label. The minimums are NOT relaxed and the reserve is
 * NOT opened. The only honest route left is to author the missing semantic truth and submit it for
 * independent safety review.
 *
 * ==================== THIS IS CANDIDATE TRUTH, NOT FORMAL TRUTH ====================
 *
 * Nothing authored here is formal truth. Every semantic determination is a CANDIDATE awaiting
 * independent product-owner safety review. No determination may enter the formal cohort before it
 * has been independently reviewed and accepted. The authoring agent's own self-review is explicitly
 * NOT sufficient: in §125/§126 that same process produced 16 rows whose self-review called them
 * sound, and independent review then overturned 3 of 14 forbidden determinations.
 *
 * ==================== CONSTRUCTION MAY NOT BE INFORMED BY PROVIDER BEHAVIOUR ====================
 *
 * This module imports no provider, no probe artifact, no run record and no expected-model-answer
 * fixture, so the prohibition is enforced by the dependency graph rather than by promise. No row is
 * written to be difficult, to probe a known weakness, or to produce any particular score.
 */

// ---------------------------------------------------------------- what a gap must be

/**
 * A clarification is OWED only where a specific fact is ABSENT from the observation and its absence
 * changes a safety decision. "More information would help" is never enough.
 *
 * Every gap must carry all four of these. A gap missing any one of them is malformed.
 */
export const GAP_PACKET_REQUIREMENTS: readonly string[] = [
  'MISSING_FACT: the exact fact that is absent, stated specifically enough to be asked as one question.',
  'WHY_ABSENT: why the observation does not already contain it -- what the observer could not see, '
    + 'reach, test or be told. A gap the text actually answers is not a gap.',
  'AFFECTED_DECISION: which decision moves, from the frozen EXPERT_AFFECTED_DECISIONS vocabulary.',
  'ALTERNATIVE_OUTCOMES: how at least two plausible answers would MATERIALLY change that decision. '
    + 'If every plausible answer leads to the same action, the fact is not decision-critical.',
];

/** Question shapes that are never acceptable as a decision-critical gap. */
export const FORBIDDEN_GAP_SHAPES: readonly string[] = [
  'Can you provide more details?',
  'What happened?',
  'Is this safe?',
  'Are there any other hazards?',
  'Was this reported?',
];

/** A gap description must be at least this long to be capable of naming a specific fact. */
export const MIN_GAP_DESCRIPTION_CHARS = 40;

// ---------------------------------------------------------------- what an interaction must be

/**
 * CO-OCCURRENCE IS NOT AN INTERACTION. Two hazards in one room are two hazards. An interaction
 * exists only where the relationship between them changes interpretation, priority, control,
 * sequencing, exposure or corrective action.
 *
 * The test applied to every candidate: WOULD TREATING THESE HAZARDS INDEPENDENTLY LOSE MEANINGFUL
 * SAFETY INFORMATION? If no, it is co-occurrence and must not be recorded.
 */
export const INTERACTION_PACKET_REQUIREMENTS: readonly string[] = [
  'PARTICIPANTS: two or more families, every one of them a PRESENT family on the row.',
  'KIND: a member of the frozen EXPERT_INTERACTION_KINDS vocabulary. The vocabulary is NEVER '
    + 'expanded, and OTHER is used only for a real relationship the named kinds do not cover.',
  'EVIDENCE_PER_PARTICIPANT: what in the observation establishes each participating hazard '
    + 'independently. A participant that exists only to complete a pair is fabrication.',
  'RELATIONSHIP: the causal or operational mechanism linking them.',
  'INDEPENDENT_LOSS: what a reviewer would miss if the two were assessed separately.',
];

// ---------------------------------------------------------------- the family partition

/**
 * THE M02 PROTECTION RULE, carried forward verbatim in effect from §125 and hardened by what the
 * independent review found there.
 *
 * PRESENT    the observation establishes the hazard.
 * FORBIDDEN  the observation gives AFFIRMATIVE information making the family objectively
 *            unsupported. There must be a LURE (language that could pull a reader toward it) and a
 *            DEFEATING FACT stated in the text.
 * DEFENSIBLE everything else, including every ambiguity.
 *
 * The review of §125 overturned three forbidden labels -- AUG-08 fall_protection, AUG-13
 * electrical, AUG-14 fall_protection -- each because a competent professional could legitimately
 * raise the family. That is a 21% error rate on this exact judgement, and it is why the rules below
 * are stated as prohibitions rather than preferences.
 */
export const FORBIDDEN_FAMILY_PROHIBITIONS: readonly string[] = [
  'ABSENCE IS NEVER EVIDENCE OF ABSENCE. A family the text simply does not mention is DEFENSIBLE.',
  'ONE CONTROL DOES NOT ELIMINATE EVERY RELATED HAZARD. An energy source isolated at one point does '
    + 'not forbid the family: other sources may remain.',
  'A RESOLVED STATE EXTENDS ONLY AS FAR AS THE OBSERVATION ESTABLISHES IT, never to the whole scene.',
  'DO NOT BROADEN FORBIDDEN BECAUSE THE ROW EXISTS FOR M09 OR M11. A row authored for a gap or an '
    + 'interaction gets exactly the forbidden families its own text supports, and often none.',
  'WHERE A COMPETENT SAFETY PROFESSIONAL COULD LEGITIMATELY RAISE THE FAMILY, IT IS DEFENSIBLE.',
];

// ---------------------------------------------------------------- targets

/**
 * Candidate-authoring targets carry margin ABOVE the frozen minimums so that independent review can
 * reject determinations without immediately re-blocking the cohort. THESE ARE NOT THE FROZEN
 * MINIMUMS AND DO NOT CHANGE THEM.
 */
export const CANDIDATE_TARGETS = {
  clarificationOwed: 26,
  crossHazardInteraction: 14,
  frozenMinimumClarificationOwed: 20,
  frozenMinimumCrossHazardInteraction: 10,
} as const;

/**
 * Overlap -- one row carrying both a gap and an interaction -- is PERMITTED where both are
 * independently true, and FORBIDDEN as an arithmetic device. The test: remove the interaction and
 * ask whether the gap still stands on its own; remove the gap and ask the same of the interaction.
 * Both must survive alone.
 */
export const OVERLAP_RULE: string =
  'Permitted only where the gap and the interaction are each independently true of the observation. '
  + 'Never manufactured to improve counts.';

/** Controls the corpus must also supply, so the new material cannot only ever say "yes". */
export const CONTROL_REQUIREMENTS = {
  clarificationNotOwed: 'Rows that owe NO question, because the observation states everything a '
    + 'decision needs. Without these, M10 has no zero-owed population and a model that always asks '
    + 'a question scores perfectly.',
  interactionAbsent: 'Rows with two or more present families that are genuine CO-OCCURRENCE and '
    + 'record NO interaction. Without these, an over-eager interaction claim costs nothing.',
} as const;

export const POLICY_PROHIBITIONS: readonly string[] = [
  'No row is authored or edited to change a score, and none may be revised in response to any later '
    + 'model behaviour.',
  'No frozen threshold, minimum, disposition, scorer or measurement-contract field is changed.',
  'The interaction vocabulary is not expanded.',
  'toExpertFamily is not widened and no family outside ACCEPTED_EXPERT_TAXONOMY is introduced.',
  'No reserved or retired corpus is opened, read or consulted.',
  'No provider is called and no provider output informs any case.',
  'A row that turns out to be badly authored is a finding to be recorded, never repaired to fit.',
];

export const SEMANTIC_AUGMENTATION_POLICY_VERSION = 'EXPERT_SEMANTIC_AUGMENTATION_POLICY_V1' as const;
