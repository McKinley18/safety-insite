/**
 * EXPERT HAZLENZ -- the prompt, the structured-output schema, and the quote binder.
 *
 * PROVIDER-NEUTRAL, AND IT STAYS IN THE CORE FOR THAT REASON. Nothing here names a vendor, a model,
 * an endpoint or a credential; the module's own containment guard
 * (`test:expert-nocall-harness` section D) would fail if it did. What a provider needs is a schema
 * object and two strings, and every adapter wires those into its own request shape -- one puts the
 * schema in a `format` field, another in a tool definition. That difference is the adapter's
 * business and this file does not know about it.
 *
 * ==================== THE WIRE FORM, AND WHY IT IS NOT THE CONTRACT ====================
 *
 * A model cannot reliably produce character offsets. L3 measured this the expensive way:
 * `EVIDENCE_OUT_OF_BOUNDS` on a `highConsequence` row left zero validated candidates and took three
 * gates down with it. So the model is never asked for an offset. It is asked for the exact QUOTE,
 * and `bindWireAnalysis()` finds that quote in the supplied source and computes the offsets itself.
 *
 * THIS IS NOT A WEAKENING OF THE EVIDENCE RULE, and the distinction matters:
 *
 *   - a quote that IS in the source binds to a real span, and the core validator then re-checks
 *     that span by exact equality, exactly as it would for any other producer;
 *   - a quote that is NOT in the source binds to `[-1, -1)`, which the core validator rejects with
 *     `EVIDENCE_OUT_OF_BOUNDS`. **The unbindable quote is never dropped.** Dropping it would hide a
 *     fabrication behind a smaller, cleaner-looking result, which is the one outcome this whole
 *     programme exists to prevent.
 *
 * The binder therefore moves the failure from "the model is bad at arithmetic" to "the model quoted
 * something that is not there", which is the thing worth measuring.
 */

import { createHash } from 'crypto';
import {
  CITATION_SHAPED_PATTERN,
  EXPERT_AFFECTED_DECISIONS, EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_CANDIDATE_RELATIONSHIPS,
  EXPERT_CLARIFICATION_CRITICALITY, EXPERT_CONDITION_STATES, EXPERT_CONFIDENCE_LEVELS,
  EXPERT_DISAGREEMENT_TARGETS, EXPERT_DISAGREEMENT_TYPES, EXPERT_GROUNDING_STATUSES,
  EXPERT_INTERACTION_KINDS, EXPERT_OUTCOMES,
  type DeterministicFamilyDisposition, type ExpertAnalysisInput,
} from './expert-contract.types';
import { EXPERT_AUTHORITY_SURFACES } from './expert-authority-matrix';

/**
 * v6. Bumped for the §112/D-124 remaining-R6-defect repair
 * (`HAZARD_FAMILY_INDEPENDENCE_MISTAKEN_FOR_CURRENT_EXPOSURE_INDEPENDENCE`): a new "A
 * HAZARD-RELEVANT FACT IS NOT YET A CURRENT HAZARD" system-prompt section, plus one reinforcing
 * line in the per-request user prompt. v5's "CURRENT STATE, NOT HISTORICAL STATE" section is
 * UNCHANGED and stays -- §112's hosted evidence showed it working (T1 clean, recall preserved) --
 * this is an ADDITIONAL rule for a distinct failure mode v5 did not address: the model correctly
 * recognizing a true, hazard-family-relevant fact (a guard is off) and then promoting it into a
 * current candidate without ever establishing current exposure, hedging every actual consequence
 * as a hypothetical ("if re-energization occurs", "if a worker were to approach"). The wire SCHEMA
 * is untouched -- no field, enum, or `required` entry moved -- so `EXPERT_ANALYSIS_CONTRACT_VERSION`
 * stays at `analysis.v2`. Bumped anyway, same reasoning as every prior prompt version bump: a
 * recorded probe names the prompt version it ran under, and §112's hosted R6 evidence (0/3 clean)
 * was measured under v5.
 */
export const EXPERT_PROMPT_VERSION = 'hazlenz.expert.prompt.v15' as const;

/**
 * v15. §178 CONTROL-PROPERTY SUFFICIENCY. ONE idea, in two places, and the second place is the
 * point of it: *evidence establishing one property of a control does not establish a different
 * property the decision needs.*
 *
 * ==================== WHY THE §176 RULE DID NOT FIRE ====================
 *
 * §176 added a temporal-sufficiency rule for exactly the row that §175 missed, and §177 measured
 * the row again under v14 and found it missed in the same way. The raw output says why, and the
 * answer is placement rather than wording. The model closed the guarding fact on PRESENCE -- the
 * control was stated to be in position -- and concluded that nothing decision-critical was missing.
 * Having decided the fact was settled, it never reached a question about WHEN the earlier
 * verification spoke for, so a correct rule sitting in the established-facts list was never
 * consulted on that path. A rule only fires where the reasoning actually passes through it.
 *
 * The unresolved property was not that the control existed. It was whether the control presently
 * had the property the decision turned on. Presence and securement are different properties of the
 * same object, and evidence for one is silent about the other.
 *
 * ==================== THE TWO INSERTIONS, AND WHY BOTH ====================
 *
 * 1. WHICH PROPERTY THE DECISION NEEDS (~40 lines), at the HEAD of `WHAT COUNTS AS ESTABLISHED`,
 *    ahead of the "STATES it" rule and its particulars. This is the determination of whether a
 *    fact is established, so the property comparison runs AS PART OF that determination rather
 *    than downstream of it. Five ordered steps: name the owed decision and its fact; name the
 *    property the decision needs; name the property the evidence establishes; compare; and only
 *    then let the timing rule apply. Step (v) hands off to §176 explicitly, so the two rules
 *    compose in the order the failure requires -- property first, then moment.
 *
 * 2. A second qualification inside `CURRENT STATE, NOT HISTORICAL STATE` (6 lines), beside §176's.
 *    That section is read BEFORE 1 and 2 and can close a fact on its own ("never ask a question
 *    the observation already answered"), which is precisely the premature-closure surface §177
 *    identified. Placing the rule only in the established-facts list would repeat the §176 mistake.
 *    It states the property qualification and defers the working of it to insertion 1.
 *
 * ==================== THE BRAKES, WHICH ARE MOST OF IT ====================
 *
 * The rule cuts every way and rules NO evidence class weak. A stated presence establishes a
 * presence fact COMPLETELY, and asking further is re-litigating a stated fact. A functional test
 * establishes function completely -- and is silent about a configuration the decision may
 * separately need, which is the same rule pointed the other direction. Physical inspection, visual
 * observation, documents, records, instrument readings and witness accounts are each named as
 * capable of establishing the property they speak to. Nothing here calls any of them insufficient
 * or stale, requires a test or a re-check for its own sake, or makes an unstated property into a
 * question: a property mismatch is a reason a fact is unsettled, never permission to ask, and the
 * five-part counterfactual test still gates every question on its own.
 *
 * The property vocabulary is EXAMPLES, explicitly "never a list to choose from", so no closed
 * taxonomy is created and the model is told to name the decisive property in its own words.
 *
 * ==================== IDENTITY, AND WHAT IS NOT CLAIMED ====================
 *
 * `EXPERT_PROMPT_VERSION` v14 -> v15 because the prompt TEXT changed semantically this time, unlike
 * the v13 -> v14 alignment in §177 which left `SYSTEM_PROMPT_SHA256` byte-identical. Every live
 * version pin moves with it; historical records that correctly state v13 or v14 do not. The wire
 * schema is untouched -- no field, enum or `required` entry moved -- so
 * `EXPERT_ANALYSIS_CONTRACT_VERSION` stays `analysis.v2`.
 *
 * NOTHING HERE IS TUNED TO A ROW. No frozen-instrument row id, hazard family, equipment, fastening,
 * verification activity or scenario wording from §173-§177 appears in this file. The proofs check
 * that, and static proofs are all they are: they show the rule is present, general, ordered and
 * braked. **They cannot show the model behaves differently.** Whether the repair changes behaviour
 * is answerable only by a hosted run, and §178 explicitly does not perform one -- the next
 * validation must be a preregistered REPLICATE design, because the §175 and §177 one-shot runs
 * cannot separate a remediation effect from sampling variance.
 */

/**
 * v13. §150 THE RETENTION BRIDGE. ONE addition, and it is a BRIDGE rather than a rule about when to
 * doubt: a decision-critical unknown the model correctly RETAINED must not terminate in a candidate
 * state, in reasoning, or in the summary.
 *
 * ==================== THE MECHANISM, AND WHY IT IS THE SIXTH ====================
 *
 * §149's US-D1 is the whole of this, and it is NOT the §149 defect. The model did everything v12
 * asks: it refused the strengthening (*"it does not describe any other worker, spotter, or traffic
 * management support"*), it declined to conclude (*"the observation does not establish this as
 * confirmed absent"*), and it marked the candidate `INSUFFICIENT_EVIDENCE`. **And then it asked
 * nothing.** `decisionCriticalClarifications` empty, `uncertainty.statements` empty.
 *
 * The doubt occupied three channels at once -- `assertedConditionState`, candidate `reasoning`, and
 * `expertExplanation.summary` -- and every rule in the contract was satisfied in all three.
 *
 *   THE COUNTERFACTUAL TEST     never entered: by list 2 the fact had been dispatched into list 1.
 *   THE NO-LOSS RULE            guards against loss to FREE TEXT ("free text supplements the
 *                               structure"). The thing DID reach a typed list -- the wrong one.
 *   THE SETTLEMENT CHECK        keyed to "every place you ASSERTED, ASSUMED or CONCLUDED a
 *                               condition". US-D1 did the opposite. The antecedent is FALSE.
 *   LIST 6's UNCERTAINTY BRIDGE the only real bridge in the contract -- and the sentence immediately
 *                               before it, "ONLY residual ambiguity you could not turn into a
 *                               candidate", DISQUALIFIES exactly the doubts that found a
 *                               candidate-shaped home. The empty `uncertainty` array was COMPLIANCE.
 *
 *      v10's SETTLEMENT CHECK catches a gap you RESOLVED. v12's NOT-OBSERVED-IS-NOT-ABSENT stops you
 *      RESOLVING it. NOTHING CATCHES A GAP YOU CORRECTLY LEFT OPEN.
 *
 * Full trace, with every §148 and §149 row tabulated: `verification/
 * expert-hazlenz-retention-bridge-remediation-2026-09-03/
 * CLARIFICATION-RETENTION-BRIDGE-ROOT-CAUSE.md`.
 *
 * ==================== WHY IT IS A BRIDGE AND NOT A LOWERED BAR ====================
 *
 * The tempting diagnosis -- "the candidate state swallows the question" -- IS REFUTED BY THE DATA.
 * `INSUFFICIENT_EVIDENCE` occurred on FIVE rows across §148 and §149 and FOUR of them emitted the
 * clarification anyway. What carried those four was something else that happened to apply: a
 * supplied record whose condition could not be evaluated (v11's threshold limb), or an unknown
 * attached to an already-ACTIVE hazard, which no candidate state can express. **US-D1 had neither,
 * so nothing pushed, and nothing was required to.** Whether a retained unknown becomes a question is
 * currently INCIDENTAL.
 *
 * SO `INSUFFICIENT_EVIDENCE -> ASK` IS REFUSED. That state is load-bearing -- the hard prohibition
 * offering it exists to stop the model asserting ACTIVE without present exposure, and weakening it
 * reopens what §112-§115 closed. The bridge is a CONJUNCTION and the counterfactual gate stays
 * binding:
 *
 *      RECOGNIZED UNKNOWN  +  THE ANSWER WOULD CHANGE A CONTRACT-VALID DECISION
 *                          ->  A CLARIFICATION MUST EXIST
 *
 * v13 adds THE RETENTION BRIDGE beside the two checks it completes, and it names the four channels a
 * doubt can terminate in because US-D1 used three of them simultaneously. It also lists what is NOT
 * a substitute for the question, because each item on that list is something US-D1 actually did.
 *
 * ==================== WHAT IT MUST NOT DO, AND IS GATED ON ====================
 *
 * NOT A QUOTA, NOT A FREQUENCY CHANGE. It creates no new reason to ask. It says only that a question
 * the model has ALREADY concluded is owed must be written down in the list that carries it. The
 * seven NOT-DECISION-CRITICAL shapes, the five conditions of the counterfactual test, the scoped
 * invariance limb and the genericness rule are byte-unchanged, and the bridge states in terms that
 * insufficiency which changes no decision stays silent.
 *
 * NOTHING FROM v9-v12 MOVED. The `INSUFFICIENT_EVIDENCE` state, v12's settlement semantics (§149
 * measured 0/10 unsupported settlements -- a CLOSED defect that must not be reopened), v11's
 * conjunctive threshold rule and `affectedDecision` self-check, v10's settlement check, and list 6's
 * existing uncertainty bridge all survive verbatim.
 *
 * The wire SCHEMA gains no field, no enum member and no `required` entry -- one description is
 * extended -- so `EXPERT_ANALYSIS_CONTRACT_VERSION` stays at `analysis.v2`. Arbitration is
 * byte-unchanged. The prompt version is bumped because §149's hosted evidence was measured under v12
 * and must stay attributable to it.
 */

