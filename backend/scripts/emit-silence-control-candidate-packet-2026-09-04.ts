/**
 * §168 EXPERT HAZLENZ -- LINT AND EMIT THE CANDIDATE SILENCE-CONTROL PACKET. ZERO PROVIDER CALLS.
 *
 * Runs the mechanical checks over the drafted candidates and writes the packet a product owner
 * reviews. A clean lint does NOT make a row valid: validity is the human review's to decide, and
 * `AUTHORITY_STATUS` stays `CANDIDATE_NOT_AUTHORITATIVE` whatever this script prints.
 */

import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  SILENCE_CONTROL_CANDIDATES, SILENCE_CONTROL_CANDIDATES_VERSION, AUTHORITY_STATUS,
  FORBIDDEN_CONCLUSION_CUES, lintCandidate, observationLengthReport,
} from './lib/expert-silence-control-candidates-2026-09-04';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const OUT = join(V, 'expert-hazlenz-verifier-v3-human-binding-review-2026-09-04');
const PACKET = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03', 'VERIFIER-PACKET.json');

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

/** The two human-authoritative REQUIRED observations these controls would sit beside. */
const packet = JSON.parse(readFileSync(PACKET, 'utf8')) as
{ cases: Array<{ caseId: string; observation: string }> };
const requiredRowLengths: Record<string, number> = {
  'HS-A1': packet.cases.find(c => c.caseId === 'VC-08')!.observation.length,
  'HS-E1': packet.cases.find(c => c.caseId === 'VC-04')!.observation.length,
};

const lints = SILENCE_CONTROL_CANDIDATES.map(lintCandidate);
const lengths = observationLengthReport(requiredRowLengths);
const totalProblems = lints.reduce((t, l) => t + l.problems.length, 0);
const domains = [...new Set(SILENCE_CONTROL_CANDIDATES.map(c => c.hazardDomain))];

mkdirSync(OUT, { recursive: true });

writeFileSync(join(OUT, 'SILENCE-CONTROL-CANDIDATES.json'), JSON.stringify({
  version: SILENCE_CONTROL_CANDIDATES_VERSION,
  AUTHORITY_STATUS,
  createdAt: new Date().toISOString(),
  WARNING: 'THESE ARE MODEL-DRAFTED CANDIDATES AND ARE NOT EVALUATION TRUTH. §162 established that '
    + 'five of seven rows of model-authored evaluation truth did not survive human review and three '
    + 'were invalid. No denominator, rate or figure may rest on these rows unless and until a '
    + 'product-owner review returns a disposition for each.',
  candidateCount: SILENCE_CONTROL_CANDIDATES.length,
  distinctHazardDomains: domains,
  lint: { totalProblems, perCandidate: lints },
  lengthCueAnalysis: lengths,
  forbiddenConclusionCuesChecked: FORBIDDEN_CONCLUSION_CUES,
  candidates: SILENCE_CONTROL_CANDIDATES,
  dispositionForm: SILENCE_CONTROL_CANDIDATES.map(c => ({
    candidateId: c.candidateId,
    hazardDomain: c.hazardDomain,
    disposition: null,
    allowedDispositions: ['SILENCE_CONTROL_VALID', 'SILENCE_CONTROL_INVALID',
      'SILENCE_CONTROL_AMBIGUOUS', 'INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION'],
    disputedCounterfactuals: null,
    reviewerNote: null,
  })),
  reviewer: null,
  reviewedAt: null,
}, null, 2) + '\n');

// ---------------------------------------------------------------- human-readable packet

const md: string[] = [];
md.push('# Candidate silence-control rows — for product-owner review');
md.push('');
md.push('**§168, 2026-09-04. Zero provider calls. DRAFT MATERIAL, NOT EVALUATION TRUTH.**');
md.push('');
md.push('```');
md.push(`AUTHORITY_STATUS = ${AUTHORITY_STATUS}`);
md.push('```');
md.push('');
md.push('These rows were **drafted by a model**. §162 established that five of seven rows of');
md.push('model-authored evaluation truth did not survive human review and three were invalid, and');
md.push('this operation\'s authorization requires silence-control truth to be "not authored by the');
md.push('evaluated provider as final authority". **No denominator, rate or figure may rest on these');
md.push('rows unless and until a review returns a disposition for each.**');
md.push('');
md.push('## Why a silence control is harder to author than a REQUIRED row');
md.push('');
md.push('A REQUIRED row asserts one named, checkable fact. A silence row asserts that **nothing** is');
md.push('decision-critical — an unbounded claim about everything the observation does not say. So');
md.push('each candidate below states the facts it settles *with the verbatim span that settles');
md.push('each*, and then lists the plausible facts a reasonable verifier might reach for **with an');
md.push('explicit argument for why answering each one either way leads to the same thing being done');
md.push('today**.');
md.push('');
md.push('That last list is the row\'s real content. It lets a reviewer disagree with a specific');
md.push('counterfactual rather than with a verdict.');
md.push('');
md.push('---');
md.push('');
md.push('## Mechanical lint');
md.push('');
md.push('| candidate | domain | observation chars | settled facts | counterfactuals | problems |');
md.push('|---|---|---|---|---|---|');
for (let i = 0; i < SILENCE_CONTROL_CANDIDATES.length; i += 1) {
  const c = SILENCE_CONTROL_CANDIDATES[i];
  const l = lints[i];
  md.push(`| \`${c.candidateId}\` | ${c.hazardDomain} | ${l.observationChars} | `
    + `${l.settledFactCount} | ${l.counterfactualCount} | `
    + `${l.problems.length === 0 ? '0' : '**' + l.problems.join('; ') + '**'} |`);
}
md.push('');
md.push('A clean lint does **not** make a row valid. It catches only the failures decidable without');
md.push('judgement: a settling span that is not verbatim, a conclusion cue in the observation, a');
md.push('counterfactual whose branches are identical or whose reasoning does not actually state');
md.push('action-equivalence.');
md.push('');
md.push('### The cue risk these rows cannot fix on their own');
md.push('');
md.push('A row that settles everything is **longer** than a row that leaves a gap. If the assembled');
md.push('cohort\'s silence rows are systematically longer than its REQUIRED rows, length becomes a');
md.push('cue for "ask nothing" and the measurement is worthless.');
md.push('');
md.push(`Candidate observations: ${lengths.candidateMin}–${lengths.candidateMax} characters `
  + `(mean ${lengths.candidateMean}).`);
