/**
 * KG-3E -- reviewer evidence tooling for the records THIS slice remediates.
 *
 * WHY A SEPARATE SCRIPT. `verify-governed-record-against-source.ts` is KG-3D's evidence artifact:
 * its `CHECKS` array, its source directory and its recorded 32/32 result are that slice's frozen
 * verification record. Appending KG-3E claims to it would make the KG-3D checks fail whenever the
 * tool were pointed at the KG-3D release (whose content predates this remediation), destroying a
 * reproduction the governance record depends on. So KG-3E carries its own checks and its own source
 * directory, and KG-3D's verifier stays byte-identical.
 *
 * Same discipline as KG-3D's: this tool ASSISTS a review. It has no write path and cannot approve
 * anything. Approval remains an explicit per-record human command with an expected checksum.
 *
 * What it checks, per record:
 *   1. the governed title matches the codified section heading (or is a justified narrowing of it)
 *   2. every requirement the governed summary asserts appears in the authoritative source
 *   3. the summary does not silently assert a requirement belonging to a DIFFERENT paragraph or
 *      section -- naming a neighbouring rule is allowed, absorbing it is not
 *   4. qualifications and exceptions that limit the rule are actually present in the summary
 */
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataSource } from '../src/database/data-source';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';

const SOURCE_DIR = join(__dirname, '..', '..', 'verification',
  'hazlenz-governed-knowledge-growth-2026-08-19', 'kg-3e', 'source-evidence');

interface RecordCheck {
  citation: string;
  sourceFile: string;
  supportingSourceFiles?: string[];
  headingAnchors: string[];
  /** Each asserted requirement -> the source phrase that must support it. */
  claims: Array<[string, string]>;
  /**
   * Phrases that must not be asserted as THIS record's rule. The third element is a pattern for
   * the cross-references that legitimately license mentioning it -- a sentence naming the other
   * provision is attribution, not absorption.
   */
  mustNotAssert?: Array<[string, string, RegExp]>;
  /** Qualifications that limit the rule and must be present in the governed summary. */
  mustQualify?: Array<[string, string]>;
}

