/**
 * §126 PHASE 1 -- emit the independent product-owner safety-review packet for
 * FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V1.
 *
 * Generated FROM the sealed corpus so the packet cannot drift from the truth keys it asks a
 * reviewer to approve. Hand-transcription is not acceptable for a document whose purpose is to
 * let a qualified reviewer bind source-case truth.
 *
 * ==================== WHAT THIS DELIBERATELY DOES NOT EMIT ====================
 *
 * No provider output, no gate score, no threshold, no margin, no capability arithmetic, and no
 * indication of whether changing any particular label would help or hurt the cohort. A reviewer
 * told that a label is load-bearing is no longer reviewing the source case. The packet therefore
 * carries ONLY what is needed to judge the safety question: what was observed, and whether the
 * labels over that observation are defensible.
 */

import { AUGMENTATION_ROWS, AUGMENTATION_IDENTIFIER } from
  '../src/hazlenz/expert-hazlenz/fixtures/negative-control-augmentation-v1';

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
const list = (fs: readonly string[]) => (fs.length ? fs.map(label).join(', ') : '_none_');

const out: string[] = [];
const w = (s = '') => out.push(s);

w(`# Independent safety review — \`${AUGMENTATION_IDENTIFIER}\``);
w();
w('**You are the reviewer. Your judgement controls the source-case truth in this corpus.**');
w();
w('Sixteen inspection observations were authored to broaden this evaluation\'s coverage. Each one');
w('carries a set of labels saying which hazard families are *present*, which are *defensible* for a');
w('reasonable reviewer to raise, and which are *forbidden* — meaning the observation affirmatively');
w('rules them out, so raising one would be a false positive rather than diligence.');
w();
w('**The forbidden labels are the ones that need your judgement.** A family is only forbidden where');
w('the text contains a fact that defeats it. If you think a competent safety professional could');
w('legitimately raise a family that is marked forbidden here, that label is wrong and must be');
w('corrected before this corpus is used — because it would score correct reasoning as an error.');
w();
w('For each row, reply **APPROVE**, or **REJECT/CORRECT** with what you would change.');
w();
w('These cases were written by the same agent that is asking you to review them. That is exactly why');
w('this step exists: an authoring self-review is not an independent safety review.');
w();
w('---');
w();

for (const entry of AUGMENTATION_ROWS) {
  const { row, forbiddenRationale } = entry;
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
  w(`- **Hazards present (labelled real):** ${list(t.presentHazardFamilies)}`);
  w(`- **Defensible to raise (neither required nor penalised):** ${list(t.defensibleHazardFamilies)}`);
  w(`- **Forbidden (raising one is scored as a false positive):** ${list(t.forbiddenHazardFamilies)}`);

  if (t.negatedOrSafeStateFamilies.length) {
    w(`- **Recorded as safe / resolved / correctly controlled:** ${list(t.negatedOrSafeStateFamilies)}`);
  }
  if (t.lifeCriticalHazardFamilies.length) {
    w(`- **Marked life-critical:** ${list(t.lifeCriticalHazardFamilies)}`);
  }

  if (t.decisionCriticalGaps.length) {
    w('- **Clarification obligation:** a question IS owed —');
    for (const g of t.decisionCriticalGaps) {
      w(`    - ${g.description} _(affects: ${g.affectedDecision})_`);
    }
  } else {
    w('- **Clarification obligation:** NO question is owed — everything a decision needs is stated.');
  }

  if (t.recordedInteractions.length) {
    for (const i of t.recordedInteractions) {
      w(`- **Recorded interaction:** \`${i.interactionKind}\` — ${list(i.participants)} `
        + '(the hazards make each other worse, rather than merely coexisting)');
    }
  }

  w();
  if (t.forbiddenHazardFamilies.length) {
    w('**Why each forbidden family is claimed to be ruled out — the judgement to check:**');
    w();
    for (const f of t.forbiddenHazardFamilies) {
      w(`- **${label(f)}** — ${forbiddenRationale[f]}`);
    }
  } else {
    w('**No family is forbidden on this row.** Every family not present is treated as defensible, so');
    w('nothing here can be scored as a false positive.');
  }
  w();
  w(`**Authoring rationale.** ${t.authoringRationale}`);
  w();
  w('**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________');
  w();
  w('---');
  w();
}

w('## How to return this');
w();
w('A line per row is enough, e.g. `AUG-01 APPROVE`. For anything you reject, say which family and');
w('what it should be instead — *present*, *defensible*, or *safe/resolved*.');
w();
w('A rejection costs the corpus a label and nothing will be rewritten to win it back. If your');
w('review leaves the corpus unable to support the evaluation, the correct outcome is that the');
w('evaluation stops and is redesigned — not that the labels are adjusted until it fits.');
w();

process.stdout.write(out.join('\n'));
