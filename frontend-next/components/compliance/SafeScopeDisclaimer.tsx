type SafeScopeDisclaimerProps = {
  compact?: boolean;
  tone?: "default" | "warning" | "dark" | "notice";
};

export default function SafeScopeDisclaimer({
  compact = false,
  tone = "default",
}: SafeScopeDisclaimerProps) {
  const toneClass =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : tone === "dark"
        ? "border-white/15 bg-white/10 text-white"
        : tone === "notice"
          ? "border-slate-200 bg-white text-slate-700"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <section className={`rounded-xl border px-3 py-2 ${toneClass}`}>
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
            tone === "notice"
              ? "bg-slate-100 text-slate-600"
              : "bg-[#F97316] text-black"
          }`}
        >
          {tone === "notice" ? "Review Notice" : "Human Review Required"}
        </span>

        <div>
          <p
            className={`font-black ${
              compact ? "text-xs" : "text-sm"
            } ${tone === "dark" ? "text-white" : "text-slate-900"}`}
          >
            SafeScope is decision-support intelligence.
          </p>
          <p
            className={`mt-1 font-semibold leading-5 ${
              compact ? "text-[11px]" : "text-xs"
            } ${tone === "dark" ? "text-slate-200" : ""}`}
          >
            All findings, standards, risk ratings, corrective actions, and
            report content must be reviewed and confirmed by a qualified person
            before use. SafeScope does not replace employer responsibility,
            competent-person review, regulatory interpretation, engineering
            judgment, legal advice, or site-specific safety decision-making.
          </p>
        </div>
      </div>
    </section>
  );
}