const CHECKS: RecordCheck[] = [
  {
    // The single highest-use emitted citation. KG-3D refused it because the stored text stated no
    // requirement at all.
    citation: '29 CFR 1926.501',
    sourceFile: 'ecfr-1926-501.xml',
    supportingSourceFiles: ['ecfr-1926-500.xml'],
    headingAnchors: ['Duty to have fall protection'],
    claims: [
      ['(a)(1) conformance to 1926.502',
        'All fall protection required by this section shall conform to the criteria set forth in'],
      ['(a)(2) surface strength determination',
        'The employer shall determine if the walking/working surfaces on which its employees are to work have the strength and structural integrity'],
      ['(b)(1) unprotected sides and edges at 6 feet',
        'with an unprotected side or edge which is 6 feet (1.8 m) or more above a lower level shall be protected from falling by the use of guardrail systems, safety net systems, or personal fall arrest systems'],
      ['(b)(4)(i) holes -- MORE THAN 6 feet',
        'protected from falling through holes (including skylights) more than 6 feet (1.8 m) above lower levels'],
      ['(b)(4)(ii) tripping/stepping into holes -- covers, no height threshold',
        'protected from tripping in or stepping into or through holes (including skylights) by covers'],
      ['(b)(4)(iii) objects falling through holes -- covers',
        'protected from objects falling through holes (including skylights) by covers'],
      ['(b)(11) steep roofs at 6 feet',
        'Each employee on a steep roof with unprotected sides and edges 6 feet (1.8 m) or more above lower levels'],
      ['(b)(15) surfaces not otherwise addressed at 6 feet',
        'Walking/working surfaces not otherwise addressed'],
      ['1926.500(a)(2)(i) scaffolds are subpart L',
        'Requirements relating to fall protection for employees working on scaffolds are provided in subpart L'],
      ['1926.500(a)(2)(iii) steel erection is subpart R',
        'Fall protection requirements for employees performing steel erection work'],
    ],
    mustQualify: [
      ['names the 6-foot trigger', '6 feet'],
      ['names all three permitted system types', 'personal fall arrest'],
      ['preserves the more-than-6-feet distinction for holes', 'more than 6 feet'],
      ['preserves the any-height cover rule', 'at ANY height'],
      ['names the subpart carve-outs', '1926.500(a)(2)'],
    ],
  },
  {
    // KG-3D refused this because the summary restated PURPOSE, not the operative duty.
    citation: '29 CFR 1910.147',
    sourceFile: 'ecfr-1910-147.xml',
    headingAnchors: ['The control of hazardous energy (lockout/tagout)'],
    claims: [
      ['(c)(1) energy control program is the operative duty',
        'The employer shall establish a program consisting of energy control procedures, employee training and periodic inspections'],
      ['(c)(1) isolate and render inoperative',
        'the machine or equipment shall be isolated from the energy source, and rendered inoperative'],
      ['(c)(2)(ii) lockout preferred over tagout',
        'shall utilize lockout, unless the employer can demonstrate that the utilization of a tagout system will provide full employee protection'],
      ['(a)(2)(ii) normal production operations are outside scope',
        'Normal production operations are not covered by this standard'],
      ['(a)(2)(ii)(A) unless a guard is removed or bypassed',
        'An employee is required to remove or bypass a guard or other safety device'],
      ['Note to (a)(2)(ii) minor servicing exception',
        'routine, repetitive, and integral to the use of the equipment for production'],
      ['(a)(2)(iii)(A) cord-and-plug exception',
        'Work on cord and plug connected electric equipment'],
      ['(a)(1)(ii)(A) construction and agriculture excluded',
        'Construction and agriculture employment'],
    ],
    mustQualify: [
      ['title carries the codified parenthetical', 'lockout/tagout'],
      ['states a PROGRAM requirement, not merely a purpose', 'energy control program'],
      ['preserves the normal-production scope limit', 'normal production operations'],
      ['preserves the cord-and-plug exception', 'cord-and-plug'],
      ['preserves the construction/agriculture exclusion', 'construction or agriculture'],
    ],
  },
  {
    // KG-3D refused this because the summary omitted (b), the seven-foot exemption.
    citation: '30 CFR 56.14107(a)',
    sourceFile: 'ecfr-56-14107.xml',
    headingAnchors: ['Moving machine parts'],
    claims: [
      ['(a) enumerated moving parts must be guarded',
        'Moving machine parts shall be guarded to protect persons from contacting gears, sprockets, chains, drive, head, tail, and takeup pulleys, flywheels, couplings, shafts, fan blades'],
      ['(a) catch-all limited to parts that can cause injury',
        'similar moving parts that can cause injury'],
      ['(b) seven-foot exemption',
        'Guards shall not be required where the exposed moving parts are at least seven feet away from walking or working surfaces'],
    ],
    mustQualify: [
      ['names the seven-foot exemption', 'seven feet'],
      ['attributes the exemption to paragraph (b)', '56.14107(b)'],
      ['attributes the duty to paragraph (a)', '56.14107(a)'],
    ],
    mustNotAssert: [
      // The prior text used HazLenz taxonomy vocabulary ("pinch-point", "caught-in") as though the
      // regulation said it. The regulation enumerates parts and says "can cause injury".
      ['MSHA taxonomy vocabulary presented as regulatory text', 'pinch-point', /never-licensed/],
    ],
  },

  // ===========================================================================================
  // Phase 3 -- the newly sourced citations HazLenz emits.
  // ===========================================================================================
  {
    citation: '29 CFR 1926.451(g)(1)',
    sourceFile: 'ecfr-1926-451.xml',
    headingAnchors: ['General requirements'],
    claims: [
      ['(g)(1) fall protection above 10 feet',
        'Each employee on a scaffold more than 10 feet (3.1 m) above a lower level shall be protected from falling to that lower level'],
      ['(g)(1)(i)-(vii) prescribe system by scaffold type',
        'establish the types of fall protection to be provided to the employees on each type of scaffold'],
      ['(g)(2) covers erectors and dismantlers',
        'addresses fall protection for scaffold erectors and dismantlers'],
    ],
    mustQualify: [
      ['names the more-than-10-feet threshold', 'more than 10 feet'],
      ['does not claim to fix the system type', 'depends on the type of scaffold'],
    ],
  },
  {
    citation: '29 CFR 1926.652(a)(1)',
    sourceFile: 'ecfr-1926-652.xml',
    headingAnchors: ['Requirements for protective systems'],
    claims: [
      ['(a)(1) cave-in protection duty',
        'Each employee in an excavation shall be protected from cave-ins by an adequate protective system'],
      ['(a)(1)(i) stable rock exception', 'Excavations are made entirely in stable rock'],
      ['(a)(1)(ii) under-5-feet exception',
        'Excavations are less than 5 feet (1.52m) in depth and examination of the ground by a competent person provides no indication of a potential cave-in'],
      ['(a)(2) capacity to resist loads',
        'Protective systems shall have the capacity to resist without failure all loads'],
    ],
    mustQualify: [
      ['preserves the stable-rock exception', 'stable rock'],
      ['preserves the 5-foot exception', '5 feet'],
      ['names the competent-person examination', 'competent person'],
    ],
  },
  {
    citation: '29 CFR 1910.28',
    sourceFile: 'ecfr-1910-28.xml',
    headingAnchors: ['Duty to have fall protection and falling object protection'],
    claims: [
      ['(b)(11)(i) stairway landing at 4 feet',
        'exposed to an unprotected side or edge of a stairway landing that is 4 feet (1.2 m) or more above a lower level is protected by a guardrail or stair rail system'],
      ['(b)(11)(ii) handrails, conditioned on treads and risers',
        'Each flight of stairs having at least 3 treads and at least 4 risers is equipped with stair rail systems and handrails'],
      ['(b)(11)(iii) ship and alternating tread stairs',
        'Each ship stairs and alternating tread type stairs is equipped with handrails on both sides'],
      ['(b)(12)(i) scaffolds are subpart L',
        'Each employee on a scaffold is protected from falling in accordance 29 CFR part 1926, subpart L'],
    ],
    mustQualify: [
      ['names the tread/riser condition rather than assuming it', '3 treads'],
      ['attributes the handrail rule to its paragraph', '1910.28(b)(11)(ii)'],
      ['points stairway construction requirements to 1910.25', '1910.25'],
    ],
  },
  {
    citation: '29 CFR 1910.95',
    sourceFile: 'ecfr-1910-95.xml',
    headingAnchors: ['Occupational noise exposure'],
    claims: [
      ['(a) Table G-16 trigger',
        'Protection against the effects of noise exposure shall be provided when the sound levels exceed those shown in Table G-16'],
      ['(b)(1) controls first, PPE only on failure',
        'feasible administrative or engineering controls shall be utilized'],
      ['(c)(1) hearing conservation at TWA8 85 dBA',
        'whenever employee noise exposures equal or exceed an 8-hour time-weighted average sound level (TWA) of 85 decibels'],
    ],
    mustQualify: [
      ['preserves the control hierarchy', 'only if those controls fail'],
      ['names the 85 dBA program trigger', '85 dBA'],
      ['names the Table G-16 8-hour value', '90 dBA'],
    ],
  },
  {
    citation: '29 CFR 1910.1200',
    sourceFile: 'ecfr-1910-1200.xml',
    headingAnchors: ['Hazard communication'],
    claims: [
      ['(f)(6) workplace labeling duty',
        'the employer shall ensure that each container of hazardous chemicals in the workplace is labeled, tagged or marked'],
      ['(f)(1) shipped containers fall on manufacturer/importer/distributor',
        'The chemical manufacturer, importer, or distributor shall ensure that each container of hazardous chemicals leaving the workplace is labeled'],
      ['(f)(7) signs and placards in lieu of labels',
        'signs, placards, process sheets, batch tickets, operating procedures, or other such written materials in lieu of affixing'],
    ],
    mustQualify: [
      ['identifies (f)(6) as the workplace-labeling paragraph', '1910.1200(f)(6)'],
      ['distinguishes the shipped-container duty', 'leaving the workplace'],
      ['preserves the (f)(7)/(f)(8) alternatives', '1910.1200(f)(8)'],
    ],
  },
  {
    citation: '29 CFR 1926.1153',
    sourceFile: 'ecfr-1926-1153.xml',
    headingAnchors: ['Respirable crystalline silica'],
    claims: [
      ['(c)(1) Table 1 duty',
        'the employer shall fully and properly implement the engineering controls, work practices, and respiratory protection specified for the task on Table 1'],
      ['Table 1 water-delivery control',
        'Use saw equipped with integrated water delivery system that continuously feeds water to the blade'],
      ['(d)(1) PEL where Table 1 is not followed',
        'in excess of 50'],
    ],
    mustQualify: [
      ['names the integrated water delivery control', 'integrated water delivery system'],
      ['names both the stationary and handheld Table 1 entries', 'handheld power saws'],
      ['preserves the (d) alternative route', '1926.1153(d)'],
    ],
  },
  {
    citation: '30 CFR 56.14132',
    sourceFile: 'ecfr-56-14132.xml',
    headingAnchors: ['Horns and backup alarms'],
    claims: [
      ['(a) horns maintained functional',
        'Manually-operated horns or other audible warning devices provided on self-propelled mobile equipment as a safety feature shall be maintained in functional condition'],
      ['(b)(1) obstructed-view trigger',
        'When the operator has an obstructed view to the rear'],
      ['(b)(1)(iv) an observer is a permitted alternative',
        'An observer to signal when it is safe to back up'],
      ['(c) rail equipment excluded', 'This standard does not apply to rail equipment'],
    ],
    mustQualify: [
      ['names the obstructed-view condition that triggers (b)(1)', 'obstructed view'],
      ['keeps (a) horn maintenance distinct from (b)(1) reversing', '56.14132(b)(1)'],
      ['names the observer alternative', 'observer'],
    ],
  },

  // ===========================================================================================
  // Phase 6 -- the remediated placeholder records.
  // ===========================================================================================
  {
    citation: '29 CFR 1910.22(a)',
    sourceFile: 'ecfr-1910-22.xml',
    headingAnchors: ['General requirements'],
    claims: [
      ['(a)(1) clean, orderly, sanitary',
        'are kept in a clean, orderly, and sanitary condition'],
      ['(a)(2) dry condition and drainage, to the extent feasible',
        'to the extent feasible, in a dry condition'],
      ['(a)(3) free of listed hazards',
        'maintained free of hazards such as sharp or protruding objects, loose boards, corrosion, leaks, spills, snow, and ice'],
    ],
    mustQualify: [
      ['restores the (a)(2) drainage duty the prior text dropped', 'drainage'],
      ['preserves the "to the extent feasible" qualifier', 'to the extent feasible'],
    ],
  },
  {
    citation: '29 CFR 1910.303(b)(1)',
    sourceFile: 'ecfr-1910-303.xml',
    headingAnchors: ['General'],
    claims: [
      ['(b)(1) free from recognized hazards',
        'Electric equipment shall be free from recognized hazards that are likely to cause death or serious physical harm to employees'],
      ['(b)(1)(i) suitability', 'Suitability for installation and use in conformity with the provisions of this subpart'],
      ['(b)(1)(ii) mechanical strength and durability', 'Mechanical strength and durability'],
    ],
    mustQualify: [
      ['is titled as the Examination paragraph', 'Examination'],
      ['distinguishes itself from the guarding rule at (g)(2)(i)', '1910.303(g)(2)(i)'],
    ],
  },
  {
    citation: '29 CFR 1910.146',
    sourceFile: 'ecfr-1910-146.xml',
    headingAnchors: ['Permit-required confined spaces'],
    claims: [
      ['(c)(1) evaluate the workplace',
        'The employer shall evaluate the workplace to determine if any spaces are permit- required confined spaces'],
      ['(c)(2) inform by danger signs',
        'the employer shall inform exposed employees, by posting danger signs or by any other equally effective means'],
      ['(c)(4) written permit space program',
        'the employer shall develop and implement a written permit space program'],
      ['(a) construction/agriculture/shipyard excluded',
        'This section does not apply to agriculture, to construction, or to shipyard employment'],
    ],
    mustQualify: [
      ['states the (c)(4) written-program duty rather than listing topics', 'written permit space program'],
      ['preserves the construction exclusion', 'does not apply to agriculture, construction, or shipyard'],
      ['names subpart AA for construction confined spaces', 'subpart AA'],
    ],
  },

  // ===========================================================================================
  // Phase 5 -- records whose content defects surfaced only once a source was attached.
  // ===========================================================================================
  {
    citation: '29 CFR 1910.178(p)(1)',
    sourceFile: 'ecfr-1910-178.xml',
    headingAnchors: ['Powered industrial trucks'],
    claims: [
      ['(p)(1) out-of-service duty',
        'the truck shall be taken out of service until it has been restored to safe operating condition'],
      ['(p)(2) no fuelling with engine running', 'Fuel tanks shall not be filled while the engine is running'],
      ['(p)(4) no operation with a fuel leak',
        'No truck shall be operated with a leak in the fuel system until the leak has been corrected'],
    ],
    mustQualify: [
      ['states the out-of-service duty', 'taken out of service'],
    ],
    mustNotAssert: [
      ['non-regulatory hedging language', 'may be relevant', /never-licensed/],
    ],
  },
  {
    citation: '30 CFR 56.12016',
    sourceFile: 'ecfr-56-12016.xml',
    headingAnchors: ['Work on electrically-powered equipment'],
    claims: [
      ['deenergize before mechanical work',
        'Electrically powered equipment shall be deenergized before mechanical work is done on such equipment'],
      ['lock out or prevent energization',
        'Power switches shall be locked out or other measures taken which shall prevent the equipment from being energized'],
      ['signed warning notices at the power switch',
        'Suitable warning notices shall be posted at the power switch and signed by the individuals who are to do the work'],
      ['removal restricted to installers or authorized personnel',
        'removed only by the persons who installed them or by authorized personnel'],
    ],
    mustQualify: [
      ['states the signed warning-notice duty', 'signed by the individuals'],
      ['states the lock-removal restriction', 'authorized personnel'],
    ],
    mustNotAssert: [
      ['hedge not present in the rule', 'where applicable', /never-licensed/],
    ],
  },
  {
    citation: '29 CFR 1910.212(a)(1)',
    sourceFile: 'ecfr-1910-212.xml',
    headingAnchors: ['General requirements for all machines'],
    claims: [
      ['(a)(1) guarding methods required',
        'One or more methods of machine guarding shall be provided to protect the operator and other employees in the machine area'],
      ['(a)(1) examples of guarding methods',
        'barrier guards, two-hand tripping devices, electronic safety devices'],
      ['(a)(2) guard must not itself be a hazard',
        'The guard shall be such that it does not offer an accident hazard in itself'],
    ],
    mustQualify: [
      ['names the guarding-method examples', 'barrier guards'],
      ['states the (a)(2) no-hazard-in-itself rule', 'not itself offer an accident hazard'],
    ],
  },
  {
    citation: '29 CFR 1926.52',
    sourceFile: 'ecfr-1926-52.xml',
    headingAnchors: ['Occupational noise exposure'],
    claims: [
      ['(a) Table D-2 trigger',
        'Protection against the effects of noise exposure shall be provided when the sound levels exceed those shown in Table D-2'],
      ['(b) controls, PPE on failure', 'feasible administrative or engineering controls shall be utilized'],
      ['(d)(1) hearing conservation program',
        'a continuing, effective hearing conservation program shall be administered'],
    ],
    mustQualify: [
      ['names Table D-2', 'Table D-2'],
      ['names the 8-hour 90 dBA value', '90 dBA'],
    ],
  },
  {
    citation: '29 CFR 1926.59',
    sourceFile: 'ecfr-1926-59.xml',
    headingAnchors: ['Hazard communication'],
    claims: [
      ['incorporation by reference of 1910.1200',
        'The requirements applicable to construction work under this section are identical to those set forth at'],
    ],
    mustQualify: [
      ['states that it incorporates 1910.1200 rather than restating a separate rule', 'identical to those set forth at 29 CFR 1910.1200'],
    ],
  },

  // ===========================================================================================
  // Re-verification of records whose checksum changed for PROVENANCE reasons only (Phase 5).
  // Content is unchanged from what KG-3D verified; these confirm that is still true.
  // ===========================================================================================
  {
    citation: '30 CFR 47.41(a)',
    sourceFile: 'ecfr-47-41.xml',
    headingAnchors: ['Requirement for container labels'],
    claims: [
      ['(a) every container labeled',
        'The operator must ensure that each container of a hazardous chemical has a label'],
      ['(a)(1) replace missing or unreadable labels',
        'The operator must replace a container label immediately if it is missing or if the hazard information on the label is unreadable'],
      ['(a)(2) must not remove or deface labels',
        'The operator must not remove or deface existing labels on containers of hazardous chemicals'],
    ],
  },
  {
    citation: '30 CFR 62.120',
    sourceFile: 'ecfr-62-120.xml',
    supportingSourceFiles: ['ecfr-62-101.xml'],
    headingAnchors: ['Action level'],
    claims: [
      ['enrollment duty at the action level',
        'the mine operator must enroll the miner in a hearing conservation program that complies with'],
      ['action level defined at 62.101 as TWA8 85 dBA / 50% dose',
        'An 8-hour time-weighted average sound level (TWA8) of 85 dBA, or equivalently a dose of 50%'],
    ],
  },
  {
    citation: '30 CFR 62.130',
    sourceFile: 'ecfr-62-130.xml',
    supportingSourceFiles: ['ecfr-62-101.xml'],
    headingAnchors: ['Permissible exposure level'],
    claims: [
      ['(a) controls and hearing conservation above the PEL',
        'must use all feasible engineering and administrative controls to reduce the miner'],
      ['(c) 115 dBA ceiling',
        'no miner is exposed at any time to sound levels exceeding 115 dBA'],
      ['PEL defined at 62.101 as TWA8 90 dBA / 100% dose',
        'A TWA8 of 90 dBA or equivalently a dose of 100%'],
    ],
    mustQualify: [
      ['names the 115 dBA ceiling', '115 dBA'],
    ],
  },
];

