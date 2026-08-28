import { loadReleaseDefinition } from './release-definition';

/**
 * RELEASE IDENTITY IMMUTABILITY — 2026-08-28.
 *
 * =====================================================================================
 * THE DEFECT THIS ANSWERS, STATED PRECISELY
 * =====================================================================================
 *
 * `finalize-regulatory-release.ts` already holds the right rule and enforces it correctly:
 * re-finalizing a release id is an idempotent no-op when it reproduces the stored manifest, and an
 * explicit refusal when it would not. But that check reads
 * `regulatory_releases.manifestChecksum` FROM THE DATABASE IT IS CONNECTED TO, so its scope is one
 * database. In a fresh database `priorRecordCount` is 0, the guard does not engage, and the
 * script mints its default release id over whatever the corpus happens to hold.
 *
 * That is exactly what happened during the 2026-08-28 source-acquisition phase. Across three
 * disposable databases `federal-core-2026-07-30.1` named three materially different artifacts:
 *
 *     35 records  manifest 14a34fea…
 *     64 records  manifest 156a6c87…
 *     72 records  manifest 702339e5…
 *
 * No guard was bypassed and no historical row was rewritten. The release identifier simply was
 * not bound to a manifest anywhere that survives a database, and a checksum that distinguishes the
 * artifacts internally does not repair that: two artifacts a customer's provenance would both
 * call `federal-core-2026-07-30.1` are not the same release, and provenance that cannot tell them
 * apart is not provenance.
 *
 * =====================================================================================
 * WHY THIS IS NOT A NEW MECHANISM
 * =====================================================================================
 *
 * The binding that survives a database already exists: the version-controlled release definition
 * in `definitions/`, whose `expectedManifestChecksum` KG-5B defines as "a VERIFICATION, never an
 * input — the builder computes the manifest from the governed source set and REFUSES if a pin
 * disagrees. Nothing is ever adjusted to satisfy a pin."
 *
 * `prepareGovernedRelease` already honours that pin. The seed finalizer did not, because it
 * predates definitions and never consults them. This module is the missing half of an existing
 * contract, not a second contract: ONE function, applied by the finalizer, holding it to the same
 * pin the governed builder already obeys.
 *
 * =====================================================================================
 * THE INVARIANT
 * =====================================================================================
 *
 *   A release identifier refers to exactly one immutable manifest identity, in every environment.
 *
 * Consequences, each of which the accompanying gate asserts:
 *
 *   - an identical manifest under an existing id reproduces deterministically (idempotent, which
 *     is what the disposable-database seed workflow needs and what KG-3A already specified);
 *   - a DIFFERENT manifest under an existing id fails closed, and the operator must finalize a new
 *     release identity;
 *   - an id with no version-controlled definition is refused rather than silently minted, because
 *     an unregistered id is by construction not bound to anything;
 *   - historical definitions are append-only: `federal-core-2026-07-30.1` keeps naming the
 *     35-record manifest forever, so inspection provenance that already cites it stays valid.
 */
export class ReleaseIdentityRefused extends Error {
  constructor(
    readonly releaseId: string,
    readonly computedManifest: string,
    readonly registeredManifest: string | null,
  ) {
    super(
      registeredManifest
        ? `Refusing to finalize release ${releaseId}: its version-controlled definition pins ` +
          `manifest ${registeredManifest}, and this run computes ${computedManifest}. A release ` +
          `identifier names exactly one immutable manifest — finalize a NEW release identity ` +
          `instead of re-pointing this one.`
        : `Refusing to finalize release ${releaseId}: no version-controlled release definition ` +
          `registers this identifier, so it is bound to no content. Add a definition under ` +
          `standards/releases/definitions/ before finalizing.`,
    );
    this.name = 'ReleaseIdentityRefused';
  }
}

/**
 * Refuses unless `computedManifest` is the manifest this release identifier is registered to name.
 *
 * Deliberately pure and database-free: the whole point is that the binding must hold in an
 * environment that has never seen this release before.
 */
/**
 * `ownedDisposable` is the KG-4C ownership marker the legacy-corpus guard already computes at the
 * same point in the finalizer: a claim written INTO the database by a verification suite that
 * claimed it, requiring a `test_*` name, absence from `PROTECTED_DATABASE_NAMES`, and
 * `KG_TEST_DB_INITIALIZE_OWNERSHIP` naming that database exactly. Production can never carry one.
 *
 * It exempts ONE case and only one: an UNREGISTERED release identifier in an owned disposable
 * database. That is what governance suites legitimately need — `test:release-integrity-and-approval`
 * finalizes synthetic fixture releases such as `kg3a-release.A` over deliberately fabricated
 * corpora precisely to prove the integrity and approval machinery refuses what it should.
 * Requiring a version-controlled definition for those fixtures would make the guard disable the
 * tests that protect the same invariants, which is how guards get deleted.
 *
 * It does NOT exempt the case that matters: a REGISTERED identifier whose pinned manifest
 * disagrees is refused everywhere, owned database or not. No fixture needs to re-point a real
 * release identity, so nothing legitimate is blocked and the invariant is untouched.
 */
export function assertManifestMatchesDefinition(
  releaseId: string,
  computedManifest: string,
  options: { ownedDisposable?: boolean } = {},
): void {
  let registered: string | null = null;
  try {
    registered = loadReleaseDefinition(releaseId).expectedManifestChecksum ?? null;
  } catch {
    // No definition for this identifier.
    if (options.ownedDisposable) return;
    throw new ReleaseIdentityRefused(releaseId, computedManifest, null);
  }
  if (!registered) {
    if (options.ownedDisposable) return;
    throw new ReleaseIdentityRefused(releaseId, computedManifest, null);
  }
  if (registered !== computedManifest) {
    // Deliberately NOT exempted by ownership: re-pointing a registered release identity is the
    // defect this module exists to prevent, and it is wrong in every environment.
    throw new ReleaseIdentityRefused(releaseId, computedManifest, registered);
  }
}
