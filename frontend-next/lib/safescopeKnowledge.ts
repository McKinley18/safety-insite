import { apiFetch } from "./apiFetch";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export async function listSafeScopeKnowledgeDocuments() {
  const response = await apiFetch(
    `${API_BASE_URL}/safescope-knowledge/documents`,
  );

  if (!response.ok) {
    throw new Error("Unable to load ReviewCore knowledge documents.");
  }

  return response.json();
}

export async function searchSafeScopeKnowledge(input: {
  query: string;
  agency?: string;
  approvedOnly?: boolean;
  limit?: number;
}) {
  const response = await apiFetch(
    `${API_BASE_URL}/safescope-knowledge/search`,
    {
      method: "POST",
      body: JSON.stringify({
        query: input.query,
        agency: input.agency || "all",
        approvedOnly: input.approvedOnly ?? true,
        limit: input.limit || 8,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Unable to search ReviewCore Knowledge Brain.");
  }

  return response.json();
}

export type ReviewCoreQueueActor = {
  actorId?: string;
  role?: "owner" | "admin" | "compliance_admin" | "safety_manager" | "field_inspector" | "viewer";
  planTier?: "individual" | "team" | "company";
};

export type ReviewCoreDraftInput = {
  id?: string;
  title: string;
  content: string;
  domain?: string;
  tags?: string[];
  authorityTier?: string;
  citation?: string;
  primaryCitation?: string;
  sourceReferences?: string[];
  guardrails?: Record<string, unknown>;
};

const DEFAULT_REVIEWCORE_ACTOR: Required<ReviewCoreQueueActor> = {
  actorId: "local-reviewer",
  role: "admin",
  planTier: "company",
};

function reviewCoreActor(actor?: ReviewCoreQueueActor) {
  return {
    ...DEFAULT_REVIEWCORE_ACTOR,
    ...(actor || {}),
  };
}

async function reviewCoreRequest(path: string, options: RequestInit = {}) {
  const response = await apiFetch(`${API_BASE_URL}/reviewcore/knowledge-queue${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.message || body?.error || "";
    } catch {
      detail = "";
    }

    throw new Error(detail || "ReviewCore knowledge queue request failed.");
  }

  return response.json();
}

export async function listReviewCoreKnowledgeQueue(actor?: ReviewCoreQueueActor) {
  return reviewCoreRequest("/queue", {
    method: "POST",
    body: JSON.stringify({ actor: reviewCoreActor(actor) }),
  }).catch(async () => {
    // The backend exposes queue listing as GET. This fallback keeps the client
    // compatible if an environment/proxy blocks POST-style reads.
    return reviewCoreRequest("/queue");
  });
}

export async function getReviewCoreKnowledgeQueueItem(recordId: string, actor?: ReviewCoreQueueActor) {
  const params = new URLSearchParams();
  const resolvedActor = reviewCoreActor(actor);
  params.set("actorId", resolvedActor.actorId);
  params.set("role", resolvedActor.role);
  params.set("planTier", resolvedActor.planTier);

  return reviewCoreRequest(`/queue/${encodeURIComponent(recordId)}?${params.toString()}`);
}

export async function createReviewCoreKnowledgeDraft(input: ReviewCoreDraftInput, actor?: ReviewCoreQueueActor) {
  return reviewCoreRequest("/drafts", {
    method: "POST",
    body: JSON.stringify({
      actor: reviewCoreActor(actor),
      request: input,
    }),
  });
}

export async function approveReviewCoreKnowledgeRecord(recordId: string, actor?: ReviewCoreQueueActor) {
  return reviewCoreRequest(`/queue/${encodeURIComponent(recordId)}/approve`, {
    method: "POST",
    body: JSON.stringify({
      actor: reviewCoreActor(actor),
      request: {},
    }),
  });
}

export async function rejectReviewCoreKnowledgeRecord(recordId: string, reason: string, actor?: ReviewCoreQueueActor) {
  return reviewCoreRequest(`/queue/${encodeURIComponent(recordId)}/reject`, {
    method: "POST",
    body: JSON.stringify({
      actor: reviewCoreActor(actor),
      request: { reason },
    }),
  });
}

export async function requestMoreInfoForReviewCoreKnowledgeRecord(
  recordId: string,
  reason: string,
  actor?: ReviewCoreQueueActor,
) {
  return reviewCoreRequest(`/queue/${encodeURIComponent(recordId)}/request-more-info`, {
    method: "POST",
    body: JSON.stringify({
      actor: reviewCoreActor(actor),
      request: { reason },
    }),
  });
}

export async function listReviewCoreActiveRetrievalRecords(actor?: ReviewCoreQueueActor) {
  const params = new URLSearchParams();
  const resolvedActor = reviewCoreActor(actor);
  params.set("actorId", resolvedActor.actorId);
  params.set("role", resolvedActor.role);
  params.set("planTier", resolvedActor.planTier);

  return reviewCoreRequest(`/active-retrieval?${params.toString()}`);
}

export async function getReviewCorePersistenceReadiness(actor?: ReviewCoreQueueActor) {
  const params = new URLSearchParams();
  const resolvedActor = reviewCoreActor(actor);
  params.set("actorId", resolvedActor.actorId);
  params.set("role", resolvedActor.role);
  params.set("planTier", resolvedActor.planTier);

  return reviewCoreRequest(`/persistence-readiness?${params.toString()}`);
}

