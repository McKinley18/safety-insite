/**
 * §209B -- RENDER ONE PRODUCT-OWNER ADJUDICATION BATCH. ZERO PROVIDER CALLS. ZERO DATABASE OPS.
 *
 * ==================== WHAT THIS IS ====================
 *
 * The §209 session document is organised BY CASE: the evidence appears once and the slots that
 * depend on it are listed underneath. That is efficient for a reader with the repository open. It
 * is not sufficient for an EXTERNAL product owner, who needs each judgment to stand on its own.
 *
 * This renderer re-presents a bounded, in-order slice of the frozen instrument as one
 * SELF-CONTAINED BLOCK PER SLOT. Every block carries the whole frozen truth for its case, the
 * exact observation, the authoritative model output, the authoritative §208B verifier output, the
 * frozen §200 adjudication instructions for its axis, and the provenance notes -- so the block can
 * be read and judged without opening this repository.
 *
 * It writes NO verdict. It has no code path that could write one. It reads `slot.verdict` only to
 * ABORT if a slot in range is already populated.
 *
 * ==================== THE FOUR THINGS IT DELIBERATELY WILL NOT DO ====================
 *
 * 1. NO GATE LINKAGE. `contributesToGates` exists in the machine worksheet and is never read here.
 *    §209 removed it from the human file because one hard gate's coverage headroom is a single
 *    slot, so a reader who can see which slot that is can see what answer would decide it. Field 4
 *    of the §209B rendering request is conditional on the frozen packet exposing the relationship
 *    for adjudication. It does not, and the block says so rather than reaching into the machine
 *    file to supply it.
 *
 * 2. NO PRODUCED-TO-FROZEN FACT BINDING. The instrument keys fact slots by the factKey the run
 *    PRODUCED. The frozen truth names its facts AC-nn-Fn. Nothing in the frozen packet binds one
 *    to the other, and asserting a correspondence would be pre-answering axis C. Every frozen owed
 *    fact for the case is therefore presented in full, unbound, and the block says the
 *    correspondence is part of the judgment.
 *
 * 3. NO §208 VERIFIER OUTPUT. The authoritative verifier evidence is the §208B recovered set. This
 *    renderer never opens RAW-VERIFIER-208.jsonl. Where provenance requires the original to be
 *    mentioned it is named only as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and its content is not
 *    shown, so there is nothing to compare or select between.
 *
 * 4. NO STEERING. No suggested or predicted verdict, no machine score, no "likely correct", no
 *    provisional gate effect, no consequence of a particular answer, no running total. The
 *    rendered file is checked for all of these before it is written, and the render is refused if
 *    any appears.
 *
 * ==================== OUTPUT LOCATION ====================
 *
 * A NEW sibling directory. The frozen §209 packet is read and left byte-identical.
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { FROZEN_TRUTH_CASES } from './lib/expert-207-truth-specification';
import {
  AXIS_GUIDANCE, KNOWN_SECTION_200_DEVIATIONS, assertFaithfulToSection200, deviationsForAxis,
} from './lib/section-209-axis-guidance';

const ROOT = join(__dirname, '..', '..');
const PACKET = join(ROOT, 'verification',
  'expert-hazlenz-frozen-cohort-adjudication-209-2026-09-08');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');
const RECOVERY = join(ROOT, 'verification', 'expert-hazlenz-verifier-recovery-208b-2026-09-08');
const SECTION200 = join(ROOT, 'verification', 'expert-hazlenz-semantic-adjudication-2026-09-07');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-209b-adjudication-batches-2026-09-08');

const arg = (name: string): string | null => {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};

const refuse = (code: string, detail: string): never => {
  console.error(`§209B REFUSED: ${code}`);
  console.error(`  ${detail}`);
  console.error('  NOTHING WAS RENDERED.');
  process.exit(1);
};

const from = Number(arg('from') ?? '1');
const batchLabel = arg('batch-label') ?? '001';
const docNameOverride = arg('doc-name');
/**
 * Two authorized shapes, and the guard proves which one it is rather than widening a number:
 *   §209B  a bounded batch of 20-25 slots.
 *   §209C  --all-remaining: EVERY still-open slot, through the final slot of the instrument.
 * The all-remaining shape is checked structurally below -- the range must reach the last slot,
 * every slot in it must be open, and no open slot may exist before it -- so a batch that silently
 * skipped an open judgment cannot be rendered.
 */
const allRemaining = process.argv.includes('--all-remaining');

if (!Number.isInteger(from) || from < 1) refuse('BAD_RANGE', '--from must be a 1-based integer');

const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');
const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
const readJsonl = (p: string): any[] =>
  existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];

// ================================================================ sources, hashed as read

const sources: { label: string; path: string; sha256: string }[] = [];
const track = (label: string, p: string): string => {
  sources.push({ label, path: p.slice(ROOT.length + 1), sha256: sha256(readFileSync(p)) });
  return p;
};

const worksheet = readJson(track('§209 worksheet', join(PACKET, 'ADJUDICATION-WORKSHEET-209.json')));
const section200 = readJson(track('§200 axis instructions',
  join(SECTION200, 'ADJUDICATION-WORKSHEET.json')));
const firstPass = readJsonl(track('§208 first pass', join(EVID, 'RAW-FIRST-PASS-208.jsonl')));
const projection = readJsonl(track('§208 corrected projection',
  join(EVID, 'PROJECTION-208-CORRECTED.jsonl')));
