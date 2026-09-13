/**
 * L3-2g -- STRUCTURAL STATE SEPARATION. The candidate answer to blueprint §36.7.
 *
 * ============================ THE PROBLEM THIS EXISTS TO TEST ============================
 *
 * §36.7 measured, with everything else held constant, that moving nine lines of prompt prose from
 * INSIDE the condition-state ladder to BELOW it changed outcomes on both of the programme's gates in
 * opposite directions:
 *
 *     A -- absent-control material inside the ladder   2 HC misses,  88.9% clarification precision
 *     B -- ladder terse, material below it  (SHIPPED)  4 HC misses,  100%  clarification precision
 *
 * Four phases had moved that balance with prose. The diagnosis §36.7 records is structural, not
 * lexical: THE PROMPT IS A RANKING. The eight condition states are offered to the model as ONE
 * ordered choice, so any material that makes the ACTIVE rung decide correctly must sit AT that rung,
 * and sitting there swamps the one-line rungs above it. The model is being asked to resolve
 * competing semantic obligations by their POSITION IN A DOCUMENT.
 *
 * ============================ WHAT THIS MODULE CHANGES ============================
 *
 * The obligations are separated into INDEPENDENT questions, each answered on its own evidence, and
 * the RANKING is moved out of prose into deterministic code:
 *
 *     prose ladder decides the state            ->   model emits independent facts
 *                                                    deterministic resolver decides the state
 *
 * A fact cannot "out-rank" another fact by appearing earlier in the prompt, because no fact is a
 * choice among the others. `hazardAsserted` and `decisionCriticalFactMissing` are different
 * questions about different spans; under the ladder they were the ACTIVE and INSUFFICIENT_EVIDENCE
 * rungs competing for the same slot. That is the whole hypothesis, and the ablation harness
 * (`scripts/ablate-l32g-state-separation.ts`) is what tests it rather than asserting it.
 *
 * ============================ AUTHORITY -- READ THIS BEFORE WIRING IT IN ============================
 *
 * `ARCHITECTURE_SELECTION_EVIDENCE_ONLY. NOT CUSTOMER-AUTHORITATIVE. NOT ON THE SHIPPED PATH.`
 *
 * Nothing here decides a customer-visible state. `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`
 * and L3-2g does not change that. This module is imported by the L3-2g ablation harness and by its
 * offline suite, and by nothing else -- the same containment `control-adequacy.ts` and
 * `observation-availability.ts` were given, and for the same hard-won reason recorded at §35.2:
 * every deterministic check this programme has added deleted a correct hazard before it earned its
 * place. `L3-INV-12` also applies -- a deterministic signal may not re-acquire authority.
 *
 * The resolver therefore has TWO modes and the difference matters for what may be claimed:
 *
 *   DERIVE  the state is computed from the facts alone. This is the design under test.
 *   CHECK   the model's own `conditionState` is compared against the derived one and the
 *           disagreement is RECORDED. This is the safe half, and it is the half that could be
 *           adopted first if the phase closes on it, because a recorded disagreement changes
 *           nothing on its own.
 *
 * ============================ FAILURE DIRECTION ============================
 *
 * `L3-INV-04` -- NO DEFAULT ACTIVE -- is structural here, not a policy line. The resolver reaches
 * ACTIVE only from an explicit `hazardAsserted === true` together with a control reading that does
 * not prevent contact. Every path that cannot establish those lands on INSUFFICIENT_EVIDENCE or
 * UNKNOWN. There is deliberately no `default:` arm that produces ACTIVE and no arm that produces
 * ACTIVE from absent facts.
 */

import type { L3ConditionState } from './reasoning-contract.types';

// ---------------------------------------------------------------- the separated facts

/**
 * What the observation says about a CONTROL for this hazard. This is the axis §36.4 proved was one
 * mechanism seen from two ends -- `E-FLD-147` over-reading an administrative measure as a control,
 * `E-OA-07` under-reading a morphologically-encoded absence -- and it is asked here as its own
 * question rather than inferred from where the model landed on a ladder.
 *
 * `DEFEATED` is separated from `ABSENT` deliberately. `F-WC-09` ("the two-hand control HAS BEEN
 * STRAPPED DOWN WITH TAPE", with gloves issued against it) is the strongest form of the error: a
 * control is described, it is an engineering control, and it has been disabled. A schema that can
 * only say present/absent forces that into the wrong bucket.
 */
