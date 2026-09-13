/**
 * §233 -- IMMEDIATE SAFETY POSTURE. THE ANALYSIS-LEVEL CONTRACT SUCCESSOR TO §210J / §226.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT WIRED TO ANY PRODUCTION PATH.
 *
 * ==================== WHAT THIS CLOSES ====================
 *
 * §231 fired three hard safety gates across ten events. §232 traced all ten to one absence:
 * IMMEDIATE SAFETY POSTURE DOES NOT EXIST AS AUTHORITATIVE PRODUCT STATE. The only structured
 * carrier of what happens to the work today was `decisionWhileUnresolved`, a free-text string
 * attached to each unresolved-fact declaration, which
 *
 *   1. does not exist when no declaration is emitted -- G1, G4 and C1 fired on exactly this;
 *   2. is validated for presence and filler only, never read as authoritative content;
 *   3. is per-declaration, so M9 emitted two contradictory work postures in one analysis;
 *   4. cannot carry the decision for an ESTABLISHED hazard, which legitimately owes no declaration;
 *   5. is nonetheless already treated as authoritative -- `propertyAuthorityFailClosedEffect()`
 *      returns `decisionWhileUnresolvedRemainsAuthoritative: true` for a field whose existence the
 *      architecture does not guarantee.
 *
 * ==================== WHAT THIS DELIBERATELY DOES NOT DO ====================
 *
 *   >>> NO PROSE IS READ FOR MEANING. Not here and not in the projection. §232 measured stop-word
 *   >>> and continue-word matching over the twenty-five §231 posture strings and it does not
 *   >>> separate the passing cases from the failing ones. §148 already refused deterministic
 *   >>> reclassification of a natural-language field as the semantic inference invariant 3 forbids.
 *   >>> The posture is MODEL-AUTHORED under invariant 1 and deterministic code validates, projects
 *   >>> and refuses it under invariant 2. Nothing here derives a posture.
 *
 *   >>> NO RULE MAKES UNCERTAINTY IMPLY A STOP. The §233 authorization forbids it and the §231
 *   >>> evidence contradicts it: M5 owes a MATERIAL property and G8 a SERIOUS one, and both are
 *   >>> correctly CONTINUE_WITH_CONTROLS. The objective is CORRECT POSTURE, NOT MAXIMUM
 *   >>> CONSERVATISM, so `CONTINUE` and `acceptedWithoutImmediateAction` are first-class and are
 *   >>> stated to be correct answers in the same block that defines `STOP`.
 *
 *   >>> NO PROPERTY-IDENTITY WORK. §233 does not touch it. It is a separately recorded contained
 *   >>> capability limitation and this slice must not become a third prompt-tuning cycle on it.
 *
 * ==================== THE LIMIT, STATED BEFORE THE CODE ====================
 *
 * This contract can guarantee that the posture is represented, singular, explicit, based,
 * propagated, auditable and structurally complete. IT CANNOT GUARANTEE THAT THE DEGREE IS RIGHT.
 * A semantically wrong `CONTINUE` where `HOLD_PENDING_VERIFICATION` was required is structurally
 * valid, and so is an unnecessary `STOP`. Invariant 27: a schema change is never evidence that a
 * behavioural defect is repaired. Degree discrimination is a hosted question and is not claimed.
 */

import { createHash } from 'crypto';

import type { ExpertAnalysisInput } from '../expert-contract.types';
import type { ExpertVNextGovernedBinding } from './expert-first-pass-instruction-vnext';
import { isNonSemanticFiller } from './expert-first-pass-owed-fact-projection';
import {
  buildExpert210jWireSchema, FIRST_PASS_CONTRACT_210J_VERSION,
} from './expert-210j-first-pass-contract';
import {
  build226SystemPrompt, FIRST_PASS_CONTRACT_226_VERSION,
} from './expert-226-property-selection-capability';

export const FIRST_PASS_CONTRACT_233_VERSION =
  'hazlenz.expert.first-pass-contract.233-immediate-safety-posture' as const;

