/**
 * §208 -- BUILD THE ADJUDICATION WORKSHEET AND PRESENTATION PACKET. ZERO PROVIDER CALLS.
 *
 * ==================== NO PREFILLS, AND WHY THAT IS STRUCTURAL ====================
 *
 * Every slot is created with `verdict: null` and `attribution: null`. There is no code path in this
 * file that writes a verdict, and the frozen §207 protocol forbids showing the deterministic
 * scoring as a suggested answer. §200 recorded ZERO model verdicts on 152 slots for the same
 * reason, and §204's 120 verdicts were all `PRODUCT_OWNER`-attributed. That precedent governs here.
 *
 * ==================== HOW PRODUCED FACTS MAP ONTO FROZEN FACT SLOTS ====================
 *
 * The frozen plan assigns fact-axis sets BY DESIGN -- one set per fact the specification expects.
 * The run produces whatever it produces. The mapping rule, applied mechanically:
 *
 *   produced == expected   slots bind to produced facts in projection order
 *   produced <  expected   the surplus slots are NOT_EXERCISED with the reason recorded. They are
 *                          NOT scored, and the affected gates record a REDUCED DENOMINATOR
 *   produced >  expected   the extra facts are NOT given extra slots -- that would expand the
 *                          instrument mid-adjudication, which §208 forbids. Over-production is
 *                          already measured by row axis B (precision), which is per row. The extra
 *                          facts are preserved in the packet and reported as
 *                          NON_PREREGISTERED_DIAGNOSTIC_OBSERVATION
 *
 * WHICH produced fact corresponds to WHICH expected fact is itself a semantic judgment, so the
 * packet supplies the case's whole frozen truth as reference material and does not assert a pairing.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { FROZEN_TRUTH_CASES } from './lib/expert-207-truth-specification';
import { adjudicationPlan, gateApplicabilityMatrix, instrumentBudget } from './lib/expert-207-gates';
import { preregistrationIdentity } from './lib/expert-207-preregistration';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');
const RECOVERY = join(ROOT, 'verification', 'expert-hazlenz-verifier-recovery-208b-2026-09-08');

/**
 * §208B: where this packet is written, and which verifier evidence it binds to.
 *
 *   default            the §208 packet, built from §208's own (defective-input) verifier evidence
 *   --recovered        the ACCEPTANCE packet, built from the §208B recovered verifier evidence
 *
 * The replacement rule is UNIFORM across all 24 facts. There is no per-fact selection between the
 * two verifier sets and no code path that could make one.
 */
const USE_RECOVERED = process.argv.includes('--recovered');
const OUT_DIR = USE_RECOVERED ? RECOVERY : EVID;
const SUFFIX = USE_RECOVERED ? '208B' : '208';

const readJsonlFrom = (dir: string, name: string): any[] => {
  const p = join(dir, name);
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as any);
};
const readJsonl = (name: string): any[] => readJsonlFrom(EVID, name);

const firstPass = readJsonl('RAW-FIRST-PASS-208.jsonl');
const projectionCorrected = readJsonl('PROJECTION-208-CORRECTED.jsonl');
const projection = projectionCorrected.length > 0
  ? projectionCorrected : readJsonl('PROJECTION-208.jsonl');
const governed = readJsonl('RAW-GOVERNED-208.jsonl');
const verifier = USE_RECOVERED
  ? readJsonlFrom(RECOVERY, 'RAW-VERIFIER-208B.jsonl')
  : readJsonl('RAW-VERIFIER-208.jsonl');

if (USE_RECOVERED && verifier.length === 0) {
  throw new Error('§208B ABORT: --recovered was requested but no recovered verifier evidence '
    + 'exists. Refusing to build an acceptance packet from defective-input evidence.');
}

// ---------------------------------------------------------------- axis definitions, verbatim

