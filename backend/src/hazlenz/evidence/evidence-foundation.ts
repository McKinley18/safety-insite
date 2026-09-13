import { createHash } from 'crypto';
import { ClassifyDto } from '../dto/classify.dto';
import {
  EvidenceFact, FactStatus, ExtractedEvidenceFacts,
  buildEvidenceFacts, hasFact, factIds,
} from './shared-evidence-facts';

export type { EvidenceFact, FactStatus };
export type PredicateStatus = 'SUPPORTED' | 'NOT_SUPPORTED' | 'CONTRADICTED' | 'UNKNOWN' | 'NOT_APPLICABLE';

export interface ApplicabilityDecision {
  citation: string;
  family: string;
  status: PredicateStatus;
  confidence: number;
  requiredPredicates: Array<{ name: string; status: PredicateStatus; factIds: string[] }>;
  missingPredicates: string[];
  contradictoryEvidence: string[];
  source: { authority: 'regulation'; bundle: string; version: string };
  explanation: string;
  /**
   * How the jurisdiction this decision was evaluated under was established. A SUPPORTED
   * decision under a HAZLENZ_INFERRED jurisdiction is a real, evidence-based match, but is
   * capped below the confidence of a user-confirmed one and says so in its explanation --
   * the UI/report must never present it as if the user had confirmed the regime.
   */
  jurisdictionProvenance: 'USER_CONFIRMED' | 'HAZLENZ_INFERRED' | 'UNKNOWN';
}

// Extraction primitive (types, buildEvidenceFacts, hasFact, factIds) now lives in
// shared-evidence-facts.ts (V5-C02) so other live consumers can build/consume the same
// EvidenceFact[] representation. `extract()`/`has()`/`ids()` below are thin local aliases that
// preserve this file's original call sites verbatim -- the extraction logic itself did not change.
type Extracted = ExtractedEvidenceFacts;

function extract(request: ClassifyDto): Extracted {
  return buildEvidenceFacts(request);
}

function has(e: Extracted, type: string, value?: unknown) {
  return hasFact(e, type, value);
}

function ids(e: Extracted, type: string) {
  return factIds(e, type);
}

function decision(
  e: Extracted, citation: string, family: string,
  predicates: Array<[string, boolean | undefined, string[]]>,
  notApplicable = false,
): ApplicabilityDecision {
  const requiredPredicates = predicates.map(([name, state, factIds]) => ({
    name, status: (state === true ? 'SUPPORTED' : state === false ? 'CONTRADICTED' : 'UNKNOWN') as PredicateStatus, factIds,
  }));
  const missingPredicates = requiredPredicates.filter(item => item.status === 'UNKNOWN').map(item => item.name);
  const contradictoryEvidence = requiredPredicates.filter(item => item.status === 'CONTRADICTED').map(item => item.name);
  const status: PredicateStatus = notApplicable ? 'NOT_APPLICABLE' :
    contradictoryEvidence.length ? 'CONTRADICTED' : missingPredicates.length ? 'UNKNOWN' : 'SUPPORTED';
  const inferredJurisdiction = e.jurisdictionProvenance === 'HAZLENZ_INFERRED';
  return {
    citation, family, status,
    confidence: status === 'SUPPORTED' && inferredJurisdiction ? 0.8
      : status === 'SUPPORTED' || status === 'NOT_APPLICABLE' ? 0.96 : status === 'UNKNOWN' ? 0.45 : 0.05,
    requiredPredicates, missingPredicates, contradictoryEvidence,
    source: { authority: 'regulation', bundle: 'hazlenz-offline-federal-core', version: '2026-07-29.1' },
    jurisdictionProvenance: e.jurisdictionProvenance,
    explanation: status === 'SUPPORTED'
      ? inferredJurisdiction
        ? `Supported by submitted evidence for ${family}; jurisdiction was inferred by HazLenz from the observation wording (${e.jurisdictionBasis.map(item => `"${item}"`).join(', ') || 'regime cues'}), not user-confirmed -- confirm the inspection's regulatory context to finalize. Qualified review remains required.`
        : `Supported by submitted evidence for ${family}; qualified review remains required.`
      : status === 'NOT_APPLICABLE'
        ? `The submitted evidence establishes an exception or a condition below this family's material threshold.`
        : status === 'UNKNOWN'
          ? `Candidate only; missing: ${missingPredicates.join(', ')}.`
          : `Suppressed because submitted evidence contradicts: ${contradictoryEvidence.join(', ')}.`,
  };
}