/** The bases this successor is built by construction from. A drifted base is a loud failure. */
export const BASE_CONTRACT_VERSIONS_233 = {
  schema: FIRST_PASS_CONTRACT_210J_VERSION,
  prompt: FIRST_PASS_CONTRACT_226_VERSION,
} as const;

/** The one added root field. Named once so nothing in the repository spells it twice. */
export const POSTURE_FIELD = 'immediateSafetyPosture' as const;

// ================================================================ the vocabulary

/**
 * The four postures, in the order the §233 authorization enumerated them.
 *
 * ORDER IS DELIBERATE AND IS A RESTRAINT CONTROL. The permissive value is FIRST. §210J had to
 * state in as many words that "no additional restriction while this remains open" is a real answer
 * and not a failure to think, because the natural reading of a new action field is that it must say
 * something. The same pressure applies to an enum, and listing `STOP` first would lean on it.
 */
export const IMMEDIATE_SAFETY_POSTURES_233 = [
  'CONTINUE',
  'CONTINUE_WITH_CONTROLS',
  'HOLD_PENDING_VERIFICATION',
  'STOP',
] as const;
export type ImmediateSafetyPosture233 = (typeof IMMEDIATE_SAFETY_POSTURES_233)[number];

/**
 * Every member is DEFINED, and that is §139 work applied to a new vocabulary.
 *
 * §139 established that bidirectional disagreement between two labellers is the signature of an
 * UNDER-SPECIFIED VOCABULARY rather than of a model biased in one direction, and that the repair is
 * to define the vocabulary rather than to correct the model. `affectedDecision` was shipped as bare
 * names and cost §138 and §147 to repair. This vocabulary ships defined.
 */
export const POSTURE_DEFINITIONS_233:
Readonly<Record<ImmediateSafetyPosture233, string>> = {
  CONTINUE:
    'Current evidence supports continuation without an additional immediate safety control arising '
    + 'from the analysed condition. This is a REAL ANSWER and the correct one wherever the facts '
    + 'support it. Choosing it is not a failure to think and it is not a lapse of caution.',
  CONTINUE_WITH_CONTROLS:
    'Work may continue ONLY with identified immediate controls in effect. Name the controls. If the '
    + 'work would be acceptable without them, the posture is CONTINUE, not this.',
  HOLD_PENDING_VERIFICATION:
    'Continuation is not authorised until a decision-controlling uncertainty is resolved or the '
    + 'required safe condition is verified. The work is not permanently stopped: it waits on a '
    + 'result. Name what must be resolved or verified.',
  STOP:
    'The ESTABLISHED condition itself requires cessation, withdrawal, isolation or equivalent '
    + 'immediate protective action. Nothing is waiting on a result: the facts already require the '
    + 'action. Name the correction that must be completed.',
};

/**
 * The three collapses the §233 authorization names, held as data so the suite asserts them rather
 * than trusting a comment, and so the same three sentences reach the model.
 */
export const POSTURE_DISTINCTIONS_233: readonly string[] = [
  'Do not collapse HOLD_PENDING_VERIFICATION into STOP. A hold waits on a result; a stop follows '
    + 'from an established condition.',
  'Do not collapse CONTINUE_WITH_CONTROLS into CONTINUE. If controls are what make continuation '
    + 'acceptable, say so and name them.',
  'Do not choose STOP merely because uncertainty exists. Uncertainty that does not bear on what '
    + 'happens today changes nothing about today.',
];

/** Whether this posture permits the work to continue at all. Pure lookup; nothing is inferred. */
export const POSTURE_PERMITS_CONTINUED_WORK:
Readonly<Record<ImmediateSafetyPosture233, boolean>> = {
  CONTINUE: true,
  CONTINUE_WITH_CONTROLS: true,
  HOLD_PENDING_VERIFICATION: false,
  STOP: false,
};

