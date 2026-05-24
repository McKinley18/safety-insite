"use client";

import { useState } from "react";

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

  if (!hasData || currentStep === 6) return null;

  const title =
    hazardCategory || safeScopeResult?.classification || "Current hazard";

  const summary = compactText(
    description,
    "Finding details will build as you progress.",
  );

  const actionCount = selectedGeneratedActions.length + manualActions.length;
  const suggestedStandardsCount =
    safeScopeResult?.suggestedStandards?.length || 0;

  const status = [
    `${photos.length} photo(s)`,
    safeScopeResult?.classification
      ? "SafeScope reviewed"
      : "SafeScope pending",
    `Suggested ${suggestedStandardsCount}`,
    `Selected ${selectedStandards.length}`,
    `Actions ${actionCount}`,
  ].join(" · ");

  return (
    <section className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Current Hazard
          </p>
          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="truncate text-sm font-black text-slate-900">
              {title}
            </h2>
            <span className="text-xs font-bold text-slate-400">•</span>
            <p className="text-xs font-bold text-slate-500">{status}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
              currentFindingSaved
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {currentFindingSaved ? "Saved" : "Draft"}
          </span>

          <span className="text-xs font-black text-slate-400">
            {expanded ? "Hide" : "Show"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="mt-2 border-t border-slate-200 pt-2">
          <p className="line-clamp-3 text-sm font-semibold leading-6 text-slate-600">
            {summary}
          </p>

          <div className="mt-2 grid gap-2 text-xs font-bold text-slate-500 sm:grid-cols-2">
            <p>Location: {location || "Not added"}</p>
            <p>Category: {hazardCategory || "SafeScope / not selected"}</p>
            <p>Photos: {photos.length}</p>
            <p>Actions: {actionCount}</p>
            <p>Suggested standards: {suggestedStandardsCount}</p>
            <p>Selected standards: {selectedStandards.length}</p>
            <p>
              Risk:{" "}
              {safeScopeResult?.risk?.riskBand ||
                safeScopeResult?.risk?.operationalRisk?.matrixBand ||
                "Not rated"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
