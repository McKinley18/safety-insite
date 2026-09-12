/**
 * §200 -- BUILD THE HUMAN ADJUDICATION SESSION. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHAT THIS FILE DOES, AND THE LINE IT DOES NOT CROSS ====================
 *
 * It assembles everything a human reviewer needs to adjudicate the §199 evidence, and it supplies
 * NO VERDICT. Every one of the 152 slots stays null.
 *
 * The authorization is explicit -- "No script may manufacture semantic verdicts" -- and the standing
 * rule in this programme is narrower still: the model builds the neutral packet and stops, because a
 * verdict supplied by the evaluated component makes it its own examiner. §190 was labelled MODEL
 * adjudication precisely so it could never be mistaken for the human kind.
 *
 * ==================== WHAT IT DOES SUPPLY, AND WHY THAT IS NOT A VERDICT ====================
 *
 * NEUTRAL FACTUAL OBSERVATIONS. Each is a byte-level or set-membership comparison whose answer is
 * not in dispute:
 *
 *   - is the declared span contained in one of the preregistered acceptable span regions?
 *   - is the declared affectedDecision the preregistered one, a listed acceptable alternative,
 *     or neither?
 *   - does the declared property text share vocabulary with a preregistered
 *     unacceptableNeighbouringProperty?
 *   - does each preregistered conjunct appear somewhere in the declaration?
 *
 * "The span is not inside any acceptable region" is a fact. "Therefore axis D is INCORRECT" is a
 * verdict, and this file never draws that line. The observations exist so the reviewer starts from
 * the evidence rather than from a blank page, and every one of them names what it compared.
 *
 * A NEUTRAL OBSERVATION CAN BE WRONG ABOUT WHAT MATTERS. The preregistered truth is AI-authored and
 * unreviewed, so an observation that a declaration diverges from it is equally consistent with a
 * defective declaration and a defective expectation. `TRUTH_SPECIFICATION_DEFECT` is therefore a
 * first-class outcome in the worksheet, not an afterthought.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import {
  SECTION_199_COHORT, COHORT_COVERAGE, TRUTH_PROVENANCE, TRANSPORT_CANARY_ROW_ID,
} from './lib/expert-199-cohort-2026-09-07';

const ROOT = join(__dirname, '..', '..');
const E199 = join(ROOT, 'verification', 'expert-hazlenz-successor-structured-e2e-2026-09-07');
const E200 = join(ROOT, 'verification', 'expert-hazlenz-semantic-adjudication-2026-09-07');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const readJsonl = (p: string): any[] => (existsSync(p)
  ? readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : []);

const fp = readJsonl(join(E199, 'RAW-FIRST-PASS-OUTPUTS.jsonl'));
const proj = readJsonl(join(E199, 'PROJECTION-PROVENANCE.jsonl'));
const ver = readJsonl(join(E199, 'RAW-VERIFIER-OUTPUTS.jsonl'));
const det = JSON.parse(readFileSync(join(E199, 'DETERMINISTIC-RESULTS.json'), 'utf8'));
const rowOf = (id: string) => SECTION_199_COHORT.find(r => r.rowId === id)!;

// ---------------------------------------------------------------- neutral comparison helpers

/** Content words, for a vocabulary-overlap observation. Never a similarity judgement. */
const contentWords = (s: string): Set<string> => new Set(
  String(s).toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length > 4));

function overlapWith(text: string, other: string): number {
  const a = contentWords(text); const b = contentWords(other);
  if (a.size === 0 || b.size === 0) return 0;
  return [...a].filter(w => b.has(w)).length / Math.min(a.size, b.size);
}

interface NeutralObservation {
  readonly what: string;
  readonly compared: string;
  readonly finding: string;
  readonly isAVerdict: false;
}

