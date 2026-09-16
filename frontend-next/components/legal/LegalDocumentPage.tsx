"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import { APP_NAME } from "@/lib/brand";
import {
  LegalDocumentResponse, LegalDocumentType, LegalDocumentUnreachable, fetchLegalDocument,
} from "@/lib/legal/legalDocument";
import { renderLegalBody } from "@/lib/legal/renderLegalBody";

/**
 * §308 (LG-3) — THE SHARED LEGAL PUBLICATION PAGE.
 *
 * ---------------------------------------------------------------------------------------------
 * ONE COMPONENT FOR BOTH DOCUMENTS, DELIBERATELY.
 *
 * `/terms` and `/privacy` differ only in which document they ask for. Two near-identical pages is
 * two places for the pre-publication wording to drift, and the pre-publication wording is the part
 * §308 constrains most tightly — it must not claim an effective date, must not present a draft,
 * and must not imply acceptance is possible. Keeping it in one place means it is reviewed once.
 *
 * ---------------------------------------------------------------------------------------------
 * FOUR STATES, AND "UNREACHABLE" IS NOT "UNPUBLISHED".
 *
 *   loading      the request is in flight
 *   ACTIVE       an approved, effective document — rendered exactly as the server supplied it
 *   NOT_YET_PUBLISHED  the honest pre-publication state
 *   unreachable  the service could not be asked
 *
 * The fourth exists because collapsing it into the third would make the page assert a legal fact it
 * does not know. "No Terms have been published" is a statement about the product; a failed fetch is
 * a statement about a network. Saying the first when only the second is true is the same class of
 * mistake as a scanner reporting PASS when it could not run.
 *
 * ---------------------------------------------------------------------------------------------
 * THE BODY IS RENDERED THROUGH `renderLegalBody`, WHICH HAS NO HTML SINK.
 *
 * There is no `dangerouslySetInnerHTML` on this page or anywhere beneath it. A hostile document
 * body reaches the DOM as text nodes.
 */

const LABELS: Record<LegalDocumentType, { heading: string; nav: string }> = {
  terms: { heading: "Terms of Service", nav: "Terms" },
  privacy: { heading: "Privacy Notice", nav: "Privacy" },
};

function formatEffectiveDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

export function LegalDocumentPage({ documentType }: { documentType: LegalDocumentType }) {
  const [document, setDocument] = useState<LegalDocumentResponse | null>(null);
  const [unreachable, setUnreachable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchLegalDocument(documentType, controller.signal);
        if (!cancelled) setDocument(result);
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        if (error instanceof LegalDocumentUnreachable) setUnreachable(true);
        else setUnreachable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, [documentType]);

  const labels = LABELS[documentType];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs font-bold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-[#1D72B8] dark:hover:text-[#5DB7FF]">
          {APP_NAME}
        </Link>
        <span className="mx-2 opacity-60">/</span>
        <span className="text-slate-700 dark:text-slate-200">{labels.nav}</span>
      </nav>

      {loading ? (
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400" role="status">
          Loading {labels.heading.toLowerCase()}…
        </p>
      ) : null}

      {!loading && unreachable ? (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-700/60 dark:bg-amber-950/30">
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {labels.heading}
          </h1>
          {/*
            DELIBERATELY DOES NOT SAY "NOT PUBLISHED". The page does not know that. It knows it
            could not ask.
          */}
          <p className="mt-3 text-[15px] leading-7 text-slate-700 dark:text-slate-200">
            This document could not be loaded right now. This is a temporary problem reaching the
            service, and it is not a statement about whether a {labels.heading.toLowerCase()} has
            been published. Please try again shortly.
          </p>
        </section>
      ) : null}

      {!loading && document?.status === "ACTIVE" ? (
        <article>
          <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {document.title}
            </h1>
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <div>
                <dt className="uppercase tracking-wide opacity-70">Version</dt>
                <dd className="mt-0.5 font-mono text-[13px] text-slate-900 dark:text-white">
                  {document.version}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide opacity-70">Effective</dt>
                <dd className="mt-0.5 text-[13px] text-slate-900 dark:text-white">
                  {formatEffectiveDate(document.effectiveDate)}
                </dd>
              </div>
              <div>
                {/*
                  THE DIGEST IS SHOWN, AND THAT IS NOT DECORATION. It is what a person who accepted
                  this document can compare their acceptance record against — the acceptance row
                  stores this exact value. Publishing it is what makes "we did not change the text
                  underneath you" checkable by the person it was promised to rather than only by us.
                */}
                <dt className="uppercase tracking-wide opacity-70">Document digest</dt>
                <dd className="mt-0.5 break-all font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {document.documentDigest}
                </dd>
              </div>
            </dl>

            {document.synthetic ? (
              <p className="mt-5 rounded-xl border-2 border-red-500 bg-red-50 p-3 text-sm font-black uppercase tracking-wide text-red-700 dark:bg-red-950/40 dark:text-red-300">
                Synthetic test document — not a legal document and not operative.
              </p>
            ) : null}
          </header>

          <div className="mt-2 space-y-4">{renderLegalBody(document.body)}</div>
        </article>
      ) : null}

      {!loading && document?.status === "NOT_YET_PUBLISHED" ? (
        <section>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {document.title}
          </h1>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Not yet published
            </p>
            {/*
              NO VERSION, NO EFFECTIVE DATE, NO BODY. There is nothing to show because nothing has
              been approved, and the page says exactly that rather than showing an unapproved draft
              or implying a document exists that a reader simply cannot see.
            */}
            <p className="mt-3 text-[15px] leading-7 text-slate-700 dark:text-slate-200">
              {document.reason}
            </p>
            <p className="mt-4 text-[15px] leading-7 text-slate-700 dark:text-slate-200">
              <span className="font-black">Awaiting:</span> {document.awaiting}
            </p>
            <p className="mt-4 text-[13px] font-semibold leading-6 text-slate-600 dark:text-slate-300">
              No version is in force, no effective date applies, and this document cannot be
              accepted. When an approved version is published it will appear here with its version,
              effective date and full text.
            </p>
          </div>

          <p className="mt-6 text-[13px] leading-6 text-slate-600 dark:text-slate-300">
            {documentType === "terms" ? (
              <>
                Current use is internal and owner-controlled, under the pre-release acknowledgement
                shown at sign-up. That acknowledgement is not a Terms of Service and has not been
                reviewed by legal counsel.
              </>
            ) : (
              <>
                Current use is internal and owner-controlled. Until an approved notice is published,
                do not enter information you would not be willing to have processed under
                pre-release conditions.
              </>
            )}
          </p>
        </section>
      ) : null}

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/terms" className="hover:text-[#1D72B8] dark:hover:text-[#5DB7FF]">Terms</Link>
          <Link href="/privacy" className="hover:text-[#1D72B8] dark:hover:text-[#5DB7FF]">Privacy</Link>
          <Link href="/legal" className="hover:text-[#1D72B8] dark:hover:text-[#5DB7FF]">Legal notices</Link>
          <Link href="/login" className="hover:text-[#1D72B8] dark:hover:text-[#5DB7FF]">Sign in</Link>
        </div>
      </footer>
    </main>
  );
}
