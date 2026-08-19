import { hasAnyNonNegatedTerm } from '../reasoning-orchestrator/negation-context.util';

// V5-C02 shared evidence-fact foundation.
//
// This module is the ONE authoritative, deterministic, evidence-bound extraction path from
// raw observation text (+ optional structured observation / clarification / evidence-snapshot
// input) to a normalized EvidenceFact[] array. It was factored out of evidence-foundation.ts
// (which originated this model) so other live HazLenz reasoning consumers can build/consume the
// same fact representation instead of independently re-deriving overlapping signals from raw
// text with their own regex. See verification/hazlenz-v5-c02-shared-evidence-facts-2026-08-16/
// for the design record, consumer census, and migration proof.
//
// This file intentionally contains ONLY the fact-extraction primitive (types + buildEvidenceFacts
// + hasFact/factIds helpers). Domain-specific applicability/decision logic (regulatory predicate
// evaluation, clarification-question authoring, risk/standards overrides) stays in
// evidence-foundation.ts, which is this module's first consumer, not part of the shared contract.

export type FactStatus = 'observed' | 'confirmed' | 'inferred' | 'unknown' | 'contradicted' | 'corrected';

export interface EvidenceFact {
  id: string;
  type: string;
  value: string | number | boolean | string[] | null;
  unit?: string;
  source: 'user_text' | 'user_confirmation' | 'photo_model' | 'site_context' |
    'inspection_context' | 'clarification' | 'qualified_review' | 'system_inference';
  confidence: number;
  status: FactStatus;
  temporalState: 'current' | 'previously_observed' | 'corrected_before_review' | 'unknown';
  reviewerStatus: 'unreviewed' | 'user_confirmed' | 'qualified_confirmed' | 'rejected';
  contradictedBy?: string[];
  supersedesFactId?: string;
}

/**
 * Structural (not nominal) input contract for buildEvidenceFacts(). ClassifyDto already satisfies
 * this shape, so the controller's full request can be passed directly with no adapter; callers
 * that only have raw text (e.g. a single decomposed hazard's evidence fragment, or an orchestrator
 * stage that never received the structured observation) can pass just `{ text }` and still get a
 * valid, if narrower, fact set -- every additional field below is optional and purely additive.
 */
export interface SharedEvidenceFactInput {
  text: string;
  structuredObservation?: {
    narrative?: string;
    jurisdiction?: string;
    observedCondition?: string;
    taskBeingPerformed?: string;
    workerInteraction?: string;
    additionalContext?: string;
    energyState?: string;
    controlsPresent?: string[];
    controlsMissing?: string[];
    unknownFacts?: string[];
    unresolvedContradictions?: Array<{ field: string; originalValue?: string; answerValue?: string; reason: string }>;
    userConfirmedFacts?: Array<{ field: string; value: string | string[] | number | boolean | null }>;
  };
  scopes?: string[];
  evidenceSnapshot?: { facts: Array<Record<string, unknown>> };
  clarificationAnswers?: Array<{ questionId?: string; answer?: unknown; value?: unknown; selectedOptions?: string[] }>;
  /**
   * Inspection-level regulatory context resolved by the controller from the persisted
   * inspection (see ClassifyDto.regulatoryContext). Takes precedence over every other
   * jurisdiction hint when USER_CONFIRMED; when UNKNOWN it explicitly permits evidence-based
   * inference (the user chose "Let HazLenz determine").
   */
  regulatoryContext?: {
    value: string;
    provenance: 'USER_CONFIRMED' | 'HAZLENZ_INFERRED' | 'UNKNOWN';
    /** Fact source to record for a USER_CONFIRMED value (defaults to 'inspection_context'). */
    factSource?: EvidenceFact['source'];
    /** Observation phrases behind a HAZLENZ_INFERRED value (carried through for provenance display). */
    basis?: string[];
  };
}

export type JurisdictionProvenance = 'USER_CONFIRMED' | 'HAZLENZ_INFERRED' | 'UNKNOWN';

export type ExtractedEvidenceFacts = {
  facts: EvidenceFact[];
  text: string;
  lower: string;
  jurisdiction: string;
  /** How `jurisdiction` was established. UNKNOWN whenever jurisdiction === 'unknown'. */
  jurisdictionProvenance: JurisdictionProvenance;
  /** The observation phrases that drove a HAZLENZ_INFERRED jurisdiction (empty otherwise). */
  jurisdictionBasis: string[];
  currentHazardNegated: boolean;
  correctedBeforeReview: boolean;
  noExposure: boolean;
  controlsAffirmed: boolean;
  depthFeet?: number;
  distanceFeet?: number;
  noiseTwa?: number;
};

function answerValue(answer: any): string {
  const selected = Array.isArray(answer?.selectedOptions) ? answer.selectedOptions[0] : undefined;
  return String(answer?.answer ?? answer?.value ?? selected ?? '').trim().toLowerCase();
}

function isYes(value: string): boolean {
  return /^(yes|y|true|running|operating|energized|guard missing|guard removed|absent|open|active)/i.test(value);
}

function isNo(value: string): boolean {
  return /^(no|n|false|locked out|deenergized|de-energized|guard installed|guard present|zero-energy|isolated|verified)/i.test(value);
}

/**
 * Evidence that an isolation/lockout claim in the same observation is NOT verified, or is
 * directly contradicted by another observed fact. Used only to withhold the
 * energyIsolationState='isolated_and_verified' assertion -- it never asserts the opposite,
 * because "I could not verify isolation" establishes uncertainty, not a proven live circuit.
 */