md.push(`Existing REQUIRED rows: ${Object.entries(requiredRowLengths)
  .map(([k, v]) => `${k} ${v}`).join(', ')}.`);
md.push('');
md.push(`**\`${lengths.separationRisk}\`** — ${lengths.note}`);
md.push('');
md.push('---');
md.push('');

for (const c of SILENCE_CONTROL_CANDIDATES) {
  md.push(`## ${c.candidateId} — ${c.hazardDomain}`);
  md.push('');
  md.push(`**Jurisdiction:** \`${c.jurisdiction}\` · **Tested question family:** ${c.testedQuestionFamily}`);
  md.push('');
  md.push('### Observation');
  md.push('');
  md.push('> ' + c.observation);
  md.push('');
  md.push('### Decision-critical facts the observation SETTLES');
  md.push('');
  md.push('| fact | settled by this span |');
  md.push('|---|---|');
  for (const s of c.settledFacts) {
    md.push(`| ${s.fact} | "${s.settledBySpan}" |`);
  }
  md.push('');
  md.push('### Plausible omitted facts, and why each changes nothing today');
  md.push('');
  for (const o of c.plausibleOmittedFacts) {
    md.push(`**${o.omittedFact}**`);
    md.push('');
    md.push(`- if *${o.branchA}* · if *${o.branchB}*`);
    md.push(`- ${o.whySameActionEitherWay}`);
    md.push('');
  }
  md.push('### No hidden competing gap');
  md.push('');
  md.push(c.noHiddenCompetingGap);
  md.push('');
  md.push('### Applicability is unambiguous');
  md.push('');
  md.push(c.applicabilityIsUnambiguous);
  md.push('');
  md.push('### Disposition');
  md.push('');
  md.push('- [ ] `SILENCE_CONTROL_VALID`');
  md.push('- [ ] `SILENCE_CONTROL_INVALID`');
  md.push('- [ ] `SILENCE_CONTROL_AMBIGUOUS`');
  md.push('- [ ] `INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION`');
  md.push('');
  md.push('Disputed counterfactual(s), if any: ______________________________________');
  md.push('');
  md.push('---');
  md.push('');
}

md.push('## What a clean review would and would not unlock');
md.push('');
md.push('**Would:** a denominator for falsifier D — whether the binding architecture manufactures');
md.push('questions where silence was right — and therefore the first evidence on the precision half');
md.push('of every claim this architecture wants to make.');
md.push('');
md.push('**Would not:** any production rate. Five rows across five domains is a *semantic diversity*');
md.push('target, not a statistical sample, and must never be reported as one.');
md.push('');
md.push('**Reviewer:** ______________________  **Date:** ____________');
md.push('');

writeFileSync(join(OUT, 'SILENCE-CONTROL-CANDIDATE-PACKET.md'), md.join('\n') + '\n');

console.log('§168 silence-control candidate packet written');
console.log(`  candidates: ${SILENCE_CONTROL_CANDIDATES.length} across ${domains.length} domains`);
console.log(`  lint problems: ${totalProblems}`);
console.log(`  length band: ${lengths.candidateMin}–${lengths.candidateMax} `
  + `(REQUIRED rows: ${Object.values(requiredRowLengths).join(', ')}) → ${lengths.separationRisk}`);
console.log(`  AUTHORITY_STATUS = ${AUTHORITY_STATUS}`);
console.log(`  dispositions assigned by this script: 0 (all null)`);
for (const f of ['SILENCE-CONTROL-CANDIDATES.json', 'SILENCE-CONTROL-CANDIDATE-PACKET.md']) {
  console.log(`    ${f}  ${sha256(readFileSync(join(OUT, f), 'utf8')).slice(0, 24)}…`);
}
console.log('\nPROVIDER CALLS: 0   COST: $0.00');