/**
 * v12. §149 UNSUPPORTED SETTLEMENT. ONE mechanism, named for the first time, plus the entailment
 * discipline on the field where it actually happens.
 *
 * ==================== THE MECHANISM, AND WHY v11 COULD NOT SEE IT ====================
 *
 * §148's TR-E1 is the whole of this. The observation said:
 *
 *      "no gas monitor IS VISIBLE at the surface or on the man"
 *
 * The model bound that span EXACTLY -- correct offsets, correct attribution, `EVIDENCE_OUT_OF_BOUNDS`
 * did not fire and should not have -- and then wrote, one field away in `evidenceBasis`:
 *
 *      "there is no gas monitoring equipment PRESENT AT ALL"
 *
 * and in `reasoning`:
 *
 *      "the atmosphere inside the chamber is currently UNASSESSED AND UNMONITORED"
 *
 * **TWO unsupported steps, not one.** VISIBILITY -> EXISTENCE, and then EQUIPMENT -> ACTIVITY with
 * PRESENT -> PAST. The second is what destroyed the question, because the missing fact was whether
 * the atmosphere was tested BEFORE the entry -- a fact about the past that an observation about what
 * is visible now cannot reach. An instrument used and put away satisfies "no monitor visible"
 * exactly. The summary then said *"the observation itself establishes… no controls in place"*: the
 * model believed it had READ this. `decisionCriticalClarifications: []`, `uncertainty: []`.
 *
 * **v11's four ESTABLISHED limbs each fail to reach it, and the fourth is the near miss.** Worst-case
 * requires the model to know it assumed; resemblance requires a similarity step; the threshold limb
 * needs a supplied record; and *"a fact NOBODY MENTIONED is not thereby absent"* requires SILENCE.
 * The observation MENTIONED the monitor. It mentioned it negatively, about a WEAKER predicate than
 * the one the model went on to assert.
 *
 *      v11 governs facts the text is SILENT about and facts the model INVENTED. It does not govern a
 *      fact the text states NEGATIVELY about one predicate and the model then asserts about a
 *      STRONGER one.
 *
 * A partial negative READS LIKE COMPLETENESS AND BEHAVES LIKE SILENCE, and there was no limb for it.
 * Full trace: `verification/expert-hazlenz-unsupported-settlement-remediation-2026-09-03/
 * UNSUPPORTED-SETTLEMENT-ROOT-CAUSE.md`.
 *
 * ==================== WHAT v12 ADDS ====================
 *
 *   1. NOT OBSERVED IS NOT ABSENT, beside the "nobody mentioned" limb it is the sibling of. Read a
 *      negative for EXACTLY the predicate it uses, and the two jumps are named explicitly because
 *      both were made: thing-not-present -> activity-not-happening, and state-NOW -> what was done
 *      BEFORE. It says in the same breath that a REAL stated absence IS established, so this is a
 *      rule about which sentence you have, not an instruction to doubt the text.
 *   2. LIKELY IS NOT ESTABLISHED. v11 named nothing at all for this, and it is the state the model
 *      slides into when context makes an absence probable.
 *   3. WORST CASE MAY EXPLAIN; IT MUST NEVER SETTLE. The model already draws this distinction
 *      correctly ELSEWHERE IN THE SAME RESPONSE -- TR-E1's `crossHazardInsights` used a clean
 *      conditional, *"IF the unmonitored atmosphere incapacitates the worker…"*, while
 *      `evidenceBasis` wrote the branch down as fact. The rule makes the field boundary explicit
 *      rather than asking for new reasoning.
 *   4. THE ENTAILMENT DISCIPLINE, in the EVIDENCE section, because that is WHERE THE CROSSING
 *      HAPPENED. `evidenceBasis` sits beside a copied span and is read as a reading OF it. Grounding
 *      is a PROVENANCE check and says so in terms -- *"It is not read for meaning"* -- so nothing
 *      below the model checks that the basis is entailed by the quote it cites, and nothing can:
 *      that would be deterministic semantic inference over free-form prose, which §148 evaluated and
 *      refused on measured evidence.
 *   5. One sentence added to THE SETTLEMENT CHECK, pointing it at written absences specifically.
 *
 * ==================== WHAT v12 MUST NOT DO, AND IS GATED ON ====================
 *
 * NOT A REVERT AND NOT A QUOTA. Every v10/v11 limb is byte-unchanged: worst-case, resemblance, the
 * conjunctive threshold rule with its four insufficiencies, the scoped invariance limb, THE
 * SETTLEMENT CHECK, the `affectedDecision` self-check and its consequence. No quota, no minimum
 * count, no keyword trigger, no domain rule, no wording taken from TR-E1's facts.
 *
 * AND IT MUST NOT SUPPRESS A CANDIDATE. TR-E1's `atmospheric_hazard` candidate is CORRECT and must
 * survive -- a chamber connected to a foul sewer is a real hazard whether or not a monitor is
 * visible. The defect is the destroyed QUESTION, never the raised hazard, and a repair that traded
 * one for the other would be the §101/§105 failure this programme exists to prevent. The rule
 * therefore governs what may be written as an ESTABLISHED FACT, and touches nothing about when a
 * candidate may be raised.
 *
 * The wire SCHEMA gains no field, no enum member and no `required` entry -- two descriptions are
 * extended -- so `EXPERT_ANALYSIS_CONTRACT_VERSION` stays at `analysis.v2`. Arbitration is
 * byte-unchanged. The prompt version is bumped because §148's hosted evidence was measured under v11
 * and must stay attributable to it.
 */

/**
 * v11. §148 SETTLEMENT-THRESHOLD NARROWING + `affectedDecision` ROUTING ACCURACY. TWO changes, both
 * NARROWING, neither of them a new permission and neither of them a quota.
 *
 * ==================== CHANGE 1 -- THE THRESHOLD CLAUSE IS MADE CONJUNCTIVE ====================
 *
 * §147's hosted probe measured CR-D1 as a genuine PRECISION REGRESSION caused by v10's own text. The
 * model computed the record's band itself, wrote that 1,050 mm *"falls within the 965-1143 mm
 * range... so on its face the guardrail appears compliant"*, and then asked anyway.
 *
 * The cause is in v10's third ESTABLISHED bullet, which qualified a threshold as unsettled *"when the
 * facts sit close to the value, OR when the two are not measured on the same basis."* Both qualifiers
 * were ILLUSTRATIVE and DISJUNCTIVE. On CR-D1 neither actually held -- 1,050 mm is mid-band, and the
 * observation states the same datum the record states ("above the platform surface") -- yet the model
 * reached the clause anyway, because a disjunction of two soft descriptions is satisfied by any
 * reading that half-resembles either limb.
 *
 * v11 states the SETTLED case affirmatively and FIRST, then makes reopening CONJUNCTIVE and
 * OPERATIVE:
 *
 *      A threshold is SETTLED, and no question is owed, once the evidence supplies (1) the measured
 *      value, (2) the basis it was measured on, and (3) enough from the record to see which side or
 *      band that value occupies.
 *
 *      It is UNSETTLED only when BOTH (i) something OBJECTIVE in the record or the observation gives
 *      a concrete reason the supplied value or its basis may not be the comparison the record turns
 *      on, AND (ii) resolving that could put these facts on the OTHER SIDE of the line.
 *
 * Four things are named as insufficient, because each is a move the evidence or the analysis actually
 * showed: PROXIMITY alone (CR-D1's failure, and the reason the qualifiers had to stop being
 * illustrative); the MERE EXISTENCE of another measurement concept in the domain; measurement
 * uncertainty the model IMAGINED rather than read; and the fact that a more exact figure could in
 * principle be obtained.
 *
 * THE v10 RECOVERY IS NOT REVERTED. CR-E2 -- the EV-A6 shape, generalized and unmarked -- still
 * satisfies BOTH limbs and must still be asked: the supplied record itself requires interconnected
 * vessels to be counted as one process, the observation states a common header, and the second
 * package's charge is never given, so the nameplate figure is objectively not the record's comparison
 * quantity (i) and the aggregate could cross 10,000 pounds (ii). The narrowing removes the case where
 * NEITHER limb holds, which is exactly and only CR-D1.
 *
 * ==================== CHANGE 2 -- THE LABEL IS DISCLOSED AS LOAD-BEARING ====================
 *
 * §147 produced the FIRST hosted arbitration event in the programme. On CR-F2 the model asked a
 * substantively correct SCOPE question -- whether the loading pad is a classified hazardous area --
 * labelled it `HAZARD_EXISTENCE`, linked it to its own `fire_explosion` candidate which it had
 * asserted `ACTIVE`, and `CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE` destroyed it. Arbitration did
 * precisely what §141 specified and proved. **The label was wrong, not the arbitration.**
 *
 * §148 evaluated five policies for that case (A reject the clarification; B strip the label; C
 * deterministically reclassify; D reclassify when another reading is inferable; E keep fail-closed
 * arbitration and repair the label at the model) and chose **E**, on the owner's stated principle of
 * correcting the EARLIEST TRUSTWORTHY LAYER. B, C and D all require the arbitration stage to reason
 * about what an arbitrary natural-language question MEANS -- the semantic guessing §138 measured the
 * cost of, and a capability that stage was deliberately built without.
 *
 * So the repair is here, and it is DISCLOSURE rather than instruction. v10 already told the model
 * that existence is not open once it has asserted the hazard ACTIVE; what it never said is what
 * happens when the label is wrong anyway. v11 adds the self-check against the model's own candidate
 * list, routes the four cases that get mislabelled as existence, and states the CONSEQUENCE: a
 * `HAZARD_EXISTENCE` question naming one of your own ACTIVE candidates is DISCARDED IN FULL and the
 * reviewer never sees it.
 *
 * THIS CANNOT INCREASE QUESTION FREQUENCY. It adds no reason to ask and removes none of the seven
 * NOT-DECISION-CRITICAL shapes. It only redirects the LABEL of a question the model had already
 * decided to ask, and every path it names leads to a different enum member, never to an extra
 * question.
 *
 * NOTHING ELSE MOVED. No field, enum member or `required` entry changed, so
 * `EXPERT_ANALYSIS_CONTRACT_VERSION` stays `analysis.v2`; arbitration, the normalizer, the linkage
 * precedence and the settlement check are byte-unchanged. The prompt version is bumped because §147's
 * hosted evidence was measured under v10 and must stay attributable to it.
 */

/**
 * v10. §147 CLARIFICATION-RECALL REMEDIATION. One idea, in three places: **the contract must say
 * when the model is entitled to SETTLE a fact, not only what to do with a gap it has already
 * acknowledged.**
 *
 * §146 measured strict TRUE-GAP recall at 5/8 against a 0.75 target, and the root-cause
 * reconstruction (`verification/expert-hazlenz-clarification-recall-remediation-2026-09-03/
 * CLARIFICATION-RECALL-ROOT-CAUSE.md`) excluded every layer below the model on direct evidence:
 * across 24 §146 calls and §142's LP-B2, **not one clarification was stripped by normalization,
 * arbitration, link resolution, the merge or persistence.** The only issue in the whole §146 run is
 * an evidence-binding failure on a candidate. The questions were never emitted.
 *
 * The reconstruction found the discriminating variable. EVERY recovered gap was one the observation
 * ADVERTISED -- either it literally says "this does not establish X" (EV-A5, EV-C6) or the scene
 * carries an epistemic marker: a painted-over label, a blank permit section, nobody who could say.
 * EVERY missed gap was UNMARKED, derivable only from what the text never mentions -- and into that
 * hole the model put an inference:
 *
 *   - LP-B2  reasoned from the physical profile to a permit-space CLASSIFICATION, then asserted it;
 *   - EV-A4  ASSUMED the automatic upstream sequence was not inhibited and reported the worse
 *            consequence as fact, retaining nothing, not even an uncertainty statement;
 *   - EV-A6  read a supplied record's "above 24 feet" against a 23'6" tape reading, called the
 *            distinction "worth flagging", and then wrote that no decision-critical facts were
 *            missing -- in the same paragraph.
 *
 * A SETTLED FACT IS NOT A MISSING FACT, so v9's counterfactual test was never entered, and v9's
 * NO-LOSS RULE could not fire either: it is keyed to an ACKNOWLEDGED gap ("if you find yourself
 * writing 'no information about whether X'"), and a resolved gap never produces that sentence.
 *
 * A second, distinct mechanism appeared on EV-A2, where the fact WAS retained -- in
 * `uncertainty.statements` -- and dismissed as decision-invariant because "it does not change the
 * current control gap already identified". An action already owed for reason X does not make the
 * answers to Y equivalent when Y decides a DIFFERENT control. v9's invariance limb never said what
 * sameness is judged against.
 *
 * v10 therefore adds exactly three things, and removes nothing:
 *
 *   1. WHAT COUNTS AS ESTABLISHED, placed BEFORE the counterfactual test, because the test asks what
 *      is missing and that cannot be answered while treating one's own reasoning as evidence. It
 *      names the three settlement moves the evidence actually caught -- worst-case assumption,
 *      resemblance-to-a-programme, threshold reading across incomparable bases -- and states that an
 *      absence is usually not announced.
 *   2. The invariance limb of (c) is SCOPED to the decision the fact governs.
 *   3. THE SETTLEMENT CHECK, a self-audit beside the NO-LOSS RULE that re-reads the model's own
 *      assertions -- the only place a silently resolved gap is still visible.
 *
 * IT IS NOT A LOOSENING, AND NOT A QUOTA. The list still starts empty, the burden is still on
 * asking, the seven non-critical shapes are untouched, and the new block says so in terms: it tells
 * the model what is MISSING; the test still decides whether a missing fact earns a question. §146's
 * precision result is the thing being protected -- 0 coverage-habit questions, 0 duplicates, 0.435
 * questions per call -- and the local regression set gates it in both directions.
 *
 * One narrower repair rides along, because EV-A6 sat exactly on it: the entry gate was framed
 * entirely around a MISSING FACT ("a named condition, measurement, state or presence") while the
 * `affectedDecision` vocabulary offers REGULATORY_INTERPRETATION, which can be live when every
 * physical measurement is known. Condition (b) now admits that case explicitly.
 *
 * The wire SCHEMA gains no field, no enum member and no `required` entry -- two descriptions are
 * extended -- so `EXPERT_ANALYSIS_CONTRACT_VERSION` stays at `analysis.v2`. The prompt version is
 * bumped because §142's and §146's hosted evidence was measured under v8 and v9 and must stay
 * attributable to them.
 */

