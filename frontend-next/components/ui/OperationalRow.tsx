import type { ReactNode } from "react";

type OperationalRowProps = {
  title: string;
  subtitle?: string;
  metadata?: string[];
  status?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export default function OperationalRow({
  title,
  subtitle,
  metadata = [],
  status,
  actions,
  children,
}: OperationalRowProps) {
  return (
    <div className="border-b border-slate-200 py-5 last:border-b-0 dark:border-slate-800">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {title}
            </h3>

            {status && (
              <div className="shrink-0">
                {status}
              </div>
            )}
          </div>

          {subtitle && (
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {subtitle}
            </p>
          )}

          {metadata.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-black text-slate-400">
              {metadata.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          )}

          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
