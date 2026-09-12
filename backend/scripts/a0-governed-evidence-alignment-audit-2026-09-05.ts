/**
 * §181 — GOVERNED EVIDENCE ALIGNMENT AUDIT. READ-ONLY. ZERO PROVIDER CALLS, ZERO DATABASE OPERATIONS.
 *
 * For every approved knowledge record carrying both `evidenceQuestions` and `verificationMethods`,
 * ask whether each question demands the property the method can establish.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * It is NOT an automated semantic scorer, and the authorization forbids building one. Every
 * classification below is an ENGINEERING JUDGEMENT recorded by name in a table in this file, made by
 * reading the question against the method. The code does no comparison at all: it looks each pair up
 * in the table, counts the results, and reports any pair the table does not cover. If a record is
 * added to the registry, this audit reports it as UNCLASSIFIED rather than guessing.
 *
 * That structure is deliberate. A classifier here would be exactly the matcher §160/§161 retired,
 * and it would also be dishonest: the judgement is mine, so it should be legible as mine and
 * reviewable as mine rather than hidden behind a rule.
 *
 * PROVENANCE: AI-performed development audit. It is not human adjudication and must not be recorded
 * as one; a human reviewing these 28 classifications is a separate act.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const ROOT = join(__dirname, '..', '..');
const REGISTRY = join(ROOT, 'safescope-data', 'approved-knowledge', 'registry');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-settlement-stage-a0-2026-09-05');

const FILES = ['approved-knowledge-seed-records.v1.json', 'rec-msha-30-56-12.json',
  'regulatory-expansion-v1.json'];

type Category =
  | 'ALIGNMENT_CLEAR'
  | 'QUESTION_STRONGER_THAN_METHOD'
  | 'METHOD_STRONGER_THAN_QUESTION'
  | 'AMBIGUOUS'
  | 'NO_VERIFICATION_METHOD';

interface Judgement { category: Category; note: string }

/**
 * The judgement table. Key is `recordId :: evidenceQuestion`, verbatim.
 *
 * Read as: does answering this question require establishing a property that this record's stated
 * verification method can establish?
 */
