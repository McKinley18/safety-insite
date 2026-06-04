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
  valueClassName = "text-slate-900",
  last = false,
}: SummaryRowProps) {
  return (
    <div className={["flex justify-between gap-3", last ? "" : "border-b border-slate-100 pb-2"].filter(Boolean).join(" ")}>
      <span>{label}</span>
      <span className={["font-black", valueClassName].filter(Boolean).join(" ")}>
        {value}
      </span>
    </div>
  );
}