function observeSpan(declaredSpan: string, expected: any): NeutralObservation {
  const regions: string[] = expected?.acceptableSpanRegions ?? [];
  const exact = regions.some(r => r === declaredSpan);
  const containedIn = regions.filter(r => r.includes(declaredSpan));
  const contains = regions.filter(r => declaredSpan.includes(r));
  return {
    what: 'declared evidenceSpan against the preregistered acceptableSpanRegions',
    compared: `declared ${JSON.stringify(declaredSpan)} against ${regions.length} region(s)`,
    finding: exact ? 'the declared span is EXACTLY one of the preregistered regions'
      : containedIn.length > 0 ? `the declared span is a SUBSTRING of a preregistered region: ${JSON.stringify(containedIn[0])}`
        : contains.length > 0 ? `the declared span CONTAINS a preregistered region: ${JSON.stringify(contains[0])}`
          : 'the declared span is NOT contained in, and does not contain, any preregistered region',
    isAVerdict: false,
  };
}

function observeDecision(declared: string, expected: any): NeutralObservation {
  const primary = expected?.expectedAffectedDecision;
  const alts: string[] = expected?.acceptableAlternativeAffectedDecisions ?? [];
  return {
    what: 'declared affectedDecision against the preregistered expectation',
    compared: `declared ${declared}; preregistered ${primary}; acceptable alternatives ${alts.length ? alts.join(', ') : '(none listed)'}`,
    finding: declared === primary ? 'matches the preregistered expectation'
      : alts.includes(declared) ? 'is a preregistered ACCEPTABLE ALTERNATIVE'
        : 'is NEITHER the preregistered expectation NOR any listed acceptable alternative',
    isAVerdict: false,
  };
}

/**
 * Shared vocabulary with a preregistered neighbour. A POINTER ONLY, and a weak one.
 *
 * Two statements about the same machine share words whether or not one substitutes for the other:
 * "the third mounting point carries a bolt" (securement) and "a chuck guard is fitted" (presence)
 * overlap heavily and are DIFFERENT PROPERTIES. High overlap is therefore NOT evidence of
 * substitution, and low overlap is NOT evidence against it. The number is reported so the reviewer
 * knows which neighbour to read first, and for no other purpose.
 */
function observeNeighbours(declaredProperty: string, expected: any): NeutralObservation {
  const neighbours: string[] = expected?.unacceptableNeighbouringProperties ?? [];
  const scored = neighbours
    .map(n => ({ n, o: overlapWith(declaredProperty, n) }))
    .sort((a, b) => b.o - a.o);
  const top = scored[0];
  return {
    what: 'shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK '
      + 'POINTER, NOT EVIDENCE OF SUBSTITUTION',
    compared: `${neighbours.length} neighbour(s) listed`,
    finding: top === undefined ? 'no neighbours listed for this fact'
      : `the neighbour sharing most vocabulary (${(top.o * 100).toFixed(0)}%) is ${JSON.stringify(top.n)}. `
        + 'READ IT AND DECIDE — words in common are not a substitution, and few words in common are '
        + 'not a defence.',
    isAVerdict: false,
  };
}

/** For a NO-GAP row: what does the declared property correspond to in the frozen truth? */
function observeAgainstNoGapTruth(declaredProperty: string, row: any): NeutralObservation {
  const notEstablished: string[] = row.notEstablishedByTheText ?? [];
  const established: string[] = row.establishedByTheText ?? [];
  const nRanked = notEstablished.map(n => ({ n, o: overlapWith(declaredProperty, n) })).sort((a, b) => b.o - a.o);
  const eRanked = established.map(e => ({ e, o: overlapWith(declaredProperty, e) })).sort((a, b) => b.o - a.o);
  return {
    what: 'declared property against a NO-GAP row\'s frozen truth, which preregistered ZERO expected facts',
    compared: `${notEstablished.length} notEstablishedByTheText entr(ies), ${established.length} establishedByTheText entr(ies)`,
    finding: [
      nRanked[0] ? `closest notEstablished entry (${(nRanked[0].o * 100).toFixed(0)}% shared vocabulary): ${JSON.stringify(nRanked[0].n)}` : 'the truth lists nothing as not-established',
      eRanked[0] ? `closest established entry (${(eRanked[0].o * 100).toFixed(0)}%): ${JSON.stringify(eRanked[0].e)}` : '',
      'THE QUESTION FOR THE REVIEWER: is this a genuine uncertainty the preregistered truth failed '
      + 'to capture (a TRUTH_SPECIFICATION_DEFECT), a restatement of something already established, '
      + 'or a real but decision-neutral absence?',
    ].filter(Boolean).join(' — '),
    isAVerdict: false,
  };
}