/**
 * v9. §143 LINKAGE-SEMANTICS PRECEDENCE. One change: the three linkage cases are made MUTUALLY
 * DECIDABLE by ordering them, and the clause that made them collide is fixed.
 *
 * §142's hosted probe populated 4 of 4 required links, chose the right referent on all three rows
 * where two candidates competed, and withheld the link on the ambiguity control. The single failed
 * criterion was one link on LP-G3: a question about the PPE worn *during one specific decanting
 * task*, which uniquely qualified one of four emitted candidates -- the chemical-exposure one, not
 * the three hazcom ones -- and whose two answers the model itself wrote out as two different current
 * actions.
 *
 * v8 could not decide that case, because it listed the cases without precedence and wrote
 * "general PPE, procedure or documentation follow-up" into FORBIDDEN without saying that GENERAL was
 * carrying the whole meaning. A question could satisfy REQUIRED and match FORBIDDEN's wording at the
 * same time. **The taxonomy was ambiguous, and a correct model behaviour was scored a violation.**
 *
 * v9 states the governing principle -- SPECIFIC SEMANTIC RELATIONSHIP OVERRIDES SUPERFICIAL QUESTION
 * FORM -- gives REQUIRED three explicit conditions, and orders the tests 1 -> 2 -> 3 so the first
 * match decides. A PPE, procedure or documentation question that passes TEST 1 is now linked by
 * construction, because TEST 1 runs first.
 *
 * THIS IS NOT A LOOSENING. FORBIDDEN still requires a POSITIVE reason and the ambiguity rule is
 * unchanged: two plausible referents means no unique link. Nothing asks the model to link more
 * often; the change is that the categories can now be told apart.
 *
 * NOTHING ELSE MOVED. No field added or removed, no enum member moved, no `required` entry changed,
 * so `EXPERT_ANALYSIS_CONTRACT_VERSION` stays `analysis.v2`. The candidateKey /
 * relatesToCandidateKey MECHANISM is untouched -- §142 measured it working, so it was not changed.
 *
 * NOT AN M14 CHANGE. No canonicalization, no deterministic semantic id, no permutation-specific
 * instruction. `candidateKey` remains producer-authored and free-form.
 */

/**
 * v8. §141 LINKAGE CONTRACT. ONE change, and it is a SPECIFICATION change, not a behaviour ask.
 *
 * v7 said, in one line, "if a clarification is about a hazard you DID raise as a candidate, name
 * that candidate in relatesToCandidateKey". §140's hosted probe showed that line is under-specified
 * in the only way that matters: it does not say when linking is WRONG. The probe recorded 1 of 3
 * "opportunities" populated and classified it LINKAGE_PARTIAL -- but the opportunity definition
 * counted any clarification emitted beside any candidate, and re-reading the three against a precise
 * rule shows the model was RIGHT all three times: it linked the one question that determined its own
 * candidate's status, and withheld the link on two questions whose relationship to any single
 * candidate was genuinely ambiguous. **The measurement was wrong, not the model**, and the repair is
 * to say precisely what the field means rather than to ask for more of it.
 *
 * So v8 states three cases -- REQUIRED, ALLOWED, FORBIDDEN -- in the system prompt and, per-field, in
 * the wire schema. It does NOT tell the model to link more often. Making every clarification attach
 * to a candidate is explicitly refused: that would rebuild the candidate-dependency the blueprint
 * forbids and would hand arbitration a stream of guesses to act on.
 *
 * NOTHING ELSE MOVED. No field added or removed, no enum member moved, no `required` entry changed,
 * so `EXPERT_ANALYSIS_CONTRACT_VERSION` stays `analysis.v2` and an analysis that omits the optional
 * field validates exactly as before. `EXPERT_PROMPT_VERSION` is bumped because a recorded probe
 * names the prompt version it ran under and §140's evidence was measured on v7 -- the same reason
 * every prior bump in this file gives.
 *
 * THIS IS NOT AN M14 CHANGE. No canonicalization, no deterministic semantic id, no permutation-
 * specific instruction. `candidateKey` remains producer-authored and free-form, exactly as it was.
 */

/**
 * v7. §139 supported-defect remediation, from the §137 diagnostic and §138 instrument audit.
 *
 * FOUR CHANGES, EACH TIED TO A MEASURED DEFECT. None of them is "ask fewer questions".
 *
 * 1. DECISION-CRITICALITY IS NOW A COUNTERFACTUAL, NOT A POSSIBILITY. v6 licensed any fact whose
 *    answer "could change" a decision. Under `could`, almost everything qualifies, and the formal
 *    run measured the consequence: 165 clarifications against 20 authored gaps, 106 of them on rows
 *    whose answer key owes none, and a stereotyped three-question exposure/severity/control template
 *    on the modal row. v7 requires the model to be able to NAME both branches -- one answer leading
 *    to one current outcome, a materially different answer leading to a different one -- and lists
 *    the seven shapes that are not decision-critical however useful they are.
 *
 * 2. THE SIX `affectedDecision` VALUES ARE DEFINED. §138 verified they were bare enum members with
 *    no definition in the type, the prompt or the schema. Two independent labellers -- the model and
 *    the answer-key author -- disagreed BIDIRECTIONALLY on the same pairs, which is the signature of
 *    an under-specified vocabulary rather than a one-directional model error. Definitions now appear
 *    here AND as per-value `description` in the wire schema, with the collision pairs called out.
 *
 * 3. THE PROHIBITION NO LONGER DEMONSTRATES THE FORBIDDEN FORM. v6 said "Do not write things of the
 *    form <two literal CFR citations>". Both matched `CITATION_SHAPED_PATTERN`, so every one of the
 *    195 formal calls carried two strings that would have condemned the whole analysis if echoed.
 *    `expert-deterministic-projection.ts` already refuses to project a citation for exactly this
 *    reason; the prohibition was doing what the projection was forbidden to do.
 *
 * 4. EVERY TYPED COLLECTION IS EXPLICITLY EMPTY BY DEFAULT, and the worked examples no longer read
 *    as a coverage checklist. v6's four clarification examples were reproduced in 35 of the 165
 *    emitted questions.
 *
 * The WIRE SCHEMA gains per-value enum descriptions and one OPTIONAL field
 * (`relatesToCandidateKey`); no field was removed, no enum member moved, and no `required` entry
 * changed, so `EXPERT_ANALYSIS_CONTRACT_VERSION` stays at `analysis.v2` and an analysis that omits
 * the optional field validates exactly as before.
 *
 * NOTHING HERE IS TUNED TO A SPENT-COHORT ROW. No row id, hazard, citation or question from the
 * formal cohort appears in this file.
 */

/**
 * The system prompt.
 *
 * Written as instructions about AUTHORITY rather than about formatting, because the format is
 * enforced by the schema and the authority is not. Every prohibition below has a corresponding
 * refusal in `expert-normalization.ts` -- the prompt asks, the boundary enforces, and the boundary
 * is what the safety property rests on. A model that ignores every sentence here still cannot reach
 * a customer.
 */
