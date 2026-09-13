/**
 * §158 HS-H1 HUMAN ADJUDICATION PACKET BUILDER. ZERO PROVIDER CALLS.
 *
 * ==================== WHAT THIS FILE IS FOR ====================
 *
 * HS-H1's authored truth says the decision-critical missing fact is the load's cooling hold. Across
 * four verifier executions -- §156 v1 on two draws, §157 v2 on the same two -- that fact was never
 * mentioned, and across three first-pass draws it was never mentioned either. Seven executions, zero
 * mentions.
 *
 * There are at least three explanations for that, and NO EXECUTION IN THIS REPOSITORY CAN SEPARATE
 * THEM, because the truth HS-H1 is graded against was authored by the same model family being graded:
 *
 *   1. the models are missing a fact that is genuinely there and genuinely decisive;
 *   2. the instruction suppresses the search for it;
 *   3. the authored truth asserts a decision-critical fact the observation does not support.
 *
 * A model may not adjudicate its own evaluation standard. This builder therefore assembles the
 * evidence and STOPS. It reaches no conclusion, ranks no explanation, and recommends no disposition.
 *
 * ==================== HOW IT AVOIDS ARGUING ====================
 *
 * Every substantive line is COPIED from a frozen artifact -- the v9 fixture, the §152/§153/§154 run
 * records, the §156 blinded packet, the §156 and §157 verifier results, the frozen truth manifest --
 * and printed verbatim. The builder's own prose is confined to section headings and to the mechanical
 * description of where each block came from. Section 12's term scan is a literal substring count over
 * those same artifacts, so a reader can rerun it by eye.
 *
 * The forbidden-language check at the end greps the generated file for the persuasive constructions
 * the authorization prohibits and refuses to write the packet if any appears.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import { hardenedFixtureByRowId, HARDENED_SET_VERSION }
  from '../src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const SRC = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V157 = join(V, 'expert-hazlenz-verifier-v2-remediation-2026-09-04');
const OUT = join(V, 'expert-hazlenz-hs-h1-human-adjudication-2026-09-04');

const ROW_ID = 'HS-H1';
const DRAWS = [
  { section: '§152', draw: 'R1', dir: 'expert-hazlenz-hardened-v13-baseline-2026-09-03' },
  { section: '§153', draw: 'R2', dir: 'expert-hazlenz-hardened-v13-replicate2-2026-09-03' },
  { section: '§154', draw: 'R3', dir: 'expert-hazlenz-hardened-v13-replicate3-2026-09-03' },
] as const;

/** The terms section 12 must locate. Case-insensitive substring, counted where it occurs. */
const SCAN_TERMS = ['cooling hold', 'cooling', 'cool', 'load side', 'load-side',
  'chamber instrumentation', 'alarm', 'trapped steam', 'trapped'] as const;

/** Constructions the packet may not contain. Checked against the generated text before writing. */
const FORBIDDEN_PHRASES = [
  'claude was wrong', 'the correct answer is', 'hs-h1 proves', 'the model should have',
  'obviously', 'we recommend', 'i recommend', 'clearly the', 'the right answer',
  'this proves that', 'should be dispositioned', 'the disposition should',
];

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');
const sha256File = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T;
const fence = (o: unknown): string => '```json\n' + JSON.stringify(o, null, 2) + '\n```';

interface RunRecord {
  row: { source: Record<string, any>; truth: Record<string, any> };
  deterministicFamiliesEmitted: string[];
  lifeCriticalFindingKeys: string[];
  calls: Array<Record<string, any>>;
}