/** Protective ordering, least to most. Used ONLY by the monotonicity check. */
export const POSTURE_PROTECTIVE_RANK:
Readonly<Record<ImmediateSafetyPosture233, number>> = {
  CONTINUE: 0, CONTINUE_WITH_CONTROLS: 1, HOLD_PENDING_VERIFICATION: 2, STOP: 3,
};

/** What a reference in the posture basis points at. */
export const POSTURE_REF_KINDS_233 = ['HAZARD_CANDIDATE', 'UNRESOLVED_DECLARATION'] as const;
export type PostureRefKind233 = (typeof POSTURE_REF_KINDS_233)[number];

/**
 * THE MINIMUM SEQUENCING REPRESENTATION, AND NO MORE.
 *
 * §232 established that the STOP / HOLD_PENDING_VERIFICATION split IS most of the sequencing
 * representation. This tag carries the remainder: the G10 defect was a control placed "before or in
 * parallel with continued decanting", which is unsafe ORDER rather than unsafe content. One tag on
 * each control expresses it. This is not a workflow engine and must not become one.
 */
export const CONTROL_TIMINGS_233 = ['BEFORE_WORK_RESUMES', 'DURING_CONTINUED_WORK'] as const;
export type ControlTiming233 = (typeof CONTROL_TIMINGS_233)[number];

/** The frozen sequence a non-permitting posture imposes. Emitted, never inferred. */
export const PROTECTIVE_SEQUENCE_233: readonly string[] = [
  'HOLD_OR_STOP', 'VERIFY_OR_CORRECT', 'ESTABLISH_REQUIRED_SAFE_STATE', 'RESUME_IF_AUTHORIZED',
];

// ================================================================ the object

export interface PostureRef233 {
  readonly ref: string;
  readonly refKind: PostureRefKind233;
}

export interface PostureAcceptance233 extends PostureRef233 {
  readonly reason: string;
}

export interface RequiredControl233 {
  readonly control: string;
  readonly timing: ControlTiming233;
}

/**
 * WHAT MUST BECOME TRUE BEFORE WORK RESUMES. Two lists, never a nullable field.
 *
 * The §210J schema that §231 transmitted thirty times contains ZERO union types, so a nullable
 * member here would be an unproven wire shape introduced on a contract that cannot be exercised
 * without a provider call. Empty arrays say "none" unambiguously and need no null and no magic
 * string.
 */
export interface ResumeCondition233 {
  readonly resolvedByDeclarationIds: readonly string[];
  readonly correctionsRequired: readonly string[];
}

export interface ImmediateSafetyPostureObject233 {
  readonly posture: ImmediateSafetyPosture233;
  /** What drives this posture. Typed references into this same analysis, never prose. */
  readonly requiredBy: readonly PostureRef233[];
  /**
   * THE RESTRAINT ESCAPE, AND IT IS A FIRST-CLASS FIELD RATHER THAN AN EXCEPTION.
   *
   * Without it the coverage invariant degenerates into a stop-forcing rule. §231 G2 asserts a
   * thermal hazard ACTIVE on a case whose correct posture is CONTINUE, and must be able to say so
   * without inventing a restriction.
   */
  readonly acceptedWithoutImmediateAction: readonly PostureAcceptance233[];
  readonly requiredControls: readonly RequiredControl233[];
  readonly resumeCondition: ResumeCondition233;
  readonly whatHappensNow: string;
}

// ================================================================ the instruction block