/** §200 axis questions, copied verbatim. Not paraphrased, not shortened. */
const ROW_AXIS_QUESTIONS: Record<string, { name: string; question: string }> = {
  A: {
    name: 'FIRST_PASS_GAP_RECALL',
    question: 'Were ALL genuinely decision-critical unresolved facts declared for this row?',
  },
  B: {
    name: 'FIRST_PASS_GAP_PRECISION',
    question: 'Were unnecessary or already-resolved facts avoided?',
  },
  H: {
    name: 'MULTI_GAP_PRESERVATION',
    question: 'Do independent gaps survive INDEPENDENTLY?',
  },
  I: {
    name: 'FALSE_GAP_SUPPRESSION',
    question: 'On a row whose text is sufficient, was an unnecessary owed fact avoided?',
  },
};

const FACT_AXIS_QUESTIONS: Record<string, { name: string; question: string; scale?: string[] }> = {
  C: {
    name: 'OWED_PROPERTY_SEMANTIC_CORRECTNESS',
    question: 'Does this declaration identify the EXACT property that remains unknown?',
  },
  D: {
    name: 'EVIDENCE_SPAN_SEMANTIC_RELEVANCE',
    question: 'Is the verbatim span actually relevant to WHY this fact is unresolved?',
  },
  E: {
    name: 'BRANCH_PLAUSIBILITY',
    question: 'Are branchA and branchB genuinely possible resolutions of THIS exact fact?',
  },
  F: {
    name: 'DECISION_DIVERGENCE_VALIDITY',
    question: 'Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?',
  },
  G: {
    name: 'AFFECTED_DECISION_CORRECTNESS',
    question: 'Is the fact bound to the correct affectedDecision?',
  },
  L: {
    name: 'VERIFIER_TARGET_BINDING',
    question: 'Does the verifier verdict address the EXACT projected owed fact?',
  },
  M: {
    name: 'CLARIFICATION_RESOLUTION_SUFFICIENCY',
    question: 'Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?',
  },
  N: {
    name: 'GOVERNED_EVIDENCE_QUOTATION_BOUNDARY',
    question: 'Was reliance on a supplied governed record legitimate, and any quotation faithful?',
  },
  Q: {
    name: 'OWED_PROPERTY_LOSS_IMPACT',
    question: 'Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?',
    scale: ['NO_OBSERVABLE_LOSS', 'MINOR_WORDING_LOSS', 'TARGET_AMBIGUITY',
      'NEIGHBOURING_PROPERTY_AMBIGUITY', 'CLARIFICATION_INSUFFICIENCY',
      'INCORRECT_VERIFIER_BINDING', 'HUMAN_REVIEW_DIFFICULTY'],
  },
  R_SAFETY: {
    name: 'PRIORITY_FLOOR_IMPACT (safety classification half)',
    question: 'How would you classify this fact\'s safety significance?',
    scale: ['ORDINARY_NON_ESCALATING', 'SAFETY_SIGNIFICANT', 'PLAUSIBLY_LIFE_CRITICAL',
      'INDETERMINATE'],
  },
  R_FLOOR: {
    name: 'PRIORITY_FLOOR_IMPACT (floor half)',
    question: 'Does the OTHER floor under-escalate this fact?',
    scale: ['FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE', 'FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE',
      'INDETERMINATE'],
  },
  S: {
    name: 'FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half)',
    question: 'Was naming — or not naming — a governed sourceId appropriate for this fact?',
  },
  T: {
    name: 'FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING',
    question: 'PRECONDITION FIRST: did the provider-visible treatment contain governed evidence '
      + 'sufficient to judge grounding at all?',
  },
};

const VERDICT_VOCABULARY = ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'AMBIGUOUS',
  'NOT_EXERCISED'];

// ---------------------------------------------------------------- slots