function evaluate(e: Extracted): ApplicabilityDecision[] {
  const mine = e.jurisdiction === 'msha';
  const gi = e.jurisdiction === 'osha-general-industry';
  const construction = e.jurisdiction === 'osha-construction';
  // Jurisdiction is a fact like any other: it can be UNKNOWN (not yet confirmed) rather than
  // confirmed-absent. Previously `mine`/`gi`/`construction` were plain booleans used directly as
  // BOTH the rule-entry gate AND the jurisdiction predicate's value, so an observation with no
  // confirmed jurisdiction (the frontend's default "all" agency mode sends no scope hint at all)
  // made every single one of them `false`, which skipped every jurisdiction-gated rule outright --
  // zero standard candidates for any finding, however textbook, until a user manually picked a
  // specific regulatory scope. The *Gate booleans below let evaluation proceed when jurisdiction is
  // unknown (mirroring what "all supported standards" is supposed to mean), while the *Jur
  // ternaries keep the jurisdiction predicate itself honestly UNKNOWN (not falsely CONTRADICTED) in
  // that case -- a confirmed *different* jurisdiction still yields `false` and still excludes the
  // rule, exactly as before.
  //
  // `e.jurisdiction` is the ONE resolved regime for the observation (persisted inspection context
  // > explicit request > answered clarification > HazLenz inference from strong wording > unknown,
  // see buildEvidenceFacts). A confirmed OR inferred regime narrows evaluation to that regime's
  // rules -- Construction-only rules do not leak into a General Industry inspection merely because
  // their vocabulary scores well, and MSHA never casually returns OSHA authority. An inferred
  // regime additionally caps decision confidence and is labelled HAZLENZ_INFERRED (see decision()).
  const jurisdictionUnknown = e.jurisdiction === 'unknown';
  const mineGate = mine || jurisdictionUnknown;
  const giGate = gi || jurisdictionUnknown;
  const constructionGate = construction || jurisdictionUnknown;
  const mineJur = mine ? true : jurisdictionUnknown ? undefined : false;
  const giJur = gi ? true : jurisdictionUnknown ? undefined : false;
  const constructionJur = construction ? true : jurisdictionUnknown ? undefined : false;
  const servicing = has(e, 'workActivity', 'servicing_or_maintenance');
  const activeEnergy = has(e, 'energyState', 'energized_or_operating');
  const notIsolated = has(e, 'energyIsolationState', 'not_isolated');
  const current = !e.currentHazardNegated;
  // "Hazardous energy present or capable" (LOTO, both regimes): explicitly stated energized/
  // operating -> true; explicitly de-energized -> false; otherwise, an energy source the observer
  // says has NOT been isolated/locked ("hazardous energy has not been isolated", "no lock or tag
  // applied") is by definition still capable of release -- the observation itself asserts the
  // energy exists -- so it is not an open question worth interrupting the analysis for; and a
  // verified isolation ("zero-energy state was verified") means it is NOT capable. Only when
  // none of these is stated does the predicate stay honestly UNKNOWN.
  const energyCapable = activeEnergy ? true
    : has(e, 'energyState', 'deenergized') ? false
    : notIsolated ? true
    : has(e, 'energyIsolationState', 'isolated_and_verified') ? false : undefined;
  const output: ApplicabilityDecision[] = [];

  if (mineGate && servicing) output.push(decision(e, '30 CFR 56.12016', 'MSHA energy control', [
    ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
    ['electrical or mechanical servicing activity', servicing, ids(e, 'workActivity')],
    // This predicate previously used the raw `activeEnergy` boolean directly,
    // so an observation that never uses an explicit "energized"/"live"/
    // "powered" word (a very ordinary way to describe servicing electrical
    // equipment without an explicit LOTO record) registered as CONTRADICTED
    // evidence rather than an open question -- excluding the whole candidate
    // outright. The sibling OSHA General Industry rule for the same
    // underlying hazard (1910.147, a few lines below) already uses the
    // correct undefined-fallback form; this aligns 56.12016 with it so
    // "energy state not stated" is honestly UNKNOWN, not silently treated as
    // "energy confirmed absent."
    ['hazardous energy present or capable', energyCapable, ids(e, 'energyState')],
    ['power not isolated and locked', notIsolated ? true :
      has(e, 'energyIsolationState', 'isolated_and_verified') ? false : undefined, ids(e, 'energyIsolationState')],
    ['current condition', current, ids(e, 'currentHazardState')],
  ]));
  if (mineGate && has(e, 'groundCondition')) output.push(decision(e, '30 CFR 56.3200', 'MSHA ground control', [
    ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
    ['loose or unsafe ground', true, ids(e, 'groundCondition')],
    ['miner travel or work exposure', /\b(miner|travelway|work area|walking below)\b/i.test(e.text), ids(e, 'employeeExposure')],
    ['current condition', current, ids(e, 'currentHazardState')],
  ]));
  if (mineGate && has(e, 'electricalLiveParts')) output.push(decision(e, '30 CFR 56.12025', 'MSHA electrical grounding and continuity', [
    ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
    ['exposed or damaged conductor', true, ids(e, 'electricalLiveParts')],
    ['energized or capable', activeEnergy, ids(e, 'energyState')],
    // Absence of a stated wet/conductive/contact pathway is an open question, not evidence
    // AGAINST the rule -- `false` here wrongly reported CONTRADICTED for an energized exposed
    // conductor merely because the observer did not mention water or hand contact.
    ['conductive contact pathway', has(e, 'environment', 'wet_or_conductive') || /\bholds?|touch(?:ing|es)?\b/i.test(e.text) ? true : undefined,
      [...ids(e, 'environment'), ...ids(e, 'employeeExposure')]],
  ]));
  if (mineGate && has(e, 'guardState')) {
    const protectedState = has(e, 'guardState', 'present_and_effective');
    output.push(decision(e, '30 CFR 56.14107(a)', 'MSHA moving machine parts guarding', [
      ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
      ['moving-part exposure', protectedState ? false : true, ids(e, 'guardState')],
      ['guard absent or ineffective', protectedState ? false : true, ids(e, 'guardState')],
    ], protectedState));
  }
  // KG-3F (Phases 5-7). 30 CFR 56.14132 is TWO distinct rules, and this predicate previously
  // collapsed them onto the wrong one.
  //
  //   (a)    Manually-operated horns or other audible warning devices PROVIDED on self-propelled
  //          mobile equipment as a safety feature must be maintained in functional condition.
  //   (b)(1) When the operator has an OBSTRUCTED VIEW TO THE REAR, the equipment must have one of:
  //          (i) an automatic reverse-activated signal alarm; (ii) a wheel-mounted bell alarm;
  //          (iii) a discriminating backup alarm; or (iv) AN OBSERVER to signal when it is safe to
  //          back up.
  //
  // The old rule emitted `(a)` -- horn maintenance -- for a backup-alarm predicate, hard-coded its
  // 'reverse warning required' condition to `true` (so the obstructed-view trigger was ASSERTED,
  // never established), and ignored the observer alternative entirely, so "no backup alarm" was
  // treated as a violation even where (b)(1)(iv) permits an observer instead.
  //
  // Split below. `(b)(1)` is emitted ONLY where the obstructed-view condition is actually
  // established by evidence; where the observation is silent the rule falls back to a truthful
  // SECTION-level candidate rather than promoting to a paragraph whose trigger nobody observed --
  // the same discipline KG-3D applied refusing 1910.303(g)(2)(i) on unestablished voltage.
  if (mineGate && has(e, 'hornState')) {
    const hornOk = has(e, 'hornState', 'functional');
    output.push(decision(e, '30 CFR 56.14132(a)', 'MSHA manually-operated horn maintenance', [
      ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
      ['audible warning device provided as a safety feature', true, ids(e, 'hornState')],
      ['device not maintained in functional condition', hornOk ? false : true, ids(e, 'hornState')],
    ], hornOk));
  }
  if (mineGate && (has(e, 'backupAlarmState') || has(e, 'rearViewState'))) {
    const alarmFunctional = has(e, 'backupAlarmState', 'functional');
    const observerPresent = has(e, 'reverseWarningAlternative', 'observer_present');
    // undefined = an open question, NOT evidence against the rule.
    const obstructed = has(e, 'rearViewState', 'obstructed') ? true
      : has(e, 'rearViewState', 'clear') ? false : undefined;
    // Any ONE of the four (b)(1) methods satisfies the rule.
    const compliantMethodPresent = alarmFunctional || observerPresent;
    // Exact paragraph only when its trigger is established; otherwise the section.
    const citation = obstructed === true ? '30 CFR 56.14132(b)(1)' : '30 CFR 56.14132';
    output.push(decision(e, citation, 'MSHA reverse-warning method for obstructed rear view', [
      ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
      ['operator has an obstructed view to the rear', obstructed,
        ids(e, 'rearViewState')],
      ['no compliant reverse-warning method (alarm, bell, discriminating alarm, or observer)',
        compliantMethodPresent ? false : true,
        [...ids(e, 'backupAlarmState'), ...ids(e, 'reverseWarningAlternative')]],
    ], compliantMethodPresent || obstructed === false));
  }
  if (mineGate && has(e, 'fallExposure')) output.push(decision(e, '30 CFR 56.15005', 'MSHA fall protection', [
    ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
    ['fall exposure from elevation', true, ids(e, 'fallExposure')],
    ['effective fall protection absent', has(e, 'fallProtectionState', 'present') ? false : true,
      ids(e, 'fallProtectionState')],
  ]));
  if (giGate && has(e, 'guardState')) {
    const guardPresent = has(e, 'guardState', 'present_and_effective');
    const energyUnsafe = has(e, 'energyState', 'energized_or_operating');
    const energySafe = has(e, 'energyIsolationState', 'isolated_and_verified') || has(e, 'energyState', 'deenergized');
    output.push(decision(e, '29 CFR 1910.212(a)(1)', 'OSHA General Industry machine guarding', [
      ['general-industry jurisdiction', giJur, ids(e, 'jurisdiction')],
      ['machine guard condition', guardPresent ? false : true, ids(e, 'guardState')],
      ['moving or accessible energy', energyUnsafe ? true : energySafe ? false : undefined,
        [...ids(e, 'energyState'), ...ids(e, 'energyIsolationState')]],
      ['current condition', current, ids(e, 'currentHazardState')],
    ], guardPresent || energySafe));
  }
  if (giGate && has(e, 'electricalLiveParts')) output.push(decision(e, '29 CFR 1910.303', 'OSHA General Industry live electrical parts', [
    ['general-industry jurisdiction', giJur, ids(e, 'jurisdiction')],
    ['live electrical part', true, ids(e, 'electricalLiveParts')],
    ['reachable or exposed', true, ids(e, 'electricalLiveParts')],
    ['not guarded or deenergized', !has(e, 'energyIsolationState', 'isolated_and_verified'), ids(e, 'energyIsolationState')],
  ]));
  if (giGate && servicing) output.push(decision(e, '29 CFR 1910.147', 'OSHA General Industry hazardous energy control', [
    ['general-industry jurisdiction', giJur, ids(e, 'jurisdiction')],
    ['servicing or maintenance activity', true, ids(e, 'workActivity')],
    ['hazardous energy present or capable', energyCapable, ids(e, 'energyState')],
    ['energy not isolated and locked', notIsolated ? true :
      has(e, 'energyIsolationState', 'isolated_and_verified') ? false : undefined, ids(e, 'energyIsolationState')],
  ]));
  if (giGate && has(e, 'egressRoute')) output.push(decision(e, '29 CFR 1910.36', 'OSHA exit routes', [
    ['general-industry jurisdiction', giJur, ids(e, 'jurisdiction')],
    // Occupancy is UNKNOWN when the observation simply does not mention people -- never FALSE.
    // A bare boolean made "exit door by shipping blocked w/ pallets, been like that all week"
    // CONTRADICT 1910.36 purely because the observer did not write the word "employees", and a
    // contradicted-only decision set then reported the whole observation as a Controlled
    // condition at risk 0: a blocked exit presented as safe. An unstated fact must leave the
    // decision UNKNOWN (a candidate needing evidence), which is what the exit-state predicate
    // below already does.
    ['occupied workplace', /\b(occupied|shift|employees?|workers?|staff|personnel|crew)\b/i.test(e.text) || undefined, ids(e, 'employeeExposure')],
    ['required exit or route', true, ids(e, 'egressRoute')],
    ['exit locked, blocked, or unusable', has(e, 'egressState', 'locked_or_blocked') ? true :
      has(e, 'egressState', 'open_and_usable') ? false : undefined, ids(e, 'egressState')],
  ], has(e, 'egressState', 'open_and_usable')));
  if (giGate && has(e, 'chemicalLabelState')) {
    const compliant = has(e, 'chemicalLabelState', 'compliant');
    output.push(decision(e, '29 CFR 1910.1200', 'OSHA hazard communication labeling', [
      ['general-industry jurisdiction', giJur, ids(e, 'jurisdiction')],
      ['workplace chemical container', true, ids(e, 'chemicalLabelState')],
      ['identity or hazard label missing', compliant ? false : true, ids(e, 'chemicalLabelState')],
    ], compliant));
  }
  if (giGate && has(e, 'fallExposure')) output.push(decision(e, '29 CFR 1910.28', 'OSHA walking-working surface fall protection', [
    ['general-industry jurisdiction', giJur, ids(e, 'jurisdiction')],
    ['unprotected edge or opening', true, ids(e, 'fallExposure')],
    ['employee access or exposure', e.noExposure ? false :
      /\b(workers?|employees?|mechanics?|people|person|aisle|pass)\b/i.test(e.text) ? true : undefined,
      ids(e, 'employeeExposure')],
  ]));
  if (constructionGate && has(e, 'workAreaType', 'excavation')) {
    const stableRock = has(e, 'excavationMaterial', 'stable_rock');
    output.push(decision(e, '29 CFR 1926.652(a)(1)', 'OSHA Construction excavation protective systems', [
      ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
      ['trench or excavation', true, ids(e, 'workAreaType')],
      ['worker cave-in exposure', e.noExposure ? false :
        /\b(workers?|laborers?|employees?|persons?)\b/i.test(e.text) ? true : undefined, ids(e, 'employeeExposure')],
      ['protective system absent', has(e, 'protectiveSystem', 'absent') ? true :
        e.controlsAffirmed ? false : undefined, ids(e, 'protectiveSystem')],
      ['no stable-rock exception', stableRock ? false : true, ids(e, 'excavationMaterial')],
    ], stableRock));
  }
  if (constructionGate && has(e, 'loadState', 'suspended')) output.push(decision(e, '29 CFR 1926.1425', 'OSHA Construction crane fall zone', [
    ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
    ['suspended or moving load', true, ids(e, 'loadState')],
    ['worker in fall zone', has(e, 'employeeExposure', 'within_overhead_or_fall_zone') ? true :
      e.noExposure ? false : undefined, ids(e, 'employeeExposure')],
    ['permitted task exception absent', has(e, 'fallZonePermittedTask', false) ? true :
      has(e, 'fallZonePermittedTask', true) ? false : undefined, ids(e, 'fallZonePermittedTask')],
  ]));
  if (constructionGate && has(e, 'equipmentType', 'crane') && has(e, 'electricalLine')) output.push(decision(
    e, '29 CFR 1926.1408', 'OSHA Construction crane power-line safety', [
      ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
      ['crane or derrick operation', true, ids(e, 'equipmentType')],
      ['energized or presumed energized line', true, ids(e, 'electricalLine')],
      ['encroachment potential', e.distanceFeet !== undefined ? e.distanceFeet <= 20 : undefined, ids(e, 'powerLineDistance')],
      ['required encroachment controls absent', has(e, 'powerLineControls', 'absent') ? true : undefined,
        ids(e, 'powerLineControls')],
    ],
  ));
  if (constructionGate && has(e, 'workAreaType', 'scaffold')) {
    const height = Number(e.facts.find(item =>
      item.type === 'workHeightFeet' && !['corrected', 'contradicted'].includes(item.status))?.value);
    output.push(decision(e, '29 CFR 1926.451(g)(1)', 'OSHA Construction scaffold fall protection', [
      ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
      ['scaffold work platform', true, ids(e, 'workAreaType')],
      ['platform more than 10 feet above lower level', Number.isFinite(height) ? height > 10 : undefined,
        ids(e, 'workHeightFeet')],
      ['worker on platform', /\b(mason|worker|laborer|employee|person)\b/i.test(e.text) ? true : undefined,
        ids(e, 'employeeExposure')],
      ['guardrail or personal fall protection absent', has(e, 'guardState', 'absent_or_ineffective') ||
        has(e, 'fallExposure') ? true : has(e, 'fallProtectionState', 'present') ? false : undefined,
        [...ids(e, 'guardState'), ...ids(e, 'fallProtectionState')]],
    ]));
  }
  if (constructionGate && has(e, 'silicaGeneratingTask')) output.push(decision(
    e, '29 CFR 1926.1153', 'OSHA Construction respirable crystalline silica', [
      ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
      ['silica-generating construction task', true, ids(e, 'silicaGeneratingTask')],
      ['airborne dust or exposure pathway', has(e, 'airborneDust', 'visible') ? true : undefined, ids(e, 'airborneDust')],
      ['required engineering/work-practice control absent', has(e, 'silicaControlState', 'absent') ? true :
        has(e, 'silicaControlState', 'effective') ? false : undefined, ids(e, 'silicaControlState')],
    ],
  ));
  if (constructionGate && has(e, 'fallExposure')) output.push(decision(e, '29 CFR 1926.501', 'OSHA Construction fall protection', [
    ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
    ['unprotected side, edge, or opening', true, ids(e, 'fallExposure')],
    ['worker exposure', e.noExposure ? false :
      /\b(roofer|worker|laborer|employee|person)\b/i.test(e.text) ? true : undefined, ids(e, 'employeeExposure')],
    ['fall protection absent', has(e, 'fallProtectionState', 'present') ? false : true, ids(e, 'fallProtectionState')],
  ]));
  // ---- OSHA Construction analogs of conditions that previously had rules only under General
  // Industry / MSHA. Each was verified against osha.gov's published text on 2026-08-18 (see
  // verification/insite-core-closure-standards-validation-2026-08-18/CONSTRUCTION_RULE_SOURCES.md).
  // Without these, a Construction inspection with a chained exit, an unlabelled solvent container,
  // an exposed energized conductor, an unguarded moving part, or a measured over-limit noise level
  // returned no 1926 candidate at all -- an honest gap, but one that left the finding with no
  // regulatory basis and let generic follow-up questions stand in for an assessment.
  if (constructionGate && has(e, 'chemicalLabelState')) {
    const compliant = has(e, 'chemicalLabelState', 'compliant');
    // 1926.59: "The requirements applicable to construction work under this section are
    // identical to those set forth at § 1910.1200 of this chapter."
    output.push(decision(e, '29 CFR 1926.59', 'OSHA Construction hazard communication (identical to 1910.1200)', [
      ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
      ['workplace chemical container', true, ids(e, 'chemicalLabelState')],
      ['identity or hazard label missing', compliant ? false : true, ids(e, 'chemicalLabelState')],
    ], compliant));
  }
  if (constructionGate && has(e, 'electricalLiveParts')) output.push(decision(e, '29 CFR 1926.416(a)(1)', 'OSHA Construction electric power circuit contact protection', [
    ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
    ['employee could contact part of an electric power circuit', true, ids(e, 'electricalLiveParts')],
    ['circuit not deenergized/grounded or effectively guarded', !has(e, 'energyIsolationState', 'isolated_and_verified'), ids(e, 'energyIsolationState')],
  ]));
  if (constructionGate && has(e, 'guardState')) {
    const guardPresent = has(e, 'guardState', 'present_and_effective');
    // 1926.300(b)(2): belts, gears, shafts, pulleys, ... or other reciprocating, rotating or moving
    // parts of equipment shall be guarded if such parts are exposed to contact by employees.
    output.push(decision(e, '29 CFR 1926.300(b)(2)', 'OSHA Construction moving-part guarding of equipment', [
      ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
      ['moving part exposed to employee contact', guardPresent ? false : true, ids(e, 'guardState')],
      ['guard absent or ineffective', guardPresent ? false : true, ids(e, 'guardState')],
      ['current condition', current, ids(e, 'currentHazardState')],
    ], guardPresent));
  }
  if (constructionGate && e.noiseTwa !== undefined) output.push(decision(e, '29 CFR 1926.52', 'OSHA Construction occupational noise exposure', [
    ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
    ['occupational employee exposure', e.noExposure ? false : true, ids(e, 'employeeExposure')],
    ['measured full-shift TWA', true, ids(e, 'noiseTwaDba')],
    // Table D-2: 90 dBA (slow response) for 8 hours; protection/controls/hearing conservation
    // are required when levels EXCEED the table. Construction has no 85 dBA action level.
    ['exceeds Table D-2 (90 dBA, 8 hours)', e.noiseTwa > 90, ids(e, 'noiseTwaDba')],
  ], e.noiseTwa <= 90));
  // ---- Rules added 2026-08-18 (pre-commit closure) after verifying the text against osha.gov /
  // govinfo.gov (see CONSTRUCTION_RULE_SOURCES.md, "Gap adjudication" table in FINAL_REPORT.md).
  // 1926.34(a): "In every building or structure exits shall be so arranged and maintained as to
  // provide free and unobstructed egress from all parts of the building or structure at all
  // times when it is occupied." ((c): kept free of all obstructions or impediments.)
  if (constructionGate && has(e, 'egressRoute')) output.push(decision(e, '29 CFR 1926.34(a)', 'OSHA Construction means of egress', [
    ['construction jurisdiction', constructionJur, ids(e, 'jurisdiction')],
    // Unstated occupancy is UNKNOWN, not FALSE -- same reasoning as the 1910.36 predicate above.
    ['occupied building or structure', /\b(occupied|shift|employees?|workers?|laborers?|crew|staff|personnel)\b/i.test(e.text) || undefined, ids(e, 'employeeExposure')],
    ['required exit or egress route', true, ids(e, 'egressRoute')],
    ['exit locked, blocked, or obstructed', has(e, 'egressState', 'locked_or_blocked') ? true :
      has(e, 'egressState', 'open_and_usable') ? false : undefined, ids(e, 'egressState')],
  ], has(e, 'egressState', 'open_and_usable')));
  // 1910.178(p)(1): a powered industrial truck found in need of repair, defective, or in any way
  // unsafe shall be taken out of service until restored to safe operating condition.
  if (giGate && has(e, 'pitState', 'defective_in_service')) output.push(decision(e, '29 CFR 1910.178(p)(1)', 'OSHA General Industry powered industrial truck removed from service when unsafe', [
    ['general-industry jurisdiction', giJur, ids(e, 'jurisdiction')],
    ['powered industrial truck found defective, unsafe, or in need of repair', true, ids(e, 'pitState')],
    ['truck not taken out of service', true, ids(e, 'pitState')],
    ['current condition', current, ids(e, 'currentHazardState')],
  ]));
  // 30 CFR 62.120 / 62.130: action level = TWA8 of 85 dBA (enrol in a hearing conservation
  // program); permissible exposure level = TWA8 of 90 dBA (feasible engineering/administrative
  // controls + HCP). Definitions from 30 CFR 62.101.
  if (mineGate && e.noiseTwa !== undefined) {
    output.push(decision(e, '30 CFR 62.120', 'MSHA noise action level (hearing conservation program)', [
      ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
      ['miner exposure during the work shift', e.noExposure ? false : true, ids(e, 'employeeExposure')],
      ['measured TWA8', true, ids(e, 'noiseTwaDba')],
      ['equals or exceeds the action level (85 dBA TWA8)', e.noiseTwa >= 85, ids(e, 'noiseTwaDba')],
    ], e.noiseTwa < 85));
    if (e.noiseTwa > 90) output.push(decision(e, '30 CFR 62.130', 'MSHA noise permissible exposure level (controls required)', [
      ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
      ['miner exposure during the work shift', e.noExposure ? false : true, ids(e, 'employeeExposure')],
      ['measured TWA8', true, ids(e, 'noiseTwaDba')],
      ['exceeds the permissible exposure level (90 dBA TWA8)', true, ids(e, 'noiseTwaDba')],
    ]));
  }
  // 30 CFR 47.41(a): the operator must ensure that each container of a hazardous chemical has a label.
  if (mineGate && has(e, 'chemicalLabelState')) {
    const compliant = has(e, 'chemicalLabelState', 'compliant');
    output.push(decision(e, '30 CFR 47.41(a)', 'MSHA hazard communication container labels', [
      ['MSHA jurisdiction', mineJur, ids(e, 'jurisdiction')],
      ['container of a hazardous chemical', true, ids(e, 'chemicalLabelState')],
      ['label missing', compliant ? false : true, ids(e, 'chemicalLabelState')],
    ], compliant));
  }
  if (giGate && e.noiseTwa !== undefined) output.push(decision(e, '29 CFR 1910.95', 'OSHA occupational noise', [
    ['general-industry jurisdiction', giJur, ids(e, 'jurisdiction')],
    ['occupational employee exposure', e.noExposure ? false : true, ids(e, 'employeeExposure')],
    ['measured full-shift TWA', true, ids(e, 'noiseTwaDba')],
    ['action threshold met', e.noiseTwa >= 85, ids(e, 'noiseTwaDba')],
  ], e.noiseTwa < 85 && !/\bimpulse|impact noise\b/i.test(e.text.replace(/no unusual impulse noise/ig, ''))));
  return output;
}

