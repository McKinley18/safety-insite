import { LucideIcon } from 'lucide-react';
import React from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-900 shadow-none ring-1 ring-white/70 sm:p-12">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white dark:bg-slate-800 dark:ring-slate-900">
          <Icon className="h-6 w-6 text-[#1D72B8]" aria-hidden="true" />
        </div>
      )}
      <p className="text-base font-black text-[#102A43]">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-700">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0F172A] px-6 text-sm font-black text-white shadow-sm hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
