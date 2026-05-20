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
      <div className="mb-4 border-b border-slate-200 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              SafeScope Review
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Analyze evidence, description, location, and action notes.
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
            remain with qualified personnel.
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="text-xs font-black uppercase tracking-wide text-slate-500">
            Regulatory Scope
          </label>
          <span className="text-[11px] font-bold text-slate-400">
            {riskMatrixLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {[
            ["all", "All"],
            ["msha", "MSHA"],
            ["osha_general", "OSHA GI"],
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

      <button
        type="button"
        onClick={handleRunSafeScope}
        className="mb-3 rounded-xl bg-[#102A43] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#1D72B8] active:scale-[0.98]"
      >
        Run SafeScope Review
      </button>

      {safeScopeStatus && (
        <p className="mb-4 text-sm font-black text-slate-600">
          {safeScopeStatus}
        </p>
      )}
    </>
  );
}
