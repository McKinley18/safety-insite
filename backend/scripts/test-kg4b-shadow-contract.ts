/**
 * KG-4B (Phases 1, 2, 10, 11, 12, 13) -- the shadow comparison contract.
 *
 * PURE. No database, no network, no fixtures. Every assertion is a property of the contract itself,
 * so this suite runs anywhere, cannot damage any evidence database, and is safe to run first.
 *
 * WHAT IT PROVES.
 *   Part 1  the taxonomy is total and every category is reachable        (Phase 2)
 *   Part 2  classification is deterministic and precedence is stable     (Phase 2, 15)
 *   Part 3  severity identifies blocking cases and nothing else          (Phase 12)
 *   Part 4  root cause is assigned, and EXPECTED_FALLBACK is first-class (Phase 13)
 *   Part 5  the event carries no customer content                       (Phase 11)
 *   Part 6  event keys are deterministic and idempotent                 (Phase 10)
 *   Part 7  the KG-4A vocabulary is a projection, not a second engine    (one taxonomy)
 *
 * Usage: npx ts-node scripts/test-kg4b-shadow-contract.ts [--emit <taxonomy.json>]
 */
import { writeFileSync } from 'fs';
import {
  classifyShadowComparison, severityFor, buildShadowComparisonRecord, shadowEventKey,
  assertShadowEventPrivacySafe, toLegacyMismatchCategory,
  ALL_MISMATCH_CATEGORIES, ALL_SEVERITIES, ALL_ROOT_CAUSES,
  canonicalizeRegime, jurisdictionsDisagree,
  SHADOW_EVENT_ALLOWED_FIELDS, SHADOW_EVENT_SCHEMA_VERSION,
  type ShadowMismatchCategory, type ShadowComparisonInput,
} from '../src/standards/cutover/shadow-comparison';
import type { GovernedResolutionResult } from '../src/standards/cutover/governed-resolution';
import type { GovernedBackingState } from '../src/standards/cutover/fallback-contract';

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }

/** A governed resolution fixture. Defaults are the "everything agrees" case. */
function resolution(over: Partial<GovernedResolutionResult> = {}): GovernedResolutionResult {
  return {
    requestedCitation: '29 CFR 1910.212(a)(1)',
    resolvedCitation: '29 CFR 1910.212(a)(1)',
    citationKey: '29cfr1910.212(a)(1)',
    granularity: 'EXACT',
    backing: 'APPROVED_EXACT',
    standardText: 'One or more methods of machine guarding shall be provided.',
    plainLanguageSummary: null,
    title: 'Machine guarding',
    sourceKey: 'osha-ecfr-1910',
    sourceName: 'eCFR Title 29 Part 1910',
    authorityTier: '1',
    jurisdiction: 'OSHA/general_industry',
    placeholderSource: false,
    releaseId: 'federal-core-2026-07-30.1',
    recordChecksum: 'a'.repeat(64),
    effectiveReviewState: 'reviewer_approved',
    health: 'OK',
    reason: 'fixture',
    ...over,
  };
}

function input(over: Partial<ShadowComparisonInput> = {}): ShadowComparisonInput {
  return {
    governed: resolution(),
    legacyCitation: '29 CFR 1910.212(a)(1)',
    legacyText: 'One or more methods of machine guarding shall be provided.',
    legacyBackingState: 'UNAPPROVED_CONTENT',
    applicability: 'SUPPORTED',
    ...over,
  };
}

// ============================================================ Part 1 -- totality + reachability
section('Part 1 — the taxonomy is total and every category is reachable');

assert(ALL_MISMATCH_CATEGORIES.length === 15, `15 mismatch categories declared (got ${ALL_MISMATCH_CATEGORIES.length})`);
assert(new Set(ALL_MISMATCH_CATEGORIES).size === ALL_MISMATCH_CATEGORIES.length, 'no duplicate category names');
assert(ALL_SEVERITIES.length === 3 && ALL_ROOT_CAUSES.length === 11,
  `3 severities and 11 root-cause buckets declared`);

