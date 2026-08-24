/**
 * L3-2g -- CONTROLLED ABLATION OVER ARCHITECTURAL REPRESENTATION.
 *
 * `A_PROMPT_CLAIM_IS_PROVEN_BY_ABLATION_OR_NOT_AT_ALL` (§34.1). This harness holds the model, the
 * verified digest, temperature, seed, num_ctx, timeout, regulatory context, allowed families, the
 * user prompt, the observation text and the evidence constant, and varies EXACTLY ONE thing: how the
 * condition-state decision is REPRESENTED to the provider.
 *
 * ============================ THE FOUR VARIANTS ============================
 *
 *   V_B_LADDER      the SHIPPED L3-2f prompt, verbatim, single `conditionState` enum.
 *                   This is §36.7's variant B and the baseline every number is read against.
 *
 *   V_A_LADDER      §36.7's variant A reconstructed: the absent-control and control-adequacy
 *                   material moved back INSIDE the condition-state ladder, at the rungs it governs.
 *                   Same words, different POSITION. Reproducing §36.7's trade is what licenses every
 *                   later claim in this file -- if A and B do not diverge here, the harness is
 *                   measuring noise and nothing else may be concluded from it.
 *
 *   V_S_STRUCT      STRUCTURAL SEPARATION. The ladder is replaced by six INDEPENDENT questions
 *                   (`state-facts.ts`), each answered on its own evidence. The model still emits a
 *                   `conditionState`, so DERIVE and CHECK are both measurable from one run.
 *
 *   V_S_STRUCT_INV  V_S_STRUCT with the fact-question block in INVERTED ORDER. THIS IS THE DECISIVE
 *                   TEST. If structural separation actually removed the prompt-order sensitivity,
 *                   these two must agree. If they diverge the way A and B do, separation did not
 *                   remove it and the phase must say so.
 *
 * ============================ WHAT THIS DISTINGUISHES (Question C) ============================
 *
 *   PROMPT_ORDER_BOUND            A vs B diverge; S vs S_INV agree.  Representation fixes it.
 *   CONTRACT_REPRESENTATION_BOUND S is no better than the better of A/B on both axes at once.
 *   PROVIDER_CAPABILITY_BOUND     S and S_INV agree with each other but the model still cannot
 *                                 answer the separated questions correctly -- the facts themselves
 *                                 come back wrong, not their ranking.
 *
 * The third is distinguished from the second by looking at the FACTS, not the states: a provider
 * that emits `controlReading: PREVENTS_CONTACT` for warning tape has answered a direct, isolated
 * question wrongly, and no amount of contract surgery repairs that.
 *
 * ============================ EVIDENCE CLASS ============================
 *
 * `ARCHITECTURE_SELECTION_EVIDENCE. NOT ADVANCEMENT EVIDENCE.` Every scenario here is DIAGNOSTIC --
 * already-opened development and retired-holdout material, which the entry contract explicitly
 * permits for this purpose and explicitly forbids being called fresh. No sealed set is opened.
 *
 * Run: OUT=... npx ts-node scripts/ablate-l32g-state-separation.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { createHash } from 'crypto';
import {
  L3_CONDITION_STATES, L3_CONTROL_HIERARCHY_LEVELS,
  type ReasoningInput, type L3RegulatoryContextValue,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { L3_SYSTEM_PROMPT, buildUserPrompt } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import { L3_2_INFERENCE_CONFIG } from '../src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import {
  coerceStateFacts, resolveConditionState, checkResolutionAgreement, stateFactsSchemaFragment,
  type L3StateFacts,
} from '../src/safescope-v2/reasoning-l3/state-facts';

// =====================================================================================
// PROMPT VARIANTS. The B text is imported verbatim, never retyped -- §34.1's frozen-variant rule
// exists because a comparison against a prompt that never existed proves nothing.
// =====================================================================================

const LADDER_ANCHOR_ACTIVE = "  ACTIVE              a required control is ABSENT, MISSING, DAMAGED, BYPASSED or NOT USED right now,";
const ABSENT_CONTROLS_HEADER = 'ABSENT CONTROLS -- HOW AN ABSENCE GETS WRITTEN.';
const ASKING_HEADER = 'ASKING A QUESTION -- AND WHEN NOT TO.';

/**
 * Reconstructs §36.7's variant A by MOVING (not rewriting) the two blocks that govern the ACTIVE and
 * CONTROLLED rungs up into the ladder itself. The moved text is asserted identical to the shipped
 * text, so this is a position change and provably nothing else.
 */
