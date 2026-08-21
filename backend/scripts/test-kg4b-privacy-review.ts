/**
 * KG-4B (Phase 11) -- the privacy review, performed against ACTUAL SERIALIZED EVENTS.
 *
 * "Privacy-safe by schema" is a claim about intent. This suite makes it a claim about evidence: it
 * reads the JSONL corpus the isolated run actually produced and searches it for the real observation
 * text, the real account emails, the real credentials and a set of PII markers -- the specific
 * strings that WERE present in the requests that generated those events. If any of them appear, the
 * corpus is not privacy-safe, regardless of what the schema says.
 *
 * It also produces the field-by-field classification Phase 11 requires, so every field on the event
 * is deliberately accounted for as required / useful / unnecessary / sensitive / prohibited rather
 * than merely present.
 *
 * Read-only.
 *
 * Usage:
 *   CORPUS_DIR=<dir> [REPORT_OUT=<file>] npx ts-node scripts/test-kg4b-privacy-review.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  SHADOW_EVENT_ALLOWED_FIELDS, assertShadowEventPrivacySafe,
} from '../src/standards/cutover/shadow-comparison';

const CORPUS_DIR = process.env.CORPUS_DIR || '.';
const REPORT_OUT = process.env.REPORT_OUT || '';

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }

type Classification = 'required' | 'useful' | 'unnecessary' | 'sensitive' | 'prohibited';

/**
 * The field-by-field review. Every field on the event is listed, with WHY it is carried and what it
 * would cost to drop it. Nothing is classified `sensitive` or `prohibited` -- if anything were, it
 * would not be on the allowlist.
 */
const FIELD_REVIEW: Record<string, { classification: Classification; rationale: string }> = {
  schemaVersion: { classification: 'required', rationale: 'An analyser must know which shape it is reading before it reads it.' },
  event: { classification: 'required', rationale: 'Distinguishes this event from the per-resolution event on the same stream.' },
  observedAt: { classification: 'required', rationale: 'Orders the corpus and bounds a retention window. Server clock; no user timing.' },
  correlationId: { classification: 'required', rationale: 'Groups the comparisons of ONE analysis. Server-generated UUID or trace id; carries no customer identity and cannot be supplied by a request.' },
  findingKey: { classification: 'useful', rationale: 'Attributes a comparison to a finding within the analysis. A hazard key or citation, never customer prose.' },
  eventKey: { classification: 'required', rationale: 'Deterministic idempotency key. Without it a retry double-counts.' },
  mode: { classification: 'required', rationale: 'A comparison is only interpretable against the mode that produced it.' },
  releaseId: { classification: 'required', rationale: 'Which governed release answered. Public corpus identifier.' },
  releaseManifestChecksum: { classification: 'required', rationale: 'Ties the corpus to an exact corpus state, so findings can be reproduced without the database that produced them.' },
  requestedCitation: { classification: 'required', rationale: 'A public regulatory identifier. The whole subject of the comparison.' },
  legacyCitation: { classification: 'required', rationale: 'What the customer actually received; the other half of the comparison.' },
  governedResolvedCitation: { classification: 'required', rationale: 'Makes the no-substitution invariant checkable from the corpus alone.' },
  applicability: { classification: 'required', rationale: 'The applicability axis, which must stay separable from backing. Categorical.' },
  legacyBackingState: { classification: 'required', rationale: 'The customer-visible backing claim before governance.' },
  governedBackingState: { classification: 'required', rationale: 'The governed answer. Categorical.' },
  approvalContractVersion: { classification: 'useful', rationale: 'Lets a corpus be re-read after the approval contract changes version.' },
  approvalDigest: { classification: 'useful', rationale: 'Approval identity. A digest, not content.' },
  fallbackState: { classification: 'required', rationale: 'What the customer would have been shown in a governed mode.' },
  mismatch: { classification: 'required', rationale: 'The primary analytical dimension.' },
  dimensions: { classification: 'required', rationale: 'Secondary dimensions, so a multi-dimensional mismatch loses nothing. All booleans.' },
  severity: { classification: 'required', rationale: 'Drives the cutover decision; blocking cases are listed individually.' },
  rootCause: { classification: 'required', rationale: 'Makes the corpus actionable by naming who owns the remedy.' },
  resolverHealth: { classification: 'required', rationale: 'Separates "we do not know" from "there is none".' },
  legacyTextDigest: { classification: 'required', rationale: 'Content EQUALITY without content. Comparing bodies is the whole point; carrying them is not.' },
  governedTextDigest: { classification: 'required', rationale: 'As above, for the governed side.' },
  hazardFamily: { classification: 'useful', rationale: 'Aggregation by family. A taxonomy label from the engine, not customer text.' },
  jurisdiction: { classification: 'useful', rationale: 'Aggregation by regime, and the jurisdiction-disagreement dimension. A regime name.' },
  latencyMs: { classification: 'useful', rationale: 'Overhead measurement. A duration, not a timestamp of user behaviour.' },
  customerOutputUnchanged: { classification: 'required', rationale: 'The proof obligation carried on every event.' },
};

/**
 * Strings that WERE present in the requests that produced this corpus. Finding any of them in the
 * serialized events would mean customer content leaked. These are the real values, not placeholders.
 */
