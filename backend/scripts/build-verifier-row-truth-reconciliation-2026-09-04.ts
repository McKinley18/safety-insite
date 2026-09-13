/**
 * §159 VERIFIER ROW-TRUTH RECONCILIATION PACKETS. ZERO PROVIDER CALLS.
 *
 * ==================== WHY ROWS AND NOT CASES ====================
 *
 * The §156 blinded packet holds fifteen CASES, but those fifteen are draws of only SEVEN fixture
 * ROWS, and the authored truth under review lives on the row, not the draw. Reviewing per case would
 * put the same authored artifact in front of a human up to three times and invite three different
 * answers to one question. So this builder emits ONE packet per row.
 *
 * HS-H1 is already dispositioned (`AUTHORING_AMBIGUOUS`, product owner, 2026-09-04) and is not
 * rebuilt here. Six rows remain.
 *
 * ==================== WHAT A HUMAN IS BEING ASKED, PER ROW CLASS ====================
 *
 * The rows do not all make the same kind of claim, so they cannot all be asked the same question.
 *
 *   REQUIRED rows (HS-A1, HS-E1) assert that ONE NAMED FACT governs a current decision. That is the
 *     claim HS-H1 failed: the observation must establish the conditions under which the named
 *     mechanism is the applicable one, not merely fail to settle the safe state.
 *
 *   FORBIDDEN rows (HS-J1, HS-N1, HS-P1, HS-R1) assert the opposite and it is not a weaker claim:
 *     that NO fact in the observation is decision-critical. A silence row carries the whole
 *     specificity gate, and if its authored "nothing is missing" is wrong, every 7-of-7 built on it
 *     is measuring agreement with an error.
 *
 *   Three of these rows carry draws the §156 manifest ALREADY marks contested — VC-03, VC-11, VC-14
 *     on HS-J1 and VC-06 on HS-N1, excluded from the primary denominator because the model retained a
 *     control the authored rationale never addressed. Those exclusions were an engineering judgement
 *     made under the same truth-authority limitation, and they are put back in front of a human here
 *     rather than treated as settled.
 *
 * ==================== NEUTRALITY ====================
 *
 * Every substantive line is copied from a frozen artifact. The competing-facts section is DERIVED
 * MECHANICALLY from what the executions actually said -- their supplied unresolved facts, the ref
 * each verdict was about, and each proposed question -- rather than authored here, so the builder
 * does not smuggle in a view about which fact should have won. The generated text is greped for
 * prohibited persuasive constructions and the packet is not written if any appears.
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
const REPAIR = join(V, 'expert-hazlenz-vc04-measurement-repair-2026-09-04');
const OUT = join(V, 'expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04');

/** Dispositioned already; not rebuilt. */
const ALREADY_ADJUDICATED = { 'HS-H1': 'AUTHORING_AMBIGUOUS (product owner, 2026-09-04)' } as const;

const DRAW_DIR: Record<string, { section: string; dir: string }> = {
  R1: { section: '§152', dir: 'expert-hazlenz-hardened-v13-baseline-2026-09-03' },
  R2: { section: '§153', dir: 'expert-hazlenz-hardened-v13-replicate2-2026-09-03' },
  R3: { section: '§154', dir: 'expert-hazlenz-hardened-v13-replicate3-2026-09-03' },
};

const FORBIDDEN_PHRASES = [
  'claude was wrong', 'the correct answer is', 'the model should have', 'obviously',
  'we recommend', 'i recommend', 'the right answer', 'this proves that',
  'the disposition should', 'should be dispositioned', 'clearly the', 'in my view',
];

const DISPOSITIONS = [
  'AUTHORING_VALID_UNIQUE_SELECTOR',
  'AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS',
  'AUTHORING_AMBIGUOUS',
  'AUTHORING_INVALID',
  'INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION',
] as const;

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

function firstPassFor(rowId: string, draw: string) {
  const d = DRAW_DIR[draw];
  const p = join(V, d.dir, 'RUN-RECORDS.jsonl');
  const rec = readFileSync(p, 'utf8').trim().split('\n').map(l => JSON.parse(l) as RunRecord)
    .find(r => r.row.source.rowId === rowId)!;
  return { section: d.section, path: `verification/${d.dir}/RUN-RECORDS.jsonl`,
    sha256: sha256File(p), rec };
}

