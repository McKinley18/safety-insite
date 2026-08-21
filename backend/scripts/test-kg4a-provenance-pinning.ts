/**
 * KG-4A (Phases 7, 8, 14, 17) -- provenance propagation, mixed provenance, and rollback.
 *
 * PURE + A SUBCLASS PROBE. No corpus mutation and no owned database: everything here is a property
 * of the provenance contract and of `InspectionService.resolveKnowledgeReleaseId()`, which is
 * `protected` precisely so a deterministic fixture can exercise it (KG-1's own note).
 *
 * WHAT IT PROVES.
 *   Part 1  provenance by mode -- SHADOW never marks an analysis governed        (Phase 7)
 *   Part 2  the snapshot scanner: NULL unless the customer actually consumed      (Phase 7)
 *   Part 3  mixed provenance stays truthful per finding                          (Phase 8)
 *   Part 4  rollback changes future requests and never rewrites history          (Phase 14)
 *
 * Usage: npx ts-node scripts/test-kg4a-provenance-pinning.ts
 */
import {
  resolveAnalysisProvenance, describeGovernedRetrievalScoping, historicalProvenanceIsPreserved,
  type FindingProvenanceContribution,
} from '../src/standards/cutover/governed-provenance';
import { decideFallback } from '../src/standards/cutover/fallback-contract';
import type { GovernedReleasePin } from '../src/standards/cutover/governed-resolution';
import type { GovernedCutoverMode } from '../src/standards/cutover/cutover-mode';

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }

const RELEASE = 'federal-core-2026-08-20.5';
const pinFor = (mode: GovernedCutoverMode, releaseId: string | null = RELEASE): GovernedReleasePin => ({
  releaseId: mode === 'LEGACY' ? null : releaseId,
  pinnedAt: '2026-08-20T00:00:00.000Z',
  mode,
  reason: mode === 'LEGACY' ? 'MODE_IS_LEGACY' : releaseId ? 'PINNED_ACTIVE_RELEASE' : 'NO_ACTIVE_RELEASE',
});
const consumed = (key: string, eligible: boolean): FindingProvenanceContribution =>
  ({ findingKey: key, citation: key, governedProvenanceEligible: eligible });

// ============================================================ Part 1 -- provenance by mode
section('Part 1 — provenance by mode');

const allConsumed = [consumed('A', true), consumed('B', true)];

for (const mode of ['LEGACY', 'SHADOW'] as const) {
  const result = resolveAnalysisProvenance(pinFor(mode), allConsumed);
  assert(result.analysisKnowledgeReleaseId === null,
    `HARD: ${mode} records knowledgeReleaseId = NULL even when every finding "consumed"`);
  assert(Object.values(result.findingKnowledgeReleaseIds).every(v => v === null),
    `HARD: ${mode} records NULL on every finding`);
}
assert(/not consumption/.test(resolveAnalysisProvenance(pinFor('SHADOW'), allConsumed).reason),
  'the SHADOW reason states plainly that a background comparison is not consumption');

for (const mode of ['GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT'] as const) {
  const result = resolveAnalysisProvenance(pinFor(mode), allConsumed);
  assert(result.analysisKnowledgeReleaseId === RELEASE,
    `${mode} records the pinned release when findings consumed governed content`);
  assert(Object.values(result.findingKnowledgeReleaseIds).every(v => v === RELEASE),
    `${mode} records the release on every consuming finding`);
  assert(!result.mixed, `${mode} with all findings governed is not mixed`);
}

// The decisive case: governed mode, release pinned, nothing consumed.
const noneConsumed = [consumed('A', false), consumed('B', false)];
const inert = resolveAnalysisProvenance(pinFor('GOVERNED_WITH_FALLBACK'), noneConsumed);
assert(inert.analysisKnowledgeReleaseId === null,
  'HARD: a governed mode with a PINNED release but zero consumption still records NULL');
assert(/false provenance/.test(inert.reason),
  'the reason explains that naming a release with no consumption would be false provenance');

const noRelease = resolveAnalysisProvenance(pinFor('GOVERNED_STRICT', null), allConsumed);
assert(noRelease.analysisKnowledgeReleaseId === null,
  'HARD: governed mode with NO active release records NULL, never a fabricated id');

// Every fallback row that is NOT provenance-eligible must produce NULL, exhaustively.
const BACKINGS = ['APPROVED_EXACT', 'APPROVED_SECTION_ONLY', 'APPROVED_NO_TEXT', 'UNAPPROVED_RECORD',
  'NOT_IN_RELEASE', 'NO_ACTIVE_RELEASE', 'RESOLVER_UNAVAILABLE'] as const;