interface Slot {
  slotId: string;
  kind: 'ROW_AXIS' | 'FACT_AXIS';
  caseId: string;
  factOrdinal: number | null;
  factKey: string | null;
  axisId: string;
  axisName: string;
  question: string;
  allowedVocabulary: string[];
  contributesToGates: string[];
  /** Set ONLY where the run gave the slot no opportunity. Never a scored value. */
  structuralNotExercised: string | null;
  /**
   * A disclosure the adjudicator must read before judging this slot. NEVER a suggested answer and
   * never a semantic hint -- it states a measured property of the evidence, not a verdict.
   */
  fidelityDisclosure: string | null;
  /**
   * Set where the run produced a different number of facts than the frozen design expected, so the
   * mechanical binding of this slot to a produced fact may need the adjudicator to re-bind it.
   */
  pairingNote: string | null;
  verdict: null;
  attribution: null;
  recordedAt: null;
}

const plan = adjudicationPlan();
const matrix = gateApplicabilityMatrix();

/** Which gates a given axis on a given case feeds. Derived from the frozen matrix, not invented. */
function gatesForAxis(caseId: string, axis: string): string[] {
  const c = FROZEN_TRUTH_CASES.find(x => x.caseId === caseId);
  const row = matrix.find(m => m.caseId === caseId);
  if (c === undefined || row === undefined) return [];
  const g: string[] = [];
  const has = (id: string): boolean => row.gateIds.includes(id);
  if (axis === 'A' && has('G1')) g.push('G1');
  if ((axis === 'A' || axis === 'H') && has('G2')) g.push('G2');
  if ((axis === 'A' || axis === 'B') && has('G3')) g.push('G3');
  if ((axis === 'B' || axis === 'I') && has('G4')) g.push('G4');
  if ((axis === 'C' || axis === 'E') && has('G5')) g.push('G5');
  if (axis === 'L' && has('G6')) g.push('G6');
  if (axis === 'M' && has('G7')) g.push('G7');
  if ((axis === 'M' || axis === 'Q') && has('G8')) g.push('G8');
  if (axis === 'F' && has('G9')) g.push('G9');
  if (axis === 'N' && has('G12')) g.push('G12');
  if ((axis === 'N' || axis === 'S' || axis === 'T') && has('G14')) g.push('G14');
  if ((axis === 'R_SAFETY' || axis === 'R_FLOOR') && has('G15')) g.push('G15');
  return g;
}

const slots: Slot[] = [];
const diagnostics: Array<{ caseId: string; observation: string }> = [];

