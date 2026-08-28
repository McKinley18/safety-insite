import { DataSource } from 'typeorm';
import type { GovernedCutoverMode } from '../cutover/cutover-mode';
import { modeInfluencesCustomerOutput } from '../cutover/cutover-mode';

/**
 * INSPECTION RELEASE BINDING — 2026-08-28.
 *
 * =====================================================================================
 * THE DEFECT THIS ANSWERS
 * =====================================================================================
 *
 * `pinGovernedRelease()` reads the ACTIVE-release pointer. KG-4A pinned it once per analysis so
 * that an activation landing mid-analysis could not leave finding A governed by R1 and finding B by
 * R2, and that reasoning is correct — but its unit is the ANALYSIS. An inspection outlives its
 * analyses: it is reopened, re-analysed, amended and reported on, sometimes weeks apart. Under a
 * per-analysis pointer read, activating R2 would silently re-govern every subsequent re-analysis of
 * an inspection whose findings had been resolved under R1, and the customer's report would change
 * its regulatory basis without anyone deciding that it should.
 *
 * The measured evidence, taken before this module existed:
 *
 *     pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK')
 *       -> { releaseId: 'federal-core-2026-08-28.1', reason: 'PINNED_ACTIVE_RELEASE' }
 *
 * regardless of what the inspection had previously been governed by, because there was nowhere for
 * an inspection to record that at all.
 *
 * =====================================================================================
 * THE RULE
 * =====================================================================================
 *
 *     An inspection acquires a governing release ONCE, and keeps it.
 *
 * Concretely, and in this order:
 *
 *   1. the inspection already carries a release  -> use it, unchanged, forever;
 *   2. it carries none and a release is active   -> that release becomes the binding, written once;
 *   3. it carries none and nothing is active     -> no release governs the analysis. No id is
 *                                                   invented and nothing is written.
 *
 * Rule 1 has no exception here on purpose. Re-binding an inspection to a newer release is a
 * migration — a decision about historical regulatory content that a person makes deliberately —
 * and this module is the wrong place to make it implicitly. There is deliberately no
 * `rebind`/`force` parameter: an operation that can be reached by accident is not a decision.
 *
 * =====================================================================================
 * WHY IT LIVES ON THE INSPECTION AND NOT ON THE ANALYSIS
 * =====================================================================================
 *
 * `hazlenz_analyses.knowledgeReleaseId` already records which release governed ONE analysis, and it
 * stays the authority for that. But it can only be read after the analysis exists, and the release
 * has to be chosen BEFORE retrieval runs — so a per-analysis column cannot be the input to its own
 * analysis. The inspection is the longest-lived thing every analysis in a workflow shares, and it
 * is already the authority for the other cross-analysis regulatory fact (`regulatoryContext`), so
 * the binding sits beside it.
 *
 * =====================================================================================
 * SAFETY
 * =====================================================================================
 *
 * Total: never throws. Every failure resolves to `releaseId: null`, which downstream reports as
 * `NO_ACTIVE_RELEASE` / non-governed and which the fallback contract already handles — so a
 * governance outage degrades to legacy behaviour rather than to a 500 on a customer request, and
 * never to a fabricated release id.
 *
 * LEGACY and SHADOW never reach the database here at all. That keeps "LEGACY is a structural
 * no-op" a property of the code: a legacy request performs no binding read, no binding write, and
 * no pointer read.
 */

export type ReleaseBindingReason =
  /** The inspection already carried a release. It is reused verbatim; the pointer is not read. */
  | 'BOUND_RELEASE_REUSED'
  /** The inspection carried none; the active release was adopted and PERSISTED as its binding. */
  | 'BOUND_TO_ACTIVE_RELEASE'
  /** Nothing is active, so nothing governs this analysis. Not an error. */
  | 'NO_ACTIVE_RELEASE'
  /** LEGACY / SHADOW. Governed retrieval does not influence customer output, so no binding exists. */
  | 'GOVERNED_MODE_INACTIVE'
  /** An analysis with no persisted inspection. The active release governs it; nothing is stored. */
  | 'NO_INSPECTION_CONTEXT'
  /** The binding could not be read or written. Degrades to non-governed. */
  | 'BINDING_LOOKUP_FAILED';

export interface InspectionReleaseBinding {
  /** The release that governs THIS analysis, or null when none legitimately does. */
  releaseId: string | null;
  reason: ReleaseBindingReason;
  /** True only when this call wrote the binding — i.e. an inspection acquired its release. */
  newlyBound: boolean;
  inspectionId: string | null;
}

function unbound(
  reason: ReleaseBindingReason, inspectionId: string | null,
): InspectionReleaseBinding {
  return { releaseId: null, reason, newlyBound: false, inspectionId };
}