export const EXPERT_SYSTEM_PROMPT = [
  'You are a senior safety-and-health professional reviewing a field inspection observation.',
  '',
  'YOUR ROLE IS ADVISORY AND ADDITIVE. A deterministic hazard engine and a governed regulatory',
  'corpus have already produced the authoritative result. You cannot change it, remove anything from',
  'it, or overrule it. You add reasoning, context, questions and explanation beside it.',
  '',
  '================ HOW TO DECIDE WHERE EACH FINDING GOES ================',
  '',
  'Work through these in order. Fill the typed lists FIRST; write the summary LAST.',
  '',
  '================ CURRENT STATE, NOT HISTORICAL STATE ================',
  '',
  'Read this before you raise anything under 1 or 2 below. A hazard candidate or a clarification',
  'must be about the CURRENT state the observation reports, not a historical condition the',
  'observation itself already closes out.',
  '',
  'Read for whether a condition that once existed is described as remediated: removed, restored,',
  'corrected, resolved, verified, bled down, isolated, tagged, reinstalled, tested normal, returned',
  'to service, or otherwise closed out. If it is, do NOT raise a candidate or a clarification ABOUT',
  'THAT CONDITION unless the observation also gives you a reason to think:',
  '  - the hazardous state persists despite the stated remediation;',
  '  - the hazardous state recurred;',
  '  - the remediation failed or is described as incomplete;',
  '  - a current exposure remains;',
  '  - a current consequence of the historical condition remains, even though its cause is resolved',
  '    (a resolved CAUSE can still leave an unresolved CURRENT effect behind -- that effect is not',
  '    protected by this rule and belongs in the typed lists exactly like any other current fact);',
  '  - or a genuinely decision-critical present-state uncertainty remains -- one whose answer would',
  '    change what you would say about THIS observation today.',
  '',
  'A clarification about a remediated condition is decision-critical only when the observation',
  'itself leaves genuinely undetermined whether the remediation happened, took effect, or held.',
  '"Will this be reinstalled / re-tested / verified at some future step?" and "was this done',
  'correctly at the time?" are questions you could ask about almost ANY remediated condition in',
  'almost any observation -- that genericness is itself evidence the question is not decision-',
  'critical to what THIS observation reports, not evidence that it is thorough. Do not ask a',
  'question merely because you can imagine it. And never ask a question the observation already',
  'answered: re-litigating a stated, verified fact ("was it verified at zero?" when the text says it',
  'was verified at zero) is not a clarification — it is disregarding evidence you were given.',
  'Two qualifications, and only these two. FIRST, a stated verification answers the question for the',
  'moment it describes. Where the decision depends on the state at a LATER moment, check that what',
  'you were given reaches that moment before treating the question as closed -- if it does not, the',
  'question was never answered rather than answered and re-litigated. This does not reopen a',
  'remediation the observation reports as holding, and it is not a reason to ask whether anything',
  'might have changed since; it applies only where the decision itself turns on a later moment.',
  'SECOND, and of the same shape: a stated fact answers the question for the PROPERTY it states, and',
  'says nothing either way about a DIFFERENT property of the same thing. Where the decision turns on',
  'that other property, the question was never answered rather than answered and re-litigated.',
  'Both qualifications are worked in full under WHAT COUNTS AS ESTABLISHED in 2 below, and settle it',
  'there rather than here. NEITHER is a licence to reopen a fact whose property AND moment both',
  'match what the decision needs: where they match, the fact is closed, and you say so and move on.',
  '',
  'This is a rule about CURRENT vs PAST, never about tense or wording. Do not implement it as "the',
  'text uses past tense" or "the text contains the word removed / corrected / restored" — apply the',
  'actual judgment: given everything stated, does the hazard exist, or does the question remain',
  'open, RIGHT NOW? The rule applies the same way to every hazard family; it is not specific to',
  'machine guarding, electrical work, lockout/tagout, or any other single family.',
  '',
  'THIS SECTION NEVER MAKES YOU MORE CAUTIOUS ABOUT AN ORDINARY CURRENT HAZARD. If the observation',
  'states a hazard as a plain present fact, with no remediation, resolution, correction, or historical',
  'back-story attached to it at all, this section does not apply to it — raise the candidate exactly',
  'as 1 below already tells you to, with no extra hedge, no extra clarification standing in for it,',
  'and no delay while you look for a historical angle that is not there. This section exists to stop',
  'you inventing a hazard OUT OF a resolved history, never to make you doubt a hazard that was never',
  'about history in the first place.',
  '',
  '================ A HAZARD-RELEVANT FACT IS NOT YET A CURRENT HAZARD ================',
  '',
  'A fact can be true, and relevant to a hazard family, without by itself proving that hazard is',
  'happening NOW. Naming which hazard family a fact belongs to ("that is a distinct hazard family',
  'from X") is reasoning about relevance, not evidence of a current exposure — do not let it stand',
  'in for one.',
  '',
  'Before you raise a candidate as a current hazard, check what your OWN reasoning actually claims',
  'is happening right now. If the exposure you are describing only exists under a hypothetical you',
  'added yourself — "if re-energization occurs", "if a worker were to approach", "for anyone who',
  'might approach assuming it is safe", "during the work" when no work in progress was stated — you',
  'have shown the fact WOULD be hazardous under conditions the observation does not establish. That',
  'is not a current hazard. `assertedConditionState: ACTIVE` means active now, not "would become',
  'active if an unstated condition also held."',
  '',
  'A current answer -- a worker IS present at the point of exposure, a task IS being performed that',
  'creates contact, a specific stated condition makes contact possible right now -- is a real',
  'candidate; raise it in full, do not soften it. A fact plus your own invented hypothetical is not',
  'that answer, and neither is a question that doubts whether a step the observation already',
  'reports as done (locked out, tested, verified, confirmed) was done — treat a stated step as done,',
  'the same as any other stated fact.',
  '',
  'THIS SECTION NEVER MAKES YOU MORE CAUTIOUS ABOUT AN ORDINARY CURRENT HAZARD, using the exact same',
  'test as the CURRENT STATE section above: if the observation describes NO isolation, lockout,',
  'tagout, de-energization, verification, or other control at all, this section does not apply —',
  'raise the candidate exactly as 1 below already tells you to, at full strength, with no hedge and',
  'no delay while you look for a control-adjacent angle that is not there. This section exists to',
  'stop you inventing a hazard OUT OF a fact that a stated control already neutralizes; it is never a',
  'reason to hedge a hazard the observation states with no control mentioned at all.',
  '',
  'And if your own reasoning concludes a hazard is active or current — anywhere, including in the',
  'summary — that same conclusion belongs in the typed list. Do not describe a hazard as current in',
  'prose and then leave the candidate list without it; that is exactly the loss the NO-LOSS RULE',
  'below exists to catch.',
  '',
  'THIS IS NOT A RULE THAT ISOLATION OR LOCKOUT/TAGOUT MAKES ANY OTHER HAZARD SAFE. Mentioning an',
  'isolation, a lockout, a tagout, or any other control never lowers your bar for a DIFFERENT',
  'hazard, and never gives you a reason to doubt one the text otherwise supports. Judge every other',
  'candidate exactly as you would if no isolation had been mentioned at all: read the text AS',
  'STATED, and if it supports a current hazard, raise it in full. This section only ever REMOVES an',
  'invented hazard; it never adds a reason to suppress, soften, or question-mark a real one.',
  '',
  '1. PLAUSIBLE HAZARDS -> expertHazardCandidates',
  '   Any hazard you think may be present that is NOT already in the deterministic findings above.',
  '   Include it even if you are unsure — set confidence LOW and requiresUserConfirmation true.',
  '   Examples that belong here: a possible confined space; a possible chemical exposure; possible',
  '   stored energy; a secondary struck-by exposure.',
  '',
  '2. MISSING FACTS THAT WOULD CHANGE A DECISION -> decisionCriticalClarifications',
  '   THIS LIST STARTS EMPTY AND STAYS EMPTY UNLESS YOU CAN MEET THE TEST BELOW. Most observations',
  '   owe no question at all. The burden is on asking, never on staying silent.',
  '',
  '   WHAT COUNTS AS ESTABLISHED. Settle this BEFORE the test below. The test asks what is missing,',
  '   and you cannot answer that while treating your own reasoning as evidence.',
  '',
  '   WHICH PROPERTY THE DECISION NEEDS. Work this FIRST, before you ask whether anything was',
  '   stated, and again whenever you are about to write that something is settled. A fact is never',
  '   established in the abstract: it is established FOR A PROPERTY. Evidence about one property of',
  '   a thing is SILENT about a different property of that same thing -- it neither establishes that',
  '   other property nor rules it out -- so what you were given can be true, stated, and directly',
  '   relevant, and still leave the decision unresolved.',
  '',
  '   Work these in order, and stop at the step that answers you:',
  '     (i)   name the current decision you owe, and the fact it turns on;',
  '     (ii)  name the specific PROPERTY of that fact the decision depends on. Existence, presence,',
  '           securement, functional operation, effectiveness, configuration, protective response',
  '           and verified state are EXAMPLES of what a property can be -- never a list to choose',
  '           from. Name the property this decision actually makes decisive, in your own words, even',
  '           when nothing above fits it;',
  '     (iii) name the property the supplied evidence actually establishes, read for exactly what it',
  '           says and not one step further;',
  '     (iv)  compare (ii) with (iii). SAME PROPERTY: the fact IS established -- say so, move on, no',
  '           hedge and no question. DIFFERENT PROPERTY: what you were given is silent on the',
  '           property the decision needs, so that property stands unresolved unless something else',
  '           states it -- and look for that something else, in the observation, the deterministic',
  '           findings, a supplied governed record or an answered clarification, before you treat it',
  '           as missing;',
  '     (v)   only once (iv) matches does timing arise. The right property shown for the wrong',
  '           moment is handled by the verification-time rule below, not by this one.',
  '',
  '   THIS CUTS EVERY WAY, AND IT RULES NO KIND OF EVIDENCE WEAK. Where the decision turns on',
  '   presence, a stated presence establishes it COMPLETELY and asking further is re-litigating a',
  '   stated fact. Where it turns on function, a stated functional test establishes it completely --',
  '   and that same test is silent about a configuration, a scope or a securement the decision may',
  '   separately need. Physical inspection, visual observation, a document, a record, an instrument',
  '   reading and a witness account are each capable of establishing the property they speak to;',
  '   nothing here calls any of them insufficient, weak, stale or in need of a better method, and',
  '   nothing here requires a test, a re-check or a second source for its own sake.',
  '',
  '   AND IT NEVER MANUFACTURES A QUESTION. A property mismatch is a reason a fact is not yet',
  '   settled. It is not permission to ask. The unresolved property must be one THIS decision',
  '   genuinely turns on, and the question must still pass all five parts of the test below on its',
  '   own. A property you merely noticed nobody stated, one the decision does not depend on, or one',
  '   whose answer would only raise your confidence, stays unasked -- that is silence, exactly as it',
  '   was before this paragraph existed.',
  '',
  '   A fact is ESTABLISHED only if the observation, the deterministic findings above, a supplied',
  '   governed record, or an answered clarification STATES it. Your own inference does not establish',
  '   it, however sound the inference is. In particular:',
  '     - if you ASSUMED the worse of two possible states in order to describe the hazard, the state',
  '       you assumed is NOT established. Describing the worse case is not the same as knowing it,',
  '       and naming the worse consequence does not discharge the question;',
  '     - if you concluded that a programme, classification, standard or control framework covers',
  '       these facts because the conditions RESEMBLE the ones it covers, that coverage is NOT',
  '       established -- resemblance is a reason to ask, not an answer;',
  '     - A VERIFICATION ESTABLISHES THE STATE AT THE TIME IT WAS PERFORMED, and a fact can be',
  '       positively stated and still not be established FOR THIS DECISION. Where the decision',
  '       turns on the state at a particular moment -- now, or immediately before work, entry,',
  '       energisation, exposure, or return to service -- an earlier verification establishes the',
  '       fact for that decision only if what you were given also lets you conclude the state held',
  '       until that moment. So ask two questions and compare the answers: WHEN does the evidence',
  '       speak for, and WHEN does the decision need it to speak for? If they are the same moment,',
  '       the fact IS established -- say so and move on.',
  '       THIS IS ABOUT THE DECISION, NEVER ABOUT AGE. There is no interval that is too long and',
  '       none that is short enough, and no schedule, due date or routine period makes evidence',
  '       stale or fresh. A verification performed long ago is FULLY ESTABLISHED where the decision',
  '       does not depend on any later moment, and a verification performed minutes ago settles',
  '       nothing about a state that changed after it. Do not raise this because a record is old,',
  '       because an interval has elapsed, or because re-checking would be good practice -- only',
  '       where the two moments genuinely differ AND the test below is then met in full;',
  '     - A THRESHOLD IS NOT A GAP. A fact is not unresolved merely because a supplied record turns',
  '       on a stated value. If the evidence gives you (1) the measured value, (2) the basis it was',
  '       measured on, and (3) enough of the record to see which side or band that value occupies,',
  '       then how the condition applies here IS ESTABLISHED for the decision it governs. Do the',
  '       arithmetic, state the answer and move on. That reading is SETTLED even where you had to',
  '       convert units or read a band, and even where the answer is that the record is NOT met.',
  '       It is unsettled ONLY where BOTH of these hold:',
  '         (i)  something OBJECTIVE -- stated in the observation, in the deterministic findings, or',
  '              in the record itself -- gives a concrete reason the value or its basis may not be',
  '              the comparison this record actually turns on: the record measures from a different',
  '              datum than the observation reports, or it requires a quantity the text never gives',
  '              you, such as an aggregate the record itself says to combine; AND',
  '         (ii) resolving that could put these facts on the OTHER SIDE of the line, changing what is',
  '              done today.',
  '       BOTH, never either. None of the following is a reason on its own, and none of them makes a',
  '       settled reading unsettled:',
  '         - the value sits CLOSE to the boundary. Proximity on a stated, matching basis is still',
  '           settled -- near the line is a side of the line;',
  '         - some OTHER way of measuring this quantity exists in the domain. Unless something says',
  '           that other basis is the applicable one here, its mere availability is not a reason;',
  '         - you can IMAGINE measurement uncertainty the record and the observation do not report;',
  '         - a more exact figure could in principle be obtained. Almost always true, never a gap;',
  '     - a fact nobody mentioned is not thereby absent, and not thereby present. The observation',
  '       failing to say something is not the observation ruling it out.',
  '     - NOT OBSERVED IS NOT ABSENT. Read a negative sentence for EXACTLY the predicate it uses.',
  '       When the text says a thing was not VISIBLE, not SEEN, not SHOWN, not PRODUCED,',
  '       not AVAILABLE, not MENTIONED, or that nobody could DETERMINE it, then that -- and only',
  '       that -- is what is established. An observation is one person\'s vantage point at one',
  '       moment. It is not an inventory of the site.',
  '       So do NOT restate any of those as "there is no X", "no X exists", "X is not provided",',
  '       "the programme is absent", "nothing is being done" or "no controls are in place". TWO',
  '       JUMPS IN PARTICULAR ARE EASY TO MISS, and both are forbidden:',
  '         - from a THING not being there to an ACTIVITY not happening. Equipment you cannot see',
  '           may have been used and put away;',
  '         - from the state NOW to what was or was not done BEFORE. A check made before the work',
  '           began leaves nothing to see afterwards.',
  '       THIS IS NOT AN INSTRUCTION TO DOUBT THE TEXT. When the text really does establish an',
  '       absence -- "there is no guard fitted", "the operator confirmed none was issued", "the',
  '       register records none" -- that is a fact like any other and you should use it. The rule is',
  '       about which sentence you actually have, not about being cautious;',
  '     - LIKELY IS NOT ESTABLISHED. Context can make an absence very probable: common practice,',
  '       the usual configuration, what a site like this normally has, what you would expect to see.',
  '       None of that is evidence. Being able to write a confident sentence is not the same as',
  '       having been told the fact;',
  '     - WORST CASE MAY EXPLAIN. IT MUST NEVER SETTLE. Reasoning through the bad branch is how you',
  '       show why a missing fact matters, and it belongs in whyItMatters and in an interaction.',
  '       Keep it a conditional. "IF the check was never done, then ..." does not establish "the',
  '       check was never done." The moment you drop the "if" and write the branch as a fact, you',
  '       have answered your own question, and it will never be asked;',
  '',
  '   THE ABSENCE IS USUALLY NOT ANNOUNCED. Some observations say plainly that they do not establish',
  '   X, or describe why nobody could know X -- an unreadable label, a blank section, a record filed',
  '   elsewhere. MOST DO NOT. The fact is simply never mentioned, and the only trace of it is that',
  '   you had to supply it yourself to finish your reasoning. Those are the ones that get missed.',
  '',
  '   This does NOT lower the bar. It tells you what is MISSING; the test below still decides whether',
  '   a missing fact is worth a question, and most are not. An unestablished fact whose answers all',
  '   lead to the same action today is still silence.',
  '',
  '   THE COUNTERFACTUAL TEST. Emit a clarification ONLY when ALL FIVE hold:',
  '     (a) a specific current safety decision cannot be resolved from the observation, the',
  '         deterministic findings and assessments above, the supplied governed records, and the',
  '         facts already stated -- established as just defined, not as inferred by you;',
  '     (b) you can state the missing fact concretely -- a named condition, measurement, state or',
  '         presence, not "more information about X". Where what is unresolved is a SUPPLIED governed',
  '         record, the concrete thing is that record\'s stated condition and which way it applies to',
  '         these facts; an interpretive question can be live even when every measurement is known;',
  '     (c) you can NAME TWO materially different answers that lead to DIFFERENT current outcomes.',
  '         Write them to yourself before you ask: "if A, then <this>; if B, then <that>". If both',
  '         answers lead to the same thing you would say today, it is not decision-critical.',
  '         JUDGE SAMENESS AGAINST THE DECISION THIS FACT GOVERNS, not against everything already',
  '         owed on this observation. A corrective action you have already identified for a DIFFERENT',
  '         reason does not make these two answers equivalent. If one answer would add, remove,',
  '         escalate or change a control, a scope decision, or a stop-work decision, the outcomes',
  '         differ -- even where you are already recommending something else for another reason;',
  '     (d) without the answer the correct choice between those two outcomes cannot be made now;',
  '     (e) the question is none of the seven shapes listed below.',
  '',
  '   NOT DECISION-CRITICAL, however sensible the question is:',
  '     - merely useful to know, or good professional practice to confirm;',
  '     - best-practice follow-up that would be asked of almost any similar observation;',
  '     - documentation, records or paperwork to be verified later;',
  '     - historical context, or why a past state came about;',
  '     - severity refinement that does not change what is done now;',
  '     - routine due diligence, or confirmation of something the observation already establishes;',
  '     - a question about an unrelated secondary hazard you have not raised as a candidate.',
  '     - a DIFFERENT unresolved fact noticed while the fact this decision actually turns on is',
  '       already settled. Once the owed fact is established, an adjacent concern -- another',
  '       source, another interaction, another control you can imagine mattering -- does NOT',
  '       inherit its urgency. Raise it as a hazard candidate if it deserves one; it becomes a',
  '       clarification only if it independently passes all five parts of the test above on the',
  '       decision IT governs. Finding the owed fact settled is a reason to stay silent, never a',
  '       prompt to look for something else to ask.',
  '',
  '   A question you could ask about almost ANY observation of this kind is, by that very',
  '   genericness, not decision-critical to THIS one. Asking three questions that between them',
  '   cover exposure, severity and control is a COVERAGE HABIT, not analysis -- if you notice',
  '   yourself producing one of each, you are filling a list rather than reading the text.',
  '',
  '   This list does NOT need a hazard candidate. If you have no candidate at all but a specific',
  '   current decision genuinely cannot be made, return an empty hazard list and the question.',
  '',
  '   LINKING A QUESTION TO A CANDIDATE -- relatesToCandidateKey. You wrote the candidate list',
  '   above and you chose its candidateKey values, so you can name one here.',
  '',
  '   THE GOVERNING PRINCIPLE: what the question DOES to a candidate decides, not what the question',
  '   is ABOUT. Never classify by the presence of a word like PPE, procedure, documentation,',
  '   inspection or training. Work the three tests IN ORDER and stop at the first that matches.',
  '',
  '   TEST 1 -- SET IT when ALL THREE hold:',
  '     (a) exactly ONE candidate you emitted is the direct subject of the missing fact;',
  '     (b) materially different answers would change THAT candidate\'s existence, current status,',
  '         applicability, required control, exposure, or how it should be interpreted;',
  '     (c) the question cannot be read correctly without knowing which candidate it qualifies.',
  '     Copy that candidateKey exactly.',
  '',
  '   TEST 2 -- YOU MAY SET IT when one candidate is clearly the primary subject and the question',
  '     materially refines it, but the question still stands on its own and is useful without the',
  '     link. Setting it and omitting it are both correct here.',
  '',
  '   TEST 3 -- DO NOT SET IT, and there must be a POSITIVE reason: no candidate is the direct',
  '     subject; two or more candidates are equally plausible, so there is no unique referent; the',
  '     question is genuinely row-level or general; it is about a different hazard; the only',
  '     connection is a shared hazard family; or it is GENERIC PPE, procedure, documentation or',
  '     training follow-up that changes no specific candidate\'s decision.',
  '',
  '   READ TEST 3 CAREFULLY. "Generic" is the word that matters. A question about PPE, a procedure',
  '   or a document is NOT automatically unlinked -- if it passes TEST 1 it is linked, because TEST',
  '   1 runs first. "What PPE is required on this site?" beside four candidates is generic and takes',
  '   no link. "Is a respirator worn during THIS task?", where the answer decides whether ONE',
  '   specific exposure candidate is controlled, passes TEST 1 and takes the link.',
  '',
  '   Omitting the field is always a legal answer, and a question that needs no link is not a worse',
  '   question. NEVER invent a key: it must be one you actually wrote in the candidate list above,',
  '   and a key matching no candidate is discarded with the broken link recorded against the',
  '   question.',
  '',
  '   WHICH DECISION IT AFFECTS. `affectedDecision` is not a topic label -- it names the ONE decision',
  '   the missing fact blocks. The six values are distinct and are not interchangeable:',
  '     HAZARD_EXISTENCE        -- does the hazardous condition exist at all, right now? Use this',
  '                                only when existence is genuinely open. If you have already',
  '                                asserted the hazard as ACTIVE, existence is NOT open.',
  '     HAZARD_SEVERITY         -- the hazard exists; how bad is the consequence or how large is the',
  '                                magnitude? Use only when the answer changes what is done now.',
  '     EXPOSURE                -- who or what is exposed, or whether anyone is actually exposed.',
  '     APPLICABILITY           -- whether a particular rule, programme or control framework governs',
  '                                the facts as established. About SCOPE, not about which control.',
  '     REQUIRED_CONTROL        -- the hazard and the applicable framework are settled; which',
  '                                control is required, or whether a specific control was applied.',
  '     REGULATORY_INTERPRETATION -- what a SUPPLIED governed record means, or how its stated',
  '                                conditions apply here. Never usable when no record was supplied.',
  '   The pairs that get confused, decided explicitly:',
  '     - "was this control applied / is it isolated / was it bled down" is REQUIRED_CONTROL, not',
  '       HAZARD_EXISTENCE, even though the answer bears on danger.',
  '     - "does this substance / equipment / condition have the property that creates the hazard"',
  '       is HAZARD_EXISTENCE, not HAZARD_SEVERITY.',
  '     - "how much / how many / how long / how far" is HAZARD_SEVERITY, not HAZARD_EXISTENCE.',
  '     - "does this programme or standard apply here at all" is APPLICABILITY, not REQUIRED_CONTROL.',
  '',
  '   BEFORE YOU WRITE HAZARD_EXISTENCE, RE-READ YOUR OWN CANDIDATE LIST. If you emitted a candidate',
  '   for that hazard and asserted it ACTIVE, you have already answered the existence question and',
  '   the label is wrong. Ask what your question actually turns on, and label THAT:',
  '     - whether a programme, classification, zone or control framework reaches these facts at all',
  '       -> APPLICABILITY;',
  '     - whether a control was applied, or which one is required -> REQUIRED_CONTROL;',
  '     - who or what is actually exposed -> EXPOSURE;',
  '     - what a SUPPLIED record means or how its stated conditions apply -> REGULATORY_INTERPRETATION.',
  '',
  '   THE LABEL IS LOAD-BEARING, AND A WRONG ONE DESTROYS THE QUESTION. A clarification labelled',
  '   HAZARD_EXISTENCE that names one of your own ACTIVE candidates is DISCARDED IN FULL -- the',
  '   question, both branches and the reasoning behind it -- and the reviewer never sees it. The',
  '   candidate is kept; only the question is lost. So a question you were right to ask is thrown away',
  '   by a label that does not match it. Choosing the right value is not tidiness here: it is the',
  '   difference between the question being answered and the question ceasing to exist.',
  '',
  '   This is not a reason to ask MORE questions, and it never lowers the test in 2. Every route above',
  '   leads to a different label on a question you had already decided to ask.',
  '',
  '3. CONDITIONS THAT ARE WORSE TOGETHER -> crossHazardInsights',
  '   STARTS EMPTY. Emit one only when the observation establishes BOTH conditions as present, and',
  '   their combination makes the outcome worse than either alone. Two hazards appearing on the same',
  '   site is not an interaction; a shared mechanism is. If you cannot name the mechanism by which',
  '   one worsens the other, there is no insight to record.',
  '',
  '4. CHALLENGES TO THE AUTHORITATIVE RESULT -> disagreements',
  '   ONLY when you think the deterministic result or a supplied governed record is wrong,',
  '   incomplete or needs review. Adding context is NOT a disagreement. If you are simply',
  '   contributing something new, that is a candidate or an insight, not a disagreement.',
  '',
  '5. SUMMARY -> expertExplanation.summary',
  '   Two or three sentences synthesising what you already put in the lists above.',
  '   The summary is a SUPPLEMENT. It is never the only place a hazard, a question or an',
  '   interaction appears. If you find yourself writing "no information about whether X" in the',
  '   summary, X is a decisionCriticalClarification and belongs in that list too.',
  '',
  '6. UNCERTAINTY -> uncertainty.statements',
  '   ONLY residual ambiguity you could not turn into a candidate, a question or an insight.',
  '   It is not an overflow channel. If an uncertainty can be phrased as a question that would',
  '   change a decision, it is a decisionCriticalClarification, not an uncertainty.',
  '',
  'THE NO-LOSS RULE. If something you identified meets the criteria for one of the typed lists, it',
  'MUST appear in that list — even if you also mention it in the summary. Free text supplements the',
  'structure; it never replaces it.',
  '',
  'THE SETTLEMENT CHECK. Run this ONCE, after the lists are written and before you finish. Re-read',
  'your own summary and reasoning, and find every place you asserted, assumed or concluded a',
  'condition. For each one ask: does the observation, a deterministic finding, a supplied governed',
  'record or an answered clarification actually STATE it? If it does not, and if a materially',
  'different value would change what is done now, that is a decisionCriticalClarification -- and it',
  'is still owed even though you have already written a confident sentence about it. Writing the',
  'sentence is what hides the question: the no-loss rule above catches a gap you ADMITTED, and this',
  'check is the only thing that catches one you RESOLVED.',
  'Look hardest at any sentence where you wrote an ABSENCE. Check the text says the thing is absent,',
  'and not merely that it was not seen, not shown, not mentioned or could not be determined -- and',
  'that where you wrote nothing was being DONE, the text says that, and not only that you could not',
  'see the means of doing it.',
  'This check FINDS candidates for the test in 2. It does not excuse them from it.',
  '',
  'THE RETENTION BRIDGE. Run this LAST, over everything you have just written. The check above',
  'catches a fact you RESOLVED. This one catches a fact you correctly left OPEN and then never',
  'asked about.',
  'Go through your own output and find every unresolved fact you RELIED ON -- every place you left',
  'something unsettled and carried on. It can be in any of four places, and it is easy to miss',
  'because none of them looks like a mistake:',
  '  - a candidate you left INSUFFICIENT_EVIDENCE or UNKNOWN, or gave LOW confidence because you',
  '    could not establish it;',
  '  - reasoning or an evidenceBasis that calls something unconfirmed, not established, possible,',
  '    or known only with low confidence;',
  '  - a summary sentence that says a fact is not settled;',
  '  - an uncertainty statement.',
  'For each one ask ONE question: WOULD LEARNING THIS FACT CHANGE WHAT IS DONE NOW -- the existence,',
  'current status, applicability, required control, exposure, or accepted interpretation of anything',
  'you have raised?',
  '  If YES, there MUST be a decisionCriticalClarification for it. If you have not written one,',
  '  write it now.',
  '  If NO, say nothing. Insufficiency that changes no decision is not a question, and most is not.',
  '  If you have already asked it, do NOT ask again. One question per fact.',
  '',
  'NONE OF THESE IS A SUBSTITUTE FOR THE QUESTION, and each is a place a real one has been lost:',
  '  - leaving the candidate INSUFFICIENT_EVIDENCE. That is the right STATE, and it is not an',
  '    answer to the customer -- it records that YOU do not know, and asks nobody who might;',
  '  - saying in reasoning that the evidence is insufficient;',
  '  - writing out both branches without asking which one holds;',
  '  - noting it in the summary or in uncertainty.',
  'A decision-critical unknown that reaches the reviewer only as a candidate state or a sentence of',
  'prose is a question you decided not to ask. It cannot be answered, so it cannot be closed.',
  '',
  'THIS DOES NOT LOWER THE BAR AND IT IS NOT A QUOTA. It adds no reason to ask. INSUFFICIENT_EVIDENCE',
  'ON ITS OWN IS NEVER A REASON TO ASK -- the test in 2 still decides, all five of its conditions',
  'still hold, and the seven shapes below it are still not decision-critical. This check only makes',
  'sure a question you have ALREADY concluded is owed ends up in the list that can carry it.',
  '',
  'Not every sentence of the summary needs to map to a list. Only the things that meet the criteria.',
  '',
  '================ HARD PROHIBITIONS ================',
  '',
  'Output violating any of these is rejected in full:',
  '- NEVER write a regulatory citation anywhere -- not in a field, not in prose, not as an example,',
  '  and not even to say which one you are not writing. That means no section number, paragraph',
  '  reference or code designation of any kind, in any jurisdiction. Refer to a supplied record by',
  '  its TITLE or as "the supplied record", never by its number. This applies to numbers that appear',
  '  in your own input: reproducing one is the same violation as inventing one.',
  '- NEVER invent a standard, a release identifier, an approval state or a review status.',
  '- NEVER present a regulatory obligation as governed fact unless a SUPPLIED governed record states',
  '  it. If the supplied records do not cover the obligation, or the records you were given are',
  '  about a different subject, or none was supplied at all, then ABSTAIN: say what the observation',
  '  shows and stop. Do not reach for regulatory knowledge of your own to fill the gap, and do not',
  '  stretch a supplied record to cover something narrower or wider than it states. Abstaining is a',
  '  correct answer and is never penalised.',
  '- NEVER assert a condition is ACTIVE when the observation does not establish present exposure.',
  '  If you cannot establish the state, say INSUFFICIENT_EVIDENCE or UNKNOWN. Both are real answers.',
  '- NEVER assert a hazard candidate as ACTIVE and in the same response ask whether that hazard',
  '  exists. Those two statements contradict each other. Decide: if existence is genuinely open the',
  '  candidate is INSUFFICIENT_EVIDENCE and the question is legitimate; if you are confident enough',
  '  to say ACTIVE, the existence question is already answered and must not be asked.',
  '',
  'EVIDENCE. Every hazard candidate must DECLARE its grounding. There is no third option and no',
  'way to stay silent:',
  '',
  '  groundingStatus: EXACT_QUOTE_SUPPLIED',
  '    Use this whenever the observation contains words that support the candidate — which is the',
  '    normal case, because the observation is what you are reasoning from. Then `evidence` must',
  '    carry at least one quote copied from it character for character, including case and',
  '    punctuation. Quote the SHORTEST span that actually supports the candidate.',
  '    The quote is matched by EXACT STRING SEARCH against the observation. It is not read for',
  '    meaning, so a correct paraphrase fails exactly like an invented sentence. Copy one',
  '    CONTIGUOUS run of characters. Do not join two fragments, do not insert an ellipsis, do not',
  '    fix grammar, spelling, tense or capitalisation, and do not add or remove a word. If you are',
  '    about to write a phrase you composed rather than one you copied, you want',
  '    NO_EXACT_QUOTE_AVAILABLE instead.',
  '',
  '  groundingStatus: NO_EXACT_QUOTE_AVAILABLE',
  '    Use this ONLY when the observation genuinely contains no supporting span — for example when',
  '    the hazard follows from context rather than from anything written down. Then `evidence` must',
  '    be empty. The candidate is still raised, still reaches the reviewer, and is simply marked',
  '    ungrounded. Never drop a hazard you believe may be present just because you cannot quote it.',
  '',
  'These two are checked against each other. Claiming EXACT_QUOTE_SUPPLIED and then supplying no',
  'quote fails closed: the candidate is discarded. Never quote text that is not present — an',
  'invented quote is rejected, and the candidate that carried it is refused with it.',
  'And NO_EXACT_QUOTE_AVAILABLE is a claim ABOUT THE OBSERVATION, which can be read and checked, so',
  'do not choose it to save effort when a supporting phrase is sitting there in the text.',
  '',
  'YOUR EVIDENCE BASIS MUST NOT SAY MORE THAN YOUR QUOTE DOES. `evidenceBasis` and `reasoning` sit',
  'beside a span you copied, and a reader takes them as a reading OF that span. So write what the',
  'span establishes, not what you concluded from it: if the quote is about what could be SEEN, the',
  'basis is about what could be seen. RESTATING A NEGATIVE MORE STRONGLY THAN THE TEXT WROTE IT is',
  'the commonest way a real question disappears -- the fact then looks settled, so nothing is asked,',
  'and nobody can tell from the output that anything was decided. The quote is checked for where it',
  'came FROM, never for whether these sentences follow from it, so this one is on you.',
  'If you believe the stronger claim, it is a POSSIBILITY in reasoning and a QUESTION in',
  'decisionCriticalClarifications. It is never a fact in evidenceBasis.',
  'None of this is a reason to withhold a candidate. Raise the hazard exactly as you would have;',
  'describe it in the words the text supports.',
  '',
  'DECIDE `outcome` LAST, after the lists are written, and make it agree with them. NOTHING_TO_ADD',
  'is a statement that every typed list above is empty. If any of them has an entry, the outcome is',
  'ANALYZED. Do not answer this field before you have done the work it summarises.',
  '',
  'NOTHING_TO_ADD is correct ONLY when the observation is complete and the condition is already',
  'controlled — every relevant fact is stated and nothing is left open. It is NOT correct when a',
  'fact you would want is missing: that is a decisionCriticalClarification, and the lists should not',
  'be empty. Before returning NOTHING_TO_ADD, check that you wrote no "no information about..." and',
  'no "it is unclear whether..." anywhere — each of those is a question you owe.',
  'Do not invent a hazard, a question or an interaction to fill a list either. Both mistakes cost.',
  '',
  'Return only the structured result. Do not narrate your reasoning process.',
].join('\n');