export const L3_CONTROL_READINGS = [
  /** No control for this hazard is described at all, or the text states one is missing/absent. */
  'ABSENT',
  /** A control is described that physically prevents contact -- guard, cover, isolation, arrest. */
  'PREVENTS_CONTACT',
  /** Only a warning or administrative measure -- tape, sign, briefing, permit, procedure. */
  'WARNS_ONLY',
  /** A control exists for this hazard and has been bypassed, defeated, tied off or disabled. */
  'DEFEATED',
  /** The text does not say either way, and the presence of a control is genuinely open. */
  'NOT_STATED',
] as const;
export type L3ControlReading = (typeof L3_CONTROL_READINGS)[number];

/** Whether the text presents the situation as having actually happened, or as contingent. */
export const L3_FRAMINGS = ['ACTUAL', 'CONDITIONAL'] as const;
export type L3Framing = (typeof L3_FRAMINGS)[number];

/** What the text says became of the hazard after it was found. */
export const L3_DISPOSITIONS = [
  /** Nothing is said about the hazard being put right. */
  'NONE',
  /** The hazard itself was repaired, replaced, cleared or otherwise put right. */
  'CORRECTED',
  /** The equipment was tagged out, locked out or withdrawn from use. */
  'WITHDRAWN_FROM_SERVICE',
] as const;
export type L3Disposition = (typeof L3_DISPOSITIONS)[number];

/**
 * The independently-emitted semantic facts for one candidate.
 *
 * EACH FIELD IS A SEPARATE QUESTION ABOUT A SEPARATE SPAN. None is a choice among the others, which
 * is the property the ladder did not have. `hazardAsserted` asks only whether a hazardous condition
 * is stated as fact; `decisionCriticalFactMissing` asks only whether something the DECISION needs is
 * absent from the text. Under the ladder those two were adjacent rungs competing for one slot, and
 * §33.6, §34.5 and §36.7 are three separate measurements of that competition.
 */
export interface L3StateFacts {
  /** (1) Is a hazardous condition asserted as FACT -- not hedged, not planned, not conditional? */
  hazardAsserted: boolean;
  /** The span that carries the factual hazard assertion. Empty when `hazardAsserted` is false. */
  hazardAssertionQuote: string;

  /** (2) What does the text say about a control for THIS hazard? */
  controlReading: L3ControlReading;
  /** The span that carries the control reading, when one is described. */
  controlQuote: string | null;

  /** (3) Actual or contingent framing. */
  framing: L3Framing;

  /** (2b) What became of the hazard -- correction or service withdrawal. */
  disposition: L3Disposition;

  /** (4) Is a fact that would DECIDE this candidate absent from the text? */
  decisionCriticalFactMissing: boolean;
  /** What that missing fact is. Null when nothing decision-critical is missing. */
  missingFact: string | null;

  /**
   * Whether the observation states the condition does NOT exist -- the NEGATED rung, kept as its own
   * fact because a denial is not the same as an absence of assertion.
   */
  hazardExplicitlyDenied: boolean;
}

// ---------------------------------------------------------------- deterministic resolution

export type L3ResolutionRule =
  | 'DENIED_HAZARD'
  | 'CORRECTED_DISPOSITION'
  | 'WITHDRAWN_DISPOSITION'
  | 'CONDITIONAL_FRAMING'
  | 'ASSERTED_WITH_PREVENTING_CONTROL'
  | 'ASSERTED_WITH_INADEQUATE_CONTROL'
  | 'ASSERTED_WITH_DEFEATED_CONTROL'
  | 'ASSERTED_CONTROL_NOT_STATED'
  | 'DECISION_CRITICAL_FACT_MISSING'
  | 'NOTHING_ASSERTED';

export interface L3StateResolution {
  state: L3ConditionState;
  rule: L3ResolutionRule;
  /** Whether a clarification is owed. Derived, never asked for as an independent opinion. */
  clarificationOwed: boolean;
  why: string;
}

/**
 * DERIVE the condition state from the separated facts.
 *
 * ORDER OF THE ARMS IS A SAFETY PROPERTY, and it is not the prompt ladder relocated. Two things are
 * different in kind. First, this order is FIXED AND AUDITABLE -- it cannot drift because someone
 * moved a paragraph, which is precisely what §36.7 measured happening four times. Second, the arms
 * are not competing for the model's attention: every fact was already decided before the first arm
 * runs, so an earlier arm cannot suppress the EVIDENCE for a later one.
 *
 * `L3-INV-04` is structural in this function. ACTIVE is reachable only from
 * `hazardAsserted === true`, and there is no default arm.
 */