function questionFor(decision: ApplicabilityDecision, missing: string) {
  const map: Record<string, string> = {
    'hazardous energy present or capable': 'Was the equipment energized or capable of unexpected movement while the work was performed?',
    'power not isolated and locked': 'Had every hazardous energy source been isolated, locked, and verified before work began?',
    'miner travel or work exposure': 'Could miners travel or work beneath the loose ground?',
    'permitted task exception absent': 'Were the workers beneath the load only to receive, guide, or connect it under the permitted fall-zone procedure?',
    'encroachment potential': 'What was the minimum distance between any crane part/load and the power line?',
    'protective system absent': 'Was the excavation protected by sloping, shoring, shielding, or a documented exception?',
    'worker cave-in exposure': 'Did any worker enter the excavation where a cave-in could reach them?',
    'resolve contradictory evidence': 'Which conflicting account reflects the condition at the time of exposure, and what evidence verifies it?',
  };
  return map[missing] || `Can you confirm: ${missing}?`;
}

function enrichEvidenceAwareMechanism(result: any, extracted: Extracted): void {
  const active = extracted.facts.filter(item => !['corrected', 'contradicted'].includes(item.status));
  const hasFact = (type: string, value?: string) => active.some(item => item.type === type &&
    (value === undefined || String(item.value) === value));
  const existing = result.mechanismChain || result.inspectionIntelligence?.mechanismChain || {};
  let patch: Record<string, unknown> | undefined;
  if (hasFact('chemicalLabelState', 'missing')) {
    patch = {
      observedCondition: 'A workplace chemical container lacks confirmed identity or hazard labeling.',
      failureMode: 'An identity gap and hazard-communication gap are present; an actual release is not established by this observation.',
      exposurePathway: 'Misidentification or inappropriate handling could lead to contact, inhalation, incompatible handling, or delayed emergency response.',
      potentialConsequence: 'Potential chemical exposure or delayed protective response if the contents or hazards are unknown.',
      evidenceGaps: ['Confirm the container contents, label, SDS, handling activity, and whether any release or exposure occurred.'],
      controlFocus: ['Isolate the container from use until contents and hazards are confirmed; label and communicate the material through qualified review.'],
    };
  } else if (hasFact('workAreaType', 'scaffold') && hasFact('guardState', 'absent_or_ineffective')) {
    patch = {
      observedCondition: 'A scaffold is described with missing or ineffective edge protection.',
      failureMode: 'Incomplete scaffold edge protection creates an unprotected platform edge and a potential scaffold fall exposure.',
      exposurePathway: 'A worker on or accessing the scaffold platform could fall from the scaffold to a lower level.',
      potentialConsequence: 'Serious injury from a fall is possible if a worker is exposed at the unprotected edge.',
      evidenceGaps: ['Confirm scaffold type, platform height, worker presence, access route, and whether another compliant fall-protection system is in place.'],
      controlFocus: ['Restrict access until a competent person verifies guardrails or another suitable fall-protection system.'],
    };
  } else if (/\b(natural gas odor|gas odor|gas smell|unknown vapor)\b/i.test(extracted.text)) {
    const activeRelease = /\b(leak(?:ing)?|release|escaping|hissing|measured gas)\b/i.test(extracted.text);
    patch = {
      observedCondition: activeRelease ? 'A possible gas release is reported.' : 'A gas-like odor or suspected vapor is reported, but the source is not confirmed.',
      failureMode: activeRelease ? 'The source and extent of the suspected release are not yet controlled.' : 'The odor does not by itself establish the gas identity, concentration, or source.',
      exposurePathway: 'If gas is present, inhalation, oxygen displacement, or ignition could create exposure; the actual pathway remains unverified.',
      potentialConsequence: 'Potential fire, explosion, or inhalation harm depends on source, concentration, ventilation, and ignition conditions.',
      evidenceGaps: ['Confirm gas identity/source, atmospheric testing, ventilation, ignition sources, isolation or shutoff, and emergency response status.'],
      controlFocus: ['Restrict ignition sources and obtain qualified gas/atmospheric evaluation; do not treat odor alone as a confirmed regulatory violation.'],
    };
  }
  if (!patch) return;
  const merged = { ...existing, ...patch };
  result.mechanismChain = merged;
  result.inspectionIntelligence = { ...(result.inspectionIntelligence || {}), mechanismChain: merged };
    const gasObservation = /\b(natural gas odor|gas odor|gas smell|unknown vapor)\b/i.test(extracted.text);
    if (gasObservation && (!Array.isArray(result.evidenceGapQuestions) || !result.evidenceGapQuestions.length)) {
    const questions = [
      'Confirm the gas source or identity and whether the odor was measured or only suspected.',
      'Confirm ventilation, ignition sources, and whether the source was isolated or shut off.',
      'Confirm atmospheric testing and whether qualified or emergency responders evaluated the area.',
    ];
    result.evidenceGapQuestions = questions;
    result.inspectionIntelligence = { ...(result.inspectionIntelligence || {}), evidenceGapQuestions: questions };
    result.clarifyingQuestions = questions.map((question, index) => ({
      id: `gas-evidence-${index + 1}`,
      question,
      requiredFor: 'risk-and-standard-applicability',
      priority: index === 0 ? 'critical' : 'important',
    }));
  }
}

