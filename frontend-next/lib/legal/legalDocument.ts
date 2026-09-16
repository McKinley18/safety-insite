import { API_BASE_URL } from "@/lib/hazlenzClient";

/**
 * §308 (LG-3) — THE CLIENT'S VIEW OF A PUBLISHED LEGAL DOCUMENT.
 *
 * The server is the authority on publication state; this module only carries the answer across. In
 * particular it does NOT decide anything: there is no "if the body looks empty, show the
 * unavailable state" fallback here, because that would be a second opinion about whether a document
 * is published and the whole point of §308 is that there is exactly one.
 */

export type LegalDocumentType = "terms" | "privacy";

export type LegalDocumentResponse =
  | {
      documentType: LegalDocumentType;
      status: "ACTIVE";
      title: string;
      version: string;
      effectiveDate: string;
      documentDigest: string;
      body: string;
      acceptanceAvailable: true;
      synthetic: boolean;
    }
  | {
      documentType: LegalDocumentType;
      status: "NOT_YET_PUBLISHED";
      title: string;
      reason: string;
      acceptanceAvailable: false;
      awaiting: string;
    };

export class LegalDocumentUnreachable extends Error {}

/**
 * Fetch the publication state of one document type.
 *
 * A NETWORK FAILURE IS NOT "NOT PUBLISHED", and the distinction is the reason this throws rather
 * than returning the unavailable shape. Rendering "no Terms have been published" because a request
 * timed out would be the page asserting a legal fact it does not know — the same class of mistake
 * as a dependency gate reporting PASS when it could not reach a registry.
 */
export async function fetchLegalDocument(
  documentType: LegalDocumentType,
  signal?: AbortSignal,
): Promise<LegalDocumentResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/legal/documents/${documentType}`, {
      method: "GET",
      headers: { accept: "application/json" },
      signal,
    });
  } catch (cause) {
    throw new LegalDocumentUnreachable(
      "The legal document service could not be reached.",
      { cause } as ErrorOptions,
    );
  }
  if (!response.ok) {
    throw new LegalDocumentUnreachable(
      `The legal document service answered ${response.status}.`,
    );
  }
  return (await response.json()) as LegalDocumentResponse;
}