export function resolveConditionState(facts: L3StateFacts): L3StateResolution {
  // 1. An explicit denial settles it. "no damage was found" is a statement about the equipment.
  if (facts.hazardExplicitlyDenied && !facts.hazardAsserted) {
    return {
      state: 'NEGATED', rule: 'DENIED_HAZARD', clarificationOwed: false,
      why: 'the observation states the condition does not exist',
    };
  }

  // 2. Disposition outranks the control reading: a hazard that was put right, or whose equipment was
  //    withdrawn, is not an exposure regardless of what control was or was not in place at the time.
  if (facts.disposition === 'CORRECTED') {
    return {
      state: 'CORRECTED', rule: 'CORRECTED_DISPOSITION', clarificationOwed: false,
      why: 'the hazard existed and the observation asserts it was put right',
    };
  }
  if (facts.disposition === 'WITHDRAWN_FROM_SERVICE') {
    return {
      state: 'REMOVED_FROM_SERVICE', rule: 'WITHDRAWN_DISPOSITION', clarificationOwed: false,
      why: 'the equipment was tagged out, locked out or withdrawn from use',
    };
  }

  // 3. Contingent framing WITHOUT an actual occurrence. The conjunction is the point: "if the guard
  //    were removed" is HYPOTHETICAL, but "the guard is off and if anyone reaches in they will be
  //    caught" asserts a present fact and is not.
  if (facts.framing === 'CONDITIONAL' && !facts.hazardAsserted) {
    return {
      state: 'HYPOTHETICAL', rule: 'CONDITIONAL_FRAMING', clarificationOwed: false,
      why: 'the text frames the situation as contingent and asserts no present occurrence',
    };
  }

  // 4. A factual hazard assertion. The control reading -- and ONLY the control reading -- decides
  //    between CONTROLLED and ACTIVE. This is §36.4's axis expressed as a branch instead of as prose
  //    competing for a position in a ladder.
  if (facts.hazardAsserted) {
    switch (facts.controlReading) {
      case 'PREVENTS_CONTACT':
        return {
          state: 'CONTROLLED', rule: 'ASSERTED_WITH_PREVENTING_CONTROL', clarificationOwed: false,
          why: 'a control that physically prevents contact is described as in place and working',
        };
      case 'DEFEATED':
        return {
          state: 'ACTIVE', rule: 'ASSERTED_WITH_DEFEATED_CONTROL', clarificationOwed: false,
          why: 'a control for this hazard exists and has been defeated, so it prevents nothing',
        };
      case 'WARNS_ONLY':
      case 'ABSENT':
        return {
          state: 'ACTIVE', rule: 'ASSERTED_WITH_INADEQUATE_CONTROL', clarificationOwed: false,
          why: facts.controlReading === 'ABSENT'
            ? 'a required control is absent and the hazardous condition is asserted as present'
            : 'only a warning or administrative measure is described, which does not prevent contact',
        };
      case 'NOT_STATED':
      default:
        // A stated hazard whose control status is simply not mentioned is still a stated hazard.
        // §36.1's rule applies -- the missing control is the finding -- and retreating to
        // INSUFFICIENT_EVIDENCE here is the `H-NG-02` failure that cost L3-2c a phase.
        return {
          state: 'ACTIVE', rule: 'ASSERTED_CONTROL_NOT_STATED', clarificationOwed: false,
          why: 'a hazardous condition is asserted as presently existing and no control is described',
        };
    }
  }

  // 5. Nothing asserted. NOW a missing decision-critical fact matters -- and note where this arm
  //    sits. Under the prose ladder INSUFFICIENT_EVIDENCE could out-rank ACTIVE by being longer or
  //    better-placed; here it is unreachable whenever a hazard was actually asserted, which is the
  //    `D-CR-04`/`D-NG-04` oscillation of §34.5 closed by construction rather than by emphasis.
  if (facts.decisionCriticalFactMissing) {
    return {
      state: 'INSUFFICIENT_EVIDENCE', rule: 'DECISION_CRITICAL_FACT_MISSING', clarificationOwed: true,
      why: `a fact that decides this candidate is absent from the observation: ${facts.missingFact ?? 'unspecified'}`,
    };
  }

  return {
    state: 'UNKNOWN', rule: 'NOTHING_ASSERTED', clarificationOwed: false,
    why: 'no factual hazard assertion, no denial, no disposition and no identified missing fact',
  };
}

