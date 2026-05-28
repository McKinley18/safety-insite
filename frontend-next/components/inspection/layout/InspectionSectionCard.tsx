"use client";

type InspectionSectionCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function InspectionSectionCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: InspectionSectionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        {eyebrow && (
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}

      {footer && <div className="mt-4 border-t border-slate-200 pt-4">{footer}</div>}
    </section>
  );
}
