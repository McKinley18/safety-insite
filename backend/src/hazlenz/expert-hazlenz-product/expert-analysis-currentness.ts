import type { EntityManager } from 'typeorm';

import type { AnalysisProducer } from './expert-analysis-authority';

/**
 * §267 — PRODUCER-SCOPED CURRENTNESS, AND THE SERVER-DERIVED REQUEST VERSION.
 *
 * ---------------------------------------------------------------------------------------------
 * THE ONE SENTENCE THIS MODULE EXISTS TO MAKE TRUE.
 *
 *   DETERMINISTIC HAZLENZ AND EXPERT HAZLENZ COEXIST ON ONE OBSERVATION AND ARE NOT
 *   INTERCHANGEABLE VERSIONS OF ONE ANALYSIS.
 *
 * §266 measured what happens when they are treated as one linear stream: a successful Expert run
 * marked the customer-authoritative deterministic analysis `superseded`, the workspace restored the
 * newest non-superseded row, and the deterministic UI was handed an Expert snapshot it then read
 * through the wrong schema. That is not a display bug — an ADVISORY layer had taken the
 * customer-authoritative record's place at the data level.
 *
 * The repair splits ONE overloaded concept into TWO, and the split is the whole design:
 *
 *   `requestVersion`  orders REQUESTS against one observation. It is a per-observation ordinal,
 *                     shared by both producers, and it confers NO authority. Its only jobs are to
 *                     keep `uq_hazlenz_analysis_observation_version` satisfiable and to give
 *                     history a stable order.
 *   `status`          carries CURRENTNESS, and currentness is now scoped BY PRODUCER. There is a
 *                     current deterministic analysis and a current Expert analysis, and neither
 *                     supersedes the other.
 *
 * WHY THE ORDINAL STAYS SHARED RATHER THAN BECOMING PER-PRODUCER. A per-producer sequence would
 * mean D1 and E1 both wanting version 1, which the existing unique index on
 * `(observationId, requestVersion)` forbids — so it would require a migration that changes an index
 * on a live table in order to express something the product does not actually need. Currentness is
 * what the product needs, and the `producer` column already expresses it. §267 authorizes a
 * migration only where query repair cannot do the job; here it can, so none is added.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE CLIENT NO LONGER CHOOSES THE EXPERT VERSION.
 *
 * §266 measured the shipped §265 client sending `requestVersion: 1` on every Expert request. The
 * Expert panel only renders once a deterministic analysis exists, and that analysis already
 * occupies version 1 — so every Expert run from the real workflow reached
 * `persistAuthoritativeAnalysis`, discovered the collision, and returned 409 AFTER a provider leg
 * had been spent. A client-chosen version is a client-chosen collision, and the collision was
 * being discovered on the far side of the money.
 *
 * The version is now DERIVED BY THE SERVER, under the same advisory lock that serialises every
 * other write to this table, at CLAIM time — which is before the transport is reachable. A client
 * that supplies no version gets the allocation; a client that supplies a version gets it
 * ADJUDICATED, and a stale or invented one is refused there, pre-spend, with zero provider entry.
 */

/** The deterministic HazLenz family: the customer-authoritative, client-held analysis. */
export const DETERMINISTIC_PRODUCER: AnalysisProducer = 'client_supplied';

/** The Expert HazLenz family: the server-authored advisory analysis. */
export const EXPERT_PRODUCER: AnalysisProducer = 'server_authored';

/**
 * THE ANALYSIS FAMILY — the unit within which currentness and supersession are scoped.
 *
 * It is deliberately a projection of `producer` rather than a second column. A second column would
 * be a second place for the same fact to live and therefore a second place for it to disagree, and
 * §261 already made `producer` unforgeable: it is written from a literal at exactly two assignment
 * sites and is checked by a database constraint against `expertExecutionId`. Scoping currentness to
 * a derivation of that column inherits the guarantee instead of restating it.
 */
export type AnalysisFamily = 'DETERMINISTIC' | 'EXPERT';

export function analysisFamilyOf(row: { readonly producer?: AnalysisProducer | null }): AnalysisFamily {
  // The DEFAULT IS THE WEAKER CLAIM, matching the column's own default. A row whose producer is
  // absent (a pre-§261 row read through a partial selection) is deterministic, because treating an
  // unknown row as Expert would let it be served through the Expert authority surface — the exact
  // promotion §261's trust boundary exists to prevent.
  return row.producer === EXPERT_PRODUCER ? 'EXPERT' : 'DETERMINISTIC';
}

export function isDeterministicAnalysis(
  row: { readonly producer?: AnalysisProducer | null },
): boolean {
  return analysisFamilyOf(row) === 'DETERMINISTIC';
}

export function isExpertAnalysis(row: { readonly producer?: AnalysisProducer | null }): boolean {
  return analysisFamilyOf(row) === 'EXPERT';
}

/**
 * CROSS-PRODUCER SUPERSESSION IS PROHIBITED, stated as a predicate rather than as a comment so the
 * rule is callable and testable.
 *
 * A new analysis may supersede a prior one only when the two belong to the same family. §267 froze
 * this: a new deterministic analysis may supersede the prior deterministic analysis, a new Expert
 * analysis may supersede the prior Expert analysis in the same lineage, and neither reaches across.
 */
export function maySupersede(
  incoming: { readonly producer?: AnalysisProducer | null },
  existing: { readonly producer?: AnalysisProducer | null },
): boolean {
  return analysisFamilyOf(incoming) === analysisFamilyOf(existing);
}

