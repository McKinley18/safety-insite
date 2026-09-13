/**
 * The deterministic boundary between a semantic PROPOSAL and anything HazLenz may act on.
 *
 * SCOPE DISCIPLINE. This validator enforces CONTRACTS. It does not re-interpret the observation and
 * it must never grow into a second reasoning engine (blueprint section 29, contradiction C-1). Every
 * check below is structural: an offset resolves or it does not; a family is in the closed list or it
 * is not; a candidate id was supplied or it was not.
 *
 * What it cannot do at L3-1 is decide whether a negation was semantically understood. It can only
 * detect MECHANICAL truncation of a governing negation token. The semantic half is L3-2.
 */
import {
  L3_ANALYSIS_OUTCOMES, L3_CONDITION_STATES, L3_UNDECIDED_STATES,
  REASONING_INPUT_CONTRACT_VERSION, REASONING_PROPOSAL_CONTRACT_VERSION,
  type ClarificationDecision, type EvidenceReference, type HazardCandidate,
  type ReasoningInput, type ReasoningProposal,
} from './reasoning-contract.types';
import {
  validationStateForIssues,
  type L3ValidationIssue, type L3ValidationState,
} from './validation-result.types';
import {
  L3_VALIDATOR_VERSION, type ValidatedHazard, type ValidatedReasoning,
} from './validated-reasoning.types';

export interface L3ValidationOutcome {
  state: L3ValidationState;
  issues: L3ValidationIssue[];
  /** Present only when state is VALID. L3-INV-08: rejection can never yield a validated result. */
  validated: ValidatedReasoning | null;
}

/**
 * Tokens whose exclusion from a span can reverse its meaning. RC-08 is the proof this is required:
 * "...with no guardrail, safety net or personal fall arrest system in use" was rendered to a
 * customer as "safety net or personal fall arrest system in use".
 */
const NEGATION_SCOPE_TOKENS = [
  'no', 'not', 'never', 'without', 'none', 'nor', 'neither',
  'removed', 'corrected', 'repaired', 'replaced', 'locked', 'deenergized', 'de-energized',
  'isolated', 'guarded', 'tagged',
];

/** Fields a proposal may never carry. Presence is a structural violation, not a value judgement. */
const FORBIDDEN_GOVERNANCE_FIELDS = [
  'knowledgeReleaseId', 'releaseId', 'reviewState', 'approvalDigest', 'approved',
  'reviewerApproved', 'backingStatus', 'verifiedText', 'governedDeliveryState',
  'badge', 'standardText', 'canonicalText', 'citation',
];

function collectForbiddenFields(value: unknown, path: string, issues: L3ValidationIssue[], candidateKey?: string): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectForbiddenFields(v, `${path}[${i}]`, issues, candidateKey));
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_GOVERNANCE_FIELDS.includes(key)) {
      issues.push({
        code: key === 'standardText' || key === 'canonicalText' ? 'REGULATORY_TEXT_NOT_PERMITTED'
          : key === 'citation' ? 'INVENTED_REGULATORY_CANDIDATE'
          : 'GOVERNANCE_FIELD_NOT_PERMITTED',
        candidateKey,
        detail: `proposal carries forbidden field '${key}' at ${path}`,
      });
    }
    collectForbiddenFields(child, `${path}.${key}`, issues, candidateKey);
  }
}

