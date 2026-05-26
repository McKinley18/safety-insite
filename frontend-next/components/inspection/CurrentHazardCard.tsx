"use client";

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
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
              {expanded ? "Collapse" : "Expand"}
            </p>
            <p className="text-sm font-black leading-none text-slate-500">
              {expanded ? "⌄" : "⌃"}
            </p>
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

              <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                <p className="text-[8px] uppercase tracking-wide text-slate-400">
                  Risk
                </p>
                <p className="truncate text-slate-900">{riskLabel}</p>
              </div>

              <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                <p className="text-[8px] uppercase tracking-wide text-slate-400">
                  Std.
                </p>
                <p className="text-slate-900">
                  {selectedCount}/{suggestedStandardsCount}
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
