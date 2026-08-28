// GOVERNED RELEASE ACTIVATION ACCEPTANCE GATE — 2026-08-28.
//
//   npm run test:release-activation-acceptance
//
// WHAT THIS IS FOR. `federal-core-2026-08-28.1` is a reviewed candidate release. Making it the
// ACTIVE release is the step that turns 64 reviewer decisions into the regulatory authority a
// customer finding may cite. Activation is therefore the moment at which a governance system can
// most easily start lying: if activation rewrote a release, re-stamped its members, moved a review
// decision, or let a rejected record in through the door its reviewer closed, every downstream
// authority claim would inherit that. So the gate is written and run BEFORE the real candidate is
// activated anywhere, and it is run against a disposable database this suite owns.
//
// THE INVARIANT IT EXISTS TO PROVE, stated once:
//
//     Activation SELECTS an immutable governed release for new resolution. It does not rewrite the
//     release, its membership, its records, its review ledger, or the provenance of any inspection
//     that was already bound to a different release.
//
// Everything below is a consequence of that sentence.
//
// POSITIVE AND NEGATIVE CONTROLS, both required. A gate that only proves "the good release
// activates" cannot distinguish a working gate from an absent one, so the suite also proves that a
// non-existent release, a release with no reviewer-approved member, and a release whose stored
// manifest disagrees with its own snapshot are each REFUSED — and refused by a named gate, not by
// an accident of ordering.
//
// WHY A SYNTHETIC FIXTURE RELEASE EXISTS HERE. Test G needs a real R1 -> R2 pointer transition, and
// the only other real release in the corpus (`federal-core-2026-07-30.1`) has no reviewer-approved
// member, so it cannot legitimately be activated — and approving one of its records to make it
// activatable would mean editing a historical review ledger to suit a test. The fixture releases
// are synthetic, are named `activation-fixture.*` so they can never be confused with a real release
// identity, and exist only inside this suite's own disposable database.

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { createHash } from 'crypto';
import { dataSource } from '../src/database/data-source';
import {
  RegulatoryReleaseLifecycleService,
  ReleaseActivationRefused,
} from '../src/standards/releases/regulatory-release-lifecycle.service';
import { computeSnapshotManifest } from '../src/standards/releases/release-manifest';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';
import { resolveFindingStandardAuthority } from '../src/standards/releases/finding-standards-authority';
import { assertManifestMatchesDefinition } from '../src/standards/releases/release-identity';
import { runOwnedMutatingSuite } from './lib/test-database-ownership';

const R_HISTORICAL = 'federal-core-2026-07-30.1';
const CANDIDATE = 'federal-core-2026-08-28.1';
const FIXTURE_R1 = 'activation-fixture.R1';

/** The 8 records the 2026-08-28 reviewer ledger disposed REJECT_CORRECTION_REQUIRED. */
const REJECTED = [
  '30 CFR 57.14107(a)', '30 CFR 56.14105', '1910.219', '29 CFR 1910.132(a)',
  '29 CFR 1926.95(a)', '30 CFR 56.15006', '29 CFR 1926.602(a)(9)(ii)', '30 CFR 56.9100(a)',
];

/** Approved candidate members used as positive controls. */
const APPROVED_CONTROLS = ['29 CFR 1910.147', '29 CFR 1910.252'];

const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

interface Recorder {
  check(ok: boolean, name: string, detail?: string): void;
  failures: string[];
  count: number;
}