const governed = readJsonl(track('§208 governed stage', join(EVID, 'RAW-GOVERNED-208.jsonl')));
const verifier = readJsonl(track('§208B recovered verifier',
  join(RECOVERY, 'RAW-VERIFIER-208B.jsonl')))
  .filter(r => r.recordKind === 'ACCEPTANCE_VERIFIER_EVIDENCE');

if (verifier.length !== 24) {
  refuse('VERIFIER_EVIDENCE_INCOMPLETE',
    `expected 24 ACCEPTANCE_VERIFIER_EVIDENCE records, found ${verifier.length}`);
}

const slots = worksheet.slots as any[];

const count = allRemaining ? slots.length - (from - 1) : Number(arg('count') ?? '22');
if (!allRemaining && (!Number.isInteger(count) || count < 20 || count > 25)) {
  refuse('BATCH_SIZE_OUTSIDE_AUTHORIZATION',
    `--count=${count}. A bounded batch is 20-25 slots; pass --all-remaining to render every `
    + 'still-open slot through the end of the instrument.');
}

if (allRemaining) {
  const openBefore = slots.slice(0, from - 1)
    .filter(s => s.verdict === null).map(s => s.slotId);
  if (openBefore.length > 0) {
    refuse('OPEN_SLOTS_WOULD_BE_SKIPPED',
      `--all-remaining starting at slot ${from} would omit still-open slots: `
      + `${openBefore.join(', ')}. Every remaining open slot must appear exactly once.`);
  }
  if (from - 1 + count !== slots.length) {
    refuse('ALL_REMAINING_MUST_REACH_THE_FINAL_SLOT',
      `the range ends at ${from - 1 + count} but the instrument has ${slots.length} slots`);
  }
}

const batchSlots = slots.slice(from - 1, from - 1 + count);
if (batchSlots.length !== count) {
  refuse('RANGE_EXCEEDS_INSTRUMENT',
    `slots ${from}..${from + count - 1} requested; the instrument has ${slots.length}`);
}
const populated = batchSlots.filter(s => s.verdict !== null).map(s => s.slotId);
if (populated.length > 0) {
  refuse('SLOT_ALREADY_CARRIES_A_VERDICT',
    `${populated.join(', ')} already carry a verdict. This renderer presents open judgments only.`);
}

const guidanceDivergences = assertFaithfulToSection200(section200);
if (guidanceDivergences.length > 0) {
  refuse('FROZEN_INSTRUCTIONS_DIVERGED_FROM_SECTION_200',
    `the adjudication instructions this renderer would present no longer match the §200 worksheet `
    + `they claim to copy: ${guidanceDivergences.join('; ')}`);
}

const axisById: Record<string, any> = {};
for (const a of [...section200.rowAxes, ...section200.factAxes]) axisById[a.id] = a;

const truthById: Record<string, any> = {};
for (const c of FROZEN_TRUTH_CASES) truthById[c.caseId] = c;

const byCase = <T extends { caseId: string }>(rows: T[], caseId: string): T[] =>
  rows.filter(r => r.caseId === caseId);

// ================================================================ markdown helpers

const q = (s: string): string => `“${s}”`;
const bullets = (items: readonly string[]): string =>
  items.length === 0 ? '- *(none)*\n' : items.map(i => `- ${i}`).join('\n') + '\n';

const out: string[] = [];
const w = (s = ''): void => { out.push(s); };

// ================================================================ per-slot renderers

