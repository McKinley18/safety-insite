import {
  HAZLENZ_SUPPLEMENTAL_KNOWLEDGE_REGISTRY,
  SupplementalKnowledgeEntry,
} from './supplemental-knowledge.registry';

export type SupplementalGuidanceResult = {
  entries: SupplementalKnowledgeEntry[];
  summary?: string;
  authorityBoundary: string;
  adoptionQuestion: string;
};

const FAMILY_ALIASES: Record<string, string[]> = {
  hazcom: ['hazcom', 'hazard communication', 'hazard_communication', 'chemical', 'chemical labeling', 'label', 'sds'],
  hazard_communication: ['hazcom', 'hazard communication', 'hazard_communication', 'chemical', 'chemical labeling', 'label', 'sds'],
  compressed_gas: ['compressed gas', 'compressed_gas', 'cylinder', 'oxygen cylinder', 'acetylene cylinder', 'gas cylinder'],
  electrical: ['electrical', 'panel', 'breaker', 'cord', 'wiring', 'energized', 'live parts'],
  machine_guarding: ['machine guarding', 'machine_guarding', 'guarding', 'pulley', 'shaft', 'nip point', 'pinch point', 'conveyor'],
  lockout_tagout: ['lockout tagout', 'lockout_tagout', 'loto', 'lockout', 'tagout', 'energy isolation', 'stored energy'],
  walking_working_surfaces: ['walking working surfaces', 'walking_working_surfaces', 'housekeeping', 'trip', 'slip', 'walkway', 'floor'],
  fall_protection: ['fall protection', 'fall_protection', 'guardrail', 'opening', 'edge', 'platform', 'roof'],
  fire_emergency: ['fire emergency', 'fire_emergency', 'hot work', 'fire watch', 'extinguisher', 'combustible'],
  industrial_hygiene: ['industrial hygiene', 'industrial_hygiene', 'dust', 'fume', 'noise', 'heat stress', 'respiratory'],
  mobile_equipment: ['mobile equipment', 'mobile_equipment', 'forklift', 'loader', 'truck', 'haul truck', 'backing', 'traffic control', 'haul'],
  mining: ['mining', 'mine', 'miner', 'crusher', 'conveyor', 'haul road', 'ground control', 'stockpile', 'quarry', 'aggregate plant'],
};

const ADOPTION_QUESTION = 'Confirm whether the site, jurisdiction, AHJ, contract, regulation, manufacturer instruction, or company policy adopts the supplemental guidance before treating it as mandatory.';
const AUTHORITY_BOUNDARY = 'Supplemental guidance supports reasoning and controls only. It is not a primary enforceable citation unless adoption or incorporation is confirmed.';

function normalize(value: string): string {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokenMatch(text: string, token: string): boolean {
  const normalizedText = normalize(text);
  const normalizedToken = normalize(token);
  if (!normalizedText || !normalizedToken) return false;
  return normalizedText.includes(normalizedToken);
}

function gatherContextTokens(context: {
  hazardCategory?: string;
  candidateStandardFamily?: string;
  classification?: string;
  knowledgeRoute?: { hazardFamily?: string; equipmentFamily?: string; taskMechanism?: string };
  observation?: string;
  suggestedStandards?: any[];
  supportingStandards?: any[];
}): string[] {
  const tokens = [
    context.hazardCategory,
    context.candidateStandardFamily,
    context.classification,
    context.knowledgeRoute?.hazardFamily,
    context.knowledgeRoute?.equipmentFamily,
    context.knowledgeRoute?.taskMechanism,
    ...(context.suggestedStandards || []).flatMap((standard) => [
      standard?.citation,
      standard?.title,
      standard?.titleSummary,
      standard?.heading,
      ...(standard?.matchingReasons || []),
    ]),
    ...(context.supportingStandards || []).flatMap((standard) => [
      standard?.citation,
      standard?.title,
      standard?.titleSummary,
      standard?.heading,
      ...(standard?.matchingReasons || []),
    ]),
    context.observation,
  ]
    .filter(Boolean)
    .map((value) => String(value));

  return tokens;
}

function familyMatches(entry: SupplementalKnowledgeEntry, tokens: string[]): boolean {
  const aliases = FAMILY_ALIASES[entry.family] || [entry.family];
  const signalText = tokens.join(' ').toLowerCase();
  if (entry.family === 'mobile_equipment') {
    const hasVehicleTerms = /\b(forklift|loader|truck|haul truck|mobile equipment|vehicle|backing|backup alarm|spotter|traffic control|haul road|blind corner|intersection|right of way)\b/i.test(signalText);
    if (!hasVehicleTerms) return false;
  }
  if (entry.family === 'mining') {
    const hasMineContext = /\b(mine|miner|mining|crusher|conveyor|haul road|stockpile|quarry|aggregate plant|screen plant)\b/i.test(signalText);
    if (!hasMineContext) return false;
  }
  if (aliases.some((alias) => tokenMatch(signalText, alias))) {
    return true;
  }
  const reasoningSignals = [entry.shortUse, entry.applicabilityGuardrail, ...entry.reasoningUses].join(' ').toLowerCase();
  return tokens.some((token) =>
    [entry.family, ...entry.reasoningUses, entry.shortUse, ...aliases]
      .some((candidate) => tokenMatch(token, candidate) || tokenMatch(candidate, token)) ||
    tokenMatch(signalText, reasoningSignals),
  );
}

function relevanceScore(entry: SupplementalKnowledgeEntry, tokens: string[]): number {
  const normalized = tokens.join(' ').toLowerCase();
  const aliases = FAMILY_ALIASES[entry.family] || [entry.family];
  let score = 0;

  for (const alias of aliases) {
    if (tokenMatch(normalized, alias)) score += 4;
  }
  for (const reason of entry.reasoningUses) {
    if (tokenMatch(normalized, reason)) score += 2;
  }
  if (tokenMatch(normalized, entry.family)) score += 2;
  return score;
}

export function getSupplementalKnowledgeForContext(context: {
  hazardCategory?: string;
  candidateStandardFamily?: string;
  classification?: string;
  knowledgeRoute?: { hazardFamily?: string; equipmentFamily?: string; taskMechanism?: string };
  observation?: string;
  suggestedStandards?: any[];
  supportingStandards?: any[];
}): SupplementalKnowledgeEntry[] {
  const tokens = gatherContextTokens(context);
  return HAZLENZ_SUPPLEMENTAL_KNOWLEDGE_REGISTRY
    .filter((entry) => entry.authorityTier !== 'primary_enforceable')
    .filter((entry) => familyMatches(entry, tokens))
    .sort((left, right) => relevanceScore(right, tokens) - relevanceScore(left, tokens))
    .slice(0, 5);
}

export function buildSupplementalGuidanceStatement(entries: SupplementalKnowledgeEntry[]): string | undefined {
  if (!entries.length) return undefined;

  const names = [...new Set(entries.map((entry) => entry.authorityName))];
  return `Supplemental guidance may include ${names.join(', ')}. ${AUTHORITY_BOUNDARY} ${ADOPTION_QUESTION}`;
}

export function buildSupplementalGuidance(entries: SupplementalKnowledgeEntry[]): SupplementalGuidanceResult | undefined {
  if (!entries.length) return undefined;
  return {
    entries,
    summary: buildSupplementalGuidanceStatement(entries),
    authorityBoundary: AUTHORITY_BOUNDARY,
    adoptionQuestion: ADOPTION_QUESTION,
  };
}