async function readActiveRelease(dataSource: DataSource): Promise<string | null> {
  const rows = await dataSource.query(
    `SELECT "releaseId" FROM regulatory_releases WHERE status = 'active' LIMIT 1`,
  );
  return rows?.[0]?.releaseId ? String(rows[0].releaseId) : null;
}

/**
 * Resolves — and, for a new inspection, establishes — the release that governs this analysis.
 *
 * Call this ONCE per analysis, before retrieval, and pass the result to `pinGovernedRelease()`.
 */
export async function resolveInspectionReleaseBinding(input: {
  dataSource: DataSource | null | undefined;
  inspectionId: string | null | undefined;
  mode: GovernedCutoverMode;
}): Promise<InspectionReleaseBinding> {
  const inspectionId = input.inspectionId ? String(input.inspectionId) : null;

  // The two modes in which governed content cannot reach the customer. Returning before touching
  // the database is what makes their inertness structural rather than measured.
  if (!modeInfluencesCustomerOutput(input.mode)) {
    return unbound('GOVERNED_MODE_INACTIVE', inspectionId);
  }
  const dataSource = input.dataSource;
  if (!dataSource) return unbound('BINDING_LOOKUP_FAILED', inspectionId);

  try {
    if (!inspectionId) {
      // An analysis with nothing to bind to. The active release genuinely governs this one
      // analysis, and saying so is truthful; there is simply no durable subject to record it on.
      const active = await readActiveRelease(dataSource);
      return active
        ? { releaseId: active, reason: 'NO_INSPECTION_CONTEXT', newlyBound: false, inspectionId: null }
        : unbound('NO_ACTIVE_RELEASE', null);
    }

    const existing = await dataSource.query(
      `SELECT "knowledgeReleaseId" FROM inspection WHERE id = $1`, [inspectionId],
    );
    if (!existing.length) return unbound('BINDING_LOOKUP_FAILED', inspectionId);

    const bound = existing[0]?.knowledgeReleaseId ? String(existing[0].knowledgeReleaseId) : null;
    if (bound) {
      // RULE 1. The pointer is deliberately NOT read here — not even to compare. A comparison
      // invites a "reconcile" branch, and the whole property is that there is nothing to reconcile.
      return { releaseId: bound, reason: 'BOUND_RELEASE_REUSED', newlyBound: false, inspectionId };
    }

    const active = await readActiveRelease(dataSource);
    if (!active) return unbound('NO_ACTIVE_RELEASE', inspectionId);

    // WRITE-ONCE, ENFORCED BY THE PREDICATE RATHER THAN BY ORDERING. `IS NULL` in the WHERE clause
    // means two analyses starting concurrently on the same fresh inspection cannot produce two
    // different bindings: the first commits, the second updates nothing and re-reads the value the
    // first wrote. The alternative — read, decide, write — is the last-writer-wins shape KG-5B
    // already had to repair once on the release pointer itself.
    const updated = await dataSource.query(
      `UPDATE inspection SET "knowledgeReleaseId" = $2
        WHERE id = $1 AND "knowledgeReleaseId" IS NULL
        RETURNING "knowledgeReleaseId"`,
      [inspectionId, active],
    );
    if (updated?.length) {
      return { releaseId: active, reason: 'BOUND_TO_ACTIVE_RELEASE', newlyBound: true, inspectionId };
    }
    const raced = await dataSource.query(
      `SELECT "knowledgeReleaseId" FROM inspection WHERE id = $1`, [inspectionId],
    );
    const winner = raced?.[0]?.knowledgeReleaseId ? String(raced[0].knowledgeReleaseId) : null;
    return winner
      ? { releaseId: winner, reason: 'BOUND_RELEASE_REUSED', newlyBound: false, inspectionId }
      : unbound('BINDING_LOOKUP_FAILED', inspectionId);
  } catch {
    return unbound('BINDING_LOOKUP_FAILED', inspectionId);
  }
}

/**
 * Read-only lookup of an inspection's binding.
 *
 * Used by the persistence layer to verify a client-supplied provenance claim against the release
 * the SERVER bound this inspection to. Never writes, so a verification path can never create a
 * binding as a side effect of checking one.
 */
export async function readInspectionReleaseBinding(
  dataSource: DataSource | null | undefined,
  inspectionId: string | null | undefined,
): Promise<string | null> {
  if (!dataSource || !inspectionId) return null;
  try {
    const rows = await dataSource.query(
      `SELECT "knowledgeReleaseId" FROM inspection WHERE id = $1`, [String(inspectionId)],
    );
    return rows?.[0]?.knowledgeReleaseId ? String(rows[0].knowledgeReleaseId) : null;
  } catch {
    return null;
  }
}
