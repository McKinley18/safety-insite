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
    throw new Error("Unable to load SafeScope knowledge documents.");
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
    throw new Error("Unable to search SafeScope Knowledge Brain.");
  }

  return response.json();
}
