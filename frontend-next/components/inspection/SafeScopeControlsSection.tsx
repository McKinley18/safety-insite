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

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Regulatory Scope
          </span>
          <select
            value={agencyMode}
            onChange={(event) => setAgencyMode(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
          >
            <option value="all">All / Let SafeScope evaluate</option>
            <option value="msha">MSHA</option>
            <option value="osha_general">OSHA General Industry</option>
            <option value="osha_construction">OSHA Construction</option>
          </select>
        </label>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Risk Matrix
          </p>
          <p className="mt-1 text-sm font-black text-slate-900">
            {riskMatrixLabel}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            Used to score severity × likelihood when risk review is included.
          </p>
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