/** The surfaces a disagreement may name. Derived from the matrix, never hand-listed. */
const CHALLENGEABLE_SURFACES = EXPERT_AUTHORITY_SURFACES
  .filter(s => s.permitted.includes('CHALLENGE')).map(s => s.surface);

/**
 * The structured-output schema over the WIRE form.
 *
 * Enums are bound to THIS request's vocabularies, so an out-of-taxonomy hazard family is refused by
 * the transport before it reaches the boundary where it would be refused again. Two refusals is
 * correct: the schema saves a round trip, and the boundary is what actually decides.
 */
export function buildExpertWireSchema(input: ExpertAnalysisInput): Record<string, unknown> {
  const sourceIds = input.authoritativeSources.map(s => s.sourceId);
  // `minLength: 1` matters more than it looks. Every one of these fields is checked by
  // `isNonEmptyString` at the boundary, but the wire schema asked only for `type: 'string'` -- so an
  // empty string passed STRICT transport validation and was then refused as CANDIDATE_MALFORMED.
  // §104's hosted negative control did exactly that. Two refusals is correct; a refusal the
  // transport could have made and did not is a round trip and a confusing issue code.
  const str = (description?: string) =>
    (description ? { type: 'string', minLength: 1, description } : { type: 'string', minLength: 1 });

  const evidence = {
    type: 'array',
    description: 'Exact verbatim quotes copied from the observation text, character for character. '
      + 'Required to be NON-EMPTY when groundingStatus is EXACT_QUOTE_SUPPLIED, and required to be '
      + 'EMPTY when it is NO_EXACT_QUOTE_AVAILABLE. Copy the shortest span that actually supports '
      + 'the candidate. Never invent a quote and never paraphrase one.',
    items: {
      type: 'object',
      properties: {
        sourceId: { type: 'string', enum: sourceIds },
        // NO `maxLength` HERE, AND THAT IS A MEASURED DECISION RATHER THAN AN OMISSION. §105 tried
        // one, to stop the local model pasting the whole observation into a quote. Under the local
        // provider's structured decoding it did not produce a SHORTER span -- it produced a
        // TRUNCATED one, cut mid-sentence with stray characters appended, which bound even less
        // often than the over-long quote it replaced. A schema keyword that corrupts output on a
        // provider we can actually test is not a repair, whatever it might do on another one. The
        // ask is made in the description instead, where a model that ignores it still emits
        // something well-formed.
        quotedText: {
          type: 'string', minLength: 1,
          description: 'Copied character-for-character from the named source, including case and '
            + 'punctuation. ONE SHORT CONTIGUOUS SPAN — the few words that actually support the '
            + 'candidate, not the whole observation.',
        },
      },
      required: ['sourceId', 'quotedText'],
    },
  };

  return {
    type: 'object',
    properties: {
      expertHazardCandidates: {
        type: 'array',
        description: 'Plausible hazards NOT already present in the deterministic findings. Include '
          + 'uncertain ones with LOW confidence rather than omitting them. A possible confined '
          + 'space, chemical exposure, stored energy or struck-by exposure belongs HERE, not in the '
          + 'summary. ONE ENTRY PER DISTINCT HAZARD: if the observation supports two different '
          + 'hazards, emit two candidates. Do not merge them into one entry and do not leave the '
          + 'second one to the summary.',
        items: {
          type: 'object',
          properties: {
            candidateKey: str('Short stable id, unique within this response.'),
            hazardFamily: { type: 'string', enum: [...input.allowedHazardFamilies] },
            assertedConditionState: { type: 'string', enum: [...EXPERT_CONDITION_STATES] },
            groundingStatus: {
              type: 'string',
              enum: [...EXPERT_GROUNDING_STATUSES],
              description: 'Say which case this candidate is in. EXACT_QUOTE_SUPPLIED when the '
                + 'observation contains words that support it — then evidence MUST carry at least '
                + 'one verbatim quote. NO_EXACT_QUOTE_AVAILABLE only when the observation genuinely '
                + 'contains no supporting span, for instance when the hazard is inferred from '
                + 'context rather than stated — then evidence MUST be empty. Choosing '
                + 'NO_EXACT_QUOTE_AVAILABLE is a claim ABOUT THE OBSERVATION and it can be checked '
                + 'against it, so do not choose it to save effort.',
            },
            evidence,
            evidenceBasis: str('What in the observation supports this — stated as a reading of the '
              + 'span you quoted, never as more than that span establishes. If the quote is about '
              + 'what could be SEEN, this is about what could be seen. Do not restate a negative '
              + 'more strongly than the text wrote it: "not visible", "not shown", "not mentioned" '
              + 'and "could not be determined" do NOT become "there is no X", "no X exists" or '
              + '"nothing is being done". A stronger claim you believe is a POSSIBILITY in '
              + 'reasoning and a QUESTION in decisionCriticalClarifications, never a fact here. '
              + 'This never justifies withholding the candidate — raise the hazard, describe it in '
              + 'the words the text supports.'),
            reasoning: str('Why this constitutes a hazard.'),
            confidence: { type: 'string', enum: [...EXPERT_CONFIDENCE_LEVELS] },
            relationshipToDeterministic: { type: 'string', enum: [...EXPERT_CANDIDATE_RELATIONSHIPS] },
            requiresUserConfirmation: { type: 'boolean' },
          },
          // `evidence` and `groundingStatus` are BOTH required, and that is not a return to the
          // attempt-1 rule that suppressed this collection. Attempt 1 demanded a QUOTE from every
          // candidate, so a candidate the model could not quote had no legal shape and vanished.
          // Here the model must always DECLARE, and `NO_EXACT_QUOTE_AVAILABLE` with an empty list is
          // a fully legal candidate that still reaches the customer path as ungrounded. What is no
          // longer legal is SILENCE: §104 measured 0 quotes across both grounding fixtures because
          // omitting the field was free. It is not free any more -- it costs a falsifiable claim
          // that the observation contains nothing quotable.
          required: ['candidateKey', 'hazardFamily', 'assertedConditionState', 'groundingStatus',
                     'evidence', 'evidenceBasis', 'reasoning', 'confidence',
                     'relationshipToDeterministic', 'requiresUserConfirmation'],
        },
      },
      decisionCriticalClarifications: {
        type: 'array',
        description: 'EMPTY BY DEFAULT. A missing fact belongs here ONLY when you can name two '
          + 'materially different answers that would lead to two different CURRENT outcomes, and '
          + 'the correct choice between them cannot be made without it. A question that is merely '
          + 'useful, is good practice, verifies documentation, refines severity without changing '
          + 'what is done, asks about history, restates something already established, or could be '
          + 'asked of almost any similar observation, does NOT belong here — leave the array empty '
          + 'instead. Emitting one question of each kind to cover exposure, severity and control is '
          + 'a coverage habit and is wrong. Independent of hazards: a question may stand with no '
          + 'candidate. Distinct from uncertainty — but most residual doubt is neither, and is '
          + 'simply left unsaid. '
          + 'WHAT COUNTS AS MISSING: a fact is established only if the observation, the deterministic '
          + 'findings, a supplied governed record or an answered clarification STATES it. Your own '
          + 'inference does not establish it — not a worst-case state you assumed in order to '
          + 'describe the hazard, and not a programme or classification you concluded applies '
          + 'because the conditions resemble the ones it covers. Most absences are never announced '
          + 'by the text. '
          + 'NOT OBSERVED IS NOT ABSENT: read a negative for exactly the predicate it uses. "Not '
          + 'visible", "not shown", "not produced", "not mentioned" and "nobody could determine" '
          + 'establish that and only that — never "there is no X", "X is not provided" or "nothing '
          + 'is being done". A thing not being there does not establish an activity not happening, '
          + 'and the state now does not establish what was or was not done before. An absence the '
          + 'text really does state IS established and should be used. Likelihood, common practice '
          + 'and the expected configuration establish nothing. And a worst-case branch may EXPLAIN '
          + 'why a missing fact matters but must never SETTLE it: "if the check was never done, '
          + 'then…" does not establish that it never was. '
          + 'A THRESHOLD IS NOT A GAP: where the evidence gives the measured value, the basis it was '
          + 'measured on, and enough of the record to see which side or band it occupies, that '
          + 'reading IS established — do the arithmetic and move on. It is unsettled only when BOTH '
          + 'something objective in the record or the observation gives a concrete reason the value '
          + 'or its basis is not the comparison the record turns on, AND resolving that could put '
          + 'these facts on the other side of the line. Proximity to the boundary alone, the mere '
          + 'existence of another measurement basis, imagined uncertainty, and the availability of a '
          + 'more exact figure are each insufficient on their own. '
          + 'WHAT COUNTS AS THE SAME OUTCOME: judge sameness against the decision THIS fact governs, '
          + 'not against everything already owed here. A corrective action already identified for a '
          + 'different reason does not make two answers equivalent. '
          + 'AND A RETAINED UNKNOWN BELONGS HERE, NOT ONLY IN A CANDIDATE STATE: if you left a '
          + 'candidate INSUFFICIENT_EVIDENCE or UNKNOWN, called something unconfirmed in reasoning, '
          + 'or said in the summary that a fact is unsettled, and learning that fact would change '
          + 'what is done now, the question belongs in THIS array as well. Leaving it as a state or '
          + 'a sentence records that you do not know; it asks nobody who might. Insufficiency that '
          + 'changes no decision stays silent, and a fact already asked about is not asked twice.',
        items: {
          type: 'object',
          properties: {
            clarificationId: str('Short stable id, unique within this response.'),
            question: str('One question, asked plainly.'),
            whyItMatters: str('Name BOTH branches: what one answer would mean for what is done now, '
              + 'and what a materially different answer would mean instead. If you cannot write '
              + 'both, the question is not decision-critical and must not be emitted.'),
            affectedDecision: {
              type: 'string',
              enum: [...EXPERT_AFFECTED_DECISIONS],
              description: 'The ONE decision this missing fact blocks, not a topic label. '
                + 'HAZARD_EXISTENCE = does the hazardous condition exist at all right now; use only '
                + 'when existence is genuinely open, and never alongside your own ACTIVE candidate '
                + 'for that hazard. '
                + 'HAZARD_SEVERITY = the hazard exists, how bad or how large is it. '
                + 'EXPOSURE = who or what is exposed, or whether anyone is exposed at all. '
                + 'APPLICABILITY = whether a rule, programme or control framework governs these '
                + 'facts — about scope, not about which control. '
                + 'REQUIRED_CONTROL = which control is required, or whether a specific control was '
                + 'applied, once the hazard and framework are settled. '
                + 'REGULATORY_INTERPRETATION = what a SUPPLIED governed record means or how its '
                + 'conditions apply; never usable when no record was supplied. '
                + 'Confusable pairs: "was it isolated / locked out / bled down" is REQUIRED_CONTROL, '
                + 'not HAZARD_EXISTENCE. "Does it have the property that creates the hazard" is '
                + 'HAZARD_EXISTENCE, not HAZARD_SEVERITY. "How much / how many / how long" is '
                + 'HAZARD_SEVERITY. "Does this programme apply here at all" is APPLICABILITY. '
                + 'BEFORE WRITING HAZARD_EXISTENCE, re-read your own candidate list: if you asserted '
                + 'that hazard ACTIVE, existence is closed by your own answer and the label is '
                + 'wrong — route it to APPLICABILITY (does a framework, zone or classification '
                + 'reach these facts), REQUIRED_CONTROL (was a control applied, which is required), '
                + 'EXPOSURE (who is exposed) or REGULATORY_INTERPRETATION (what a supplied record '
                + 'means) instead. A HAZARD_EXISTENCE question naming one of your own ACTIVE '
                + 'candidates is DISCARDED IN FULL and the reviewer never sees it, so a wrong label '
                + 'destroys a question you were right to ask.',
            },
            criticality: { type: 'string', enum: [...EXPERT_CLARIFICATION_CRITICALITY] },
            evidenceGap: str('What is missing, stated as a fact rather than a question. A value you '
              + 'supplied yourself — assumed, inferred or read across a threshold — counts as '
              + 'missing, not as known.'),
            relatesToCandidateKey: {
              type: 'string',
              description: 'OPTIONAL back-reference to a candidateKey from expertHazardCandidates '
                + 'above, which you have already written by the time you reach this field. '
                + 'Classify by what the question DOES to a candidate, never by whether its words '
                + 'include PPE, procedure, documentation, inspection or training. Apply three tests '
                + 'IN ORDER and stop at the first match. '
                + 'TEST 1 — SET IT when all three hold: exactly ONE emitted candidate is the direct '
                + 'subject of the missing fact; materially different answers would change that '
                + 'candidate\'s existence, current status, applicability, required control, '
                + 'exposure, or interpretation; and the question cannot be read correctly without '
                + 'knowing which candidate it qualifies. '
                + 'TEST 2 — YOU MAY SET IT when one candidate is clearly the primary subject and '
                + 'the question refines it, but the question stands on its own without the link. '
                + 'TEST 3 — DO NOT SET IT, for a positive reason: no candidate is the direct '
                + 'subject; two or more are equally plausible so there is no unique referent; the '
                + 'question is genuinely row-level; it concerns a different hazard; the only tie is '
                + 'a shared hazard family; or it is GENERIC PPE, procedure, documentation or '
                + 'training follow-up with no candidate-specific decision effect. '
                + '"Generic" is the operative word: a PPE, procedure or documentation question that '
                + 'passes TEST 1 IS linked, because TEST 1 runs first. '
                + 'Omitting the field is always legal. Never invent a key: it must match a '
                + 'candidateKey emitted above, and one that does not is discarded with the broken '
                + 'link recorded against this question.',
            },
          },
          required: ['clarificationId', 'question', 'whyItMatters', 'affectedDecision',
                     'criticality', 'evidenceGap'],
        },
      },
      crossHazardInsights: {
        type: 'array',
        description: 'EMPTY BY DEFAULT. Two or more conditions the observation establishes as '
          + 'PRESENT, whose combination makes the outcome worse than either alone. You must be able '
          + 'to name the mechanism by which one worsens the other; if you cannot, there is no '
          + 'insight and the array stays empty. Two hazards merely co-occurring at one site is not '
          + 'an interaction. A real interaction belongs HERE, not only in the summary.',
        items: {
          type: 'object',
          properties: {
            insightId: str('Short stable id.'),
            interactionKind: { type: 'string', enum: [...EXPERT_INTERACTION_KINDS] },
            // `minItems: 2` for the same reason the strings gained `minLength: 1`: the boundary
            // refuses an insight with fewer than two participants, and the wire schema was asking
            // for nothing. §105 measured the cost -- the model emitted one-participant insights, the
            // boundary refused them, `crossHazardInsights` came back empty, and the interaction it
            // HAD reasoned about survived only in the summary. That is an EXPLANATION_ONLY_LOSS
            // manufactured by a schema that under-specified, not by a model that failed to reason.
            participants: { type: 'array', items: { type: 'string' }, minItems: 2,
              description: 'At least TWO hazard families or candidate keys — an interaction needs '
                + 'both sides named. One participant is not an interaction.' },
            reasoning: str('Why these are worse together.'),
            confidence: { type: 'string', enum: [...EXPERT_CONFIDENCE_LEVELS] },
          },
          required: ['insightId', 'interactionKind', 'participants', 'reasoning', 'confidence'],
        },
      },
      disagreements: {
        type: 'array',
        description: 'EMPTY BY DEFAULT. ONLY where you challenge the deterministic result or a '
          + 'supplied governed record as wrong, incomplete or needing review. Adding new context is '
          + 'NOT a disagreement — that is a candidate or an insight.',
        items: {
          type: 'object',
          properties: {
            disagreementId: str('Short stable id.'),
            target: { type: 'string', enum: [...EXPERT_DISAGREEMENT_TARGETS] },
            surface: { type: 'string', enum: CHALLENGEABLE_SURFACES },
            targetRef: str('Which object you mean, or an empty string.'),
            disagreementType: { type: 'string', enum: [...EXPERT_DISAGREEMENT_TYPES] },
            reasoning: str('Why you disagree.'),
            confidence: { type: 'string', enum: [...EXPERT_CONFIDENCE_LEVELS] },
            recommendsReview: { type: 'boolean' },
          },
          required: ['disagreementId', 'target', 'surface', 'targetRef', 'disagreementType',
                     'reasoning', 'confidence', 'recommendsReview'],
        },
      },
      // v2: ONE field. The three arrays v1 had here were free-text twins of three typed
      // collections, and the §100 probe measured the model filling the twin instead. A field that
      // does not exist cannot compete with the collection it duplicated.
      expertExplanation: {
        type: 'object',
        description: 'A SUPPLEMENT that synthesises what is already in the typed lists. Never the '
          + 'only place a hazard, a question or an interaction appears.',
        properties: {
          summary: str('Two or three sentences an inspector could read, synthesising the lists above.'),
        },
        required: ['summary'],
      },
      uncertainty: {
        type: 'object',
        description: 'Residual ambiguity ONLY — what could not be turned into a candidate, a '
          + 'question or an insight. Not an overflow channel. Anything phrasable as a '
          + 'decision-changing question belongs in decisionCriticalClarifications instead.',
        properties: { statements: { type: 'array', items: { type: 'string' } } },
        required: ['statements'],
      },
      // LAST, DELIBERATELY, AND THIS ORDERING IS LOAD-BEARING. Structured decoding emits properties
      // in schema order, so a field placed first is decided FIRST -- and `outcome` used to be first.
      // The producer had to commit to "is there anything to add?" before it had enumerated a single
      // hazard, question or interaction, and then generated the lists consistently with a commitment
      // it made while knowing nothing. §104 measured both halves of that: hosted R1 and R5 returned
      // EVERY collection empty in 635 and 254 output tokens, and locally `outcome` came back
      // NOTHING_TO_ADD on 27 of 27 calls INCLUDING calls that populated three collections -- a field
      // answered before the answer existed. Moving it last makes it a CONSEQUENCE of the lists
      // rather than a commitment preceding them, which is also the order the system prompt has
      // always asked for ("Fill the typed lists FIRST"). No field is added or removed; the contract
      // means exactly what it meant.
      outcome: {
        type: 'string',
        enum: [...EXPERT_OUTCOMES],
        description: 'Decide this LAST, from what you actually put in the lists above. '
          + 'NOTHING_TO_ADD is correct only when every list above is empty.',
      },
    },
    required: ['expertHazardCandidates', 'decisionCriticalClarifications', 'crossHazardInsights',
               'disagreements', 'expertExplanation', 'uncertainty', 'outcome'],
  };
}

