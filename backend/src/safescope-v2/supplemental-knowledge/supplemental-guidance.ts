import {
  HAZLENZ_SUPPLEMENTAL_KNOWLEDGE_REGISTRY,
  SupplementalKnowledgeEntry,
} from './supplemental-knowledge.registry';

export function getSupplementalKnowledgeForFamily(family: string): SupplementalKnowledgeEntry[] {
  const normalized = String(family || '').toLowerCase();

  return HAZLENZ_SUPPLEMENTAL_KNOWLEDGE_REGISTRY.filter((entry) => {
    return normalized.includes(entry.family) || entry.family.includes(normalized);
  });
}

export function buildSupplementalGuidanceStatement(entries: SupplementalKnowledgeEntry[]): string | undefined {
  if (!entries.length) return undefined;

  const names = entries.map((entry) => entry.authorityName);
  return [
    `Supplemental guidance may include ${names.join(', ')}.`,
    'Treat these as supporting consensus or industry guidance unless the site, jurisdiction, AHJ, contract, regulation, or company policy adopts them.',
  ].join(' ');
}