const ISOLATION_UNVERIFIED_OR_CONTRADICTED =
  /\b(?:could\s+not\s+verify|can(?:no|')t\s+verify|unable\s+to\s+verify|did\s+not\s+verify|not\s+(?:been\s+)?verified|never\s+(?:been\s+)?verified|unverified|verification\s+(?:was\s+)?(?:not|never)\b|not\s+(?:yet\s+)?confirmed|may\s+still\s+be\s+energ\w*|might\s+still\s+be\s+energ\w*|(?:is|are|was|were|remains?)\s+still\s+energ\w*|still\s+(?:be\s+)?live\b|remains?\s+energ\w*|measured\s+voltage|voltage\s+(?:was\s+)?(?:measured|found|present|detected|read)|stored\s+(?:hydraulic|pneumatic|electrical|mechanical|spring)?\s*(?:pressure|energy)\s+(?:remains?|is\s+(?:still\s+)?present|was\s+not\s+relieved)|pressure\s+remains?|disconnect\s+(?:was\s+)?(?:found\s+)?(?:in\s+the\s+)?ON\b|power\s+(?:was\s+)?never\s+verified)\b/i;

const SINGLETON_FACT_TYPES = new Set([
  'jurisdiction', 'currentHazardState', 'employeeExposure', 'workActivity', 'equipmentType',
  'loadState', 'energyState', 'energyIsolationState', 'electricalLiveParts', 'environment',
  'groundCondition', 'egressState', 'protectiveSystem', 'excavationMaterial',
  'powerLineControls', 'excavationDepth', 'powerLineDistance', 'noiseTwaDba',
  'fallZonePermittedTask', 'guardState', 'backupAlarmState', 'fallExposure',
  'fallProtectionState', 'chemicalLabelState', 'silicaGeneratingTask', 'airborneDust',
  'silicaControlState', 'workHeightFeet', 'pitState',
]);

function fact(
  facts: EvidenceFact[], type: string, value: EvidenceFact['value'],
  source: EvidenceFact['source'] = 'user_text', confidence = 0.94,
  status: FactStatus = 'observed',
  temporalState: EvidenceFact['temporalState'] = 'current',
) {
  const existing = facts.find(item => item.type === type && JSON.stringify(item.value) === JSON.stringify(value));
  if (existing) return existing.id;
  const activeSameType = SINGLETON_FACT_TYPES.has(type)
    ? facts.find(item => item.type === type && !['corrected', 'contradicted'].includes(item.status))
    : undefined;
  const incomingAuthoritative = ['user_confirmation', 'qualified_review', 'clarification', 'inspection_context'].includes(source);
  const existingAuthoritative = activeSameType &&
    ['user_confirmation', 'qualified_review', 'clarification', 'inspection_context'].includes(activeSameType.source);
  if (activeSameType && existingAuthoritative && !incomingAuthoritative) return activeSameType.id;
  const id = `fact-${facts.length + 1}`;
  if (activeSameType && incomingAuthoritative) {
    activeSameType.status = 'corrected';
    activeSameType.reviewerStatus = 'rejected';
  }
  facts.push({
    id, type, value, source, confidence, status, temporalState,
    reviewerStatus: source === 'user_confirmation' ? 'user_confirmed' : 'unreviewed',
    ...(activeSameType && incomingAuthoritative ? { supersedesFactId: activeSameType.id } : {}),
  });
  return id;
}

const JURISDICTION_VALUES = new Set(['msha', 'osha-general-industry', 'osha-construction']);

/**
 * Strong, low-ambiguity regime cues only. Deliberately excludes vocabulary that legitimately
 * appears in more than one regime (scaffold, crusher, haul truck, forklift, plant, pit,
 * shaft...) -- inference is meant to save the user a question only when the observation's own
 * wording makes the regime obvious, never to guess. If cues for more than one regime appear,
 * nothing is inferred and jurisdiction stays honestly UNKNOWN.
 */
const JURISDICTION_CUES: Array<{ value: string; pattern: RegExp }> = [
  { value: 'msha', pattern: /\b(?:(?:surface|underground|open[- ]pit|strip|coal|metal|nonmetal|aggregate|sand and gravel)\s+mines?|mine\s+(?:site|property|operator)|(?:the|a|an|this|our|at)\s+mines?|miners?|mining|quarry|quarries|MSHA)\b/gi },
  { value: 'osha-construction', pattern: /\b(?:construction\s+(?:site|project|crew|work(?:er)?s?|zone|area|activity|contractor|jobsite)|under\s+construction|new\s+construction|job\s?sites?|roofers?|roofing\s+crew|masons?|ironworkers?|general\s+contractor|subcontractors?)\b/gi },
  { value: 'osha-general-industry', pattern: /\b(?:warehouses?|factory|factories|manufacturing\s+(?:plant|facility|floor|area|line|operation)|shop\s+floor|plant\s+floor|production\s+(?:line|floor|area)|assembly\s+line|distribution\s+cent(?:er|re)|machine\s+shop|general\s+industry)\b/gi },
];

/**
 * Evidence-based jurisdiction inference for the "Not sure / Let HazLenz determine" case.
 * Returns the single regime whose strong cues appear in the text, plus the exact phrases that
 * drove it (for provenance display), or null when no regime -- or more than one -- is cued.
 */
export function inferJurisdictionFromText(text: string): { value: string; basis: string[] } | null {
  const hits = JURISDICTION_CUES
    .map(({ value, pattern }) => {
      const matches = Array.from(String(text || '').matchAll(pattern)).map(match => match[0]);
      return { value, basis: Array.from(new Set(matches.map(item => item.toLowerCase()))) };
    })
    .filter(item => item.basis.length > 0);
  if (hits.length !== 1) return null;
  return hits[0];
}

function numberBeforeUnit(text: string, unit: string): number | undefined {
  const match = text.match(new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*[- ]?\\s*(?:${unit})\\b`, 'i'));
  return match ? Number(match[1]) : undefined;
}

/**
 * The one authoritative, deterministic evidence-fact extraction path (V5-C02 Phase 3). Builds a
 * normalized EvidenceFact[] from raw text plus whatever optional structured/clarification/
 * evidence-snapshot context is available. Never converts `unknown` into `present`/`absent`;
 * preserves negation, temporal (current vs. previously_observed vs. corrected_before_review), and
 * contradiction distinctions on every fact it emits.
 */
export function buildEvidenceFacts(input: SharedEvidenceFactInput): ExtractedEvidenceFacts {
  const structured = input.structuredObservation || {};
  const text = [input.text, structured.narrative, structured.observedCondition, structured.taskBeingPerformed,
    structured.workerInteraction, structured.additionalContext].filter(Boolean).join(' ');
  const lower = text.toLowerCase();
  const facts: EvidenceFact[] = [];
  for (const item of input.evidenceSnapshot?.facts || []) {
    if (typeof item !== 'object' || item === null || typeof (item as any).type !== 'string') continue;
    // Jurisdiction provenance is owned by the resolution block below (inspection context >
    // explicit request > clarification answer > inference > unknown). A resent snapshot fact
    // must not be able to re-label an inferred/unknown jurisdiction as user-confirmed merely
    // because the client echoed the previous round's facts back.
    if ((item as any).type === 'jurisdiction') continue;
    const source = (item as any).source === 'qualified_review' ? 'qualified_review' : 'user_confirmation';
    fact(
      facts,
      (item as any).type,
      ((item as any).value as EvidenceFact['value']) ?? null,
      source,
      1,
      (item as any).status === 'contradicted' ? 'contradicted' : 'confirmed',
      (item as any).temporalState === 'corrected_before_review' ? 'corrected_before_review' : 'current',
    );
  }
  // ---- Jurisdiction resolution, in precedence order, with honest provenance ----------------
  // 1. Persisted inspection-level regulatory context (USER_CONFIRMED) -- established once at
  //    inspection setup and inherited by every observation/finding, so HazLenz never asks per
  //    finding. Overrides any client-sent jurisdiction string.
  // 2. An explicit structuredObservation.jurisdiction / non-"all" request scope (USER_CONFIRMED).
  // 3. A "Yes" answer to the ONE targeted jurisdiction clarification question (USER_CONFIRMED).
  // 4. An inspection-wide HAZLENZ_INFERRED context forwarded to a per-finding evaluation.
  // 5. Evidence-based inference from strong, single-regime observation wording (HAZLENZ_INFERRED)
  //    -- only when the user left the context as "Not sure / Let HazLenz determine".
  // 6. Otherwise honestly UNKNOWN (never silently converted into a specific regime).
  const requestedContext = input.regulatoryContext && JURISDICTION_VALUES.has(String(input.regulatoryContext.value || '').toLowerCase())
    ? { value: String(input.regulatoryContext.value).toLowerCase(), provenance: input.regulatoryContext.provenance }
    : null;
  const structuredJurisdiction = String(structured.jurisdiction || '').toLowerCase();
  const scopeJurisdiction = (input.scopes || []).join(' ').includes('msha') ? 'msha' :
    (input.scopes || []).join(' ').includes('construction') ? 'osha-construction' :
    (input.scopes || []).join(' ').includes('general') ? 'osha-general-industry' : '';
  let jurisdiction = 'unknown';
  let jurisdictionProvenance: JurisdictionProvenance = 'UNKNOWN';
  let jurisdictionBasis: string[] = [];
  let jurisdictionSource: EvidenceFact['source'] = 'system_inference';
  if (requestedContext && requestedContext.provenance === 'USER_CONFIRMED') {
    jurisdiction = requestedContext.value; jurisdictionProvenance = 'USER_CONFIRMED';
    jurisdictionSource = input.regulatoryContext?.factSource || 'inspection_context';
  } else if (JURISDICTION_VALUES.has(structuredJurisdiction)) {
    jurisdiction = structuredJurisdiction; jurisdictionProvenance = 'USER_CONFIRMED'; jurisdictionSource = 'user_confirmation';
  } else if (scopeJurisdiction) {
    jurisdiction = scopeJurisdiction; jurisdictionProvenance = 'USER_CONFIRMED'; jurisdictionSource = 'user_confirmation';
  }
  // A "Can you confirm: MSHA/general-industry/construction jurisdiction?" clarification question
  // (evidence-foundation.ts's questionFor() fallback, id `predicate-<citation>-<jurisdiction>-jurisdiction`)
  // is only generated once evaluate() can honestly surface a jurisdiction-pending candidate at all
  // -- previously it never fired because unknown jurisdiction hard-excluded every candidate before a
  // missingPredicates list (and therefore a question) could ever be produced. Answering "Yes" to that
  // question must actually confirm the jurisdiction, or the clarification loop never closes: the user
  // answers, nothing changes, and the standard stays a permanent UNKNOWN candidate.
  for (const answer of input.clarificationAnswers || []) {
    const questionId = String((answer as any).questionId || '').toLowerCase();
    if (!questionId.includes('jurisdiction')) continue;
    const value = answerValue(answer);
    let answered = '';
    if (questionId === 'jurisdiction') {
      // The ONE consolidated inspection-wide question (evidence-foundation.ts): the answer names
      // the regime directly. "Not sure" leaves jurisdiction unresolved rather than guessing.
      answered = /msha|mine/.test(value) ? 'msha'
        : /construction|1926/.test(value) ? 'osha-construction'
        : /general|1910/.test(value) ? 'osha-general-industry' : '';
    } else {
      // Legacy per-regime yes/no form (`predicate-<citation>-<regime>-jurisdiction`).
      if (value !== 'yes') continue;
      answered = questionId.includes('msha-jurisdiction') ? 'msha'
        : questionId.includes('general-industry-jurisdiction') ? 'osha-general-industry'
        : questionId.includes('construction-jurisdiction') ? 'osha-construction' : '';
    }
    if (!answered) continue;
    // A persisted inspection context is authoritative over a per-observation answer; anything
    // else (including a stale scope hint) yields to what the user just explicitly confirmed.
    if (jurisdictionProvenance === 'USER_CONFIRMED' && jurisdictionSource === 'inspection_context') continue;
    jurisdiction = answered; jurisdictionProvenance = 'USER_CONFIRMED'; jurisdictionSource = 'user_confirmation';
  }
  if (jurisdictionProvenance === 'UNKNOWN') {
    if (requestedContext && requestedContext.provenance === 'HAZLENZ_INFERRED') {
      jurisdiction = requestedContext.value; jurisdictionProvenance = 'HAZLENZ_INFERRED';
      jurisdictionBasis = Array.isArray(input.regulatoryContext?.basis) ? [...input.regulatoryContext!.basis!] : [];
    } else {
      const inferred = inferJurisdictionFromText(text);
      if (inferred) { jurisdiction = inferred.value; jurisdictionProvenance = 'HAZLENZ_INFERRED'; jurisdictionBasis = inferred.basis; }
    }
  }
  fact(facts, 'jurisdiction', jurisdiction, jurisdictionSource,
    jurisdictionProvenance === 'USER_CONFIRMED' ? (jurisdictionSource === 'inspection_context' ? 1 : 0.98)
      : jurisdictionProvenance === 'HAZLENZ_INFERRED' ? 0.85 : 0.2,
    jurisdictionProvenance === 'USER_CONFIRMED' ? 'confirmed'
      : jurisdictionProvenance === 'HAZLENZ_INFERRED' ? 'inferred' : 'unknown');

  const correctedBeforeReview =
    /\b(corrected|repaired|replaced|resolved)\b.{0,80}\b(now|passed|tested|verified)\b/i.test(text) ||
    /\b(?:now|current|currently)\b.{0,45}\b(?:interlock(?:ed)?|guard(?:ed)?|open and usable|clear and usable|compliant|passed)\b/i.test(text) ||
    // V5-C02: covers "<defect> last week but was corrected/repaired/replaced/resolved before this
    // inspection/review/audit/visit" -- a demonstrated gap where a genuinely historical, already-
    // corrected condition was represented as current (the original two alternatives above require
    // a trailing now/passed/tested/verified/current(ly) word this phrasing doesn't use).
    /\b(?:corrected|repaired|replaced|resolved)\b.{0,40}\bbefore (?:this|the) (?:inspection|review|audit|visit)\b/i.test(text);
  // Equipment explicitly removed/taken out of service (and not "not taken out of service") is a
  // controlled condition, not an active exposure -- negation-aware via the shared utility so the
  // defective-truck "was not taken out of service" case stays active.
  const removedFromService = hasAnyNonNegatedTerm(text, [
    'removed from service', 'taken out of service', 'pulled from service', 'tagged out of service',
    'out of service and tagged', 'locked out of service', 'placed out of service',
  ]);
  const quotedOrNonObservation =
    /\b(training (?:poster|example|exercise)|hypothetical|word ['"][^'"]+['"]|says? ['"])/i.test(text) ||
    /\b(?:toy|scale model|miniature|nonoperational mock-?up|display model)\b.{0,60}\b(?:display|case|lobby|exhibit|demonstration)\b/i.test(text);
  const explicitNoCondition = /\b(no (?:equipment servicing|hazardous energy condition|cave-in hazard|unusual impulse noise|active exposure)|not true that)\b/i.test(text);
  const noExposure = /\b(no (?:employee|worker|miner|laborer|person|one)s? (?:was |were |is |are )?(?:exposed|present|entered|working|using)|nobody|no one)\b/i.test(text);
  const currentHazardNegated = quotedOrNonObservation || explicitNoCondition || correctedBeforeReview || removedFromService;
  if (currentHazardNegated) fact(facts, 'currentHazardState', 'not_established', 'user_text', 0.98,
    correctedBeforeReview || removedFromService ? 'corrected' : 'confirmed',
    correctedBeforeReview || removedFromService ? 'corrected_before_review' : 'current');
  if (noExposure) fact(facts, 'employeeExposure', false, 'user_text', 0.98, 'confirmed');

  // "taken out of service" / "returned to service" / "in service" describe equipment status, not
  // a servicing activity -- excluded so a defective forklift "not taken out of service" does not
  // register as maintenance work.
  // "maintenance shop/department/bay/crew/schedule/records" name a place or an organisation, not a
  // servicing activity in progress; only the activity sense asserts servicing_or_maintenance.
  if (/\b(?<!\bout of |\bin |\bto |\binto |\breturned to |\bback in |\bplaced in |\bremoved from )(servic\w*|maintenan\w*(?!\s+(?:shop|department|dept|building|bay|area|crew|manager|supervisor|schedule|records?|log|history|program|plan|staff|team|office|room))|mechanic\w*|repair(?:s|ed|ing)?|(?:clear(?:s|ed|ing)?|pull(?:s|ed|ing)?) (?:a )?(?:\w+ )?jam|wrench inside)\b/i.test(text)) {
    fact(facts, 'workActivity', 'servicing_or_maintenance');
  }
  if (/\b(hands?|arms?|body)\b.{0,30}\b(?:inside|in)\b.{0,30}\b(?:drive|machine|crusher|baler)\b/i.test(text)) {
    fact(facts, 'workActivity', 'servicing_or_maintenance');
  }
  if (/\b(crane|derrick|boom)\b/i.test(text)) fact(facts, 'equipmentType', 'crane');
  if (/\b(trench|excavation|deep cut|(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*[- ]?\s*(?:ft|feet|foot) cut)\b/i.test(text)) {
    fact(facts, 'workAreaType', 'excavation');
  }
  if (/\b(scaffold|scafold)\b/i.test(text)) fact(facts, 'workAreaType', 'scaffold');
  if (/\b(suspended|hoisted|lifted)\b.{0,40}\b(load|beam|panel|material|section|unit)\b|\b(load|beam|panel|section|unit)\b.{0,40}\b(suspended|overhead)\b/i.test(text)) {
    fact(facts, 'loadState', 'suspended');
  }
  if (/\b(under|beneath|below|fall zone)\b/i.test(text) && /\b(workers?|laborers?|employees?|miners?|people|persons?|crew members?)\b/i.test(text)) {
    fact(facts, 'employeeExposure', 'within_overhead_or_fall_zone');
  }
  if (/\bnot (?:guiding|receiving|hooking|connecting)\b/i.test(text)) {
    fact(facts, 'fallZonePermittedTask', false, 'user_text', 0.98, 'confirmed');
  }
  // V5-C02: negation-aware (was a plain regex test with zero negation awareness, so "no exposed
  // energized conductors were observed" incorrectly asserted energyState=energized_or_operating --
  // a demonstrated defect against the shared model's own negation-preservation requirement).
  // Reuses the existing, already-shared negation-context.util.ts rather than inventing new logic.
  // "power connected" / "running" / "operating" / "plugged in" / "has not been de-energized" are
  // ordinary field phrasings that establish an energized-or-capable state just as plainly as the
  // literal word "energized"; without them HazLenz asked "was the equipment energized?" about a
  // press the observer had just described as running (an autonomy defect: the answer was already
  // in the observation).
  if (hasAnyNonNegatedTerm(text, [
        'energized', 'live', 'powered', 'disconnect remains on', 'disconnect stayed on',
        'power remains on', 'power stayed on', 'capable of movement',
        'power connected', 'power is connected', 'power still connected', 'still connected to power',
        'power on', 'power is on', 'power was on', 'under power', 'plugged in', 'still plugged in',
        'remains energized', 'still energized', 'remains live',
      ]) ||
      // "running"/"operating" only when it describes the machine itself (not "a cord running
      // across the floor"): "<machine> is/was/remains running", "the running press", "while operating".
      /\b(?:machine|press|conveyor|equipment|crusher|drive|saw|line|motor|mixer|baler|shredder|grinder|lathe|mill|it)\b.{0,24}\b(?:is|was|were|are|remains|remained|kept|left)\s+(?:running|operating|in operation|cycling)\b/i.test(text) ||
      /\b(?:running|operating|cycling|energised)\s+(?:machine|press|conveyor|equipment|crusher|saw|line|motor|mixer|baler|shredder|grinder|lathe|drive|shaft)\b/i.test(text) ||
      /\b(?:while|still)\s+(?:running|operating|in operation|cycling)\b/i.test(text) ||
      /\bnot\s+(?:been\s+|yet\s+)?(?:de-?energized|shut\s*down|powered\s*down|switched\s*off|turned\s*off)\b/i.test(text) ||
      ['energized', 'operating'].includes(String(structured.energyState || ''))) {
    fact(facts, 'energyState', 'energized_or_operating', structured.energyState ? 'user_confirmation' : 'user_text');
  }
  // Negation-aware for the same reason as energyState above: "hazardous energy
  // has NOT been isolated or locked out" and "reachable... has NOT been
  // deenergized or isolated" both contain the literal substrings "locked out"/
  // "deenergized" and, before this fix, were asserted as isolated_and_verified
  // -- the OPPOSITE of what the text says -- because this check had zero
  // negation awareness. Demonstrated to directly corrupt LOTO (1910.147/
  // 56.12016) and electrical (1910.303) standards-applicability predicates,
  // which require energyIsolationState to distinguish "isolated" from "not
  // isolated." Reuses the same negation-context.util.ts utility as line 208.
  if ((hasAnyNonNegatedTerm(text, ['deenergized', 'de-energized', 'locked out', 'zero energy', 'zero-energy', 'disconnect open']) ||
      // "the lockout/tagout procedure was followed/applied/completed/verified", "lock and tag
      // applied", "LOTO applied" -- affirmative statements of the control being in place.
      /\b(?:lockout|lock\s*out|tagout|tag\s*out|LOTO|energy[- ]control)(?:\s*\/\s*(?:lockout|tagout))?(?:\s+procedure)?\b[^.]{0,30}\b(?:was|were|is|are|has\s+been|have\s+been|had\s+been)\s+(?:followed|applied|completed|verified|in\s+place|performed|implemented)\b/i.test(text) ||
      /\b(?:locks?\s+and\s+tags?|lock\s*\/\s*tag|LOTO)\s+(?:were|was|are|is|had\s+been|has\s+been)?\s*(?:applied|attached|installed|in\s+place|hung)\b/i.test(text) ||
      ['deenergized', 'locked-out'].includes(String(structured.energyState || ''))) &&
      !hasAnyNonNegatedTerm(text, ['not isolated', 'not locked', 'without lockout']) &&
      !/\b(?:no|not|never|without)\b[^.]{0,30}\b(?:lock|tag|LOTO)/i.test(text) &&
      // 1910.147 isolation is only "verified" when the zero-energy state was actually
      // established. An observation that claims lockout AND reports the isolation as
      // unverified or contradicted ("worker says it is locked out, but I could not verify
      // isolation"; "lockout is complete; electrician measured voltage at the work point";
      // "locked and tagged out, but the disconnect may still be energized") previously
      // recorded isolated_and_verified purely from the positive clause -- the affirmative
      // phrase cancelled the contradicting evidence, which is the opposite of what the text
      // says. Neither fact is asserted in that case: the state is genuinely unknown, so
      // applicability stays UNKNOWN and the contradiction is preserved for review rather than
      // being resolved in the safe direction by the engine.
      !ISOLATION_UNVERIFIED_OR_CONTRADICTED.test(text)) {
    fact(facts, 'energyIsolationState', 'isolated_and_verified', structured.energyState ? 'user_confirmation' : 'user_text');
  }
  if (/\b(no (?:personal )?lo[ck]+(?: is fitted| is applied| fitted| applied| was fitted| was applied)?|not\s+(?:been\s+|yet\s+)?(?:locked|isolated|deenergized|de-energized)|disconnect (?:remains|stayed) (?:on|ON)|without lockout)\b/i.test(text) ||
      // "without energy isolation", "without isolating hazardous energy", "without a lock or tag",
      // "no lock or tag applied", "not locked or tagged", "no LOTO"
      /\bwithout\s+(?:(?:hazardous\s+)?(?:energy\s+)?isolation|isolating|(?:a\s+|any\s+)?(?:personal\s+)?(?:lock|tag|LOTO)(?:\s*(?:or|and|\/)\s*(?:tag|lock))?)\b/i.test(text) ||
      /\bno\s+(?:personal\s+)?(?:lock|tag|LOTO)(?:\s*(?:or|and|\/)\s*(?:tag|lock))?\b(?![^.]{0,20}\b(?:deficienc|issue|problem|concern|violation|finding))/i.test(text) ||
      /\bnot\s+(?:locked|tagged)(?:\s+(?:or|and)\s+(?:locked|tagged))?(?:\s+out)?\b/i.test(text)) {
    fact(facts, 'energyIsolationState', 'not_isolated');
  }
  // Ordinary field phrasings for exposed conductors ("exposed copper conductors", "bare wires",
  // "conductors are exposed", "damaged insulation ... exposed") -- negation-aware via the shared
  // utility so "no exposed conductors were observed" does not assert live parts.
  if (/\b(bare (?:copper|conductor)|exposed (?:bus bars?|live parts?|conductor)|(?:live|energized).{0,40}(?:bus|bus bars?|conductors?)\b.{0,20}\b(?:is|are)?\s*(?:exposed|reachable|uncovered)|(?:conductor|conductors)\b.{0,20}\b(?:is|are)\s+reachable)\b/i.test(text) ||
      hasAnyNonNegatedTerm(text, ['exposed copper conductors', 'exposed copper conductor', 'exposed copper', 'exposed conductors', 'exposed conductor',
        'exposed wires', 'exposed wire', 'exposed wiring', 'exposed live parts', 'exposed energized parts', 'exposed contacts',
        'bare wires', 'bare wire', 'bare conductors', 'bare copper']) ||
      /\b(?:conductors?|wires?|wiring)\s+(?:is|are|was|were)\s+exposed\b/i.test(text)) {
    fact(facts, 'electricalLiveParts', 'exposed_and_reachable');
  }
  if (/\b(wet|damp|sump|water)\b/i.test(text)) fact(facts, 'environment', 'wet_or_conductive');
  if (/\b(loose|drumm(?:y|ing)|unsupported|scaling)\b.*\b(rock|ground|slab|back|rib)\b|\b(slabs?|ground)\b.*\b(loose|drumm(?:y|ing))\b/i.test(text)) {
    fact(facts, 'groundCondition', 'loose_or_unsafe');
  }
  // A protective device that is present but has been DEFEATED is not an effective control --
  // it is the textbook unguarded condition. Before this check, "the interlock guard is installed
  // but has been bypassed with a jumper wire so the machine runs with the guard open" matched
  // the "guard ... installed" pattern below and was recorded as present_and_effective, which
  // made 1910.212(a)(1) NOT_APPLICABLE and (via evidence-foundation's suppressed-only branch)
  // reported the whole observation as a Controlled condition with risk 0 -- a safety-meaning
  // inversion indistinguishable from a verified-good guard.
  //
  // Three states are distinguished, because they are three different safety facts:
  //   defeated and unresolved -> absent_or_ineffective (an active hazard)
  //   defeated then restored AND re-verified -> falls through to the normal present/absent
  //     detection below, so a genuinely restored guard can still read as effective
  //   defeat only suspected -> no guardState fact at all, so applicability stays UNKNOWN and
  //     the engine can ask rather than assert either way
  const protectiveDevice =
    /\b(?:guard(?!\s*rails?)|interlock|safety\s+(?:device|switch|interlock)|limit\s+switch|light\s+curtain|presence\s+sensor|two[- ]hand\s+control|e[- ]?stop|emergency\s+stop|safety\s+gate)\b/i;
  const defeatAction =
    /\b(?:bypass(?:ed|ing|es)?|defeat(?:ed|ing|s)?|overrid(?:den|e|es|ing)|jumper(?:ed|s)?|jump(?:ed|ered)\s+out|taped\s+(?:over|down|back|shut)|tied\s+(?:back|open)|wedged\s+(?:open|shut)|blocked\s+open|propped\s+open|pinned\s+open|disabled|deactivated|de-activated|made\s+inoperative|rendered\s+inoperative|disconnected|removed\s+from\s+the\s+circuit)\b/i;
  // "Jumper installed across the safety interlock" states the defeat with the device AFTER the
  // action, so both orders are accepted.
  const deviceDefeated =
    new RegExp(`${protectiveDevice.source}[^.]{0,60}${defeatAction.source}`, 'i').test(text) ||
    new RegExp(`${defeatAction.source}[^.]{0,60}${protectiveDevice.source}`, 'i').test(text) ||
    /\bjumper\b[^.]{0,40}\b(?:across|around|over)\b[^.]{0,40}\b(?:interlock|safety\s+(?:device|switch)|limit\s+switch)\b/i.test(text) ||
    /\b(?:run|runs|running|operate|operates|operating|cycle|cycles)\b[^.]{0,40}\bwith\s+the\s+(?:guard|gate|door)\s+open\b/i.test(text);
  const defeatResolved =
    /\b(?:restor(?:ed|ation)|reinstat(?:ed|ement)|re-?enabl(?:ed|ing)|re-?connect(?:ed|ion)|repair(?:ed)?|put\s+back|returned\s+to\s+service|corrected)\b/i.test(text) &&
    /\b(?:verif(?:ied|ication)|function[- ]tested|function\s+test(?:ed)?|re-?tested|tested|confirmed)\b/i.test(text);
  const defeatUncertain =
    /\b(?:may\s+have\s+been|might\s+have\s+been|possibly|possible|suspect(?:s|ed)?|believe[sd]?|reportedly|thinks?|unconfirmed|not\s+(?:yet\s+)?confirmed|could\s+not\s+confirm|unable\s+to\s+confirm)\b/i.test(text);

  if (deviceDefeated && defeatResolved) {
    // "was previously bypassed but has now been restored and function-tested" -- the defeat is
    // history and the restoration was verified, so the device is an effective control again.
    fact(facts, 'guardState', 'present_and_effective');
  } else if (deviceDefeated && !defeatUncertain) {
    fact(facts, 'guardState', 'absent_or_ineffective');
  } else if (deviceDefeated && defeatUncertain) {
    // Deliberately record nothing: a suspected bypass is neither an established hazard nor an
    // established control, and asserting either would fabricate certainty.
  } else if (/\b(?:guard|interlock)\b.{0,35}\b(?:installed|bolted|secured|tested|blocks? reach|function(?:ing|s|al)?(?:\s+normally)?|works?\s+as\s+designed|operational|in\s+service)\b/i.test(text)) {
    fact(facts, 'guardState', 'present_and_effective');
  // Machine guard (a "guard" on machinery) -- NOT a guardrail/guard rail, which is fall
  // protection and is owned by fallExposure below. Clause-bounded (no . , ;) so a distant,
  // unrelated "missing" cannot pair with this guard, but ordinary sentence length is fine.
  } else if (/\bguard\b(?!\s*rails?)[^.,;]{0,70}\b(?:is|are|was|were)?\s*(?:missing|absent|removed|open|not\s+(?:in\s+place|installed|present))\b|\b(?:missing|absent|removed|no)\b.{0,20}\bguards?\b(?!\s*rails?)|\bunguarded\b(?!\s+(?:edge|edges|side|sides|opening|openings|floor|platform|roof|pit|hole|holes|deck|stair\w*|walkway|mezzanine|excavation|trench))|\b(?:open nip point|nip point open)\b/i.test(text) &&
      !/\bno\s+(?:missing|absent|removed)\s+guards?\b/i.test(text)) {
    fact(facts, 'guardState', 'absent_or_ineffective');
  }
  if (/\b(?:backup|back-up|reverse) alarm\b.{0,35}\b(?:no sound|silent|did not sound|failed|not (?:functional|working|operable|sounding)|inoperative|inoperable|disconnected|missing)\b/i.test(text) ||
      /\b(?:without|no|lacks?|lacking|missing)\s+(?:a\s+|an\s+)?(?:functional\s+|working\s+|operable\s+|operating\s+|audible\s+)?(?:backup|back-up|reverse)\s+alarm\b/i.test(text)) {
    fact(facts, 'backupAlarmState', 'failed');
  } else if (/\b(?:backup|reverse) alarm\b.{0,35}\b(?:sounded|passed|working|function(?:ed|al)?)\b/i.test(text)) {
    fact(facts, 'backupAlarmState', 'functional');
  }
  // Ordinary field phrasings for an unprotected fall exposure: "open side", "unprotected edge",
  // "no guardrail or personal fall arrest system", "without fall protection", "missing handrail".
  // "no missing guardrails" (a negated deficiency) deliberately does NOT match: the absence
  // pattern requires the negation to attach directly to the protective device, not to
  // "missing"/"damaged".
  // Powered industrial truck found defective / unsafe / needing repair and NOT taken out of
  // service (29 CFR 1910.178(p)(1)). "was taken out of service" (affirmative) is the controlled
  // case and is not asserted here; the removedFromService handling above already covers it.
  if (/\b(?:forklift|fork\s*lift|lift\s*truck|powered\s+industrial\s+truck|pallet\s+jack|order\s+picker|reach\s+truck|tow\s+tractor|PIT)\b/i.test(text) &&
      /\b(?:defective|unsafe|in\s+need\s+of\s+repair|needs?\s+repair|inoperative\s+(?:brakes?|horn|lights?)|brakes?\s+(?:not\s+working|failed|failing|inoperative)|leaking\s+hydraulic|damaged\s+(?:forks?|mast|overhead\s+guard))\b/i.test(text) &&
      /\b(?:not\s+(?:been\s+)?(?:taken|removed|pulled)\s+(?:out\s+of|from)\s+service|remains?\s+in\s+service|still\s+in\s+(?:service|use|operation)|continued\s+(?:to\s+be\s+)?(?:operat\w+|us\w+)|kept\s+(?:in\s+)?operat\w+|before\s+continued\s+operation|is\s+still\s+being\s+(?:used|operated))\b/i.test(text)) {
    fact(facts, 'pitState', 'defective_in_service');
  }
  if (/\b(?:unprotected|open|exposed|unguarded)\b.{0,30}\b(?:edge|side|sides|deck|roof|pit|opening|hole|leading edge|skylight)\b|\b(?:guardrail|hand\s*rail|fall protection)\b.{0,45}\b(?:is|are|was|were)?\s*(?:missing|absent|none|damaged|loose|broken)\b/i.test(text) ||
      /\b(?:no|without|lacks?|lacking)\s+(?:a\s+|any\s+|an?\s+)?(?:guard\s*rails?|hand\s*rails?|railings?|fall\s+protection|(?:personal\s+)?fall[- ]arrest(?:\s+system)?|mid\s*rails?|toe\s*boards?|safety\s+net)\b/i.test(text) ||
      /(?<!\bno\s)(?<!\bnot\s)(?<!\bany\s)\bmissing\s+(?:guard\s*rails?|hand\s*rails?|railings?|mid\s*rails?)\b/i.test(text)) {
    fact(facts, 'fallExposure', 'unprotected_edge_or_opening');
  }
  if (/\b(?:guardrail|hand\s*rail|fall protection|restraint|arrest system)\b.{0,35}\b(?:installed|in place|complete|before access|securely installed|intact)\b/i.test(text)) {
    fact(facts, 'fallProtectionState', 'present');
  }
  if (/\b(?:secondary )?(?:bottle|container|jug|drum|pail|can|tote|carboy|tank|bag|spray bottle)\b.{0,45}\b(?:no (?:name|label)|unlabeled|unlabelled|no hazard label|missing (?:its |a |the )?label|label (?:is |was )?missing)\b/i.test(text) ||
      /\b(?:unlabeled|unlabelled|no (?:name|label)|no hazard label)\b.{0,45}\b(?:chemical|secondary )?(?:bottle|container|jug|drum|pail|can|tote|carboy|tank|bag)\b/i.test(text)) {
    fact(facts, 'chemicalLabelState', 'missing');
  } else if (/\b(?:bottle|container|jug|drum|pail|tote|tank)\b.{0,45}\blabeled\b.{0,45}\b(?:hazards?|sds|contents?|product)\b/i.test(text) ||
    /\blabeled with (?:product|contents?).{0,30}(?:hazards?|sds)\b/i.test(text)) {
    fact(facts, 'chemicalLabelState', 'compliant');
  }
  if (/\b(?:dry[- ]?cut(?:s|ting)?|dry[- ]?grind(?:s|ing)?)\b.{0,50}\b(?:concrete|block|masonry|brick|stone|tile|mortar)\b|\b(?:concrete|block|masonry|brick|stone|tile|mortar)\b.{0,50}\bdry[- ]?cut(?:s|ting)?\b/i.test(text)) {
    fact(facts, 'silicaGeneratingTask', true);
  }
  // V5-C02: new, additive fact -- distinguishes a control that is running/present from one that is
  // actually effective (e.g. "local exhaust ventilation is running but fumes remain in the worker
  // breathing zone"). Does not alter silicaControlState or any other existing fact/value below.
  if (/\b(exhaust|ventilation|dust collector|scrubber|filtration|guard|barrier|control|interlock)\b.{0,40}\b(running|operating|in operation|active|installed|in place)\b/i.test(text) &&
      /\b(fumes?|dust|mist|vapors?|contaminants?|particulates?|exposure|hazard)\b.{0,40}\b(remain|remains|persist|persists|still present|continu(?:e|es|ing))\b/i.test(text)) {
    fact(facts, 'controlEffectiveness', 'present_but_ineffective', 'user_text', 0.9, 'observed');
  }
  if (/\bvisible dust\b|\bdust surrounds?\b/i.test(text)) fact(facts, 'airborneDust', 'visible');
  if (/\b(?:wet saw|water feed|local exhaust)\b.{0,35}\b(?:operating|running|captures?|controls?)\b/i.test(text)) {
    fact(facts, 'silicaControlState', 'effective');
  } else if (/\bno (?:control|water|exhaust)\b.{0,20}\b(?:running|used|present)\b/i.test(text) ||
      // "no water suppression or dust collection", "without wet methods or local exhaust", "no dust control in use"
      /\b(?:no|without|lacking|lacks)\b[^.]{0,12}\b(?:water\s+(?:suppression|feed|spray|delivery|mist)|wet\s+(?:method|cutting|saw)|dust\s+(?:control|collection|collector|suppression|extraction)|local\s+exhaust|LEV|vacuum\s+(?:dust\s+)?collection|engineering\s+controls?)\b/i.test(text)) {
    fact(facts, 'silicaControlState', 'absent');
  }
  if (/\b(exit|egress|exit route)\b/i.test(text)) fact(facts, 'egressRoute', 'present');
  if (/\b(chained|locked|blocked|obstructed|unusable)\b/i.test(text) && !/\b(unlocked|not true that .*blocked)\b/i.test(text)) {
    fact(facts, 'egressState', 'locked_or_blocked');
  }
  if (/\b(open,? unlocked|route is open|exit is open|unlocked,? illuminated)\b/i.test(text)) {
    fact(facts, 'egressState', 'open_and_usable');
  }
  if (/\b(no (?:shield|slope|shoring|protective system|box)|no box,? slope,? or shoring|without (?:a )?(?:shield|shoring|shielding|slope|sloping|protective system)|without slope,? shore,? or shield)\b/i.test(text) ||
      // "no trench box, sloping, or shoring", "not shored or sloped", "without benching or shielding"
      /\b(?:no|without|lacking|lacks|absent)\b[^.]{0,20}\b(?:trench\s+box(?:es)?|shoring|shored|sloping|sloped|shielding|shields?|benching|benched|cave-?in\s+protection|protective\s+system)\b/i.test(text) ||
      /\bnot\s+(?:been\s+)?(?:shored|sloped|shielded|benched|protected)\b/i.test(text)) {
    fact(facts, 'protectiveSystem', 'absent');
  }
  if (/\bstable rock\b/i.test(text) &&
      !/\b(?:no|not|isn['’]?t|wasn['’]?t|without)\b.{0,35}\bstable rock\b/i.test(text)) {
    fact(facts, 'excavationMaterial', 'stable_rock', 'user_text', 0.96, 'confirmed');
  }
  if (/\b(power ?lines?|overhead (?:line|conductors?)|energized line|kV line)\b/i.test(text)) fact(facts, 'electricalLine', 'overhead_power_line');
  if (/\b(no (?:utility confirmation|spotter|encroachment controls?)|without (?:a )?(?:spotter|encroachment controls?))\b/i.test(text)) {
    fact(facts, 'powerLineControls', 'absent');
  }
  const depthFeet = numberBeforeUnit(text, 'feet|foot|ft') && /\b(trench|excavation)\b/i.test(text)
    ? numberBeforeUnit(text, 'feet|foot|ft') : undefined;
  if (depthFeet !== undefined) fact(facts, 'excavationDepth', depthFeet, 'user_text', 0.98, 'confirmed');
  const distanceFeet = /\b(?:from|of) an? (?:energized )?(?:power )?line\b/i.test(text) ||
    /\b(?:power ?line|overhead line)\b/i.test(text)
    ? numberBeforeUnit(text, 'feet|foot|ft') : undefined;
  if (distanceFeet !== undefined) fact(facts, 'powerLineDistance', distanceFeet, 'user_text', 0.98, 'confirmed');
  // A measured full-shift/TWA level: "92 dBA TWA", "92 dBA 8-hour TWA", "8-hour TWA of 92 dBA",
  // "full-shift average of 90 dBA". A bare "95 dBA" reading is NOT treated as a TWA.
  const noiseMatch = text.match(/\b(\d+(?:\.\d+)?)\s*dba?\b[^.]{0,30}\b(?:twa|time[- ]weighted(?:\s+average)?|8[- ]?(?:hour|hr)|full[- ]shift|shift\s+average)\b/i) ||
    text.match(/\b(?:twa|time[- ]weighted(?:\s+average)?|8[- ]?(?:hour|hr)|full[- ]shift|shift\s+average)\b[^.]{0,30}?\b(\d+(?:\.\d+)?)\s*dba?\b/i);
  const noiseTwa = noiseMatch ? Number(noiseMatch[1]) : undefined;
  if (noiseTwa !== undefined) fact(facts, 'noiseTwaDba', noiseTwa, 'user_text', 0.99, 'confirmed');
  const workHeightMatch = text.match(/\b(\d+(?:\.\d+)?)\s*[- ]?\s*(?:feet|foot|ft)\b/i);
  if (workHeightMatch && /\b(scaffold|platform|roof|edge|deck)\b/i.test(text)) {
    fact(facts, 'workHeightFeet', Number(workHeightMatch[1]), 'user_text', 0.98, 'confirmed');
  }

  for (const item of structured.controlsPresent || []) fact(facts, 'controlPresent', item, 'user_confirmation', 0.98, 'confirmed');
  for (const item of structured.controlsMissing || []) fact(facts, 'controlMissing', item, 'user_confirmation', 0.98, 'confirmed');
  for (const item of structured.unknownFacts || []) fact(facts, item, null, 'user_confirmation', 1, 'unknown');
  for (const item of structured.unresolvedContradictions || []) {
    const id = fact(facts, item.field, item.answerValue || item.originalValue || null, 'clarification', 0.2, 'contradicted');
    const target = facts.find(entry => entry.id === id);
    if (target) target.contradictedBy = [item.reason];
  }
  for (const item of structured.userConfirmedFacts || []) {
    fact(facts, item.field, item.value, 'user_confirmation', 1, 'confirmed');
  }
  for (const answer of input.clarificationAnswers || []) {
    const value = answerValue(answer);
    if (!value) continue;
    const questionId = String((answer as any).questionId || '').toLowerCase();
    if (questionId.includes('hazardous-energy-present-or-capable')) {
      fact(facts, 'energyState', value === 'yes' ? 'energized_or_operating' :
        value === 'no' ? 'deenergized' : null, 'clarification', value === 'not sure' ? 0 : 1,
      value === 'not sure' ? 'unknown' : 'confirmed');
    }
    if (questionId.includes('power-not-isolated-and-locked')) {
      fact(facts, 'energyIsolationState', value === 'yes' ? 'isolated_and_verified' :
        value === 'no' ? 'not_isolated' : null, 'clarification', value === 'not sure' ? 0 : 1,
      value === 'not sure' ? 'unknown' : 'confirmed');
    }
    if (questionId.includes('worker-cave-in-exposure')) {
      fact(facts, 'employeeExposure', value === 'yes' ? 'cave_in_zone' :
        value === 'no' ? false : null, 'clarification', value === 'not sure' ? 0 : 1,
      value === 'not sure' ? 'unknown' : 'confirmed');
    }
    if (questionId.includes('protective-system-absent')) {
      fact(facts, 'protectiveSystem', value === 'yes' ? 'absent' :
        value === 'no' ? 'present' : null, 'clarification', value === 'not sure' ? 0 : 1,
      value === 'not sure' ? 'unknown' : 'confirmed');
    }
    if (questionId.includes('permitted-task-exception-absent')) {
      fact(facts, 'fallZonePermittedTask', value === 'yes' ? true :
        value === 'no' ? false : null, 'clarification', value === 'not sure' ? 0 : 1,
      value === 'not sure' ? 'unknown' : 'confirmed');
    }
    if (questionId === 'machine-energy-state' || questionId.includes('machine-energy-state')) {
      fact(facts, 'energyState', isYes(value) ? 'energized_or_operating' : isNo(value) ? 'deenergized' : null,
        'clarification', /not sure|unknown|not observed/i.test(value) ? 0 : 1,
        /not sure|unknown|not observed/i.test(value) ? 'unknown' : 'confirmed');
    }
    if (questionId === 'machine-controls' || questionId.includes('machine-controls')) {
      const absent = /missing|removed|absent|open|ineffective|not installed/i.test(value);
      const present = /installed|present|effective|secured|guarded/i.test(value) && !absent;
      fact(facts, 'guardState', absent ? 'absent_or_ineffective' : present ? 'present_and_effective' : null,
        'clarification', absent || present ? 1 : 0,
        absent || present ? 'confirmed' : 'unknown');
    }
  }
  return {
    facts, text, lower, jurisdiction, jurisdictionProvenance, jurisdictionBasis,
    currentHazardNegated, correctedBeforeReview,
    noExposure, controlsAffirmed: (structured.controlsPresent || []).length > 0 &&
      (structured.controlsMissing || []).length === 0,
    depthFeet, distanceFeet, noiseTwa,
  };
}

/** True if an active (non-corrected, non-contradicted) fact of `type` (and optionally `value`) exists. */
export function hasFact(e: { facts: EvidenceFact[] }, type: string, value?: unknown): boolean {
  return e.facts.some(item => item.type === type && !['contradicted', 'corrected'].includes(item.status) &&
    (value === undefined || item.value === value));
}

/** IDs of every fact of `type` (any status), for provenance/traceability attachment. */
export function factIds(e: { facts: EvidenceFact[] }, type: string): string[] {
  return e.facts.filter(item => item.type === type).map(item => item.id);
}

/**
 * Hazard-scoped fact extraction: builds a fact set from ONLY the given hazard-scoped text
 * fragment (e.g. a decomposed hazard's own observationFragment/mechanism/supportingSignals, never
 * the whole fused observation or a sibling hazard's evidence -- the same discipline V5-C01 used for
 * per-finding risk). Reuses the single authoritative extraction path above rather than a second
 * parser, so a fact only appears here if the hazard-scoped text itself would produce it.
 */
export function buildHazardScopedEvidenceFacts(hazardText: string, scopes?: string[]): ExtractedEvidenceFacts {
  return buildEvidenceFacts({ text: hazardText, scopes });
}
