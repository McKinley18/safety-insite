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
}

export type ExtractedEvidenceFacts = {
  facts: EvidenceFact[];
  text: string;
  lower: string;
  jurisdiction: string;
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

const SINGLETON_FACT_TYPES = new Set([
  'jurisdiction', 'currentHazardState', 'employeeExposure', 'workActivity', 'equipmentType',
  'loadState', 'energyState', 'energyIsolationState', 'electricalLiveParts', 'environment',
  'groundCondition', 'egressState', 'protectiveSystem', 'excavationMaterial',
  'powerLineControls', 'excavationDepth', 'powerLineDistance', 'noiseTwaDba',
  'fallZonePermittedTask', 'guardState', 'backupAlarmState', 'fallExposure',
  'fallProtectionState', 'chemicalLabelState', 'silicaGeneratingTask', 'airborneDust',
  'silicaControlState', 'workHeightFeet',
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
  const incomingAuthoritative = ['user_confirmation', 'qualified_review', 'clarification'].includes(source);
  const existingAuthoritative = activeSameType &&
    ['user_confirmation', 'qualified_review', 'clarification'].includes(activeSameType.source);
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

function numberBeforeUnit(text: string, unit: string): number | undefined {
  const match = text.match(new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*(?:${unit})\\b`, 'i'));
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
  const jurisdiction = String(structured.jurisdiction || '').toLowerCase() ||
    ((input.scopes || []).join(' ').includes('msha') ? 'msha' :
      (input.scopes || []).join(' ').includes('construction') ? 'osha-construction' :
      (input.scopes || []).join(' ').includes('general') ? 'osha-general-industry' : 'unknown');
  fact(facts, 'jurisdiction', jurisdiction, structured.jurisdiction ? 'user_confirmation' : 'system_inference',
    jurisdiction === 'unknown' ? 0.2 : 0.98, jurisdiction === 'unknown' ? 'unknown' : 'confirmed');

  const correctedBeforeReview =
    /\b(corrected|repaired|replaced|resolved)\b.{0,80}\b(now|passed|tested|verified)\b/i.test(text) ||
    /\b(?:now|current|currently)\b.{0,45}\b(?:interlock(?:ed)?|guard(?:ed)?|open and usable|clear and usable|compliant|passed)\b/i.test(text) ||
    // V5-C02: covers "<defect> last week but was corrected/repaired/replaced/resolved before this
    // inspection/review/audit/visit" -- a demonstrated gap where a genuinely historical, already-
    // corrected condition was represented as current (the original two alternatives above require
    // a trailing now/passed/tested/verified/current(ly) word this phrasing doesn't use).
    /\b(?:corrected|repaired|replaced|resolved)\b.{0,40}\bbefore (?:this|the) (?:inspection|review|audit|visit)\b/i.test(text);
  const quotedOrNonObservation =
    /\b(training (?:poster|example|exercise)|hypothetical|word ['"][^'"]+['"]|says? ['"])/i.test(text) ||
    /\b(?:toy|scale model|miniature|nonoperational mock-?up|display model)\b.{0,60}\b(?:display|case|lobby|exhibit|demonstration)\b/i.test(text);
  const explicitNoCondition = /\b(no (?:equipment servicing|hazardous energy condition|cave-in hazard|unusual impulse noise|active exposure)|not true that)\b/i.test(text);
  const noExposure = /\b(no (?:employee|worker|miner|laborer|person|one)s? (?:was |were |is |are )?(?:exposed|present|entered|working|using)|nobody|no one)\b/i.test(text);
  const currentHazardNegated = quotedOrNonObservation || explicitNoCondition || correctedBeforeReview;
  if (currentHazardNegated) fact(facts, 'currentHazardState', 'not_established', 'user_text', 0.98,
    correctedBeforeReview ? 'corrected' : 'confirmed', correctedBeforeReview ? 'corrected_before_review' : 'current');
  if (noExposure) fact(facts, 'employeeExposure', false, 'user_text', 0.98, 'confirmed');

  if (/\b(servic\w*|maintenan\w*|mechanic\w*|repair(?:s|ed|ing)?|(?:clear(?:s|ed|ing)?|pull(?:s|ed|ing)?) (?:a )?(?:\w+ )?jam|wrench inside)\b/i.test(text)) {
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
  if (hasAnyNonNegatedTerm(text, [
        'energized', 'live', 'powered', 'disconnect remains on', 'disconnect stayed on',
        'power remains on', 'power stayed on', 'capable of movement',
      ]) ||
      ['energized', 'operating'].includes(String(structured.energyState || ''))) {
    fact(facts, 'energyState', 'energized_or_operating', structured.energyState ? 'user_confirmation' : 'user_text');
  }
  if (/\b(deenergized|de-energized|locked out|zero energy|disconnect open)\b/i.test(text) ||
      ['deenergized', 'locked-out'].includes(String(structured.energyState || ''))) {
    fact(facts, 'energyIsolationState', 'isolated_and_verified', structured.energyState ? 'user_confirmation' : 'user_text');
  }
  if (/\b(no (?:personal )?lo[ck]+(?: is fitted| is applied| fitted| applied| was fitted| was applied)?|not (?:locked|isolated)|disconnect (?:remains|stayed) (?:on|ON)|without lockout)\b/i.test(text)) {
    fact(facts, 'energyIsolationState', 'not_isolated');
  }
  if (/\b(bare (?:copper|conductor)|exposed (?:bus bars?|live parts?|conductor)|(?:live|energized).{0,15}(?:bus|bus bars?|conductors?) (?:(?:is|are) )?(?:exposed|reachable|uncovered))\b/i.test(text)) {
    fact(facts, 'electricalLiveParts', 'exposed_and_reachable');
  }
  if (/\b(wet|damp|sump|water)\b/i.test(text)) fact(facts, 'environment', 'wet_or_conductive');
  if (/\b(loose|drumm(?:y|ing)|unsupported|scaling)\b.*\b(rock|ground|slab|back|rib)\b|\b(slabs?|ground)\b.*\b(loose|drumm(?:y|ing))\b/i.test(text)) {
    fact(facts, 'groundCondition', 'loose_or_unsafe');
  }
  if (/\b(?:guard|interlock)\b.{0,35}\b(?:installed|bolted|secured|tested|blocks? reach)\b/i.test(text)) {
    fact(facts, 'guardState', 'present_and_effective');
  } else if (/\b(?:guard|guardrail)\b.{0,25}\b(?:missing|absent|removed|open)\b|\b(?:missing|absent|removed)\b.{0,20}\b(?:guard|guardrail)\b|\b(?:unguarded|open nip point|nip point open)\b/i.test(text)) {
    fact(facts, 'guardState', 'absent_or_ineffective');
  }
  if (/\b(?:backup|reverse) alarm\b.{0,35}\b(?:no sound|silent|did not sound|failed)\b/i.test(text)) {
    fact(facts, 'backupAlarmState', 'failed');
  } else if (/\b(?:backup|reverse) alarm\b.{0,35}\b(?:sounded|passed|working|function(?:ed|al)?)\b/i.test(text)) {
    fact(facts, 'backupAlarmState', 'functional');
  }
  if (/\b(?:unprotected|open)\b.{0,30}\b(?:edge|deck|roof|pit)\b|\b(?:guardrail|fall protection)\b.{0,20}\b(?:missing|absent|none)\b/i.test(text)) {
    fact(facts, 'fallExposure', 'unprotected_edge_or_opening');
  }
  if (/\b(?:guardrail|fall protection|restraint|arrest system)\b.{0,35}\b(?:installed|in place|complete|before access)\b/i.test(text)) {
    fact(facts, 'fallProtectionState', 'present');
  }
  if (/\b(?:secondary )?(?:bottle|container|jug)\b.{0,45}\b(?:no (?:name|label)|unlabeled|no hazard label)\b/i.test(text) ||
      /\b(?:unlabeled|unlabelled|no (?:name|label)|no hazard label)\b.{0,45}\b(?:chemical|secondary )?(?:bottle|container|jug)\b/i.test(text)) {
    fact(facts, 'chemicalLabelState', 'missing');
  } else if (/\b(?:bottle|container|jug)\b.{0,45}\blabeled\b.{0,45}\b(?:hazards?|sds|contents?|product)\b/i.test(text) ||
    /\blabeled with (?:product|contents?).{0,30}(?:hazards?|sds)\b/i.test(text)) {
    fact(facts, 'chemicalLabelState', 'compliant');
  }
  if (/\b(?:dry[- ]?cuts?|dry cutting)\b.{0,50}\b(?:concrete|block|masonry)\b|\b(?:concrete|block|masonry)\b.{0,50}\bdry[- ]?cuts?\b/i.test(text)) {
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
  } else if (/\bno (?:control|water|exhaust)\b.{0,20}\b(?:running|used|present)\b/i.test(text)) {
    fact(facts, 'silicaControlState', 'absent');
  }
  if (/\b(exit|egress|exit route)\b/i.test(text)) fact(facts, 'egressRoute', 'present');
  if (/\b(chained|locked|blocked|obstructed|unusable)\b/i.test(text) && !/\b(unlocked|not true that .*blocked)\b/i.test(text)) {
    fact(facts, 'egressState', 'locked_or_blocked');
  }
  if (/\b(open,? unlocked|route is open|exit is open|unlocked,? illuminated)\b/i.test(text)) {
    fact(facts, 'egressState', 'open_and_usable');
  }
  if (/\b(no (?:shield|slope|shoring|protective system|box)|no box,? slope,? or shoring|without (?:a )?(?:shield|shoring|shielding|slope|sloping|protective system)|without slope,? shore,? or shield)\b/i.test(text)) {
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
  const noiseMatch = text.match(/\b(\d+(?:\.\d+)?)\s*dba?\s*(?:twa|time[- ]weighted average)\b/i);
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
    facts, text, lower, jurisdiction, currentHazardNegated, correctedBeforeReview,
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