/** Every category, with an input that must produce it. Reachability is proven, not assumed. */
const REACH: Array<[ShadowMismatchCategory, ShadowComparisonInput]> = [
  ['EXACT_MATCH', input()],
  ['CONTENT_EQUIVALENT', input({ legacyText: 'One or more  methods of machine guarding shall be provided' })],
  ['CONTENT_DIFFERENCE', input({ legacyText: 'Something else entirely.' })],
  ['CITATION_DIFFERENCE', input({ governed: resolution({ resolvedCitation: '29 CFR 1910.219' }) })],
  ['GRANULARITY_DIFFERENCE', input({ governed: resolution({ backing: 'APPROVED_SECTION_ONLY', standardText: null }) })],
  ['GOVERNED_APPROVED_EXACT', input({ legacyText: null })],
  ['GOVERNED_UNAPPROVED', input({ governed: resolution({ backing: 'UNAPPROVED_RECORD', standardText: null }) })],
  ['GOVERNED_CITATION_ONLY', input({ governed: resolution({ backing: 'APPROVED_NO_TEXT', standardText: null }) })],
  ['GOVERNED_MISSING', input({ governed: resolution({ backing: 'NOT_IN_RELEASE', standardText: null }) })],
  ['APPLICABILITY_DIFFERENCE', input({ applicability: 'UNCERTAIN' })],
  ['JURISDICTION_DIFFERENCE', input({ legacyJurisdiction: 'MSHA/mining', governedJurisdiction: 'OSHA/general_industry' })],
  ['ORDERING_DIFFERENCE', input({ governed: resolution({ standardText: null, plainLanguageSummary: null }), legacyText: null, orderingDiffers: true })],
  ['RESOLVER_FAILURE', input({ governed: resolution({ backing: 'RESOLVER_UNAVAILABLE', health: 'QUERY_FAILED', standardText: null }) })],
  ['INTEGRITY_FAILURE', input({ governed: resolution({ backing: 'RESOLVER_UNAVAILABLE', health: 'STALE_SCHEMA', standardText: null }) })],
  ['PROVENANCE_DIFFERENCE', input({ governed: resolution({ standardText: null, plainLanguageSummary: null }), legacyText: null, provenanceDiffers: true })],
];
const reached = new Set<ShadowMismatchCategory>();
for (const [expected, sample] of REACH) {
  const actual = classifyShadowComparison(sample).mismatch;
  assert(actual === expected, `${expected} is reachable (got ${actual})`);
  reached.add(actual);
}
assert(ALL_MISMATCH_CATEGORIES.every(c => reached.has(c)),
  `HARD: every declared category is produced by at least one input (${reached.size}/${ALL_MISMATCH_CATEGORIES.length})`);

// ============================================================ Part 2 -- determinism + precedence
section('Part 2 — classification is deterministic and precedence is stable');

for (const [label, sample] of REACH) {
  const runs = Array.from({ length: 5 }, () => JSON.stringify(classifyShadowComparison(sample)));
  assert(new Set(runs).size === 1, `[${label}] identical classification across 5 repeated calls`);
}

// Precedence, asserted directly by stacking conditions.
const stacked = input({
  governed: resolution({
    backing: 'RESOLVER_UNAVAILABLE', health: 'STALE_SCHEMA',
    resolvedCitation: '29 CFR 1910.219', standardText: null,
  }),
  legacyText: 'different text', legacyJurisdiction: 'MSHA/mining', governedJurisdiction: 'OSHA/general_industry',
  applicability: 'UNCERTAIN', orderingDiffers: true, provenanceDiffers: true,
});
const stackedResult = classifyShadowComparison(stacked);
assert(stackedResult.mismatch === 'INTEGRITY_FAILURE',
  'HARD: integrity failure outranks every other simultaneous condition');