export const POSTURE_BLOCK_LINES_233: readonly string[] = [
  'IMMEDIATE SAFETY POSTURE. One per analysis, always, in immediateSafetyPosture.',
  '',
  '  This is the operational consequence FOR THE WORK AS A WHOLE. It is not attached to any one',
  '  unresolved fact. An ESTABLISHED hazard that owes no unresolved fact at all can still require',
  '  the work to stop, and this is where that is said. Do NOT invent an unresolved fact in order to',
  '  have somewhere to put an instruction.',
  '',
  `  posture   one of: ${IMMEDIATE_SAFETY_POSTURES_233.join(' | ')}`,
  '',
  `    CONTINUE                   ${POSTURE_DEFINITIONS_233.CONTINUE}`,
  `    CONTINUE_WITH_CONTROLS     ${POSTURE_DEFINITIONS_233.CONTINUE_WITH_CONTROLS}`,
  `    HOLD_PENDING_VERIFICATION  ${POSTURE_DEFINITIONS_233.HOLD_PENDING_VERIFICATION}`,
  `    STOP                       ${POSTURE_DEFINITIONS_233.STOP}`,
  '',
  `  ${POSTURE_DISTINCTIONS_233[0]}`,
  `  ${POSTURE_DISTINCTIONS_233[1]}`,
  `  ${POSTURE_DISTINCTIONS_233[2]}`,
  '',
  '  requiredBy                       Which of YOUR OWN hazard candidates and unresolved-fact',
  '                                   declarations require this posture. Give the candidateKey or',
  '                                   the declarationId and say which kind it is.',
  '',
  '  acceptedWithoutImmediateAction   Any candidate or declaration that needs NO action today, with',
  '                                   your reason. A hazard can be real, present and active and',
  '                                   still require nothing of anyone this shift. Saying so here is',
  '                                   the correct answer, not a gap in the analysis.',
  '',
  '  requiredControls                 Required only when the posture is CONTINUE_WITH_CONTROLS.',
  '                                   Each control carries a timing: BEFORE_WORK_RESUMES or',
  '                                   DURING_CONTINUED_WORK. A control that must be in place before',
  '                                   anyone is exposed again is not the same as one that runs',
  '                                   alongside the work, and the difference decides whether people',
  '                                   stand in the hazard while it is being checked.',
  '',
  '  resumeCondition                  Required when the posture is HOLD_PENDING_VERIFICATION or',
  '                                   STOP. Name the declarationIds whose resolution permits',
  '                                   resumption, or the corrections that must be completed, or',
  '                                   both. A TIME IS NOT A CONDITION: "as soon as practicable"',
  '                                   names when someone hopes to look, not what must become true.',
  '',
  '  whatHappensNow                   Say it plainly, in your own words. This explains the posture.',
  '                                   It does not establish it: the posture field above does.',
  '',
];

/** Unique in every §226 variant. The block lands where the instruction ends. */
const POSTURE_ANCHOR_233 = 'Return only the structured result. Do not narrate your reasoning process.';

