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
    <section className="mb-4 rounded-2xl border border-[#102A43] bg-[#102A43] p-5 text-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
            SafeScope Review
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">
            Analyze this finding
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
            SafeScope will classify the hazard, suggest standards, score risk,
            and identify corrective action focus.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSafeScopeHelpOpen((open: boolean) => !open)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-black text-white"
          aria-label="Explain SafeScope decision-support mode"
        >
          ?
        </button>
      </div>

      {safeScopeHelpOpen && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-blue-100">
          SafeScope provides decision support only. Final compliance decisions
          remain with qualified personnel. Agency scope and risk matrix are
          pulled from workspace settings.
        </p>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={handleRunSafeScope}
          className="w-full rounded-xl bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-[0.98]"
        >
          Run SafeScope Review
        </button>

        <p className="mt-2 text-center text-[11px] font-bold leading-5 text-blue-100">
          Using {scopeLabel} · {riskMatrixLabel}
        </p>
      </div>

      {safeScopeStatus && (
        <p className="mt-3 rounded-xl border border-blue-200 bg-[#E8F4FF] px-3 py-2 text-center text-xs font-black leading-5 text-[#102A43] shadow-sm">
          {safeScopeStatus}
        </p>
      )}

      {safeScopeResult && (
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="min-w-0 flex min-h-[72px] flex-col items-center justify-center rounded-xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15">
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              Confidence
            </p>
            <p className="mt-1 max-w-full truncate text-sm font-black text-white sm:text-base lg:text-lg">
              {formatConfidence(confidence)}
            </p>
          </div>

          <div className="min-w-0 flex min-h-[72px] flex-col items-center justify-center rounded-xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15">
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              Risk
            </p>
            <p className="mt-1 max-w-full truncate text-sm font-black text-white sm:text-base lg:text-lg">
              {formatRisk(riskBand)}
            </p>
          </div>

          <div className="min-w-0 flex min-h-[72px] flex-col items-center justify-center rounded-xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15">
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              Standard
            </p>
            <p className="mt-1 max-w-full truncate text-[11px] font-black text-white sm:text-sm lg:text-base" title={topStandard?.citation || "Review"}>
              {topStandard?.citation || "Review"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
