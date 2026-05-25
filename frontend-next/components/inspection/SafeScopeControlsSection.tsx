type Props = {
  safeScopeHelpOpen: boolean;
  setSafeScopeHelpOpen: (updater: any) => void;
  agencyMode: string;
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  handleRunSafeScope: () => void;
  safeScopeStatus: string;
  safeScopeResult?: any;
};

function formatConfidence(value: any) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0%";
  if (number <= 1) return `${Math.round(number * 100)}%`;
  return `${Math.round(number)}%`;
}

function formatRisk(value: any) {
  return String(value || "Review").replaceAll("_", " ").toUpperCase();
}

export default function SafeScopeControlsSection({
  safeScopeHelpOpen,
  setSafeScopeHelpOpen,
  agencyMode,
  riskProfileId,
  handleRunSafeScope,
  safeScopeStatus,
  safeScopeResult,
}: Props) {
  const confidence =
    safeScopeResult?.confidenceIntelligence?.overallConfidence ??
    safeScopeResult?.confidence ??
    0;

  const topStandard = safeScopeResult?.suggestedStandards?.[0];
  const riskBand =
    safeScopeResult?.risk?.riskBand ||
    safeScopeResult?.risk?.operationalRisk?.matrixBand ||
    "Review";

  const scopeLabel =
    agencyMode === "msha"
      ? "MSHA"
      : agencyMode === "osha_general"
        ? "OSHA General Industry"
        : agencyMode === "osha_construction"
          ? "OSHA Construction"
          : "Company default / SafeScope";

  const riskMatrixLabel =
    riskProfileId === "simple_4x4"
      ? "Simple 4x4"
      : riskProfileId === "advanced_6x6"
        ? "Advanced 6x6"
        : "Standard 5x5";

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            SafeScope Review
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-900">
            Analyze this finding
          </h2>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            SafeScope will classify the hazard, suggest standards, score risk,
            and identify corrective action focus.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSafeScopeHelpOpen((open: boolean) => !open)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-[#E8F4FF] text-xs font-black text-[#1D72B8]"
          aria-label="Explain SafeScope decision-support mode"
        >
          ?
        </button>
      </div>

      {safeScopeHelpOpen && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
          SafeScope provides decision support only. Final compliance decisions
          remain with qualified personnel. Agency scope and risk matrix are
          pulled from workspace settings.
        </p>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={handleRunSafeScope}
          className="w-full rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#1D72B8] active:scale-[0.98]"
        >
          Run SafeScope Review
        </button>

        <p className="mt-2 text-center text-[11px] font-bold leading-5 text-slate-500">
          Using {scopeLabel} · {riskMatrixLabel}
        </p>
      </div>

      {safeScopeStatus && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-black leading-5 text-slate-600">
          {safeScopeStatus}
        </p>
      )}

      {safeScopeResult && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[#E8F4FF] px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wide text-[#1D72B8]">
              Confidence
            </p>
            <p className="mt-1 text-sm font-black text-[#102A43]">
              {formatConfidence(confidence)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
              Risk
            </p>
            <p className="mt-1 truncate text-sm font-black text-slate-900">
              {formatRisk(riskBand)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
              Standard
            </p>
            <p className="mt-1 truncate text-sm font-black text-slate-900">
              {topStandard?.citation || "Review"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