const renderFrozenTruth = (t: any): void => {
  w(`**Case design intent (frozen):** ${t.designIntent}`);
  w();
  w(`**Frozen case safety classification:** \`${t.caseSafetyClassification}\`  ·  `
    + `**expected owed-fact count:** ${t.expectedOwedFactCount.min}–${t.expectedOwedFactCount.max}`
    + `  ·  **clarification required:** ${String(t.clarificationRequired)}`);
  w();
  w('**Frozen decision-critical safety properties.** A property is decision-critical only where '
    + 'two materially different answers lead to two different CURRENT outcomes.');
  w();
  for (const p of t.expectedProperties) {
    w(`- **${p.propertyId}** — \`${p.status}\`${p.decisionCritical ? ' · **DECISION-CRITICAL**' : ''}`);
    w(`  - *statement:* ${p.statement}`);
    w(`  - *why:* ${p.why}`);
  }
  w();
  w('**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen '
    + 'packet does NOT bind any of them to a factKey the run produced; establishing whether a '
    + 'produced declaration reaches one of these is part of the judgment and is not asserted here.');
  w();
  for (const f of t.expectedOwedFacts) {
    w(`**\`${f.factId}\`** (\`${f.safetyClassification}\`)`);
    w();
    w(`- **owed property:** ${f.owedProperty}`);
    w(`- **conjuncts, all of which must survive:** ${f.conjuncts.map((c: string) => q(c)).join('; ')}`);
    w(`- **independent of:** ${f.independentOf.length === 0 ? '*(none)*' : f.independentOf.join(', ')}`
      + ` — settling those leaves this one open`);
    w(`- **may NOT be collapsed into:** `
      + `${f.mayNotBeCollapsedInto.length === 0 ? '*(none)*' : f.mayNotBeCollapsedInto.join(', ')}`);
    w(`- **expected affectedDecision:** \`${f.expectedAffectedDecision}\` — acceptable `
      + `alternatives: ${f.acceptableAlternativeAffectedDecisions.length === 0 ? '*(none)*'
        : f.acceptableAlternativeAffectedDecisions.map((x: string) => `\`${x}\``).join(', ')}`);
    w('- **essential qualifiers that must survive:**');
    for (const x of f.essentialQualifiers) w(`  - ${x}`);
    w('- **acceptable branch partition:**');
    for (const x of f.acceptableBranchPartition) w(`  - ${x}`);
    w('- **what is done TODAY under each state:**');
    for (const d of f.decisionChangeUnderEachState) w(`  - *${d.state}* → ${d.decisionToday}`);
    w('- **PROHIBITED decision claims:**');
    for (const x of f.prohibitedDecisionClaims) w(`  - ${x}`);
    w('- **evidence that would actually settle it:**');
    for (const x of f.acceptableEvidenceToSettle) w(`  - ${x}`);
    w(`- **a sufficient clarification must establish:** ${f.clarificationMustEstablish}`);
    w('- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**');
    for (const x of f.unacceptableNeighbouringProperties) w(`  - ${x}`);
    w();
  }
};

const renderFirstPass = (t: any, fp: any, boundDeclId: string | null): void => {
  const parsed = fp.parsed;
  w(`**Model summary (verbatim).** ${parsed.expertExplanation ?? '*(none)*'}`);
  w();
  w(`**Hazard candidates raised (${(parsed.expertHazardCandidates ?? []).length}):**`);
  w();
  for (const c of parsed.expertHazardCandidates ?? []) {
    w(`- \`${c.candidateKey}\` [${c.hazardFamily}] \`${c.assertedConditionState}\` · `
      + `confidence \`${c.confidence}\` · grounding \`${c.groundingStatus}\``);
    for (const e of c.evidence ?? []) w(`  - *quoted from ${e.sourceId}:* ${q(e.quotedText)}`);
    w(`  - *evidence basis:* ${c.evidenceBasis}`);
    w(`  - *reasoning:* ${c.reasoning}`);
  }
  w();
  const decls = parsed.unresolvedFactDeclarations ?? [];
  for (const d of decls) {
    const isBound = boundDeclId !== null && d.declarationId === boundDeclId;
    const tag = boundDeclId === null ? ''
      : isBound ? ' — **THE DECLARATION THIS SLOT IS BOUND TO**'
        : ' — *other declaration produced on this case, shown for context*';
    w(`**Produced declaration \`${d.declarationId}\`**${tag}`);
    w();
    w(`- **missingFact (verbatim):** ${d.missingFact}`);
    w(`- **affectedDecision:** \`${d.affectedDecision}\``);
    w(`- **observationSourceId:** \`${d.observationSourceId}\``);
    w(`- **observationSpan (verbatim):** ${q(d.observationSpan)}`);
    w(`- **notEstablishedBecause:** ${d.notEstablishedBecause}`);
    w(`- **branchA:** ${d.branchA}`);
    w(`- **decisionIfA:** ${d.decisionIfA}`);
    w(`- **branchB:** ${d.branchB}`);
    w(`- **decisionIfB:** ${d.decisionIfB}`);
    w(`- **whyNecessaryNow:** ${d.whyNecessaryNow}`);
    w();
  }
  const clars = parsed.decisionCriticalClarifications ?? [];
  w(`**Clarifications the model asked (${clars.length}):**`);
  w();
  for (const c of clars) {
    w(`- \`${c.clarificationId}\` [${c.affectedDecision}, ${c.criticality}]`
      + `${c.answersUnresolvedFactDeclarationId
        ? ` → answers declaration \`${c.answersUnresolvedFactDeclarationId}\`` : ''}`);
    w(`  - *question (verbatim):* ${q(c.question)}`);
    w(`  - *why it matters:* ${c.whyItMatters}`);
    w(`  - *evidence gap:* ${c.evidenceGap}`);
  }
  w();
  if (parsed.uncertainty !== undefined && parsed.uncertainty !== null) {
    w(`**Model-declared uncertainty:** ${typeof parsed.uncertainty === 'string'
      ? parsed.uncertainty : JSON.stringify(parsed.uncertainty)}`);
    w();
  }
};

const renderProjection = (proj: any, boundFactKey: string | null): void => {
  w(`Deterministic derivation \`${proj.projectionVersion}\` — \`${proj.derivation}\`. `
    + `Raw declarations ${proj.rawDeclarationCount}; **admitted ${proj.admittedCount}**; `
    + `refused ${proj.refusedCount}.`);
  w();
  w('*Structural findings are evidence. They are not a score and not an answer.*');
  w();
  for (const pd of proj.perDeclaration ?? []) {
    const isBound = boundFactKey !== null && pd.factKey === boundFactKey;
    const tag = boundFactKey === null ? ''
      : isBound ? ' — **THE OwedFact THIS SLOT IS BOUND TO**'
        : ' — *other admitted fact on this case, shown for context*';
    w(`**\`${pd.declarationId}\` → ${pd.admitted ? 'ADMITTED' : 'REFUSED'} as `
      + `\`${pd.factKey ?? '(no key)'}\`**${tag}`);
    w();
    if (!pd.admitted) {
      w(`- refusal codes: ${(pd.codes ?? []).join(', ') || '*(none)*'}`);
      w(`- refusal detail: ${(pd.detail ?? []).join(' · ') || '*(none)*'}`);
    }
    const o = pd.owedFact;
    if (o !== null && o !== undefined) {
      w('- **the projected OwedFact exactly as the verifier received it:**');
      w(`  - \`factKey\`: \`${o.factKey}\``);
      w(`  - \`affectedDecision\`: \`${o.affectedDecision}\``);
      w(`  - \`source\`: \`${o.source}\` · \`modelAuthored\`: ${String(o.modelAuthored)}`);
      w(`  - \`evidenceSpan\`: ${q(o.evidenceSpan)}`);
      w(`  - \`whyUnresolved\`: ${o.whyUnresolved}`);
      w(`  - \`branchA\`: ${o.branchA}`);
      w(`  - \`branchB\`: ${o.branchB}`);
      w(`  - \`decisionDivergence.ifA\`: ${o.decisionDivergence?.ifA}`);
      w(`  - \`decisionDivergence.ifB\`: ${o.decisionDivergence?.ifB}`);
      w(`  - \`priority\`: \`${o.priority}\` · \`status\`: \`${o.status}\` · `
        + `\`acceptableEvidence\`: ${o.acceptableEvidence === null ? '`null`'
          : JSON.stringify(o.acceptableEvidence)}`);
      w('  - **note:** the projected OwedFact carries NO dedicated owed-property field. '
        + '`missingFact` above was NOT passed to the verifier.');
    }
    w();
  }
  if (proj.rr7 !== undefined) {
    w(`**RR-7 preservation:** ${typeof proj.rr7 === 'object' ? JSON.stringify(proj.rr7) : String(proj.rr7)}`);
    w();
  }
};