function observeConjuncts(decl: any, expected: any): NeutralObservation {
  const conjuncts: string[] = expected?.conjuncts ?? [];
  const blob = [decl?.missingFact, decl?.branchA, decl?.branchB, decl?.notEstablishedBecause,
    decl?.decisionIfA, decl?.decisionIfB].filter(Boolean).join(' ');
  const present = conjuncts.map(c => ({ c, o: overlapWith(c, blob) }));
  return {
    what: 'preregistered conjuncts against the full declaration text',
    compared: `${conjuncts.length} conjunct(s)`,
    finding: conjuncts.length <= 1 ? 'the expected fact is not conjunctive'
      : present.map(p => `"${p.c.slice(0, 52)}…" content-word overlap ${(p.o * 100).toFixed(0)}%`).join(' | '),
    isAVerdict: false,
  };
}

// ---------------------------------------------------------------- axis definitions

const ROW_AXES = [
  { id: 'A', name: 'FIRST_PASS_GAP_RECALL',
    question: 'Were ALL genuinely decision-critical unresolved facts declared for this row?',
    whatBearsOnIt: 'the observation text, what it establishes, what it leaves open. A fact is '
      + 'decision-critical only if two materially different answers lead to two different CURRENT '
      + 'outcomes.',
    correctWhen: 'every gap the text genuinely leaves open, and that changes what is done today, was declared',
    incorrectWhen: 'a gap that changes what is done today was not declared at all',
    partialWhen: 'some but not all such gaps were declared',
    mustNotInfluence: 'whether the count matches the preregistered range; how well written the declaration is' },
  { id: 'B', name: 'FIRST_PASS_GAP_PRECISION',
    question: 'Were unnecessary or already-resolved facts avoided?',
    whatBearsOnIt: 'whether each declared fact is genuinely open in the text AND genuinely changes today\'s action',
    correctWhen: 'no declared fact is already established by the text and none is decision-neutral',
    incorrectWhen: 'a declared fact is answered by the text, or both its answers lead to the same action today',
    partialWhen: 'one of several declarations is unnecessary',
    mustNotInfluence: 'whether asking anyway would be harmless or good practice' },
  { id: 'H', name: 'MULTI_GAP_PRESERVATION',
    question: 'Do independent gaps survive INDEPENDENTLY?',
    whatBearsOnIt: 'whether two declared facts are genuinely different facts, and whether settling one leaves the other open',
    correctWhen: 'each declared fact stands alone and would need its own evidence',
    incorrectWhen: 'two declarations restate one gap, or one declaration silently merges two',
    partialWhen: 'both gaps are present but partly conflated',
    mustNotInfluence: 'the structural distinctness of the computed keys — already reported mechanically' },
  { id: 'I', name: 'FALSE_GAP_SUPPRESSION',
    question: 'On a row whose text is sufficient, was an unnecessary owed fact avoided?',
    whatBearsOnIt: 'the matched partner row is named so both can be read together',
    correctWhen: 'no fact was declared, or any declared fact is genuinely open',
    incorrectWhen: 'a fact was declared that the text answers, or that changes nothing today',
    partialWhen: 'a declared fact is marginal rather than clearly false',
    mustNotInfluence: 'that declaring something would have been more thorough' },
];