for (const p of plan) {
  const c = FROZEN_TRUTH_CASES.find(x => x.caseId === p.caseId);
  if (c === undefined) throw new Error(`§208: unknown case ${p.caseId}`);
  const pr = projection.find(r => r.caseId === p.caseId);
  const producedFacts = ((pr?.perDeclaration ?? []) as any[]).filter(d => d.admitted === true);

  for (const axis of p.rowAxes) {
    slots.push({
      slotId: `${p.caseId}.ROW.${axis}`,
      kind: 'ROW_AXIS',
      caseId: p.caseId,
      factOrdinal: null,
      factKey: null,
      axisId: axis,
      axisName: ROW_AXIS_QUESTIONS[axis].name,
      question: ROW_AXIS_QUESTIONS[axis].question,
      allowedVocabulary: VERDICT_VOCABULARY,
      contributesToGates: gatesForAxis(p.caseId, axis),
      structuralNotExercised: null,
      fidelityDisclosure: null,
      pairingNote: producedFacts.length === p.factAxisSets.length ? null
        : `the run produced ${producedFacts.length} admitted fact(s) where the frozen design `
          + `expected ${p.factAxisSets.length}. Row axes A and B are where that difference is `
          + 'judged.',
      verdict: null,
      attribution: null,
      recordedAt: null,
    });
  }

  p.factAxisSets.forEach((axes, i) => {
    const produced = producedFacts[i];
    const missing = produced === undefined;
    for (const axis of axes) {
      const def = FACT_AXIS_QUESTIONS[axis];
      slots.push({
        slotId: `${p.caseId}.FACT${i + 1}.${axis}`,
        kind: 'FACT_AXIS',
        caseId: p.caseId,
        factOrdinal: i + 1,
        factKey: missing ? null : (produced.factKey as string),
        axisId: axis,
        axisName: def.name,
        question: def.question,
        allowedVocabulary: def.scale ?? VERDICT_VOCABULARY,
        contributesToGates: gatesForAxis(p.caseId, axis),
        structuralNotExercised: missing
          ? `the frozen design expected ${p.factAxisSets.length} projected fact(s) on this case and `
            + `the run produced ${producedFacts.length}. This slot has no fact to judge. It is `
            + 'NOT_EXERCISED with the reason recorded, is NOT scored, and REDUCES the denominator '
            + 'of every gate it feeds.'
          : null,
        fidelityDisclosure: axis === 'L'
          ? (USE_RECOVERED
            ? 'AXIS L PROVENANCE: this verdict comes from the §208B RECOVERED verifier evidence, '
              + 'executed against the frozen §208 first-pass outputs with the hazard-candidate '
              + 'block correctly populated and the §199 provider envelope. The §208 verifier '
              + 'outputs are DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and are NOT an input to this '
              + 'judgment. The §208 fidelity limitation does not apply here.'
            : 'AXIS L FIDELITY DISCLOSURE (executor defect register entry 3): every verifier call '
              + 'in this run received an EMPTY hazard-candidate block, because the executor read '
              + 'the persisted field name out of the parsed payload. The observation, the '
              + 'clarifications, the uncertainty, the summary and the FULL owed fact were all '
              + 'supplied correctly. THIS EVIDENCE IS SUPERSEDED BY §208B AND MUST NOT BE '
              + 'ADJUDICATED.')
          : null,
        pairingNote: producedFacts.length === p.factAxisSets.length ? null
          : `the run produced ${producedFacts.length} admitted fact(s) where the frozen design `
            + `expected ${p.factAxisSets.length}. This slot is bound MECHANICALLY to produced fact `
            + `${i + 1} in projection order; confirm that pairing against the frozen truth before `
            + 'judging, and re-bind it if the correspondence is different.',
        verdict: null,
        attribution: null,
        recordedAt: null,
      });
    }
  });

  if (producedFacts.length > p.factAxisSets.length) {
    diagnostics.push({
      caseId: p.caseId,
      observation: `the run produced ${producedFacts.length} admitted facts where the frozen design `
        + `expected ${p.factAxisSets.length}. The surplus facts are NOT given extra fact-axis slots `
        + '— that would expand the instrument mid-adjudication. Over-production is measured by row '
        + 'axis B, which is per row. The surplus facts are preserved in the packet in full.',
    });
  }
}

// ---------------------------------------------------------------- worksheet

const budget = instrumentBudget();
const worksheet = {
  artifact: USE_RECOVERED
    ? 'SECTION_208B_ACCEPTANCE_ADJUDICATION_WORKSHEET'
    : 'SECTION_208_ADJUDICATION_WORKSHEET',
  verifierEvidenceSource: USE_RECOVERED
    ? 'ACCEPTANCE_VERIFIER_EVIDENCE — verification/expert-hazlenz-verifier-recovery-208b-2026-09-08/'
      + 'RAW-VERIFIER-208B.jsonl. Applied UNIFORMLY across all 24 facts; no per-fact selection '
      + 'between the original and recovered sets exists or is possible.'
    : 'DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE — superseded by §208B and not for adjudication',
  preregistrationIdentity: preregistrationIdentity(),
  status: 'OPEN — ZERO VERDICTS SUPPLIED',
  whyNoModelVerdicts:
    'every verdict must carry PRODUCT_OWNER attribution. No agent may supply one, no default '
    + 'supplies one, and no code path in the builder writes one. The deterministic scoring is '
    + 'evidence in the packet and is never shown as a suggested answer.',
  verdictVocabulary: VERDICT_VOCABULARY,
  attributionRequired: 'PRODUCT_OWNER',
  frozenBudget: budget,
  slotCount: slots.length,
  slotsWithNoOpportunity: slots.filter(s => s.structuralNotExercised !== null).length,
  openSlotCount: slots.filter(s => s.verdict === null).length,
  suppliedVerdictCount: 0,
  ambiguityRule:
    'AMBIGUOUS is never a pass. On a hard-gate slot it makes the gate UNDETERMINED, which blocks '
    + 'acceptance exactly as FAILED does.',
  notExercisedRule:
    'permitted only where the design targeted an axis and the opportunity did not materialise, with '
    + 'a recorded reason. A vacuous CORRECT is forbidden. A NOT_EXERCISED on a hard-gate slot '
    + 'reduces that gate denominator; below the preregistered minimum the gate is '
    + 'COVERAGE_INSUFFICIENT, which is not a pass.',
  nonPreregisteredDiagnosticObservations: diagnostics,
  fidelityDisclosures: USE_RECOVERED
    ? [
      'The §208 executor defect 3 (empty hazard-candidate block) is REMEDIED, not caveated: the '
      + '§208B recovery re-executed all 24 verifier calls against the frozen first-pass outputs '
      + 'with the candidate block populated. Axis L and gate G6 are adjudicated from that evidence.',
    ]
    : [
      'EXECUTOR DEFECT 3: every verifier call received an empty hazard-candidate block. This '
      + 'worksheet is superseded by the §208B acceptance worksheet and must not be adjudicated.',
    ],
  slots,
  generatedAt: new Date().toISOString(),
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, `ADJUDICATION-WORKSHEET-${SUFFIX}.json`),
  `${JSON.stringify(worksheet, null, 2)}\n`);

