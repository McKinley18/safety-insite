/**
 * L3-2 -- structured-output schema and prompt construction for the selected provider.
 *
 * WHY A SEPARATE MODULE. The L3-1 provider abstraction is deliberately vendor-neutral. Everything
 * in this file is *inference-shaped* -- a JSON schema the model is constrained to and the natural
 * language that steers it. It is imported only by the adapter, so the contract types and the
 * validator never see it.
 *
 * OFFSETS ARE NOT ASKED FOR. The model supplies `quotedText` and a `sourceId`; this module binds
 * the offsets by EXACT substring search against the supplied source. Asking a language model to
 * count characters manufactures a failure mode that has nothing to do with reasoning. Binding is
 * deliberately non-repairing: a quote that does not occur verbatim is bound to an out-of-range span
 * so `deterministic-safety-validator.ts` rejects it (EVIDENCE_OUT_OF_BOUNDS). A fabricated quote
 * must fail loudly, never be silently corrected into a nearby real one.
 */
import {
  L3_CONDITION_STATES, L3_CONTROL_HIERARCHY_LEVELS,
  REASONING_PROPOSAL_CONTRACT_VERSION,
  type EvidenceReference, type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from './reasoning-contract.types';

export const L3_PROMPT_VERSION = 'hazlenz.l3.prompt.v6' as const;

/**
 * L3-2j. The line on which a carrier declaration WOULD begin, were one appended to this prompt.
 *
 * IT IS NOT APPENDED, AND THAT IS A MEASURED DECISION, NOT AN OVERSIGHT -- see blueprint section 41.
 * L3-2j declared `unresolvedDecisions` here, ran the full 24-scenario diagnostic corpus, and found
 * that every configuration which activates the carrier on THIS prompt costs high-consequence recall
 * while improving nothing, because the ladder already carries the question on a candidate 5/5. The
 * declaration text lives in `activate-l32j-shipped-corpus.ts`, harness-side, where L3-2i also kept
 * it, so a later phase can re-measure it without the shipped path having to carry it in the meantime.
 *
 * The constant remains exported because the harness and the activation suite both split the prompt
 * at exactly this point, and a local copy in each silently stops matching the moment the
 * declaration's own heading is reworded -- which is how the first revision of it broke its own runner.
 */
export const L3_CARRIER_DECLARATION_ANCHOR = '\n\nUNRESOLVED DECISIONS' as const;

/** Sentinel span for a quote that does not occur verbatim in the named source. Fails validation. */
const UNBINDABLE_SPAN = { startOffset: -1, endOffset: -1 } as const;

// ---------------------------------------------------------------- structured-output schema

/**
 * The schema the provider is constrained to. It is INTENTIONALLY NARROWER than
 * `ReasoningProposal`: no offsets (bound here), and no field that L3-INV-03/09 forbid, so the
 * model is never given the vocabulary to assert governance or regulatory text in the first place.
 */
export function buildProposalSchema(input: ReasoningInput): Record<string, unknown> {
  const candidateIds = (input.eligibleRegulatoryCandidates || []).map(c => c.candidateId);
  const sourceIds = input.authoritativeSources.map(s => s.sourceId);

  const evidenceItem = {
    type: 'object', additionalProperties: false,
    required: ['sourceId', 'quotedText'],
    properties: {
      sourceId: { type: 'string', enum: sourceIds },
      quotedText: { type: 'string', minLength: 1 },
    },
  };

  // Written once and used once. L3-2j added a second caller -- the proposal-level carrier -- and then
  // REMOVED it again on evidence (section 41), so the helper is now what it was before: the candidate
  // clarification's shape, emitted byte-for-byte as it has been emitted since L3-2c. The `nullable`
  // parameter is kept because it is what distinguishes the two callers, and a later phase that
  // re-measures the carrier needs the non-nullable form back.
  const clarificationObject = (nullable: boolean) => ({
    type: nullable ? ['object', 'null'] : 'object', additionalProperties: false,
    required: ['unresolvedFact', 'affectedDecision', 'branches', 'question'],
    properties: {
      unresolvedFact: { type: 'string' },
      affectedDecision: {
        type: 'string',
        enum: ['hazard_identity', 'condition_state', 'regulatory_applicability', 'risk', 'corrective_action'],
      },
      branches: { type: 'array', items: { type: 'string' }, minItems: 2 },
      question: { type: 'string' },
    },
  });

  return {
    type: 'object', additionalProperties: false,
    required: ['outcome', 'observationInterpretation', 'hazardCandidates'],
    properties: {
      outcome: { type: 'string', enum: ['ANALYZED', 'NO_HAZARD_ESTABLISHED', 'INSUFFICIENT_EVIDENCE'] },
      observationInterpretation: { type: 'string' },
      hazardCandidates: {
        type: 'array',
        items: {
          type: 'object', additionalProperties: false,
          required: [
            'candidateKey', 'hazardFamily', 'conditionState', 'evidence',
            'conditionRationale', 'independentHazardRationale', 'uncertainties',
          ],
          properties: {
            candidateKey: { type: 'string', minLength: 1 },
            hazardFamily: { type: 'string', enum: input.allowedHazardFamilies },
            conditionState: { type: 'string', enum: [...L3_CONDITION_STATES] },
            evidence: { type: 'array', items: evidenceItem },
            conditionRationale: { type: 'string' },
            independentHazardRationale: { type: 'string' },
            uncertainties: { type: 'array', items: { type: 'string' } },
            clarification: clarificationObject(true),
            correctiveActionIntent: {
              type: ['object', 'null'], additionalProperties: false,
              required: ['objective', 'hierarchyLevel', 'groundedInEvidence'],
              properties: {
                objective: { type: 'string' },
                hierarchyLevel: { type: 'string', enum: [...L3_CONTROL_HIERARCHY_LEVELS] },
                groundedInEvidence: { type: 'array', items: evidenceItem },
              },
            },
            riskFactors: {
              type: ['object', 'null'], additionalProperties: false,
              required: ['consequenceSeverity', 'exposureLikelihood', 'affectedPersons', 'existingControls', 'uncertainty'],
              properties: {
                consequenceSeverity: { type: 'string', enum: ['low', 'moderate', 'serious', 'severe', 'unknown'] },
                exposureLikelihood: { type: 'string', enum: ['rare', 'unlikely', 'possible', 'likely', 'unknown'] },
                affectedPersons: { type: 'string', enum: ['none_established', 'one', 'few', 'many', 'unknown'] },
                existingControls: { type: 'array', items: { type: 'string' } },
                uncertainty: { type: 'array', items: { type: 'string' } },
              },
            },
            // L3-INV-01: ids only, and the enum makes an invented citation unrepresentable.
            regulatoryCandidateRefs: candidateIds.length
              ? { type: 'array', items: { type: 'string', enum: candidateIds } }
              : { type: 'array', items: { type: 'string', enum: [] }, maxItems: 0 },
          },
        },
      },
    },
  };
}

// ---------------------------------------------------------------- prompt

/**
 * The condition-state decision procedure is stated as an ordered test rather than a glossary.
 * RC-01 is the reason: an engine that cannot decide reached for ACTIVE. The instruction here runs
 * the opposite way -- an undecidable case must land on INSUFFICIENT_EVIDENCE, and the validator
 * plus L3-INV-04 make sure a missing state can never silently become ACTIVE.
 */
export const L3_SYSTEM_PROMPT = [
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
  'CONDITION STATE -- apply these tests IN ORDER and stop at the first that matches:',
  '  NEGATED             the observation states the condition does NOT exist',
  '                      ("the guard was in place", "no damage was found").',
  '  CORRECTED           the condition existed and the observation says it was fixed/repaired/replaced.',
  '  REMOVED_FROM_SERVICE the equipment was tagged out, locked out or taken out of use.',
  '  CONTROLLED          the hazard exists but an effective control is described as in place and working.',
  '                      Apply the CONTROL ADEQUACY TEST below before you take this rung.',
  '  HYPOTHETICAL        conditional or contingent ("if...", "could...", "were the guard removed").',
  '  ACTIVE              a required control is ABSENT, MISSING, DAMAGED, BYPASSED or NOT USED right now,',
  '                      or a hazardous condition is described as presently existing.',
  '                      An absent control IS an active hazard -- "no guardrail", "missing tongue guard",',
  '                      "not locked out", "exposed conductor" are ACTIVE, not uncertain.',
  '                      See ABSENT CONTROLS below before you leave this rung.',
  '  INSUFFICIENT_EVIDENCE the text genuinely does not say enough to place the condition.',
  '                      This rung has a required output shape -- see ASKING A QUESTION below.',
  '  UNKNOWN             you cannot classify it even as insufficient.',
  '',
  'EVALUATE EVERY CLAUSE, NOT ONLY THE FIRST. Inspectors write the reassuring part first as often as',
  'not. Read each clause on its own, decide what each one says about the condition, and let the',
  'STRONGEST condition claim decide the candidate. "The atmosphere was tested and found clear, and the',
  'man went down with no rescue tripod rigged" -- clause one says nothing whatever about the hazard in',
  'clause two. A safe clause never cancels an unsafe one, and neither does a negated one: a negation',
  'governs only its own clause. Returning no candidate because the observation opened reassuringly is',
  'one of the worst errors you can make.',
  '',
  'COULD NOT OBSERVE IS NOT THE SAME AS NOT ENOUGH EVIDENCE. "I could not see whether they were tied',
  'off" is a fact about the inspection, not about the equipment. Ask one question of it: is the thing',
  'that could not be observed the fact that DECIDES this candidate?',
  '  - it decides the candidate -> INSUFFICIENT_EVIDENCE, with the clarification that rung requires;',
  '  - it decides nothing       -> classify from the facts that WERE observed, and ask nothing.',
  'A stated defect plus an unobserved detail that decides nothing is still ACTIVE, and needs no',
  'question. An unobserved control, where the presence of that control is the whole question, is not.',
  '',
  'Do NOT retreat to INSUFFICIENT_EVIDENCE when the observation plainly describes a missing control.',
  'Do NOT invent a hazard from language that only describes a PLANNED or FUTURE action',
  '("we will schedule training") -- a plan is not evidence of a present condition.',
  'Do NOT emit a candidate for a hazard family merely because a related word appears nearby.',
  '',
  'DECOMPOSITION: emit one candidate per genuinely independent hazard. Two cues for the SAME hazard',
  'are one candidate. independentHazardRationale must say why this hazard is separate from the others.',
  '',
  'IMPRESSIONS ARE NOT CONDITIONS. Wording that reports how something LOOKED or SEEMED to the observer',
  '-- "did not look right", "seemed unsafe", "might be damaged", "possibly leaking", "I think it is',
  'defective" -- tells you about the observer\'s confidence, not about the equipment. On its own that',
  'is never ACTIVE. Take INSUFFICIENT_EVIDENCE and follow ASKING A QUESTION below -- a candidate with',
  'a clarification, not an empty answer.',
  '',
  'BUT DO NOT OVERCORRECT. If the observation ALSO states a concrete physical fact, reason from the',
  'fact and ignore the hedge around it. "The racking looked wrong to me and the second upright is',
  'bowed with the base plate lifted clear of the floor" states two hard facts -- a bowed upright and',
  'a lifted base plate -- and is ACTIVE. Quote the factual part as your evidence. An impression',
  'sitting next to a fact does not cancel the fact, and returning no candidate at all when a real',
  'defect was described is a worse error than being slightly too cautious about the state.',
  '',
  'ABSENT CONTROLS -- HOW AN ABSENCE GETS WRITTEN.',
  'An absence written as ONE WORD is still an absence: "unguarded", "unsupported", "unprotected",',
  '"unlabelled", "uncovered", "untied" say exactly what "no guard", "no support", "no edge protection"',
  'say, and are ACTIVE on the same terms. Where the observation STATES a required control is absent you',
  'do not also need it to prove the harm was imminent -- not that the roof was about to fall, nor that',
  'anyone was hurt. The missing control is the finding.',
  'BUT THE ACTIVE RUNG NEEDS THE OBSERVATION TO SAY THE CONTROL IS ABSENT. A control the inspector',
  'could not SEE is NOT an absent control: "I could not tell whether they were clipped on" is decided',
  'by COULD NOT OBSERVE above, never by this rule.',
  '',
  'CONTROL ADEQUACY TEST -- A WARNING IS NOT A CONTROL.',
  'Before you call anything CONTROLLED, ask ONE question: does the thing described actually PREVENT',
  'contact with the hazard, or does it only TELL SOMEONE the hazard is there?',
  '  PREVENTS  -- a cover, a fitted guard, a fixed guardrail with toeboard, a barrier that carries',
  '               load, energy isolation proved dead, ventilation running, a fall arrest system',
  '               actually clipped on. These CAN be CONTROLLED.',
  '  ONLY WARNS -- tape, bunting, cones, a sign, a placard, a label, a painted line, a barrier marker,',
  '               a toolbox talk, a briefing, a verbal instruction to take care, a written procedure,',
  '               a permit on a board, a plan to fix it later. These are warnings and administrative',
  '               measures. They do NOT remove the hazard and they do NOT make it CONTROLLED.',
  'An open hole with tape around it is an open hole. "Marked with warning tape", "a DANGER sign is',
  'fixed to the rail", "the crew were told to step around it" -- the hazard in every one of those is',
  'ACTIVE, and the warning is worth recording as a partial measure, not as the control.',
  'This does NOT make administrative controls worthless, and it is not a rule about words. Judge it',
  'against THIS hazard: a permit-to-work IS the control for an authorisation hazard, and a procedure',
  'IS the control for a sequencing hazard. It is a physical hazard that needs a physical control.',
  'When BOTH are described -- "boarded over with a secured deck AND taped around the edge" -- the',
  'effective control decides, and the state is CONTROLLED.',
  'TALKING ABOUT A FIX IS NOT A FIX. "the replacement procedure was gone over with the crew", "it was',
  'raised at the handover", "a repair is on order" -- if the observation then says the condition was',
  'still there, the condition is ACTIVE. Read the clause that says what was left in place.',
  '',
  'ASKING A QUESTION -- AND WHEN NOT TO.',
  '`clarification` is a field on a hazard candidate, so a question needs a candidate to hang on.',
  '',
  'ASK when the ladder lands on INSUFFICIENT_EVIDENCE or UNKNOWN because one missing fact would change',
  'one of these four things:',
  '  - whether a hazard exists at all;      - the condition state;',
  '  - which hazard family applies;         - whether the situation is high-consequence.',
  'Then you MUST emit a candidate for the hazard family you suspect, with conditionState',
  'INSUFFICIENT_EVIDENCE and a filled-in `clarification`: the missing fact, the decision it changes,',
  'at least two branches it could resolve to, and the question to ask. An empty hazardCandidates list',
  'is WRONG here -- it says you have nothing to ask about when you have a specific question. The',
  'candidate asserts no hazard; it records what you suspect and what you need in order to decide.',
  '',
  'DO NOT ASK when the ladder reached ACTIVE, CONTROLLED, CORRECTED, NEGATED, HYPOTHETICAL or',
  'REMOVED_FROM_SERVICE. Those states mean the decision IS ALREADY MADE, and such a candidate MUST',
  'carry `clarification: null`. It does not matter that more could be learned -- which solvent it was,',
  'who removed the guard, how long it has been like that, how deep the accumulation is, whether it',
  'might fail later. A question that would only refine an answer you can already give is noise, and a',
  'question hung on a hazard you have already classified is worse than noise: it tells the inspector',
  'you are unsure when you are not.',
  '',
  'OUTCOME: ANALYZED when you emit at least one candidate. NO_HAZARD_ESTABLISHED when the observation',
  'describes a safe, negated or corrected situation with no present hazard. INSUFFICIENT_EVIDENCE when',
  'the text does not support any determination.',
  '',
  'You have NO authority over regulations. Reference regulatory candidates only by the ids supplied to',
  'you, and only when the evidence you cited actually supports that candidate. Never write a citation',
  'number, standard text, review status or approval state anywhere in your answer.',

].join('\n');

export function buildUserPrompt(input: ReasoningInput): string {
  const parts: string[] = [];
  // The analysis id is deliberately NOT sent. The model has no use for it -- `bindProposal` takes
  // `analysisId` from the input and the validator compares against the input -- and including it put
  // a per-run identifier into the prompt bytes, which made identical observations generate
  // differently across runs and eval sets (L3-2b root cause R5).
  parts.push(`REGULATORY CONTEXT: ${input.regulatoryContext.value} (provenance: ${input.regulatoryContext.provenance})`);
  parts.push('');
  parts.push('ALLOWED HAZARD FAMILIES (choose only from these):');
  parts.push(input.allowedHazardFamilies.map(f => `  - ${f}`).join('\n'));
  parts.push('');
  parts.push('SOURCES (quote verbatim from these and name the sourceId):');
  for (const s of input.authoritativeSources) {
    parts.push(`  [${s.sourceId}] (${s.sourceType})`);
    parts.push(`  ${JSON.stringify(s.text)}`);
  }
  if (input.answeredClarifications?.length) {
    parts.push('');
    parts.push('ANSWERED CLARIFICATIONS:');
    for (const c of input.answeredClarifications) parts.push(`  - ${c.answeredFact}: ${c.answer}`);
  }
  if (input.eligibleRegulatoryCandidates?.length) {
    parts.push('');
    parts.push('ELIGIBLE REGULATORY CANDIDATE IDS (ids only -- never write the citation itself):');
    for (const c of input.eligibleRegulatoryCandidates) parts.push(`  - ${c.candidateId}`);
  }
  if (input.establishedFindings?.length) {
    parts.push('');
    parts.push('ALREADY ESTABLISHED FOR THIS INSPECTION (duplicate control only, NOT evidence):');
    for (const f of input.establishedFindings) parts.push(`  - ${f.hazardFamily} (${f.conditionState})`);
  }
  if (input.advisorySignals?.length) {
    parts.push('');
    parts.push('ADVISORY HINTS FROM A LEXICAL PRE-PASS. These are NOT evidence and NOT authoritative.');
    parts.push('They are frequently wrong. Ignore any hint the source text does not support:');
    for (const a of input.advisorySignals) parts.push(`  - (${a.kind}) ${a.value}`);
  }
  return parts.join('\n');
}

// ---------------------------------------------------------------- offset binding

export interface QuoteBindingStat {
  total: number;
  /** Quotes that did not occur verbatim in the named source -- fabricated or paraphrased. */
  unbound: number;
  /** Quotes that occur more than once; the first occurrence is used and the ambiguity recorded. */
  ambiguous: number;
}

interface RawEvidence { sourceId: string; quotedText: string }

function bindOne(raw: RawEvidence, input: ReasoningInput, stat: QuoteBindingStat): EvidenceReference {
  stat.total += 1;
  const source = input.authoritativeSources.find(s => s.sourceId === raw.sourceId);
  const quoted = typeof raw.quotedText === 'string' ? raw.quotedText : '';
  if (!source || !quoted) {
    stat.unbound += 1;
    return { sourceId: String(raw.sourceId), sourceType: source?.sourceType ?? 'observation', ...UNBINDABLE_SPAN, quotedText: quoted };
  }
  const start = source.text.indexOf(quoted);
  if (start < 0) {
    stat.unbound += 1;
    return { sourceId: source.sourceId, sourceType: source.sourceType, ...UNBINDABLE_SPAN, quotedText: quoted };
  }
  if (source.text.indexOf(quoted, start + 1) >= 0) stat.ambiguous += 1;
  return {
    sourceId: source.sourceId, sourceType: source.sourceType,
    startOffset: start, endOffset: start + quoted.length, quotedText: quoted,
  };
}

export interface BoundProposal {
  proposal: ReasoningProposal;
  binding: QuoteBindingStat;
}

/**
 * Turns the model's schema-shaped answer into a `ReasoningProposal`. This performs NO semantic
 * repair: unknown families, illegal states and fabricated quotes are carried through unchanged so
 * the deterministic validator is the thing that rejects them.
 */
export function bindProposal(raw: any, input: ReasoningInput): BoundProposal {
  const binding: QuoteBindingStat = { total: 0, unbound: 0, ambiguous: 0 };
  const rawCandidates: any[] = Array.isArray(raw?.hazardCandidates) ? raw.hazardCandidates : [];

  const hazardCandidates: HazardCandidate[] = rawCandidates.map((c: any, i: number) => {
    const evidence = (Array.isArray(c?.evidence) ? c.evidence : []).map((e: RawEvidence) => bindOne(e, input, binding));
    const cai = c?.correctiveActionIntent;
    return {
      candidateKey: typeof c?.candidateKey === 'string' && c.candidateKey ? c.candidateKey : `c${i + 1}`,
      hazardFamily: c?.hazardFamily,
      conditionState: c?.conditionState,
      evidence,
      conditionRationale: typeof c?.conditionRationale === 'string' ? c.conditionRationale : '',
      independentHazardRationale: typeof c?.independentHazardRationale === 'string' ? c.independentHazardRationale : '',
      uncertainties: Array.isArray(c?.uncertainties) ? c.uncertainties : [],
      clarification: c?.clarification ?? null,
      correctiveActionIntent: cai
        ? {
            objective: cai.objective,
            hierarchyLevel: cai.hierarchyLevel,
            groundedInEvidence: (Array.isArray(cai.groundedInEvidence) ? cai.groundedInEvidence : [])
              .map((e: RawEvidence) => bindOne(e, input, binding)),
          }
        : null,
      riskFactors: c?.riskFactors ?? null,
      regulatoryCandidateRefs: Array.isArray(c?.regulatoryCandidateRefs) ? c.regulatoryCandidateRefs : [],
    };
  });

  return {
    binding,
    proposal: {
      contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION,
      analysisId: input.analysisId,
      outcome: raw?.outcome,
      observationInterpretation: typeof raw?.observationInterpretation === 'string' ? raw.observationInterpretation : '',
      hazardCandidates,
      jurisdictionProposal: null,
      // L3-2i. Carried through UNREPAIRED, exactly like every other field here: a malformed or
      // non-decision-critical entry is the deterministic validator's to refuse, not this function's
      // to quietly fix. Absent stays absent so a pre-L3-2i proposal is byte-identical after binding.
      ...(raw?.unresolvedDecisions === undefined ? {} : { unresolvedDecisions: raw.unresolvedDecisions }),
    },
  };
}
