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
          ? "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300";

  return (
    <section className={`rounded-xl border px-3 py-2 ${toneClass}`}>
      <div className="flex items-start gap-2">

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
