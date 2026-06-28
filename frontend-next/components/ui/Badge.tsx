import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "slate" | "blue" | "orange" | "green" | "red" | "amber" | "white";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100",
  blue: "bg-[#E8F4FF] text-[#102A43] dark:bg-[#102A43] dark:text-slate-100",
  orange: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-100",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100",
  red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-100",
  amber: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
  white: "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-100",
};

export function Badge({ children, tone = "slate", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide",
        toneClasses[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