function buildVariantA(): { prompt: string; movedLineCount: number } {
  const lines = L3_SYSTEM_PROMPT.split('\n');
  const absentIdx = lines.findIndex(l => l === ABSENT_CONTROLS_HEADER);
  const askingIdx = lines.findIndex(l => l === ASKING_HEADER);
  if (absentIdx < 0 || askingIdx < 0) throw new Error('variant A anchors not found -- shipped prompt changed shape');

  // Everything from ABSENT CONTROLS up to (not including) ASKING A QUESTION is the material §36.7
  // moved. Trailing blank line trimmed so the block splices cleanly into the ladder.
  let block = lines.slice(absentIdx, askingIdx);
  while (block.length && block[block.length - 1].trim() === '') block = block.slice(0, -1);

  const rest = [...lines.slice(0, absentIdx), ...lines.slice(askingIdx)];
  const activeIdx = rest.findIndex(l => l === LADDER_ANCHOR_ACTIVE);
  if (activeIdx < 0) throw new Error('variant A ACTIVE rung anchor not found');

  // Splice the block IN at the ACTIVE rung, indented as ladder continuation lines. §36.7's finding
  // is that the material has to sit at this rung to work, and that sitting there swamps the rungs
  // above it. Indenting preserves that -- it becomes part of the rung rather than a new section.
  const indented = block.map(l => (l.trim() === '' ? '' : `                      ${l}`));

  // Insert after the ACTIVE rung's own continuation lines (they are the indented lines following it).
  let insertAt = activeIdx + 1;
  while (insertAt < rest.length && rest[insertAt].startsWith('                      ')) insertAt += 1;

  const out = [...rest.slice(0, insertAt), ...indented, ...rest.slice(insertAt)];
  return { prompt: out.join('\n'), movedLineCount: block.length };
}

