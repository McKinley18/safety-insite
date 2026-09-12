/**
 * §209 -- BUILD THE PRODUCT-OWNER ADJUDICATION SESSION. ZERO PROVIDER CALLS. ZERO DATABASE OPS.
 *
 * ==================== WHAT THIS PRODUCES, AND THE SPLIT BETWEEN THEM ====================
 *
 *   ADJUDICATION-WORKSHEET-209.json     THE MACHINE FILE. Carries the slots, their gate linkage and
 *                                       the recording metadata. Read by the recorder, the
 *                                       completeness check and the gate computation. NOT the
 *                                       document the product owner reads while judging.
 *
 *   ADJUDICATION-SESSION-209.md         THE HUMAN FILE. Carries only what the §209 authorization
 *                                       permits a product owner to see WHILE SUPPLYING JUDGMENTS.
 *
 * ==================== WHY THE SPLIT EXISTS ====================
 *
 * §209 forbids exposing, during adjudication: a machine-suggested verdict, an aggregate running
 * score, a provisional gate outcome, a count of failures so far, or whether a particular answer
 * would cause overall acceptance failure.
 *
 * The §208/§208B presentation packet listed, per slot, the gates that slot feeds. That was useful
 * for review and is WRONG HERE. It is now known that G6's coverage headroom is one slot, so a
 * reader who can see "this slot feeds G6" can also see that a single NOT_EXERCISED there decides a
 * hard gate. That is precisely "whether a particular answer would cause overall acceptance
 * failure", and it steers. The gate linkage is retained in the machine file, where the gate
 * computation needs it, and removed from the human file, where it would bias the judgment.
 *
 * The session document therefore carries, per slot: the case, the exact frozen observation and
 * supplied context, the frozen truth relevant to that slot, the authoritative model output, the
 * authoritative §208B verifier output, governed evidence where applicable, the exact axis question,
 * the permitted verdict values, and the frozen §200 adjudication instructions verbatim. Nothing
 * else.
 *
 * ==================== WHAT THIS FILE MAY NOT DO ====================
 *
 * It writes no verdict and no attribution. Every slot is emitted with `verdict: null` and
 * `attribution: null`, and there is no code path here that could set either. Only
 * `record-209-verdict.ts` writes a verdict, and only with PRODUCT_OWNER attribution.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { FROZEN_TRUTH_CASES } from './lib/expert-207-truth-specification';
import { preregistrationIdentity } from './lib/expert-207-preregistration';
import { AXIS_GUIDANCE } from './lib/section-209-axis-guidance';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');
const RECOVERY = join(ROOT, 'verification', 'expert-hazlenz-verifier-recovery-208b-2026-09-08');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-frozen-cohort-adjudication-209-2026-09-08');

const readJsonl = (dir: string, name: string): any[] => {
  const p = join(dir, name);
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as any);
};

/**
 * THE SLOT SOURCE OF TRUTH. The §208B acceptance worksheet was built from the frozen §207 plan and
 * is already bound to the recovered verifier evidence. Reading it rather than re-deriving the slots
 * means there is no second slot constructor that could disagree with the first.
 */
const acceptanceWorksheet = JSON.parse(
  readFileSync(join(RECOVERY, 'ADJUDICATION-WORKSHEET-208B.json'), 'utf8')) as any;

if (acceptanceWorksheet.artifact !== 'SECTION_208B_ACCEPTANCE_ADJUDICATION_WORKSHEET') {
  throw new Error('§209 ABORT: the slot source is not the §208B acceptance worksheet.');
}
if (acceptanceWorksheet.suppliedVerdictCount !== 0) {
  throw new Error('§209 ABORT: the acceptance worksheet already carries verdicts. §209 must begin '
    + 'from an unadjudicated instrument.');
}

const firstPass = readJsonl(EVID, 'RAW-FIRST-PASS-208.jsonl');
const projection = readJsonl(EVID, 'PROJECTION-208-CORRECTED.jsonl');
const governed = readJsonl(EVID, 'RAW-GOVERNED-208.jsonl');
const verifier = readJsonl(RECOVERY, 'RAW-VERIFIER-208B.jsonl')
  .filter(r => r.recordKind === 'ACCEPTANCE_VERIFIER_EVIDENCE');

if (verifier.length !== 24) {
  throw new Error(`§209 ABORT: expected 24 ACCEPTANCE_VERIFIER_EVIDENCE records, found `
    + `${verifier.length}. The authoritative verifier evidence is incomplete.`);
}