const FACT_AXES = [
  { id: 'C', name: 'OWED_PROPERTY_SEMANTIC_CORRECTNESS',
    question: 'Does this declaration identify the EXACT property that remains unknown?',
    correctWhen: 'the property named is the one the text leaves open',
    incorrectWhen: 'the property named is a NEIGHBOUR the text already establishes — presence for securement, appearance for function, repair for verification',
    partialWhen: 'the property is in the right area but stated more narrowly or more broadly than the open question',
    mustNotInfluence: 'that OwedFact has no dedicated field for the property; score from missingFact and the whole declaration' },
  { id: 'D', name: 'EVIDENCE_SPAN_SEMANTIC_RELEVANCE',
    question: 'Is the verbatim span actually relevant to WHY this fact is unresolved?',
    correctWhen: 'the span is the text that shows the fact is open, or that makes it matter',
    incorrectWhen: 'the span is verbatim but points at something else',
    partialWhen: 'the span is relevant but a materially better one was available',
    mustNotInfluence: 'span length; deterministic substring validity is already proven and is not the question' },
  { id: 'E', name: 'BRANCH_PLAUSIBILITY',
    question: 'Are branchA and branchB genuinely possible resolutions of THIS exact fact?',
    correctWhen: 'both branches are real possible STATES OF THE WORLD given the observation',
    incorrectWhen: 'a branch is a rhetorical opposite, an invented state the text excludes, or an answer to a different question',
    partialWhen: 'one branch is sound and the other is not',
    mustNotInfluence: 'which branch is more likely' },
  { id: 'F', name: 'DECISION_DIVERGENCE_VALIDITY',
    question: 'Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?',
    correctWhen: 'the two actions differ in what someone would do now',
    incorrectWhen: 'the wording differs but the action is the same, or an action does not follow from its branch',
    partialWhen: 'the actions differ in degree but arguably not in kind',
    mustNotInfluence: 'that the boundary already refused identical strings — it compares bytes, not decisions' },
  { id: 'G', name: 'AFFECTED_DECISION_CORRECTNESS',
    question: 'Is the fact bound to the correct affectedDecision?',
    correctWhen: 'the label names the decision the missing fact actually blocks',
    incorrectWhen: 'the label names a topic rather than the blocked decision',
    partialWhen: 'the label is defensible but a listed alternative fits better',
    mustNotInfluence: 'whether it matches the preregistered one — acceptable alternatives are listed, and the preregistered truth is itself unreviewed' },
  { id: 'L', name: 'VERIFIER_TARGET_BINDING',
    question: 'Does the verifier verdict address the EXACT projected owed fact?',
    correctWhen: 'the verdict is about this fact and no other',
    incorrectWhen: 'it addresses a neighbouring property, a different hazard, or the row in general',
    partialWhen: 'it reaches the right topic but drifts to an adjacent property',
    mustNotInfluence: 'that admission passed — admission is structural. TOPIC REACH IS NOT EXACT BINDING.' },
  { id: 'M', name: 'CLARIFICATION_RESOLUTION_SUFFICIENCY',
    question: 'Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?',
    correctWhen: 'an answer would establish or refute the property',
    incorrectWhen: 'it names the right fact but would be satisfied by evidence that leaves the property open — presence, visibility, a status indicator, a signature',
    partialWhen: 'an answer would narrow the fact without settling it',
    mustNotInfluence: 'how well phrased the question is. TOPIC REACH IS NOT RESOLUTION SUFFICIENCY.' },
  { id: 'N', name: 'GOVERNED_EVIDENCE_QUOTATION_BOUNDARY',
    question: 'Was reliance on a supplied governed record legitimate, and any quotation faithful?',
    correctWhen: 'reliance declared only where the record bears on the fact, and the proposition says what the record says',
    incorrectWhen: 'reliance declared on an off-point record, or the proposition overstates it',
    partialWhen: 'reliance is defensible but the proposition stretches the record',
    mustNotInfluence: 'that admission passed — structural reuse is not semantic validation' },
  { id: 'Q', name: 'OWED_PROPERTY_LOSS_IMPACT',
    question: 'Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?',
    scale: ['NO_OBSERVABLE_LOSS', 'MINOR_WORDING_LOSS', 'TARGET_AMBIGUITY',
      'NEIGHBOURING_PROPERTY_AMBIGUITY', 'CLARIFICATION_INSUFFICIENCY',
      'INCORRECT_VERIFIER_BINDING', 'HUMAN_REVIEW_DIFFICULTY'],
    method: 'compare the first-pass missingFact (shown) against what the verifier actually received '
      + '(the projected OwedFact, which does NOT carry missingFact), then read the verifier verdict, '
      + 'which only ever saw the projected form',
    mustNotInfluence: 'MEASUREMENT ONLY. Does not authorise adding a field or mutating the contract.' },
  { id: 'R', name: 'PRIORITY_FLOOR_IMPACT',
    question: 'How would you classify this fact\'s safety significance, and does the OTHER floor under-escalate it?',
    scale: ['ORDINARY_NON_ESCALATING', 'SAFETY_SIGNIFICANT', 'PLAUSIBLY_LIFE_CRITICAL', 'INDETERMINATE'],
    method: 'classify the fact, then compare against the projected priority, which is OTHER for every fact',
    mustNotInfluence: 'MEASUREMENT ONLY. Does not authorise changing the gate or granting the provider escalation authority.' },
  { id: 'S', name: 'FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half)',
    question: 'Was naming — or not naming — a governed sourceId appropriate for this fact?',
    correctWhen: 'a record that bears on the fact was named, or an off-point record was correctly left unnamed',
    incorrectWhen: 'an off-point record was named, or a record that plainly bears on the fact was ignored',
    mustNotInfluence: 'NOT_EXERCISED for every §199 fact — the capability was never present on a row that reached inference' },
  { id: 'T', name: 'FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING',
    question: 'PRECONDITION FIRST: did the provider-visible treatment contain governed evidence sufficient to judge grounding at all?',
    correctWhen: 'the treatment was sufficient AND the binding is grounded in it',
    incorrectWhen: 'the treatment was sufficient and the binding is nonetheless ungrounded',
    mustNotInfluence: 'CORRECT sourceId SELECTION ALONE IS NEVER ENOUGH FOR T. NOT_EXERCISED for every §199 fact.' },
];