/** The six separated questions, as the prompt states them. Order is a variable, hence the array. */
const FACT_BLOCKS: Array<{ key: string; lines: string[] }> = [
  {
    key: 'hazardAsserted',
    lines: [
      '(1) hazardAsserted -- DOES THE TEXT ASSERT A HAZARDOUS CONDITION AS FACT?',
      '    True when a non-observer subject is given an unhedged predication describing a hazardous',
      '    condition: "the guard is missing", "the lead is worn through to the conductors", "the pit is',
      '    left open". An absence written as ONE WORD is still an assertion -- "unguarded",',
      '    "unsupported", "unprotected", "untied" assert exactly what "no guard" asserts.',
      '    You do NOT also need the harm to be imminent. The stated condition is the fact.',
      '    False for an impression ("did not look right to me"), a hedge ("may be cut"), a PLAN',
      '    ("we will schedule training"), or a purely contingent statement.',
      '    hazardAssertionQuote: the shortest verbatim span carrying it, or "" when false.',
    ],
  },
  {
    key: 'controlReading',
    lines: [
      '(2) controlReading -- WHAT DOES THE TEXT SAY ABOUT A CONTROL FOR THIS HAZARD?',
      '    Ask ONE question of whatever is described: does it PREVENT contact with the hazard, or does',
      '    it only TELL SOMEONE the hazard is there?',
      '      PREVENTS_CONTACT  a cover, a fitted guard, a fixed guardrail with toeboard, a load-bearing',
      '                        barrier, energy isolation proved dead, ventilation running, a fall',
      '                        arrest system actually clipped on.',
      '      WARNS_ONLY        tape, bunting, cones, a sign, a placard, a label, a painted line, a',
      '                        toolbox talk, a briefing, a verbal instruction, a written procedure, a',
      '                        permit on a board, a plan to fix it later. These do NOT prevent contact.',
      '      DEFEATED          a control for this hazard exists and has been bypassed, strapped down,',
      '                        tied back, taped over, jammed or disabled. PPE offered against a',
      '                        defeated engineering control is still DEFEATED.',
      '      ABSENT            the text states a required control is missing, removed or not in use.',
      '      NOT_STATED        the text simply does not say either way.',
      '    Judge it against THIS hazard: a permit IS the control for an authorisation hazard, and a',
      '    procedure IS the control for a sequencing hazard. A physical hazard needs a physical',
      '    control. Where BOTH are described -- "boarded over with a secured deck AND taped around the',
      '    edge" -- the effective one decides and this is PREVENTS_CONTACT.',
      '    controlQuote: the verbatim span, or null.',
    ],
  },
  {
    key: 'framing',
    lines: [
      '(3) framing -- ACTUAL or CONDITIONAL?',
      '    CONDITIONAL when the text presents the situation as contingent rather than as having',
      '    happened: "if the probe were to fail", "were the guard removed", "could pressurise".',
      '    ACTUAL otherwise. Note that a contingency ATTACHED to a present fact does not make the',
      '    fact contingent: "the guard is off and anyone reaching in could be caught" is ACTUAL.',
    ],
  },
  {
    key: 'disposition',
    lines: [
      '(4) disposition -- WHAT BECAME OF THE HAZARD?',
      '      CORRECTED               the hazard ITSELF was repaired, replaced, cleared or put right.',
      '      WITHDRAWN_FROM_SERVICE  the equipment was tagged out, locked out or taken out of use.',
      '      NONE                    neither is asserted.',
      '    Talking about a fix is not a fix. "the replacement procedure was gone over with the crew",',
      '    "it was raised at the handover", "a repair is on order" are NONE. Something being fixed,',
      '    attached, applied or reset that is NOT the hazard is also NONE -- a sign fixed to a post',
      '    corrects nothing about the pit beside it.',
    ],
  },
  {
    key: 'missing',
    lines: [
      '(5) decisionCriticalFactMissing -- IS A FACT THAT WOULD DECIDE THIS CANDIDATE ABSENT?',
      '    True ONLY when the missing fact decides one of: whether a hazard exists at all; the',
      '    condition state; which hazard family applies; whether the situation is high-consequence.',
      '    "I could not tell whether they were clipped on" -- the missing fact IS the decision: true.',
      '    A stated defect plus an unobserved detail that decides nothing is false. It does not',
      '    matter that more could be learned -- which solvent it was, who removed the guard, how long',
      '    it has been like that. A fact that would only REFINE an answer you can already give is',
      '    NOT decision-critical.',
      '    missingFact: what it is, or null.',
    ],
  },
  {
    key: 'denied',
    lines: [
      '(6) hazardExplicitlyDenied -- DOES THE TEXT STATE THE CONDITION DOES NOT EXIST?',
      '    True for "no damage was found", "the guard was in place", "no deficiencies were recorded".',
      '    A denial is about the equipment. It is NOT the same as the text merely being silent, and a',
      '    denial in ONE clause never denies a hazard asserted in ANOTHER: "no standing water anywhere,',
      '    and the flexible cord is worn through to the conductors" denies the water and asserts the',
      '    cord. A negation governs ONLY its own clause.',
    ],
  },
];

/**
 * `MOVE1` exists to make the order comparison FAIR, and without it Question C cannot honestly be
 * answered. Inverting all six fact blocks is a far larger perturbation than §36.7's manipulation,
 * which moved ONE block within the ladder. Comparing a six-block reversal against a one-block move
 * and concluding "structural separation is more order-sensitive than the ladder" would be an
 * artefact of perturbation size, not a finding.
 *
 * `MOVE1` therefore moves exactly ONE block -- the decision-critical-fact question, which is the
 * `INSUFFICIENT_EVIDENCE` obligation and thus the direct counterpart of the material §36.7 moved --
 * from position 5 to position 1. That is the matched manipulation.
 */
