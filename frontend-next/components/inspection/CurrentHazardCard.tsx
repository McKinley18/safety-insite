"use client";

import { formatStandardDisplay } from "@/lib/inspection/standardDisplay";
import { getHazLenzSuggestedStandards } from "@/lib/hazlenzStandardHelpers";
import { isDisplayableStandardCandidate } from "@/lib/inspection/standardDisplay";
import HazLenzFindingSummary from "@/components/inspection/HazLenzFindingSummary";

import { useEffect, useRef, useState } from "react";

type CurrentHazardCardProps = {
  currentStep: number;
  description: string;
  hazardCategory: string;
  location: string;
  photos: any[];
  safeScopeResult: any;
  selectedStandards: any[];
  selectedGeneratedActions: any[];
  manualActions: any[];
  currentFindingSaved: boolean;
};

function compactText(value: string, fallback: string) {
  return value?.trim() ? value.trim() : fallback;
}

function shortenReviewLabel(value: string) {
  return compactText(value, "")
    .replace(/^review needed\s*[-—–:]\s*/i, "")
    .replace(/^likely\s+/i, "")
    .replace(/\s+issue$/i, "")
    .replace(/guarding/i, "Guarding")
    .trim();
}


function normalizeConfidencePercent(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  const raw =
    typeof value === "string"
      ? Number(value.replace("%", "").trim())
      : Number(value);

  if (!Number.isFinite(raw)) return null;

  const percent = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);

  return Math.max(0, Math.min(100, percent));
}

