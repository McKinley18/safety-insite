import { buildInfo } from '../build-info';

export interface BuildMetadata {
  appName: string;
  gitCommit: string;
  buildTimestamp: string;
  nodeEnv: string;
  versionSourceStatus: string;
  /**
   * §270. Where `buildTimestamp` came from, on exactly the same footing as `versionSourceStatus`
   * reports the origin of `gitCommit`. Without this, a stale checked-in literal and a genuine
   * build stamp are indistinguishable to anyone reading /health/version — which is how a timestamp
   * four months older than the running build went unnoticed until §269.
   */
  buildTimestampSourceStatus: string;
}

/**
 * §270 — THE BUILD TIMESTAMP IS NOW DERIVED, NOT HAND-MAINTAINED.
 *
 * `src/build-info.ts` is a checked-in literal that no build step stamps. `gitCommit` already
 * survived that, because it is resolved from a chain of pipeline-supplied environment variables and
 * only falls back to the literal. `buildTimestamp` had no such chain: it read the literal and
 * nothing else, so /health/version reported `2026-06-19T20:42:00Z` for a build produced on
 * 2026-08-29 and would have gone on reporting it for every future release.
 *
 * The fix is deliberately NOT a new hand-maintained date. It gives the timestamp the same treatment
 * the commit already has:
 *
 *   1. an explicit pipeline value — `BUILD_TIMESTAMP`, which the Dockerfile accepts as a build ARG
 *      and the release process can inject;
 *   2. a platform-supplied build time, where the platform offers one;
 *   3. the checked-in literal, reported as `BUILD_FALLBACK` so it is never mistaken for a stamp;
 *   4. `unknown`.
 *
 * A value that cannot be trusted now says so in its own status field rather than being presented
 * with the same confidence as a real one.
 */

/** Sources for the commit, most authoritative first. Render sets RENDER_GIT_COMMIT itself. */
const COMMIT_SOURCES = [
  'RENDER_GIT_COMMIT',
  'GIT_COMMIT',
  'GIT_SHA',
  'COMMIT_SHA',
  'VERCEL_GIT_COMMIT_SHA',
  'SOURCE_VERSION',
  'npm_package_version',
] as const;

/**
 * Sources for the build time, most authoritative first. `BUILD_TIMESTAMP` is the one the release
 * process controls; the rest are platform conveniences that may or may not be present.
 */
const TIMESTAMP_SOURCES = [
  'BUILD_TIMESTAMP',
  'RENDER_BUILD_TIMESTAMP',
  'VERCEL_DEPLOYMENT_CREATED_AT',
  'SOURCE_DATE_EPOCH',
] as const;

function firstPresent(names: readonly string[]): { name: string; value: string } | null {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) return { name, value: value.trim() };
  }
  return null;
}

/**
 * Accepts an ISO-8601 instant or a Unix epoch in seconds (`SOURCE_DATE_EPOCH` is defined that way),
 * and normalises both to ISO-8601. A supplied value that parses to nothing is REJECTED rather than
 * echoed, so a malformed pipeline variable falls through to the next source instead of putting
 * garbage on a health endpoint.
 */
function normaliseTimestamp(raw: string): string | null {
  if (/^\d{9,11}$/.test(raw)) {
    const asDate = new Date(Number(raw) * 1000);
    return Number.isNaN(asDate.getTime()) ? null : asDate.toISOString();
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function getBuildMetadata(): BuildMetadata {
  const commitSource = firstPresent(COMMIT_SOURCES);
  const gitCommit = commitSource?.value || buildInfo.gitCommit || 'unknown';
  const versionSourceStatus = commitSource?.name
    || (buildInfo.gitCommit ? 'BUILD_FALLBACK' : 'unknown');

  let buildTimestamp = 'unknown';
  let buildTimestampSourceStatus = 'unknown';

  for (const name of TIMESTAMP_SOURCES) {
    const raw = process.env[name];
    if (!raw || !raw.trim()) continue;
    const normalised = normaliseTimestamp(raw.trim());
    if (!normalised) continue;
    buildTimestamp = normalised;
    buildTimestampSourceStatus = name;
    break;
  }

  if (buildTimestampSourceStatus === 'unknown' && buildInfo.buildTimestamp) {
    const normalised = normaliseTimestamp(buildInfo.buildTimestamp);
    if (normalised) {
      buildTimestamp = normalised;
      buildTimestampSourceStatus = 'BUILD_FALLBACK';
    }
  }

  return {
    appName: 'safety-insite-backend',
    gitCommit,
    buildTimestamp,
    nodeEnv: process.env.NODE_ENV || 'development',
    versionSourceStatus,
    buildTimestampSourceStatus,
  };
}
