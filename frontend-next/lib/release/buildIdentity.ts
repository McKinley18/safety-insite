/**
 * §279 — WHAT THIS FRONTEND BUILD IS.
 *
 * The values come from `next.config.ts`, which resolves them at build time from the platform's
 * own variables, the package manifest and the git working tree, and inlines them here. Nothing on
 * this side is hand-maintained, so nothing on this side can go stale.
 *
 * `process.env.X` must be written out in full rather than read through a variable: Next replaces
 * these as literal text substitutions in the bundle, so an indirect lookup would produce
 * `undefined` in the browser.
 */

export interface FrontendBuildIdentity {
  /** The release version this contract is evaluated against. */
  readonly frontendVersion: string;
  /** Full commit, for support and debugging. Never the thing a user is asked to interpret. */
  readonly gitSha: string;
  readonly buildTimestamp: string;
}

function orUnknown(value: string | undefined): string {
  return value && value.trim() ? value.trim() : 'unknown';
}

export const buildIdentity: FrontendBuildIdentity = {
  frontendVersion: orUnknown(process.env.NEXT_PUBLIC_FRONTEND_VERSION),
  gitSha: orUnknown(process.env.NEXT_PUBLIC_GIT_SHA),
  buildTimestamp: orUnknown(process.env.NEXT_PUBLIC_BUILD_TIMESTAMP),
};

/**
 * The version a human is shown: "Safety InSite 1.0.0". A git commit is not a version number to
 * anybody but an engineer, so it is never what the application displays -- it stays available, in
 * full, one disclosure level down, where support can ask for it.
 */
export function displayVersion(): string {
  return buildIdentity.frontendVersion === 'unknown'
    ? 'Safety InSite (development build)'
    : `Safety InSite ${buildIdentity.frontendVersion}`;
}

/** The short commit, for a diagnostics line. Returns '' when there is nothing real to show. */
export function shortSha(): string {
  return buildIdentity.gitSha === 'unknown' ? '' : buildIdentity.gitSha.slice(0, 12);
}

/** The build date in the reader's locale, or '' when no real timestamp was stamped. */
export function displayBuildDate(): string {
  if (buildIdentity.buildTimestamp === 'unknown') return '';
  const parsed = new Date(buildIdentity.buildTimestamp);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
