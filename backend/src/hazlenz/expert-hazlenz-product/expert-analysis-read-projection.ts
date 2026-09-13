import type { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import type { AnalysisProducer, AnalysisState } from './expert-analysis-authority';
import { isExpertAnalysis } from './expert-analysis-currentness';

/**
 * §267 — THE READ AUTHORITY BOUNDARY FOR GENERIC INSPECTION PAYLOADS.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT §266 MEASURED.
 *
 * `GET /inspections/:id` loads `observations.analyses` as a relation and returns the rows whole.
 * That includes `server_authored` Expert rows in ANY state, with `resultSnapshot` intact — and the
 * route carries `JwtGuard` only: no `fullSafeScope` entitlement, no `effectiveDecision`, no
 * authority statement, no confirmation framing. A probe read `posture=CONTINUE_WITH_CONTROLS`
 * straight out of that payload while the analysis was still awaiting human confirmation.
 *
 * §266 held it at P1 because nothing renders it: the workspace reads `analyses` only to restore the
 * deterministic analysis, and the report PDF's extractor cannot read an Expert snapshot. So an
 * unsettled Expert proposal does not BECOME a product fact today. But containment that rests on
 * what no consumer happens to do is not a boundary — a future feature could render
 * `resultSnapshot.posture` from this payload with no compiler error, no runtime error and no guard.
 *
 * ---------------------------------------------------------------------------------------------
 * THE SMALLEST SAFE SOLUTION, AND WHY IT IS THIS ONE.
 *
 * The Expert review representation is served by the dedicated Expert read route, which carries the
 * full authority profile — JwtGuard, the `fullSafeScope` entitlement, RolesGuard, tenant isolation
 * through the same choke point, the server-derived `effectiveDecision` and the server's own
 * confirmation subject. Nothing is being taken away from anyone: the generic payload simply stops
 * being a SECOND, weaker way to read the same content.
 *
 * So this projection WITHHOLDS `resultSnapshot` from Expert rows and leaves deterministic rows
 * exactly as they were. Deterministic behaviour is not weakened in any respect — the customer's own
 * analysis, the workspace restoration and the report snapshot all read the same bytes they always
 * did.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY STATUS METADATA IS STILL SERVED, AND WHY IT IS NOT A CONCLUSION.
 *
 * §267 permits limited Expert status metadata in a generic payload provided "that metadata must not
 * itself expose an unsettled operational conclusion". The distinction the projection draws is
 * between the FACT THAT AN ANALYSIS EXISTS AND WHERE IT IS IN ITS LIFECYCLE, and WHAT IT CONCLUDED.
 *
 *   served      id, observationId, producer, status, analysisState, requestVersion, engineVersion,
 *               createdAt. `ANALYSIS_AWAITING_CONFIRMATION` names a lifecycle position; it says a
 *               human has not settled anything, which is the OPPOSITE of leaking a conclusion.
 *   withheld    `resultSnapshot` in its entirety — posture, hazard reasoning, driver role,
 *               required controls, unresolved declarations, the raw provider-derived content, and
 *               every field a future consumer could mistake for a settled operational answer.
 *
 * `expertResultWithheld: true` is present so a consumer that receives one of these can tell the
 * difference between "this Expert analysis concluded nothing" and "this payload is not the place
 * that serves Expert conclusions". A silent omission would render identically to an empty result,
 * and one of those two means "go and read the Expert route".
 *
 * ---------------------------------------------------------------------------------------------
 * IT IS A PROJECTION, NOT A FILTER, AND THAT IS DELIBERATE.
 *
 * Dropping Expert rows entirely would have been simpler and is wrong for the product: the workspace
 * needs to know an Expert analysis EXISTS on an observation in order to offer the panel and to keep
 * the two families distinguishable in history. Removing the rows would also make the deterministic
 * reader's job LOOK correct for the wrong reason — it would stop seeing Expert rows because none
 * were sent, rather than because it scopes its own read by producer. §267 requires both.
 */
export interface WithheldExpertAnalysisSummary {
  readonly id: string;
  readonly observationId: string;
  readonly producer: AnalysisProducer;
  readonly status: 'current' | 'superseded';
  readonly analysisState: AnalysisState;
  readonly requestVersion: number;
  readonly engineVersion: string;
  readonly createdAt: Date;
  /** Always true. Names the withholding so an empty result and a withheld one cannot be confused. */
  readonly expertResultWithheld: true;
  /** Where the review representation is actually served, under the Expert authority profile. */
  readonly readThrough: string;
}

export type GenericallyReadableAnalysis = HazLenzAnalysis | WithheldExpertAnalysisSummary;

export function isWithheldExpertSummary(
  row: GenericallyReadableAnalysis,
): row is WithheldExpertAnalysisSummary {
  return (row as WithheldExpertAnalysisSummary).expertResultWithheld === true;
}

/**
 * Project ONE analysis row for a generic (non-Expert-authority) read.
 *
 * The Expert branch constructs a NEW object listing exactly the fields it serves, rather than
 * copying the row and deleting `resultSnapshot`. A delete-based projection leaks by default: a
 * column added to the entity later would flow straight through it. This one withholds by default —
 * a new column reaches a generic reader only if someone adds it here on purpose.
 */
export function projectAnalysisForGenericRead(row: HazLenzAnalysis): GenericallyReadableAnalysis {
  if (!isExpertAnalysis(row)) return row;
  return {
    id: row.id,
    observationId: row.observationId,
    producer: row.producer,
    status: row.status,
    analysisState: row.analysisState,
    requestVersion: row.requestVersion,
    engineVersion: row.engineVersion,
    createdAt: row.createdAt,
    expertResultWithheld: true,
    readThrough: 'GET /inspections/observations/:id/expert-analyses/current',
  };
}

export function projectAnalysesForGenericRead(
  rows: readonly HazLenzAnalysis[] | null | undefined,
): GenericallyReadableAnalysis[] {
  return (rows ?? []).map(projectAnalysisForGenericRead);
}