export default function CurrentHazardCard({
  currentStep,
  description,
  hazardCategory,
  location,
  photos,
  safeScopeResult,
  selectedStandards,
  selectedGeneratedActions,
  manualActions,
  currentFindingSaved,
}: CurrentHazardCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);

  const hasData = Boolean(
    description ||
      hazardCategory ||
      location ||
      photos.length ||
      safeScopeResult ||
      selectedStandards.length ||
      selectedGeneratedActions.length ||
      manualActions.length,
  );

  useEffect(() => {
    setExpanded(false);
    setHidden(false);
  }, [currentStep]);

  useEffect(() => {
    if (!expanded) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target || !cardRef.current) return;

      if (!cardRef.current.contains(target)) {
        setExpanded(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  if (hidden) {
    return (
        <button
          type="button"
          onClick={() => setHidden(false)}
        className="sentinel-keyboard-hide fixed bottom-[calc(var(--sentinel-mobile-tabbar-height)-1.1rem)] left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-[#0B1320] px-4 py-2 text-xs font-black text-white shadow-xl shadow-slate-950/15 ring-1 ring-white/10 backdrop-blur transition hover:bg-[#1D72B8] lg:bottom-16"
      >
        Show Finding Builder
      </button>
    );
  }

  const rawCategory =
    hazardCategory ||
    safeScopeResult?.classification ||
    (photos.length || location || description
      ? "Unclassified finding"
      : "Finding in progress");

  const category = shortenReviewLabel(rawCategory) || rawCategory;

  const categorySource = hazardCategory
    ? "User selected"
    : safeScopeResult?.classification
      ? "HazLenz AI suggested"
      : "Not classified";

  const actionCount = selectedGeneratedActions.length + manualActions.length;
  const suggestedStandardsCount = safeScopeResult?.suggestedStandards?.length || 0;
  const selectedCount = selectedStandards.length;

  const riskLabel =
    safeScopeResult?.risk?.riskBand ||
    safeScopeResult?.risk?.operationalRisk?.matrixBand ||
    "Not rated";

  const confidenceValue = normalizeConfidencePercent(
    safeScopeResult?.confidenceIntelligence?.overallConfidence ??
      safeScopeResult?.confidence,
  );

  const confidenceLabel =
    confidenceValue !== null ? `${confidenceValue}%` : "Pending";

  const topStandardCandidate =
    (isDisplayableStandardCandidate(selectedStandards?.[0]) ? selectedStandards[0] : null) ||
    getHazLenzSuggestedStandards(safeScopeResult)?.[0] ||
    safeScopeResult?.primaryStandards?.[0] ||
    safeScopeResult?.suggestedStandards?.[0] ||
    safeScopeResult?.standardsReasoning?.topDefensible?.[0] ||
    safeScopeResult?.applicabilityIntelligence?.primaryApplicableStandards?.[0];

  const topStandard = topStandardCandidate
    ? formatStandardDisplay(topStandardCandidate) || "Pending"
    : "Pending";

  const riskTone =
    String(riskLabel).toLowerCase() === "critical"
      ? "bg-red-50 text-red-700 ring-red-100"
      : String(riskLabel).toLowerCase() === "high"
        ? "bg-orange-50 text-orange-700 ring-orange-100"
        : String(riskLabel).toLowerCase() === "moderate"
          ? "bg-amber-50 text-amber-700 ring-amber-100"
          : "bg-slate-50 text-slate-700 ring-slate-100";

  const primaryLine = location || "Location not added";
  const secondaryLine = compactText(
    description,
    "Add photos, location, and notes to build this finding.",
  );

  const detailsId = `finding-builder-details-${currentStep}`;

  return (
    <>
      <div className="sentinel-finding-builder-scroll-spacer sentinel-keyboard-hide" aria-hidden="true" />

      <div
        className="sentinel-keyboard-hide fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-[999998] px-3 pb-0 pointer-events-none lg:static lg:px-0"
        style={{ bottom: "calc(var(--sentinel-mobile-tabbar-height) - 1.65rem)" }}
      >
        <section
          ref={cardRef}
          className="pointer-events-auto mx-auto w-full max-w-3xl rounded-t-[18px] border border-slate-200 bg-white/95 text-slate-950 shadow-sm ring-1 ring-slate-200 backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1320]/95 dark:text-white dark:ring-white/10 lg:rounded-xl"
          aria-label="Finding Builder"
        >
          <div className="flex min-w-0 items-center gap-2 px-3 py-1.5">
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              aria-expanded={expanded}
              aria-controls={detailsId}
              aria-label={hasData ? "Toggle current finding builder" : "Toggle empty finding builder"}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B1320] text-[11px] font-black text-white shadow-sm">
                {currentStep}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[8px] font-black uppercase tracking-[0.14em] text-[#1D72B8]">
                    Finding Builder
                  </p>

                  <span
                    className={`shrink-0 rounded-full px-1.5 py-[1px] text-[7px] font-black uppercase tracking-wide ${
                      currentFindingSaved
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {currentFindingSaved ? "Saved" : "Draft"}
                  </span>
                </div>

                <h2 className="sentinel-finding-builder-title max-w-full truncate text-[10px] font-black leading-4 text-slate-950 dark:text-white">
                  {category}
                </h2>

                <p className="truncate text-[9px] font-semibold leading-4 text-slate-700 dark:text-slate-100">
                  {primaryLine} · {categorySource}
                </p>

                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  <span
                    className={`rounded-full px-1.5 py-[1px] text-[8px] font-black uppercase tracking-wide ring-1 ${riskTone}`}
                  >
                    {riskLabel}
                  </span>

                  <span className="rounded-full bg-blue-50 px-1.5 py-[1px] text-[8px] font-black uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                    {confidenceLabel} Confidence
                  </span>

                  <span className="max-w-[135px] truncate rounded-full bg-slate-100 px-1.5 py-[1px] text-[8px] font-black tracking-wide text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700">
                    {topStandard}
                  </span>
                </div>
              </div>

            </button>

            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black leading-none text-slate-800 transition hover:bg-slate-200 hover:text-slate-950 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              aria-expanded={expanded}
              aria-controls={detailsId}
              aria-label={expanded ? "Collapse finding builder" : "Expand finding builder"}
            >
              {expanded ? "⌄" : "⌃"}
            </button>
          </div>

          {expanded && (
            <div id={detailsId} className="border-t border-slate-200 px-3 pb-2 pt-2">
              <HazLenzFindingSummary
                description={description}
                hazardCategory={hazardCategory}
                safeScopeResult={safeScopeResult}
                selectedStandards={selectedStandards}
                selectedGeneratedActions={selectedGeneratedActions}
                manualActions={manualActions}
                fallbackText={secondaryLine}
              />

              <div className="mt-2 grid grid-cols-4 gap-1.5 text-[10px] font-black text-slate-700 dark:text-slate-100">
                <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                  <p className="text-[9px] uppercase tracking-wide text-slate-600 dark:text-slate-200">
                    Photos
                  </p>
                  <p className="text-slate-950 dark:text-white">{photos.length}</p>
                </div>

                <div className={`rounded-lg px-2 py-1.5 ring-1 ${riskTone}`}>
                  <p className="text-[8px] uppercase tracking-wide opacity-70">
                    Risk
                  </p>
                  <p className="truncate">{riskLabel}</p>
                </div>

                <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                  <p className="text-[9px] uppercase tracking-wide text-slate-600 dark:text-slate-200">
                    Standard
                  </p>
                  <p className="truncate text-slate-950 dark:text-white">
                    {topStandard !== "Pending"
                      ? topStandard
                      : `${selectedCount}/${suggestedStandardsCount}`}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                  <p className="text-[9px] uppercase tracking-wide text-slate-600 dark:text-slate-200">
                    Actions
                  </p>
                  <p className="text-slate-950 dark:text-white">{actionCount}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