function validateEvidence(
  ref: EvidenceReference, input: ReasoningInput, issues: L3ValidationIssue[], candidateKey: string,
): boolean {
  const source = input.authoritativeSources.find(s => s.sourceId === ref.sourceId);
  if (!source) {
    issues.push({ code: 'EVIDENCE_SOURCE_UNKNOWN', candidateKey, detail: `unknown sourceId '${ref.sourceId}'` });
    return false;
  }
  const { startOffset: start, endOffset: end } = ref;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > source.text.length || start >= end) {
    issues.push({ code: 'EVIDENCE_OUT_OF_BOUNDS', candidateKey, detail: `span [${start},${end}) outside source '${ref.sourceId}' length ${source.text.length}` });
    return false;
  }
  const actual = source.text.slice(start, end);
  if (actual !== ref.quotedText) {
    issues.push({ code: 'EVIDENCE_TEXT_MISMATCH', candidateKey, detail: `quotedText does not equal source[${start},${end})` });
    return false;
  }
  // L3-INV-11, mechanical half: a governing negation token immediately preceding the span must not
  // be excluded by the span boundary.
  const before = source.text.slice(Math.max(0, start - 40), start);
  const precedingWords = before.toLowerCase().match(/[a-z-]+/g) || [];
  const lastWord = precedingWords[precedingWords.length - 1];
  const spanHasNegation = NEGATION_SCOPE_TOKENS.some(t => new RegExp(`\\b${t}\\b`, 'i').test(actual));
  const separator = before.slice(before.length - (lastWord ? lastWord.length : 0) - 2);
  const clauseBroken = /[.;:!?]/.test(separator);
  if (lastWord && NEGATION_SCOPE_TOKENS.includes(lastWord) && !spanHasNegation && !clauseBroken) {
    issues.push({
      code: 'EVIDENCE_NEGATION_SCOPE_TRUNCATED', candidateKey,
      detail: `span excludes governing token '${lastWord}' immediately preceding it`,
    });
    return false;
  }
  return true;
}

/**
 * L3-INV-06 shape. A question that does not name the fact, the decision it changes, at least two
 * branches and the question itself is not a clarification -- it is prose, and prose acquiring
 * authority is exactly what the typed contract exists to prevent.
 */
const AFFECTED_DECISIONS: ReadonlyArray<ClarificationDecision['affectedDecision']> = [
  'hazard_identity', 'condition_state', 'regulatory_applicability', 'risk', 'corrective_action',
];

function clarificationShapeIsValid(cl: ClarificationDecision | null | undefined): boolean {
  return Boolean(
    cl
    && typeof cl.unresolvedFact === 'string' && cl.unresolvedFact.trim().length > 0
    && typeof cl.question === 'string' && cl.question.trim().length > 0
    && AFFECTED_DECISIONS.includes(cl.affectedDecision)
    && Array.isArray(cl.branches) && cl.branches.length >= 2
    && cl.branches.every(b => typeof b === 'string' && b.trim().length > 0),
  );
}

/**
 * L3-2i. The candidate-independent clarification carrier (blueprint section 39.5.1).
 *
 * Two things are checked and nothing else:
 *
 *  1. SHAPE -- the same L3-INV-06 requirement a candidate clarification carries. A malformed entry
 *     is `UNRESOLVED_DECISION_MALFORMED`.
 *
 *  2. DECISION-CRITICALITY -- the carrier is legitimate only where a decision was actually left
 *     open. `ANALYZED` and `NO_HAZARD_ESTABLISHED` MADE the determination, and `ANALYSIS_UNAVAILABLE`
 *     never reached one, so a question attached to any of them is not a clarification under
 *     L3-INV-06. That is section 34.2's decision-boundary rule, applied at the proposal level rather
 *     than re-invented: `INSUFFICIENT_EVIDENCE` and `UNKNOWN` say the decision was not made; the
 *     other states ARE the decision. Refusal is `UNRESOLVED_DECISION_NOT_DECISION_CRITICAL`.
 *
 * DELIBERATELY NOT CHECKED: whether the question is a GOOD one. That is semantics, and section 29's
 * contradiction C-1 forbids this validator growing into a second reasoning engine.
 *
 * The carrier grants nothing. It cannot create a hazard, a state, a standard, a corrective action or
 * any customer-authoritative output -- there is no field on it that could, and the sweep below
 * refuses governance and regulatory-text fields inside it structurally.
 */
