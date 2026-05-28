"use client";

type InspectionStepShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
};

export default function InspectionStepShell({
  eyebrow,
  title,
  description,
  children,
  rightContent,
}: InspectionStepShellProps) {
  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-[1.5rem] bg-[#0B1320] p-5 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5DB7FF]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
              {description}
            </p>
          </div>

          {rightContent && <div className="shrink-0">{rightContent}</div>}
        </div>
      </div>

      {children}
    </section>
  );
}
