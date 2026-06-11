"use client";

import { useEffect, useMemo, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { Badge } from "@/components/ui/Badge";
import LockedFeatureCard from "@/components/ui/LockedFeatureCard";
import {
  listSafeScopeKnowledgeDocuments,
  searchSafeScopeKnowledge,
} from "@/lib/safescopeKnowledge";
import {
  getStoredPlanCode,
  hasPlanEntitlement,
  type PlanCode,
} from "@/lib/planEntitlements";

function authorityLabel(tier: any) {
  const value = Number(tier || 5);

  if (value === 1) return "Tier 1 · Primary authority";
  if (value === 2) return "Tier 2 · Agency guidance";
  if (value === 3) return "Tier 3 · Incident learning";
  if (value === 4) return "Tier 4 · Research / case study";

  return "Tier 5 · Internal / supporting reference";
}

function formatPercent(value: any) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0%";
  return `${Math.round(number * 100)}%`;
}

export default function SafeScopeKnowledgePage() {
  const [planCode, setPlanCode] = useState<PlanCode>("basic");
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");

  const [query, setQuery] = useState("unguarded conveyor pulley near walkway");
  const [agency, setAgency] = useState("all");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);

  useEffect(() => {
    setPlanCode(getStoredPlanCode());

    async function loadDocuments() {
      try {
        setDocumentsLoading(true);
        setDocumentsError("");
        const data = await listSafeScopeKnowledgeDocuments();
        setDocuments(Array.isArray(data) ? data : []);
      } catch (error) {
        setDocumentsError(
          error instanceof Error
            ? error.message
            : "Unable to load SafeScope Knowledge Brain.",
        );
      } finally {
        setDocumentsLoading(false);
      }
    }

    loadDocuments();
  }, []);

  const metrics = useMemo(() => {
    const approved = documents.filter(
      (document) => document.approvalStatus === "approved",
    ).length;

    const agencies = new Set(documents.map((document) => document.agency));
    const sourceTypes = new Set(
      documents.map((document) => document.sourceType),
    );

    return {
      total: documents.length,
      approved,
      agencies: agencies.size,
      sourceTypes: sourceTypes.size,
    };
  }, [documents]);

  async function runSearch(event?: React.FormEvent) {
    event?.preventDefault();

    if (!query.trim()) {
      setSearchError("Enter a search phrase or observed hazard.");
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      const result = await searchSafeScopeKnowledge({
        query,
        agency,
        approvedOnly: true,
        limit: 8,
      });

      setSearchResult(result);
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "SafeScope Knowledge Brain search failed.",
      );
    } finally {
      setSearchLoading(false);
    }
  }

  const canAccessKnowledgeLibrary = hasPlanEntitlement("auditTrail", planCode);

  if (!canAccessKnowledgeLibrary) {
    return (
      <LockedFeatureCard
        eyebrow="Company Knowledge Library"
        title="SafeScope Knowledge Library is Company-only."
        description="The approved knowledge library controls governed reference intelligence, source review, and retrieval behavior used to support SafeScope outputs."
        requiredPlan="Company"
        bullets={[
          "View approved reference records and source authority levels.",
          "Protect source-backed regulatory reasoning behind Company inspections.",
          "Keep knowledge governance separate from Basic and Pro field workflows.",
        ]}
        ctaLabel="View Company Plan"
      />
    );
  }

  return (
    <section className="space-y-5">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          SafeScope Knowledge
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Governed reference intelligence.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Review the approved reference brain behind SafeScope hazard recognition, standards reasoning, incident learning, and mitigation support.
        </p>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-4 justify-center gap-1.5 sm:gap-2">
          {[
            [String(metrics.total), "Documents"],
            [String(metrics.approved), "Approved"],
            [String(metrics.agencies), "Agencies"],
            [String(metrics.sourceTypes), "Source Types"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-2 py-2 text-center"
            >
              <p className="text-lg font-black tracking-tight text-white sm:text-xl">
                {value}
              </p>
              <p className="mt-0.5 truncate text-[8px] font-black uppercase tracking-wide text-slate-300 sm:text-[9px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </HeroPanel>

      <AppPanel padding="md" className="rounded-[24px] p-5 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#F97316]">
              Brain Search
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Test Reference Retrieval
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Search the approved local knowledge database the same way
              SafeScope retrieves supporting references during inspections.
            </p>
          </div>

          {searchResult && (
            <div className="rounded-xl bg-[#E8F4FF] px-3 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                Confidence
              </p>
              <p className="text-lg font-black text-[#102A43]">
                {formatPercent(searchResult.confidence)}
              </p>
            </div>
          )}
        </div>

        <form
          onSubmit={runSearch}
          className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]"
        >
          <AppInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            fieldSize="sm"
            className="min-h-11 px-3 py-2 font-semibold"
            placeholder="Example: unguarded conveyor pulley near walkway"
          />

          <AppSelect
            value={agency}
            onChange={(event) => setAgency(event.target.value)}
            fieldSize="sm"
            className="min-h-11 px-3 py-2 font-black text-slate-800"
          >
            <option value="all">All agencies</option>
            <option value="MSHA">MSHA</option>
            <option value="OSHA">OSHA</option>
            <option value="NIOSH">NIOSH</option>
            <option value="Internal">Internal</option>
          </AppSelect>

          <AppButton
            type="submit"
            disabled={searchLoading}
            className="min-h-11 px-5 py-2"
          >
            {searchLoading ? "Searching..." : "Search Brain"}
          </AppButton>
        </form>

        {searchError && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-black text-red-700">
            {searchError}
          </p>
        )}

        {searchResult && (
          <div className="mt-5 space-y-4">
            {!!searchResult.matches?.length ? (
              searchResult.matches.map((match: any, index: number) => (
                <div
                  key={match.chunkId || index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-black text-slate-900">
                        {match.title || "Knowledge Reference"}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {match.agency || "Reference"} ·{" "}
                        {String(match.sourceType || "source").replaceAll(
                          "_",
                          " ",
                        )}
                      </p>
                    </div>

                    <Badge tone="white">
                      {authorityLabel(match.authorityTier)}
                    </Badge>
                  </div>

                  {match.citation && (
                    <p className="mt-3 text-xs font-black text-[#1D72B8]">
                      Citation: {match.citation}
                    </p>
                  )}

                  {match.reason && (
                    <p className="mt-2 text-xs font-bold leading-5 text-slate-600">
                      Why matched: {match.reason}
                    </p>
                  )}

                  {match.excerpt && (
                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                      {match.excerpt}
                    </p>
                  )}

                  {!!match.tags && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ...(match.tags.hazards || []),
                        ...(match.tags.equipment || []),
                        ...(match.tags.lessons || []),
                      ]
                        .slice(0, 8)
                        .map((tag: string) => (
                          <Badge key={tag} tone="white" className="text-slate-500">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-bold text-slate-500">
                No approved knowledge matches found.
              </p>
            )}

            {!!searchResult.reasoning?.evidenceGaps?.length && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-amber-800">
                  Evidence Gaps
                </p>

                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-bold leading-6 text-amber-900">
                  {searchResult.reasoning.evidenceGaps.map(
                    (gap: string, index: number) => (
                      <li key={index}>{gap}</li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </AppPanel>

      <AppPanel padding="md" className="rounded-[24px] p-5 sm:p-5">
        <div className="border-b border-slate-200 pb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
            Approved Library
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Knowledge Documents
          </h2>
        </div>

        {documentsLoading ? (
          <p className="mt-4 text-sm font-bold text-slate-500">
            Loading knowledge documents...
          </p>
        ) : documentsError ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-black text-red-700">
            {documentsError}
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-200">
            {documents.map((document) => (
              <div key={document.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">
                      {document.title}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {document.agency} ·{" "}
                      {String(document.sourceType || "source").replaceAll(
                        "_",
                        " ",
                      )}{" "}
                      · {authorityLabel(document.authorityTier)}
                    </p>
                  </div>

                  <Badge tone={document.approvalStatus === "approved" ? "green" : "slate"}>
                    {document.approvalStatus}
                  </Badge>
                </div>

                {document.citation && (
                  <p className="mt-2 text-xs font-black text-[#1D72B8]">
                    {document.citation}
                  </p>
                )}

                {document.summary && (
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    {document.summary}
                  </p>
                )}
              </div>
            ))}

            {!documents.length && (
              <p className="py-4 text-sm font-bold text-slate-500">
                No knowledge documents found. Run the backend seed script to
                load starter references.
              </p>
            )}
          </div>
        )}
      </AppPanel>
    </section>
  );
}