let rowChecks = 0;
for (const mode of ['LEGACY', 'SHADOW', 'GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT'] as const) {
  for (const applicability of ['SUPPORTED', 'UNCERTAIN', 'UNSUPPORTED'] as const) {
    for (const backing of BACKINGS) {
      const decision = decideFallback(mode, applicability, backing);
      const result = resolveAnalysisProvenance(pinFor(mode), [consumed('X', decision.governedProvenanceEligible)]);
      const expected = decision.governedProvenanceEligible && mode !== 'LEGACY' && mode !== 'SHADOW' ? RELEASE : null;
      if (result.analysisKnowledgeReleaseId === expected) rowChecks++;
      else console.log(`FAIL  ${mode}/${applicability}/${backing} expected ${expected}, got ${result.analysisKnowledgeReleaseId}`);
    }
  }
}
assert(rowChecks === 84, `HARD: provenance agrees with the fallback table on all 84 rows (got ${rowChecks})`);

// ============================================================ Part 2 -- the snapshot scanner
// Deferred into an async block: `resolveKnowledgeReleaseId` became asynchronous in KG-4A because
// the anti-spoofing gate must consult the server's own active-release pointer (Part 5).
//
// Every case here runs under the AMBIENT (default, un-configured) environment, and every one of
// them must yield NULL -- including the snapshots that carry a perfectly well-formed release id.
// That is the point: under default configuration the snapshot is not consulted at all, so a
// well-formed claim and a malformed one are equally powerless.
const { InspectionService } = require('../src/inspection/inspection.service');
class Probe extends InspectionService {
  constructor() { super(...([] as any)); }
  public probe(snapshot: unknown): Promise<string | null> { return (this as any).resolveKnowledgeReleaseId(snapshot, null); }
}
const probe = new Probe();

async function snapshotScannerChecks() {
  section('Part 2 — under default configuration NO snapshot can produce provenance');
  const cases: Array<[string, unknown]> = [
    ['an absent snapshot', undefined],
    ['an empty snapshot', {}],
    ['a LEGACY snapshot with no knowledgeReleaseId key anywhere', { standardDecisions: [{ citation: '29 CFR 1910.36' }] }],
    ['an explicit null finding-level id', { standardDecisions: [{ citation: 'x', knowledgeReleaseId: null }] }],
    ['a well-formed release id on a standard decision', { standardDecisions: [{ citation: 'x', knowledgeReleaseId: RELEASE }] }],
    ['a well-formed release id on primaryStandards', { primaryStandards: [{ knowledgeReleaseId: RELEASE }] }],
    ['a well-formed release id on suggestedStandards', { suggestedStandards: [{ knowledgeReleaseId: RELEASE }] }],
    ['a well-formed release id on a hazard candidate', { multiHazardDecomposition: { hazards: [{ standardCandidates: [{ knowledgeReleaseId: RELEASE }] }] } }],
    ['two distinct releases in one snapshot', { standardDecisions: [{ knowledgeReleaseId: RELEASE }, { knowledgeReleaseId: 'other' }] }],
    ['a whitespace release id', { standardDecisions: [{ knowledgeReleaseId: '   ' }] }],
    ['an over-long release id', { standardDecisions: [{ knowledgeReleaseId: 'x'.repeat(200) }] }],
    ['a malformed snapshot shape', { standardDecisions: 'not-an-array' }],
    ['a hostile deeply-nested shape', { multiHazardDecomposition: { hazards: 'nope' } }],
  ];
  for (const [label, snapshot] of cases) {
    let value: string | null = 'THREW';
    try { value = await probe.probe(snapshot); } catch { value = 'THREW'; }
    assert(value === null, `HARD: ${label} yields NULL under default configuration (got ${value})`);
  }
}

// ============================================================ Part 3 -- mixed provenance
section('Part 3 — a mixed analysis stays truthful per finding');