/** Every occurrence of `term` in `text`, as the sentence-ish window around it. */
function occurrences(text: string, term: string): string[] {
  const hay = text.toLowerCase(); const needle = term.toLowerCase();
  const out: string[] = [];
  let i = hay.indexOf(needle);
  while (i !== -1) {
    out.push(text.slice(Math.max(0, i - 70), Math.min(text.length, i + needle.length + 70))
      .replace(/\s+/g, ' ').trim());
    i = hay.indexOf(needle, i + needle.length);
  }
  return out;
}

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const L: string[] = [];
  const w = (s = '') => L.push(s);

  // ---------------------------------------------------------------- sources, by hash
  const fixture = hardenedFixtureByRowId(ROW_ID);
  if (!fixture) throw new Error('HS-H1 absent from the v9 fixture');
  const truthEntry = fixture.expectation.kind === 'REQUIRED'
    ? (fixture.expectation as { kind: 'REQUIRED'; truth: Record<string, any> }).truth : null;

  const runs = DRAWS.map(d => {
    const p = join(V, d.dir, 'RUN-RECORDS.jsonl');
    const rec = readFileSync(p, 'utf8').trim().split('\n')
      .map(l => JSON.parse(l) as RunRecord)
      .find(r => r.row.source.rowId === ROW_ID)!;
    return { ...d, path: `verification/${d.dir}/RUN-RECORDS.jsonl`, sha256: sha256File(p), rec };
  });

  const packet = readJson<{ cases: Array<Record<string, any>> }>(join(SRC, 'VERIFIER-PACKET.json'));
  const key = readJson<{ key: Array<{ caseId: string; draw: string; rowId: string }> }>(
    join(SRC, 'SEALED-CASE-KEY.json')).key;
  const hsCaseIds = key.filter(k => k.rowId === ROW_ID).map(k => k.caseId);
  const v1 = readJson<{ results: Array<Record<string, any>> }>(join(SRC, 'VERIFIER-RESULTS.json'));
  const v2 = readJson<{ results: Array<Record<string, any>> }>(
    join(V157, 'VERIFIER-V2-RESULTS.json'));
  const manifest = readJson<{ entries: Array<Record<string, any>> }>(
    join(SRC, 'TRUTH-MANIFEST.json'));

  const observation: string = fixture.row.source.observation;

  // ---------------------------------------------------------------- header
  w('# HS-H1 — HUMAN ADJUDICATION PACKET');
  w();
  w('**For PRODUCT-OWNER / HUMAN safety adjudication. Prepared 2026-09-04 (§158).**');
  w();
  w('This packet asks a human reviewer to decide whether the authored HS-H1 missing fact is valid.');
  w('It contains the evidence and nothing else: no conclusion, no ranking of explanations, and no');
  w('recommended disposition. Every quoted block below is copied verbatim from a frozen artifact');
  w('whose path and SHA-256 are given beside it.');
  w();
  w('**Why a human is being asked.** The standard HS-H1 is graded against was authored by the same');
  w('model family that is graded by it. A model cannot adjudicate its own evaluation standard, so');
  w('this question is outside what any execution in this repository can settle.');
  w();

  // ---------------------------------------------------------------- 1
  w('---');
  w();
  w('## 1. Exact original HS-H1 observation');
  w();
  w(`Source: \`backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts\``);
  w(`Fixture version: \`${HARDENED_SET_VERSION}\``);
  w(`File SHA-256: \`${sha256File(join(ROOT,
    'backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))}\``);
  w(`Observation SHA-256: \`${sha256(observation)}\`  ·  length ${observation.length} characters`);
  w();
  w('> ' + observation);
  w();
  w('Jurisdiction: `' + fixture.row.source.jurisdiction + '`');
  w('Allowed hazard families: `'
    + (fixture.row.source.allowedHazardFamilies as string[]).join('`, `') + '`');
  w();

  // ---------------------------------------------------------------- 2
  w('---');
  w();
  w('## 2. Exact deterministic HazLenz result available to the first pass');
  w();
  w('Identical on all three draws.');
  w();
  for (const r of runs) {
    w(`- **${r.section} ${r.draw}** — families emitted: `
      + `\`${r.rec.deterministicFamiliesEmitted.join('`, `') || '(none)'}\`  ·  `
      + `life-critical finding keys: \`${r.rec.lifeCriticalFindingKeys.join('`, `') || '(none)'}\``);
  }
  w();
  w('Neither emitted family is `thermal_burn` or `pressure_systems`.');
  w();

  // ---------------------------------------------------------------- 3
  w('---');
  w();
  w('## 3. Exact governed evidence supplied to the Expert');
  w();
  const governed = fixture.row.source.governedStandards as unknown[];
  w(governed.length === 0
    ? '**None. `governedStandards` is the empty array for this row on every draw.**'
    : fence(governed));
  w();
  w('The first pass recorded this itself on the §154 R3 draw: *"no regulatory record was supplied to');
  w('assess against, so no citation or applicability determination is made."*');
  w();
  w('Answered clarifications supplied: '
    + `\`${JSON.stringify(fixture.row.source.answeredClarifications)}\`  ·  `
    + `supplementary context: \`${JSON.stringify(fixture.row.source.supplementaryContext)}\``);
  w();

  // ---------------------------------------------------------------- 4-8
  w('---');
  w();
  w('## 4–8. The authored truth, verbatim');
  w();
  w('### 4. Authored expected missing fact');
  w();
  w('> ' + String(truthEntry?.missingFact));
  w();
  w('The frozen row truth states the same gap in its own words, under `decisionCriticalGaps`:');
  w();
  w(fence(fixture.row.truth.decisionCriticalGaps));
  w();
  w('### 5. Authored affectedDecision');
  w();
  w('`' + String(truthEntry?.affectedDecision) + '`');
  w();
  w('### 6. Authored counterfactual branch A');
  w();
  w('- **Answer A:** ' + String(truthEntry?.answerA));
  w('- **What is done under A:** ' + String(truthEntry?.outcomeA));
  w();
  w('### 7. Authored counterfactual branch B');
  w();
  w('- **Answer B:** ' + String(truthEntry?.answerB));
  w('- **What is done under B:** ' + String(truthEntry?.outcomeB));
  w();
  w('### 8. All authored acceptable selectors');
  w();
  for (const s of (truthEntry?.acceptableSelectors as string[])) w(`- ${s}`);
  w();
  w('The frozen §156 truth manifest carries the same selectors plus the keyword sets the scorer');
  w('matched against. Manifest SHA-256: '
    + `\`${sha256File(join(SRC, 'TRUTH-MANIFEST.json'))}\``);
  w();
  w(fence(manifest.entries.filter(e => hsCaseIds.includes(e.caseId))
    .map(e => ({ caseId: e.caseId, missingFact: e.missingFact,
      affectedDecision: e.affectedDecision, acceptableSelectors: e.acceptableSelectors,
      selectorKeywordSets: e.selectorKeywordSets, whyDecisionCritical: e.whyDecisionCritical }))));
  w();
  w('### The authoring rationale recorded with the row');
  w();
  w('> ' + String(fixture.row.truth.authoringRationale));
  w();
  w('### The review signatures recorded with the row');
  w();
  w('These are the checks the row\'s author recorded at authoring time. They are part of the material');
  w('under adjudication, not evidence that the adjudication is settled.');
  w();
  for (const s of fixture.review) w(`- **${s.claim}** — ${s.note}`);
  w();

  // ---------------------------------------------------------------- 9
  w('---');
  w();
  w('## 9. The three stored first-pass outputs (§152, §153, §154)');
  w();
  w('First-pass prompt version v13, analysis contract `analysis.v2`, model `claude-sonnet-5`.');
  w('These are the stored wire analyses, unmodified.');
  w();
  for (const r of runs) {
    const c = r.rec.calls[0];
    w(`### ${r.section} — draw ${r.draw}`);
    w();
    w(`Source: \`${r.path}\`  ·  SHA-256 \`${r.sha256}\``);
    w(`Model \`${c.modelIdentity}\`  ·  ${c.inputTokens} in / ${c.outputTokens} out  ·  `
      + `$${c.costUsd}  ·  attempts ${c.attempts}`);
    w();
    w(fence(c.analysis));
    w();
  }

  // ---------------------------------------------------------------- 10
  w('---');
  w();
  w('## 10. The four relevant verifier outputs (§156, §157)');
  w();
  w(`HS-H1 entered the blinded verifier packet twice: as ${hsCaseIds.join(' and ')}. `
    + 'Each was verified once under v1 and once under v2, giving four executions. The verifier was');
  w('never told the row identity and never saw the other verifier\'s output.');
  w();
  for (const cid of hsCaseIds) {
    const k = key.find(x => x.caseId === cid)!;
    const blinded = packet.cases.find(c => c.caseId === cid)!;
    w(`### ${cid} — blinded from ${k.draw} ${k.rowId}`);
    w();
    w('**What the verifier was given** (from the blinded packet, SHA-256 '
      + `\`${sha256File(join(SRC, 'VERIFIER-PACKET.json'))}\`):`);
    w();
    w(fence({ unresolvedFacts: blinded.unresolvedFacts,
      firstPassClarificationsAsked: blinded.firstPass.clarifications,
      triggerConditions: blinded.triggerConditions }));
    w();
    for (const [tag, set, file] of [
      ['§156 verifier v1', v1, 'expert-hazlenz-verifier-accuracy-2026-09-03/VERIFIER-RESULTS.json'],
      ['§157 verifier v2', v2,
        'expert-hazlenz-verifier-v2-remediation-2026-09-04/VERIFIER-V2-RESULTS.json'],
    ] as const) {
      const r = set.results.find(x => x.caseId === cid)!;
      w(`**${tag}** — \`verification/${file}\``);
      w();
      w(fence({ verdict: r.verdict,
        clarificationSourceMode: r.clarificationSourceMode ?? null,
        aboutUnresolvedFactRef: r.aboutUnresolvedFactRef,
        rationale: r.rationale,
        proposedClarification: r.proposedClarification,
        nominatedFact: r.nominatedFact ?? null,
        admissionAccepted: r.admissionAccepted,
        stopReason: r.stopReason, outputTokens: r.outputTokens }));
      w();
    }
  }

  // ---------------------------------------------------------------- 11
  w('---');
  w();
  w('## 11. Neutral chronology — what fact each execution focused on');
  w();
  w('One line per execution. The "focused on" column names the fact each output actually reasoned');
  w('about, taken from that output\'s own words. No execution is marked correct or incorrect here.');
  w();
  w('| # | Execution | Draw | Output | Focused on |');
  w('|---|---|---|---|---|');
  const chron: Array<[string, string, string, string, string]> = [
    ['1', '§152 first pass', 'R1', 'one clarification asked',
      'whether the over-temperature alarm is functional or was correctly silent'],
    ['2', '§153 first pass', 'R2', 'no clarification asked; one uncertainty statement',
      'whether the zero gauge was cross-verified, and whether steam is trapped in the load'],
    ['3', '§154 first pass', 'R3', 'no clarification asked; one uncertainty statement',
      'whether the zero gauge reading is reliable; alarm silence noted as not changing the action'],
    ['4', '§156 verifier v1', 'R2 (VC-02)', 'ADD_OR_REPLACE_CLARIFICATION',
      'whether the over-temperature alarm is functional'],
    ['5', '§156 verifier v1', 'R3 (VC-13)', 'NO_CLARIFICATION_REQUIRED',
      'the gauge-verification fact and the alarm silence; judged both action-invariant'],
    ['6', '§157 verifier v2', 'R2 (VC-02)', 'NO_CLARIFICATION_REQUIRED, no nomination',
      'the gauge/trapped-steam fact and the alarm; considered and declined to nominate any other'],
    ['7', '§157 verifier v2', 'R3 (VC-13)', 'NO_CLARIFICATION_REQUIRED, no nomination',
      'the gauge fact and the alarm; considered door-opening technique and declined to nominate'],
  ];
  for (const c of chron) w(`| ${c.join(' | ')} |`);
  w();
  w('Both §157 executions state in their own rationale that they performed the step-4 nomination');
  w('search. VC-02: *"I also considered whether there is a fact not raised that would change the');
  w('decision (e.g., whether the door opening itself is being done in a controlled/gradual manner to');
  w('vent any residual steam)"*. VC-13: *"I also checked for an ungiven fact that might govern the');
  w('decision: door-opening technique relative to hinge-side positioning is stated"*.');
  w();

  // ---------------------------------------------------------------- 12
  w('---');
  w();
  w('## 12. Term scan — where each term appears');
  w();
  w('Literal case-insensitive substring search across four surfaces: the observation; the governed');
  w('evidence; the deterministic result; and all seven model outputs above. Counts are occurrences,');
  w('not documents.');
  w();
  const surfaces: Array<{ name: string; text: string }> = [
    { name: 'OBSERVATION', text: observation },
    { name: 'GOVERNED EVIDENCE', text: JSON.stringify(governed) },
    { name: 'DETERMINISTIC RESULT', text: JSON.stringify(runs.map(r => ({
      families: r.rec.deterministicFamiliesEmitted, lc: r.rec.lifeCriticalFindingKeys }))) },
    ...runs.map(r => ({ name: `FIRST PASS ${r.section} ${r.draw}`,
      text: JSON.stringify(r.rec.calls[0].analysis) })),
    ...hsCaseIds.flatMap(cid => [
      { name: `VERIFIER v1 ${cid}`,
        text: JSON.stringify(v1.results.find(x => x.caseId === cid)) },
      { name: `VERIFIER v2 ${cid}`,
        text: JSON.stringify(v2.results.find(x => x.caseId === cid)) },
    ]),
  ];
  w('| Term | ' + surfaces.map(s => s.name).join(' | ') + ' |');
  w('|---|' + surfaces.map(() => '---').join('|') + '|');
  for (const t of SCAN_TERMS) {
    w(`| \`${t}\` | ` + surfaces.map(s => {
      const n = occurrences(s.text, t).length;
      return n === 0 ? '—' : String(n);
    }).join(' | ') + ' |');
  }
  w();
  w('### The occurrences in full');
  w();
  for (const t of SCAN_TERMS) {
    const hits = surfaces.flatMap(s => occurrences(s.text, t).map(o => ({ s: s.name, o })));
    w(`**\`${t}\`** — ${hits.length} occurrence${hits.length === 1 ? '' : 's'}`);
    w();
    if (hits.length === 0) {
      w('- (none on any surface)');
    } else {
      for (const h of hits) w(`- *${h.s}*: …${h.o}…`);
    }
    w();
  }

  // ---------------------------------------------------------------- 13
  w('---');
  w();
  w('## 13. Regulatory / evidentiary text bearing on the cooling-hold fact');
  w();
  w('**No regulatory or evidentiary text was supplied with this observation.** `governedStandards`');
  w('is empty on the row, on all three first-pass draws, and in the blinded verifier packet, where');
  w('`governedEvidence` is `[]` for both HS-H1 cases.');
  w();
  w('A search of the governed knowledge corpus under');
  w('`verification/hazlenz-governed-knowledge-growth-2026-08-19/` for the terms `autoclave`,');
  w('`sterilizer` and `pressure vessel` returns no match. Other rows in the same v9 fixture DO carry');
  w('governed records — HS-D1 carries `29 CFR 1910.106(e)(2)(ii)` and HS-M1 carries');
  w('`29 CFR 1910.146(c)(5)(ii)(C)` — so the absence here is specific to this row rather than a');
  w('property of the fixture.');
  w();
  w('The stated basis for the fact being decision-relevant is therefore the authoring rationale');
  w('reproduced in section 4–8 and nothing else. Whether that basis is sufficient is part of what is');
  w('being adjudicated.');
  w();

  // ---------------------------------------------------------------- 14
  w('---');
  w();
  w('## 14. Competing unresolved facts that could plausibly satisfy the same decision');
  w();
  w('Facts that appear in the record as candidates for "the fact that governs what is done at the');
  w('door". They are listed with their source and are **not** ranked, endorsed or excluded here.');
  w();
  const competing: Array<[string, string, string]> = [
    ['C1. Whether the load was given a cooling hold appropriate to its contents before the door '
      + 'was opened',
    'the authored truth (v9 fixture, §156 truth manifest)',
    'named `REQUIRED_CONTROL`; raised by no execution'],
    ['C2. Whether the over-temperature alarm is functional, or was correctly silent because the '
      + 'cycle never reached its setpoint',
    '§152 first pass (asked as a clarification); §156 v1 VC-02 (asked as a clarification); '
      + '§153 and §154 uncertainty statements; §157 v2 both cases (considered, declined)',
    'labelled `REQUIRED_CONTROL` by §152 and `HAZARD_SEVERITY` by §156 v1'],
    ['C3. Whether the zero chamber-pressure gauge reading was cross-verified against an independent '
      + 'indicator',
    '§153 and §154 first pass (candidate left INSUFFICIENT_EVIDENCE, plus an uncertainty '
      + 'statement); §156 v1 VC-13; §157 v2 both cases',
    'judged action-invariant by §156 v1 VC-13 and by both §157 v2 executions'],
    ['C4. Whether residual steam pockets remain trapped within the load itself',
      '§153 first pass, inside the `cand-steam-release` reasoning and the uncertainty statement',
      'never separated from C3 in any output; not asked as a question by any execution'],
    ['C5. Whether the door is being opened in a controlled or gradual manner to vent residual steam',
      '§157 v2 VC-02, raised inside the nomination search and declined',
      'the only fact any execution explicitly considered nominating and rejected'],
    ['C6. Whether the trolley handling and hinge-side stance are the adequate control for the '
      + 'residual thermal exposure',
    '§152, §153 and §154 first pass (`thermal_burn` candidate, ACTIVE); §156 v1 VC-13',
    'treated as an established control rather than an open fact by every execution'],
  ];
  for (const [fact, source, note] of competing) {
    w(`- **${fact}**`);
    w(`  - appears in: ${source}`);
    w(`  - as recorded: ${note}`);
  }
  w();
  w('Relationship between C1 and C3/C4, stated mechanically and without judging it: C1 is a fact');
  w('about the load\'s thermal state; C3 is a fact about the chamber instrument; C4 is a fact about');
  w('the load\'s pressure state. The authored `whyNotEstablished` asserts that a chamber gauge at');
  w('zero does not settle C1. No execution asserted the contrary and no execution asserted C1.');
  w();

  // ---------------------------------------------------------------- questions
  w('---');
  w();
  w('## HUMAN ADJUDICATION QUESTIONS');
  w();
  const questions: Array<[string, string]> = [
    ['A', 'Is the authored cooling-hold / load-side fact genuinely unresolved from the observation '
      + 'and supplied evidence?'],
    ['B', 'Would the two plausible answer states materially change a current safety, regulatory or '
      + 'required-control decision?'],
    ['C', 'Is asking this fact necessary now?'],
    ['D', 'Is the cooling-hold / load-side selector uniquely appropriate?'],
    ['E', 'If not unique, what other selectors are equally valid?'],
    ['F', 'Did any supplied evidence already establish the authored fact?'],
    ['G', 'Would a competent safety professional reasonably be expected to infer that this is the '
      + 'missing fact without being prompted toward it?'],
    ['H', 'Should HS-H1 remain in a future semantic-accuracy denominator?'],
  ];
  for (const [k, q] of questions) { w(`**${k}.** ${q}`); w(); w('> '); w(); }

  w('### Allowed dispositions');
  w();
  w('Select exactly one. This packet does not select one and does not indicate a preference.');
  w();
  for (const d of ['AUTHORING_VALID_UNIQUE_SELECTOR',
    'AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS', 'AUTHORING_AMBIGUOUS', 'AUTHORING_INVALID',
    'INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION']) w(`- [ ] \`${d}\``);
  w();
  w('Reviewer: ______________________  Date: ____________');
  w();
  w('---');
  w();
  w('## Provenance of every block in this packet');
  w();
  w('| Artifact | SHA-256 |');
  w('|---|---|');
  const provenance: Array<[string, string]> = [
    ['backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts',
      sha256File(join(ROOT,
        'backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))],
    ...runs.map(r => [r.path, r.sha256] as [string, string]),
    ['verification/expert-hazlenz-verifier-accuracy-2026-09-03/VERIFIER-PACKET.json',
      sha256File(join(SRC, 'VERIFIER-PACKET.json'))],
    ['verification/expert-hazlenz-verifier-accuracy-2026-09-03/TRUTH-MANIFEST.json',
      sha256File(join(SRC, 'TRUTH-MANIFEST.json'))],
    ['verification/expert-hazlenz-verifier-accuracy-2026-09-03/SEALED-CASE-KEY.json',
      sha256File(join(SRC, 'SEALED-CASE-KEY.json'))],
    ['verification/expert-hazlenz-verifier-accuracy-2026-09-03/VERIFIER-RESULTS.json',
      sha256File(join(SRC, 'VERIFIER-RESULTS.json'))],
    ['verification/expert-hazlenz-verifier-v2-remediation-2026-09-04/VERIFIER-V2-RESULTS.json',
      sha256File(join(V157, 'VERIFIER-V2-RESULTS.json'))],
  ];
  for (const [p, h] of provenance) w(`| \`${p}\` | \`${h}\` |`);
  w();
  w('`PROVIDER_CALLS_TO_BUILD_THIS_PACKET = 0`');
  w();

  const text = L.join('\n');

  // ---------------------------------------------------------------- the neutrality check
  const lower = text.toLowerCase();
  const found = FORBIDDEN_PHRASES.filter(p => lower.includes(p));
  console.log('§158 HS-H1 HUMAN ADJUDICATION PACKET BUILDER');
  console.log('='.repeat(100));
  console.log(`  neutrality check: ${FORBIDDEN_PHRASES.length} prohibited constructions scanned, `
    + `${found.length} found${found.length ? ` — ${found.join(', ')}` : ''}`);
  if (found.length > 0) {
    console.log('  PACKET NOT WRITTEN — the packet must be descriptive, not persuasive.');
    process.exit(1);
  }

  // Every draw and every verifier execution must be present, or the packet is incomplete.
  const completeness: Array<[string, boolean]> = [
    ['1 exact observation', text.includes(observation)],
    ['2 deterministic result', runs.every(r => text.includes(
      r.rec.deterministicFamiliesEmitted[0]))],
    ['3 governed evidence stated', text.includes('`governedStandards` is the empty array')],
    ['4 authored missing fact', text.includes(String(truthEntry?.missingFact))],
    ['5 authored affectedDecision', text.includes(String(truthEntry?.affectedDecision))],
    ['6 branch A', text.includes(String(truthEntry?.answerA))],
    ['7 branch B', text.includes(String(truthEntry?.answerB))],
    ['8 all acceptable selectors',
      (truthEntry?.acceptableSelectors as string[]).every(s => text.includes(s))],
    ['9 three first-pass outputs', runs.every(r => text.includes(r.rec.calls[0].analysis.analysisId)
      && text.includes(r.section))],
    ['10 four verifier outputs', hsCaseIds.every(c => text.includes(c))
      && hsCaseIds.length * 2 === 4],
    ['11 chronology', text.includes('Neutral chronology')],
    ['12 term scan', SCAN_TERMS.every(t => text.includes(`\`${t}\``))],
    ['13 regulatory text', text.includes('No regulatory or evidentiary text was supplied')],
    ['14 competing facts', competing.every(c => text.includes(c[0]))],
    ['questions A–H', questions.every(q => text.includes(`**${q[0]}.**`))],
    ['five dispositions', text.includes('INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION')],
  ];
  console.log('\n  completeness:');
  let incomplete = 0;
  for (const [id, ok] of completeness) {
    if (!ok) incomplete += 1;
    console.log(`    ${ok ? 'ok  ' : 'MISS'}  ${id}`);
  }

  const path = join(OUT, 'HS-H1-HUMAN-ADJUDICATION-PACKET.md');
  if (incomplete > 0) {
    console.log('\n  HS_H1_HUMAN_ADJUDICATION_PACKET_INCOMPLETE — SOURCE_EVIDENCE_REVIEW_REQUIRED');
    writeFileSync(join(OUT, 'PACKET-INCOMPLETE.txt'),
      `HS_H1_HUMAN_ADJUDICATION_PACKET_INCOMPLETE — SOURCE_EVIDENCE_REVIEW_REQUIRED\n`
      + completeness.filter(c => !c[1]).map(c => c[0]).join('\n') + '\n');
    process.exit(1);
  }
  writeFileSync(path, text + '\n');
  const packetSha = sha256File(path);
  writeFileSync(join(OUT, 'PACKET-MANIFEST.json'), `${JSON.stringify({
    builtAt: new Date().toISOString(),
    packet: 'HS-H1-HUMAN-ADJUDICATION-PACKET.md',
    packetSha256: packetSha,
    bytes: Buffer.byteLength(text + '\n'),
    providerCalls: 0,
    truthAuthorityStatus: 'AUTHORED_BY_EVALUATED_MODEL_FAMILY — humanReviewStatus: PENDING',
    adjudicationChosen: null,
    sourceArtifacts: Object.fromEntries(provenance),
    neutralityCheck: { prohibitedConstructionsScanned: FORBIDDEN_PHRASES.length, found: 0 },
    completeness: Object.fromEntries(completeness),
  }, null, 2)}\n`);

  console.log(`\n  -> ${path.replace(ROOT + '/', '')}`);
  console.log(`  packet SHA-256 ${packetSha}`);
  console.log(`  ${Buffer.byteLength(text + '\n')} bytes`);
  console.log('  HS_H1_HUMAN_ADJUDICATION_PACKET = COMPLETE, DISPOSITION NOT CHOSEN');
  console.log('  PROVIDER_CALLS_THIS_SCRIPT = 0');
}

main();
