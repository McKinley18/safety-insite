/**
 * §117 PHASE 9 -- `CONTRADICTS_DETERMINISTIC` CALIBRATION. DIAGNOSTIC, RECORDING-ONLY.
 *
 * ZERO provider calls: reads frozen transport JSONL from prior runs and re-classifies what is
 * already there. No pass/fail gate, no production behaviour, no prompt change, no contract change.
 *
 * ==================== THE OBSERVATION BEING DIAGNOSED ====================
 *
 * §116/D-128 measured `relationshipToDeterministic = CONTRADICTS_DETERMINISTIC` on 23 of 29
 * projected local candidates (79%) versus 3 of 27 baseline (11%), and disclosed that the figure
 * OVERSTATES true disagreement -- `V8`'s `chemical_exposure` candidate declared it while its own
 * text said "the deterministic finding already identifies chemical exposure as active", which is an
 * ADDITION, not a contradiction.
 *
 * This derives an INDEPENDENT classification from the candidate's own family and asserted state
 * against the projected dispositions, and reports it beside the model's self-declared label. The
 * derived class is evidence about the label; it is never fed back to the model and never gates.
 *
 *   TRUE_CONTRADICTION          same family as a CONTROLLED/NOT_APPLICABLE assessment, asserted
 *                               ACTIVE, AND a stated current-exposure fact is named.
 *   UNSUPPORTED_CONTRADICTION   same, but no stated current fact -- the §115 R6 defect shape.
 *   AGREEMENT                   same family, and the asserted state matches the assessment.
 *   ADDITIONAL_NOT_CONTRADICTING same family as an ACTIVE assessment -- adding detail, not opposing.
 *   CROSS_FAMILY_ADDITION       a family the deterministic layer never assessed. Cannot contradict
 *                               something that was never said.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CURRENT_EXPOSURE = /\b(?:is|are|was|were)\s+(?:currently\s+)?(?:running|operating|reaching|grinding|working|positioned|exposed)|\bcurrently\s+\w+ing\b|\bnow\s+running\b|\bremain(?:s|ed|ing)?\s+(?:connected|charged|live|energi[sz]ed)\b|\bnot\s+(?:yet\s+)?(?:been\s+)?(?:bled|verified|relieved)\b|\bno\s+lock\s+or\s+tag\b|\bwithout\s+operator\s+action\b|\bpoint\s+of\s+operation\s+exposed\b/i;

type Derived = 'TRUE_CONTRADICTION' | 'UNSUPPORTED_CONTRADICTION' | 'AGREEMENT'
  | 'ADDITIONAL_NOT_CONTRADICTING' | 'CROSS_FAMILY_ADDITION';

interface Row {
  caseId: string; arm: string; rep: number;
  projectedDispositions?: string[];
  wire?: { expertHazardCandidates?: Array<Record<string, string>> };
}

function derive(family: string, state: string, text: string,
                dispositions: Map<string, string>): Derived {
  const d = dispositions.get(family);
  if (!d) return 'CROSS_FAMILY_ADDITION';
  if (d === 'CONTROLLED' || d === 'NOT_APPLICABLE') {
    if (state !== 'ACTIVE') return 'AGREEMENT';
    return CURRENT_EXPOSURE.test(text) ? 'TRUE_CONTRADICTION' : 'UNSUPPORTED_CONTRADICTION';
  }
  if (d === 'ACTIVE') return state === 'ACTIVE' ? 'ADDITIONAL_NOT_CONTRADICTING' : 'AGREEMENT';
  return 'ADDITIONAL_NOT_CONTRADICTING';
}

function analyze(path: string, label: string) {
  const declaredVsDerived: Record<string, Record<string, number>> = {};
  const perArm: Record<string, Record<string, number>> = {};
  let total = 0;
  for (const line of readFileSync(path, 'utf8').trim().split('\n')) {
    const o = JSON.parse(line) as Row;
    const dispositions = new Map<string, string>();
    for (const s of o.projectedDispositions ?? []) {
      const [fam, rest] = s.split('=');
      dispositions.set(fam, (rest ?? '').split('@')[0]);
    }
    for (const c of o.wire?.expertHazardCandidates ?? []) {
      const declared = c.relationshipToDeterministic ?? 'UNSET';
      const d = derive(c.hazardFamily, c.assertedConditionState,
        `${c.evidenceBasis ?? ''} ${c.reasoning ?? ''}`, dispositions);
      declaredVsDerived[declared] = declaredVsDerived[declared] ?? {};
      declaredVsDerived[declared][d] = (declaredVsDerived[declared][d] ?? 0) + 1;
      perArm[o.arm] = perArm[o.arm] ?? {};
      perArm[o.arm][d] = (perArm[o.arm][d] ?? 0) + 1;
      total += 1;
    }
  }
  const declaredContradicts = Object.values(declaredVsDerived['CONTRADICTS_DETERMINISTIC'] ?? {})
    .reduce((a, b) => a + b, 0);
  const trulyContradicting = (declaredVsDerived['CONTRADICTS_DETERMINISTIC'] ?? {})['TRUE_CONTRADICTION'] ?? 0;
  return {
    label, source: path, totalCandidates: total,
    declaredVsDerived, perArm,
    declaredContradicts,
    trulyContradicting,
    spuriousContradictionLabels: declaredContradicts - trulyContradicting,
    note: 'RECORDING-ONLY. No gate, no production behaviour, no prompt change, no contract change.',
  };
}

const V116 = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-deterministic-projection-design-2026-08-31', 'transport', 'ab-run2-guarded.jsonl');
const V117 = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-deterministic-projection-design-2026-08-31', 'transport', 'post-guarding-repair.jsonl');

const out = [analyze(V116, 'S116_pre_guarding_repair'), analyze(V117, 'S117_post_guarding_repair')];
for (const r of out) {
  console.log(`===== ${r.label}`);
  console.log(`  candidates=${r.totalCandidates}  declaredCONTRADICTS=${r.declaredContradicts}`
    + `  trulyContradicting=${r.trulyContradicting}  spuriousLabels=${r.spuriousContradictionLabels}`);
  for (const [declared, derived] of Object.entries(r.declaredVsDerived)) {
    console.log(`   declared ${declared}: ${JSON.stringify(derived)}`);
  }
  for (const [arm, derived] of Object.entries(r.perArm)) {
    console.log(`   arm ${arm}: ${JSON.stringify(derived)}`);
  }
}

const dir = join(__dirname, '..', '..', 'verification',
  'hazlenz-machine-guarding-applicability-precedence-2026-08-31', 'results');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'contradicts-deterministic-calibration.json'), JSON.stringify(out, null, 2) + '\n');
console.log('\nwritten:', join(dir, 'contradicts-deterministic-calibration.json'));