// ---------------------------------------------------------------- CHECK mode

export interface L3ResolutionAgreement {
  modelState: L3ConditionState;
  derivedState: L3ConditionState;
  agrees: boolean;
  rule: L3ResolutionRule;
  /**
   * True when the disagreement runs in the direction that LOSES a hazard -- the model said something
   * non-exposing where the facts it itself emitted derive ACTIVE. This is the direction every gate
   * in this programme has cared about, and it is the one worth surfacing first.
   */
  disagreementLosesHazard: boolean;
  why: string;
}

/**
 * COMPARE the model's own chosen state against the state its own emitted facts derive.
 *
 * This is the conservative half of the design. It changes nothing and decides nothing; it makes the
 * inconsistency MEASURABLE. A model that emits `hazardAsserted: true` with `controlReading:
 * WARNS_ONLY` and then labels the candidate CONTROLLED has contradicted itself in a way the single-
 * enum contract could not express, let alone detect.
 */
export function checkResolutionAgreement(
  facts: L3StateFacts, modelState: L3ConditionState,
): L3ResolutionAgreement {
  const derived = resolveConditionState(facts);
  const agrees = derived.state === modelState;
  return {
    modelState, derivedState: derived.state, agrees, rule: derived.rule,
    disagreementLosesHazard: !agrees && derived.state === 'ACTIVE' && modelState !== 'ACTIVE',
    why: derived.why,
  };
}

// ---------------------------------------------------------------- schema fragment

/**
 * The structured-output fragment for `L3StateFacts`, so the ablation harness constrains the model to
 * exactly these fields.
 *
 * `minLength`/`minItems` are deliberately avoided here -- §31.1 recorded that Anthropic's structured
 * outputs support neither, and the portability finding is worth preserving in any new contract
 * surface rather than rediscovering. Every guarantee is enforced in code, not in the schema.
 */
export function stateFactsSchemaFragment(): Record<string, unknown> {
  return {
    type: 'object', additionalProperties: false,
    required: [
      'hazardAsserted', 'hazardAssertionQuote', 'controlReading', 'controlQuote',
      'framing', 'disposition', 'decisionCriticalFactMissing', 'missingFact',
      'hazardExplicitlyDenied',
    ],
    properties: {
      hazardAsserted: { type: 'boolean' },
      hazardAssertionQuote: { type: 'string' },
      controlReading: { type: 'string', enum: [...L3_CONTROL_READINGS] },
      controlQuote: { type: ['string', 'null'] },
      framing: { type: 'string', enum: [...L3_FRAMINGS] },
      disposition: { type: 'string', enum: [...L3_DISPOSITIONS] },
      decisionCriticalFactMissing: { type: 'boolean' },
      missingFact: { type: ['string', 'null'] },
      hazardExplicitlyDenied: { type: 'boolean' },
    },
  };
}

/** Defensive coercion. An absent or malformed fact must never become an assertion. */
export function coerceStateFacts(raw: any): L3StateFacts | null {
  if (!raw || typeof raw !== 'object') return null;
  const reading = (L3_CONTROL_READINGS as readonly string[]).includes(raw.controlReading)
    ? raw.controlReading as L3ControlReading : 'NOT_STATED';
  const framing = (L3_FRAMINGS as readonly string[]).includes(raw.framing)
    ? raw.framing as L3Framing : 'ACTUAL';
  const disposition = (L3_DISPOSITIONS as readonly string[]).includes(raw.disposition)
    ? raw.disposition as L3Disposition : 'NONE';
  return {
    hazardAsserted: raw.hazardAsserted === true,
    hazardAssertionQuote: typeof raw.hazardAssertionQuote === 'string' ? raw.hazardAssertionQuote : '',
    controlReading: reading,
    controlQuote: typeof raw.controlQuote === 'string' ? raw.controlQuote : null,
    framing,
    disposition,
    decisionCriticalFactMissing: raw.decisionCriticalFactMissing === true,
    missingFact: typeof raw.missingFact === 'string' ? raw.missingFact : null,
    hazardExplicitlyDenied: raw.hazardExplicitlyDenied === true,
  };
}
