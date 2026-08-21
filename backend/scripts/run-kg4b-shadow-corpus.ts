/**
 * KG-4B (Phases 3, 4, 5, 6) -- the isolated shadow corpus run and the customer-output invariance
 * oracle.
 *
 * THE DESIGN, AND WHY IT IS COMPARATIVE.
 *
 * The only way to prove SHADOW does not change what a customer receives is to look at what two
 * customers actually receive. So this runs against ONE server, ONE database and ONE active release,
 * with `GOVERNED_CUTOVER_MODE=SHADOW` and exactly ONE account on the allowlist:
 *
 *     legacy account   -> not allowlisted -> LEGACY path, no governed resolution at all
 *     shadow account   -> allowlisted     -> SHADOW path, governed resolver runs, output must match
 *
 * VOLATILITY IS MEASURED, NOT ASSUMED. A HazLenz response carries ids, timestamps and timing fields
 * that legitimately differ between two identical requests. Rather than hand-waving a list of
 * "fields to ignore", the runner issues the legacy request TWICE and derives the volatile field set
 * empirically from that pair. Only fields that already differ between two LEGACY runs are excluded
 * from the LEGACY-vs-SHADOW comparison. Anything stable in LEGACY must be identical in SHADOW.
 *
 * THE CORPUS. 33 cases come from the tracked, hash-verified gold set -- read-only, never modified --
 * so the run exercises the same observations the protected baseline uses. KG-4B fixtures are added
 * SEPARATELY for the shapes the gold set does not cover: multi-hazard, controlled/safe states,
 * ambiguity, parent/child competition, alternative compliance, and unestablished jurisdiction.
 *
 * DATABASE: this script MUTATES nothing. It reads the gold set, issues HTTP requests, and writes
 * JSONL artifacts. The disposable database it talks to is owned by the KG-4B environment setup.
 *
 * Usage:
 *   API_BASE_URL=http://127.0.0.1:4340 SERVER_LOG=<path> OUT_DIR=<path> \
 *   SHADOW_EMAIL=… LEGACY_EMAIL=… PASSWORD=… npx ts-node scripts/run-kg4b-shadow-corpus.ts
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4340';
const PASSWORD = process.env.PASSWORD || 'KG4bTestPass!234';
const SHADOW_EMAIL = process.env.SHADOW_EMAIL || 'kg4b-shadow@example.com';
const LEGACY_EMAIL = process.env.LEGACY_EMAIL || 'kg4b-legacy@example.com';
const SERVER_LOG = process.env.SERVER_LOG || '';
const OUT_DIR = process.env.OUT_DIR || '.';
const LIMIT = Number(process.env.CASE_LIMIT || 0);

const TRACKED_GOLD_SET = join(__dirname, '..', '..',
  'verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts');
const EXPECTED_GOLD_SET_SHA256 =
  '93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3';

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }

// ---------------------------------------------------------------- the corpus

interface CorpusCase {
  id: string;
  source: 'GOLD_SET' | 'KG4B_FIXTURE';
  area: string;
  regime: 'osha_general_industry' | 'osha_construction' | 'msha' | 'unknown';
  observation: string;
  shape: string;
}

/** Read-only and hash-verified. This runner never writes to the protected gold set. */
function loadGoldSet(): CorpusCase[] {
  const source = readFileSync(TRACKED_GOLD_SET, 'utf8');
  const sha = createHash('sha256').update(source).digest('hex');
  if (sha !== EXPECTED_GOLD_SET_SHA256) {
    throw new Error(`Protected gold set hash mismatch: ${sha}`);
  }
  const cases: CorpusCase[] = [];
  // Observations are single- OR double-quoted in the gold set: `GI-NOISE-01` uses double quotes
  // because its text contains an apostrophe. Matching only single quotes silently dropped it, which
  // is why the capture count is asserted against the declared id count below.
  const blockRe = new RegExp(
    "id:\\s*'([^']+)',\\s*area:\\s*'([^']+)',\\s*regime:\\s*'([^']+)',\\s*\\n\\s*observation:\\s*" +
    "(?:'((?:[^'\\\\]|\\\\.)*)'|\"((?:[^\"\\\\]|\\\\.)*)\")",
    'g');
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(source)) !== null) {
    const raw = match[4] !== undefined ? match[4] : match[5];
    cases.push({
      id: match[1], source: 'GOLD_SET', area: match[2],
      regime: match[3] as CorpusCase['regime'],
      observation: raw.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\'),
      shape: /-NEG$/.test(match[1]) ? 'negative_control' : 'positive_hazard',
    });
  }
  // Every declared case must be captured. A silent parse gap would understate coverage and could
  // quietly drop the very family a reader is looking for.
  const declared = (source.match(/^\s{4}id:\s*'/gm) || []).length;
  if (cases.length !== declared) {
    throw new Error(`Gold-set parse gap: ${cases.length} captured of ${declared} declared.`);
  }
  return cases;
}

/**
 * KG-4B fixtures. Added SEPARATELY from the gold set, and deliberately covering the shapes the gold
 * set does not: several hazards in one observation, an affirmatively controlled state, genuine
 * ambiguity, section-vs-paragraph competition, an alternative compliance method that satisfies the
 * rule, and an observation whose regime is not established.
 *
 * These are observations a real inspector could plausibly write. None is engineered to force an
 * unused expert rule into the corpus -- the 137 declared-but-unemitted citations remain a separate
 * backlog, and manufacturing traffic to inflate coverage would make the corpus dishonest.
 */
const KG4B_FIXTURES: CorpusCase[] = [
  { id: 'KG4B-MULTI-01', source: 'KG4B_FIXTURE', regime: 'osha_general_industry',
    area: 'Multi-hazard: guarding + energy control in one observation', shape: 'multi_hazard',
    observation: 'During the line walk the point-of-operation guard on the press brake was missing while the machine was running, and a maintenance technician was reaching into the die area to clear a jam with no lockout applied and the disconnect still closed.' },
  { id: 'KG4B-MULTI-02', source: 'KG4B_FIXTURE', regime: 'osha_construction',
    area: 'Multi-hazard: fall protection + excavation', shape: 'multi_hazard',
    observation: 'Two workers were on an unguarded scaffold platform about 18 feet up with no personal fall arrest connected, and immediately below them a trench roughly seven feet deep in soft clay had no shoring, sloping or trench box in place while a third worker was inside it.' },
  { id: 'KG4B-CONTROLLED-01', source: 'KG4B_FIXTURE', regime: 'osha_general_industry',
    area: 'Affirmatively controlled state (safe-state control)', shape: 'controlled_state',
    observation: 'The conveyor tail pulley guard is bolted in place and intact, the drive is locked out with the technician’s personal lock and tag applied, and a zero-energy verification was completed and recorded before work began.' },
  { id: 'KG4B-AMBIG-01', source: 'KG4B_FIXTURE', regime: 'unknown',
    area: 'Ambiguous observation, regime not established', shape: 'ambiguous_unknown_jurisdiction',
    observation: 'Something looked unsafe near the equipment in the back area and it should probably be looked at by someone.' },
  { id: 'KG4B-AMBIG-02', source: 'KG4B_FIXTURE', regime: 'unknown',
    area: 'Hazard described without jurisdiction cues', shape: 'ambiguous_unknown_jurisdiction',
    observation: 'A guard was missing from a rotating shaft next to where an operator stands.' },
  { id: 'KG4B-PARENT-01', source: 'KG4B_FIXTURE', regime: 'osha_general_industry',
    area: 'Parent/child competition: electrical section vs paragraph', shape: 'parent_child',
    observation: 'Electrical equipment in the mixing room shows deteriorated insulation and a conductor is exposed where employees pass; the panel cover is missing and the circuit was not examined before the shift.' },
  { id: 'KG4B-ALTCOMP-01', source: 'KG4B_FIXTURE', regime: 'msha',
    area: 'Alternative compliance satisfies the rule (observer posted)', shape: 'alternative_compliance',
    observation: 'A haul truck was backing toward the stockpile at the quarry with an obstructed view to the rear. The backup alarm was not audible, but a trained spotter was posted at the rear signalling the operator throughout the movement.' },
  { id: 'KG4B-ALTCOMP-02', source: 'KG4B_FIXTURE', regime: 'msha',
    area: 'Evidence-unknown trigger: rear visibility unstated', shape: 'evidence_unknown',
    observation: 'A haul truck was backing near the stockpile at the quarry and no backup alarm was heard. No spotter was observed.' },
  { id: 'KG4B-MSHA-GUARD-01', source: 'KG4B_FIXTURE', regime: 'msha',
    area: 'MSHA moving-part guarding', shape: 'positive_hazard',
    observation: 'At the crusher the head pulley guard has been removed and the drive belt and pinch point are exposed where miners walk past to reach the control booth.' },
  { id: 'KG4B-NEG-01', source: 'KG4B_FIXTURE', regime: 'osha_construction',
    area: 'Negative control: fall protection in place', shape: 'negative_control',
    observation: 'Workers on the leading edge at 20 feet were each tied off to a properly rated anchor with a personal fall arrest system inspected that morning, and guardrails were installed along the open side.' },
  { id: 'KG4B-OVERLAP-01', source: 'KG4B_FIXTURE', regime: 'osha_general_industry',
    area: 'Overlapping-family vocabulary: noise vs machine guarding', shape: 'overlapping_vocabulary',
    observation: 'The grinding station is extremely loud through the whole shift and operators are not wearing hearing protection; the wheel guard is also cracked and no longer covers the spindle.' },
  { id: 'KG4B-MIXED-01', source: 'KG4B_FIXTURE', regime: 'osha_general_industry',
    area: 'Mixed governed states across findings in one observation', shape: 'mixed_provenance',
    observation: 'In the finishing room the machine guard is missing from the buffer, containers of solvent are unlabelled on the bench, and the marked exit route is blocked by stacked pallets.' },
];

// ---------------------------------------------------------------- HTTP

/**
 * Request pacing for the classify throttle.
 *
 * `/safescope-v2/classify` is throttled at 30 requests / 60s. This runner issues THREE calls per
 * case (two LEGACY to measure volatility, one SHADOW), so an unpaced 42-case run exhausts the
 * window after ten cases and every subsequent response is a 429.
 *
 * That is not a hypothetical: the first KG-4B run did exactly this, and because BOTH sides received
 * an identical 429 the invariance assertions passed VACUOUSLY on 32 of 42 cases. The fix is to pace
 * within the limit and to refuse a 429 outright -- never to raise the limit, which would be
 * weakening a production control to make a verification convenient.
 */
const RATE_LIMIT = 28;           // headroom under the documented 30/60s
const RATE_WINDOW_MS = 60_000;
const requestTimes: number[] = [];
async function paceClassify(): Promise<void> {
  const now = Date.now();
  while (requestTimes.length && now - requestTimes[0] > RATE_WINDOW_MS) requestTimes.shift();
  if (requestTimes.length >= RATE_LIMIT) {
    const waitMs = RATE_WINDOW_MS - (now - requestTimes[0]) + 500;
    console.log(`      pacing: ${Math.ceil(waitMs / 1000)}s to stay inside the classify throttle`);
    await new Promise(r => setTimeout(r, waitMs));
    const after = Date.now();
    while (requestTimes.length && after - requestTimes[0] > RATE_WINDOW_MS) requestTimes.shift();
  }
  requestTimes.push(Date.now());
}

async function call(token: string | null, method: string, path: string, body?: unknown) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 300) }; }
  return { status: response.status, body: json };
}