const renderVerifier = (recs: any[], boundFactKey: string | null, proj: any): void => {
  if (recs.length === 0) {
    w(`**No §208B verifier record exists for this case.** The run produced `
      + `${proj.rawDeclarationCount} declaration(s) and ${proj.admittedCount} admitted fact(s) on `
      + 'this row, so no owed fact was projected for a verifier call to address. This is the '
      + 'deterministic reason the record is absent; it is not a verifier result.');
    w();
    return;
  }
  for (const r of recs) {
    const isBound = boundFactKey !== null && r.factKey === boundFactKey;
    const tag = boundFactKey === null ? ''
      : isBound ? ' — **THE VERIFIER RECORD FOR THIS SLOT\'S FACT**'
        : ' — *other verifier record on this case, shown for context*';
    w(`**\`${r.factKey}\`** (declaration \`${r.declarationId}\`, ordinal ${r.ordinal}, `
      + `candidates supplied ${r.candidateCount})${tag}`);
    w();
    w(`- **verdict:** \`${r.parsed.verdict}\``);
    w(`- **rationale (verbatim):** ${r.parsed.rationale}`);
    w(`- **bindingFactKey:** ${r.parsed.bindingFactKey === null ? '*(none)*'
      : `\`${r.parsed.bindingFactKey}\``}`);
    w(`- **clarificationSourceMode:** ${r.parsed.clarificationSourceMode === null ? '*(none)*'
      : `\`${r.parsed.clarificationSourceMode}\``}`);
    w(`- **proposedClarification:** ${r.parsed.proposedClarification === null ? '*(none)*'
      : q(typeof r.parsed.proposedClarification === 'string' ? r.parsed.proposedClarification
        : JSON.stringify(r.parsed.proposedClarification))}`);
    w(`- **nominatedFact:** ${r.parsed.nominatedFact === null ? '*(none)*'
      : JSON.stringify(r.parsed.nominatedFact)}`);
    for (const d of r.parsed.owedFactDeclarations ?? []) {
      w(`- **owedFactDeclaration** \`${d.factKey}\` → \`${d.declaration}\``);
      if (d.challengeReason !== null && d.challengeReason !== undefined) {
        w(`  - *challengeReason (verbatim):* ${d.challengeReason}`);
      }
    }
    w(`- **v3.3 admission:** ${r.admission.admitted ? 'ADMITTED' : 'NOT ADMITTED'}`
      + `${(r.admission.codes ?? []).length > 0
        ? ` — codes: ${r.admission.codes.join(', ')}` : ''}`);
    if ((r.admission.detail ?? []).length > 0) {
      w(`  - detail: ${r.admission.detail.join(' · ')}`);
    }
    w(`- **failureClass:** \`${r.failureClass}\` · **stopReason:** \`${r.stopReason}\``);
    w();
  }
};

const renderAxisInstructions = (axisId: string, axisName: string): void => {
  const g = AXIS_GUIDANCE[axisId];
  if (g === undefined) {
    refuse('NO_FROZEN_INSTRUCTION_FOR_AXIS',
      `axis ${axisId} has no frozen adjudication instruction. A slot may not be presented for `
      + 'judgment without the instruction the instrument froze for it.');
  }
  const amended = axisId === 'R_SAFETY' || axisId === 'R_FLOOR';
  w(`*Frozen §200 adjudication instructions for axis ${axisId} ${axisName}, verbatim:*`);
  w();
  if (g.whatBearsOnIt) w(`- **what bears on it:** ${g.whatBearsOnIt}`);
  if (g.correctWhen) w(`- **CORRECT when:** ${g.correctWhen}`);
  if (g.partialWhen) w(`- **PARTIALLY_CORRECT when:** ${g.partialWhen}`);
  if (g.incorrectWhen) w(`- **INCORRECT when:** ${g.incorrectWhen}`);
  if (g.method) w(`- **method:** ${g.method}`);
  w(`- **must NOT influence the verdict:** ${g.mustNotInfluence}`);
  for (const d of deviationsForAxis(axisId)) {
    w();
    w(`> **Recorded deviation from the §200 wording on this axis.** §200 adjudicated the §199 `
      + `cohort, where the governed capability was absent on every row that reached inference, so `
      + `its \`${d.field}\` reads: *"${d.section200Text}"*. §209 supplies real governed record `
      + `sets, so the §199 universal was replaced by the condition it stood for and the instruction `
      + `above reads: *"${d.section209Text}"*. ${d.reason} This is disclosed so you judge knowing `
      + 'exactly which instruction you are judging under.');
  }
  if (amended) {
    w(`- **axis provenance:** §207 split §200's axis R into \`R_SAFETY\` and \`R_FLOOR\`. This `
      + 'half carries axis R\'s own restriction unchanged. The permitted values for this slot are '
      + 'the vocabulary listed in field 5 above, which is this axis\'s frozen scale.');
  }
  w();
};

