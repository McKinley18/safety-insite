/**
 * §279 — MIRROR OF `backend/src/common/release-contract.ts`.
 *
 * DO NOT EDIT ONE COPY WITHOUT THE OTHER. `npm run check:release-contract-parity` compares the two
 * files with comments stripped and fails on any difference in the RULE, which is the same
 * arrangement §276 used for the two copies of the effective-severity rule. This comment block is
 * the only thing that may differ, because comments are removed before the comparison.
 *
 * It exists on this side because the client has to evaluate its own position at boot, offline, and
 * before it knows whether the server is reachable at all.
 */

/** The states a client can be in relative to the server's declared release contract. */
export type ClientCompatibility =
  /** Exactly the frontend version this server ships with. */
  | 'CURRENT'
  /** Not the newest, but at or above the supported floor and not behind the server's build. */
  | 'SUPPORTED'
  /** Older than the server's build, still supported. Offer a refresh; do not insist. */
  | 'UPDATE_AVAILABLE'
  /** Below the supported floor. Refreshing fixes it, so ask for a refresh and stop writes. */
  | 'UPDATE_REQUIRED'
  /**
   * A contract mismatch a refresh cannot fix -- the client is a MAJOR ahead of the server, which
   * is what a backend rollback under a newer frontend looks like. Stop writes and say so honestly;
   * telling this user to refresh would be telling them to do something that cannot work.
   */
  | 'INCOMPATIBLE'
  /** No usable evidence. Never blocks. */
  | 'UNKNOWN';

/**
 * What `GET /version` returns. Every field here is a public fact about a build: a commit, a
 * timestamp, a version number, a migration timestamp. No credential, no connection string, no
 * internal host, no dependency inventory.
 */
export interface ReleaseContract {
  readonly releaseVersion: string;
  readonly gitSha: string;
  readonly buildTimestamp: string;
  readonly backendVersion: string;
  /** The frontend release that ships with this backend -- the newest a client can be. */
  readonly frontendVersion: string;
  /** The oldest frontend this backend will accept safety-critical writes from. */
  readonly minimumSupportedFrontendVersion: string;
  /** The newest migration timestamp this backend build expects. Constrains rollback. */
  readonly schemaCompatibilityVersion: string;
  readonly versionSourceStatus: string;
  readonly buildTimestampSourceStatus: string;
}

export interface CompatibilityResult {
  readonly state: ClientCompatibility;
  /** True only for UPDATE_REQUIRED and INCOMPATIBLE. The single flag callers should gate on. */
  readonly blocksSafetyCriticalWrites: boolean;
  /** True when a refresh of this client would actually resolve the state. */
  readonly refreshResolves: boolean;
  /** Why, in one line, for a log or a support conversation. Never shown raw to an inspector. */
  readonly reason: string;
}

interface ParsedVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

/**
 * Accepts `1.2.3` and `1.2.3-beta.4`, ignoring any pre-release suffix for ORDERING. Pre-release
 * ordering is a real part of semver, but this contract never needs it: the product ships
 * `major.minor.patch`, and inventing an ordering for suffixes it does not use would be a rule
 * nobody could check against a real release.
 */
export function parseVersion(raw: unknown): ParsedVersion | null {
  if (typeof raw !== 'string') return null;
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(raw.trim());
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

/** -1, 0 or 1. */
export function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  return 0;
}

function unknown(reason: string): CompatibilityResult {
  return { state: 'UNKNOWN', blocksSafetyCriticalWrites: false, refreshResolves: false, reason };
}

/**
 * THE RULE.
 *
 * Order matters and is not arbitrary. "Below the floor" is tested BEFORE "a major ahead", because
 * the two states differ in what the user should be told to do: a client behind the floor is fixed
 * by refreshing, and a client ahead of the server is not. A state whose remedy does not work is
 * worse than no state at all.
 */
export function resolveClientCompatibility(
  clientFrontendVersion: unknown,
  contract: Partial<ReleaseContract> | null | undefined,
): CompatibilityResult {
  if (!contract) return unknown('No release contract was obtained from the server.');

  const client = parseVersion(clientFrontendVersion);
  if (!client) return unknown(`Client version is not a release version: ${String(clientFrontendVersion)}`);

  const server = parseVersion(contract.frontendVersion);
  if (!server) return unknown(`Server did not declare a usable frontendVersion: ${String(contract.frontendVersion)}`);

  const floor = parseVersion(contract.minimumSupportedFrontendVersion);
  if (!floor) {
    return unknown(
      `Server did not declare a usable minimumSupportedFrontendVersion: ${String(contract.minimumSupportedFrontendVersion)}`,
    );
  }

  if (compareVersions(client, floor) < 0) {
    return {
      state: 'UPDATE_REQUIRED',
      blocksSafetyCriticalWrites: true,
      refreshResolves: true,
      reason: `Client ${clientFrontendVersion} is below the supported floor ${contract.minimumSupportedFrontendVersion}.`,
    };
  }

  if (client.major > server.major) {
    return {
      state: 'INCOMPATIBLE',
      blocksSafetyCriticalWrites: true,
      refreshResolves: false,
      reason: `Client ${clientFrontendVersion} is a major release ahead of the server's ${contract.frontendVersion}; refreshing cannot resolve this.`,
    };
  }

  const position = compareVersions(client, server);
  if (position === 0) {
    return {
      state: 'CURRENT',
      blocksSafetyCriticalWrites: false,
      refreshResolves: false,
      reason: `Client ${clientFrontendVersion} matches the server's build.`,
    };
  }

  if (position < 0) {
    return {
      state: 'UPDATE_AVAILABLE',
      blocksSafetyCriticalWrites: false,
      refreshResolves: true,
      reason: `Client ${clientFrontendVersion} is older than the server's ${contract.frontendVersion} and still supported.`,
    };
  }

  return {
    state: 'SUPPORTED',
    blocksSafetyCriticalWrites: false,
    refreshResolves: false,
    reason: `Client ${clientFrontendVersion} is ahead of the server's ${contract.frontendVersion} within the same major release.`,
  };
}

/**
 * A human sentence for the state, written for a safety professional in the field rather than for
 * an engineer. It names the product, says what happened, and says what to do -- in that order --
 * and never shows a version number the reader has no use for.
 */
export function compatibilityNotice(state: ClientCompatibility): string {
  switch (state) {
    case 'UPDATE_AVAILABLE':
      return 'A newer version of Safety InSite is available.';
    case 'UPDATE_REQUIRED':
      return 'Safety InSite has been updated. Refresh to continue.';
    case 'INCOMPATIBLE':
      return 'This version of Safety InSite cannot reach the current server. Contact support before continuing.';
    default:
      return '';
  }
}
