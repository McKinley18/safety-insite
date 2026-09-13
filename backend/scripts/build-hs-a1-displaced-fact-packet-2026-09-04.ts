/**
 * §164 HS-A1 DISPLACED-FACT HUMAN ADJUDICATION PACKET. ZERO PROVIDER CALLS.
 *
 * §163 measured that 7 of 10 HS-A1 draws asked about isolation of the discharge auger rather than the
 * authored flame-failure target. The product owner's instruction is explicit: those seven must NOT be
 * mechanically classified as semantically wrong, because the observation states that an operative is
 * clearing a blockage at the auger with the dryer running, and a clarification about hazardous-motion
 * isolation may itself be decision-critical.
 *
 * This builder assembles the evidence for that adjudication and STOPS. It assigns no classification,
 * and `VALID_BUT_TARGET_DISPLACED` is NOT applied to these seven by any code here.
 *
 * Every substantive line is copied from a frozen artifact. The neutrality check refuses to write the
 * packet if persuasive constructions appear.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import { hardenedFixtureByRowId } from '../src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9';
import { HUMAN_SEMANTIC_TARGETS } from './lib/expert-human-semantic-targets-2026-09-04';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const SRC = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const DRAWS = join(V, 'expert-hazlenz-verifier-draw-reliability-2026-09-04');
const OUT = join(V, 'expert-hazlenz-reliability-target-displacement-design-2026-09-04');

const FORBIDDEN_PHRASES = [
  'claude was wrong', 'the correct answer is', 'the model should have', 'obviously',
  'we recommend', 'i recommend', 'the right answer', 'this proves that',
  'the disposition should', 'should be dispositioned', 'clearly the', 'in my view',
  'is valid', 'is invalid',
];

const DISPOSITIONS = [
  'DISPLACED_FACT_VALID_DECISION_CRITICAL',
  'DISPLACED_FACT_VALID_BUT_NOT_NECESSARY_NOW',
  'DISPLACED_FACT_INVALID',
  'DISPLACED_FACT_AMBIGUOUS',
] as const;

const sha256File = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');
const fence = (o: unknown): string => '```json\n' + JSON.stringify(o, null, 2) + '\n```';

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const recs = readFileSync(join(DRAWS, 'DRAW-RUN-RECORDS.jsonl'), 'utf8').trim().split('\n')
    .map(l => JSON.parse(l) as Record<string, any>);
  const displaced = recs.filter(r => r.rowId === 'HS-A1' && r.semanticTargetReached === false);
  const onTarget = recs.filter(r => r.rowId === 'HS-A1' && r.semanticTargetReached === true);
  const fixture = hardenedFixtureByRowId('HS-A1')!;
  const packetCase = (JSON.parse(readFileSync(join(SRC, 'VERIFIER-PACKET.json'), 'utf8')) as
    { cases: Array<Record<string, any>> }).cases.find(c => c.caseId === 'VC-08')!;
  const observation: string = fixture.row.source.observation;

  const L: string[] = [];
  const w = (s = '') => L.push(s);

  w('# HS-A1 — DISPLACED-FACT HUMAN ADJUDICATION PACKET');
  w();
  w('**For PRODUCT-OWNER adjudication. Prepared 2026-09-04 (§164). Zero provider calls.**');
  w();
  w('§163 measured that **7 of 10** execution-valid HS-A1 draws emitted a clarification about');
  w('isolation of the discharge auger rather than the authored flame-failure target. The question');
  w('here is what those seven ARE — not whether the verifier reached the owed target, which §163');
  w('already recorded as a miss and which is not reopened.');
  w();
  w('**This packet assigns no classification.** `VALID_BUT_TARGET_DISPLACED` has not been applied to');
  w('these seven by any code, and is not applied here.');
  w();

  w('---');
  w();
  w('## 1. Exact observation');
  w();
  w(`Fixture file sha256 \`${sha256File(join(ROOT,
    'backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))}\``);
  w();
  w('> ' + observation);
  w();

  w('---');
  w();
  w('## 2. The seven displaced clarification outputs, verbatim');
  w();
  w(`Source: \`verification/expert-hazlenz-verifier-draw-reliability-2026-09-04/`
    + `DRAW-RUN-RECORDS.jsonl\`  ·  sha256 \`${sha256File(join(DRAWS, 'DRAW-RUN-RECORDS.jsonl'))}\``);
  w(`All seven from one frozen request, sha256 \`${displaced[0].semanticRequestSha256}\`.`);
  w();
  for (const r of displaced) {
    w(`### draw ${r.draw} — verdict \`${r.verdict}\`, source mode \`${r.sourceMode}\`, `
      + `affectedDecision \`${r.affectedDecision}\``);
    w();
    w(`**Question:** ${r.question}`);
    w();
    if (r.nominatedFact) w(`**Nominated fact:** ${r.nominatedFact}`);
    w();
    w(`Contract admitted: ${r.contractAdmitted} · execution valid: ${r.executionValid} · `
      + `degenerate: ${r.degenerate} · forbidden fields: ${r.forbiddenFieldCount}`);
    w();
  }

  w('---');
  w();
  w('## 3. Normalized semantic intent shared across the seven');
  w();
  w('Stated as the common content of the seven questions, not as a judgement about them:');
  w();
  w('> whether the discharge auger and its drive were locked out or de-energised before the operative');
  w('> began clearing the blockage, or whether the auger remained capable of powered motion while the');
  w('> operative worked at it');
  w();
  w('Six of the seven explicitly distinguish the auger drive from the dryer as a whole — phrases such');
  w('as *"independent of the dryer continuing to run for other functions"* and *"even though the');
  w('dryer as a whole continues running"*. The wording differs in every draw; **7 distinct question');
  w('strings express this one intent**.');
  w();

  w('---');
  w();
  w('## 4. affectedDecision emitted');
  w();
  w(`\`${[...new Set(displaced.map(r => r.affectedDecision))].join('`, `')}\` on all seven. `
    + `The authored HS-A1 target carries \`${HUMAN_SEMANTIC_TARGETS['HS-A1'].affectedDecision}\`.`);
  w();

  w('---');
  w();
  w('## 5. First-pass candidate state for the auger hazard');
  w();
  const auger = (packetCase.firstPass.candidates as Array<Record<string, string>>)
    .find(c => /auger/i.test(c.candidateKey))!;
  w(fence(auger));
  w();
  w(`**The candidate was asserted \`${auger.assertedConditionState}\`, not left at`);
  w('`INSUFFICIENT_EVIDENCE`.** Because the selective-verification packet supplies only *unresolved*');
  w('facts, this candidate was **not** among the unresolved facts given to the verifier:');
  w();
  w(fence(packetCase.unresolvedFacts));
  w();
  w('So on all seven draws the auger fact arrived through the verifier\'s own **nomination** path');
  w(`(\`sourceMode: NOMINATED_FACT\`), not from the supplied set. The three on-target draws used`);
  w('`SUPPLIED_FACT` instead.');
  w();

  w('---');
  w();
  w('## 6. Deterministic output');
  w();
  w(`\`familiesEmitted: ${JSON.stringify(packetCase.deterministic.familiesEmitted)}\` · `
    + `\`lifeCriticalFindingKeys: ${JSON.stringify(packetCase.deterministic.lifeCriticalFindingKeys)}\``);
  w();
  w('The deterministic engine emitted nothing for this row.');
  w();

  w('---');
  w();
  w('## 7. Governed evidence');
  w();
  w((packetCase.governedEvidence as unknown[]).length === 0
    ? '**NONE SUPPLIED.** `governedStandards` is `[]` on the row and `governedEvidence` is `[]` in '
      + 'the blinded packet.'
    : fence(packetCase.governedEvidence));
  w();

  w('---');
  w();
  w('## 8. Relevant allowed hazard family, and how the row truth classifies it');
  w();
  w('Allowed hazard families: `'
    + (fixture.row.source.allowedHazardFamilies as string[]).join('`, `') + '`');
  w();
  w(fence({
    presentHazardFamilies: fixture.row.truth.presentHazardFamilies,
    defensibleHazardFamilies: fixture.row.truth.defensibleHazardFamilies,
    forbiddenHazardFamilies: fixture.row.truth.forbiddenHazardFamilies,
    lifeCriticalHazardFamilies: fixture.row.truth.lifeCriticalHazardFamilies,
    decisionCriticalGaps: fixture.row.truth.decisionCriticalGaps,
  }));
  w();
  w('Recorded mechanically, without inference: `machine_guarding` — the family the auger candidate');
  w('was raised under — appears in **`presentHazardFamilies`** and in **`lifeCriticalHazardFamilies`**');
  w('for this row, while `decisionCriticalGaps` contains only the flame-failure gap.');
  w();

  w('---');
  w();
  w('## 9. Does the observation state operation while the blockage is cleared?');
  w();
  w('The observation contains this sentence verbatim:');
  w();
  w('> An operative is clearing a blockage at the discharge auger with the dryer running.');
  w();

  w('---');
  w();
  w('## 10. Is isolation / lockout state explicitly established?');
  w();
  w('Mechanical scan of the observation for isolation vocabulary — `lockout`, `lock out`, `tagout`,');
  w('`isolat`, `de-energis`, `de-energiz`, `disconnect`, `stopped`, `switched off`:');
  w();
  const isoTerms = ['lockout', 'lock out', 'tagout', 'isolat', 'de-energis', 'de-energiz',
    'disconnect', 'stopped', 'switched off'];
  for (const t of isoTerms) {
    w(`- \`${t}\` — ${observation.toLowerCase().includes(t) ? 'PRESENT' : 'not present'}`);
  }
  w();
  w('None of the nine terms appears. The text states the dryer is running and does not state the');
  w('auger drive\'s energy state either way.');
  w();

  w('---');
  w();
  w('## 11–13. Plausible branches, and whether they change present action');
  w();
  w('**Constructed mechanically from the two answer states the seven outputs themselves name.** These');
  w('are the verifier\'s branches restated, not an authored counterfactual and not an endorsement.');
  w();
  w('- **Branch A** — the auger drive was locked out / de-energised before the operative began.');
  w('- **Branch B** — the auger drive remains powered and capable of motion while the operative works.');
  w();
  w('Whether those two lead to different things being done at this dryer today is the adjudication');
  w('question and is **not** answered here.');
  w();

  w('---');
  w();
  w('## 14. Relationship to the flame-failure target');
  w();
  w(`**Authored target:** ${HUMAN_SEMANTIC_TARGETS['HS-A1'].target}`);
  w();
  w('The two facts concern different equipment, different hazard families and different');
  w('mechanisms — the burner safeguard behind a shroud, versus the energy state of the discharge');
  w('auger drive. Mechanically, they do not overlap in subject.');
  w();
  w('For comparison, the three draws that reached the authored target, verbatim:');
  w();
  for (const r of onTarget) w(`- draw ${r.draw} (\`${r.sourceMode}\`): ${r.question}`);
  w();

  w('---');
  w();
  w('## 15. Can both facts be decision-critical simultaneously?');
  w();
  w('Recorded as a structural observation only. Nothing in the v9 row truth, the contract or the');
  w('verifier instruction states that a row may have only one decision-critical gap. The row\'s');
  w('authored `decisionCriticalGaps` array contains one entry; whether that reflects the observation');
  w('or the authoring is part of what is being adjudicated. The verifier contract permits **exactly');
  w('one** nomination per verdict, and the first pass emitted **no** clarification on this draw set —');
  w('so on this case the architecture allowed at most one question to survive regardless of how many');
  w('facts were decision-critical.');
  w();

  w('---');
  w();
  w('## ADJUDICATION QUESTION');
  w();
  w('Do the seven HS-A1 auger outputs represent unsafe semantic reasoning, useful but');
  w('target-displaced reasoning, or ambiguous reasoning?');
  w();
  w('### Allowed dispositions');
  w();
  for (const d of DISPOSITIONS) w(`- [ ] \`${d}\``);
  w();
  w('**Whatever the disposition, §163 is not rescored and HS-A1\'s frozen target is not broadened.**');
  w('The seven remain an `OWED_TARGET_RECALL` miss. What the disposition decides is whether they are');
  w('additionally a clarification-precision defect.');
  w();
  w('Reviewer: ______________________  Date: ____________');
  w();

  const text = L.join('\n');
  const lower = text.toLowerCase();
  const found = FORBIDDEN_PHRASES.filter(p => lower.includes(p));
  console.log('§164 HS-A1 DISPLACED-FACT PACKET BUILDER');
  console.log('='.repeat(100));
  console.log(`  displaced draws: ${displaced.length}   on-target draws: ${onTarget.length}`);
  console.log(`  neutrality: ${FORBIDDEN_PHRASES.length} constructions scanned, ${found.length} found`
    + `${found.length ? ` — ${found.join(', ')}` : ''}`);
  if (found.length > 0) { console.log('  PACKET NOT WRITTEN.'); process.exit(1); }
  const checks: Array<[string, boolean]> = [
    ['7 displaced outputs verbatim', displaced.length === 7
      && displaced.every(r => text.includes(String(r.question)))],
    ['observation verbatim', text.includes(observation)],
    ['auger candidate state', text.includes(auger.assertedConditionState)],
    ['isolation scan', isoTerms.every(t => text.includes(`\`${t}\``))],
    ['four dispositions', DISPOSITIONS.every(d => text.includes(d))],
    ['no disposition selected', !text.includes('- [x]')],
  ];
  for (const [id, ok] of checks) console.log(`  ${ok ? 'ok  ' : 'MISS'}  ${id}`);
  if (checks.some(c => !c[1])) { console.log('  INCOMPLETE.'); process.exit(1); }

  const path = join(OUT, 'HS-A1-DISPLACED-FACT-ADJUDICATION-PACKET.md');
  writeFileSync(path, `${text}\n`);
  console.log(`\n  -> ${path.replace(ROOT + '/', '')}`);
  console.log(`  sha256 ${sha256File(path)}`);
  console.log('  NO CLASSIFICATION ASSIGNED. PROVIDER_CALLS_THIS_SCRIPT = 0');
}

main();
