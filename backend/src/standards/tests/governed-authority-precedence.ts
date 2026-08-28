// FALLBACK PRECEDENCE AND FAILURE CONTAINMENT — 2026-08-28.
//
//   npm run test:governed-authority-precedence
//
// TWO PROPERTIES, MEASURED TOGETHER BECAUSE THEY ARE THE SAME PROPERTY SEEN FROM TWO SIDES.
//
//   PRECEDENCE (Phase 7). Five authority states can attach to a finding's citation, and exactly
//   one of them may be presented as reviewed regulation. The ordering below is not a preference
//   ranking to be tuned -- it is a statement about what each state is ENTITLED to claim.
//
//   CONTAINMENT (Phase 12). Governance can fail: the resolver can error, the release pointer can be
//   unreadable, the schema can be stale. When it does, the failure must cost the customer a CLAIM,
//   never a HAZARD. A life-critical hazard that disappears because a database query failed is a
//   far worse outcome than a hazard shown without approved regulatory text.
//
// THE INVARIANT BOTH HALVES SERVE:
//
//     Hazard recognition authority and regulatory-content authority are separate. Governance
//     decides what may be CLAIMED about a regulation. It never decides whether a hazard exists.
//
// A NOTE ON WHY "UNANNOTATED" IS SAFE. When annotation fails, the candidate is persisted with no
// `authorityState` at all. That is only safe if every downstream reader treats ABSENCE as
// non-governed rather than as unknown-therefore-fine, so this suite asserts that directly rather
// than assuming it.

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { dataSource } from '../../database/data-source';
import { resolveFindingStandardAuthority, type FindingAuthorityState } from '../releases/finding-standards-authority';
import { annotateFindingStandardsAuthority } from '../../inspection/finding-standards-authority-annotation';
import { resolveInspectionReleaseBinding } from '../releases/inspection-release-binding';
import { pinGovernedRelease, resolveGoverned } from '../cutover/governed-resolution';
import { decideFallback } from '../cutover/fallback-contract';

const CANDIDATE = 'federal-core-2026-08-28.1';
const HISTORICAL = 'federal-core-2026-07-30.1';

const APPROVED = '29 CFR 1910.147';          // approved member of the candidate release
const UNAPPROVED = '1910.219';               // a member of R1, approved in neither release
const REJECTED = '30 CFR 56.14105';          // excluded from the candidate release by review
const UNKNOWN = '29 CFR 1910.99999';         // no governed record anywhere

/**
 * What each authority state is entitled to claim. This table IS the precedence contract; the
 * assertions below simply hold the resolver to it.
 */
const ENTITLEMENTS: Record<FindingAuthorityState, {
  presentableAsReviewedRegulation: boolean;
  mayCarryReviewerIdentity: boolean;
  contentDisclosure: 'GOVERNED_APPROVED' | 'HAZLENZ_AUTHORED';
  corpusBacked: boolean;
}> = {
  APPROVED_GOVERNED_CONTENT:   { presentableAsReviewedRegulation: true,  mayCarryReviewerIdentity: true,  contentDisclosure: 'GOVERNED_APPROVED', corpusBacked: true },
  UNAPPROVED_GOVERNED_CONTENT: { presentableAsReviewedRegulation: false, mayCarryReviewerIdentity: false, contentDisclosure: 'HAZLENZ_AUTHORED', corpusBacked: false },
  REJECTED_GOVERNED_CONTENT:   { presentableAsReviewedRegulation: false, mayCarryReviewerIdentity: false, contentDisclosure: 'HAZLENZ_AUTHORED', corpusBacked: false },
  LEGACY_CODE_RESIDENT_CONTENT:{ presentableAsReviewedRegulation: false, mayCarryReviewerIdentity: false, contentDisclosure: 'HAZLENZ_AUTHORED', corpusBacked: false },
  NO_GOVERNED_MATCH:           { presentableAsReviewedRegulation: false, mayCarryReviewerIdentity: false, contentDisclosure: 'HAZLENZ_AUTHORED', corpusBacked: false },
};

