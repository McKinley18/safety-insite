/**
 * §279 — WHAT THIS BUILD IS, AND WHICH CLIENTS IT SUPPORTS.
 *
 * ==================== DERIVED WHERE IT CAN BE, DECLARED WHERE IT CANNOT ====================
 *
 * §270 established the principle this file follows: a value that cannot be trusted must say so
 * rather than be presented with the same confidence as a real one, and a hand-maintained duplicate
 * with nobody checking it goes stale one release after it is written.
 *
 * So:
 *
 *   gitSha, buildTimestamp        DERIVED from the pipeline, via getBuildMetadata(), which reports
 *                                 which source answered.
 *   backendVersion, releaseVersion DERIVED from this package's own version.
 *   schemaCompatibilityVersion    DERIVED from the migration files that shipped in this artifact.
 *                                 Adding a migration changes it with nothing to remember.
 *   frontendVersion               DECLARED. It cannot be derived: the backend builds with
 *   minimumSupportedFrontendVersion  `rootDir: backend` on Render and never sees the frontend
 *                                 project at all. These two are RELEASE DECISIONS, not build facts.
 *
 * The declared pair is the residue, and it is checked mechanically rather than trusted:
 * `npm run check:release-contract-parity` fails when SHIPPED_FRONTEND_VERSION does not equal the
 * version in `frontend-next/package.json`. That is the same arrangement §276 used to hold the two
 * copies of the severity rule together.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { getBuildMetadata } from '../utils/build-metadata';
import { expectedMigrationTimestamps } from '../database/schema-readiness';
import type { ReleaseContract } from './release-contract';

/**
 * THE FRONTEND RELEASE THIS BACKEND SHIPS WITH.
 *
 * Change this in the same commit that changes `frontend-next/package.json`. The parity gate exists
 * so that forgetting is a failed build rather than a client silently told it is current when it
 * is a release behind.
 */
export const SHIPPED_FRONTEND_VERSION = '1.0.0';

/**
 * THE OLDEST FRONTEND THIS BACKEND WILL ACCEPT SAFETY-CRITICAL WRITES FROM.
 *
 * This is the backward-compatible release window, and it is deliberately a SEPARATE value from
 * SHIPPED_FRONTEND_VERSION rather than the same number. Requiring every frontend and backend
 * deployment to be atomically simultaneous is the arrangement that makes a release a cliff: any
 * client mid-request during the switchover is instantly obsolete, and the two platforms here
 * (Render and Vercel) cannot deploy atomically with respect to each other in any case.
 *
 * Raising this floor is how support for an old client ENDS, and it is a deliberate act. It should
 * move only when a change genuinely cannot be served for an older client -- not on every release.
 */
export const MINIMUM_SUPPORTED_FRONTEND_VERSION = '1.0.0';

function backendPackageVersion(): string {
  // `__dirname` is `<root>/dist/common` compiled and `<root>/src/common` from source; the package
  // manifest is two levels up in both cases.
  const candidates = [
    join(__dirname, '..', '..', 'package.json'),
    join(__dirname, '..', '..', '..', 'package.json'),
  ];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(candidate, 'utf8')) as { name?: string; version?: string };
      if (parsed.name === 'safety-insite-backend' && typeof parsed.version === 'string') return parsed.version;
    } catch {
      /* try the next candidate; an unreadable manifest is reported as 'unknown' below */
    }
  }
  return 'unknown';
}

/**
 * The public release contract. Every field is a public fact about a build -- a commit, a
 * timestamp, a version number, a migration timestamp. Nothing here is a credential, a connection
 * string, an internal hostname or a dependency inventory, which is what makes it safe to serve
 * unauthenticated: a client has to be able to ask whether it is obsolete BEFORE it can sign in.
 */
export function getReleaseContract(): ReleaseContract {
  const build = getBuildMetadata();
  const backendVersion = backendPackageVersion();
  const migrations = expectedMigrationTimestamps();

  return {
    releaseVersion: backendVersion,
    gitSha: build.gitCommit,
    buildTimestamp: build.buildTimestamp,
    backendVersion,
    frontendVersion: SHIPPED_FRONTEND_VERSION,
    minimumSupportedFrontendVersion: MINIMUM_SUPPORTED_FRONTEND_VERSION,
    // An artifact carrying no migrations reports 'unknown' rather than a made-up value; the
    // readiness check already refuses to serve in that state, and this must not disagree with it.
    schemaCompatibilityVersion: migrations.length ? migrations[migrations.length - 1] : 'unknown',
    versionSourceStatus: build.versionSourceStatus,
    buildTimestampSourceStatus: build.buildTimestampSourceStatus,
  };
}