export function applyEvidenceFoundation(result: any, request: ClassifyDto) {
  if (!result || typeof result !== 'object') return result;
  const extracted = extract(request);
  enrichEvidenceAwareMechanism(result, extracted);
  const unresolvedContradictions = extracted.facts.filter(item => item.status === 'contradicted');
  const decisions = evaluate(extracted).map(item => {
    if (!unresolvedContradictions.length || item.status !== 'SUPPORTED') return item;
    return {
      ...item,
      status: 'UNKNOWN' as PredicateStatus,
      confidence: Math.min(item.confidence, 0.35),
      requiredPredicates: [
        ...item.requiredPredicates,
        {
          name: 'resolve contradictory evidence',
          status: 'UNKNOWN' as PredicateStatus,
          factIds: unresolvedContradictions.map(fact => fact.id),
        },
      ],
      missingPredicates: [...item.missingPredicates, 'resolve contradictory evidence'],
      contradictoryEvidence: unresolvedContradictions.map(fact => fact.type),
      explanation: 'Candidate only; submitted evidence contains an unresolved material contradiction.',
    };
  });
  const supported = decisions.filter(item => item.status === 'SUPPORTED');
  const suppressed = decisions.filter(item => item.status === 'CONTRADICTED' || item.status === 'NOT_APPLICABLE');
  const unknown = decisions.filter(item => item.status === 'UNKNOWN');
  const snapshotPayload = {
    schemaVersion: '1.0',
    facts: extracted.facts,
    criticalUnknowns: Array.from(new Set(unknown.flatMap(item => item.missingPredicates))),
    contradictions: unresolvedContradictions,
      extractorVersion: 'evidence-foundation-2026-07-29.2',
    offlineBundle: { id: 'hazlenz-offline-federal-core', version: '2026-07-29.1' },
  };
  result.evidenceSnapshot = {
    id: `ev-${createHash('sha256').update(JSON.stringify(snapshotPayload)).digest('hex').slice(0, 20)}`,
    ...snapshotPayload,
  };
  result.applicabilityDecisions = decisions;
  // The regulatory context HazLenz actually evaluated under, with honest provenance, so the
  // persisted analysis snapshot, the Standard Detail UI, and the report can all state whether
  // the regime came from the inspection setup (USER_CONFIRMED), from HazLenz's reading of the
  // observation (HAZLENZ_INFERRED), or is genuinely unresolved (UNKNOWN).
  result.regulatoryContext = {
    value: extracted.jurisdiction,
    provenance: extracted.jurisdictionProvenance,
    source: extracted.jurisdictionProvenance === 'HAZLENZ_INFERRED' ? 'observation_evidence'
      : extracted.jurisdictionProvenance === 'USER_CONFIRMED'
        ? (request.regulatoryContext?.provenance === 'USER_CONFIRMED' && request.regulatoryContext.source === 'inspection' ? 'inspection' : 'request')
        : undefined,
    inspectionId: request.regulatoryContext?.inspectionId,
    basis: extracted.jurisdictionBasis,
  };

  if (extracted.currentHazardNegated || suppressed.length > 0 && supported.length === 0 && unknown.length === 0) {
    result.primaryCitation = '';
    result.primaryStandards = [];
    result.suggestedStandards = [];
    result.standards = [];
    result.assessmentDisposition = extracted.correctedBeforeReview ? 'corrected_condition' : 'controlled_condition';
    result.regulatoryConclusion = {
      advisoryOnly: true, qualifiedHumanReviewRequired: true,
      violationDetermination: 'not_determined', evidenceStatus: 'controlled_or_not_applicable',
    };
    result.risk = {
      riskScore: 0, riskBand: 'Controlled', imminentDanger: false,
      fatalityPotential: 'not_established', requiresShutdown: false,
      reasoning: ['Current uncontrolled exposure is not established by the submitted evidence.'],
    };
  } else if (supported.length) {
    const direct = supported[0];
    result.primaryCitation = direct.citation;
    const visibleDecision = {
      citation: direct.citation,
      title: direct.family,
      summary: direct.explanation,
      authority: 'primary',
      agency: direct.source.bundle.includes('federal') ? 'Federal' : undefined,
      status: 'confirmed',
      applicabilityStatus: 'SUPPORTED',
      isDirectMatch: true,
      isCandidate: false,
      confidence: direct.confidence,
      matchingReasons: direct.requiredPredicates.filter(item => item.status === 'SUPPORTED').map(item => item.name),
      evidenceGaps: direct.missingPredicates,
      source: [direct.source.bundle, direct.source.version],
    };
    const existingDecisions = Array.isArray(result.standardDecisions) ? result.standardDecisions : [];
    result.standardDecisions = [
      ...existingDecisions.filter((item: any) => String(item?.citation || '').trim() !== direct.citation),
      visibleDecision,
    ];
    result.primaryStandards = [visibleDecision];
    result.suggestedStandards = [
      ...(Array.isArray(result.suggestedStandards) ? result.suggestedStandards.filter((item: any) => String(item?.citation || '').trim() !== direct.citation) : []),
      visibleDecision,
    ];
    result.assessmentDisposition = 'hazard_requires_human_review';
    result.regulatoryConclusion = {
      advisoryOnly: true, qualifiedHumanReviewRequired: true,
      violationDetermination: 'pending_qualified_review', evidenceStatus: 'material_predicates_supported',
    };
  } else if (unknown.length) {
    result.primaryCitation = '';
    result.assessmentDisposition = 'insufficient_evidence';
    result.regulatoryConclusion = {
      advisoryOnly: true, qualifiedHumanReviewRequired: true,
      violationDetermination: 'not_determined', evidenceStatus: 'material_predicates_unknown',
    };
  }
  const perPredicate = unknown.flatMap(item => item.missingPredicates.map(missing => ({
    id: `predicate-${item.citation.replace(/\W+/g, '-').toLowerCase()}-${missing.replace(/\W+/g, '-').toLowerCase()}`,
    question: questionFor(item, missing),
    reason: `The answer materially changes ${item.family} applicability.`,
    answerType: 'single-select',
    options: ['Yes', 'No', 'Not sure'],
    requiredFor: 'standard-applicability',
    priority: item.family.includes('energy') || item.family.includes('crane') || item.family.includes('excavation')
      ? 'critical' : 'important',
    impactedDecisions: ['standard-applicability', 'risk', 'corrective-action'],
    expectedEvidenceFields: [missing],
    isJurisdiction: /\bjurisdiction$/i.test(missing),
  })));
  // Jurisdiction is ONE inspection-wide fact, so it gets ONE targeted question -- not a separate
  // "Can you confirm: <regime> jurisdiction?" per candidate regime (three yes/no questions for
  // the same fact, which is what the per-predicate mapping above would otherwise emit). The
  // answer is expected to be persisted at inspection level by the client so it is never asked
  // again for any finding in the inspection. Only emitted when jurisdiction is genuinely
  // unresolved -- a user-confirmed or HazLenz-inferred regime never reaches this branch because
  // its jurisdiction predicate is SUPPORTED.
  const jurisdictionQuestions = perPredicate.filter(item => item.isJurisdiction);
  const regimeCandidates = Array.from(new Set(unknown
    .filter(item => item.missingPredicates.some(missing => /\bjurisdiction$/i.test(missing)))
    .map(item => item.citation.startsWith('30 CFR') ? 'MSHA'
      : /^29 CFR 1926/.test(item.citation) ? 'OSHA Construction' : 'OSHA General Industry')));
  const consolidatedJurisdiction = jurisdictionQuestions.length ? [{
    id: 'jurisdiction',
    question: 'Which regulatory authority governs this inspection site?',
    reason: `HazLenz found candidate requirements under ${regimeCandidates.join(' and ')}; the answer selects the governing rules for every finding in this inspection and is remembered at the inspection level.`,
    answerType: 'single-select',
    options: ['OSHA General Industry', 'OSHA Construction', 'MSHA', 'Not sure'],
    requiredFor: 'standard-applicability',
    priority: 'critical',
    impactedDecisions: ['standard-applicability', 'risk', 'corrective-action'],
    expectedEvidenceFields: ['jurisdiction'],
    scope: 'inspection',
  }] : [];
  const prioritized = [
    ...consolidatedJurisdiction,
    ...perPredicate.filter(item => !item.isJurisdiction).map(({ isJurisdiction: _omit, ...item }) => item),
  ];
  if (prioritized.length) {
    result.clarificationQuestions = prioritized.slice(0, 3);
  } else if (supported.length || suppressed.length || extracted.currentHazardNegated) {
    result.clarificationQuestions = [];
  } else if (Array.isArray(result.clarificationQuestions)) {
    result.clarificationQuestions = result.clarificationQuestions.slice(0, 3);
  }
  result.evidenceConfidence = {
    score: extracted.facts.length
      ? extracted.facts.reduce((sum, item) => sum + item.confidence, 0) / extracted.facts.length : 0.2,
    basis: 'submitted evidence facts, provenance, unknowns, and contradictions',
    notLegalConfidence: true,
  };
  return result;
}