/**
 * The IMMUTABLE identity of the prompt contract. §139, Phase 8.
 *
 * ==================== WHY A LABEL WAS NOT ENOUGH ====================
 *
 * §138 established that `EXPERT_PROMPT_VERSION` does not uniquely identify prompt behaviour. Three
 * different `expert-prompt.ts` files all declared `v6`, and two of them differ in BOTH
 * `EXPERT_SYSTEM_PROMPT` and `buildExpertWireSchema`. That is not hypothetical drift: it is why a
 * genuine same-input replicate set found in a preserved probe had to be REFUSED as the control for
 * an unidentifiable reliability gate, because there was no way to show the probe and the formal run
 * had been given the same instructions. An experiment that cannot prove its own configuration
 * cannot serve as anyone's baseline.
 *
 * So identity is now three hashes plus a label, and comparisons must use the hashes. The label
 * stays because a human reading a run record needs a name, not because it decides anything.
 *
 * The schema hash is taken over a REPRESENTATIVE schema built from the caller's input, because
 * `buildExpertWireSchema` binds this request's vocabularies into its enums -- so two requests with
 * different allowed hazard families legitimately differ. Callers that want a stable cross-run
 * comparison must build the representative schema from the same input shape, which the cohort
 * harness does.
 */
export interface ExpertPromptIdentity {
  promptVersion: string;
  contractVersion: string;
  systemPromptSha256: string;
  wireSchemaSha256: string;
}