// ---------------------------------------------------------------- assemble

const executedRows = fp.filter(r => r.reachedInference === true && !r.diagnosticRepeat);
const facts = proj.flatMap(p => (p.perDeclaration as any[])
  .filter(d => d.admitted && d.owedFact)
  .map(d => ({ p, d })));

const rowEntries = SECTION_199_COHORT.map(r => {
  const f = fp.find(x => x.rowId === r.rowId && !x.diagnosticRepeat);
  const p = proj.find(x => x.rowId === r.rowId);
  const exercisable = f?.reachedInference === true;
  return {
    rowId: r.rowId,
    provenance: r.provenance,
    section197Origin: r.section197Origin,
    isTransportCanary: r.rowId === TRANSPORT_CANARY_ROW_ID,
    capability: p?.capability ?? (r.verifierGovernedEvidence.length > 0 ? 'PRESENT' : 'ABSENT'),
    pairedWith: r.pairedWith,
    families: r.families,
    ADJUDICABLE: exercisable,
    notAdjudicableReason: exercisable ? null
      : 'this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is '
        + 'NOT_EXERCISED and no semantic judgement is possible or permitted.',

    // 1. the frozen scenario input
    observation: r.observation,
    inspectionContext: { location: r.location, task: r.task, jurisdiction: r.jurisdiction },
    deterministicFindingsShown: r.deterministicFindings,
    governedRecordsShownToFirstPass: r.governedStandards.map(g => ({
      title: g.title, textRenderedWithCitationsRedacted: true })),
    governedSourceIdsShownToFirstPass: r.verifierGovernedEvidence.map(g => g.sourceId),

    // 2. the frozen preregistered truth
    preregisteredEstablishedByTheText: r.establishedByTheText,
    preregisteredNotEstablishedByTheText: r.notEstablishedByTheText,
    preregisteredExpectedGapCount: r.expectedGapCount,
    preregisteredExpectedOwedFacts: r.expectedOwedFacts,
    designIntent: r.designIntent,

    // 3. the raw first-pass output
    modelOutcome: f?.outcome ?? null,
    modelSummary: f?.expertExplanation?.summary ?? null,
    modelUncertainty: f?.uncertainty?.statements ?? [],
    modelHazardCandidates: (f?.hazardCandidates ?? []).map((c: any) => ({
      candidateKey: c.candidateKey, hazardFamily: c.hazardFamily,
      assertedConditionState: c.assertedConditionState, evidenceBasis: c.evidenceBasis })),
    modelClarifications: f?.clarifications ?? [],
    rawDeclarations: f?.rawDeclarations ?? [],

    // 4/5. admitted vs rejected representation, and projection
    admittedFactKeys: (p?.perDeclaration ?? []).filter((d: any) => d.admitted).map((d: any) => d.factKey),
    rejectedDeclarations: (p?.perDeclaration ?? []).filter((d: any) => !d.admitted)
      .map((d: any) => ({ declarationId: d.declarationId, codes: d.codes, detail: d.detail })),

    neutralObservations: exercisable ? [
      { what: 'declaration count against the preregistered range',
        compared: `${p?.rawDeclarationCount ?? 0} raw / ${p?.admittedCount ?? 0} admitted against `
          + `${r.expectedGapCount.min}-${r.expectedGapCount.max}`,
        finding: (p?.admittedCount ?? 0) >= r.expectedGapCount.min && (p?.admittedCount ?? 0) <= r.expectedGapCount.max
          ? 'the admitted count is inside the preregistered range'
          : 'the admitted count is OUTSIDE the preregistered range',
        isAVerdict: false as const },
    ] : [],

    verdicts: {
      A_FIRST_PASS_GAP_RECALL: null, B_FIRST_PASS_GAP_PRECISION: null,
      H_MULTI_GAP_PRESERVATION: null, I_FALSE_GAP_SUPPRESSION: null,
    },
    truthSpecificationDefect: null,
    reviewerNotes: null,
  };
});