export interface FindingStandardCandidate {
  citation: string;
  family: string;
  status: PredicateStatus;
  confidence: number;
  applicability: 'direct' | 'candidate' | 'excluded';
  explanation: string;
  missingPredicates: string[];
  /** How the jurisdiction this candidate was evaluated under was established (see ApplicabilityDecision). */
  jurisdictionProvenance: 'USER_CONFIRMED' | 'HAZLENZ_INFERRED' | 'UNKNOWN';
  /** Filled by SafescopeV2Service.hydrateFindingScopedStandards() when standards_master has a row. */
  title?: string;
  plainLanguageSummary?: string;
  sourceKey?: string;
  sourceName?: string;
  sourceType?: string;
  /**
   * KG-3C canonical backing status. THIS is the field to read; it is the only statement about
   * whether governed, reviewer-approved regulatory content backs this citation.
   * See `standards/display/standards-backing-contract.ts`.
   */
  backingStatus?: 'APPROVED_GOVERNED_CONTENT' | 'UNAPPROVED_CONTENT' | 'CITATION_ONLY';
  /** Whose words the displayed body text is. Never infer authority from the presence of text. */
  contentDisclosure?: 'GOVERNED_APPROVED' | 'HAZLENZ_AUTHORED' | 'NONE';
  /**
   * Retained for wire compatibility and DERIVED from `backingStatus` -- true only for
   * `APPROVED_GOVERNED_CONTENT`. Do NOT compute this from `sourceKey`: the finalizer synthesizes
   * a `starter-unverified:` key for rows with no provenance, so a non-empty source key is not
   * evidence of backing (KG-3C root cause).
   */
  corpusBacked?: boolean;
}