const JUDGEMENTS: Record<string, Judgement> = {
  'app-mg-01 :: Is the guard present?': {
    category: 'ALIGNMENT_CLEAR',
    note: 'presence is precisely what a physical inspection establishes',
  },
  'app-mg-01 :: Is the guard functional?': {
    category: 'QUESTION_STRONGER_THAN_METHOD',
    note: 'function is not established by looking. This is the §180 characterisation and it holds: '
      + 'the record asks presence AND function while offering only physical_inspection, so one of '
      + 'its two questions has no method behind it. It is also the §169 class — evidence consistent '
      + 'with a safeguard being present and non-functional.',
  },
  'app-elec-01 :: Is panel closed?': {
    category: 'ALIGNMENT_CLEAR',
    note: 'a closed panel is directly observable. Separate observation: the record\'s requiredFact is '
      + 'cord_integrity, which this question does not address — a question-to-requiredFact mismatch '
      + 'on a different axis from the one this audit measures',
  },
  'app-haz-01 :: Is the container labeled?': {
    category: 'ALIGNMENT_CLEAR', note: 'label presence is observable',
  },
  'app-cs-01 :: Is atmosphere tested?': {
    category: 'ALIGNMENT_CLEAR',
    note: 'gas_detection is the activity the question asks about; performing it answers the question',
  },
  'app-exc-01 :: Is system adequate?': {
    category: 'ALIGNMENT_CLEAR',
    note: 'adequacy of a protective system is what design_review establishes — one of the few '
      + 'records whose method is matched to a judgement-shaped question',
  },
  'app-fall-01 :: Is edge protected?': {
    category: 'AMBIGUOUS',
    note: '"protected" reads either as presence of edge protection, which inspection establishes, or '
      + 'as adequacy of it, which inspection alone does not. The record does not disambiguate.',
  },
  'app-mob-01 :: Are pedestrians clear?': {
    category: 'ALIGNMENT_CLEAR',
    note: 'a momentary observable state. Worth noting it is a point-in-time answer to a question '
      + 'about a moving condition — a temporal caveat rather than a property mismatch',
  },
  'app-rig-01 :: Is sling damaged?': {
    category: 'ALIGNMENT_CLEAR',
    note: 'visible damage is what inspection establishes. Note the record\'s citation is a '
      + 'placeholder, so the governed derivation REFUSES it with CITATION_IS_A_PLACEHOLDER and no '
      + 'criterion reaches an owed fact regardless',
  },
  'app-fire-01 :: Is tag legible?': {
    category: 'ALIGNMENT_CLEAR',
    note: 'legibility is observable. This confirms the §171/§180 characterisation: the record is '
      + 'about extinguisher tags under 1910.157 and has nothing to say about burner flame-failure '
      + 'safeguards, so it could not have supplied a criterion for the HR-01/HR-07 fire rows',
  },
  'app-egress-01 :: Is path clear?': {
    category: 'ALIGNMENT_CLEAR', note: 'an obstructed path is observable',
  },
  'app-ppe-01 :: Is PPE used?': {
    category: 'ALIGNMENT_CLEAR', note: 'use is observable at the time of inspection',
  },
  'app-mat-01 :: Is material stable?': {
    category: 'AMBIGUOUS',
    note: 'stability may be evident from stacking, or may require assessment beyond looking. The '
      + 'record\'s citation is also a placeholder, so the derivation refuses it',
  },
  'rec-msha-30-56-12 :: Is equipment properly grounded?': {
    category: 'QUESTION_STRONGER_THAN_METHOD',
    note: 'the requiredFact is grounding_integrity. Continuity is not established by physical '
      + 'inspection; a visible conductor can be broken, corroded or unbonded. This is the same '
      + 'shape as app-mg-01\'s function question on a different hazard family',
  },
  'app-loto-01 :: Is energy source isolated?': {
    category: 'ALIGNMENT_CLEAR',
    note: 'zero_energy_verification establishes exactly this. §171 chose this record for derivation '
      + 'for this reason, and the audit confirms the choice',
  },
  'app-loto-01 :: Is lockout device applied?': {
    category: 'METHOD_STRONGER_THAN_QUESTION',
    note: 'device application is visually checkable, while zero_energy_verification establishes the '
      + 'stronger fact that no energy remains. The method exceeds the question — the benign '
      + 'direction, and the only instance in the registry',
  },
  'app-fall-02 :: Is guardrail present?': {
    category: 'ALIGNMENT_CLEAR', note: 'presence is observable',
  },
  'app-fall-02 :: Is fall arrest used?': {
    category: 'ALIGNMENT_CLEAR', note: 'use is observable at the time of inspection',
  },
  'app-wws-01 :: Is surface clean and dry?': {
    category: 'ALIGNMENT_CLEAR', note: 'a walkthrough establishes surface condition directly',
  },
  'app-wws-01 :: Is walkway clear of obstructions?': {
    category: 'ALIGNMENT_CLEAR', note: 'a walkthrough establishes this directly',
  },
  'app-stfh-01 :: Is the area free of debris?': {
    category: 'ALIGNMENT_CLEAR', note: 'visual inspection establishes housekeeping state',
  },
  'app-stfh-01 :: Is the floor dry?': {
    category: 'ALIGNMENT_CLEAR', note: 'visual inspection establishes this',
  },
  'app-haul-01 :: Are moving parts guarded?': {
    category: 'ALIGNMENT_CLEAR', note: 'guard presence is observable by inspection',
  },
  'app-haul-01 :: Can persons contact moving parts?': {
    category: 'QUESTION_STRONGER_THAN_METHOD',
    note: 'reachability is a capability question — gap dimensions, reach distances, body position — '
      + 'not a state plain inspection reports. The record pairs an observable question with a '
      + 'capability question and offers one method for both, the same shape as app-mg-01',
  },
  'app-hazcom-02 :: Is the container labeled?': {
    category: 'ALIGNMENT_CLEAR', note: 'an audit establishes label presence',
  },
  'app-hazcom-02 :: Is SDS available?': {
    category: 'ALIGNMENT_CLEAR', note: 'availability is what a documentation audit establishes',
  },
  'app-ppe-02 :: Is appropriate PPE provided?': {
    category: 'QUESTION_STRONGER_THAN_METHOD',
    note: '"appropriate" requires comparing provided PPE against an assessed hazard. Observation '
      + 'establishes what is provided, not whether it is the right protection',
  },
  'app-ppe-02 :: Is PPE being used?': {
    category: 'ALIGNMENT_CLEAR', note: 'use is observable',
  },
};