const factEntries = facts.map(({ p, d }) => {
  const row = rowOf(p.rowId);
  const raw = (fp.find(x => x.rowId === p.rowId && !x.diagnosticRepeat)?.rawDeclarations ?? [])
    .find((x: any) => x?.declarationId === d.declarationId);
  const v = ver.find(x => x.rowId === p.rowId && x.factKey === d.factKey);
  // Nearest preregistered expectation by property vocabulary. A POINTER for the reviewer, not a match.
  const expectations = row.expectedOwedFacts;
  const ranked = expectations.map(e => ({ e, o: overlapWith(String(raw?.missingFact ?? ''), e.owedProperty) }))
    .sort((a, b) => b.o - a.o);
  const nearest = ranked[0]?.e;
  return {
    rowId: p.rowId,
    factKey: d.factKey,
    declarationId: d.declarationId,
    capability: p.capability,

    // 3. raw declaration, in full
    declaration: raw ?? null,
    // 5. deterministic projection — note missingFact is NOT in it
    projectedOwedFact: d.owedFact,
    missingFactInDeclaration: raw?.missingFact ?? null,
    missingFactInProjectedOwedFact: false,
    whatTheVerifierActuallyReceived: v?.suppliedOwedFact ?? null,

    // 2. the frozen truth this appears closest to
    nearestPreregisteredExpectation: nearest ?? null,
    nearestExpectationNote: 'chosen by content-word overlap as a POINTER for the reviewer. It is '
      + 'NOT a claim that the declaration matches this expectation, and the reviewer should read '
      + 'every expectation for the row.',
    allPreregisteredExpectationsForThisRow: expectations,

    neutralObservations: nearest === undefined
      ? [observeAgainstNoGapTruth(String(raw?.missingFact ?? ''), row),
        { what: 'declared evidenceSpan', compared: 'the row preregistered no expected facts',
          finding: `the declared span is ${JSON.stringify(String(d.owedFact?.evidenceSpan ?? ''))}; `
            + 'there is no preregistered acceptable region to compare it against on a no-gap row',
          isAVerdict: false as const }]
      : [
        observeSpan(String(d.owedFact?.evidenceSpan ?? ''), nearest),
        observeDecision(String(d.owedFact?.affectedDecision ?? ''), nearest),
        observeNeighbours(String(raw?.missingFact ?? ''), nearest),
        observeConjuncts(raw, nearest),
      ],

    // 6/7. verifier
    verifier: v ? {
      reachedInference: v.reachedInference,
      verdict: v.verdict,
      rationale: v.rationale,
      clarificationSourceMode: v.clarificationSourceMode,
      bindingFactKey: v.bindingFactKey,
      proposedClarification: v.proposedClarification,
      owedFactDeclarations: v.owedFactDeclarations,
      regulatoryBasis: v.regulatoryBasis,
      admissionAdmitted: v.admission?.admitted ?? null,
      admissionCodes: v.admission?.codes ?? [],
      governedEvidenceShownToVerifier: row.verifierGovernedEvidence,
    } : { executed: false },

    verifierSubAxes: {
      TARGET_TOPIC_REACH: null,
      EXACT_OWED_PROPERTY_BINDING: null,
      CLARIFICATION_RESOLUTION_SUFFICIENCY: null,
      AFFECTED_DECISION_ALIGNMENT: null,
      BRANCH_DECISION_CONSISTENCY: null,
      CHALLENGE_REVIEWABILITY: null,
      LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION: null,
    },

    verdicts: {
      C_OWED_PROPERTY_SEMANTIC_CORRECTNESS: null,
      D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE: null,
      E_BRANCH_PLAUSIBILITY: null,
      F_DECISION_DIVERGENCE_VALIDITY: null,
      G_AFFECTED_DECISION_CORRECTNESS: null,
      L_VERIFIER_TARGET_BINDING: null,
      M_CLARIFICATION_RESOLUTION_SUFFICIENCY: null,
      N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY: 'NOT_EXERCISED',
      Q_OWED_PROPERTY_LOSS_IMPACT: null,
      R_PRIORITY_FLOOR_IMPACT: null,
      R_SAFETY_CLASSIFICATION: null,
      S_GOVERNED_ID_BINDING_APPROPRIATENESS: 'NOT_EXERCISED',
      T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING: 'NOT_EXERCISED',
    },
    prefilledNotVerdicts: 'N, S and T are prefilled NOT_EXERCISED because the governed capability '
      + 'was never present on a row that reached inference. That is a statement about the RUN, not '
      + 'about the model, and it is the only value those axes may carry.',
    truthSpecificationDefect: null,
    reviewerNotes: null,
  };
});

