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
  return (
    <>
      <p className="mb-4 text-sm font-semibold leading-6 text-slate-500">
        SafeScope uses the hazard category, description, location, evidence notes, and agency mode to suggest likely standards. Suggestions must be reviewed by a qualified safety professional.
      </p>

      <div className="relative mb-4 flex items-center gap-2">
        <p className="text-sm font-black text-slate-800">
          SafeScope decision-support mode
        </p>

        <button
          type="button"
          onClick={() => setSafeScopeHelpOpen((open: boolean) => !open)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-[#E8F4FF] text-xs font-black text-[#1D72B8]"
          aria-label="Explain SafeScope decision-support mode"
        >
          ?
        </button>

        {safeScopeHelpOpen && (
          <div className="absolute left-0 top-8 z-20 max-w-sm rounded-2xl border border-blue-100 bg-white p-4 text-sm font-semibold leading-6 text-slate-600 shadow-xl">
            <p className="font-black text-slate-900">What this means</p>
            <p className="mt-1">
              SafeScope provides decision-support only. Use the results as a review aid. Final standard selection, compliance decisions, and corrective actions remain with qualified personnel.
            </p>
          </div>
        )}
      </div>

      <label className="mb-2 block text-sm font-black text-slate-700">
        Applicable Regulations
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["msha", "MSHA"],
          ["osha_general", "OSHA General"],
          ["osha_construction", "OSHA Construction"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setAgencyMode(value)}
            className={`rounded-full px-4 py-2 text-sm font-black ${
              agencyMode === value
                ? "bg-[#1D72B8] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="mb-2 block text-sm font-black text-slate-700">
        Company Risk Matrix
      </label>
      <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
        {riskProfileId === "simple_4x4"
          ? "Simple 4x4"
          : riskProfileId === "advanced_6x6"
            ? "Advanced 6x6"
            : "Standard 5x5"} is controlled in Company Settings.
      </div>

      <button
        onClick={handleRunSafeScope}
        className="mb-3 rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8] active:scale-[0.98]"
      >
        Run SafeScope Match
      </button>

      {safeScopeStatus && (
        <p className="mb-4 text-sm font-black text-slate-600">
          {safeScopeStatus}
        </p>
      )}
    </>
  );
}