function validateUnresolvedDecisions(
  proposal: ReasoningProposal, issues: L3ValidationIssue[],
): ClarificationDecision[] {
  const raw = proposal.unresolvedDecisions;
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    issues.push({ code: 'UNRESOLVED_DECISION_MALFORMED', detail: 'unresolvedDecisions is not an array' });
    return [];
  }
  if (raw.length === 0) return [];

  if (proposal.outcome !== 'INSUFFICIENT_EVIDENCE') {
    issues.push({
      code: 'UNRESOLVED_DECISION_NOT_DECISION_CRITICAL',
      detail: `outcome '${String(proposal.outcome)}' did not leave a decision open; `
        + 'a proposal-level clarification is permitted only on INSUFFICIENT_EVIDENCE',
    });
    return [];
  }

  // MEASURED GAP, closed here rather than left standing. The outcome alone is not sufficient: a
  // provider can label the OUTCOME `INSUFFICIENT_EVIDENCE` while every candidate it emitted carries
  // a DECIDED state. `C-CS-05` does exactly that -- outcome INSUFFICIENT_EVIDENCE, one candidate at
  // HYPOTHETICAL -- and an outcome-only gate let an unnecessary question through on a scenario whose
  // whole purpose is MUST-NOT-ASK.
  //
  // The rule is section 34.2's, unchanged and not re-invented: the six decided states ARE the
  // decision, so if candidates exist and NONE of them is undecided, nothing was left open and a
  // proposal-level question resolves no decision boundary. Zero candidates stays legitimate -- that
  // is the case this carrier exists for, and it is the only case where nothing can carry the
  // question. The candidate-level equivalent is `clarificationBelongsHere` in the semantic binder,
  // and both now read the SAME vocabulary.
  const candidates = Array.isArray(proposal.hazardCandidates) ? proposal.hazardCandidates : [];
  if (candidates.length > 0 && !candidates.some(c => L3_UNDECIDED_STATES.includes(c.conditionState))) {
    issues.push({
      code: 'UNRESOLVED_DECISION_NOT_DECISION_CRITICAL',
      detail: `outcome is INSUFFICIENT_EVIDENCE but every candidate carries a decided state `
        + `(${candidates.map(c => String(c.conditionState)).join(', ')}); no decision was left open`,
    });
    return [];
  }

  const accepted: ClarificationDecision[] = [];
  raw.forEach((cl, i) => {
    if (!clarificationShapeIsValid(cl)) {
      issues.push({
        code: 'UNRESOLVED_DECISION_MALFORMED',
        detail: `unresolvedDecisions[${i}] requires unresolvedFact, a known affectedDecision, `
          + 'question and >=2 non-empty branches',
      });
      return;
    }
    accepted.push(cl);
  });
  return accepted;
}