// The one refused declaration gets its own review object: structural refusal and semantic intent
// are separate questions and the authorization requires them kept apart.
const refusedEntries = proj.flatMap(p => (p.perDeclaration as any[])
  .filter(d => !d.admitted)
  .map(d => {
    const row = rowOf(p.rowId);
    const raw = (fp.find(x => x.rowId === p.rowId && !x.diagnosticRepeat)?.rawDeclarations ?? [])
      .find((x: any) => x?.declarationId === d.declarationId);
    return {
      rowId: p.rowId,
      declarationId: d.declarationId,
      refusalCodes: d.codes,
      refusalDetail: d.detail,
      declaration: raw ?? null,
      preregisteredExpectations: row.expectedOwedFacts,
      twoSeparateQuestions: {
        STRUCTURAL_REFUSAL_CORRECTNESS: null,
        structuralQuestion: 'was the deterministic boundary RIGHT to refuse this declaration whole, '
          + 'given the contract? Nothing was repaired or completed by deterministic code.',
        UNDERLYING_SEMANTIC_INTENT: null,
        semanticQuestion: 'setting the malformation aside, did the model appear to identify a '
          + 'LEGITIMATE unresolved fact? A structurally malformed output can reveal semantic '
          + 'capability or semantic failure, and these must not be collapsed.',
      },
      truthSpecificationDefect: null,
      reviewerNotes: null,
    };
  }));