// ---------------------------------------------------------------- frozen §200 instructions

// The frozen §200 axis guidance now lives in lib/section-209-axis-guidance.ts, imported above,
// so the session document and the §209B/§209C review files cannot present different instructions.

// ---------------------------------------------------------------- worksheet

const slots = (acceptanceWorksheet.slots as any[]).map(s => ({
  ...s,
  verdict: null,
  attribution: null,
  recordedAt: null,
  recordedInBatch: null,
  revisionOf: null,
  reason: null,
}));

const worksheet = {
  artifact: 'SECTION_209_PRODUCT_OWNER_ADJUDICATION_WORKSHEET',
  status: 'OPEN — ZERO PRODUCT_OWNER VERDICTS SUPPLIED',
  preregistrationIdentity: preregistrationIdentity(),
  slotSource: 'ADJUDICATION-WORKSHEET-208B.json — the §208B acceptance worksheet, read rather than '
    + 're-derived, so no second slot constructor can disagree with the first',
  authoritativeEvidence: {
    firstPass: 'RAW-FIRST-PASS-208.jsonl (§208, frozen, byte-untouched)',
    projection: 'PROJECTION-208-CORRECTED.jsonl (§208, the Defect-1 corrected deterministic derivation)',
    governedStage: 'RAW-GOVERNED-208.jsonl (§208)',
    verifier: 'RAW-VERIFIER-208B.jsonl (§208B recovered) — ACCEPTANCE_VERIFIER_EVIDENCE',
    verifierNotUsed: 'RAW-VERIFIER-208.jsonl (§208) — DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE, not an '
      + 'input to any judgment here',
  },
  attributionRequired: 'PRODUCT_OWNER',
  whoMayWriteAVerdict:
    'ONLY a product owner, through record-209-verdict.ts. No agent, deterministic scorer, '
    + 'heuristic, language model or code path may write one. This builder writes none and has no '
    + 'code path that could.',
  verdictVocabulary: acceptanceWorksheet.verdictVocabulary,
  frozenBudget: acceptanceWorksheet.frozenBudget,
  slotCount: slots.length,
  slotsWithNoOpportunity: slots.filter((s: any) => s.structuralNotExercised !== null).length,
  suppliedVerdictCount: 0,
  ambiguityRule: acceptanceWorksheet.ambiguityRule,
  notExercisedRule: acceptanceWorksheet.notExercisedRule,
  nonPreregisteredDiagnosticObservations:
    acceptanceWorksheet.nonPreregisteredDiagnosticObservations,
  slots,
  generatedAt: new Date().toISOString(),
};

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'ADJUDICATION-WORKSHEET-209.json'), `${JSON.stringify(worksheet, null, 2)}\n`);

// ---------------------------------------------------------------- session document

const md: string[] = [];
md.push('# §209 — PRODUCT-OWNER ADJUDICATION SESSION');
md.push('');
md.push(`Preregistration identity \`${preregistrationIdentity()}\`. `
  + `${slots.length} slots. **Zero verdicts supplied.**`);
md.push('');
md.push('**Verifier evidence is the §208B recovered set (`ACCEPTANCE_VERIFIER_EVIDENCE`).** The '
  + '§208 verifier outputs are `DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE` and appear nowhere in this '
  + 'document.');
md.push('');
md.push('## How to use this document');
md.push('');
md.push('Cases appear in the frozen instrument order and must be judged in it. Within a case, read '
  + 'in this order: the frozen observation → the frozen truth → what the run produced → the '
  + 'verifier result → then form the verdict for each slot.');
md.push('');
md.push('**Every verdict must be recorded through `record-209-verdict.ts`, which accepts '
  + '`PRODUCT_OWNER` attribution and nothing else.** Verdicts are appended to '
  + '`VERDICT-LEDGER-209.jsonl`; a conflicting rewrite is refused unless it carries an explicit '
  + 'revision flag and a reason, and both values are retained.');
md.push('');
md.push('### What this document deliberately does not tell you');
md.push('');
md.push('No suggested verdict. No running score. No provisional gate outcome. No count of failures '
  + 'so far. **No indication of which gates a slot feeds**, or whether any particular answer would '
  + 'cause acceptance to fail. The §208/§208B packets listed per-slot gate linkage; that is removed '
  + 'here, because it is now known that one hard gate has a coverage headroom of a single slot, and '
  + 'a reader who can see which slot that is can see what answer would decide it. The linkage is '
  + 'retained in the machine worksheet, where the gate computation needs it and cannot be '
  + 'influenced by it.');