/**
 * Select the CURRENT analysis of one family from a set of rows.
 *
 * There is no `currentAnalysis(rows)` without a family argument, and that absence is the mechanism:
 * a caller cannot ask the ambiguous question §266 found being asked in four places in the
 * workspace. It must say which producer's current analysis it means.
 */
export function currentAnalysisOfFamily<
  T extends { readonly producer?: AnalysisProducer | null; readonly status?: string | null;
    readonly requestVersion?: number | null },
>(rows: readonly T[], family: AnalysisFamily): T | null {
  const candidates = rows
    .filter(row => analysisFamilyOf(row) === family && row.status !== 'superseded')
    .sort((a, b) => (b.requestVersion ?? 0) - (a.requestVersion ?? 0));
  return candidates[0] ?? null;
}

// ================================================================ the request-version ordinal

/**
 * THE HIGHEST REQUEST ORDINAL ALREADY SPOKEN FOR ON ONE OBSERVATION.
 *
 * IT READS TWO TABLES, AND THE SECOND ONE IS THE POINT. `hazlenz_analyses` holds versions that have
 * been USED; `expert_analysis_executions` holds versions that have been RESERVED by a claim whose
 * provider call has not returned yet. An Expert execution can sit in ANALYSIS_RUNNING for the
 * length of two hosted legs, during which its version exists nowhere in the analyses table — so a
 * deterministic rerun that consulted only the analyses table would allocate the same ordinal and
 * collide on the unique index, surfacing as a 500 rather than as the truthful "something else is
 * already using this version".
 *
 * MUST BE CALLED INSIDE THE TRANSACTION THAT HOLDS THE `hazlenz-analysis:<observationId>` ADVISORY
 * LOCK. The lock is what makes read-then-allocate safe: it is the existing convention for every
 * write to this table, and both the deterministic path and the Expert claim take it, so the two
 * cannot interleave between the MAX and the insert.
 */
export async function highestReservedRequestVersion(
  manager: EntityManager,
  observationId: string,
): Promise<number> {
  const rows: Array<{ highest: string | number | null }> = await manager.query(
    `SELECT GREATEST(
       COALESCE((SELECT MAX("requestVersion") FROM hazlenz_analyses WHERE "observationId" = $1), 0),
       COALESCE((SELECT MAX("requestVersion") FROM expert_analysis_executions WHERE "observationId" = $1), 0)
     ) AS highest`,
    [observationId],
  );
  const highest = rows[0]?.highest ?? 0;
  return typeof highest === 'number' ? highest : Number.parseInt(String(highest), 10) || 0;
}

export type RequestVersionAdjudication =
  | { readonly outcome: 'ALLOCATED'; readonly requestVersion: number }
  | {
    readonly outcome: 'STALE_OR_CONFLICTING';
    readonly requested: number;
    readonly wouldAllocate: number;
    readonly reason: string;
  };

/**
 * ADJUDICATE ONE EXPERT REQUEST'S EXECUTION VERSION, BEFORE ANY SPEND.
 *
 * Pure, so it is provable on literals and cannot acquire a database opinion later.
 *
 *   nothing supplied      the server allocates. This is the shipped client's path after §267 and
 *                         the design §267 names as preferred: the server derives the next Expert
 *                         execution generation itself.
 *   the same value        allowed, and it is NOT an exception to the rule. A client that
 *                         independently arrives at the ordinal the server would allocate has not
 *                         invented sequencing; it has agreed with it. Refusing agreement would
 *                         break §262 and §264's suites for no safety gain, and would refuse a
 *                         correct request.
 *   anything else         REFUSED, pre-spend. A LOWER value is the §266 defect exactly: the request
 *                         is stale, and the conflict it carries is knowable now rather than after a
 *                         provider leg. A HIGHER value is a client inventing sequencing — it would
 *                         punch a hole in the ordinal and it asserts knowledge of the observation's
 *                         analysis history that the client is not the authority on.
 *
 * BOTH REFUSALS RETURN THE SAME OUTCOME because both mean the same thing to the caller: do not
 * spend. The distinguishing detail is carried in `reason` for the audit and the message, not in a
 * second branch that a caller could treat as recoverable.
 */
export function adjudicateExpertRequestVersion(
  highestReserved: number,
  clientSupplied: number | null | undefined,
): RequestVersionAdjudication {
  const wouldAllocate = highestReserved + 1;
  if (clientSupplied === null || clientSupplied === undefined) {
    return { outcome: 'ALLOCATED', requestVersion: wouldAllocate };
  }
  if (clientSupplied === wouldAllocate) {
    return { outcome: 'ALLOCATED', requestVersion: wouldAllocate };
  }
  return {
    outcome: 'STALE_OR_CONFLICTING',
    requested: clientSupplied,
    wouldAllocate,
    reason: clientSupplied < wouldAllocate
      ? 'the supplied request version is already in use on this observation'
      : 'the supplied request version skips ahead of this observation’s analysis history',
  };
}

/**
 * The customer-facing sentence for a pre-spend version refusal.
 *
 * It says what happened and what to do, and it deliberately does NOT say "try again with a higher
 * number": the fix is for the client to stop choosing, not to choose better. It also states the
 * one fact that makes the refusal good news rather than bad — nothing was spent.
 */
export function expertRequestVersionRefusal(adjudication: {
  readonly requested: number; readonly wouldAllocate: number;
}): string {
  return 'This Expert request carries an execution version that conflicts with this observation’s '
    + `analysis history (sent ${adjudication.requested}; this observation is at `
    + `${adjudication.wouldAllocate - 1}). No analysis was run and nothing was charged. Reload the `
    + 'observation and request the analysis again — the server assigns the execution version.';
}
