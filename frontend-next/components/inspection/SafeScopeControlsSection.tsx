type Props = {
  safeScopeHelpOpen: boolean;
  setSafeScopeHelpOpen: (updater: any) => void;
  agencyMode: string;
  setAgencyMode: (value: string) => void;
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  handleRunSafeScope: () => void;
  safeScopeStatus: string;
};

export default function SafeScopeControlsSection({
  safeScopeHelpOpen,
  setSafeScopeHelpOpen,
  agencyMode,
  setAgencyMode,
  riskProfileId,
  handleRunSafeScope,
  safeScopeStatus,
}: Props) {
  const riskMatrixLabel =
    riskProfileId === "simple_4x4"
      ? "Simple 4x4"
      : riskProfileId === "advanced_6x6"
        ? "Advanced 6x6"
        : "Standard 5x5";

  return (
    <>
      <div className="mb-4 rounded-2xl border border-blue-100 bg-[#F4F9FF] px-4 py-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          SafeScope Review
        </p>
        <h2 className="mt-1 text-lg font-black text-slate-900">
          Analyze the captured finding
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
          SafeScope reviews the evidence, observed condition, location, and any
          action notes to suggest likely hazard classification, missing details,
          standards, and corrective action guidance.
        </p>
      </div>

      <div className="relative mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-900">
              Decision-support mode
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              SafeScope supports review. Final compliance decisions remain with
              qualified personnel.
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
          <div className="mt-3 rounded-2xl border border-blue-100 bg-[#F8FBFF] p-4 text-sm font-semibold leading-6 text-slate-600">
            <p className="font-black text-slate-900">What this means</p>
            <p className="mt-1">
              SafeScope provides decision-support only. Use the results as a
              review aid. Final standard selection, compliance decisions, and
              corrective actions remain with qualified personnel.
            </p>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <label className="block text-sm font-black text-slate-900">
              Regulatory scope
            </label>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              Use All unless you already know the worksite context. SafeScope
              can evaluate broadly first.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
            Adjustable
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {[
            ["all", "All / Let SafeScope evaluate"],
            ["msha", "MSHA"],
            ["osha_general", "OSHA General"],
            ["osha_construction", "OSHA Construction"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAgencyMode(value)}
              className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                agencyMode === value
                  ? "bg-[#1D72B8] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Company Risk Matrix
        </p>
        <p className="mt-1 text-sm font-black text-slate-800">
          {riskMatrixLabel}
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
          Controlled in Workspace Settings.
        </p>
      </div>

      <button
        type="button"
        onClick={handleRunSafeScope}
        className="mb-3 min-h-11 w-full rounded-xl bg-[#102A43] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#1D72B8] active:scale-[0.98] sm:w-auto"
      >
        Run SafeScope Review
      </button>

      {safeScopeStatus && (
        <p className="mb-4 rounded-xl bg-slate-50 px-3 py-2 text-sm font-black text-slate-600">
          {safeScopeStatus}
        </p>
      )}
    </>
  );
}