md.push('');
md.push('The deterministic structural findings shown per case — declaration counts, admission, '
  + 'refusal codes, RR-7 preservation — are **evidence**, not a score and not a suggested answer.');
md.push('');
md.push('### Verdict vocabulary and the two rules that are easiest to break');
md.push('');
md.push(`Permitted values: ${(worksheet.verdictVocabulary as string[]).map(v => `\`${v}\``).join(' · ')}`);
md.push('');
md.push(`- **AMBIGUOUS is never a pass.** ${String(worksheet.ambiguityRule)}`);
md.push(`- **NOT_EXERCISED is never a pass.** ${String(worksheet.notExercisedRule)}`);
md.push('');
md.push('Do not choose CORRECT or INCORRECT merely to make a gate determinate. AMBIGUOUS is a '
  + 'legitimate answer and the instrument is built to carry it.');
md.push('');

for (const c of FROZEN_TRUTH_CASES) {
  const fp = firstPass.find(r => r.caseId === c.caseId);
  const pr = projection.find(r => r.caseId === c.caseId);
  const gv = governed.find(r => r.caseId === c.caseId);
  const vers = verifier.filter(r => r.caseId === c.caseId);
  const caseSlots = slots.filter((s: any) => s.caseId === c.caseId);
  const parsed = (fp?.parsed ?? {}) as any;
  const decls = Array.isArray(parsed.unresolvedFactDeclarations)
    ? parsed.unresolvedFactDeclarations as any[] : [];

  md.push('---');
  md.push('');
  md.push(`## ${c.caseId} — ${c.block}`);
  md.push('');
  md.push(`Frozen safety classification: **${c.caseSafetyClassification}**. `
    + `Slots on this case: ${caseSlots.length}.`);
  md.push('');
  md.push('### 1. Frozen observation and supplied context');
  md.push('');
  md.push(`*${c.location} — ${c.task}. Jurisdiction ${c.jurisdiction}. `
    + `Hazard families supplied: ${c.allowedHazardFamilies.join(', ')}.*`);
  md.push('');
  md.push(`> ${c.observation}`);
  md.push('');
  md.push('**Established by the text:**');
  for (const s of c.establishedByTheText) md.push(`- ${s}`);
  md.push('');
  md.push('**Not established by the text:**');
  for (const s of c.notEstablishedByTheText) md.push(`- ${s}`);
  md.push('');
  if (c.governed !== null) {
    md.push('**Governed evidence supplied to the governed stage:**');
    for (const r of c.governed.records) {
      md.push(`- \`${r.sourceId}\` — ${r.bearsOnFactIds.length > 0
        ? `frozen as BEARING on ${r.bearsOnFactIds.join(', ')}` : 'frozen as OFF POINT'}`);
      md.push(`  > ${r.text}`);
    }
    md.push('');
    md.push('**Frozen authority boundary:**');
    for (const s of c.governed.authorityBoundary) md.push(`- ${s}`);
    md.push('**Frozen restraint requirement:**');
    for (const s of c.governed.requiresRestraint) md.push(`- ${s}`);
    md.push('');
  }

  md.push('### 2. Frozen truth for this case');
  md.push('');
  md.push(`**Expected owed facts: ${c.expectedOwedFactCount.min}–${c.expectedOwedFactCount.max}.**`);
  md.push('');
  md.push('**Decision-critical safety properties:**');
  for (const p of c.expectedProperties) {
    md.push(`- **${p.propertyId}** [${p.status}${p.decisionCritical ? ', DECISION-CRITICAL' : ''}] `
      + `${p.statement}`);
    md.push(`  - *why:* ${p.why}`);
  }
  md.push('');
  for (const f of c.expectedOwedFacts) {
    md.push(`**Frozen owed fact \`${f.factId}\`** (${f.safetyClassification})`);
    md.push('');
    md.push(`- **owed property:** ${f.owedProperty}`);
    md.push(`- **conjuncts, all of which must survive:** ${f.conjuncts.map(x => `“${x}”`).join('; ')}`);
    if (f.independentOf.length > 0) {
      md.push(`- **independent of ${f.independentOf.join(', ')}** — settling those leaves this open; `
        + `it may not be collapsed into ${f.mayNotBeCollapsedInto.join(', ')}`);
    }
    md.push(`- **affectedDecision:** ${f.expectedAffectedDecision}`
      + (f.acceptableAlternativeAffectedDecisions.length > 0
        ? ` — acceptable alternatives: ${f.acceptableAlternativeAffectedDecisions.join(', ')}`
        : ' — no acceptable alternative'));
    md.push('- **essential qualifiers that must survive:**');
    for (const q of f.essentialQualifiers) md.push(`  - ${q}`);
    md.push('- **acceptable branch partition:**');
    for (const b of f.acceptableBranchPartition) md.push(`  - ${b}`);
    md.push('- **what is done today under each state:**');
    for (const d of f.decisionChangeUnderEachState) md.push(`  - *${d.state}* → ${d.decisionToday}`);
    md.push('- **PROHIBITED decision claims:**');
    for (const x of f.prohibitedDecisionClaims) md.push(`  - ${x}`);
    md.push('- **evidence that would settle it:**');
    for (const e of f.acceptableEvidenceToSettle) md.push(`  - ${e}`);
    md.push(`- **a sufficient clarification must establish:** ${f.clarificationMustEstablish}`);
    md.push('- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**');
    for (const n of f.unacceptableNeighbouringProperties) md.push(`  - ${n}`);
    md.push('');
  }
  md.push('**False-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**');
  for (const t of c.falseGapTraps) {
    md.push(`- **${t.trapId} — ${t.apparentGap}.** ${t.whyItIsNotALegitimateUnresolvedFact}`);
  }
  md.push('');
  if (c.temporalOrSequenceRequirements.length > 0) {
    md.push('**Frozen temporal / sequence requirements:**');
    for (const t of c.temporalOrSequenceRequirements) md.push(`- ${t}`);
    md.push('');
  }
  md.push('**Frozen containment and authority expectation:**');
  for (const s of c.containmentAndAuthorityExpectation) md.push(`- ${s}`);
  md.push('');

  md.push('### 3. What the run actually produced');
  md.push('');
  md.push(`Structural findings (evidence, not a score): declarations ${decls.length}, admitted `
    + `${String(pr?.admittedCount ?? 0)}, refused ${String(pr?.refusedCount ?? 0)}, RR-7 preserved `
    + `${String(pr?.rr7?.preservedCount ?? 0)}, safetyStateComplete `
    + `${String(pr?.rr7?.safetyStateComplete ?? '-')}, totalLossOnThisRow `
    + `${String(pr?.rr7?.totalLossOnThisRow ?? '-')}.`);
  md.push('');
  if (typeof parsed?.expertExplanation?.summary === 'string') {
    md.push(`**Model summary.** ${parsed.expertExplanation.summary}`);
    md.push('');
  }
  const cands = Array.isArray(parsed.expertHazardCandidates)
    ? parsed.expertHazardCandidates as any[] : [];
  if (cands.length > 0) {
    md.push(`**Hazard candidates raised (${cands.length}):**`);
    for (const x of cands) {
      md.push(`- \`${String(x?.candidateKey ?? '')}\` [${String(x?.hazardFamily ?? '')}] `
        + `${String(x?.assertedConditionState ?? '')} — ${String(x?.reasoning ?? '')}`);
    }
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
    md.push(`- **notEstablishedBecause:** ${String(d?.notEstablishedBecause ?? '')}`);
    md.push(`- **branchA:** ${String(d?.branchA ?? '')}`);
    md.push(`- **decisionIfA:** ${String(d?.decisionIfA ?? '')}`);
    md.push(`- **branchB:** ${String(d?.branchB ?? '')}`);
    md.push(`- **decisionIfB:** ${String(d?.decisionIfB ?? '')}`);
    md.push(`- **whyNecessaryNow:** ${String(d?.whyNecessaryNow ?? '')}`);
    md.push('');
  });
  const clars = Array.isArray(parsed.decisionCriticalClarifications)
    ? parsed.decisionCriticalClarifications as any[] : [];
  if (clars.length > 0) {
    md.push('**Clarifications the model asked:**');
    for (const q of clars) {
      md.push(`- \`${String(q?.clarificationId ?? '')}\` [${String(q?.affectedDecision ?? '')}, `
        + `${String(q?.criticality ?? '')}] ${String(q?.question ?? '')}`);
    }
    md.push('');
  }

  if (vers.length > 0) {
    md.push('### 4. Authoritative verifier output (§208B recovered)');
    md.push('');
    for (const v of vers) {
      md.push(`**\`${String(v.factKey)}\`** — candidates supplied: ${String(v.candidateCount)}`);
      md.push(`- verdict: **${String((v.parsed as any)?.verdict ?? '-')}**`);
      md.push(`- bindingFactKey: ${String((v.parsed as any)?.bindingFactKey ?? '-')}`);
      md.push(`- rationale: ${String((v.parsed as any)?.rationale ?? '-')}`);
      const ac = (v.parsed as any)?.acceptedClarification;
      if (ac !== undefined && ac !== null) {
        md.push(`- accepted clarification: ${JSON.stringify(ac)}`);
      }
      const adm = v.admission as any;
      md.push(`- v3.3 admission: ${adm?.admitted === true ? 'ADMITTED'
        : `REFUSED — codes ${JSON.stringify(adm?.codes ?? [])}, detail ${JSON.stringify(adm?.detail ?? [])}`}`);
      md.push('');
    }
  }

  if (gv !== undefined) {
    md.push('### 5. Governed stage');
    md.push('');
    if (gv.recordKind === 'GOVERNED_STAGE_NOT_CALLED') {
      md.push(`- NOT CALLED — ${String(gv.reason)}`);
    } else {
      md.push(`- supplied ids: ${((gv.suppliedSourceIds ?? []) as string[]).join(', ')}`);
      md.push(`- minted references: ${JSON.stringify(gv.mintedReferences ?? [])}`);
      md.push(`- returned top-level keys: ${((gv.topLevelKeys ?? []) as string[]).join(', ')}`);
      md.push(`- bindings: ${JSON.stringify((gv.parsed as any)?.bindings ?? null)}`);
    }
    md.push('');
  }

  md.push('### 6. Slots to judge on this case');
  md.push('');
  for (const s of caseSlots) {
    const g = AXIS_GUIDANCE[s.axisId as string];
    md.push(`#### \`${s.slotId}\` — axis ${s.axisId} ${s.axisName}`);
    md.push('');
    md.push(`**Question.** ${s.question}`);
    md.push('');
    md.push(`Permitted values: ${(s.allowedVocabulary as string[]).map(v => `\`${v}\``).join(' · ')}`);
    if (s.factKey !== null) md.push(`Fact under judgment: \`${String(s.factKey)}\``);
    if (s.structuralNotExercised !== null) {
      md.push('');
      md.push(`**NO OPPORTUNITY — frozen reason:** ${String(s.structuralNotExercised)}`);
    }
    if (s.pairingNote !== null && s.pairingNote !== undefined) {
      md.push('');
      md.push(`**Pairing note:** ${String(s.pairingNote)}`);
    }
    if (s.fidelityDisclosure !== null && s.fidelityDisclosure !== undefined) {
      md.push('');
      md.push(`**Provenance:** ${String(s.fidelityDisclosure)}`);
    }
    if (g !== undefined) {
      md.push('');
      md.push('*Frozen §200 adjudication instructions, verbatim:*');
      if (g.whatBearsOnIt !== undefined) md.push(`- **what bears on it:** ${g.whatBearsOnIt}`);
      if (g.method !== undefined) md.push(`- **method:** ${g.method}`);
      if (g.correctWhen !== undefined) md.push(`- **CORRECT when:** ${g.correctWhen}`);
      if (g.partialWhen !== undefined) md.push(`- **PARTIALLY_CORRECT when:** ${g.partialWhen}`);
      if (g.incorrectWhen !== undefined) md.push(`- **INCORRECT when:** ${g.incorrectWhen}`);
      md.push(`- **must NOT influence the verdict:** ${g.mustNotInfluence}`);
    }
    md.push('');
    md.push('```');
    md.push(`npx ts-node -T scripts/record-209-verdict.ts --slot=${String(s.slotId)} \\`);
    md.push('  --verdict=<VALUE> --attribution=PRODUCT_OWNER --batch=<BATCH-ID> [--reason="..."]');
    md.push('```');
    md.push('');
  }
}

writeFileSync(join(OUT, 'ADJUDICATION-SESSION-209.md'), `${md.join('\n')}\n`);

console.log('================ §209 ADJUDICATION SESSION BUILT');
console.log(`  slots                    : ${slots.length}`);
console.log(`  product-owner verdicts   : 0 (this builder writes none and cannot)`);
console.log(`  slots with no opportunity: ${worksheet.slotsWithNoOpportunity}`);
console.log(`  verifier evidence        : §208B ACCEPTANCE_VERIFIER_EVIDENCE (${verifier.length} records)`);
console.log(`  gate linkage in the human session document: REMOVED (retained in the worksheet)`);
console.log('  wrote ADJUDICATION-WORKSHEET-209.json and ADJUDICATION-SESSION-209.md');
console.log('  provider calls: 0   database operations: 0');