function validateCandidate(
  c: HazardCandidate, input: ReasoningInput, issues: L3ValidationIssue[], seen: Set<string>,
): ValidatedHazard | null {
  let ok = true;

  if (!c.candidateKey || typeof c.candidateKey !== 'string') {
    issues.push({ code: 'SCHEMA_INVALID', detail: 'candidate missing candidateKey' });
    return null;
  }
  const key = c.candidateKey;

  if (!input.allowedHazardFamilies.includes(c.hazardFamily)) {
    issues.push({ code: 'UNSUPPORTED_HAZARD_FAMILY', candidateKey: key, detail: `'${c.hazardFamily}' is not in the supplied taxonomy` });
    ok = false;
  }
  if (!L3_CONDITION_STATES.includes(c.conditionState)) {
    issues.push({ code: 'INVALID_CONDITION_STATE', candidateKey: key, detail: `'${String(c.conditionState)}' is not a Level-3 condition state` });
    ok = false;
  }

  const dedupe = `${c.hazardFamily}::${c.conditionState}::${(c.evidence || []).map(e => `${e.sourceId}:${e.startOffset}:${e.endOffset}`).sort().join('|')}`;
  if (seen.has(dedupe)) {
    issues.push({ code: 'DUPLICATE_CANDIDATE', candidateKey: key, detail: 'identical family, state and evidence as an earlier candidate' });
    ok = false;
  }
  seen.add(dedupe);

  // L3-INV-02. A candidate asserting anything other than "we could not establish" needs evidence.
  const assertsSomething = c.conditionState !== 'INSUFFICIENT_EVIDENCE' && c.conditionState !== 'UNKNOWN';
  if (assertsSomething && (!Array.isArray(c.evidence) || c.evidence.length === 0)) {
    issues.push({ code: 'EVIDENCE_MISSING', candidateKey: key, detail: `conditionState '${c.conditionState}' asserted with no evidence` });
    ok = false;
  }
  for (const ref of c.evidence || []) {
    if (!validateEvidence(ref, input, issues, key)) ok = false;
  }

  // L3-INV-01. Only ids that were supplied.
  const eligible = new Set((input.eligibleRegulatoryCandidates || []).map(x => x.candidateId));
  for (const refId of c.regulatoryCandidateRefs || []) {
    if (!eligible.has(refId)) {
      issues.push({ code: 'UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE', candidateKey: key, detail: `candidate id '${refId}' was not supplied as eligible` });
      ok = false;
    }
  }

  // L3-INV-06. A clarification must name the fact, the decision it changes, and the question.
  //
  // L3-2i NOTE, and the asymmetry is deliberate. This predicate is HISTORICAL and is deliberately
  // NOT replaced by `clarificationShapeIsValid` above, even though the two express the same idea.
  //
  // Failing HERE sets `ok = false`, which drops the whole CANDIDATE -- so this check is on a
  // REJECT path that can delete a hazard, and section 35.1's governing asymmetry applies: *a
  // vocabulary used to REJECT must be unambiguous.* Tightening it (enum membership, trimming,
  // non-empty branch strings) would delete hazards that survive today over a defect in their
  // QUESTION, which is exactly the trade this programme keeps refusing. The proposal-level carrier
  // can afford the stricter test because refusing it drops only the question (section 34.2).
  //
  // Unifying them is a real decision with a hazard-deletion consequence and belongs to a slice that
  // measures it, not to this one.
  if (c.clarification) {
    const cl = c.clarification;
    if (!cl.unresolvedFact || !cl.affectedDecision || !cl.question || !Array.isArray(cl.branches) || cl.branches.length < 2) {
      issues.push({ code: 'INVALID_CLARIFICATION_DEPENDENCY', candidateKey: key, detail: 'clarification requires unresolvedFact, affectedDecision, question and >=2 branches' });
      ok = false;
    }
  }

  // Corrective action must be grounded in this candidate's own evidence.
  if (c.correctiveActionIntent) {
    const own = new Set((c.evidence || []).map(e => `${e.sourceId}:${e.startOffset}:${e.endOffset}`));
    const grounded = c.correctiveActionIntent.groundedInEvidence || [];
    if (grounded.length === 0) {
      issues.push({ code: 'UNGROUNDED_CORRECTIVE_ACTION', candidateKey: key, detail: 'corrective-action intent carries no evidence reference' });
      ok = false;
    }
    for (const g of grounded) {
      if (!own.has(`${g.sourceId}:${g.startOffset}:${g.endOffset}`)) {
        issues.push({ code: 'UNGROUNDED_CORRECTIVE_ACTION', candidateKey: key, detail: 'corrective-action evidence is not among this candidate\'s evidence' });
        ok = false;
      }
    }
  }

  if (!ok) return null;
  return {
    candidateKey: key,
    hazardFamily: c.hazardFamily,
    conditionState: c.conditionState,
    evidence: c.evidence || [],
    conditionRationale: c.conditionRationale,
    independentHazardRationale: c.independentHazardRationale,
    uncertainties: c.uncertainties || [],
    clarification: c.clarification ?? null,
    correctiveActionIntent: c.correctiveActionIntent ?? null,
    riskFactors: c.riskFactors ?? null,
    regulatoryCandidateRefs: c.regulatoryCandidateRefs || [],
  };
}

