"use client";

type SafeScopeDrawerProps = {
  title: string;
  summary?: string;
  badge?: string;
  children: React.ReactNode;
};

export default function SafeScopeDrawer({
  title,
  summary,
  badge,
  children,
}: SafeScopeDrawerProps) {
  return (
    <details className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          {summary && (
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              {summary}
            </p>
          )}
        </div>

        {badge && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
            {badge}
          </span>
        )}
      </summary>

      <div className="mt-3 border-t border-slate-100 pt-3">
        {children}
      </div>
    </details>
  );
}