const MUST_NOT_APPEAR: Array<[string, string]> = [
  ['observation fragment (punch press)', 'point-of-operation guard on the punch press'],
  ['observation fragment (haul truck)', 'backing toward the stockpile'],
  ['observation fragment (scaffold)', 'unguarded scaffold platform'],
  ['observation fragment (solvent)', 'containers of solvent are unlabelled'],
  ['observation fragment (trench)', 'no shoring, sloping or trench box'],
  ['shadow account email', 'kg4b-shadow@example.com'],
  ['legacy account email', 'kg4b-legacy@example.com'],
  ['example.com domain', 'example.com'],
  ['test password', 'KG4bTestPass!234'],
  ['JWT secret', 'kg4b-disposable-verification-secret'],
  ['bearer token prefix', 'eyJhbGciOi'],
  ['regulatory body text', 'One or more methods of machine guarding'],
  ['regulatory body text (msha)', 'obstructed view to the rear'],
  ['reviewer identity', 'kg4b-shadow-reviewer'],
];

async function main() {
  const raw = readFileSync(join(CORPUS_DIR, 'shadow-events.jsonl'), 'utf8');
  const events: any[] = raw.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));

  section('Phase 11 — the field-by-field review is complete');
  assert(events.length > 0, `reviewing ${events.length} real serialized events`);
  const observedFields = new Set<string>();
  for (const event of events) for (const key of Object.keys(event)) observedFields.add(key);

  assert([...observedFields].every(f => f in FIELD_REVIEW),
    `HARD: every field present in a real event is classified (${[...observedFields].filter(f => !(f in FIELD_REVIEW)).join(', ') || 'all classified'})`);
  assert(SHADOW_EVENT_ALLOWED_FIELDS.every(f => f in FIELD_REVIEW),
    'every allowlisted field is classified — the review has no gaps');
  assert(Object.keys(FIELD_REVIEW).every(f => (SHADOW_EVENT_ALLOWED_FIELDS as readonly string[]).includes(f)),
    'the review has no entries for fields that cannot appear');

  const bad = Object.entries(FIELD_REVIEW)
    .filter(([, v]) => v.classification === 'sensitive' || v.classification === 'prohibited');
  assert(bad.length === 0,
    `HARD: no field is classified sensitive or prohibited (${bad.map(([k]) => k).join(', ') || 'none'})`);
  const unnecessary = Object.entries(FIELD_REVIEW).filter(([, v]) => v.classification === 'unnecessary');
  assert(unnecessary.length === 0,
    `no field is carried without a reason (${unnecessary.map(([k]) => k).join(', ') || 'none'})`);

  section('Phase 11 — the ACTUAL serialized corpus contains no customer content');
  for (const [label, needle] of MUST_NOT_APPEAR) {
    assert(!raw.includes(needle), `HARD: the corpus does not contain ${label}`);
  }
  // Structural sweeps rather than a fixed list.
  const emailMatches = raw.match(/[^\s"@]+@[^\s"@]+\.[a-z]{2,}/gi) || [];
  assert(emailMatches.length === 0, `HARD: no email-shaped string anywhere in the corpus (${emailMatches.slice(0, 3).join(', ')})`);
  const longStrings: Array<[string, number]> = [];
  for (const event of events) {
    for (const [key, value] of Object.entries(event)) {
      if (typeof value === 'string' && value.length > 200) longStrings.push([key, value.length]);
    }
  }
  assert(longStrings.length === 0,
    `HARD: no field exceeds 200 characters — prose cannot hide in an identifier (${longStrings.slice(0, 3).map(([k, n]) => `${k}:${n}`).join(', ')})`);

  // Every event passes the runtime guard, not just the ones the unit tests build.
  let guardFailures = 0;
  for (const event of events) {
    try { assertShadowEventPrivacySafe(event); } catch { guardFailures++; }
  }
  assert(guardFailures === 0, `HARD: all ${events.length} real events pass the runtime privacy guard`);

  // Digests must be digests, not truncated text.
  const digestValues = events.flatMap(e => [e.legacyTextDigest, e.governedTextDigest]).filter(Boolean);
  assert(digestValues.every((d: string) => /^[0-9a-f]{32}$/.test(d)),
    `HARD: every text digest is a 32-hex-character hash, never a text excerpt (${digestValues.length} digests)`);

  section('Phase 11 — the corpus is still analytically useful without the content');
  const withBothDigests = events.filter(e => e.legacyTextDigest && e.governedTextDigest);
  const agreeing = withBothDigests.filter(e => e.legacyTextDigest === e.governedTextDigest);
  assert(withBothDigests.length > 0,
    `${withBothDigests.length} events carry both digests, so content equality is still decidable`);
  assert(agreeing.length > 0,
    `HARD: ${agreeing.length}/${withBothDigests.length} agree by digest — equality is provable without ever storing the text`);

  const report = {
    generatedBy: 'test-kg4b-privacy-review.ts',
    eventsReviewed: events.length,
    fieldsObserved: [...observedFields].sort(),
    fieldReview: FIELD_REVIEW,
    classificationCounts: Object.values(FIELD_REVIEW).reduce((acc: Record<string, number>, v) => {
      acc[v.classification] = (acc[v.classification] || 0) + 1; return acc;
    }, {}),
    markersSearched: MUST_NOT_APPEAR.map(([label, needle]) => ({ label, found: raw.includes(needle) })),
    emailShapedStrings: emailMatches.length,
    fieldsOver200Chars: longStrings.length,
    runtimeGuardFailures: guardFailures,
    digestsChecked: digestValues.length,
    contentEqualityDecidable: { withBothDigests: withBothDigests.length, agreeing: agreeing.length },
  };
  if (REPORT_OUT) { writeFileSync(REPORT_OUT, JSON.stringify(report, null, 2)); console.log(`\nreport written: ${REPORT_OUT}`); }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
