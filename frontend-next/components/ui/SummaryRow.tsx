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
    // `min-w-0` on both cells is load-bearing, not defensive. A flex item defaults to
    // `min-width: auto`, so it refuses to shrink below its content's intrinsic minimum --
    // and an account email is a single unbreakable token. On /profile at 390px that made
    // this row 410px wide and carried the whole panel out to 442px, clipping "Edit account
    // details", "Sign Out" and "Delete Account" past the viewport edge. `break-words` lets
    // the value wrap rather than demand the width.
    <div className={["flex justify-between gap-3", last ? "" : "border-b border-slate-100 pb-2"].filter(Boolean).join(" ")}>
      <span className="min-w-0 shrink-0 text-slate-700 dark:text-slate-200">{label}</span>
      <span className={["min-w-0 break-words text-right font-black", valueClassName].filter(Boolean).join(" ")}>
        {value}
      </span>
    </div>
  );
}