export function validateReasoningProposal(proposal: ReasoningProposal, input: ReasoningInput): L3ValidationOutcome {
  const issues: L3ValidationIssue[] = [];

  if (!proposal || typeof proposal !== 'object') {
    return { state: 'REJECTED_MODEL_OUTPUT', issues: [{ code: 'SCHEMA_INVALID', detail: 'proposal is not an object' }], validated: null };
  }
  if (proposal.contractVersion !== REASONING_PROPOSAL_CONTRACT_VERSION) {
    issues.push({ code: 'CONTRACT_VERSION_MISMATCH', detail: `expected ${REASONING_PROPOSAL_CONTRACT_VERSION}, got ${String(proposal.contractVersion)}` });
  }
  if (input.contractVersion !== REASONING_INPUT_CONTRACT_VERSION) {
    issues.push({ code: 'CONTRACT_VERSION_MISMATCH', detail: `input contract ${String(input.contractVersion)} unsupported` });
  }
  if (proposal.analysisId !== input.analysisId) {
    issues.push({ code: 'ANALYSIS_ID_MISMATCH', detail: 'proposal.analysisId does not match the input' });
  }
  if (!L3_ANALYSIS_OUTCOMES.includes(proposal.outcome)) {
    issues.push({ code: 'SCHEMA_INVALID', detail: `unknown outcome '${String(proposal.outcome)}'` });
  }

  // L3-INV-03 / L3-INV-09 -- structural sweep for governance/regulatory-text fields anywhere.
  collectForbiddenFields(proposal.hazardCandidates, 'hazardCandidates', issues);
  collectForbiddenFields(proposal.jurisdictionProposal, 'jurisdictionProposal', issues);
  collectForbiddenFields(proposal.unresolvedDecisions, 'unresolvedDecisions', issues);

  // HYBRID: a proposal may never claim user confirmation.
  if (proposal.jurisdictionProposal && !['HAZLENZ_INFERRED', 'UNKNOWN'].includes(proposal.jurisdictionProposal.provenance)) {
    issues.push({ code: 'JURISDICTION_PROVENANCE_NOT_PERMITTED', detail: `provenance '${String(proposal.jurisdictionProposal.provenance)}' may not originate from a proposal` });
  }

  const candidates = Array.isArray(proposal.hazardCandidates) ? proposal.hazardCandidates : [];

  // L3-INV-05 -- an unavailable analysis cannot carry hazards.
  if (proposal.outcome === 'ANALYSIS_UNAVAILABLE' && candidates.length > 0) {
    issues.push({ code: 'UNAVAILABLE_CANNOT_CARRY_CANDIDATES', detail: 'ANALYSIS_UNAVAILABLE carried hazard candidates' });
  }
  if (proposal.outcome === 'NO_HAZARD_ESTABLISHED' && candidates.some(c => c.conditionState === 'ACTIVE')) {
    issues.push({ code: 'OUTCOME_CANDIDATE_MISMATCH', detail: 'NO_HAZARD_ESTABLISHED carried an ACTIVE candidate' });
  }
  if (proposal.outcome === 'ANALYZED' && candidates.length === 0) {
    issues.push({ code: 'OUTCOME_CANDIDATE_MISMATCH', detail: 'ANALYZED carried no hazard candidates' });
  }

  // L3-2i. Candidate-independent, so it is validated OUTSIDE the candidate loop -- which is the
  // whole point: a zero-candidate proposal never enters that loop.
  const unresolvedDecisions = validateUnresolvedDecisions(proposal, issues);

  const seen = new Set<string>();
  const validatedHazards: ValidatedHazard[] = [];
  for (const c of candidates) {
    const v = validateCandidate(c, input, issues, seen);
    if (v) validatedHazards.push(v);
  }

  const state = validationStateForIssues(issues);
  if (state !== 'VALID') return { state, issues, validated: null };

  return {
    state,
    issues,
    validated: {
      analysisId: proposal.analysisId,
      outcome: proposal.outcome,
      observationInterpretation: proposal.observationInterpretation,
      hazards: validatedHazards,
      jurisdictionProposal: proposal.jurisdictionProposal ?? null,
      unresolvedDecisions,
      validator: {
        inputContractVersion: REASONING_INPUT_CONTRACT_VERSION,
        proposalContractVersion: REASONING_PROPOSAL_CONTRACT_VERSION,
        validatorVersion: L3_VALIDATOR_VERSION,
        validatedAt: new Date().toISOString(),
      },
    },
  };
}
