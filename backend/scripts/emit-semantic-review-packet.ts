/**
 * §127 -- emit the independent product-owner safety-review packet for
 * FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1_CANDIDATE.
 *
 * Generated FROM the sealed corpus so the packet cannot drift from the truth it asks a reviewer to
 * bind.
 *
 * ==================== WHAT THIS DELIBERATELY DOES NOT EMIT ====================
 *
 * No scorer result, no provider output, no expected model answer, no pass/fail consequence, no
 * threshold, no margin, no capability arithmetic, and no indication of which determinations are
 * load-bearing. A reviewer told that a judgement is needed for a count is no longer reviewing the
 * safety question.
 */

import { SEMANTIC_ROWS, SEMANTIC_AUGMENTATION_IDENTIFIER } from
  '../src/hazlenz/expert-hazlenz/fixtures/semantic-augmentation-v1';

const FAMILY_LABEL: Record<string, string> = {
  chemical_exposure: 'chemical exposure',
  confined_space: 'confined space',
  electrical: 'electrical',
  fall_protection: 'fall protection',
  lockout_tagout: 'lockout/tagout',
  machine_guarding: 'machine guarding',
  mobile_equipment: 'mobile equipment',
};
const label = (f: string) => FAMILY_LABEL[f] ?? f;

const out: string[] = [];
const w = (s = '') => out.push(s);

w(`# Independent safety review — \`${SEMANTIC_AUGMENTATION_IDENTIFIER}\``);
w();
w('**You are the reviewer. Your judgement decides whether any of this becomes formal truth.**');
w();
w('Thirty-five newly authored inspection observations. None of this is formal truth yet — every');
w('determination below is a *candidate*, and nothing enters the evaluation until you accept it.');
w();
w('Three judgements per row need you:');
w();
w('- **A. Clarification** — is a question genuinely *owed*? A clarification is owed only when a');
w('  specific fact is missing AND its absence changes a safety decision. "More detail would help"');
w('  is not enough. If any plausible answer leads to the same action, it is not decision-critical.');
w('- **B. Cross-hazard interaction** — do two hazards genuinely *interact*? Two hazards in one room');
w('  are two hazards. An interaction exists only where assessing them separately would lose real');
w('  safety information.');
w('- **C. Family partition** — is each hazard family correctly placed? **FORBIDDEN is the narrow');
w('  bucket**: it means the text affirmatively rules the family out, so raising it would be a false');
w('  positive. Where a competent professional could legitimately raise a family, it belongs in');
w('  DEFENSIBLE. Absence of evidence is never evidence of absence.');
w();
w('Your last review of authored material overturned 3 of 14 forbidden determinations. That is why');
w('this step exists, and the same authoring hand wrote everything below.');
w();
w('Where I was unsure, I have said so under **Author uncertainty** rather than presenting the call');
w('as settled. Those are not the only places I may be wrong.');
w();
w('---');
w();

for (const entry of SEMANTIC_ROWS) {
  const { row, forbiddenRationale, gapPackets, interactionPackets, authorUncertainty } = entry;
  const s = row.source;
  const t = row.truth;

  w(`## ${s.rowId}`);
  w();
  w(`**Where / what:** ${s.inspectionContext.location} — ${s.inspectionContext.task}`);
  w();
  w('**Observation as recorded**');
  w();
  w('> ' + s.observation.replace(/\s+/g, ' ').trim());
  w();

  // ---------------------------------------------------------------- A. clarification
  w('### A. Clarification');
  w();
  if (gapPackets.length === 0) {
    w('**Candidate verdict: NOT OWED** — everything a decision needs is stated.');
  } else {
    w('**Candidate verdict: OWED**');
    for (const g of gapPackets) {
      w();
      w(`- **Exact missing fact:** ${g.missingFact}`);
      w(`- **Why it is not already in the observation:** ${g.whyAbsent}`);
      w(`- **Decision affected:** \`${g.affectedDecision}\``);
      w(`- **Why that is decision-critical:** ${g.alternativeOutcomes}`);
    }
  }
  w();
  w('_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________');
  w();

  // ---------------------------------------------------------------- B. interaction
  w('### B. Cross-hazard interaction');
  w();
  if (interactionPackets.length === 0) {
    const multi = t.presentHazardFamilies.length >= 2;
    w('**Candidate verdict: ABSENT**'
      + (multi
        ? ` — this row has more than one hazard present (${t.presentHazardFamilies.map(label).join(', ')})`
          + ' and they are judged to be co-occurrence, not an interaction.'
        : ' — fewer than two hazards are present.'));
  } else {
    w('**Candidate verdict: PRESENT**');
    for (const i of interactionPackets) {
      w();
      w(`- **Participating families:** ${i.participants.map(label).join(' + ')}`);
      w(`- **Interaction kind:** \`${i.interactionKind}\``);
      w('- **Evidence for each participant:**');
      for (const p of i.participants) w(`    - *${label(p)}* — ${i.evidencePerParticipant[p]}`);
      w(`- **The relationship:** ${i.relationship}`);
      w(`- **What separate assessment would lose:** ${i.independentLoss}`);
    }
  }
  w();
  w('_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________');
  w();

  // ---------------------------------------------------------------- C. family partition
  w('### C. Family partition');
  w();
  w('| family | candidate | rationale |');
  w('|---|---|---|');
  for (const f of t.presentHazardFamilies) {
    const lc = t.lifeCriticalHazardFamilies.includes(f) ? ' _(life-critical)_' : '';
    const ns = t.negatedOrSafeStateFamilies.includes(f) ? ' _(recorded safe/controlled)_' : '';
    w(`| **${label(f)}** | PRESENT${lc}${ns} | established by the observation |`);
  }
  for (const f of t.forbiddenHazardFamilies) {
    w(`| **${label(f)}** | **FORBIDDEN** | ${forbiddenRationale[f]} |`);
  }
  const shownDefensible = t.defensibleHazardFamilies;
  if (shownDefensible.length) {
    w(`| ${shownDefensible.map(label).join(', ')} | DEFENSIBLE | not ruled in or out by the text; `
      + 'raising one is neither required nor penalised |');
  }
  w();
  if (t.forbiddenHazardFamilies.length === 0) {
    w('_No family is forbidden on this row — nothing here can be scored as a false positive._');
    w();
  }
  w('_Your call:_ correct any classification above → ____________');
  w();

  if (authorUncertainty) {
    w(`> **Author uncertainty.** ${authorUncertainty}`);
    w();
  }
  w('---');
  w();
}

w('## Returning your verdicts');
w();
w('Per row: a line for A, B and C is enough — e.g. `SEM-01 A:APPROVE B:APPROVE C:APPROVE`.');
w('For anything you change, say what it should be instead.');
w();
w('Rejections cost the corpus material and nothing will be rewritten to win it back. If your review');
w('leaves too little to support the evaluation, the correct outcome is that the evaluation stops and');
w('is redesigned — not that the judgements are adjusted until they fit.');
w();

process.stdout.write(out.join('\n'));
