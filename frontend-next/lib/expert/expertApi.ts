import { authHeaders } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { API_BASE_URL } from "@/lib/hazlenzClient";
import type {
  ExpertAnalysisExecuted,
  ExpertAnalysisRead,
  ExpertSettlementResult,
} from "./expertTypes";

/**
 * §265 — THE THREE EXPERT CALLS, AND NOTHING ELSE.
 *
 * ---------------------------------------------------------------------------------------------
 * ONLY THE ACCEPTED §262/§264 FIELDS ARE EVER SENT.
 *
 * The execution body carries `idempotencyKey` and the two genuinely user-authored context fields.
 * The settlement body carries the decision, the rationale, the replacements and a key. There is no
 * producer, no analysis state, no confirmation flag, no candidate identity, no reviewer id — the
 * reviewer is the authenticated principal and a reviewer id a client could send is a reviewer id a
 * client could forge. The server rejects anything else with 400 before its controller runs, so this
 * file's job is to not try.
 *
 * ---------------------------------------------------------------------------------------------
 * §267 — AND IT NO LONGER CARRIES `requestVersion`. THE CLIENT DOES NOT SEQUENCE EXPERT REQUESTS.
 *
 * §265 sent `requestVersion: 1` on every Expert request. The Expert panel only renders once a
 * deterministic analysis exists, and that analysis already occupies version 1 — so §266 measured
 * every Expert run from the real workflow spending a provider leg and THEN colliding, returning
 * 409 "A newer analysis request already exists" against money that was already gone.
 *
 * The lesson is not "compute the version more carefully here". A client-chosen version is a
 * client-chosen collision: the browser does not hold the observation's analysis history, cannot see
 * an Expert execution another tab has in flight, and has no way to reserve an ordinal. The server
 * derives it under the advisory lock that serialises the table, at claim time, before the transport
 * is reachable. So this module sends no version at all, and there is no field here to get wrong.
 *
 * ---------------------------------------------------------------------------------------------
 * THE IDEMPOTENCY KEY IS PER USER ACTION, NOT PER REQUEST.
 *
 * An Expert analysis is the most expensive thing the product does. A key minted fresh on every
 * retry would turn a flaky network into duplicate spend, which is the failure the server's
 * pre-spend claim exists to prevent and which the client should not be forcing it to catch. So the
 * key is derived from the observation and the action, and a retry of the same intent reuses it.
 */
export const EXPERT_ANALYSIS_ERROR = {
  /** The account's plan does not include Expert analysis. */
  NOT_ENTITLED: "EXPERT_NOT_ENTITLED",
  /** The session expired. */
  AUTH_REQUIRED: "AUTH_REQUIRED",
} as const;

export class ExpertApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = "ExpertApiError";
    this.status = status;
    this.code = code;
  }
}

async function expertJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(
    `${API_BASE_URL}${path}`,
    { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } },
    // Retries are off for the two writes: the server is idempotent under the key this module
    // supplies, but a silent client retry would still hide a slow response behind a second one.
    { retries: 0 },
  );
  if (response.status === 401) {
    throw new ExpertApiError("Your session has expired.", 401, EXPERT_ANALYSIS_ERROR.AUTH_REQUIRED);
  }
  if (response.status === 403) {
    throw new ExpertApiError(
      "Expert analysis is not included in this plan.",
      403,
      EXPERT_ANALYSIS_ERROR.NOT_ENTITLED,
    );
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ExpertApiError(
      (body as { message?: string } | null)?.message || "The Expert analysis could not be completed.",
      response.status,
    );
  }
  return (await response.json()) as T;
}

/**
 * A stable key for "this inspector asked for Expert analysis of this observation, attempt N".
 * `attempt` increments only when the user deliberately asks again after a failure, so an accidental
 * double-click or a retried fetch resolves to the execution that already ran.
 */
export function expertIdempotencyKey(observationId: string, attempt: number): string {
  return `expert-${observationId}-${attempt}`;
}

export function expertSettlementKey(analysisId: string, attempt: number): string {
  return `settle-${analysisId}-${attempt}`;
}

export async function requestExpertAnalysis(
  observationId: string,
  input: {
    idempotencyKey: string;
    taskContext?: string;
    answeredClarifications?: Array<{ clarificationId: string; answer: string }>;
  },
): Promise<ExpertAnalysisExecuted> {
  // §267. NO `requestVersion`. The server allocates the execution version; see the header.
  const body: Record<string, unknown> = {
    idempotencyKey: input.idempotencyKey,
  };
  // Omitted rather than sent null: the DTO permits absence, and sending an empty value would put a
  // context statement into the Expert input that the inspector never wrote.
  if (input.taskContext && input.taskContext.trim()) body.taskContext = input.taskContext.trim();
  if (input.answeredClarifications?.length) {
    body.answeredClarifications = input.answeredClarifications;
  }
  return expertJson<ExpertAnalysisExecuted>(
    `/inspections/observations/${encodeURIComponent(observationId)}/expert-analyses`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function readExpertAnalysis(observationId: string): Promise<ExpertAnalysisRead> {
  return expertJson<ExpertAnalysisRead>(
    `/inspections/observations/${encodeURIComponent(observationId)}/expert-analyses/current`,
  );
}

/**
 * CONFIRM AND CHANGE ARE ONE CALL, because the server serves them as one transition. Splitting
 * them here would invite a client that believes they are two different acts with two different
 * eligibility rules, which is exactly the drift §264 collapsed into a single route.
 */
export async function settleExpertAnalysis(
  observationId: string,
  analysisId: string,
  input: {
    idempotencyKey: string;
    decision: "classification_confirmed" | "classification_changed";
    rationale: string;
    replacements?: Array<{ refKind: string; ref: string; classification: string }>;
    comment?: string;
  },
): Promise<ExpertSettlementResult> {
  const body: Record<string, unknown> = {
    idempotencyKey: input.idempotencyKey,
    decision: input.decision,
    rationale: input.rationale,
  };
  if (input.decision === "classification_changed" && input.replacements?.length) {
    body.replacements = input.replacements;
  }
  if (input.comment && input.comment.trim()) body.comment = input.comment.trim();
  return expertJson<ExpertSettlementResult>(
    `/inspections/observations/${encodeURIComponent(observationId)}`
      + `/expert-analyses/${encodeURIComponent(analysisId)}/settlement`,
    { method: "POST", body: JSON.stringify(body) },
  );
}
