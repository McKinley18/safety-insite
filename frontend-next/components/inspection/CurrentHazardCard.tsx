"use client";

import { formatStandardDisplay } from "@/lib/inspection/standardDisplay";

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
    if (!expanded) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target || !cardRef.current) return;

      if (!cardRef.current.contains(target)) {
        setExpanded(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [expanded]);

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-black text-[#102A43] shadow-lg backdrop-blur transition hover:bg-blue-50 lg:bottom-16"
      >
        Show Finding Builder
      </button>
    );
  }

  void hasData;

  const category =
    hazardCategory ||
    safeScopeResult?.classification ||
    (photos.length || location || description
      ? "Unclassified finding"
      : "Finding in progress");

  const categorySource = hazardCategory
    ? "User selected"
    : safeScopeResult?.classification
      ? "SafeScope suggested"
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

  const topStandard =
    selectedStandards?.[0]
      ? formatStandardDisplay(selectedStandards[0])
      : safeScopeResult?.suggestedStandards?.[0]
        ? formatStandardDisplay(safeScopeResult.suggestedStandards[0])
        : safeScopeResult?.standardsReasoning?.topDefensible?.[0]
          ? formatStandardDisplay(safeScopeResult.standardsReasoning.topDefensible[0])
          : safeScopeResult?.applicabilityIntelligence?.primaryApplicableStandards?.[0]
            ? formatStandardDisplay(safeScopeResult.applicabilityIntelligence.primaryApplicableStandards[0])
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

  return (
    <section
      ref={cardRef}
      className="fixed inset-x-0 bottom-28 z-40 mx-auto w-[calc(100%-1rem)] max-w-3xl rounded-[1.05rem] border border-slate-200 bg-white/95 shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur lg:bottom-16"
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="block w-full px-3 py-2 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E8F4FF] text-xs font-black text-[#1D72B8]">
            {currentStep}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-[#1D72B8]">
                Finding Builder
              </p>

              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide ${
                  currentFindingSaved
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {currentFindingSaved ? "Saved" : "Draft"}
              </span>
            </div>

            <h2 className="mt-0.5 truncate text-[13px] font-black leading-4 text-slate-900">
              {category}
            </h2>

            <p className="truncate text-[10px] font-bold leading-4 text-slate-500">
              {primaryLine} · {categorySource}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ring-1 ${riskTone}`}>
                {riskLabel}
              </span>

              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                {confidenceLabel} Confidence
              </span>

              <span className="max-w-[150px] truncate rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black tracking-wide text-slate-700 ring-1 ring-slate-200">
                {topStandard}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-black leading-none text-slate-600">
              {expanded ? "⌄" : "⌃"}
            </p>

            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                setExpanded(false);
                setHidden(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  setExpanded(false);
                  setHidden(true);
                }
              }}
              className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-500"
            >
              Hide
            </span>
          </div>
        </div>

        {expanded && (
          <div className="mt-2 border-t border-slate-200 pt-2">
            <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-700">
              {secondaryLine}
            </p>

            <div className="mt-2 grid grid-cols-4 gap-1.5 text-[10px] font-black text-slate-600">
              <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                <p className="text-[8px] uppercase tracking-wide text-slate-400">
                  Photos
                </p>
                <p className="text-slate-900">{photos.length}</p>
              </div>

              <div className={`rounded-lg px-2 py-1.5 ring-1 ${riskTone}`}>
                <p className="text-[8px] uppercase tracking-wide opacity-70">
                  Risk
                </p>
                <p className="truncate">{riskLabel}</p>
              </div>

              <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                <p className="text-[8px] uppercase tracking-wide text-slate-400">
                  Standard
                </p>
                <p className="truncate text-slate-900">
                  {topStandard !== "Pending" ? topStandard : `${selectedCount}/${suggestedStandardsCount}`}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                <p className="text-[8px] uppercase tracking-wide text-slate-400">
                  Actions
                </p>
                <p className="text-slate-900">{actionCount}</p>
              </div>
            </div>
          </div>
        )}
      </button>
    </section>
  );
}
