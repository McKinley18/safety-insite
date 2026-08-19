type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: string;
};

export default function PageHeader({ title, eyebrow, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="border-l-4 border-[#F97316] pl-4">
        {eyebrow && (
          // #F97316 (orange-500) measured 2.44:1 on this header's light surface,
          // well under the 4.5 needed at 12px/900. It stays orange-500 in dark,
          // where it sits on the dark app surface and passes; light mode steps to
          // orange-700. The 4px accent rule above is non-text, so it keeps the
          // brighter orange in both themes.
          <p className="text-xs font-black uppercase tracking-wide text-[#C2410C] dark:text-[#F97316]">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
            {description}
          </p>
        )}
      </div>

      <div className="mt-5 h-[3px] w-full rounded-full bg-[#1D72B8]" />
    </div>
  );
}