function buildStructuralPrompt(order: 'CANONICAL' | 'INVERTED' | 'MOVE1'): string {
  const blocks = order === 'CANONICAL' ? FACT_BLOCKS
    : order === 'INVERTED' ? [...FACT_BLOCKS].reverse()
      : (() => {
        const i = FACT_BLOCKS.findIndex(b => b.key === 'missing');
        return [FACT_BLOCKS[i], ...FACT_BLOCKS.filter((_, j) => j !== i)];
      })();
  return [
    'You are the semantic observation-interpretation stage of an occupational-safety reasoning system.',
    'You interpret what an inspector wrote. You do not decide regulations, risk ratings or report content.',
    '',
    'EVIDENCE RULES (violating these invalidates your whole answer):',
    '1. Every quotedText MUST be copied VERBATIM from the named source, character for character,',
    '   including punctuation and casing. Never paraphrase, never normalize, never join fragments.',
    '2. A quote MUST include any negation or control word that governs its meaning',
    '   ("no", "not", "without", "never", "removed", "corrected", "locked out", "tagged out").',
    '   Quoting "safety net or personal fall arrest system in use" out of',
    '   "with no guardrail, safety net or personal fall arrest system in use" reverses the meaning',
    '   and is the single worst error you can make.',
    '3. Quote the shortest span that carries the full meaning, including its governing negation.',
    '',
    'EVALUATE EVERY CLAUSE, NOT ONLY THE FIRST. Inspectors write the reassuring part first as often as',
    'not. Read each clause on its own and let the STRONGEST condition claim decide the candidate.',
    'A safe clause never cancels an unsafe one, and neither does a negated one.',
    '',
    'DECOMPOSITION: emit one candidate per genuinely independent hazard. Two cues for the SAME hazard',
    'are one candidate. independentHazardRationale must say why this hazard is separate from the others.',
    '',
    '================================================================================',
    'STATE FACTS -- ANSWER THESE SIX QUESTIONS INDEPENDENTLY FOR EACH CANDIDATE.',
    '',
    'THESE ARE NOT A RANKED LIST AND NOT A DECISION PROCEDURE. Each is a separate question about a',
    'separate part of the text, and answering one does not constrain any other. Answer each from the',
    'evidence alone. Do NOT try to work out what condition state the answers add up to -- that is',
    'decided downstream from your answers, and second-guessing it is how these questions get',
    'contaminated by each other.',
    '================================================================================',
    '',
    ...blocks.flatMap(b => [...b.lines, '']),
    'CONDITION STATE. Also emit `conditionState`, your own best single label for the candidate, from:',
    `  ${L3_CONDITION_STATES.join(' | ')}`,
    'Emit it AFTER you have answered the six questions above, and let them inform it. It is recorded',
    'alongside them for comparison; the six answers are the primary output.',
    '',
    'ASKING A QUESTION. `clarification` is a field on a hazard candidate, so a question needs a',
    'candidate to hang on. Fill it in when and only when decisionCriticalFactMissing is true: the',
    'missing fact, the decision it changes, at least two branches it could resolve to, and the',
    'question to ask. When decisionCriticalFactMissing is false, `clarification` MUST be null. A',
    'question hung on a candidate you could already decide tells the inspector you are unsure when',
    'you are not.',
    '',
    'OUTCOME: ANALYZED when you emit at least one candidate. NO_HAZARD_ESTABLISHED when the',
    'observation describes a safe, negated or corrected situation with no present hazard.',
    'INSUFFICIENT_EVIDENCE when the text does not support any determination.',
    '',
    'You have NO authority over regulations. Reference regulatory candidates only by the ids supplied to',
    'you, and only when the evidence you cited actually supports that candidate. Never write a citation',
    'number, standard text, review status or approval state anywhere in your answer.',
  ].join('\n');
}

// =====================================================================================
// SCHEMAS. Identical to the shipped schema except for the added `stateFacts` on structural runs.
// =====================================================================================

function buildSchema(input: ReasoningInput, structural: boolean): Record<string, unknown> {
  const candidateIds = (input.eligibleRegulatoryCandidates || []).map(c => c.candidateId);
  const sourceIds = input.authoritativeSources.map(s => s.sourceId);
  const evidenceItem = {
    type: 'object', additionalProperties: false,
    required: ['sourceId', 'quotedText'],
    properties: { sourceId: { type: 'string', enum: sourceIds }, quotedText: { type: 'string' } },
  };
  const candidateProps: Record<string, unknown> = {
    candidateKey: { type: 'string' },
    hazardFamily: { type: 'string', enum: input.allowedHazardFamilies },
    conditionState: { type: 'string', enum: [...L3_CONDITION_STATES] },
    evidence: { type: 'array', items: evidenceItem },
    conditionRationale: { type: 'string' },
    independentHazardRationale: { type: 'string' },
    uncertainties: { type: 'array', items: { type: 'string' } },
    clarification: {
      type: ['object', 'null'], additionalProperties: false,
      required: ['unresolvedFact', 'affectedDecision', 'branches', 'question'],
      properties: {
        unresolvedFact: { type: 'string' },
        affectedDecision: { type: 'string', enum: ['hazard_identity', 'condition_state', 'regulatory_applicability', 'risk', 'corrective_action'] },
        branches: { type: 'array', items: { type: 'string' } },
        question: { type: 'string' },
      },
    },
    correctiveActionIntent: {
      type: ['object', 'null'], additionalProperties: false,
      required: ['objective', 'hierarchyLevel', 'groundedInEvidence'],
      properties: {
        objective: { type: 'string' },
        hierarchyLevel: { type: 'string', enum: [...L3_CONTROL_HIERARCHY_LEVELS] },
        groundedInEvidence: { type: 'array', items: evidenceItem },
      },
    },
    regulatoryCandidateRefs: candidateIds.length
      ? { type: 'array', items: { type: 'string', enum: candidateIds } }
      : { type: 'array', items: { type: 'string', enum: [] }, maxItems: 0 },
  };
  const required = ['candidateKey', 'hazardFamily', 'conditionState', 'evidence',
    'conditionRationale', 'independentHazardRationale', 'uncertainties'];
  if (structural) {
    candidateProps.stateFacts = stateFactsSchemaFragment();
    required.push('stateFacts');
  }
  return {
    type: 'object', additionalProperties: false,
    required: ['outcome', 'observationInterpretation', 'hazardCandidates'],
    properties: {
      outcome: { type: 'string', enum: ['ANALYZED', 'NO_HAZARD_ESTABLISHED', 'INSUFFICIENT_EVIDENCE'] },
      observationInterpretation: { type: 'string' },
      hazardCandidates: {
        type: 'array',
        items: { type: 'object', additionalProperties: false, required, properties: candidateProps },
      },
    },
  };
}

