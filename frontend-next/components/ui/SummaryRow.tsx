import type { ReactNode } from "react";

type SummaryRowProps = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  last?: boolean;
};

export default function SummaryRow({
  label,
  value,
  valueClassName = "text-[#102A43] dark:text-slate-100",
  last = false,
}: SummaryRowProps) {
  return (
    <div className={["flex justify-between gap-3", last ? "" : "border-b border-slate-100 pb-2"].filter(Boolean).join(" ")}>
      <span className="text-slate-700 dark:text-slate-200">{label}</span>
      <span className={["font-black", valueClassName].filter(Boolean).join(" ")}>
        {value}
      </span>
    </div>
  );
}