assert(stackedResult.dimensions.citationDiffers && stackedResult.dimensions.jurisdictionDiffers &&
       stackedResult.dimensions.orderingDiffers && stackedResult.dimensions.applicabilityUncertain,
  'HARD: the secondary dimensions still record every condition — the primary label loses nothing');

const resolverOverCitation = classifyShadowComparison(input({
  governed: resolution({ backing: 'RESOLVER_UNAVAILABLE', health: 'QUERY_FAILED', resolvedCitation: 'x', standardText: null }),
}));
assert(resolverOverCitation.mismatch === 'RESOLVER_FAILURE',
  '"we do not know" outranks a citation difference — a failed resolution says nothing about content');

const jurisdictionOverGranularity = classifyShadowComparison(input({
  governed: resolution({ backing: 'APPROVED_SECTION_ONLY', standardText: null }),
  legacyJurisdiction: 'MSHA/mining', governedJurisdiction: 'OSHA/general_industry',
}));
assert(jurisdictionOverGranularity.mismatch === 'JURISDICTION_DIFFERENCE',
  'a jurisdiction disagreement outranks a granularity difference');

// Dimensions are independent of the primary label.
const allBackings: GovernedBackingState[] = ['APPROVED_EXACT', 'APPROVED_SECTION_ONLY',
  'APPROVED_NO_TEXT', 'UNAPPROVED_RECORD', 'NOT_IN_RELEASE', 'NO_ACTIVE_RELEASE', 'RESOLVER_UNAVAILABLE'];
let dimensionChecks = 0;
for (const backing of allBackings) {
  for (const applicability of ['SUPPORTED', 'UNCERTAIN', 'UNSUPPORTED'] as const) {
    const r = classifyShadowComparison(input({
      governed: resolution({ backing, standardText: backing === 'APPROVED_EXACT' ? 'text' : null }),
      applicability,
    }));
    if (r.dimensions.applicabilityUncertain === (applicability === 'UNCERTAIN')) dimensionChecks++;
    if (r.dimensions.backingDiffers !== (backing !== 'APPROVED_EXACT')) {
      console.log(`FAIL  backingDiffers wrong for ${backing}`); failed++;
    }
  }
}
assert(dimensionChecks === 21,
  `HARD: applicabilityUncertain tracks the applicability axis alone, over all 21 combinations (got ${dimensionChecks})`);

// ============================================================ Part 3 -- severity
section('Part 3 — severity identifies blocking cases and nothing else');

const BLOCKING: ShadowMismatchCategory[] =
  ['JURISDICTION_DIFFERENCE', 'CITATION_DIFFERENCE', 'INTEGRITY_FAILURE', 'CONTENT_DIFFERENCE'];
const REVIEW: ShadowMismatchCategory[] =
  ['GRANULARITY_DIFFERENCE', 'GOVERNED_UNAPPROVED', 'GOVERNED_CITATION_ONLY',
   'APPLICABILITY_DIFFERENCE', 'RESOLVER_FAILURE'];
const INFORMATIONAL: ShadowMismatchCategory[] =
  ['EXACT_MATCH', 'CONTENT_EQUIVALENT', 'GOVERNED_APPROVED_EXACT', 'GOVERNED_MISSING',
   'ORDERING_DIFFERENCE', 'PROVENANCE_DIFFERENCE'];

const noDimensions = {
  citationDiffers: false, granularityDiffers: false, contentDiffers: false, backingDiffers: false,
  applicabilityUncertain: false, jurisdictionDiffers: false, orderingDiffers: false,
  resolverFailed: false, integrityFailed: false, provenanceDiffers: false,
};
for (const category of BLOCKING) {
  assert(severityFor(category, noDimensions) === 'BLOCKING', `${category} is BLOCKING`);
}
for (const category of REVIEW) {
  assert(severityFor(category, noDimensions) === 'REVIEW', `${category} is REVIEW`);
}
for (const category of INFORMATIONAL) {
  assert(severityFor(category, noDimensions) === 'INFORMATIONAL', `${category} is INFORMATIONAL`);
}
assert(BLOCKING.length + REVIEW.length + INFORMATIONAL.length === ALL_MISMATCH_CATEGORIES.length,
  'every category has exactly one declared severity');