// ---------------------------------------------------------------- presentation packet

const md: string[] = [];
md.push(USE_RECOVERED
  ? '# §208B — ACCEPTANCE ADJUDICATION PRESENTATION PACKET'
  : '# §208 — ADJUDICATION PRESENTATION PACKET (SUPERSEDED BY §208B)');
if (USE_RECOVERED) {
  md.push('');
  md.push('**Verifier evidence: `ACCEPTANCE_VERIFIER_EVIDENCE` from the §208B recovery.** The §208 '
    + 'verifier outputs are `DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE` and are not an input to any '
    + 'judgment here. The replacement is uniform across all 24 facts.');
}
md.push('');
md.push(`Preregistration identity \`${preregistrationIdentity()}\`. `
  + `${slots.length} slots, **zero verdicts supplied**.`);
md.push('');
md.push('**The evidence lives ONCE, here.** The worksheet holds identity and slots only, so the two '
  + 'artifacts cannot drift into disagreeing copies of the same bytes.');
md.push('');
md.push('**Read in this order, per case:** the frozen observation → the frozen truth → what the run '
  + 'actually produced → then form the verdict. The deterministic scoring is evidence, not a '
  + 'suggested answer, and no slot carries a prefill.');
md.push('');

for (const c of FROZEN_TRUTH_CASES) {
  const fp = firstPass.find(r => r.caseId === c.caseId);
  const pr = projection.find(r => r.caseId === c.caseId);
  const gv = governed.find(r => r.caseId === c.caseId);
  const vers = verifier.filter(r => r.caseId === c.caseId);
  const caseSlots = slots.filter(s => s.caseId === c.caseId);
  const parsed = (fp?.parsed ?? {}) as any;
  const decls = Array.isArray(parsed.unresolvedFactDeclarations)
    ? parsed.unresolvedFactDeclarations as any[] : [];

  md.push('---');
  md.push('');
  md.push(`## ${c.caseId} — ${c.block} — frozen class **${c.caseSafetyClassification}**`);
  md.push('');
  md.push(`**Slots on this case:** ${caseSlots.map(s => s.slotId.split('.').slice(1).join('.'))
    .join(', ')}`);
  md.push('');
  md.push('### 1. Frozen observation supplied');
  md.push('');
  md.push(`> ${c.observation}`);
  md.push('');
  md.push('### 2. Frozen truth (authored and hashed before this run)');
  md.push('');
  md.push(`- **expected owed facts:** ${c.expectedOwedFactCount.min}–${c.expectedOwedFactCount.max}`);
  for (const f of c.expectedOwedFacts) {
    md.push(`- **${f.factId}** (${f.safetyClassification}): ${f.owedProperty}`);
    md.push(`  - conjuncts: ${f.conjuncts.map(x => `“${x}”`).join('; ')}`);
    md.push(`  - essential qualifiers: ${f.essentialQualifiers.join(' · ')}`);
    md.push(`  - acceptable partition: ${f.acceptableBranchPartition.join(' | ')}`);
    md.push(`  - affectedDecision: ${f.expectedAffectedDecision}`
      + (f.acceptableAlternativeAffectedDecisions.length > 0
        ? ` (alt: ${f.acceptableAlternativeAffectedDecisions.join(', ')})` : ''));
    md.push(`  - PROHIBITED decision claims: ${f.prohibitedDecisionClaims.join(' // ')}`);
    md.push(`  - a sufficient clarification must establish: ${f.clarificationMustEstablish}`);
    md.push(`  - unacceptable neighbours: ${f.unacceptableNeighbouringProperties.join(' · ')}`);
  }
  for (const t of c.falseGapTraps) {
    md.push(`- **false-gap trap ${t.trapId}:** ${t.apparentGap} — `
      + `${t.whyItIsNotALegitimateUnresolvedFact}`);
  }
  if (c.governed !== null) {
    md.push(`- **governed:** supplied ${c.governed.suppliedSourceIds.join(', ')}; bearing = `
      + `${c.governed.records.filter(r => r.bearsOnFactIds.length > 0).map(r => r.sourceId)
        .join(', ') || 'NONE'}`);
    md.push(`  - requires restraint: ${c.governed.requiresRestraint.join(' // ')}`);
  }
  md.push('');
  md.push('### 3. What the run actually produced');
  md.push('');
  md.push(`- provider outcome: \`${String(fp?.failureClass ?? 'NOT_EXECUTED')}\`, stop reason `
    + `\`${String(fp?.stopReason ?? '-')}\`, declarations ${decls.length}, admitted `
    + `${String(pr?.admittedCount ?? 0)}, refused ${String(pr?.refusedCount ?? 0)}, RR-7 preserved `
    + `${String(pr?.rr7?.preservedCount ?? 0)}, safetyStateComplete `
    + `${String(pr?.rr7?.safetyStateComplete ?? '-')}, totalLossOnThisRow `
    + `${String(pr?.rr7?.totalLossOnThisRow ?? '-')}`);
  md.push('');
  if (typeof parsed?.expertExplanation?.summary === 'string') {
    md.push(`**Model summary.** ${parsed.expertExplanation.summary}`);
    md.push('');
  }
  if (decls.length === 0) {
    md.push('**The model declared NO unresolved facts on this case.**');
    md.push('');
  }
  decls.forEach((d: any, i: number) => {
    const per = ((pr?.perDeclaration ?? []) as any[])
      .find(x => x.declarationId === d?.declarationId);
    md.push(`#### produced declaration ${i + 1} — \`${String(d?.declarationId ?? '?')}\` — `
      + `${per?.admitted === true ? `ADMITTED as \`${String(per.factKey)}\`` : 'REFUSED'}`);
    if (per?.admitted !== true) {
      md.push(`- refusal codes: ${((per?.codes ?? []) as string[]).join(', ')}`);
      md.push(`- refusal detail: ${((per?.detail ?? []) as string[]).join(' // ')}`);
    }
    md.push(`- **missingFact:** ${String(d?.missingFact ?? '')}`);
    md.push(`- **affectedDecision:** ${String(d?.affectedDecision ?? '')}`);
    md.push(`- **observationSpan:** “${String(d?.observationSpan ?? '')}”`);
    md.push(`- **whyUnresolved:** ${String(d?.whyUnresolved ?? '')}`);
    md.push(`- **branchA:** ${String(d?.branchA ?? '')}`);
    md.push(`- **branchB:** ${String(d?.branchB ?? '')}`);
    md.push(`- **decisionIfA:** ${String(d?.decisionIfA ?? '')}`);
    md.push(`- **decisionIfB:** ${String(d?.decisionIfB ?? '')}`);
    md.push('');
  });
  const clars = Array.isArray(parsed.decisionCriticalClarifications)
    ? parsed.decisionCriticalClarifications as any[] : [];
  if (clars.length > 0) {
    md.push('#### clarifications the model asked');
    for (const q of clars) {
      md.push(`- \`${String(q?.clarificationId ?? '')}\` (${String(q?.affectedDecision ?? '')}, `
        + `${String(q?.criticality ?? '')}): ${String(q?.question ?? '')}`);
    }
    md.push('');
  }
  if (((pr?.rr7?.preserved ?? []) as any[]).length > 0) {
    md.push('#### RR-7 preserved records (fail-closed, nothing invented)');
    for (const p of (pr.rr7.preserved as any[])) {
      md.push(`- identified property: ${String(p?.identifiedProperty ?? '')}`);
      md.push(`  - absent required fields: ${((p?.absentRequiredFields ?? []) as string[]).join(', ')}`);
      md.push(`  - present fields: ${((p?.presentFields ?? []) as string[]).join(', ')}`);
    }
    md.push('');
  }
  for (const v of vers) {
    md.push(`#### verifier verdict for \`${String(v.factKey)}\``);
    md.push(`- verdict: **${String((v.parsed as any)?.verdict ?? '-')}**`);
    md.push(`- bindingFactKey: ${String((v.parsed as any)?.bindingFactKey ?? '-')}`);
    md.push(`- rationale: ${String((v.parsed as any)?.rationale ?? '-')}`);
    const ac = (v.parsed as any)?.acceptedClarification;
    if (ac !== undefined && ac !== null) md.push(`- accepted clarification: ${JSON.stringify(ac)}`);
    md.push(`- admission: ${JSON.stringify((v.admission as any)?.codes ?? null)}`);
    md.push('');
  }
  if (gv !== undefined) {
    md.push('#### governed stage');
    if (gv.recordKind === 'GOVERNED_STAGE_NOT_CALLED') {
      md.push(`- NOT CALLED — ${String(gv.reason)}`);
    } else {
      md.push(`- supplied ids: ${((gv.suppliedSourceIds ?? []) as string[]).join(', ')}`);
      md.push(`- minted references: ${JSON.stringify(gv.mintedReferences ?? [])}`);
      md.push(`- returned top-level keys: ${((gv.topLevelKeys ?? []) as string[]).join(', ')}`);
      md.push(`- bindings: ${JSON.stringify((gv.parsed as any)?.bindings ?? null, null, 1)}`);
    }
    md.push('');
  }
  md.push('### 4. Slots to judge on this case');
  md.push('');
  md.push('| slot | axis | question | gates | opportunity |');
  md.push('|---|---|---|---|---|');
  for (const s of caseSlots) {
    md.push(`| \`${s.slotId}\` | ${s.axisId} ${s.axisName} | ${s.question} | `
      + `${s.contributesToGates.join(', ') || '—'} | `
      + `${s.structuralNotExercised === null ? 'present' : 'NO OPPORTUNITY — see worksheet'} |`);
  }
  md.push('');
}

writeFileSync(join(OUT_DIR, `ADJUDICATION-PRESENTATION-PACKET-${SUFFIX}.md`),
  `${md.join('\n')}\n`);

console.log('================ §208 ADJUDICATION PACKET');
console.log(`  slots                 : ${slots.length} (frozen budget ${budget.totalJudgments})`);
console.log(`  verdicts supplied     : 0`);
console.log(`  slots with no opportunity: ${worksheet.slotsWithNoOpportunity}`);
console.log(`  diagnostic observations  : ${diagnostics.length}`);
console.log(`  wrote ADJUDICATION-WORKSHEET-${SUFFIX}.json and `
  + `ADJUDICATION-PRESENTATION-PACKET-${SUFFIX}.md into ${OUT_DIR}`);
console.log('  provider calls: 0   database operations: 0');