/**
 * V5-C-standards-scope. Standards applicability for a decomposed multi-hazard
 * observation was previously evaluated once against the whole observation's
 * evidence facts, so non-primary findings had no independent standards search
 * at all -- they inherited whichever candidates happened to be evaluated for
 * the primary/combined evidence, or none. This runs the SAME unmodified
 * evaluate()/buildEvidenceFacts() engine used for the whole-observation path,
 * once per decomposed hazard, scoped to only that hazard's own evidence
 * (observationFragment, mechanism, supportingSignals) -- never the full
 * combined observation text and never another finding's fragment. A
 * legitimate result is an empty array (no applicable/candidate standard for
 * that finding); this function does not fabricate one.
 */
export function applyFindingScopedStandards(result: any, request: ClassifyDto) {
  if (!result || typeof result !== 'object') return result;
  const hazards = Array.isArray(result?.multiHazardDecomposition?.hazards)
    ? result.multiHazardDecomposition.hazards
    : [];
  // Jurisdiction is a single observation-wide (indeed inspection-wide) fact -- the same
  // inspection cannot be in two regulatory regimes at once -- so it is resolved ONCE from the
  // whole request (persisted inspection context > explicit request jurisdiction/scope >
  // answered jurisdiction clarification > inference from the observation's own wording) and
  // forwarded, with its provenance, to every finding's own evaluation. This is the only
  // observation-wide fact forwarded: guardState, fallExposure, etc. are genuinely per-finding
  // and forwarding them wholesale would reintroduce the cross-finding leakage this function's
  // finding-scoping exists to prevent. Forwarding the provenance (not just the value) is what
  // keeps a HAZLENZ_INFERRED regime from being re-labelled user-confirmed at the finding level.
  const observationJurisdiction = hazards.length ? buildEvidenceFacts(request) : null;
  const inheritedContext = observationJurisdiction && observationJurisdiction.jurisdiction !== 'unknown'
    ? {
      value: observationJurisdiction.jurisdiction,
      provenance: observationJurisdiction.jurisdictionProvenance,
      factSource: observationJurisdiction.facts.find(item => item.type === 'jurisdiction')?.source,
      basis: observationJurisdiction.jurisdictionBasis,
    }
    : undefined;
  // Sentence ownership: decomposition's generic fragments are split on ", ; and also while", so a
  // single hazard's fragment can lose the clause that carries its own energy state ("...is
  // unguarded and the operator's hands enter the die area while it is running" -> fragment
  // "the point of operation on the punch press is unguarded"). A period-delimited sentence that
  // contains exactly ONE finding's fragment is that finding's evidence in full, and using it
  // cannot leak: no other finding lives in it. Sentences shared by two or more findings keep the
  // narrower fragments (their standards must not cross-contaminate).
  const sentences = String(request.text || '').split(/(?<=[.!?])\s+/).map(item => item.trim()).filter(Boolean);
  const sentenceOwners = new Map<number, number>();
  const sentenceIndexFor = (fragment: string) => {
    const needle = fragment.toLowerCase();
    if (!needle) return -1;
    return sentences.findIndex(sentence => sentence.toLowerCase().includes(needle));
  };
  for (const hazard of hazards) {
    const index = sentenceIndexFor(String(hazard?.observationFragment || '').trim());
    if (index >= 0) sentenceOwners.set(index, (sentenceOwners.get(index) || 0) + 1);
  }
  for (const hazard of hazards) {
    if (!hazard || typeof hazard !== 'object') continue;
    const rawFragment = String(hazard.observationFragment || '').trim();
    const sentenceIndex = sentenceIndexFor(rawFragment);
    const ownsSentence = sentenceIndex >= 0 && sentenceOwners.get(sentenceIndex) === 1;
    const fragment = ownsSentence && sentences[sentenceIndex].length > rawFragment.length ? sentences[sentenceIndex] : rawFragment;
    const mechanism = String(hazard.mechanism || '').trim();
    const supportingSignals = Array.isArray(hazard.supportingSignals)
      ? hazard.supportingSignals.map((item: unknown) => String(item || '').trim()).filter(Boolean)
      : [];
    const findingText = [fragment, mechanism, ...supportingSignals].filter(Boolean).join('. ');
    if (!findingText) {
      hazard.standardCandidates = [];
      continue;
    }
    // Forward clarificationAnswers (questionId/answer pairs only -- no free text) and the ONE
    // observation-wide resolved jurisdiction (with provenance, see above) so a per-finding
    // candidate resolves to SUPPORTED exactly when the observation's regime is established, and
    // stays an honest UNKNOWN candidate otherwise. Do NOT forward the rest of
    // request.structuredObservation: its `narrative` field carries the full, un-fragmented
    // observation text, and mixing that into a single finding's evidence extraction would
    // reintroduce the cross-finding fragment-contamination this file's finding-scoping exists to
    // prevent.
    const findingExtracted = buildEvidenceFacts({
      text: findingText,
      clarificationAnswers: request.clarificationAnswers,
      regulatoryContext: inheritedContext,
    });
    const findingDecisions = evaluate(findingExtracted);
    hazard.standardCandidates = findingDecisions
      .filter(item => item.status !== 'NOT_APPLICABLE')
      .map((item): FindingStandardCandidate => ({
        citation: item.citation,
        family: item.family,
        status: item.status,
        confidence: item.confidence,
        applicability: item.status === 'SUPPORTED' ? 'direct' : item.status === 'CONTRADICTED' ? 'excluded' : 'candidate',
        explanation: item.explanation,
        missingPredicates: item.missingPredicates,
        jurisdictionProvenance: item.jurisdictionProvenance,
      }))
      .filter(item => item.applicability !== 'excluded');
  }
  return result;
}
