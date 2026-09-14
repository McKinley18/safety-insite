type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /**
   * §280. The heading LEVEL, separately from how the heading looks.
   *
   * This component always emitted an `<h2>`, which is right for a section inside a page and wrong
   * for the one instance where it IS the page's title. /field-capture used it that way, so that
   * page shipped with no `<h1>` at all at every width -- a screen reader jumping by heading found
   * nothing to land on, and the document had no name in its own structure.
   *
   * The level is a prop and the visual size is not: a page whose h1 is set here should still look
   * like the rest of the product, and the fix for a missing landmark is never to make something
   * bigger. Defaults to 2, so no existing call site changes.
   */
  headingLevel?: 1 | 2 | 3;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  headingLevel = 2,
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3";
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

        <Heading className="mt-1 text-xl font-black tracking-[-0.035em] text-slate-950 dark:text-white">
          {title}
        </Heading>

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
