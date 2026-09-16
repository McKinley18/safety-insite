"use client";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

/**
 * §308 (LG-3) — `/terms`.
 *
 * The route LG-3 was raised about. It exists unconditionally and answers 200 whether or not a
 * document has been approved: §308 requires that this must never 404 "due missing engineering",
 * and a route that is only created once counsel approves would do exactly that.
 *
 * Client-rendered, because publication state is a SERVER fact that changes without a rebuild.
 * Prerendering it would bake today's state into the bundle, so the day counsel approves a document
 * the page would still say nothing is published until somebody remembered to redeploy the
 * frontend — a stale legal page is worse than a slow one.
 */
export default function TermsPage() {
  return <LegalDocumentPage documentType="terms" />;
}
