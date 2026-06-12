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
    <section className="rounded-2xl border border-slate-200/60 bg-white/95 p-5 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:border-sky-500/50 hover:scale-[1.01]">
      <div className="mb-4">
        {eyebrow && (
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1D72B8]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}

      {footer && <div className="mt-4 border-t border-slate-200/60 pt-4">{footer}</div>}
    </section>
  );
}