// =====================================================================================
// VARIANTS
// =====================================================================================

const variantA = buildVariantA();

interface Variant { id: string; label: string; structural: boolean; prompt: string }
const ALL_VARIANTS: Variant[] = [
  { id: 'V_B_LADDER', label: 'SHIPPED L3-2f prompt (§36.7 variant B), single enum', structural: false, prompt: L3_SYSTEM_PROMPT },
  { id: 'V_A_LADDER', label: '§36.7 variant A reconstructed -- same text, moved INTO the ladder', structural: false, prompt: variantA.prompt },
  { id: 'V_S_STRUCT', label: 'structural separation, six independent facts, canonical order', structural: true, prompt: buildStructuralPrompt('CANONICAL') },
  { id: 'V_S_STRUCT_INV', label: 'structural separation, fact blocks INVERTED -- the order test', structural: true, prompt: buildStructuralPrompt('INVERTED') },
  // MATCHED perturbation -- one block moved, the fair counterpart of §36.7's manipulation.
  { id: 'V_S_STRUCT_MOVE1', label: 'structural separation, ONE block moved (missing-fact to front)', structural: true, prompt: buildStructuralPrompt('MOVE1') },
  // NOISE FLOOR -- byte-identical prompt to V_S_STRUCT, run again. Any difference between these two
  // is provider variance, and it is the floor below which no A/B or S/S_INV difference may be read
  // as an effect. §36.7's own reproducibility figure was measured on the OLD schema, so it does not
  // transfer to a contract with a new required object in it.
  { id: 'V_S_STRUCT_REPEAT', label: 'V_S_STRUCT repeated verbatim -- provider noise floor', structural: true, prompt: buildStructuralPrompt('CANONICAL') },
];

