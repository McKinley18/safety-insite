/**
 * §197 -- DIAGNOSIS OF THE PRE-INFERENCE TRANSPORT REJECTION. ZERO PROVIDER CALLS.
 *
 * Twelve first-pass requests were rejected with HTTP 400 before generation began:
 *
 *     tools.0.custom: For 'array' type, property 'maxItems' is not supported
 *
 * Zero output tokens, $0.00 actual spend, no model behaviour observed. This script establishes the
 * cause from the request bodies themselves, with no further provider call, so the re-authorization
 * decision rests on evidence rather than on a plausible story.
 *
 * The question it answers precisely: WHICH JSON-Schema keywords does the vNext request schema carry
 * that the v15 request schema — which has executed hosted many times — does not?
 */

import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import type { ExpertAnalysisInput } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { buildExpertWireSchema, stableStringify } from
  '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { buildExpertVNextWireSchema, UNRESOLVED_FACT_DECLARATIONS_FIELD } from
  './lib/expert-first-pass-instruction-vnext';
import { SECTION_197_COHORT } from './lib/expert-197-cohort-2026-09-07';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-structured-e2e-validation-2026-09-07');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** Every schema keyword present anywhere in a node, with the paths it occurs at. */
function keywordsIn(node: unknown, path = '$'): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const add = (k: string, p: string): void => { out.set(k, [...(out.get(k) ?? []), p]); };
  const walk = (n: unknown, p: string): void => {
    if (Array.isArray(n)) { n.forEach((v, i) => walk(v, `${p}[${i}]`)); return; }
    if (n && typeof n === 'object') {
      for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
        // Property NAMES under `properties` are data, not keywords.
        if (p.endsWith('.properties')) { walk(v, `${p}.${k}`); continue; }
        add(k, `${p}.${k}`);
        walk(v, `${p}.${k}`);
      }
    }
  };
  walk(node, path);
  return out;
}

const inputFor = (row: typeof SECTION_197_COHORT[number]): ExpertAnalysisInput => ({
  contractVersion: 'hazlenz.expert.input.v1',
  analysisId: `AN-197-${row.rowId}`,
  authoritativeSources: [{ sourceId: `OBS-${row.rowId}`, sourceType: 'observation', text: row.observation }],
  inspectionContext: { location: row.location, task: row.task },
  jurisdiction: row.jurisdiction,
  allowedHazardFamilies: [...row.allowedHazardFamilies],
  deterministicFindings: row.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
  governedStandards: row.governedStandards.map(g => ({ ...g })),
  answeredClarifications: [],
});

const GOV = { governedEvidenceSourceIds: [] as string[] };
const rows: any[] = [];
const introducedKeywords = new Map<string, string[]>();

for (const row of SECTION_197_COHORT) {
  const input = inputFor(row);
  const v15Sent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(buildExpertWireSchema(input)));
  const vnextSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(buildExpertVNextWireSchema(input, GOV)));
  const v15Kw = keywordsIn(v15Sent);
  const vnextKw = keywordsIn(vnextSent);
  const introduced = [...vnextKw.keys()].filter(k => !v15Kw.has(k));
  for (const k of introduced) introducedKeywords.set(k, [...(introducedKeywords.get(k) ?? []), ...(vnextKw.get(k) ?? [])]);
  rows.push({
    rowId: row.rowId,
    v15KeywordCount: v15Kw.size,
    vnextKeywordCount: vnextKw.size,
    keywordsIntroducedByVNext: introduced,
    maxItemsOccurrences: (vnextKw.get('maxItems') ?? []).length,
    maxItemsPaths: vnextKw.get('maxItems') ?? [],
  });
}

/** What the request would look like with `maxItems` also stripped. Not sent; only measured. */
function stripAlsoMaxItems(node: unknown): unknown {
  const strip = (n: unknown): unknown => {
    if (Array.isArray(n)) return n.map(strip);
    if (n && typeof n === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
        if (k === 'maxItems') continue;
        out[k] = strip(v);
      }
      return out;
    }
    return n;
  };
  return strip(JSON.parse(JSON.stringify(node)));
}

const probeInput = inputFor(SECTION_197_COHORT[0]);
const sentNow = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(
  buildExpertVNextWireSchema(probeInput, GOV)));
const wouldSend = stripAlsoMaxItems(sentNow);
const remainingDiff = keywordsIn(sentNow).size - keywordsIn(wouldSend).size;

