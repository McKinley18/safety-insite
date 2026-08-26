type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    // The text column needs `min-w-0` for the same reason SummaryRow does: it is a flex
    // item, and a long unbreakable title (a site name, an account name) would otherwise
    // set an intrinsic minimum that the `shrink-0` action then gets pushed past.
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 break-words">
        {eyebrow && (
          <p className="sentinel-section-eyebrow text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8] dark:text-[#5DB7FF]">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-slate-950 dark:text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-700 dark:text-slate-100">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