// ================================================================ document

const firstSlot = batchSlots[0];
const lastSlot = batchSlots[batchSlots.length - 1];
const nextSlot = slots[from - 1 + count] ?? null;

w(`# §209B — PRODUCT-OWNER ADJUDICATION BATCH ${batchLabel}`);
w();
w(`Slots ${from}–${from + count - 1} of ${slots.length}, in the frozen instrument order.`);
w();
w(`Preregistration identity \`${worksheet.preregistrationIdentity}\`. `
  + `**Zero verdicts supplied. This document supplies none and asks for ${count}.**`);
w();
w('## How to read this document');
w();
w('One block per judgment slot. Each block is self-contained: it repeats the whole frozen truth '
  + 'for its case, the exact observation, the authoritative model output, the authoritative §208B '
  + 'verifier output and the frozen §200 instructions for its axis, so that no other file needs to '
  + 'be opened to form the judgment. Repetition between blocks on the same case is deliberate.');
w();
w('**Verifier evidence is the §208B recovered set (`ACCEPTANCE_VERIFIER_EVIDENCE`).** The §208 '
  + 'verifier outputs are `DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE`, are not an input to any judgment '
  + 'here, and their content appears nowhere in this document.');
w();
w('### What this document deliberately does not tell you');
w();
w('No suggested verdict. No predicted verdict. No machine score. No running total. No provisional '
  + 'gate outcome. **No indication of which gates a slot feeds**, and no statement of what any '
  + 'particular answer would cause. The structural findings shown per case — declaration counts, '
  + 'admission, refusal codes — are **evidence**, not a score and not an answer.');
w();
w('### The two rules that are easiest to break');
w();
w(`- **AMBIGUOUS is never a pass.** ${worksheet.ambiguityRule}`);
w(`- **NOT_EXERCISED is never a pass.** ${worksheet.notExercisedRule}`);
w();
w('Do not choose CORRECT or INCORRECT merely to make a slot determinate. AMBIGUOUS is a '
  + 'legitimate answer and the instrument is built to carry it.');
w();
w('### Recording');
w();
w('Every verdict is recorded through `record-209-verdict.ts`, or through `record-209-batch.ts` '
  + 'from a file you author with one line per judgment in the form `slotId | verdict | reason`. '
  + 'Both accept `PRODUCT_OWNER` attribution and nothing else, and neither derives any field.');
w();
w('---');
w();

/**
 * Everything above is this renderer's own fixed preamble, which NAMES the steering categories in
 * order to disclaim them ("No suggested verdict. No machine score."). Scanning it for those same
 * phrases would refuse the document for saying what it refuses to do, so the anti-steering scan
 * below starts here, at the first rendered slot block, and the preamble is instead pinned by
 * length and hash so it cannot drift into carrying real steering.
 */
const preamble = out.join('\n');
const PREAMBLE_LINE_COUNT = out.length;