interface Row {
  recordId: string; citation: string; domainId: string | null; status: string;
  requiredFacts: string[]; question: string; verificationMethods: string[];
  weakActions: string[]; category: Category | 'UNCLASSIFIED'; note: string;
  citationIsPlaceholder: boolean;
}

function load(): any[] {
  const out: any[] = [];
  for (const f of FILES) {
    const d = JSON.parse(readFileSync(join(REGISTRY, f), 'utf8'));
    out.push(...(Array.isArray(d) ? d : (d.records ?? [d])));
  }
  return out;
}

const records = load();
const rows: Row[] = [];
let recordsWithBoth = 0;
let recordsNoMethod = 0;

for (const r of records) {
  const questions: string[] = r.mapping?.evidenceQuestions ?? [];
  const methods: string[] = r.correctiveActionLinks?.verificationMethods ?? [];
  const citation: string = r.authority?.citation ?? '';
  const placeholder = /placeholder|review_required/i.test(citation);
  if (questions.length > 0 && methods.length > 0) recordsWithBoth += 1;
  if (methods.length === 0) recordsNoMethod += 1;
  for (const q of questions) {
    const key = `${r.recordId} :: ${q}`;
    const j = JUDGEMENTS[key];
    rows.push({
      recordId: r.recordId, citation, domainId: r.mapping?.domainId ?? null, status: r.status,
      requiredFacts: r.mapping?.requiredFacts ?? [], question: q, verificationMethods: methods,
      weakActions: r.correctiveActionLinks?.commonWeakActionsToAvoid ?? [],
      category: methods.length === 0 ? 'NO_VERIFICATION_METHOD' : (j?.category ?? 'UNCLASSIFIED'),
      note: methods.length === 0 ? 'the record states no verification method' : (j?.note ?? ''),
      citationIsPlaceholder: placeholder,
    });
  }
}

const count = (c: string): number => rows.filter(r => r.category === c).length;
const approved = records.filter(r => r.status === 'approved');

// Distinct methods, grouped by what kind of evidence they are. The grouping is named, not inferred.
const OBSERVATIONAL = ['physical_inspection', 'visual_inspection', 'inspection', 'walkthrough', 'observation'];
const DESK_BASED = ['audit', 'design_review'];
const INSTRUMENTED_OR_PROCEDURAL = ['gas_detection', 'zero_energy_verification'];
const distinctMethods = [...new Set(records.flatMap(
  (r: any) => r.correctiveActionLinks?.verificationMethods ?? []))].sort();

