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

  const status = [
    `${photos.length} photo(s)`,
    location ? "Location added" : "No location",
    safeScopeResult?.classification
      ? "SafeScope reviewed"
      : "SafeScope pending",
    `Standards ${selectedStandards.length}`,
    `Actions ${actionCount}`,
    currentFindingSaved ? "Saved" : "Unsaved",
  ].join(" · ");

  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Current Hazard
          </p>
          <h2 className="mt-1 truncate text-sm font-black text-slate-900">
            {title}
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
            currentFindingSaved
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {currentFindingSaved ? "Saved" : "Draft"}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
        {summary}
      </p>

      <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
        {status}
      </p>
    </section>
  );
}