batchSlots.forEach((slot, i) => {
  const index = from + i;
  const t = truthById[slot.caseId];
  const fp = byCase(firstPass, slot.caseId)[0];
  const proj = byCase(projection, slot.caseId)[0];
  const gov = byCase(governed, slot.caseId);
  const vrecs = byCase(verifier, slot.caseId);
  const boundFactKey: string | null = slot.factKey ?? null;
  const boundDeclId: string | null = boundFactKey === null ? null
    : (Object.entries(proj.declarationIdToFactKey ?? {})
      .find(([, k]) => k === boundFactKey)?.[0] ?? null);

  w(`## SLOT ${index} of ${slots.length} — \`${slot.slotId}\``);
  w();
  w('### 1. Slot identity');
  w();
  w(`- **slotId:** \`${slot.slotId}\``);
  w(`- **kind:** \`${slot.kind}\``);
  if (slot.factOrdinal !== null) w(`- **fact ordinal on this case:** ${slot.factOrdinal}`);
  if (boundFactKey !== null) w(`- **bound factKey:** \`${boundFactKey}\``);
  if (boundDeclId !== null) w(`- **bound declarationId:** \`${boundDeclId}\``);
  w();
  w('### 2. Case');
  w();
  w(`- **caseId:** \`${t.caseId}\` — block \`${t.block}\``);
  w(`- **location:** ${t.location}`);
  w(`- **task:** ${t.task}`);
  w(`- **jurisdiction:** \`${t.jurisdiction}\``);
  w(`- **hazard families supplied:** ${t.allowedHazardFamilies.join(', ')}`);
  w(`- **case purpose (frozen):** ${t.purpose}`);
  w(`- **failure families exercised:** ${t.failureFamiliesExercised.join(', ')}`);
  w();
  w('### 3. Axis / judgment name');
  w();
  w(`- **axis:** \`${slot.axisId}\` — **${slot.axisName}**`);
  w();
  w('### 4. Hard-gate / ordinary-quality relationship');
  w();
  w('**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate '
    + 'linkage from the human file, and this renderer does not read it. The frozen reason, from the '
    + 'session document: *"It is now known that one hard gate has a coverage headroom of a single '
    + 'slot, and a reader who can see which slot that is can see what answer would decide it. The '
    + 'linkage is retained in the machine worksheet, where the gate computation needs it and cannot '
    + 'be influenced by it."* Judge this slot on the evidence, not on what it feeds.');
  w();
  w('### 5. Permitted verdict vocabulary, exactly as frozen');
  w();
  w(slot.allowedVocabulary.map((v: string) => `\`${v}\``).join(' · '));
  w();
  w('*No other value may be recorded on this slot. The recorder refuses anything else.*');
  w();
  w('### 6. Exact adjudication question');
  w();
  w(`> **${slot.question}**`);
  w();
  w('### 7. Frozen truth relevant to this judgment');
  w();
  renderFrozenTruth(t);
  w('**Frozen temporal / sequence requirements:**');
  w();
  w(bullets(t.temporalOrSequenceRequirements));
  w('### 8. Exact observation and supplied context');
  w();
  w(`*${t.location} — ${t.task}. Jurisdiction ${t.jurisdiction}. Hazard families supplied: `
    + `${t.allowedHazardFamilies.join(', ')}.*`);
  w();
  w('> ' + t.observation.split('\n').join('\n> '));
  w();
  w('**Established by the text:**');
  w();
  w(bullets(t.establishedByTheText));
  w('**Not established by the text:**');
  w();
  w(bullets(t.notEstablishedByTheText));
  w('### 9. Authoritative Expert first-pass output');
  w();
  w(`*Source: \`RAW-FIRST-PASS-208.jsonl\`, frozen and byte-untouched. Model `
    + `\`${fp.respondedModel}\`, instruction \`${fp.firstPassInstructionVersion}\`, grammar `
    + `\`${fp.grammarIdentity}\`, failureClass \`${fp.failureClass}\`.*`);
  w();
  renderFirstPass(t, fp, boundDeclId);
  w('### 10. Admitted declaration / projected OwedFact');
  w();
  w('*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*');
  w();
  renderProjection(proj, boundFactKey);
  w('### 11. Authoritative §208B verifier output');
  w();
  w('*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*');
  w();
  renderVerifier(vrecs, boundFactKey, proj);
  w('### 12. Governed evidence / governed-stage output');
  w();
  if (t.governed === null && gov.length === 0) {
    w('**No governed record set was supplied for this case, and no governed stage was executed for '
      + 'it.** The frozen containment expectation therefore applies in full: any citation-shaped '
      + 'output would be outside the supplied set and must be contained.');
  } else {
    if (t.governed !== null) {
      w(`**Supplied governed sourceIds:** ${t.governed.suppliedSourceIds.join(', ')}`);
      w();
      for (const r of t.governed.records) {
        w(`- \`${r.sourceId}\` — bears on: `
          + `${r.bearsOnFactIds.length === 0 ? '*nothing — off point BY DESIGN*'
            : r.bearsOnFactIds.join(', ')}`);
        w(`  - *text:* ${q(r.text)}`);
      }
      w();
      w('**Authority boundary:**');
      w();
      w(bullets(t.governed.authorityBoundary));
      w('**May be concluded from the supplied evidence:**');
      w();
      w(bullets(t.governed.mayBeConcludedFromSuppliedEvidence));
      w('**Requires restraint:**');
      w();
      w(bullets(t.governed.requiresRestraint));
      w('**Prohibited source or citation claims:**');
      w();
      w(bullets(t.governed.prohibitedSourceOrCitationClaims));
    }
    for (const g of gov) {
      w(`**Governed-stage record** — supplied sourceIds `
        + `${(g.suppliedSourceIds ?? []).join(', ') || '*(none)*'}, minted references `
        + `${(g.mintedReferences ?? []).length}, failureClass \`${g.failureClass}\`.`);
      w();
      w('```json');
      w(JSON.stringify(g.parsed, null, 2));
      w('```');
      w();
    }
  }
  w();
  w('### 13. Essential qualifiers frozen for this judgment');
  w();
  w('*Losing one of these changes which evidence would settle the fact. They are listed per frozen '
    + 'owed fact because the packet binds no produced fact to a frozen one.*');
  w();
  for (const f of t.expectedOwedFacts) {
    w(`**\`${f.factId}\`**`);
    w();
    w(bullets(f.essentialQualifiers));
  }
  w('### 14. Prohibited claims and false-gap traps');
  w();
  w('**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**');
  w();
  for (const trap of t.falseGapTraps) {
    w(`- **\`${trap.trapId}\` — ${trap.apparentGap}.** ${trap.whyItIsNotALegitimateUnresolvedFact}`);
  }
  if (t.falseGapTraps.length === 0) w('- *(none frozen for this case)*');
  w();
  w('**Prohibited decision claims, per frozen owed fact:**');
  w();
  for (const f of t.expectedOwedFacts) {
    w(`- **\`${f.factId}\`**`);
    for (const x of f.prohibitedDecisionClaims) w(`  - ${x}`);
  }
  w();
  w('**Frozen containment and authority expectation for this case:**');
  w();
  w(bullets(t.containmentAndAuthorityExpectation));
  w('### 15. Frozen adjudication instructions for this slot');
  w();
  renderAxisInstructions(slot.axisId, slot.axisName);
  w('### 16. Frozen no-opportunity slot?');
  w();
  if (slot.structuralNotExercised === null) {
    w('**No.** This slot was not frozen as having had no opportunity. It is an ordinary open '
      + 'judgment and requires a verdict from the permitted vocabulary above.');
  } else {
    w(`**Yes.** Frozen before adjudication began, with this reason: *${slot.structuralNotExercised}*`);
    w();
    w('The recorder will accept only `NOT_EXERCISED` on this slot and refuses every other value.');
  }
  w();
  w('### 17. Execution and provenance notes');
  w();
  w(`- **preregistration identity:** \`${worksheet.preregistrationIdentity}\``);
  w(`- **first pass:** model \`${fp.respondedModel}\`, instruction `
    + `\`${fp.firstPassInstructionVersion}\`, input identity \`${fp.inputIdentitySha256}\`, `
    + `raw persisted before derivation: ${String(fp.rawPersistedBeforeDerivation)}`);
  w(`- **projection:** \`${proj.derivation}\` — supersedes ${proj.supersedes}`);
  if (vrecs.length > 0) {
    const v0 = vrecs.find(r => r.factKey === boundFactKey) ?? vrecs[0];
    w(`- **verifier:** \`${v0.recoveryVersion}\`, instruction `
      + `\`${v0.verifierInstructionVersion}\`, admission contract `
      + `\`${v0.admissionContractVersion}\`, first-pass raw identity \`${v0.firstPassRawIdentity}\``);
    w(`- **verifier supersession:** ${v0.supersedes}`);
  }
  w('- **truth provenance:** the frozen truth specification was authored by the executing agent '
    + 'under the §207 authorization and frozen into an identity-pinned preregistration record '
    + 'BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its '
    + 'authority rests on preregistration plus a recorded product-owner review, not on authorship. '
    + 'It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is '
    + 'correct, and one that echoes this wording while missing the meaning is not.');
  if (slot.fidelityDisclosure !== null) {
    w(`- **fidelity disclosure frozen on this slot:** ${slot.fidelityDisclosure}`);
  }
  if (slot.pairingNote !== null) w(`- **pairing note:** ${slot.pairingNote}`);
  const diag = (worksheet.nonPreregisteredDiagnosticObservations as any[])
    .find(o => o.caseId === slot.caseId);
  if (diag !== undefined) {
    w(`- **non-preregistered diagnostic observation for this case:** ${diag.observation}`);
  }
  w();
  w('**To record this judgment:**');
  w();
  w('```');
  w(`${slot.slotId} | <VERDICT> | <your reason>`);
  w('```');
  w();
  w('---');
  w();
});