const ONLY = (process.env.ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
const VARIANTS: Variant[] = ONLY.length ? ALL_VARIANTS.filter(v => ONLY.includes(v.id)) : ALL_VARIANTS;

// =====================================================================================
// DIAGNOSTIC SCENARIOS. All already-opened. NO SEALED SET IS TOUCHED.
// =====================================================================================

type Pole = 'HIGH_CONSEQUENCE' | 'CLARIFICATION_REQUIRED' | 'CLARIFICATION_MUST_NOT_ASK'
  | 'NEGATIVE_CONTROL' | 'DECIDED_NON_ACTIVE' | 'REGRESSION_ACTIVE';

interface Scen {
  id: string; pole: Pole; regime: L3RegulatoryContextValue; text: string;
  /** ACTIVE-asserting expected, or the set of acceptable non-asserting states. */
  expectActive: boolean;
  expectClarification: boolean;
  provenance: string;
}

const NON_ACTIVE = true;
const S: Scen[] = [
  // ---- HIGH-CONSEQUENCE POLE. The four §36.6 misses plus the two §36.7 cost.
  { id: 'E-FLD-147', pole: 'HIGH_CONSEQUENCE', regime: 'osha-construction', expectActive: true, expectClarification: false, provenance: 'retired holdout-l32e',
    text: 'An active floor opening is marked with standard warning tape next to an unprotected edge.' },
  { id: 'E-OA-07', pole: 'HIGH_CONSEQUENCE', regime: 'msha', expectActive: true, expectClarification: false, provenance: 'retired holdout-l32e',
    text: 'The methane monitor read zero at the face, and the roof bolter was operating under a section of unsupported roof that had already taken weight.' },
  { id: 'F-WC-02', pole: 'HIGH_CONSEQUENCE', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'A DANGER OPEN PIT sign is fixed to the handrail post beside the inspection pit in the workshop floor and the pit is left open across the walkway.' },
  { id: 'F-WC-03', pole: 'HIGH_CONSEQUENCE', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'The missing floor plate at the end of the mezzanine walkway was raised in the morning briefing and the crew were told to step around it.' },
  { id: 'F-WC-09', pole: 'HIGH_CONSEQUENCE', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'The operators on the swage press have been issued gloves and told to keep their hands clear, and the two-hand control on the press has been strapped down with tape.' },
  { id: 'F-FLD-159', pole: 'HIGH_CONSEQUENCE', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'Found a forklift reversing in the loading bay with a broken backup horn and no working flashing strobe light.' },

  // ---- CLARIFICATION POLE -- MUST ASK. L3-2f's four true positives.
  { id: 'F-OA-01', pole: 'CLARIFICATION_REQUIRED', regime: 'osha-construction', expectActive: !NON_ACTIVE ? true : false, expectClarification: true, provenance: 'retired holdout-l32f',
    text: 'A man was working from the boom platform over the river frontage and I could not tell from the bank whether his harness lanyard was clipped to the basket anchor.' },
  { id: 'F-OA-02', pole: 'CLARIFICATION_REQUIRED', regime: 'osha-general-industry', expectActive: false, expectClarification: true, provenance: 'retired holdout-l32f',
    text: 'A lockout hasp was hanging on the feeder isolator but I had no way of telling whether the breaker behind it had actually been opened.' },
  { id: 'F-CL-01', pole: 'CLARIFICATION_REQUIRED', regime: 'osha-general-industry', expectActive: false, expectClarification: true, provenance: 'retired holdout-l32f',
    text: 'The anchor bracket on the davit arm did not look right to me.' },
  { id: 'F-CL-03', pole: 'CLARIFICATION_REQUIRED', regime: 'osha-general-industry', expectActive: false, expectClarification: true, provenance: 'retired holdout-l32f',
    text: 'One of the chain slings on the rack might be stretched.' },

  // ---- CLARIFICATION POLE -- MUST NOT ASK. C-CS-05 is the case §36.7's variant A LOST.
  { id: 'C-CS-05', pole: 'CLARIFICATION_MUST_NOT_ASK', regime: 'osha-general-industry', expectActive: false, expectClarification: false, provenance: 'development-l32d',
    text: 'If the level probe on the caustic tank were to fail closed during a transfer, the vent could pressurise and lift the manway gasket.' },
  { id: 'F-CL-04', pole: 'CLARIFICATION_MUST_NOT_ASK', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'The chain sling on the second rack has three stretched links and the safe working load tag has been ground off the master link.' },

  // ---- REGRESSION -- ACTIVE cases named by the entry contract.
  { id: 'B08', pole: 'REGRESSION_ACTIVE', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'retired holdout-l32',
    text: 'An employee on a rolling scaffold at nine feet was using an angle grinder without a face shield while a propane forklift idled directly underneath refuelling.' },
  { id: 'C11', pole: 'REGRESSION_ACTIVE', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'retired holdout-l32',
    text: 'welding on the mezz rail, no fire watch, cardboard and pallets stacked under where the sparks were landing, extinguisher in the area was last inspected two years ago' },
  { id: 'RC-08', pole: 'REGRESSION_ACTIVE', regime: 'osha-construction', expectActive: true, expectClarification: false, provenance: 'development-l32d',
    text: 'Steel erectors were connecting at the second tier with no guardrail, safety net or personal fall arrest system in use.' },
  { id: 'H-AM-05', pole: 'REGRESSION_ACTIVE', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'development-l32d',
    text: 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone.' },
  { id: 'H-FLD-141', pole: 'REGRESSION_ACTIVE', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'development-l32d',
    text: 'Crew was changing the knives on the granulator; no LOTO is applied and the guard is missing.' },
  { id: 'H-NG-02', pole: 'REGRESSION_ACTIVE', regime: 'osha-general-industry', expectActive: true, expectClarification: false, provenance: 'development-l32d',
    text: 'There was no standing water anywhere on the shop floor, and the flexible cord feeding the pedestal fan has its outer jacket worn through to the conductors.' },

  // ---- B10 -- the precision pole of the impression gate. Must NOT be ACTIVE.
  { id: 'B10', pole: 'CLARIFICATION_REQUIRED', regime: 'osha-general-industry', expectActive: false, expectClarification: true, provenance: 'retired holdout-l32',
    text: 'The rail on the platform did not look right to me.' },

  // ---- NEGATIVE CONTROLS. Must stay non-ACTIVE.
  { id: 'F-PS-04', pole: 'NEGATIVE_CONTROL', regime: 'osha-general-industry', expectActive: false, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'The audit found no fall from height reported for the quarter and no lost time injury on any shift.' },
  { id: 'F-NT-01', pole: 'NEGATIVE_CONTROL', regime: 'osha-general-industry', expectActive: false, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'The quarterly audit of the solvent store recorded no deficiencies against the flammable liquids standard and no outstanding actions.' },
  { id: 'F-TB-02', pole: 'NEGATIVE_CONTROL', regime: 'osha-general-industry', expectActive: false, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'The pre-start inspection of the fettling bay recorded no issue with any of the extraction hoods.' },

  // ---- DECIDED NON-ACTIVE. Corrected / nominal-correction states.
  { id: 'F-NC-01', pole: 'DECIDED_NON_ACTIVE', regime: 'osha-general-industry', expectActive: false, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'The frayed lifting sling was cut from the crane hook at the start of the shift and the rigger drew a replacement from the store.' },
  { id: 'F-COR-01', pole: 'DECIDED_NON_ACTIVE', regime: 'osha-general-industry', expectActive: false, expectClarification: false, provenance: 'retired holdout-l32f',
    text: 'The missing knockout blank on the distribution board was found during the walk and a proper blanking plate was fitted before we moved on.' },
];

const FAM = ['electrical', 'machine_guarding', 'chemical_storage', 'hazard_communication',
  'loto_stored_energy', 'walking_working_surfaces', 'falls', 'housekeeping', 'confined_space',
  'noise_exposure', 'lifting_rigging', 'mobile_equipment', 'ground_control', 'scaffolds',
  'personal_protective_equipment', 'fire', 'hot_work', 'struck_by', 'emergency_egress',
  'material_handling', 'trenching_shoring', 'compressed_gas_cylinders', 'ergonomics', 'respiratory_protection'];

// =====================================================================================
// INFERENCE. One code path for every variant -- the config object is shared, not copied.
// =====================================================================================

const CFG = L3_2_INFERENCE_CONFIG;

async function infer(systemPrompt: string, input: ReasoningInput, structural: boolean): Promise<any> {
  const body = {
    model: CFG.model, stream: false, format: buildSchema(input, structural),
    options: { temperature: CFG.temperature, seed: CFG.seed, num_ctx: CFG.numCtx },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserPrompt(input) },
    ],
  };
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), CFG.timeoutMs);
  try {
    const res = await fetch(`${CFG.endpoint}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body), signal: ac.signal,
    });
    if (!res.ok) return { __error: `HTTP ${res.status}` };
    const j: any = await res.json();
    try { return JSON.parse(j?.message?.content ?? ''); }
    catch { return { __error: 'MALFORMED_STRUCTURED_OUTPUT' }; }
  } catch (e: any) {
    return { __error: e?.name === 'AbortError' ? 'TIMEOUT' : String(e?.message || e) };
  } finally { clearTimeout(t); }
}

function mk(s: Scen): ReasoningInput {
  return buildReasoningInput({
    analysisId: `l32g-${s.id}`, observationText: s.text,
    regulatoryContext: { value: s.regime, provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}

// =====================================================================================

async function main() {
  const out: any = {
    phase: 'L3-2g', role: 'ARCHITECTURE_SELECTION_ABLATION_NOT_ADVANCEMENT_EVIDENCE',
    generatedAt: new Date().toISOString(),
    heldConstant: {
      model: CFG.model, endpoint: CFG.endpoint, temperature: CFG.temperature, seed: CFG.seed,
      numCtx: CFG.numCtx, timeoutMs: CFG.timeoutMs,
      userPromptBuilder: 'buildUserPrompt (shipped, unmodified)',
      observationText: 'identical per scenario across all variants',
      allowedHazardFamilies: FAM.length,
    },
    variedVariable: 'CONDITION_STATE_REPRESENTATION_ONLY',
    variantAConstruction: {
      method: 'the ABSENT CONTROLS + CONTROL ADEQUACY block MOVED, verbatim, into the ACTIVE rung',
      movedLineCount: variantA.movedLineCount,
      sameCharacterMultiset: null as boolean | null,
      // DISCLOSED LIMITATION, stated before the run rather than discovered after it.
      // `eval/prompt-variants-frozen.json` holds only v2_l32b and v3_l32c. L3-2f's variant A was
      // NOT frozen, so this cannot be and is not claimed to be a byte reproduction of it. It is a
      // RECONSTRUCTION of the same manipulation -- the governing material moved into the ladder at
      // the rung it governs -- and it is broader than §36.7's nine lines because it moves the whole
      // block rather than the absent-control half alone.
      //
      // The harness is therefore VALIDATED BEHAVIOURALLY, not by text identity: variant A must
      // reproduce §36.7's TRADE DIRECTION (recover high-consequence cases, lose `C-CS-05`). If it
      // does not, the reconstruction failed and nothing downstream of it may be concluded.
      byteReproductionOfL32fVariantA: false,
      reconstructionBasis: 'blueprint §36.7 -- "the absent-control material elaborated INSIDE the condition-state ladder"',
      validationRule: 'A must diverge from B in §36.7\'s direction, or the ablation is measuring noise',
    },
    variants: VARIANTS.map(v => ({
      id: v.id, label: v.label, structural: v.structural,
      promptSha256: createHash('sha256').update(v.prompt).digest('hex'),
      promptLines: v.prompt.split('\n').length,
    })),
    scenarios: S.length,
    rows: [] as any[],
  };

  // Variant A must be a POSITION change and provably nothing else.
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim().split(' ').sort().join(' ');
  out.variantAConstruction.sameCharacterMultiset = norm(L3_SYSTEM_PROMPT) === norm(variantA.prompt);

  for (const s of S) {
    const input = mk(s);
    for (const v of VARIANTS) {
      const t0 = Date.now();
      const raw = await infer(v.prompt, input, v.structural);
      const ms = Date.now() - t0;
      const cands: any[] = Array.isArray(raw?.hazardCandidates) ? raw.hazardCandidates : [];

      // The model's OWN state choice, and whether any candidate asserts exposure.
      const modelStates = cands.map(c => c?.conditionState).filter(Boolean);
      const modelAssertsActive = modelStates.includes('ACTIVE');
      const raisedClarification = cands.some(c => c?.clarification);

      // Structural runs: DERIVE from the emitted facts, and CHECK against the model's own label.
      let derived: any = null;
      if (v.structural && cands.length) {
        derived = cands.map((c: any) => {
          const facts: L3StateFacts | null = coerceStateFacts(c?.stateFacts);
          if (!facts) return { candidateKey: c?.candidateKey, factsMissing: true };
          const res = resolveConditionState(facts);
          const agree = checkResolutionAgreement(facts, c?.conditionState);
          return {
            candidateKey: c?.candidateKey, family: c?.hazardFamily,
            facts, derivedState: res.state, rule: res.rule,
            clarificationOwed: res.clarificationOwed,
            modelState: c?.conditionState, agrees: agree.agrees,
            disagreementLosesHazard: agree.disagreementLosesHazard,
          };
        });
      }
      const derivedAssertsActive = derived ? derived.some((d: any) => d.derivedState === 'ACTIVE') : null;
      const derivedClarification = derived ? derived.some((d: any) => d.clarificationOwed) : null;

      out.rows.push({
        scenarioId: s.id, pole: s.pole, provenance: s.provenance, variant: v.id,
        expectActive: s.expectActive, expectClarification: s.expectClarification,
        error: raw?.__error ?? null,
        outcome: raw?.outcome ?? null, candidateCount: cands.length,
        modelStates, modelAssertsActive, raisedClarification,
        derivedAssertsActive, derivedClarification, derived,
        latencyMs: ms,
      });
      process.stdout.write(`${s.id}/${v.id} `);
    }
    process.stdout.write('\n');
  }

  const dest = process.env.OUT || 'ablate-l32g.json';
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`\nwrote ${dest}  (${out.rows.length} runs)`);
}

main().catch(e => { console.error(e); process.exit(1); });