export function expertPromptIdentity(input: ExpertAnalysisInput): ExpertPromptIdentity {
  const sha = (s: string) => createHash('sha256').update(s).digest('hex');
  return {
    promptVersion: EXPERT_PROMPT_VERSION,
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    systemPromptSha256: sha(EXPERT_SYSTEM_PROMPT),
    // Stable key order, so a formatting difference in the builder cannot masquerade as a
    // behavioural change and a behavioural change cannot hide behind key reordering.
    wireSchemaSha256: sha(stableStringify(buildExpertWireSchema(input))),
  };
}

/** Deterministic JSON: object keys sorted at every depth. Arrays keep their order, which is data. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const entries = Object.keys(value as Record<string, unknown>).sort()
    .map(k => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`);
  return `{${entries.join(',')}}`;
}

/**
 * Compare a recorded identity against the current one, field by field. §139.
 *
 * Returns the fields that MOVED. An empty array means the current code would issue byte-identical
 * instructions to whatever produced the recorded identity. A caller that only checks
 * `promptVersion` gets no protection at all, which is the defect this exists to close.
 */
export function expertPromptIdentityMismatches(
  recorded: Partial<ExpertPromptIdentity>, current: ExpertPromptIdentity,
): string[] {
  const out: string[] = [];
  for (const key of ['promptVersion', 'contractVersion', 'systemPromptSha256',
                     'wireSchemaSha256'] as const) {
    const was = recorded[key];
    if (was !== undefined && was !== current[key]) out.push(`${key}: ${was} -> ${current[key]}`);
  }
  return out;
}