// The judgement calls, stated explicitly so they can be argued with.
assert(severityFor('GOVERNED_MISSING', noDimensions) === 'INFORMATIONAL',
  'HARD: a MISSING governed record is NOT blocking — under fallback the customer gets today\'s behaviour');
assert(severityFor('GRANULARITY_DIFFERENCE', noDimensions) === 'REVIEW',
  'a section-only match is REVIEW, not blocking — no promotion occurs and fallback is legacy');
assert(severityFor('CONTENT_DIFFERENCE', noDimensions) === 'BLOCKING',
  'HARD: two different texts for one citation IS blocking — one of them would be shown as verified');
assert(severityFor('ORDERING_DIFFERENCE', { ...noDimensions, contentDiffers: true }) === 'REVIEW',
  'an ordering difference escalates to REVIEW when content also differs');

// ============================================================ Part 4 -- root cause
section('Part 4 — root cause is assigned and EXPECTED_FALLBACK is first-class');

const causeOf = (sample: ShadowComparisonInput) => classifyShadowComparison(sample).rootCause;
assert(causeOf(input({ governed: resolution({ backing: 'NOT_IN_RELEASE', standardText: null }) })) === 'EXPECTED_FALLBACK',
  'a missing governed record is EXPECTED_FALLBACK, not a defect');
assert(causeOf(input({ governed: resolution({ backing: 'UNAPPROVED_RECORD', standardText: null }) })) === 'GOVERNANCE_APPROVAL',
  'an unreviewed record is GOVERNANCE_APPROVAL — the remedy is review');
assert(causeOf(input({ governed: resolution({ backing: 'UNAPPROVED_RECORD', standardText: null, placeholderSource: true }) })) === 'SOURCE_PROVENANCE',
  'an unreviewed record with a PLACEHOLDER source is SOURCE_PROVENANCE — the remedy is sourcing');
assert(causeOf(input({ governed: resolution({ backing: 'APPROVED_SECTION_ONLY', standardText: null }) })) === 'CITATION_GRANULARITY',
  'section-only is CITATION_GRANULARITY');
assert(causeOf(input({ applicability: 'UNCERTAIN' })) === 'APPLICABILITY_EVIDENCE',
  'HARD: an unestablished trigger is APPLICABILITY_EVIDENCE, never a governance bucket');
assert(causeOf(input({ legacyText: 'different' })) === 'CORPUS_CONTENT', 'differing text is CORPUS_CONTENT');
assert(causeOf(input({ legacyText: 'One or more  methods of machine guarding shall be provided' })) === 'PRESENTATION_ONLY',
  'a difference of internal whitespace and terminal punctuation only is PRESENTATION_ONLY');
assert(causeOf(input()) === 'NONE', 'an exact match has no root cause');
assert(ALL_ROOT_CAUSES.includes(causeOf(input({ legacyJurisdiction: 'MSHA/x', governedJurisdiction: 'OSHA/y' }))),
  'a jurisdiction difference maps into the declared bucket set');

// ============================================================ Part 5 -- privacy
section('Part 5 — the event carries no customer content');

const record = buildShadowComparisonRecord({
  ...input({ applicability: 'UNCERTAIN' }),
  correlationId: 'trace-abc123',
  findingKey: 'machine-guarding',
  mode: 'SHADOW',
  releaseManifestChecksum: '14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b',
  fallbackState: 'LEGACY_TEXT_UNVERIFIED',
  hazardFamily: 'machine_guarding',
  jurisdiction: 'osha_general_industry',
  latencyMs: 2,
  customerOutputUnchanged: true,
});

