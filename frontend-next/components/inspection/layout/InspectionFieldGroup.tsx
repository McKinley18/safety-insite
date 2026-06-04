"use client";

type InspectionFieldGroupProps = {
  label: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
};

export default function InspectionFieldGroup({
  label,
  helper,
  required,
  children,
}: InspectionFieldGroupProps) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-black text-slate-900">
        {label}
        {required && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
            Required
          </span>
        )}
      </span>

      {helper && (
        <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
          {helper}
        </span>
      )}

      <span className="mt-2 block">{children}</span>
    </label>
  );
}