function insertBeforeUniqueAnchor233(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_233_ABORT: the posture anchor appears ${hits.length} times in the §226 system `
      + 'prompt, expected 1. This successor is built by construction from §226 and refuses to load '
      + 'against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

function build233Prompt(base: string): string {
  return insertBeforeUniqueAnchor233(base.split('\n'), POSTURE_ANCHOR_233,
    POSTURE_BLOCK_LINES_233).join('\n');
}

export function build233SystemPrompt(governedSourceIdCount: number): string {
  return build233Prompt(build226SystemPrompt(governedSourceIdCount));
}

/** Remove the block again. Must reproduce the §226 prompt byte for byte. */
export function reconstruct226SystemPrompt(prompt: string): string {
  const joined = POSTURE_BLOCK_LINES_233.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) {
    throw new Error('FIRST_PASS_233: the posture block is not present; cannot reconstruct');
  }
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

// ================================================================ the wire schema

export const POSTURE_SCHEMA_PROPERTY_233 = {
  type: 'object',
  additionalProperties: false,
  required: ['posture', 'requiredBy', 'acceptedWithoutImmediateAction', 'requiredControls',
    'resumeCondition', 'whatHappensNow'],
  description: 'The operational consequence for the work as a whole while the analysed condition '
    + 'exists. One per analysis, always. It is NOT attached to any single unresolved fact: an '
    + 'established hazard owing no unresolved fact can still require the work to stop.',
  properties: {
    posture: {
      type: 'string',
      enum: [...IMMEDIATE_SAFETY_POSTURES_233],
      description: Object.entries(POSTURE_DEFINITIONS_233)
        .map(([k, v]) => `${k}: ${v}`).join(' ')
        + ' ' + POSTURE_DISTINCTIONS_233.join(' '),
    },
    requiredBy: {
      type: 'array',
      description: 'Which of your own candidates and declarations require this posture.',
      items: {
        type: 'object', additionalProperties: false, required: ['ref', 'refKind'],
        properties: {
          ref: { type: 'string', minLength: 1,
            description: 'a candidateKey or a declarationId from THIS analysis' },
          refKind: { type: 'string', enum: [...POSTURE_REF_KINDS_233] },
        },
      },
    },
    acceptedWithoutImmediateAction: {
      type: 'array',
      description: 'Candidates or declarations requiring no action today, each with your reason. A '
        + 'real, present, active hazard can still require nothing of anyone this shift, and saying '
        + 'so here is the correct answer rather than a gap.',
      items: {
        type: 'object', additionalProperties: false, required: ['ref', 'refKind', 'reason'],
        properties: {
          ref: { type: 'string', minLength: 1 },
          refKind: { type: 'string', enum: [...POSTURE_REF_KINDS_233] },
          reason: { type: 'string', minLength: 1 },
        },
      },
    },
    requiredControls: {
      type: 'array',
      description: 'Required when posture is CONTINUE_WITH_CONTROLS. Each control carries a timing.',
      items: {
        type: 'object', additionalProperties: false, required: ['control', 'timing'],
        properties: {
          control: { type: 'string', minLength: 1 },
          timing: { type: 'string', enum: [...CONTROL_TIMINGS_233],
            description: 'BEFORE_WORK_RESUMES: must be in place before anyone is exposed again. '
              + 'DURING_CONTINUED_WORK: runs alongside work that is permitted to continue.' },
        },
      },
    },
    resumeCondition: {
      type: 'object',
      additionalProperties: false,
      required: ['resolvedByDeclarationIds', 'correctionsRequired'],
      description: 'What must become true before work resumes. Must name at least one entry when '
        + 'the posture is HOLD_PENDING_VERIFICATION or STOP. A TIME IS NOT A CONDITION: "as soon as '
        + 'practicable" names when someone hopes to look, not what must become true. Leave both '
        + 'lists empty when the posture permits work to continue.',
      properties: {
        resolvedByDeclarationIds: {
          type: 'array', items: { type: 'string', minLength: 1 },
          description: 'declarationIds from THIS analysis whose resolution permits resumption',
        },
        correctionsRequired: {
          type: 'array', items: { type: 'string', minLength: 1 },
          description: 'corrections that must be completed, for an established condition that is '
            + 'not waiting on any result',
        },
      },
    },
    whatHappensNow: {
      type: 'string', minLength: 1,
      description: 'Plainly, in your own words. This explains the posture; the posture field '
        + 'establishes it.',
    },
  },
} as const;

/**
 * The §233 wire schema: the §210J schema, cloned, with exactly one added ROOT property and one
 * added root `required` entry. Aborts if the base already carries the field.
 */
export function buildExpert233WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const base = JSON.parse(JSON.stringify(buildExpert210jWireSchema(input, governed)));
  const props = base.properties as Record<string, unknown>;
  if (props === undefined) {
    throw new Error('FIRST_PASS_233_ABORT: the base schema carries no root properties; base drifted');
  }
  if (props[POSTURE_FIELD] !== undefined) {
    throw new Error(`FIRST_PASS_233_ABORT: the base already carries ${POSTURE_FIELD}; base drifted`);
  }
  if ((base.required as string[]).includes(POSTURE_FIELD)) {
    throw new Error(`FIRST_PASS_233_ABORT: ${POSTURE_FIELD} is already required; base drifted`);
  }
  props[POSTURE_FIELD] = JSON.parse(JSON.stringify(POSTURE_SCHEMA_PROPERTY_233));
  base.required = [...(base.required as string[]), POSTURE_FIELD];
  return base;
}

/** Remove the addition again. Asserted to reproduce the §210J schema exactly. */
export function reconstruct210jWireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(buildExpert233WireSchema(input, governed)));
  delete (v.properties as Record<string, unknown>)[POSTURE_FIELD];
  v.required = (v.required as string[]).filter(r => r !== POSTURE_FIELD);
  return v;
}

// ================================================================ field-level checks

export const POSTURE_FIELD_CODES_233 = [
  'POSTURE_MISSING',
  'POSTURE_NOT_AN_OBJECT',
  'POSTURE_VALUE_INVALID',
  'POSTURE_NARRATIVE_MISSING',
  'POSTURE_NARRATIVE_PLACEHOLDER',
] as const;
export type PostureFieldCode233 = (typeof POSTURE_FIELD_CODES_233)[number];

/**
 * R7 EXTENSION to the posture prose, EXTENDED NOT REIMPLEMENTED.
 *
 * §210D D2 emitted `decisionIfA: "unused"`. The identical failure is available on `whatHappensNow`
 * and a filler there satisfies every presence check while saying nothing a duty holder can act on.
 * The closed set is `isNonSemanticFiller`, imported from the frozen projection module. No member is
 * added and no semantic validation is introduced.
 */
export function checkPostureFields(raw: unknown): PostureFieldCode233[] {
  const a = (typeof raw === 'object' && raw !== null && !Array.isArray(raw))
    ? (raw as Record<string, unknown>) : {};
  const p = a[POSTURE_FIELD];
  if (p === undefined || p === null) return ['POSTURE_MISSING'];
  if (typeof p !== 'object' || Array.isArray(p)) return ['POSTURE_NOT_AN_OBJECT'];
  const o = p as Record<string, unknown>;
  const codes: PostureFieldCode233[] = [];
  if (!IMMEDIATE_SAFETY_POSTURES_233.includes(o.posture as ImmediateSafetyPosture233)) {
    codes.push('POSTURE_VALUE_INVALID');
  }
  const w = o.whatHappensNow;
  if (typeof w !== 'string' || w.trim().length === 0) codes.push('POSTURE_NARRATIVE_MISSING');
  else if (isNonSemanticFiller(w)) codes.push('POSTURE_NARRATIVE_PLACEHOLDER');
  return codes;
}

/** Is this analysis in the §233 format at all? Presence of the key, never a guess. */
export function analysisFormat233(raw: unknown): 'SUCCESSOR_233' | 'LEGACY_PRE_233' {
  const a = (typeof raw === 'object' && raw !== null && !Array.isArray(raw))
    ? (raw as Record<string, unknown>) : {};
  return POSTURE_FIELD in a ? 'SUCCESSOR_233' : 'LEGACY_PRE_233';
}

// ================================================================ identity

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function contractIdentities233(): Record<string, unknown> {
  return {
    contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
    baseVersions: BASE_CONTRACT_VERSIONS_233,
    postureField: POSTURE_FIELD,
    postures: sha256(JSON.stringify(IMMEDIATE_SAFETY_POSTURES_233)),
    postureDefinitions: sha256(JSON.stringify(POSTURE_DEFINITIONS_233)),
    postureDistinctions: sha256(JSON.stringify(POSTURE_DISTINCTIONS_233)),
    controlTimings: sha256(JSON.stringify(CONTROL_TIMINGS_233)),
    protectiveSequence: sha256(JSON.stringify(PROTECTIVE_SEQUENCE_233)),
    schemaProperty: sha256(JSON.stringify(POSTURE_SCHEMA_PROPERTY_233)),
    blockLines: sha256(POSTURE_BLOCK_LINES_233.join('\n')),
    systemPromptNoGoverned: sha256(build233SystemPrompt(0)),
    systemPromptGoverned: sha256(build233SystemPrompt(2)),
  };
}