const worksheet = {
  artifact: 'SECTION_200_ADJUDICATION_WORKSHEET',
  status: 'PENDING_HUMAN_ADJUDICATION',
  writtenBy: 'the §200 session builder. EVERY SEMANTIC VERDICT FIELD IS NULL AND THIS MODEL FILLED NONE.',
  whyNoModelVerdicts: 'the authorization states that no script may manufacture semantic verdicts and '
    + 'requires explicit human review. A verdict supplied by the evaluated component would make it '
    + 'its own examiner.',
  section199PreregistrationSha256: sha(readFileSync(join(E199, 'PREREGISTRATION.json'), 'utf8')),
  TRUTH_PROVENANCE,
  verdictVocabulary: ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'AMBIGUOUS', 'NOT_EXERCISED'],
  additionalOutcome: {
    TRUTH_SPECIFICATION_DEFECT: 'a first-class outcome, not an afterthought. The §199 truth manifest '
      + 'is AI-authored and was never product-owner reviewed, so a divergence between a declaration '
      + 'and an expectation is equally consistent with a defective declaration and a defective '
      + 'expectation. Where the expectation is wrong or underspecified, record the defect here '
      + 'ADDITIVELY — the frozen preregistration is never rewritten, and the model is not forced to '
      + 'fail against bad truth.',
  },
  howToUseTheNeutralObservations: 'each is a byte-level or set-membership comparison whose answer is '
    + 'not in dispute. "The span is not inside any acceptable region" is a FACT; "therefore D is '
    + 'INCORRECT" is a VERDICT, and no observation draws that line. An observation can also be '
    + 'right about the comparison and wrong about what matters, because the truth it compares '
    + 'against is unreviewed.',
  rowAxes: ROW_AXES,
  factAxes: FACT_AXES,
  rows: rowEntries,
  facts: factEntries,
  refusedDeclarations: refusedEntries,
  completeness: {
    rowsRequiringReview: rowEntries.filter(r => r.ADJUDICABLE).length,
    rowsNotAdjudicable: rowEntries.filter(r => !r.ADJUDICABLE).map(r => r.rowId),
    factsRequiringReview: factEntries.length,
    refusedDeclarationsRequiringReview: refusedEntries.length,
    verdictSlotsTotal: 152,
    verdictsSupplied: 0,
    prefilledNotExercised: factEntries.length * 3,
    HUMAN_ADJUDICATION_COMPLETENESS: `0 / 152`,
    STATUS: 'UNMEASURED',
  },
};

writeFileSync(join(E200, 'ADJUDICATION-WORKSHEET.json'), `${JSON.stringify(worksheet, null, 2)}\n`);
console.log(`worksheet written: ${rowEntries.filter(r => r.ADJUDICABLE).length} adjudicable rows, `
  + `${factEntries.length} facts, ${refusedEntries.length} refused declaration(s)`);
console.log(`verdicts supplied by this script: 0`);
void det; void COHORT_COVERAGE; void executedRows;