function recorder(): Recorder {
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

/**
 * A content fingerprint of everything activation must NOT touch, taken over the whole release
 * corpus rather than over one release: a gate that only watched the release being activated could
 * not see activation damaging a different one.
 */
async function immutableSurfaceDigest(ds: DataSource) {
  const releases = await ds.query(
    `SELECT "releaseId", "manifestChecksum", "recordCount", "parserVersion", "releaseVersion"
       FROM regulatory_releases ORDER BY "releaseId"`,
  );
  const records = await ds.query(
    `SELECT "releaseId", "citationKey", citation, "agencyCode", "recordChecksum", "reviewState",
            "approvalDigest", payload
       FROM regulatory_release_records ORDER BY "releaseId", "agencyCode", citation`,
  );
  const reviews = await ds.query(
    `SELECT "releaseId", "citationKey", "recordChecksum", decision, "reviewerId", "reviewerRole",
            "decidedAt", "frozenReviewStateAtDecision"
       FROM regulatory_release_record_reviews ORDER BY "releaseId", "citationKey", "decidedAt", id`,
  );
  const membership: Record<string, string[]> = {};
  for (const row of records) {
    (membership[row.releaseId] ||= []).push(row.citationKey);
  }
  return {
    // Release CONTENT identity only. `status`, `activatedAt`, `deactivatedAt` and
    // `parentReleaseId` are deliberately excluded: those are exactly what activation is allowed to
    // move, and including them would make the assertion vacuously false.
    releasesDigest: digest(releases),
    recordsDigest: digest(records),
    reviewsDigest: digest(reviews),
    membership,
    recordCount: records.length,
    reviewCount: reviews.length,
    manifests: Object.fromEntries(releases.map((r: any) => [r.releaseId, r.manifestChecksum])),
    counts: Object.fromEntries(releases.map((r: any) => [r.releaseId, Number(r.recordCount)])),
  };
}

async function recomputeSnapshotManifest(ds: DataSource, releaseId: string) {
  const rows = await ds.query(
    `SELECT "agencyCode", citation, "recordChecksum" FROM regulatory_release_records
      WHERE "releaseId" = $1 ORDER BY "agencyCode", citation`,
    [releaseId],
  );
  return computeSnapshotManifest(rows);
}

/**
 * Builds a synthetic, internally-consistent release with one reviewer-approved member, so a real
 * pointer transition can be exercised without touching a real release identity.
 */
async function buildFixtureRelease(ds: DataSource, releaseId: string, citation: string) {
  const payload = {
    agency: 'OSHA', citation, title: `Fixture standard ${citation}`,
    canonicalText: 'Fixture canonical text for activation-pointer verification.',
    summary: 'Fixture summary.', scope: 'osha_general_industry',
    sourceKey: 'fixture:activation', sourceName: 'Activation fixture', sourceType: 'fixture',
    authorityTier: 'regulation', allowedUse: 'governed', hazards: null, controls: null,
    keywords: null, severityWeight: 1, active: true,
  };
  const recordChecksum = digest(payload);
  await ds.query(`DELETE FROM regulatory_release_record_reviews WHERE "releaseId" = $1`, [releaseId]);
  await ds.query(`DELETE FROM regulatory_release_records WHERE "releaseId" = $1`, [releaseId]);
  await ds.query(`DELETE FROM regulatory_releases WHERE "releaseId" = $1`, [releaseId]);
  await ds.query(
    `INSERT INTO regulatory_release_records
       ("releaseId", "standardId", "agencyCode", citation, "citationKey", "recordChecksum",
        "reviewState", "reviewStateReason", payload)
     VALUES ($1, NULL, 'OSHA', $2, $3, $4, 'mechanically_validated', 'fixture', $5)`,
    [releaseId, citation, releaseCitationKey(citation), recordChecksum, JSON.stringify(payload)],
  );
  await ds.query(
    `INSERT INTO regulatory_release_record_reviews
       ("releaseId", "citationKey", citation, "recordChecksum", decision, "reviewerId",
        "reviewerRole", note, "frozenReviewStateAtDecision", "decidedAt")
     VALUES ($1, $2, $3, $4, 'approved', 'fixture-reviewer', 'fixture', 'fixture approval',
             'mechanically_validated', now())`,
    [releaseId, releaseCitationKey(citation), citation, recordChecksum],
  );
  const manifest = await recomputeSnapshotManifest(ds, releaseId);
  await ds.query(
    `INSERT INTO regulatory_releases
       ("releaseId", "releaseVersion", status, "manifestChecksum", "parserVersion", "recordCount")
     VALUES ($1, 'fixture', 'provisional', $2, 'fixture-parser', $3)`,
    [releaseId, manifest.manifestChecksum, manifest.recordCount],
  );
  return { citation, recordChecksum, manifestChecksum: manifest.manifestChecksum };
}

async function main() {
  await runOwnedMutatingSuite({
    suite: 'release-activation-acceptance',
    body: async () => {
      // The shipped application data source, so the entity metadata the lifecycle service reads is
      // the same metadata production uses. `DATABASE_URL` is set by the caller and dotenv does not
      // override an already-set variable, so the target is whatever the ownership guard just
      // printed and approved.
      const ds: DataSource = await dataSource.initialize();
      const lifecycle = new RegulatoryReleaseLifecycleService(ds);
      const r = recorder();
      const evidence: Record<string, unknown> = {};

      try {
        // ------------------------------------------------------------------ starting state
        console.log('\n-- Starting state (pre-activation) --');
        const before = await immutableSurfaceDigest(ds);
        const pointerBefore = await lifecycle.getActiveRelease();
        evidence.pointerBefore = pointerBefore?.releaseId ?? null;
        evidence.before = {
          manifests: before.manifests, counts: before.counts,
          recordRows: before.recordCount, reviewRows: before.reviewCount,
        };
        console.log(`  active pointer: ${pointerBefore?.releaseId ?? 'none'}`);
        console.log(`  ${CANDIDATE}: manifest ${before.manifests[CANDIDATE]} members ${before.membership[CANDIDATE]?.length ?? 0}`);

        // PRECONDITION, stated as a refusal rather than left to fail obscurely later. This suite
        // MEASURES an activation, so it must start from a database in which the candidate has not
        // been activated yet. Pointed at an already-activated database it would otherwise fail deep
        // inside the pointer move on `statusEligible`, which reads like a governance defect and is
        // not one.
        const candidateRelease = await lifecycle.getRelease(CANDIDATE);
        if (candidateRelease?.status !== 'provisional') {
          console.error('');
          console.error(`  REFUSED: ${CANDIDATE} is '${candidateRelease?.status ?? 'absent'}' in this `
            + "database, not 'provisional'. This gate measures an activation and therefore requires a "
            + 'PRE-ACTIVATION database. Clone one that has not been activated.');
          console.error('');
          process.exit(1);
        }

        r.check(before.manifests[CANDIDATE]
          === '680540d994cedb9384912cb7a3ccd28d798756bd787a84a530c8076ed3a668cb',
          'candidate release carries the pinned manifest identity',
          String(before.manifests[CANDIDATE]));
        r.check((before.membership[CANDIDATE] || []).length === 64,
          'candidate release has 64 members before activation',
          String((before.membership[CANDIDATE] || []).length));

        // ------------------------------------------------------------------ NEGATIVE CONTROLS
        //
        // Run BEFORE the real activation, so a gate that is silently inert cannot be mistaken for a
        // gate that passed.
        console.log('\n-- Negative controls: what activation must REFUSE --');

        const missing = await lifecycle.evaluateActivation('no-such-release-2026', ['provisional']);
        r.check(!missing.eligible && missing.failedGates.includes('releaseExists'),
          'a non-existent release is refused by releaseExists',
          missing.failedGates.join(','));

        const historical = await lifecycle.evaluateActivation(R_HISTORICAL, ['provisional']);
        r.check(!historical.eligible && historical.failedGates.includes('governedRecordsPresent'),
          'a release with no reviewer-approved member is refused by governedRecordsPresent',
          `${R_HISTORICAL}: ${historical.failedGates.join(',') || '(none)'}`);
        let refusedHistorical = false;
        try {
          await lifecycle.activate(R_HISTORICAL, 'activation-acceptance-gate', 'negative control');
        } catch (error) {
          refusedHistorical = error instanceof ReleaseActivationRefused;
        }
        r.check(refusedHistorical, 'activating that release actually throws ReleaseActivationRefused');

        // A release whose stored manifest disagrees with its own immutable snapshot. Synthetic,
        // so no real release identity is ever tampered with.
        const tampered = await buildFixtureRelease(ds, 'activation-fixture.TAMPERED', '29 CFR 1910.900001');
        await ds.query(
          `UPDATE regulatory_releases SET "manifestChecksum" = $2 WHERE "releaseId" = $1`,
          ['activation-fixture.TAMPERED', 'f'.repeat(64)],
        );
        const tamperedEval = await lifecycle.evaluateActivation('activation-fixture.TAMPERED', ['provisional']);
        r.check(!tamperedEval.eligible && tamperedEval.failedGates.includes('manifestChecksumVerifies'),
          'a release whose snapshot no longer reproduces its stored manifest is refused',
          tamperedEval.failedGates.join(','));
        evidence.negativeControls = {
          nonExistent: missing.failedGates,
          noApprovedMember: historical.failedGates,
          manifestMismatch: tamperedEval.failedGates,
          refusalThrown: refusedHistorical,
        };
        void tampered;

        // ------------------------------------------------------------------ G (part 1): R1 active
        console.log('\n-- G: pointer transition R1 -> R2 --');
        const fixture = await buildFixtureRelease(ds, FIXTURE_R1, '29 CFR 1910.900002');
        const activatedFixture = await lifecycle.activate(
          FIXTURE_R1, 'activation-acceptance-gate', 'establish R1 for the transition test',
        );
        r.check(activatedFixture.outcome === 'activated' && activatedFixture.previousReleaseId === null,
          'fixture R1 becomes active from an empty pointer', JSON.stringify(activatedFixture));

        // An inspection finding bound to R1, resolved and frozen BEFORE R2 becomes active.
        const boundToR1 = await resolveFindingStandardAuthority(ds, {
          citation: fixture.citation, releaseId: FIXTURE_R1,
        });
        r.check(boundToR1.state === 'APPROVED_GOVERNED_CONTENT' && boundToR1.releaseId === FIXTURE_R1,
          'a finding bound to R1 resolves approved under R1 while R1 is active',
          boundToR1.state);
        const boundToR1Frozen = JSON.stringify(boundToR1);

        // ------------------------------------------------------------------ A: activation
        //
        // THE MEASUREMENT BASELINE IS TAKEN HERE, not at the top of the suite. The first run of
        // this gate compared the post-activation corpus against a digest captured BEFORE the suite
        // built its own synthetic fixtures, so the two fixture releases showed up as a difference
        // and the immutability assertions failed against a change activation had not made. A
        // before/after pair that straddles the suite's own setup measures the setup, not the
        // operation under test.
        const preActivation = await immutableSurfaceDigest(ds);

        console.log('\n-- A: the candidate release becomes active --');
        const activation = await lifecycle.activate(
          CANDIDATE, 'activation-acceptance-gate', 'Phase 2 activation acceptance',
        );
        r.check(activation.outcome === 'activated' && activation.releaseId === CANDIDATE,
          'the reviewed candidate release activates', JSON.stringify(activation));
        r.check(activation.previousReleaseId === FIXTURE_R1,
          'the transition records the exact release it replaced', String(activation.previousReleaseId));

        const pointerAfter = await lifecycle.getActiveRelease();
        r.check(pointerAfter?.releaseId === CANDIDATE, 'the active pointer is the candidate release',
          String(pointerAfter?.releaseId));
        const retiredFixture = await lifecycle.getRelease(FIXTURE_R1);
        r.check(retiredFixture?.status === 'superseded',
          'the replaced release is retired as superseded, not deleted', String(retiredFixture?.status));
        r.check(pointerAfter?.parentReleaseId === FIXTURE_R1,
          'the activated release records its predecessor at activation time',
          String(pointerAfter?.parentReleaseId));

        // ------------------------------------------------------------------ B-E: immutability
        console.log('\n-- B/C/D/E: activation changed no release content --');
        const after = await immutableSurfaceDigest(ds);
        // B and C are additionally checked against the SUITE'S STARTING STATE, so they prove the
        // candidate's manifest and membership are what they were before anything in this file ran.
        r.check(after.manifests[CANDIDATE] === before.manifests[CANDIDATE]
          && after.manifests[CANDIDATE] === preActivation.manifests[CANDIDATE],
          'B: the candidate manifest checksum is unchanged by activation',
          `${before.manifests[CANDIDATE]} -> ${after.manifests[CANDIDATE]}`);
        r.check(
          JSON.stringify(after.membership[CANDIDATE]) === JSON.stringify(before.membership[CANDIDATE]),
          'C: candidate membership is byte-identical after activation',
          `${before.membership[CANDIDATE]?.length} -> ${after.membership[CANDIDATE]?.length}`);
        r.check(after.recordsDigest === preActivation.recordsDigest,
          'D: every normalized release record — payload, checksum and frozen review state — is unchanged',
          `${preActivation.recordCount} -> ${after.recordCount} rows`);
        r.check(after.reviewsDigest === preActivation.reviewsDigest,
          'E: the reviewer decision ledger is unchanged',
          `${preActivation.reviewCount} -> ${after.reviewCount} rows`);
        r.check(after.releasesDigest === preActivation.releasesDigest,
          'no release CONTENT identity moved (manifest / recordCount / parserVersion / version)');
        r.check(after.membership[R_HISTORICAL]?.length === before.membership[R_HISTORICAL]?.length,
          'the historical release was not touched by another release activating',
          `${before.membership[R_HISTORICAL]?.length} -> ${after.membership[R_HISTORICAL]?.length}`);

        const recomputed = await recomputeSnapshotManifest(ds, CANDIDATE);
        r.check(recomputed.manifestChecksum === before.manifests[CANDIDATE],
          'the active release still reproduces its manifest from its own immutable snapshot',
          recomputed.manifestChecksum);
        r.check(recomputed.recordCount === 64, 'the active release still holds exactly 64 members',
          String(recomputed.recordCount));

        // ------------------------------------------------------------------ F: idempotence
        console.log('\n-- F: re-activating the active release --');
        const again = await lifecycle.activate(CANDIDATE, 'activation-acceptance-gate', 'idempotence probe');
        r.check(again.outcome === 'already_active',
          'activating the already-active release is an idempotent no-op', JSON.stringify(again));
        const afterIdempotent = await immutableSurfaceDigest(ds);
        r.check(afterIdempotent.recordsDigest === after.recordsDigest
          && afterIdempotent.reviewsDigest === after.reviewsDigest
          && afterIdempotent.releasesDigest === after.releasesDigest,
          'the idempotent no-op wrote nothing to releases, records or reviews');

        // ------------------------------------------------------------------ G (part 2)
        console.log('\n-- G: the R1-bound finding after R2 became active --');
        const reResolvedR1 = await resolveFindingStandardAuthority(ds, {
          citation: fixture.citation, releaseId: FIXTURE_R1,
        });
        r.check(JSON.stringify(reResolvedR1) === boundToR1Frozen,
          'G: an inspection bound to R1 re-resolves IDENTICALLY after R2 became active',
          reResolvedR1.state);
        const sameCitationUnderR2 = await resolveFindingStandardAuthority(ds, {
          citation: fixture.citation, releaseId: CANDIDATE,
        });
        r.check(sameCitationUnderR2.state !== 'APPROVED_GOVERNED_CONTENT'
          && sameCitationUnderR2.releaseMember === false,
          'the same citation carries no authority under R2, which does not contain it',
          sameCitationUnderR2.state);

        // ------------------------------------------------------------------ H: rejected records
        console.log('\n-- H: the 8 rejected records under the ACTIVE release --');
        const rejectedResults: Record<string, unknown> = {};
        for (const citation of REJECTED) {
          const authority = await resolveFindingStandardAuthority(ds, {
            citation, releaseId: CANDIDATE,
          });
          rejectedResults[citation] = {
            state: authority.state, member: authority.releaseMember,
            reviewer: authority.reviewerId, checksum: authority.recordChecksum,
            corpusBacked: authority.corpusBacked,
          };
          r.check(
            authority.state === 'REJECTED_GOVERNED_CONTENT'
              && authority.releaseMember === false
              && authority.reviewerId === null
              && authority.recordChecksum === null
              && authority.corpusBacked === false,
            `H: ${citation} stays rejected after activation`,
            `${authority.state} member=${authority.releaseMember}`,
          );
        }
        evidence.rejectedUnderActiveRelease = rejectedResults;

        // Positive control in the same suite: activation is genuinely in force.
        for (const citation of APPROVED_CONTROLS) {
          const authority = await resolveFindingStandardAuthority(ds, { citation, releaseId: CANDIDATE });
          r.check(authority.state === 'APPROVED_GOVERNED_CONTENT' && authority.corpusBacked === true
            && Boolean(authority.recordChecksum) && Boolean(authority.reviewerId),
            `positive control: ${citation} IS approved under the active release`, authority.state);
        }

        // ------------------------------------------------------------------ I: no laundering
        console.log('\n-- I: an active release does not launder a code-resident citation --');
        const launderedNoRelease = await resolveFindingStandardAuthority(ds, {
          citation: APPROVED_CONTROLS[0], releaseId: null,
        });
        r.check(launderedNoRelease.state === 'LEGACY_CODE_RESIDENT_CONTENT'
          && launderedNoRelease.corpusBacked === false && launderedNoRelease.reviewerId === null,
          'I: a code-resident citation with no governing release stays LEGACY even while that exact '
          + 'citation is approved in the ACTIVE release', launderedNoRelease.state);
        const launderedSkip = await resolveFindingStandardAuthority(ds, {
          citation: APPROVED_CONTROLS[0], releaseId: CANDIDATE, skipGovernedResolution: true,
        });
        r.check(launderedSkip.state === 'LEGACY_CODE_RESIDENT_CONTENT'
          && launderedSkip.recordChecksum === null,
          'I: naming the active release without actually resolving it confers nothing',
          launderedSkip.state);
        const launderedRejected = await resolveFindingStandardAuthority(ds, {
          citation: REJECTED[2], releaseId: CANDIDATE,
        });
        r.check(launderedRejected.state === 'REJECTED_GOVERNED_CONTENT',
          'I: a rejected citation string does not become governed because the release is active',
          launderedRejected.state);

        // ------------------------------------------------------------------ J: release identity
        console.log('\n-- J: release identity gates --');
        let identityHeld = true;
        let identityDetail = '';
        try {
          assertManifestMatchesDefinition(CANDIDATE, recomputed.manifestChecksum);
        } catch (error) {
          identityHeld = false;
          identityDetail = (error as Error).message;
        }
        r.check(identityHeld,
          'J: the ACTIVE release still matches the manifest its version-controlled definition pins',
          identityDetail);
        let identityRefusesDrift = false;
        try {
          assertManifestMatchesDefinition(CANDIDATE, 'a'.repeat(64));
        } catch {
          identityRefusesDrift = true;
        }
        r.check(identityRefusesDrift,
          'J: a different manifest under the same release identifier is still refused');

        const historicalManifest = await recomputeSnapshotManifest(ds, R_HISTORICAL);
        let historicalIdentityHeld = true;
        try {
          assertManifestMatchesDefinition(R_HISTORICAL, historicalManifest.manifestChecksum);
        } catch {
          historicalIdentityHeld = false;
        }
        r.check(historicalIdentityHeld,
          'J: the superseded historical release still names its own 35-record manifest',
          historicalManifest.manifestChecksum);

        // ------------------------------------------------------------------ audit trail
        console.log('\n-- audit trail --');
        const events = await ds.query(
          `SELECT event, outcome, "fromReleaseId", "toReleaseId", actor
             FROM knowledge_release_events WHERE event IN ('activation','rollback')
            ORDER BY "createdAt"`,
        );
        r.check(events.some((e: any) => e.outcome === 'succeeded' && e.toReleaseId === CANDIDATE),
          'the successful activation is recorded in the append-only event log');
        r.check(events.some((e: any) => e.outcome === 'refused' && e.toReleaseId === R_HISTORICAL),
          'the REFUSED activation is recorded too — a refusal is evidence, not silence');
        evidence.activationEvents = events;

        evidence.after = {
          pointer: pointerAfter?.releaseId ?? null,
          parentReleaseId: pointerAfter?.parentReleaseId ?? null,
          manifests: after.manifests, counts: after.counts,
          recordRows: after.recordCount, reviewRows: after.reviewCount,
        };
        evidence.immutability = {
          measuredAcross: 'immediately before -> immediately after the candidate activation',
          releasesDigestBefore: preActivation.releasesDigest, releasesDigestAfter: after.releasesDigest,
          recordsDigestBefore: preActivation.recordsDigest, recordsDigestAfter: after.recordsDigest,
          reviewsDigestBefore: preActivation.reviewsDigest, reviewsDigestAfter: after.reviewsDigest,
          candidateManifestAtSuiteStart: before.manifests[CANDIDATE],
          candidateManifestAfterActivation: after.manifests[CANDIDATE],
          candidateMembersAtSuiteStart: before.membership[CANDIDATE]?.length ?? 0,
          candidateMembersAfterActivation: after.membership[CANDIDATE]?.length ?? 0,
        };
      } finally {
        await ds.destroy().catch(() => undefined);
      }

      console.log('');
      console.log(`ACTIVATION ACCEPTANCE: ${r.count - r.failures.length}/${r.count} checks passed`);
      if (process.env.ACTIVATION_EVIDENCE_OUT) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('fs').writeFileSync(
          process.env.ACTIVATION_EVIDENCE_OUT,
          JSON.stringify({ checks: r.count, failures: r.failures, evidence }, null, 2),
        );
        console.log(`evidence written to ${process.env.ACTIVATION_EVIDENCE_OUT}`);
      }
      if (r.failures.length) {
        console.error('\nFAILURES:');
        for (const failure of r.failures) console.error(`  - ${failure}`);
        process.exit(1);
      }
    },
  });
}

main().catch(error => { console.error(error); process.exit(1); });