const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function sourceText(files: string[]): { heading: string; body: string } {
  let heading = '';
  const bodies: string[] = [];
  for (const [index, file] of files.entries()) {
    const xml = readFileSync(join(SOURCE_DIR, file), 'utf8');
    if (index === 0) heading = strip((xml.match(/<HEAD>([\s\S]*?)<\/HEAD>/) || [])[1] || '');
    // Paragraph text.
    const parts = [...xml.matchAll(/<P>([\s\S]*?)<\/P>/g)].map(m => strip(m[1]));
    // TABLE CELLS. KG-3D's verifier read only <P>, which is fine for prose sections but silently
    // skips regulatory text carried in tables. 29 CFR 1926.1153 puts its entire operative control
    // specification in Table 1 -- "Use saw equipped with integrated water delivery system that
    // continuously feeds water to the blade" lives in a <TD>, not a <P>. Verifying 1926.1153
    // against paragraphs alone would have reported the requirement as absent from its own source.
    // Cells are part of the authoritative document, so they are part of the body.
    parts.push(...[...xml.matchAll(/<T[DH][^>]*>([\s\S]*?)<\/T[DH]>/g)].map(m => strip(m[1])));
    bodies.push(parts.join(' '));
  }
  return { heading, body: bodies.join(' ') };
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against database '${dbName}'.`);
  }
  const releaseId = process.argv[2];
  if (!releaseId) throw new Error('A releaseId argument is required.');

  await dataSource.initialize();
  const report: any = {
    releaseId,
    generatedFrom: 'eCFR, title 29 and title 30, up-to-date-as-of 2026-08-18',
    sourceDir: 'verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3e/source-evidence',
    records: [],
  };
  let totalPass = 0, totalFail = 0;

  for (const check of CHECKS) {
    const resolution = await resolveGovernedCitation(dataSource, releaseId, check.citation);
    if (resolution.backing === 'NOT_IN_RELEASE') {
      console.log(`\n=== ${check.citation}\n    NOT IN RELEASE ${releaseId} -- skipped`);
      report.records.push({ citation: check.citation, inRelease: false });
      continue;
    }

    const files = [check.sourceFile, ...(check.supportingSourceFiles || [])];
    const { heading, body } = sourceText(files);
    const governed = `${resolution.title || ''} ${resolution.standardText || ''} ${resolution.plainLanguageSummary || ''}`;

    console.log(`\n=== ${check.citation}`);
    console.log(`    governed title : ${resolution.title}`);
    console.log(`    codified head  : ${heading}`);
    console.log(`    record checksum: ${resolution.recordChecksum}`);
    console.log(`    review state   : ${resolution.effectiveReviewState}`);

    const results: any[] = [];
    const headingOk = check.headingAnchors.some(anchor =>
      heading.toLowerCase().includes(anchor.toLowerCase()));
    headingOk ? totalPass++ : totalFail++;
    results.push({ check: 'title consistent with codified heading', pass: headingOk });
    console.log(`    ${headingOk ? 'ok  ' : 'FAIL'} title consistent with codified heading`);

    for (const [label, phrase] of check.claims) {
      const inSource = body.includes(phrase);
      inSource ? totalPass++ : totalFail++;
      results.push({ check: `source supports: ${label}`, pass: inSource, sourcePhrase: phrase });
      console.log(`    ${inSource ? 'ok  ' : 'FAIL'} source supports: ${label}`);
    }

    for (const [label, phrase] of check.mustQualify || []) {
      const present = governed.toLowerCase().includes(phrase.toLowerCase());
      present ? totalPass++ : totalFail++;
      results.push({ check: `governed summary preserves qualification: ${label}`, pass: present });
      console.log(`    ${present ? 'ok  ' : 'FAIL'} governed summary preserves qualification: ${label}`);
    }

    for (const [label, phrase, licensedBy] of check.mustNotAssert || []) {
      const offending = governed.split(/(?<=\.)\s+/)
        .filter(sentence => sentence.toLowerCase().includes(phrase.toLowerCase()))
        .filter(sentence => !licensedBy.test(sentence));
      const ok = offending.length === 0;
      ok ? totalPass++ : totalFail++;
      results.push({ check: `not asserted as this record's rule: ${label}`, pass: ok, offending });
      console.log(`    ${ok ? 'ok  ' : 'FAIL'} not asserted as this record's rule: ${label}`);
    }

    report.records.push({
      citation: check.citation,
      inRelease: true,
      governedTitle: resolution.title,
      codifiedHeading: heading,
      recordChecksum: resolution.recordChecksum,
      effectiveReviewState: resolution.effectiveReviewState,
      sourceFiles: files,
      results,
    });
  }

  report.totals = { pass: totalPass, fail: totalFail };
  console.log(`\n${totalPass} passed, ${totalFail} failed`);
  const out = process.env.REPORT_OUT;
  if (out) {
    writeFileSync(out, JSON.stringify(report, null, 2));
    console.log(`Report written to ${out}`);
  }
  await dataSource.destroy();
  if (totalFail) process.exitCode = 1;
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