function recorder() {
  const state = { failures: [] as string[], count: 0 };
  return {
    get failures() { return state.failures; },
    get count() { return state.count; },
    check(ok: boolean, name: string, detail = '') {
      state.count += 1;
      console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
      if (!ok) state.failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    },
  };
}

/** A life-critical hazard, shaped as the decomposition engine produces one. */
function lifeCriticalHazard(citations: string[]) {
  return {
    hazardId: 'haz-lc-1', domainId: 'energy_control', hazardFamily: 'energy_control',
    mechanism: 'Unexpected energization during servicing',
    observationFragment: 'a worker reaching into an unguarded, energized machine',
    lifeCritical: true,
    severity: 'catastrophic',
    standardCandidates: citations.map(citation => ({
      citation, family: 'energy_control', status: 'SUPPORTED', confidence: 0.9,
      applicability: 'direct', explanation: 'code-resident predicate matched', missingPredicates: [],
    })),
  } as Record<string, unknown>;
}

async function main() {
  const ds: DataSource = await dataSource.initialize();
  const r = recorder();
  const evidence: Record<string, unknown> = {};

  try {
    // ================================================================ PHASE 7 — precedence
    console.log('\n-- Phase 7: what each authority state is entitled to claim --');
    const observed: Record<string, unknown> = {};
    const cases: Array<[FindingAuthorityState, string, string | null, boolean]> = [
      ['APPROVED_GOVERNED_CONTENT', APPROVED, CANDIDATE, false],
      ['UNAPPROVED_GOVERNED_CONTENT', UNAPPROVED, HISTORICAL, false],
      ['REJECTED_GOVERNED_CONTENT', REJECTED, CANDIDATE, false],
      ['LEGACY_CODE_RESIDENT_CONTENT', APPROVED, CANDIDATE, true],
      ['NO_GOVERNED_MATCH', UNKNOWN, CANDIDATE, false],
    ];
    for (const [expected, citation, releaseId, skip] of cases) {
      const authority = await resolveFindingStandardAuthority(ds, {
        citation, releaseId, skipGovernedResolution: skip,
      });
      const entitlement = ENTITLEMENTS[expected];
      observed[expected] = {
        citation, state: authority.state, corpusBacked: authority.corpusBacked,
        contentDisclosure: authority.contentDisclosure, reviewerId: authority.reviewerId,
        recordChecksum: authority.recordChecksum, releaseMember: authority.releaseMember,
      };
      r.check(authority.state === expected, `${expected} is reachable`, authority.state);
      r.check(authority.corpusBacked === entitlement.corpusBacked,
        `${expected}: corpusBacked = ${entitlement.corpusBacked}`, String(authority.corpusBacked));
      r.check(authority.contentDisclosure === entitlement.contentDisclosure,
        `${expected}: content is disclosed as ${entitlement.contentDisclosure}`,
        authority.contentDisclosure);
      r.check(Boolean(authority.reviewerId) === entitlement.mayCarryReviewerIdentity,
        `${expected}: reviewer identity ${entitlement.mayCarryReviewerIdentity ? 'present' : 'withheld'}`,
        String(authority.reviewerId));
      // The single load-bearing consequence, restated per state so no state can drift into it.
      r.check((authority.state === 'APPROVED_GOVERNED_CONTENT')
        === entitlement.presentableAsReviewedRegulation,
        `${expected}: presentable as reviewed regulation = ${entitlement.presentableAsReviewedRegulation}`);
    }
    evidence.precedence = observed;

    r.check(Object.keys(ENTITLEMENTS)
      .filter(state => ENTITLEMENTS[state as FindingAuthorityState].presentableAsReviewedRegulation)
      .length === 1,
      'exactly ONE of the five states may be presented as reviewed regulation');

    // ------------------------------------------------ hazard recognition is independent
    console.log('\n-- Phase 7: hazard recognition is independent of every governance outcome --');
    const mixed = lifeCriticalHazard([APPROVED, UNAPPROVED, REJECTED, UNKNOWN]);
    const beforeShape = {
      mechanism: (mixed as any).mechanism, lifeCritical: (mixed as any).lifeCritical,
      severity: (mixed as any).severity, candidates: (mixed as any).standardCandidates.length,
      citations: (mixed as any).standardCandidates.map((c: any) => c.citation),
    };
    await annotateFindingStandardsAuthority(ds.manager, mixed, CANDIDATE);
    const afterShape = {
      mechanism: (mixed as any).mechanism, lifeCritical: (mixed as any).lifeCritical,
      severity: (mixed as any).severity, candidates: (mixed as any).standardCandidates.length,
      citations: (mixed as any).standardCandidates.map((c: any) => c.citation),
    };
    r.check(JSON.stringify(beforeShape) === JSON.stringify(afterShape),
      'a life-critical hazard whose citations span four authority states is unchanged as a hazard',
      JSON.stringify(afterShape.candidates));
    const states = (mixed as any).standardCandidates.map((c: any) => c.authorityState);
    r.check(new Set(states).size >= 3,
      'and its citations genuinely resolved to different authority states', states.join(','));
    r.check((mixed as any).standardCandidates.filter((c: any) => c.corpusBacked).length === 1,
      'exactly one of them is corpus-backed — the approved member', states.join(','));
    evidence.hazardIndependence = { beforeShape, afterShape, states };

    // ================================================================ PHASE 12 — containment
    console.log('\n-- Phase 12: governed retrieval FAILS --');

    // A data source whose governed queries throw. The annotation must survive it.
    const brokenQuery = async () => { throw new Error('simulated governance outage'); };
    const brokenDataSource = {
      query: brokenQuery,
      connection: null as unknown,
    } as unknown as DataSource;
    (brokenDataSource as any).connection = brokenDataSource;
    const brokenManager = { connection: brokenDataSource } as any;

    const underOutage = lifeCriticalHazard([APPROVED, REJECTED]);
    const annotated = await annotateFindingStandardsAuthority(brokenManager, underOutage, CANDIDATE);
    const outageCandidates = (underOutage as any).standardCandidates as any[];
    r.check(outageCandidates.length === 2 && (underOutage as any).lifeCritical === true
      && (underOutage as any).mechanism === 'Unexpected energization during servicing',
      'a governance outage does not suppress the hazard, its severity or its citations');
    r.check(annotated === 0 && outageCandidates.every(c => c.authorityState === undefined),
      'and it leaves every candidate UNANNOTATED rather than partially trusted',
      `annotated=${annotated}`);
    r.check(outageCandidates.every(c =>
      c.corpusBacked === undefined && c.reviewerId === undefined
      && c.governedRecordChecksum === undefined && c.contentDisclosure === undefined),
      'an unannotated candidate carries NO governance field at all — nothing to misread as approval');

    // Absence must be read conservatively by every consumer. The only safe reading of "no
    // authorityState" is "not governed", and the two derived flags a consumer would branch on are
    // both falsy-by-absence rather than defaulting true.
    for (const candidate of outageCandidates) {
      r.check(!candidate.corpusBacked && candidate.contentDisclosure !== 'GOVERNED_APPROVED'
        && candidate.authorityState !== 'APPROVED_GOVERNED_CONTENT',
        `absence is conservative for ${candidate.citation}: it reads as non-governed`);
    }

    // Partial failure: one citation resolvable, one not. There must be no half-trusted candidate.
    let call = 0;
    const flakyDataSource = {
      query: async (...args: unknown[]) => {
        call += 1;
        if (call === 1) throw new Error('simulated transient failure');
        return (ds as any).query(...(args as [string, unknown[]]));
      },
    } as unknown as DataSource;
    (flakyDataSource as any).connection = flakyDataSource;
    const partial = lifeCriticalHazard([APPROVED, APPROVED]);
    await annotateFindingStandardsAuthority({ connection: flakyDataSource } as any, partial, CANDIDATE);
    const partialCandidates = (partial as any).standardCandidates as any[];
    r.check(partialCandidates.length === 2,
      'a partial annotation failure loses no candidate', String(partialCandidates.length));
    r.check(partialCandidates.every(c =>
      c.authorityState === undefined
        || (c.authorityState === 'APPROVED_GOVERNED_CONTENT' && Boolean(c.governedRecordChecksum) && Boolean(c.reviewerId))),
      'every candidate is EITHER fully annotated OR untouched — never half-trusted',
      partialCandidates.map(c => c.authorityState ?? 'unannotated').join(','));

    // The pin cannot be read.
    const pinFailure = await pinGovernedRelease(flakyBrokenSource(), 'GOVERNED_WITH_FALLBACK');
    r.check(pinFailure.releaseId === null && pinFailure.reason === 'PIN_LOOKUP_FAILED',
      'an unreadable active pointer degrades to no release, never to a guess', pinFailure.reason);
    const unresolvable = await resolveGoverned(flakyBrokenSource(), pinFailure, APPROVED);
    r.check(unresolvable.backing === 'RESOLVER_UNAVAILABLE',
      'and the resolution says "unknown", not "there is none"', unresolvable.backing);
    const fallback = decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', unresolvable.backing);
    r.check(fallback.governedProvenanceEligible === false,
      'a failed resolution can never make an analysis claim governed provenance',
      fallback.reasonCode);
    r.check(fallback.deliveryState !== 'GOVERNED_VERIFIED_TEXT',
      'and it can never deliver governed-verified text', fallback.deliveryState);

    // The binding lookup fails.
    const bindingFailure = await resolveInspectionReleaseBinding({
      dataSource: flakyBrokenSource(), inspectionId: '00000000-0000-4000-8000-000000000000',
      mode: 'GOVERNED_WITH_FALLBACK',
    });
    r.check(bindingFailure.releaseId === null && bindingFailure.reason === 'BINDING_LOOKUP_FAILED',
      'a failed binding lookup resolves to no release rather than to the active pointer',
      bindingFailure.reason);

    // And the stored binding is never replaced by a pointer read, even under a governed mode.
    const boundPin = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK', HISTORICAL);
    r.check(boundPin.releaseId === HISTORICAL && boundPin.reason === 'PINNED_BOUND_RELEASE',
      'no active-pointer lookup silently replaces a stored inspection release',
      `${boundPin.releaseId} / ${boundPin.reason}`);

    evidence.containment = {
      outageAnnotated: annotated,
      pinFailure: pinFailure.reason,
      resolverBackingUnderFailure: unresolvable.backing,
      fallbackReason: fallback.reasonCode,
      governedProvenanceEligible: fallback.governedProvenanceEligible,
      bindingFailure: bindingFailure.reason,
    };
  } finally {
    await ds.destroy().catch(() => undefined);
  }

  console.log('');
  console.log(`AUTHORITY PRECEDENCE + CONTAINMENT: ${r.count - r.failures.length}/${r.count} checks passed`);
  if (process.env.PRECEDENCE_EVIDENCE_OUT) {
    require('fs').writeFileSync(
      process.env.PRECEDENCE_EVIDENCE_OUT,
      JSON.stringify({ checks: r.count, failures: r.failures, evidence }, null, 2),
    );
  }
  if (r.failures.length) {
    console.error('\nFAILURES:');
    for (const failure of r.failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
}

/** A data source whose every query throws, for exercising the resolver's failure branches. */
function flakyBrokenSource(): DataSource {
  const broken = { query: async () => { throw new Error('simulated governance outage'); } } as unknown as DataSource;
  (broken as any).connection = broken;
  return broken;
}

main().catch(error => { console.error(error); process.exit(1); });
