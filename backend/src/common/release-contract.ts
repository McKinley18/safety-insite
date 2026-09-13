/**
 * §279 — THE RELEASE COMPATIBILITY RULE. ONE FUNCTION, TWO COPIES, HELD TOGETHER BY A CHECKER.
 *
 * ==================== WHAT PROBLEM THIS SOLVES ====================
 *
 * §279 Part A measured the answer to "can an already-open Safety InSite session keep running old
 * code after a new release?" and the answer was YES, INDEFINITELY. Nothing in the product asked
 * the server what version it was talking to, so a tab left open on a truck dashboard for a week
 * kept executing the bundle it loaded on day one and kept writing safety-critical records with it.
 *
 * This module is the rule that ends that. It is deliberately a PURE FUNCTION over two inputs --
 * what the client is, and what the server says it supports -- so the same rule can be proven
 * against literal fixtures with no network, no browser and no database.
 *
 * ==================== WHY IT IS MIRRORED RATHER THAN SHARED ====================
 *
 * The backend and the frontend are separate npm projects with separate builds and no shared
 * package. `effective-severity.ts` already established the pattern §276 chose for this situation:
 * two copies, and a checker (`check:release-contract-parity`) that fails the build if the RULE
 * bodies diverge. A hand-maintained copy with nobody checking it is not an acceptable arrangement
 * here, and the frontend needs to evaluate this rule locally -- at boot, offline, and before it
 * has any idea whether the server is reachable.
 *
 * ==================== THE ONE SAFETY PROPERTY ====================
 *
 * A client is declared unusable ONLY on positive evidence from the server. Every failure to
 * obtain that evidence -- unreachable server, malformed contract, unparseable version on either
 * side -- resolves to UNKNOWN, which never blocks anything. An inspector standing in a plant with
 * a flaky connection must never be told the application is obsolete because a request timed out.
 * Fail-open is the correct posture here precisely BECAUSE the alternative failure -- refusing to
 * let someone record a hazard -- is the more dangerous one.
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