function main(): void {
  mkdirSync(OUT, { recursive: true });

  const key = readJson<{ key: Array<{ caseId: string; draw: string; rowId: string }> }>(
    join(SRC, 'SEALED-CASE-KEY.json')).key;
  const truth = readJson<{ entries: Array<Record<string, any>> }>(
    join(SRC, 'TRUTH-MANIFEST.json')).entries;
  const packet = readJson<{ cases: Array<Record<string, any>> }>(join(SRC, 'VERIFIER-PACKET.json'));
  const v1 = readJson<{ results: Array<Record<string, any>> }>(join(SRC, 'VERIFIER-RESULTS.json'));
  const v2 = readJson<{ results: Array<Record<string, any>> }>(
    join(V157, 'VERIFIER-V2-RESULTS.json'));
  const repair = readJson<{ repairedExecution: Record<string, any> }>(
    join(REPAIR, 'VC04-REPAIR-RESULT.json'));

  const truthById = new Map(truth.map(t => [t.caseId, t]));
  const byRow = new Map<string, Array<{ caseId: string; draw: string }>>();
  for (const k of key) {
    if (!byRow.has(k.rowId)) byRow.set(k.rowId, []);
    byRow.get(k.rowId)!.push({ caseId: k.caseId, draw: k.draw });
  }

  const rows = [...byRow.keys()].filter(r => !(r in ALREADY_ADJUDICATED)).sort();
  console.log('§159 VERIFIER ROW-TRUTH RECONCILIATION PACKETS');
  console.log('='.repeat(100));
  console.log(`  ${byRow.size} distinct rows behind ${key.length} blinded cases; `
    + `${Object.keys(ALREADY_ADJUDICATED).length} already dispositioned; ${rows.length} to build\n`);

  const index: Array<Record<string, unknown>> = [];
  let totalIssues = 0;

  for (const rowId of rows) {
    const fixture = hardenedFixtureByRowId(rowId)!;
    const draws = byRow.get(rowId)!.sort((a, b) => a.caseId.localeCompare(b.caseId));
    const kind = fixture.expectation.kind as 'REQUIRED' | 'FORBIDDEN';
    const observation: string = fixture.row.source.observation;
    const governed = fixture.row.source.governedStandards as unknown[];
    const primaryDraws = draws.filter(d => truthById.get(d.caseId)!.inPrimaryDenominator);
    const excludedDraws = draws.filter(d => !truthById.get(d.caseId)!.inPrimaryDenominator);

    const L: string[] = [];
    const w = (s = '') => L.push(s);

    w(`# ${rowId} — VERIFIER ROW-TRUTH RECONCILIATION PACKET`);
    w();
    w('**For PRODUCT-OWNER / HUMAN adjudication of the AUTHORED TRUTH on this row. Prepared '
      + '2026-09-04 (§159).**');
    w();
    w('The question is whether the authored truth on this row is a sound standard to grade a verifier');
    w('against. It is not whether any model output was good. This packet reaches no conclusion and');
    w('selects no disposition.');
    w();
    w('**Why a human is being asked.** The standard was authored by the same model family it grades.');
    w('A model cannot adjudicate its own evaluation standard. HS-H1 went through this process on');
    w('2026-09-04 and returned `AUTHORING_AMBIGUOUS`; that outcome is the reason the remaining');
    w('load-bearing rows are being reviewed rather than assumed sound.');
    w();
    w('| | |');
    w('|---|---|');
    w(`| row | \`${rowId}\` |`);
    w(`| authored class | \`${kind}\` — `
      + `${kind === 'REQUIRED'
        ? 'asserts ONE NAMED FACT governs a current decision'
        : 'asserts NO fact in the observation is decision-critical'} |`);
    w(`| fixture form | \`${fixture.form}\` |`);
    w(`| blinded draws | ${draws.map(d => `${d.caseId} (${d.draw})`).join(', ')} |`);
    w(`| in primary denominator | ${primaryDraws.map(d => d.caseId).join(', ') || '(none)'} |`);
    w(`| excluded from primary | ${excludedDraws.map(d => d.caseId).join(', ') || '(none)'} |`);
    w(`| verifier executions covered | ${draws.length * 2} `
      + `(${draws.length} draws × v1 and v2)${rowId === 'HS-E1' ? ' + 1 §158 repair' : ''} |`);
    w();

    // ---- 1 observation
    w('---');
    w();
    w('## 1. Exact observation');
    w();
    w(`Fixture \`${HARDENED_SET_VERSION}\`, file sha256 `
      + `\`${sha256File(join(ROOT,
        'backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))}\``);
    w(`Jurisdiction \`${fixture.row.source.jurisdiction}\`  ·  `
      + `${observation.length} characters`);
    w();
    w('> ' + observation);
    w();
    w('Allowed hazard families: `'
      + (fixture.row.source.allowedHazardFamilies as string[]).join('`, `') + '`');
    w();

    // ---- 2 deterministic + governed
    w('---');
    w();
    w('## 2. Deterministic result and governed evidence available to the first pass');
    w();
    for (const d of draws) {
      const fp = firstPassFor(rowId, d.draw);
      w(`- **${fp.section} ${d.draw}** — families emitted: `
        + `\`${fp.rec.deterministicFamiliesEmitted.join('`, `') || '(none)'}\`  ·  `
        + `life-critical: \`${fp.rec.lifeCriticalFindingKeys.join('`, `') || '(none)'}\``);
    }
    w();
    w('**Governed regulatory evidence supplied with this row:**');
    w();
    w(governed.length === 0
      ? '**None. `governedStandards` is `[]` on the row and `governedEvidence` is `[]` in the '
        + 'blinded packet for every draw.**'
      : fence(governed));
    w();
    if (governed.length === 0) {
      w('This is true of every row behind the verifier packet. Whether an authored decision-critical');
      w('claim can rest on an observation alone, with no governed record, is part of what is being');
      w('adjudicated — and it is the point on which HS-H1 turned.');
      w();
    }

    // ---- 3 authored truth
    w('---');
    w();
    w('## 3. The authored truth, verbatim');
    w();
    if (kind === 'REQUIRED') {
      const t = (fixture.expectation as { truth: Record<string, any> }).truth;
      w('### The claim');
      w();
      w(`**Missing fact:** ${t.missingFact}`);
      w();
      w(`**Affected decision:** \`${t.affectedDecision}\``);
      w();
      w('### The counterfactual, as authored');
      w();
      w(`- **Answer A:** ${t.answerA}`);
      w(`- **Done under A:** ${t.outcomeA}`);
      w(`- **Answer B:** ${t.answerB}`);
      w(`- **Done under B:** ${t.outcomeB}`);
      w();
      w('### Why the author says the observation does not establish it');
      w();
      w('> ' + t.whyNotEstablished);
      w();
      w('### All authored acceptable selectors');
      w();
      for (const s of t.acceptableSelectors as string[]) w(`- ${s}`);
      w();
      w('### The selector keyword sets the scorer matched on');
      w();
      const tm = truthById.get(draws[0].caseId)!;
      w(fence(tm.selectorKeywordSets));
      w();
      w('A proposed question counted as reaching the owed fact only if it contained **every** keyword');
      w('in **some** set. This is the mechanism HS-H1\'s adjudication found could not be relied on');
      w('when the observation does not establish that the named mechanism is the applicable one.');
      w();
    } else {
      const t = (fixture.expectation as { truth: Record<string, any> }).truth;
      w('### The claim');
      w();
      w('**This row asserts that NO fact is decision-critical.** It carries part of the');
      w('legitimate-silence specificity gate, which both §156 and §157 scored at 7 of 7.');
      w();
      w(`**The tempting question the author expected a model to ask:** ${t.temptingQuestion}`);
      w();
      w('**Why the author says it is not decision-critical:**');
      w();
      w('> ' + t.whyNotDecisionCritical);
      w();
      w('**What the author says makes it settled:**');
      w();
      w('> ' + t.whatMakesItSettled);
      w();
      const tms = draws.map(d => truthById.get(d.caseId)!)
        .filter(t2 => t2.whyNotDecisionCritical);
      if (tms.length) {
        w('**The §156 truth manifest\'s own restatement, per draw:**');
        w();
        for (const t2 of tms) w(`- \`${t2.caseId}\`: ${t2.whyNotDecisionCritical}`);
        w();
      }
    }
    w('### The row-level truth record');
    w();
    w(fence({ presentHazardFamilies: fixture.row.truth.presentHazardFamilies,
      defensibleHazardFamilies: fixture.row.truth.defensibleHazardFamilies,
      forbiddenHazardFamilies: fixture.row.truth.forbiddenHazardFamilies,
      negatedOrSafeStateFamilies: fixture.row.truth.negatedOrSafeStateFamilies,
      lifeCriticalHazardFamilies: fixture.row.truth.lifeCriticalHazardFamilies,
      decisionCriticalGaps: fixture.row.truth.decisionCriticalGaps }));
    w();
    w('### The authoring rationale');
    w();
    w('> ' + fixture.row.truth.authoringRationale);
    w();
    w('### The review signatures recorded at authoring time');
    w();
    w('These are the author\'s own checks. They are part of the material under adjudication, not');
    w('evidence that the adjudication is settled.');
    w();
    for (const s of fixture.review) w(`- **${s.claim}** — ${s.note}`);
    w();

    // ---- 4 contested exclusions
    if (excludedDraws.length) {
      w('---');
      w();
      w('## 4. Draws the §156 manifest already treats as contested');
      w();
      w('These draws were removed from the primary denominator by an engineering judgement made under');
      w('the same truth-authority limitation that sent HS-H1 to adjudication. The exclusion reasons');
      w('are reproduced so a human can decide whether the exclusion, the authored truth, or neither');
      w('is what needs repair.');
      w();
      for (const d of excludedDraws) {
        const t = truthById.get(d.caseId)!;
        w(`**${d.caseId} (${d.draw})** — correct verdict recorded as \`${t.correctVerdict}\`, `
          + `semantically equivalent: \`${(t.semanticallyEquivalentVerdicts as string[]).join('`, `')}\``);
        w();
        w('> ' + t.exclusionReason);
        w();
      }
    }

    // ---- 5 first pass
    w('---');
    w();
    w(`## ${excludedDraws.length ? 5 : 4}. Stored first-pass outputs`);
    w();
    w('First-pass prompt v13, analysis contract `analysis.v2`, model `claude-sonnet-5`.');
    w();
    for (const d of draws) {
      const fp = firstPassFor(rowId, d.draw);
      const c = fp.rec.calls[0];
      w(`### ${fp.section} — draw ${d.draw} (blinded as ${d.caseId})`);
      w();
      w(`\`${fp.path}\`  ·  sha256 \`${fp.sha256}\`  ·  `
        + `${c.inputTokens} in / ${c.outputTokens} out  ·  $${c.costUsd}`);
      w();
      w(fence(c.analysis));
      w();
    }

    // ---- 6 verifier outputs
    w('---');
    w();
    w(`## ${excludedDraws.length ? 6 : 5}. Verifier outputs`);
    w();
    for (const d of draws) {
      const blinded = packet.cases.find(c => c.caseId === d.caseId)!;
      w(`### ${d.caseId} (${d.draw})`);
      w();
      w('**What the verifier was given:**');
      w();
      w(fence({ unresolvedFacts: blinded.unresolvedFacts,
        firstPassClarificationsAsked: blinded.firstPass.clarifications,
        triggerConditions: blinded.triggerConditions }));
      w();
      for (const [tag, set] of [['§156 verifier v1', v1], ['§157 verifier v2', v2]] as const) {
        const r = set.results.find(x => x.caseId === d.caseId)!;
        w(`**${tag}**`);
        w();
        w(fence({ verdict: r.verdict, clarificationSourceMode: r.clarificationSourceMode ?? null,
          aboutUnresolvedFactRef: r.aboutUnresolvedFactRef, rationale: r.rationale,
          proposedClarification: r.proposedClarification, nominatedFact: r.nominatedFact ?? null,
          admissionAccepted: r.admissionAccepted, stopReason: r.stopReason,
          outputTokens: r.outputTokens }));
        w();
      }
      if (d.caseId === 'VC-04') {
        const r = repair.repairedExecution;
        w('**§158 measurement repair — the same bytes re-sent under a 4,000-token ceiling after the '
          + '§157 execution was truncated at 1,600**');
        w();
        w(fence({ verdict: r.verdict, clarificationSourceMode: r.clarificationSourceMode,
          aboutUnresolvedFactRef: r.aboutUnresolvedFactRef, rationale: r.rationale,
          proposedClarification: r.proposedClarification, nominatedFact: r.nominatedFact,
          admissionAccepted: r.admissionAccepted, stopReason: r.stopReason,
          outputTokens: r.outputTokens }));
        w();
        w('The §157 and §158 executions of this case returned DIFFERENT VERDICTS on byte-identical');
        w('input, provider-attested at 4,598 metered input tokens on both. Both are shown because');
        w('neither supersedes the other.');
        w();
      }
    }

    // ---- 7 competing facts, derived mechanically
    w('---');
    w();
    w(`## ${excludedDraws.length ? 7 : 6}. Every fact any execution actually focused on`);
    w();
    w('Derived mechanically from the artifacts above — the unresolved facts each verifier was handed,');
    w('the ref each verdict was about, and each proposed question. Not ranked and not filtered.');
    w();
    const facts = new Map<string, string[]>();
    const add = (text: string, where: string) => {
      const k = text.trim();
      if (!k) return;
      if (!facts.has(k)) facts.set(k, []);
      if (!facts.get(k)!.includes(where)) facts.get(k)!.push(where);
    };
    for (const d of draws) {
      const blinded = packet.cases.find(c => c.caseId === d.caseId)!;
      for (const f of blinded.unresolvedFacts as Array<Record<string, string>>) {
        add(f.text, `supplied to ${d.caseId} as \`${f.ref}\``);
      }
      for (const q of blinded.firstPass.clarifications as Array<Record<string, string>>) {
        add(q.question, `asked by the first pass on ${d.caseId} [${q.affectedDecision}]`);
      }
      for (const [tag, set] of [['v1', v1], ['v2', v2]] as const) {
        const r = set.results.find(x => x.caseId === d.caseId)!;
        if (r.proposedClarification?.question) {
          add(r.proposedClarification.question,
            `proposed by ${tag} on ${d.caseId} [${r.proposedClarification.affectedDecision}]`);
        }
        if (r.nominatedFact?.missingFact) {
          add(r.nominatedFact.missingFact, `NOMINATED by ${tag} on ${d.caseId}`);
        }
      }
      if (d.caseId === 'VC-04' && repair.repairedExecution.nominatedFact) {
        add((repair.repairedExecution.nominatedFact as Record<string, string>).missingFact,
          'NOMINATED by the §158 repair on VC-04');
      }
    }
    if (kind === 'REQUIRED') {
      add((fixture.expectation as { truth: Record<string, any> }).truth.missingFact,
        'THE AUTHORED FACT (v9 fixture)');
    } else {
      add((fixture.expectation as { truth: Record<string, any> }).truth.temptingQuestion,
        'THE AUTHORED TEMPTING QUESTION the author expected and judged non-decision-critical');
    }
    let n = 0;
    for (const [text, wheres] of facts) {
      n += 1;
      w(`**F${n}.** ${text}`);
      w(`- appears as: ${wheres.join('; ')}`);
      w();
    }

    // ---- 8 questions
    w('---');
    w();
    w('## HUMAN ADJUDICATION QUESTIONS');
    w();
    const qs: Array<[string, string]> = kind === 'REQUIRED'
      ? [
        ['A', 'Is the authored fact genuinely unresolved from the observation and supplied evidence?'],
        ['B', 'Would the two authored answer states materially change a current safety, regulatory '
          + 'or required-control decision?'],
        ['C', 'Is asking this fact necessary now, rather than at a later review?'],
        ['D', 'Does the observation establish the conditions under which the NAMED MECHANISM in the '
          + 'selector is the applicable one? (This is the test HS-H1 did not meet: failing to settle '
          + 'the safe state is not the same as establishing which mechanism governs it.)'],
        ['E', 'Is the authored selector uniquely appropriate? If not, which other selectors in '
          + 'section ' + (excludedDraws.length ? 7 : 6) + ' are equally valid?'],
        ['F', 'Did any supplied evidence already establish the authored fact?'],
        ['G', 'Would a competent safety professional reasonably be expected to identify this as the '
          + 'missing fact without being prompted toward it?'],
        ['H', 'Should this row remain in a strict selector-based semantic-accuracy denominator?'],
      ]
      : [
        ['A', 'Is the authored claim that NOTHING in this observation is decision-critical correct?'],
        ['B', 'Does the observation actually state every control the author relies on to call it '
          + 'settled, or does the authored rationale supply a premise the text does not?'],
        ['C', 'Did any execution in section ' + (excludedDraws.length ? 6 : 5) + ' raise a fact that '
          + 'IS decision-critical and that the authored rationale never addressed?'],
        ['D', 'Is the authored "tempting question" the only question this observation invites, or are '
          + 'there others the author did not consider?'],
        ['E', 'If a verifier stayed silent on this row, would that silence be correct for the reason '
          + 'the author gives, or correct for a different reason, or not correct?'],
        ['F', 'Did any supplied evidence bear on the decision, given that no governed record was '
          + 'supplied?'],
        ['G', 'Would a competent safety professional reasonably reach the same "nothing to ask here" '
          + 'conclusion from this observation alone?'],
        ['H', 'Should this row remain in the legitimate-silence specificity denominator?'],
      ];
    for (const [k2, q] of qs) { w(`**${k2}.** ${q}`); w(); w('> '); w(); }

    w('### Allowed dispositions');
    w();
    w('Select exactly one. This packet does not select one and does not indicate a preference.');
    w();
    for (const dsp of DISPOSITIONS) w(`- [ ] \`${dsp}\``);
    w();
    w('If the disposition removes this row from a denominator, name **which** denominators. The');
    w('policy in `docs/VERIFIER-TRUTH-DENOMINATOR-POLICY.md` requires the exclusion to match the');
    w('scope of the defect and to apply prospectively only.');
    w();
    w('Reviewer: ______________________  Date: ____________');
    w();

    const text = L.join('\n');
    const lower = text.toLowerCase();
    const found = FORBIDDEN_PHRASES.filter(p => lower.includes(p));
    const checks: Array<[string, boolean]> = [
      ['observation verbatim', text.includes(observation)],
      ['governed evidence stated', text.includes('Governed regulatory evidence supplied')],
      ['authored truth present', text.includes('The authored truth, verbatim')],
      ['authoring rationale', text.includes(String(fixture.row.truth.authoringRationale))],
      ['every draw first pass', draws.every(d => text.includes(d.caseId))],
      ['every verifier execution', draws.every(d =>
        text.includes('§156 verifier v1') && text.includes('§157 verifier v2'))],
      ['competing facts derived', n > 0],
      ['questions A–H', qs.every(q => text.includes(`**${q[0]}.**`))],
      ['five dispositions', DISPOSITIONS.every(d => text.includes(d))],
      ['no disposition selected', !text.includes('- [x]')],
      ['neutrality', found.length === 0],
    ];
    const bad = checks.filter(c => !c[1]);
    totalIssues += bad.length;
    console.log(`  ${rowId.padEnd(7)} ${kind.padEnd(10)} ${String(draws.length).padStart(2)} draws  `
      + `${String(draws.length * 2).padStart(2)} verifier executions  `
      + `${String(n).padStart(2)} facts  `
      + `${bad.length === 0 ? 'ok' : 'ISSUES: ' + bad.map(b => b[0]).join(',')}`);
    if (bad.length > 0) continue;

    const path = join(OUT, `${rowId}-ROW-TRUTH-RECONCILIATION-PACKET.md`);
    writeFileSync(path, text + '\n');
    index.push({ rowId, authoredClass: kind, fixtureForm: fixture.form,
      draws: draws.map(d => `${d.caseId} (${d.draw})`),
      primaryDraws: primaryDraws.map(d => d.caseId),
      excludedDraws: excludedDraws.map(d => d.caseId),
      verifierExecutions: draws.length * 2 + (rowId === 'HS-E1' ? 1 : 0),
      distinctFactsRaised: n, governedRecordsSupplied: governed.length,
      packet: `${rowId}-ROW-TRUTH-RECONCILIATION-PACKET.md`,
      packetSha256: sha256File(path), disposition: null });
  }

  if (totalIssues > 0) {
    console.log('\n  VERIFIER_ROW_TRUTH_RECONCILIATION_INCOMPLETE — SOURCE_EVIDENCE_REVIEW_REQUIRED');
    process.exit(1);
  }

  // ---- the blank disposition ledger the re-derivation will consume
  const ledger = {
    ledgerVersion: 'hazlenz.expert.verifier.row-truth-dispositions.v1',
    createdAt: new Date().toISOString(),
    INSTRUCTIONS: 'A human reviewer fills `disposition` and `excludeFromDenominators` per row. '
      + 'A row left null is NOT thereby valid — absence of adjudication is not adjudication. The '
      + 're-derivation script refuses to compute any figure while any load-bearing row is null.',
    allowedDispositions: DISPOSITIONS,
    denominatorKeys: ['A_decisionCriticalRecall', 'B_selectorAccuracy',
      'C_legitimateSilenceSpecificity', 'E_nominationAccuracy'],
    rows: [
      { rowId: 'HS-H1', authoredClass: 'REQUIRED',
        disposition: 'AUTHORING_AMBIGUOUS',
        dispositionedBy: 'PRODUCT_OWNER', dispositionedAt: '2026-09-04',
        excludeFromDenominators: ['A_decisionCriticalRecall', 'B_selectorAccuracy',
          'E_nominationAccuracy'],
        note: 'General concern valid; the cooling-hold selector is not uniquely supported because '
          + 'the observation does not establish load type, cycle type, manufacturer/SOP unload '
          + 'criteria, or that a cooling hold is the applicable safe-unloading mechanism.' },
      ...index.map(r => ({ rowId: r.rowId, authoredClass: r.authoredClass,
        disposition: null, dispositionedBy: null, dispositionedAt: null,
        excludeFromDenominators: null, note: null })),
    ],
  };
  const ledgerPath = join(OUT, 'ROW-TRUTH-DISPOSITIONS.json');
  writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

  const idxPath = join(OUT, 'RECONCILIATION-INDEX.json');
  writeFileSync(idxPath, `${JSON.stringify({
    builtAt: new Date().toISOString(),
    scope: '§159 zero-cost human-truth reconciliation of the remaining load-bearing verifier rows',
    providerCalls: 0,
    distinctRowsBehindThePacket: byRow.size,
    blindedCases: key.length,
    alreadyAdjudicated: ALREADY_ADJUDICATED,
    rowsBuilt: index.length,
    dispositionLedger: 'ROW-TRUTH-DISPOSITIONS.json',
    TRUTH_AUTHORITY: 'AUTHORED_BY_EVALUATED_MODEL_FAMILY — humanReviewStatus PENDING for every row '
      + 'below except HS-H1',
    packets: index,
  }, null, 2)}\n`);

  console.log(`\n  ${index.length} packets -> ${OUT.replace(ROOT + '/', '')}`);
  console.log(`  disposition ledger -> ROW-TRUTH-DISPOSITIONS.json `
    + `(${ledger.rows.filter(r => !r.disposition).length} rows awaiting a human)`);
  console.log('  NO DISPOSITION WAS CHOSEN FOR ANY ROW.');
  console.log('  PROVIDER_CALLS_THIS_SCRIPT = 0');
}

main();