/** Throttle-tolerant. The 5/60s limit is infrastructure, not a KG-4B result; it is waited out. */
async function login(email: string): Promise<string | null> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await call(null, 'POST', '/auth/login', { email, password: PASSWORD });
    const token = response.body?.accessToken || response.body?.token;
    if (token) return token;
    if (response.status !== 429) { console.log(`note  login ${email} -> ${response.status}`); return null; }
    await new Promise(r => setTimeout(r, 13_000));
  }
  return null;
}

// ---------------------------------------------------------------- the invariance oracle

/** Flattens an object to `path -> scalar`, so differences can be reported by exact path. */
function flatten(value: unknown, prefix = '', out: Record<string, unknown> = {}): Record<string, unknown> {
  if (value === null || typeof value !== 'object') { out[prefix || '$'] = value; return out; }
  if (Array.isArray(value)) {
    out[`${prefix}.__length`] = value.length;
    value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out));
    return out;
  }
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    flatten(nested, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

/**
 * Field paths that differ between two identical LEGACY requests, i.e. genuinely volatile. Derived
 * per case rather than hard-coded, so a newly-volatile field cannot silently be excused.
 */
function volatilePaths(a: Record<string, unknown>, b: Record<string, unknown>): Set<string> {
  const paths = new Set<string>();
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) paths.add(key);
  }
  return paths;
}