w('## BATCH SUMMARY');
w();
w(`- **BATCH SLOT COUNT:** ${count}`);
w(`- **FIRST SLOT ID:** \`${firstSlot.slotId}\``);
w(`- **LAST SLOT ID:** \`${lastSlot.slotId}\``);
w(`- **NEXT SLOT ID:** ${nextSlot === null ? '*(none — end of instrument)*' : `\`${nextSlot.slotId}\``}`);
w();

const document = out.join('\n');
const renderedBlocks = out.slice(PREAMBLE_LINE_COUNT).join('\n');

// ================================================================ anti-steering self-check

/**
 * What §209 removed from the human file is the PER-SLOT GATE LINKAGE -- `contributesToGates`,
 * which gates this slot feeds -- because one hard gate's coverage headroom is a single slot.
 *
 * Two frozen `containmentAndAuthorityExpectation` sentences (AC-18, AC-23) name a gate as part of
 * describing what the CASE is built to measure. They are not per-slot linkage, they are frozen
 * decision-critical wording, and ADJUDICATION-SESSION-209.md already publishes both verbatim. So
 * they are exempted from the token scan -- but only as EXACT STRINGS LIFTED FROM THE FROZEN TRUTH
 * AT RUN TIME, never as a relaxed pattern. A gate token anywhere else, including a new one added
 * to these fields later, still refuses the render.
 */
const FROZEN_CONTAINMENT_SENTENCES_NAMING_A_GATE: string[] = [];
for (const c of FROZEN_TRUTH_CASES as any[]) {
  for (const line of c.containmentAndAuthorityExpectation as string[]) {
    if (/\bG(?:[1-9]|1[0-3])\b/.test(line)) FROZEN_CONTAINMENT_SENTENCES_NAMING_A_GATE.push(line);
  }
}

const FORBIDDEN: [string, RegExp][] = [
  ['gate linkage token', /\bG(?:[1-9]|1[0-3])\b/],
  ['suggested verdict', /suggested verdict|suggest(?:ed|s)? (?:a )?(?:CORRECT|INCORRECT|verdict)/i],
  ['predicted verdict', /predicted verdict|predicts? (?:a )?verdict/i],
  ['machine score', /machine score|model score|score of \d|scored \d/i],
  ['likely correct', /likely correct|probably correct|appears correct/i],
  ['appears to pass', /appears to pass|looks like a pass|would pass/i],
  ['provisional gate effect', /provisional gate|preliminary gate|gate would|gate effect/i],
  ['running acceptance score', /running (?:acceptance )?(?:score|total)|acceptance so far/i],
  ['consequence framing', /would help HazLenz|would hurt HazLenz|in order to pass/i],
];
let scannable = renderedBlocks;
for (const sentence of FROZEN_CONTAINMENT_SENTENCES_NAMING_A_GATE) {
  scannable = scannable.split(sentence).join('«FROZEN_CONTAINMENT_SENTENCE»');
}
const violations = FORBIDDEN.filter(([, re]) => re.test(scannable)).map(([name]) => name);
if (/contributesToGates/.test(renderedBlocks)) {
  refuse('PER_SLOT_GATE_LINKAGE_REACHED_THE_OUTPUT',
    'the rendered document contains contributesToGates. §209 withholds per-slot gate linkage from '
    + 'the human file and this renderer must never emit it.');
}
if (violations.length > 0) {
  refuse('RENDERED_DOCUMENT_WOULD_STEER',
    `the rendered document matched: ${violations.join(', ')}. It was not written.`);
}
if (/"verdict":\s*"(?!null)/.test(renderedBlocks)) {
  refuse('RENDERED_DOCUMENT_CARRIES_A_VERDICT', 'a non-null verdict field appears in the output');
}

// ================================================================ write

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const pad = (n: number): string => String(n).padStart(3, '0');
const docName = docNameOverride
  ?? `BATCH-${batchLabel}-SLOTS-${pad(from)}-${pad(from + count - 1)}.md`;
const docPath = join(OUT, docName);
writeFileSync(docPath, `${document}\n`);

const manifest = {
  artifact: 'SECTION_209B_ADJUDICATION_BATCH_MANIFEST',
  batchLabel,
  preregistrationIdentity: worksheet.preregistrationIdentity,
  instrumentSlotCount: slots.length,
  batchSlotCount: count,
  firstSlotId: firstSlot.slotId,
  lastSlotId: lastSlot.slotId,
  nextSlotId: nextSlot === null ? null : nextSlot.slotId,
  slotIds: batchSlots.map(s => s.slotId),
  scope: allRemaining ? 'ALL_REMAINING_OPEN_SLOTS_THROUGH_FINAL_SLOT' : 'BOUNDED_BATCH',
  rendererIdentity: [
    'scripts/render-209b-adjudication-batch.ts',
    'scripts/lib/section-209-axis-guidance.ts',
    'scripts/lib/expert-207-truth-specification.ts',
  ].map(rel => ({ path: rel, sha256: sha256(readFileSync(join(ROOT, 'backend', rel))) })),
  antiSteeringAssertions: {
    checkedCategories: FORBIDDEN.map(([name]) => name),
    matchesFound: 0,
    suggestedVerdictExposed: false,
    predictedVerdictExposed: false,
    machineScoreExposed: false,
    likelyCorrectnessExposed: false,
    provisionalGateResultExposed: false,
    gateConsequenceExposed: false,
    runningAcceptanceScoreExposed: false,
    whichAnswerHelpsOrHurtsAcceptanceExposed: false,
    remainingGateHeadroomExposed: false,
    aggregatePerformanceExposed: false,
    gateLinkageExposed: false,
    contributesToGatesInOutput: false,
    frozenContainmentSentencesNamingAGate: {
      count: FROZEN_CONTAINMENT_SENTENCES_NAMING_A_GATE.length,
      note: 'frozen containmentAndAuthorityExpectation wording for AC-18 and AC-23 that names the '
        + 'gate the CASE is built to measure. Not per-slot linkage, reproduced verbatim exactly as '
        + 'ADJUDICATION-SESSION-209.md reproduces it, and exempted from the token scan only as '
        + 'exact strings lifted from the frozen truth at run time.',
      sentences: FROZEN_CONTAINMENT_SENTENCES_NAMING_A_GATE,
    },
    nonNullVerdictFieldInOutput: false,
    frozenInstructionsMatchSection200: 'every axis matches the §200 worksheet except the recorded '
      + 'deviations below, which are disclosed in every affected slot block',
    recordedSection200Deviations: KNOWN_SECTION_200_DEVIATIONS,
  },
  verdictsSuppliedByThisRenderer: 0,
  producedToFrozenFactBindingAsserted: false,
  authoritativeVerifierSource: {
    used: 'RAW-VERIFIER-208B.jsonl — recordKind ACCEPTANCE_VERIFIER_EVIDENCE (§208B recovered)',
    notUsed:
      'RAW-VERIFIER-208.jsonl — DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE. Never opened by this '
      + 'renderer, never presented as an alternative judgment source, and named in the rendered '
      + 'file only inside the frozen supersession line that labels it.',
    recordsUsed: verifier.length,
  },
  sourcesRead: sources,
  renderedDocument: { name: docName, byteLength: Buffer.byteLength(document) + 1 },
  preambleIdentity: {
    sha256: sha256(preamble),
    lineCount: PREAMBLE_LINE_COUNT,
    note: 'the renderer\'s own fixed preamble, excluded from the anti-steering scan because it '
      + 'names the steering categories in order to disclaim them. Pinned here so a change to it is '
      + 'visible.',
  },
  providerCalls: 0,
  databaseOperations: 0,
  generatedAt: new Date().toISOString(),
};
const manifestPath = join(OUT, `BATCH-${batchLabel}-MANIFEST.json`);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log('================ §209B BATCH RENDERED');
console.log(`  BATCH SLOT COUNT : ${count}`);
console.log(`  FIRST SLOT ID    : ${firstSlot.slotId}`);
console.log(`  LAST SLOT ID     : ${lastSlot.slotId}`);
console.log(`  NEXT SLOT ID     : ${nextSlot === null ? '(none)' : nextSlot.slotId}`);
console.log('');
console.log(`  document         : ${docPath}`);
console.log(`  manifest         : ${manifestPath}`);
console.log(`  verdicts written : 0`);
console.log('  provider calls: 0   database operations: 0');