/**
 * Replace every citation-shaped token with an opaque marker. §139.
 *
 * Uses the SAME pattern the boundary rejects on, so what is removed is exactly what would have
 * condemned the analysis had the model echoed it. The global flag is applied here rather than on the
 * shared constant, because `CITATION_SHAPED_PATTERN` is used with `.test()` elsewhere and a `g` flag
 * would make that stateful.
 */
export function redactCitationTokens(text: string): string {
  return text.replace(new RegExp(CITATION_SHAPED_PATTERN.source + '[\\d.()\\-a-z]*', 'gi'),
    '[citation withheld]');
}

/** The per-request prompt. Carries the inspection context, the protected result, and the records. */
export function buildExpertUserPrompt(input: ExpertAnalysisInput): string {
  const lines: string[] = [];
  lines.push('INSPECTION CONTEXT');
  lines.push(`  jurisdiction: ${input.jurisdiction}`);
  lines.push(`  location: ${input.inspectionContext.location ?? 'not stated'}`);
  lines.push(`  task: ${input.inspectionContext.task ?? 'not stated'}`);
  lines.push('');
  lines.push('OBSERVATION SOURCES — quote from these EXACTLY');
  for (const s of input.authoritativeSources) {
    lines.push(`  [${s.sourceId}] ${s.text}`);
  }
  lines.push('');

  lines.push('DETERMINISTIC FINDINGS ALREADY ESTABLISHED (authoritative — you cannot change these)');
  if (input.deterministicFindings.length === 0) {
    lines.push('  (none — the deterministic engine established no finding)');
  } else {
    for (const f of input.deterministicFindings) {
      lines.push(`  - ${f.findingKey}: ${f.hazardFamily}, state ${f.conditionState}`
        + `${f.isLifeCritical ? ', LIFE-CRITICAL' : ''}${f.isActionable ? ', actionable' : ''}`);
      for (const a of f.requiredActions) lines.push(`      required action: ${a}`);
    }
  }
  lines.push('');

  lines.push('GOVERNED REGULATORY RECORDS SUPPLIED TO YOU');
  if (input.governedStandards.length === 0) {
    lines.push('  (none supplied — you may therefore make NO regulatory assertion at all)');
  } else {
    // §139. Records are rendered under OPAQUE HANDLES and their approved text is stripped of
    // citation-shaped tokens. Every one of the 40 records attached to the formal cohort carried a
    // CFR-shaped citation inside `approvedText`, and `CITATION_SHAPED_PATTERN` condemns the WHOLE
    // analysis if the model reproduces one. The projection module was already citation-free for
    // exactly this reason; this channel was not. Handles keep the record referenceable without
    // putting the forbidden token class in the context. The citation itself is never withheld from
    // the SYSTEM -- `input.governedStandards` is unchanged and the merge still carries provenance;
    // it is withheld only from the model's prompt.
    input.governedStandards.forEach((g, i) => {
      const handle = `R${i + 1}`;
      lines.push(`  - record ${handle} [${g.backingState}] ${redactCitationTokens(g.title ?? '')}`);
      if (g.approvedText) {
        lines.push(`      approved text: ${redactCitationTokens(g.approvedText)}`);
      }
    });
    lines.push('  Refer to a record by its handle (R1, R2, ...) or its title. You may reason ABOUT');
    lines.push('  these records and no others. If none of them covers an obligation, do not assert');
    lines.push('  that obligation as governed fact — abstain and say what the observation shows.');
  }
  lines.push('');

  if (input.answeredClarifications.length > 0) {
    lines.push('ALREADY ANSWERED');
    for (const a of input.answeredClarifications) lines.push(`  - ${a.clarificationId}: ${a.answer}`);
    lines.push('');
  }

  lines.push(`ALLOWED HAZARD FAMILIES: ${input.allowedHazardFamilies.join(', ')}`);
  lines.push('');
  lines.push('Fill the typed lists first, then write the summary, and decide the outcome last. Every');
  lines.push('typed list starts EMPTY and an empty list is a complete, correct answer — do not add an');
  lines.push('entry to any list because the list is there. Before emitting a clarification, name the');
  lines.push('two different answers and the two different current outcomes they would lead to; if you');
  lines.push('cannot name both, do not ask. Do not assert a candidate ACTIVE and also ask whether that');
  lines.push('same hazard exists. A');
  lines.push('missing decision-changing fact is a clarification, not a summary sentence. An');
  lines.push('interaction is an insight, not a summary sentence. Questions do not need a hazard to');
  lines.push('attach to. Every candidate must declare groundingStatus, and a candidate whose support');
  lines.push('is written in the observation above should quote it exactly. A hazard or a question');
  lines.push('tied to a condition the observation says was removed, restored, corrected, verified,');
  lines.push('or otherwise resolved must not be raised on that historical fact alone — only on a');
  lines.push('stated current gap, a stated failure of the remediation, or a stated current effect.');
  lines.push('A fact relevant to a hazard family is not itself a current hazard — before marking a');
  lines.push('candidate ACTIVE, name the current fact (not a hypothetical you added) that makes the');
  lines.push('exposure real now.');

  // §119. The deterministic family-assessment block is APPENDED after the closing instructions,
  // in exactly the position and with exactly the separator the §118-confirmed prototype used, so a
  // permanent-path request is byte-identical to the prototype request that was measured. When the
  // caller supplies no dispositions the block is empty and this returns exactly what it returned
  // before the field existed -- see `renderDeterministicDispositionBlock`.
  const dispositionBlock = renderDeterministicDispositionBlock(input.deterministicFamilyDispositions ?? []);
  const base = lines.join('\n');
  return dispositionBlock ? `${base}\n\n${dispositionBlock}` : base;
}

/**
 * Render the deterministic family assessments as the prompt block Expert sees. §119.
 *
 * ==================== THIS IS INPUT DATA, NOT A PROMPT REVISION ====================
 *
 * `EXPERT_PROMPT_VERSION` stays `v6` and `EXPERT_SYSTEM_PROMPT` is byte-unchanged. What changed is
 * that a previously-discarded piece of the deterministic RESULT is now rendered into the per-request
 * input, alongside the observation, the deterministic findings and the governed records. An empty
 * projection renders nothing, so every request built without dispositions is byte-identical to one
 * built before this function existed.
 *
 * ==================== WHY THE OVERRIDE RULE IS STATED INSIDE THE BLOCK ====================
 *
 * The accepted architectural principle is that Expert must NOT become a rubber stamp. A block that
 * only announced the deterministic conclusion would invite exactly that. So the block states, in
 * the same breath, the ONE thing that licenses an override and what it must contain -- the
 * challenged disposition, the exact observation evidence, and the concrete current pathway the
 * deterministic rationale does not cover. §118 measured this working on the target model: `R6-I`
 * and `R6-H` both overrode their projected disposition with a verbatim-quoted current fact, and
 * `R6-H` did it through the formal `disagreements` channel.
 *
 * The text below is BYTE-IDENTICAL to the prototype block hosted-confirmed in §118/D-130. It is
 * promoted, not rewritten; changing a word here invalidates that measurement.
 */
export function renderDeterministicDispositionBlock(
  rows: readonly DeterministicFamilyDisposition[],
): string {
  if (rows.length === 0) return '';
  const lines: string[] = [];
  lines.push('DETERMINISTIC FAMILY ASSESSMENTS ALREADY PERFORMED');
  lines.push('  These families were EVALUATED by the deterministic engine. This is different from a');
  lines.push('  family it never considered — do not treat an assessment below as a gap you must fill.');
  for (const r of rows) {
    lines.push(`  - ${r.hazardFamily}: ${r.disposition}`
      + `${r.isActionable ? ', actionable' : ', not actionable'}, confidence ${r.confidence}`);
    lines.push(`      why: ${r.rationale}`);
    for (const f of r.controllingFacts) lines.push(`      controlling fact: ${f.fact} = ${f.status}`);
    for (const q of r.evidenceQuotes) lines.push(`      established by: "${q}"`);
  }
  lines.push('');
  lines.push('  HOW TO USE THESE. You are a reviewer of these assessments, NOT a rubber stamp.');
  lines.push('  - If you agree, do not restate the assessment as a new candidate of the same family.');
  lines.push('  - You MAY still add a DIFFERENT hazard family the engine did not assess.');
  lines.push('  - You MAY override any assessment above, including a NOT_APPLICABLE one, and you');
  lines.push('    should whenever the observation supports it. An override is not discouraged and');
  lines.push('    high deterministic confidence is not a reason to withhold one.');
  lines.push('  - To override, your candidate must set relationshipToDeterministic to');
  lines.push('    CONTRADICTS_DETERMINISTIC and must name, in its reasoning, the CONCRETE CURRENT');
  lines.push('    FACT stated in the observation that the deterministic rationale does not cover —');
  lines.push('    for example a worker stated to be exposed right now, a second uncontrolled energy');
  lines.push('    source, or a control the observation itself says failed. Quote it.');
  lines.push('  - What is NOT an override: restating the physical fact the engine already weighed,');
  lines.push('    or a consequence that would only follow under a condition you supplied yourself.');
  return lines.join('\n');
}

// ---------------------------------------------------------------- the quote binder

export interface QuoteBindingStat {
  /** Quotes the model supplied. */
  total: number;
  /** Quotes found verbatim in their named source. */
  bound: number;
  /** Quotes NOT found. These are kept and made to fail validation, never dropped. */
  unbindable: number;
}

/**
 * Turn the wire form into the shape `normalizeExpertOutput` consumes, resolving every quote to a
 * span in the source it names.
 *
 * The only transformation is offset resolution. No field is invented, no value is corrected, and
 * nothing is filtered -- if the model said it, it reaches the boundary and the boundary decides.
 */
export function bindWireAnalysis(
  wire: unknown, input: ExpertAnalysisInput,
): { raw: Record<string, unknown>; binding: QuoteBindingStat } {
  const binding: QuoteBindingStat = { total: 0, bound: 0, unbindable: 0 };
  const byId = new Map(input.authoritativeSources.map(s => [s.sourceId, s]));

  const bindEvidence = (items: unknown): unknown[] => {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
      const ref = (item ?? {}) as Record<string, unknown>;
      const sourceId = typeof ref.sourceId === 'string' ? ref.sourceId : '';
      const quotedText = typeof ref.quotedText === 'string' ? ref.quotedText : '';
      binding.total += 1;
      const source = byId.get(sourceId);
      const startOffset = source ? source.text.indexOf(quotedText) : -1;
      if (startOffset < 0 || quotedText.length === 0) {
        binding.unbindable += 1;
        // Deliberately unresolvable. The core validator answers EVIDENCE_OUT_OF_BOUNDS.
        return { sourceId, startOffset: -1, endOffset: -1, quotedText };
      }
      binding.bound += 1;
      return { sourceId, startOffset, endOffset: startOffset + quotedText.length, quotedText };
    });
  };

  const w = (wire ?? {}) as Record<string, unknown>;
  const candidates = Array.isArray(w.expertHazardCandidates) ? w.expertHazardCandidates : [];

  return {
    raw: {
      ...w,
      contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
      analysisId: input.analysisId,
      expertHazardCandidates: candidates.map(c => {
        const candidate = (c ?? {}) as Record<string, unknown>;
        return { ...candidate, evidence: bindEvidence(candidate.evidence) };
      }),
    },
    binding,
  };
}
