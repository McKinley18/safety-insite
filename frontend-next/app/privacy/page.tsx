"use client";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

/**
 * §308 (LG-3) — `/privacy`.
 *
 * Same contract as `/terms`, and deliberately the same component: the pre-publication wording is
 * the part §308 constrains most tightly, and it is reviewed once rather than twice.
 */
export default function PrivacyPage() {
  return <LegalDocumentPage documentType="privacy" />;
}