const doc = {
  artifact: 'SECTION_197_TRANSPORT_REJECTION_DIAGNOSIS',
  date: '2026-09-07',
  providerCallsMadeByThisDiagnosis: 0,
  observedProviderError: {
    httpStatus: 400,
    type: 'invalid_request_error',
    message: "tools.0.custom: For 'array' type, property 'maxItems' is not supported",
    occurrences: 12,
    identicalAcrossAllTwelveRows: true,
    outputTokens: 0,
    actualSpendUsd: 0.0,
    classification: 'PRE-INFERENCE EXECUTION/INFRASTRUCTURE EVENT — not model behaviour, and not '
      + 'scored as any.',
  },
  rootCause: {
    statement: 'The vNext wire schema emits `maxItems: 0` on `unresolvedFactDeclarations.items.'
      + 'properties.governedEvidenceSourceIds` whenever NO governed evidence was supplied with the '
      + 'request. Anthropic\'s strict tool-schema mode rejects `maxItems` on an array, before '
      + 'generation, for the whole request.',
    whyItWasNotCaughtBefore: 'the §108 compatibility strip removes `minLength` and `minItems` only. '
      + 'It was written before `maxItems` existed anywhere in this schema — §196 introduced the '
      + 'first occurrence — and its own comment records that no `maxItems` existed in the schema at '
      + 'the time: "it does not touch `minimum`, `maximum`, `pattern`, `maxLength` or `maxItems` '
      + '(none exist in this schema today...)". §196 made that parenthesis false and nothing '
      + 'connected the two.',
    keywordsIntroducedByVNextAcrossAllTwelveRows: [...introducedKeywords.keys()],
    onlyOffendingKeyword: [...introducedKeywords.keys()].length === 1
      && introducedKeywords.has('maxItems'),
    perRow: rows,
  },
  whatThisFalsifies: {
    section196CaseK3: 'K3 asserted "with no governed evidence supplied, the wire schema forbids '
      + 'naming one at all", and summarised the design as "transport refuses it, and the boundary '
      + 'refuses it again". On the ACTUAL hosted transport the first half does not hold: the '
      + 'transport does not refuse the ID, it refuses THE ENTIRE REQUEST.',
    whatStillHolds: 'the BOUNDARY half is untouched. §196 cases K1 and K2 refuse an unsupplied '
      + 'governed sourceId at the projection, deterministically, and nothing about this transport '
      + 'defect weakens that. The safety property survives; the claimed second layer does not.',
    honestRestatement: 'the two-layer claim was correct about the schema as a document and wrong '
      + 'about the schema as a request. A structural guarantee that cannot be transmitted to the '
      + 'provider is not a structural guarantee on the hosted path.',
  },
  candidateCorrections: [
    {
      option: 'A — extend the §108 Anthropic compatibility strip to remove `maxItems`',
      effect: 'the request becomes transportable. `governedEvidenceSourceIds` then carries '
        + '`items: {type: string}` with no upper bound, so the model COULD emit an id, and the '
        + 'projection would refuse it as GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET.',
      changesHashedTreatmentArtifact: true,
      note: 'this is the §108 precedent applied to a third keyword. It removes a transport-level '
        + 'guarantee and leaves the boundary-level one, which is where the product\'s protection '
        + 'has always actually lived.',
      wouldRequire: 'a fresh §197 preregistration, because every per-row wireSchemaSha256 changes.',
    },
    {
      option: 'B — omit the `governedEvidenceSourceIds` property entirely when the supplied set is '
        + 'empty, rather than bounding it at zero',
      effect: 'no `maxItems` is ever emitted; a model given no governed evidence has no field to '
        + 'put an id in at all, which is a STRONGER structural guarantee than maxItems:0 and one '
        + 'the transport accepts.',
      changesHashedTreatmentArtifact: true,
      note: 'this changes the vNext protocol itself, so it is a protocol revision and not a '
        + 'transport workaround. It would also make the declaration item shape vary by request, '
        + 'which the schema already does for enums.',
      wouldRequire: 'a vNext protocol revision plus a fresh §197 preregistration.',
    },
    {
      option: 'C — always supply the governed sourceIds that exist for the row',
      effect: 'rows carrying governed evidence get an enum; rows with none still need one of A or '
        + 'B. Does not solve the empty case on its own.',
      changesHashedTreatmentArtifact: true,
      note: 'incomplete by itself.',
      wouldRequire: 'combination with A or B.',
    },
  ],
  strippingMaxItemsChangesNothingElse: {
    keywordKindsRemoved: remainingDiff,
    schemaShaBefore: sha(stableStringify(sentNow)),
    schemaShaAfter: sha(stableStringify(wouldSend)),
    note: 'measured on SF-01\'s request. Exactly one keyword kind disappears; no property, type, '
      + 'enum, required list or description is touched.',
  },
  WHY_NO_REPAIR_WAS_APPLIED_IN_THIS_SLICE:
    'The §197 authorization states: "Do not modify treatment prompts, schemas, truth or thresholds '
    + 'after the first provider call", and for the neighbouring source-integrity case: "Do not '
    + 'repair and then silently execute under the same preregistered state. Record the failure and '
    + 'obtain review if the correction changes any hashed treatment artifact." Every candidate '
    + 'correction changes the per-row wireSchemaSha256 frozen in the §197 preregistration. So the '
    + 'failure is recorded and review is requested, rather than repaired and re-run.',
};

writeFileSync(join(EVID, 'TRANSPORT-REJECTION-DIAGNOSIS.json'), `${JSON.stringify(doc, null, 2)}\n`);
console.log(JSON.stringify({
  onlyOffendingKeyword: doc.rootCause.onlyOffendingKeyword,
  keywordsIntroducedByVNext: doc.rootCause.keywordsIntroducedByVNextAcrossAllTwelveRows,
  maxItemsOccurrencesPerRow: rows.map(r => `${r.rowId}:${r.maxItemsOccurrences}`).join(' '),
  keywordKindsRemovedByStrippingMaxItems: remainingDiff,
}, null, 2));