/**
 * The KG-4B governed fields. These exist ONLY on a governed/shadow payload and are internal
 * telemetry, so they are excluded from the customer comparison by name -- with the separate,
 * stronger assertion that they must be ABSENT from a SHADOW payload entirely.
 */
const GOVERNED_TELEMETRY_KEYS = [
  'governedDeliveryState', 'governedFallbackReason', 'governedTextUnavailable', 'knowledgeReleaseId',
];
const isGovernedTelemetry = (path: string) =>
  GOVERNED_TELEMETRY_KEYS.some(k => path === k || path.endsWith(`.${k}`));

interface CaseResult {
  caseId: string; source: string; area: string; regime: string; shape: string;
  legacyCitations: string[]; shadowCitations: string[];
  customerOutputIdentical: boolean;
  differingPaths: string[];
  volatilePathCount: number;
  shadowCarriedGovernedKeys: boolean;
  legacyStatus: number; shadowStatus: number;
  findingCount: number;
  shadowRecordCount: number;
}

async function main() {
  section('Phase 4 — the isolated corpus');
  const gold = loadGoldSet();
  assert(gold.length > 0, `protected gold set loaded and hash-verified (${gold.length} cases, sha256 93184abc…)`);
  let corpus = [...gold, ...KG4B_FIXTURES];
  if (LIMIT > 0) corpus = corpus.slice(0, LIMIT);
  console.log(`      corpus: ${gold.length} gold-set + ${KG4B_FIXTURES.length} KG-4B fixtures = ${corpus.length} cases`);
  const regimes = new Set(corpus.map(c => c.regime));
  assert(regimes.has('osha_general_industry') && regimes.has('osha_construction') && regimes.has('msha'),
    `corpus covers OSHA GI, OSHA Construction and MSHA (${[...regimes].join(', ')})`);
  assert(regimes.has('unknown'), 'corpus includes observations with an unestablished regime');
  const shapes = new Set(corpus.map(c => c.shape));
  assert(shapes.size >= 8, `corpus covers ${shapes.size} distinct observation shapes: ${[...shapes].join(', ')}`);

  const shadowToken = await login(SHADOW_EMAIL);
  const legacyToken = await login(LEGACY_EMAIL);
  assert(Boolean(shadowToken) && Boolean(legacyToken), 'both accounts authenticate');
  if (!shadowToken || !legacyToken) { console.log(`\n${passed} passed, ${failed} failed`); process.exit(1); }

  const logSizeBefore = SERVER_LOG && existsSync(SERVER_LOG) ? readFileSync(SERVER_LOG, 'utf8').length : 0;

  section('Phase 3 — customer-output invariance, measured per case');
  const results: CaseResult[] = [];
  for (const testCase of corpus) {
    const scopes = testCase.regime === 'unknown' ? undefined : [testCase.regime.replace(/^osha_/, '') === 'general_industry' ? 'general_industry' : testCase.regime.replace(/^osha_/, '')];
    const payload: Record<string, unknown> = { text: testCase.observation };
    if (testCase.regime === 'msha') payload.scopes = ['msha'];
    else if (testCase.regime === 'osha_construction') payload.scopes = ['construction'];
    else if (testCase.regime === 'osha_general_industry') payload.scopes = ['general_industry'];

    // Two LEGACY runs to measure volatility, then one SHADOW run to compare against.
    await paceClassify();
    const legacy1 = await call(legacyToken, 'POST', '/safescope-v2/classify', payload);
    await paceClassify();
    const legacy2 = await call(legacyToken, 'POST', '/safescope-v2/classify', payload);
    await paceClassify();
    const shadow = await call(shadowToken, 'POST', '/safescope-v2/classify', payload);

    // A throttled response is NOT a comparison. Two identical 429s would satisfy every invariance
    // assertion below while proving nothing at all, so the run fails loudly instead.
    for (const [label, response] of [['legacy#1', legacy1], ['legacy#2', legacy2], ['shadow', shadow]] as const) {
      if (response.status === 429) {
        console.log(`FAIL  [${testCase.id}] ${label} was THROTTLED (429). A throttled response is not a comparison.`);
        failed++;
      }
    }
    if (legacy1.status === 429 || legacy2.status === 429 || shadow.status === 429) continue;

    const flatL1 = flatten(legacy1.body);
    const flatL2 = flatten(legacy2.body);
    const flatS = flatten(shadow.body);
    const volatile = volatilePaths(flatL1, flatL2);

    const differing: string[] = [];
    for (const key of new Set([...Object.keys(flatL1), ...Object.keys(flatS)])) {
      if (volatile.has(key)) continue;
      if (isGovernedTelemetry(key)) continue;
      if (JSON.stringify(flatL1[key]) !== JSON.stringify(flatS[key])) differing.push(key);
    }

    const shadowGovernedKeys = Object.keys(flatS).some(isGovernedTelemetry);
    const citationsOf = (body: any): string[] =>
      (body?.standardDecisions || []).map((d: any) => String(d?.citation || '')).filter(Boolean);

    const result: CaseResult = {
      caseId: testCase.id, source: testCase.source, area: testCase.area,
      regime: testCase.regime, shape: testCase.shape,
      legacyCitations: citationsOf(legacy1.body),
      shadowCitations: citationsOf(shadow.body),
      customerOutputIdentical: differing.length === 0,
      differingPaths: differing.slice(0, 12),
      volatilePathCount: volatile.size,
      shadowCarriedGovernedKeys: shadowGovernedKeys,
      legacyStatus: legacy1.status, shadowStatus: shadow.status,
      findingCount: (legacy1.body?.multiHazardDecomposition?.hazards || []).length,
      shadowRecordCount: 0,
    };
    results.push(result);

    assert(result.customerOutputIdentical,
      `[${testCase.id}] SHADOW customer output identical to LEGACY` +
      (differing.length ? ` (differs at: ${differing.slice(0, 4).join(', ')})` : ''));
    assert(!shadowGovernedKeys,
      `[${testCase.id}] HARD: the SHADOW payload carries NO governed telemetry keys`);
    assert(JSON.stringify(result.legacyCitations) === JSON.stringify(result.shadowCitations),
      `[${testCase.id}] citation set and ORDER identical`);
  }

  // ---------------------------------------------------------------- collect the shadow corpus
  section('Phase 9 — the shadow mismatch corpus');
  let records: any[] = [];
  if (SERVER_LOG && existsSync(SERVER_LOG)) {
    const tail = readFileSync(SERVER_LOG, 'utf8').slice(logSizeBefore);
    for (const line of tail.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('{') || !trimmed.includes('kg4b.shadow-comparison.v1')) continue;
      try { records.push(JSON.parse(trimmed)); } catch { /* partial line */ }
    }
  }
  const casesWithCitations = results.filter(r => r.legacyCitations.length > 0).length;
  const totalComparisons = results.reduce((sum, r) => sum + r.legacyCitations.length, 0);
  assert(casesWithCitations >= Math.floor(results.length * 0.4),
    `HARD: the run is not vacuous — ${casesWithCitations} of ${results.length} cases produced citations ` +
    `(${totalComparisons} citation comparisons)`);
  assert(results.every(r => r.legacyStatus === 200 || r.legacyStatus === 201),
    `HARD: every compared case returned a real analysis, none throttled or errored`);
  assert(records.length > 0, `collected ${records.length} shadow comparison records from the isolated run`);
  assert(records.every(r => r.customerOutputUnchanged === true),
    'HARD: every shadow record asserts the customer output was unchanged');
  assert(records.every(r => r.mode === 'SHADOW'), 'every record is a SHADOW record');
  assert(new Set(records.map(r => r.releaseId)).size === 1,
    `HARD: every record names the SAME release (${[...new Set(records.map(r => r.releaseId))].join(', ')})`);
  assert(new Set(records.map(r => r.releaseManifestChecksum)).size === 1,
    'every record names the same manifest identity — the corpus is tied to one exact corpus state');

  // Phase 10. A correlation id that is not unique per analysis silently MERGES observations that
  // should be counted apart -- the first KG-4B run collapsed all 43 analyses into one and reported
  // 40 phantom duplicates. Both properties are asserted here so the analytics can be trusted.
  const correlations = new Set(records.map(r => r.correlationId));
  // An analysis that emits no comparison (a negative control, an ambiguous observation with no
  // candidate) contributes no correlation id, so the count is bounded by the number of analyses
  // rather than equal to it. What must NOT happen is two analyses SHARING an id, which is what
  // collapsed the first run -- and that is what the two assertions below actually prove.
  assert(correlations.size > 1 && correlations.size <= results.length,
    `correlation ids are per-analysis: ${correlations.size} ids across ${results.length} analyses ` +
    `(${results.length - correlations.size} analyses emitted no comparison)`);
  assert(correlations.size >= 2 * (results.length / 3),
    `HARD: ids are not collapsing — ${correlations.size} distinct ids, not one shared constant`);
  assert(new Set(records.map(r => r.eventKey)).size === records.length,
    `HARD: every event key is unique — no analysis double-counts or merges with another ` +
    `(${new Set(records.map(r => r.eventKey)).size} keys for ${records.length} events)`);
  const perAnalysisOk = [...correlations].every(id => {
    const forId = records.filter(r => r.correlationId === id);
    return forId.length === new Set(forId.map(r => r.requestedCitation)).size;
  });
  assert(perAnalysisOk,
    'HARD: cardinality is one event per (analysis x distinct citation) — memoisation holds');

  writeFileSync(join(OUT_DIR, 'shadow-events.jsonl'), records.map(r => JSON.stringify(r)).join('\n') + '\n');
  writeFileSync(join(OUT_DIR, 'case-results.json'), JSON.stringify({
    generatedBy: 'run-kg4b-shadow-corpus.ts',
    api: API,
    goldSetCases: gold.length, kg4bFixtures: KG4B_FIXTURES.length, totalCases: corpus.length,
    regimes: [...regimes], shapes: [...shapes],
    invariance: {
      casesCompared: results.length,
      identical: results.filter(r => r.customerOutputIdentical).length,
      shadowCarriedGovernedKeys: results.filter(r => r.shadowCarriedGovernedKeys).length,
    },
    results,
  }, null, 2));
  console.log(`      wrote shadow-events.jsonl (${records.length}) and case-results.json (${results.length})`);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