assert(record.schemaVersion === SHADOW_EVENT_SCHEMA_VERSION, 'the event is schema-versioned');
assert(Object.keys(record).every(k => SHADOW_EVENT_ALLOWED_FIELDS.includes(k)),
  'HARD: every field on a real event is on the allowlist');
assert(SHADOW_EVENT_ALLOWED_FIELDS.every(f => f in record),
  'the allowlist has no dead entries — every allowed field is actually emitted');

let privacyThrew = false;
try { assertShadowEventPrivacySafe(record as unknown as Record<string, unknown>); } catch { privacyThrew = true; }
assert(!privacyThrew, 'a real event passes the privacy guard');

const serialized = JSON.stringify(record);
assert(!serialized.includes('One or more methods'),
  'HARD: the legacy text does NOT appear in the serialized event');
assert(!serialized.includes('machine guarding shall be provided'),
  'HARD: the governed text does NOT appear in the serialized event');
assert(record.legacyTextDigest !== null && record.governedTextDigest !== null,
  'text is represented by digests instead');
assert(record.legacyTextDigest === record.governedTextDigest,
  'identical text produces identical digests (so equivalence is checkable without the text)');

for (const [label, bad] of [
  ['an unexpected field', { ...record, observationText: 'worker fell from ladder' }],
  ['an email address', { ...record, correlationId: 'someone@example.com' }],
  ['an over-long value', { ...record, requestedCitation: 'x'.repeat(201) }],
  ['a non-boolean dimension', { ...record, dimensions: { ...record.dimensions, contentDiffers: 'yes' } }],
] as Array<[string, Record<string, unknown>]>) {
  let threw = false;
  try { assertShadowEventPrivacySafe(bad); } catch { threw = true; }
  assert(threw, `HARD: the privacy guard rejects ${label}`);
}

// ============================================================ Part 6 -- idempotency
section('Part 6 — event keys are deterministic and idempotent');

const keyArgs = { correlationId: 'trace-1', findingKey: 'f1', citation: '29 CFR 1910.212', releaseId: 'r1' };
assert(shadowEventKey(keyArgs) === shadowEventKey(keyArgs), 'the same inputs produce the same key');
assert(shadowEventKey(keyArgs) !== shadowEventKey({ ...keyArgs, citation: '29 CFR 1910.219' }),
  'a different citation produces a different key');
assert(shadowEventKey(keyArgs) !== shadowEventKey({ ...keyArgs, findingKey: 'f2' }),
  'a different finding produces a different key');
assert(shadowEventKey(keyArgs) !== shadowEventKey({ ...keyArgs, releaseId: 'r2' }),
  'a different release produces a different key');
assert(shadowEventKey(keyArgs) !== shadowEventKey({ ...keyArgs, correlationId: 'trace-2' }),
  'a different analysis produces a different key');
assert(shadowEventKey({ ...keyArgs, findingKey: null }) === shadowEventKey({ ...keyArgs, findingKey: null }),
  'a null finding key is stable');
// A retry of the SAME analysis must reproduce the same key, so retries deduplicate rather than
// double-count. This is the property Phase 10 depends on.
const retryA = buildShadowComparisonRecord({ ...input(), correlationId: 'trace-9', findingKey: 'f',
  mode: 'SHADOW', fallbackState: 'LEGACY_TEXT_UNVERIFIED', customerOutputUnchanged: true });
const retryB = buildShadowComparisonRecord({ ...input(), correlationId: 'trace-9', findingKey: 'f',
  mode: 'SHADOW', fallbackState: 'LEGACY_TEXT_UNVERIFIED', customerOutputUnchanged: true });
assert(retryA.eventKey === retryB.eventKey,
  'HARD: a retried analysis reproduces the SAME event key — retries deduplicate, they do not double-count');

// ============================================================ Part 7 -- one engine
section('Part 7 — the KG-4A vocabulary is a projection, not a second engine');