// The exact scenario from the KG-4A brief.
const mixedContributions = [
  consumed('A-approved-governed', decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', 'APPROVED_EXACT').governedProvenanceEligible),
  consumed('B-fell-back', decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', 'NOT_IN_RELEASE').governedProvenanceEligible),
  consumed('C-citation-only', decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', 'APPROVED_NO_TEXT').governedProvenanceEligible),
  consumed('D-evidence-uncertain', decideFallback('GOVERNED_WITH_FALLBACK', 'UNCERTAIN', 'UNAPPROVED_RECORD').governedProvenanceEligible),
];
const mixed = resolveAnalysisProvenance(pinFor('GOVERNED_WITH_FALLBACK'), mixedContributions);

assert(mixed.analysisKnowledgeReleaseId === RELEASE,
  'the analysis names the release, because release content IS materially present in it');
assert(mixed.mixed === true, 'the analysis is flagged as MIXED so a reader knows to check per finding');
assert(mixed.findingKnowledgeReleaseIds['A-approved-governed'] === RELEASE,
  'finding A (approved governed content) claims the release');
assert(mixed.findingKnowledgeReleaseIds['B-fell-back'] === null,
  'HARD: finding B (fell back to legacy) claims NO release — it was not governed');
assert(mixed.findingKnowledgeReleaseIds['C-citation-only'] === RELEASE,
  'finding C (citation-only) claims the release — the release is why no text is shown');
assert(mixed.findingKnowledgeReleaseIds['D-evidence-uncertain'] === null,
  'HARD: finding D claims no release; its UNCERTAIN applicability did not change that, its BACKING did');
assert(mixed.governedFindingCount === 2 && mixed.totalFindingCount === 4,
  'the counts describe the split (2 of 4 governed)');
assert(new Set(Object.values(mixed.findingKnowledgeReleaseIds).filter(Boolean)).size === 1,
  'HARD: findings never disagree about WHICH release — one analysis pins one release');
assert(Object.values(mixed.findingKnowledgeReleaseIds).every(v => v === null || v === mixed.analysisKnowledgeReleaseId),
  "HARD: KG-1 invariant preserved — no finding claims a release its analysis did not use");

// Applicability must not move provenance. Same backings, different applicability.
const uncertainVariant = resolveAnalysisProvenance(pinFor('GOVERNED_WITH_FALLBACK'), [
  consumed('A', decideFallback('GOVERNED_WITH_FALLBACK', 'UNCERTAIN', 'APPROVED_EXACT').governedProvenanceEligible),
  consumed('B', decideFallback('GOVERNED_WITH_FALLBACK', 'UNCERTAIN', 'NOT_IN_RELEASE').governedProvenanceEligible),
]);
const supportedVariant = resolveAnalysisProvenance(pinFor('GOVERNED_WITH_FALLBACK'), [
  consumed('A', decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', 'APPROVED_EXACT').governedProvenanceEligible),
  consumed('B', decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', 'NOT_IN_RELEASE').governedProvenanceEligible),
]);
assert(JSON.stringify(uncertainVariant.findingKnowledgeReleaseIds) === JSON.stringify(supportedVariant.findingKnowledgeReleaseIds),
  'HARD: changing ONLY applicability changes no provenance at all');

const scoping = describeGovernedRetrievalScoping(pinFor('GOVERNED_WITH_FALLBACK'), mixedContributions);
assert(scoping.mode === 'single_release' && /2 of 4 findings/.test(scoping.reason),
  'the persisted reason states how many findings actually consumed governed content');

// ============================================================ Part 4 -- rollback
section('Part 4 — rollback affects future requests only');

// t0: governed. An analysis records the release.
const historical = resolveAnalysisProvenance(pinFor('GOVERNED_WITH_FALLBACK'), allConsumed);
const persisted = historical.analysisKnowledgeReleaseId;
assert(persisted === RELEASE, 't0: a governed analysis persists the release id');

// t1: an operator rolls back by setting the mode to LEGACY. Nothing in the database is touched.
const afterRollback = resolveAnalysisProvenance(pinFor('LEGACY'), allConsumed);
assert(afterRollback.analysisKnowledgeReleaseId === null,
  'HARD: after rollback the NEXT analysis records NULL — legacy provenance resumes immediately');
assert(historicalProvenanceIsPreserved(persisted, persisted),
  'HARD: the historical analysis retains its truthful release id — rollback rewrites no history');
assert(!historicalProvenanceIsPreserved(persisted, null),
  'the preservation predicate genuinely fails if a historical id were cleared');
assert(!historicalProvenanceIsPreserved(null, RELEASE),
  'the preservation predicate genuinely fails if a legacy analysis acquired an id');

// Rollback requires no release change: the same pinned release, in LEGACY, yields NULL.
assert(resolveAnalysisProvenance({ ...pinFor('GOVERNED_WITH_FALLBACK'), mode: 'LEGACY' }, allConsumed)
  .analysisKnowledgeReleaseId === null,
  'HARD: rollback needs no release de-activation, no approval revocation and no data change — the mode alone decides');

// ============================================================ Part 5 -- the anti-spoofing gate
section('Part 5 — a client cannot fabricate governed provenance');

/**
 * THE ATTACK. `addAnalysis` receives `resultSnapshot` in the REQUEST BODY, and KG-4A's customer
 * paths stamp a per-finding `knowledgeReleaseId` into it. A client could therefore post a snapshot
 * carrying an invented release id and, without a server-side gate, have it persisted as governed
 * provenance -- defeating the entire provenance contract and violating KG-1's rule that provenance
 * is decided "never from client input".
 *
 * The gate requires the SERVER to independently agree on two facts before any claim is honoured:
 * that this principal is enabled for a mode which can influence customer output, and that the
 * claimed release is the one actually active on this server. Both are checked below.
 */
async function gateChecks() {
  const { DataSource } = require('typeorm');
  const { userInfo } = require('os');
  const { execFileSync } = require('child_process');
  const user = process.env.PGUSER || userInfo().username;
  const OWNED = 'test_kg4a_gate_run';
  execFileSync('dropdb', ['-h', '127.0.0.1', '-U', user, '--if-exists', OWNED]);
  execFileSync('createdb', ['-h', '127.0.0.1', '-U', user, OWNED]);
  const ds = new DataSource({ type: 'postgres', url: `postgresql://${user}@127.0.0.1:5432/${OWNED}`, synchronize: false, logging: false });
  await ds.initialize();
  await ds.query(`CREATE TABLE regulatory_releases ("releaseId" varchar(120) primary key, status varchar(32))`);
  await ds.query(`INSERT INTO regulatory_releases VALUES ('real-active-release', 'active')`);

  class GateProbe extends InspectionService {
    constructor(source: any) {
      super(...([null, null, null, null, null, null, null, null, null, null, source] as any));
    }
    public gate(snapshot: unknown, principal: any) {
      return (this as any).resolveKnowledgeReleaseId(snapshot, principal);
    }
  }
  const probe = new GateProbe(ds);
  const ALLOWED = { userId: 'allowed-user', organizationId: null };
  const OTHER = { userId: 'other-user', organizationId: null };
  const SPOOFED = { standardDecisions: [{ citation: 'x', knowledgeReleaseId: 'attacker-supplied-release' }] };
  const TRUTHFUL = { standardDecisions: [{ citation: 'x', knowledgeReleaseId: 'real-active-release' }] };

  const withEnv = async <T>(env: Record<string, string>, run: () => Promise<T>): Promise<T> => {
    const saved: Record<string, string | undefined> = {};
    for (const key of Object.keys(env)) { saved[key] = process.env[key]; process.env[key] = env[key]; }
    try { return await run(); }
    finally { for (const key of Object.keys(env)) { if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key]; } }
  };
  const GOVERNED = { GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'allowed-user' };

  assert(await probe.gate(SPOOFED, ALLOWED) === null,
    'HARD: with no governed mode configured, a spoofed snapshot is IGNORED — provenance stays NULL');
  assert(await probe.gate(TRUTHFUL, ALLOWED) === null,
    'HARD: with no governed mode configured, even a TRUTHFUL claim is ignored — the mode decides');

  await withEnv(GOVERNED, async () => {
    assert(await probe.gate(SPOOFED, OTHER) === null,
      'HARD: a NON-allowlisted principal cannot fabricate provenance even in a governed deployment');
    assert(await probe.gate(SPOOFED, ALLOWED) === null,
      'HARD: an allowlisted principal claiming a release that is NOT active gets NULL, not the invented id');
    assert(await probe.gate(TRUTHFUL, ALLOWED) === 'real-active-release',
      'an allowlisted principal claiming the genuinely active release records it');
    assert(await probe.gate({}, ALLOWED) === null,
      'a governed principal whose analysis consumed nothing records NULL');
    assert(await probe.gate({ standardDecisions: [
      { knowledgeReleaseId: 'real-active-release' }, { knowledgeReleaseId: 'another-release' }] }, ALLOWED) === null,
      'HARD: a snapshot claiming two releases records NULL — pinning was violated');
  });

  await withEnv({ GOVERNED_CUTOVER_MODE: 'SHADOW', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'allowed-user' }, async () => {
    assert(await probe.gate(TRUTHFUL, ALLOWED) === null,
      'HARD: SHADOW records NULL even for an allowlisted principal with a truthful claim');
  });

  await ds.destroy();
  execFileSync('dropdb', ['-h', '127.0.0.1', '-U', user, '--if-exists', OWNED]);
}

snapshotScannerChecks().then(gateChecks).then(() => {
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}).catch((error) => { console.error(error); process.exit(1); });