const summary = {
  artifact: 'SECTION_181_GOVERNED_EVIDENCE_ALIGNMENT_AUDIT',
  date: '2026-09-05',
  scope: 'EVIDENCE_QUESTION_TO_VERIFICATION_METHOD_ALIGNMENT',
  readOnly: true,
  governedRecordsModified: 0,
  providerCalls: 0,
  databaseOperations: 0,
  method: 'engineering judgement recorded in a named table in '
    + 'backend/scripts/a0-governed-evidence-alignment-audit-2026-09-05.ts. No automated semantic '
    + 'scorer exists: the code looks each pair up and counts, and reports UNCLASSIFIED for any pair '
    + 'the table does not cover.',
  provenance: {
    AI_PERFORMED_DEVELOPMENT_AUDIT: true,
    HUMAN_ADJUDICATED: false,
    note: 'these classifications are an engineering judgement and are not human adjudication; a '
      + 'human review of the 28 pairs would be a separate act',
  },
  registryFilesRead: FILES,
  registryFileSha256: Object.fromEntries(FILES.map(f =>
    [f, createHash('sha256').update(readFileSync(join(REGISTRY, f), 'utf8')).digest('hex')])),
  TOTAL_APPROVED_RECORDS_REVIEWED: approved.length,
  TOTAL_RECORDS_IN_REGISTRY: records.length,
  RECORDS_WITH_BOTH_QUESTIONS_AND_METHODS: recordsWithBoth,
  TOTAL_EVIDENCE_QUESTIONS: rows.length,
  ALIGNMENT_CLEAR: count('ALIGNMENT_CLEAR'),
  QUESTION_STRONGER_THAN_METHOD: count('QUESTION_STRONGER_THAN_METHOD'),
  METHOD_STRONGER_THAN_QUESTION: count('METHOD_STRONGER_THAN_QUESTION'),
  AMBIGUOUS: count('AMBIGUOUS'),
  NO_VERIFICATION_METHOD: count('NO_VERIFICATION_METHOD'),
  UNCLASSIFIED: count('UNCLASSIFIED'),
  misalignedQuestions: rows.filter(r => r.category === 'QUESTION_STRONGER_THAN_METHOD')
    .map(r => ({ recordId: r.recordId, question: r.question, methods: r.verificationMethods, note: r.note })),
  ambiguousQuestions: rows.filter(r => r.category === 'AMBIGUOUS')
    .map(r => ({ recordId: r.recordId, question: r.question, methods: r.verificationMethods, note: r.note })),
  recurringPatterns: {
    presence_question_vs_physical_inspection: {
      observed: rows.filter(r => r.category === 'ALIGNMENT_CLEAR'
        && OBSERVATIONAL.some(m => r.verificationMethods.includes(m))).length,
      reading: 'the dominant and benign pattern — an observable state matched to a looking method',
    },
    functional_question_vs_physical_inspection: {
      observed: ['app-mg-01 :: Is the guard functional?',
        'rec-msha-30-56-12 :: Is equipment properly grounded?'],
      reading: 'the §169 class: evidence consistent with a safeguard being present and '
        + 'non-functional. TWO instances across the registry, in two different hazard families.',
    },
    capability_question_vs_inspection: {
      observed: ['app-haul-01 :: Can persons contact moving parts?'],
      reading: 'reachability needs dimensions and body position, not a state report',
    },
    appropriateness_question_vs_observation: {
      observed: ['app-ppe-02 :: Is appropriate PPE provided?'],
      reading: 'adequacy requires comparison against an assessed hazard',
    },
    status_question_vs_documentation_review: {
      observed: ['app-hazcom-02 :: Is SDS available?', 'app-hazcom-02 :: Is the container labeled?'],
      reading: 'aligned — an audit is the right method for a documentation availability question',
    },
    protective_response_question_vs_functional_test: {
      observed: [],
      reading: 'NOT PRESENT in this registry. No record asks a protective-response question, and '
        + 'no record offers a functional test as a verification method. That absence is itself the '
        + 'finding for HR-04-shaped facts.',
    },
  },
  verificationMethodVocabulary: {
    distinctMethods,
    observational: distinctMethods.filter(m => OBSERVATIONAL.includes(m)),
    deskBased: distinctMethods.filter(m => DESK_BASED.includes(m)),
    instrumentedOrProcedural: distinctMethods.filter(m => INSTRUMENTED_OR_PROCEDURAL.includes(m)),
    noFunctionalTestMethodExists: !distinctMethods.some(m => /function|test/i.test(String(m))
      && String(m) !== 'zero_energy_verification'),
    section171Comparison: '§171 recorded "seven of nine distinct verification methods are '
      + 'looking-based". This audit counts the same nine distinct methods and classifies five as '
      + 'directly observational, two as desk-based (audit, design_review) and two as instrumented '
      + 'or procedural (gas_detection, zero_energy_verification). The §171 figure holds if desk-based '
      + 'methods are grouped with looking; the grouping is stated here rather than assumed.',
  },
  placeholderCitationRecords: rows.filter(r => r.citationIsPlaceholder)
    .map(r => r.recordId).filter((v, i, a) => a.indexOf(v) === i),
  section180CharacterisationsChecked: {
    'app-mg-01': 'CONFIRMED — asks both presence and function while offering only '
      + 'physical_inspection; the function question has no method behind it',
    'app-loto-01': 'CONFIRMED — zero_energy_verification matches its isolation question, which is '
      + 'why §171 derived from it; its second question is the registry\'s only case of the method '
      + 'exceeding the question',
    'app-fire-01': 'CONFIRMED — 1910.157, tag legibility. It has nothing to say about burner '
      + 'flame-failure safeguards and could not have supplied a criterion for the fire rows',
  },
  rows,
};