const LEGACY_NAMES = new Set(['EXACT_MATCH', 'GOVERNED_APPROVED_EQUIVALENT', 'CITATION_DIFFERENCE',
  'GRANULARITY_DIFFERENCE', 'CONTENT_DIFFERENCE', 'MISSING_GOVERNED_RECORD',
  'UNAPPROVED_GOVERNED_RECORD', 'APPLICABILITY_DISAGREEMENT', 'RESOLVER_FAILURE']);
for (const category of ALL_MISMATCH_CATEGORIES) {
  const projected = toLegacyMismatchCategory(category);
  assert(LEGACY_NAMES.has(projected), `${category} projects onto a KG-4A name (${projected})`);
}
assert(new Set(ALL_MISMATCH_CATEGORIES.map(toLegacyMismatchCategory)).size === 9,
  'HARD: the projection covers all nine KG-4A names — no KG-4A category became unreachable');

// ============================================================ Part 8 -- regime canonicalisation
section('Part 8 — jurisdiction comparison uses ONE canonical vocabulary');

// This exists because the first KG-4B corpus run compared raw strings and reported
// JURISDICTION_DIFFERENCE -- a BLOCKING category -- on 54 of 83 comparisons, including
// `29 CFR 1910.212(a)(1)` under OSHA General Industry. Three vocabularies are genuinely in use.
const REGIME_CASES: Array<[unknown, string | null]> = [
  ['general_industry', 'osha_general_industry'],
  ['osha-general-industry', 'osha_general_industry'],
  ['OSHA/general_industry', 'osha_general_industry'],
  ['construction', 'osha_construction'],
  ['osha-construction', 'osha_construction'],
  ['OSHA/construction', 'osha_construction'],
  ['msha', 'msha'],
  ['MSHA/mining', 'msha'],
  ['mining', 'msha'],
  ['unknown', null],
  ['', null],
  [null, null],
  [undefined, null],
  ['something-else', null],
];
for (const [raw, expected] of REGIME_CASES) {
  const actual = canonicalizeRegime(raw);
  assert(actual === expected, `canonicalizeRegime(${JSON.stringify(raw)}) = ${expected} (got ${actual})`);
}
assert(!jurisdictionsDisagree('general_industry', 'OSHA/general_industry'),
  'HARD: the SAME regime in two different vocabularies is NOT a disagreement');
assert(!jurisdictionsDisagree('osha-construction', 'OSHA/construction'),
  'HARD: hyphenated and slashed construction agree');
assert(!jurisdictionsDisagree('msha', 'MSHA/mining'),
  'HARD: msha and MSHA/mining agree');
assert(jurisdictionsDisagree('msha', 'OSHA/general_industry'),
  'a genuine regime disagreement IS still detected');
assert(!jurisdictionsDisagree('unknown', 'OSHA/general_industry'),
  'HARD: an unestablished regime on either side is NOT a disagreement');
assert(!jurisdictionsDisagree(null, null), 'two unknowns are not a disagreement');

// ============================================================ emit
const emitIndex = process.argv.indexOf('--emit');
if (emitIndex > -1 && process.argv[emitIndex + 1]) {
  writeFileSync(process.argv[emitIndex + 1], JSON.stringify({
    schemaVersion: SHADOW_EVENT_SCHEMA_VERSION,
    categories: ALL_MISMATCH_CATEGORIES,
    severities: ALL_SEVERITIES,
    rootCauses: ALL_ROOT_CAUSES,
    allowedEventFields: SHADOW_EVENT_ALLOWED_FIELDS,
    severityByCategory: Object.fromEntries(
      ALL_MISMATCH_CATEGORIES.map(c => [c, severityFor(c, noDimensions)])),
    legacyProjection: Object.fromEntries(
      ALL_MISMATCH_CATEGORIES.map(c => [c, toLegacyMismatchCategory(c)])),
    exampleEvent: record,
  }, null, 2));
  console.log(`\ntaxonomy written: ${process.argv[emitIndex + 1]}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
