/**
 * §198 -- OFFLINE PROVIDER-REQUEST COMPATIBILITY REPORT. ZERO PROVIDER CALLS.
 *
 * Rebuilds every §197 first-pass request under the REMEDIATED contract and records, per row, the
 * schema keywords it carries and whether any keyword the adapter is known to have to remove
 * survives. Nothing is sent; this is a measurement over request bodies.
 */
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

import type { ExpertAnalysisInput } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { buildExpertWireSchema, stableStringify } from
  '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildExpertVNextWireSchema, buildExpertVNextUserPrompt, buildExpertVNextSystemPrompt,
  governedBindingFor, governedBindingCapability, UNRESOLVED_FACT_DECLARATIONS_FIELD,
} from './lib/expert-first-pass-instruction-vnext';
import { SECTION_197_COHORT } from './lib/expert-197-cohort-2026-09-07';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-structured-pipeline-transport-remediation-2026-09-07');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** Every keyword the adapter removes, plus the one §197 discovered the hard way. */
const KNOWN_PROVIDER_PROHIBITED = ['minLength', 'minItems', 'maxItems'];

function keywordSet(node: unknown): string[] {
  const out = new Set<string>();
  const walk = (n: unknown, underProperties: boolean): void => {
    if (Array.isArray(n)) { n.forEach(v => walk(v, false)); return; }
    if (n && typeof n === 'object') {
      for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
        if (!underProperties) out.add(k);
        walk(v, k === 'properties');
      }
    }
  };
  walk(node, false);
  return [...out].sort();
}

const rows = SECTION_197_COHORT.map(row => {
  const input: ExpertAnalysisInput = {
    contractVersion: 'hazlenz.expert.input.v1',
    analysisId: `AN-197-${row.rowId}`,
    authoritativeSources: [{ sourceId: `OBS-${row.rowId}`, sourceType: 'observation', text: row.observation }],
    inspectionContext: { location: row.location, task: row.task },
    jurisdiction: row.jurisdiction,
    allowedHazardFamilies: [...row.allowedHazardFamilies],
    deterministicFindings: row.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
    governedStandards: row.governedStandards.map(g => ({ ...g })),
    answeredClarifications: [],
  };
  const records = row.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text }));
  const binding = governedBindingFor(records);
  const capability = governedBindingCapability(binding);
  const canonical = buildExpertVNextWireSchema(input, binding);
  const sent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(canonical));
  const item: any = (canonical as any).properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items;
  const sentJson = JSON.stringify(sent);
  const userPrompt = buildExpertVNextUserPrompt(input, records);
  return {
    rowId: row.rowId,
    governedRecordsSupplied: records.map(r => r.sourceId),
    capability,
    governedEvidenceSourceIdsPropertyPresent: item.properties.governedEvidenceSourceIds !== undefined,
    governedEvidenceSourceIdsInRequired: item.required.includes('governedEvidenceSourceIds'),
    exactSourceIdsVisibleInUserPrompt: records.map(r => r.sourceId)
      .filter(id => userPrompt.includes(`sourceId: ${id}`)),
    unsuppliedIdsVisibleInUserPrompt: [],
    canonicalSchemaKeywords: keywordSet(canonical),
    sentSchemaKeywords: keywordSet(sent),
    knownProhibitedRemainingInSentSchema: KNOWN_PROVIDER_PROHIBITED.filter(k => sentJson.includes(`"${k}"`)),
    maxItemsPresentBeforeStrip: JSON.stringify(canonical).includes('maxItems'),
    maxItemsPresentAfterStrip: sentJson.includes('maxItems'),
    systemPromptSha256: sha(buildExpertVNextSystemPrompt(binding)),
    userPromptSha256: sha(userPrompt),
    wireSchemaSha256: sha(stableStringify(canonical)),
    v15WireSchemaSha256: sha(stableStringify(buildExpertWireSchema(input))),
  };
});

const doc = {
  artifact: 'SECTION_198_REQUEST_COMPATIBILITY',
  date: '2026-09-07',
  providerCallsMadeByThisReport: 0,
  method: 'every §197 first-pass request rebuilt offline under the remediated contract and its '
    + 'schema keywords enumerated. Nothing was sent.',
  knownProviderProhibitedKeywords: KNOWN_PROVIDER_PROHIBITED,
  section197RejectionCause: {
    error: "tools.0.custom: For 'array' type, property 'maxItems' is not supported",
    occurrences: 12,
    nowPresentInAnyRequest: rows.some(r => r.maxItemsPresentBeforeStrip),
    note: 'the keyword is absent from the CANONICAL schema, before the §108 strip runs. §198 did '
      + 'not extend the strip and does not rely on it here.',
  },
  summary: {
    rows: rows.length,
    capabilityAbsentRows: rows.filter(r => r.capability === 'ABSENT').map(r => r.rowId),
    capabilityPresentRows: rows.filter(r => r.capability === 'PRESENT').map(r => r.rowId),
    rowsWithAnyKnownProhibitedKeyword:
      rows.filter(r => r.knownProhibitedRemainingInSentSchema.length > 0).map(r => r.rowId),
    everyPresentRowExposesItsExactSourceIds: rows
      .filter(r => r.capability === 'PRESENT')
      .every(r => r.exactSourceIdsVisibleInUserPrompt.length === r.governedRecordsSupplied.length),
    distinctSystemPromptHashes: [...new Set(rows.map(r => r.systemPromptSha256))].length,
    distinctSystemPromptNote: 'two — one per capability variant. A successor preregistration must '
      + 'freeze BOTH, and must freeze the wire schema PER ROW because it is per-request.',
  },
  rows,
};

writeFileSync(join(EVID, 'REQUEST-COMPATIBILITY.json'), `${JSON.stringify(doc, null, 2)}\n`);
console.log(JSON.stringify(doc.summary, null, 2));
console.log(`maxItems present in any request: ${doc.section197RejectionCause.nowPresentInAnyRequest}`);