writeFileSync(join(OUT, 'GOVERNED-EVIDENCE-ALIGNMENT-AUDIT.json'),
  JSON.stringify(summary, null, 2) + '\n');

console.log('§181 GOVERNED EVIDENCE ALIGNMENT AUDIT — read-only, 0 provider calls, 0 database operations\n');
console.log(`TOTAL_APPROVED_RECORDS_REVIEWED        ${summary.TOTAL_APPROVED_RECORDS_REVIEWED}`);
console.log(`RECORDS_WITH_BOTH_QUESTIONS_AND_METHODS ${summary.RECORDS_WITH_BOTH_QUESTIONS_AND_METHODS}`);
console.log(`TOTAL_EVIDENCE_QUESTIONS               ${summary.TOTAL_EVIDENCE_QUESTIONS}\n`);
console.log(`ALIGNMENT_CLEAR                        ${summary.ALIGNMENT_CLEAR}`);
console.log(`QUESTION_STRONGER_THAN_METHOD          ${summary.QUESTION_STRONGER_THAN_METHOD}`);
console.log(`METHOD_STRONGER_THAN_QUESTION          ${summary.METHOD_STRONGER_THAN_QUESTION}`);
console.log(`AMBIGUOUS                              ${summary.AMBIGUOUS}`);
console.log(`NO_VERIFICATION_METHOD                 ${summary.NO_VERIFICATION_METHOD}`);
console.log(`UNCLASSIFIED                           ${summary.UNCLASSIFIED}`);
if (summary.UNCLASSIFIED > 0) {
  console.log('\nUNCLASSIFIED pairs (the registry changed since the table was written):');
  for (const r of rows.filter(x => x.category === 'UNCLASSIFIED')) {
    console.log(`  ${r.recordId} :: ${r.question}`);
  }
}
console.log('\nQUESTION_STRONGER_THAN_METHOD:');
for (const m of summary.misalignedQuestions) {
  console.log(`  ${m.recordId} :: "${m.question}"  vs  [${m.methods.join(', ')}]`);
}
console.log('\nAMBIGUOUS:');
for (const m of summary.ambiguousQuestions) {
  console.log(`  ${m.recordId} :: "${m.question}"  vs  [${m.methods.join(', ')}]`);
}
console.log(`\nplaceholder-citation records (derivation refuses these): ${summary.placeholderCitationRecords.join(', ')}`);
console.log(`no functional-test verification method exists anywhere in the registry: `
  + `${summary.verificationMethodVocabulary.noFunctionalTestMethodExists}`);
console.log('\nwritten: GOVERNED-EVIDENCE-ALIGNMENT-AUDIT.json');
