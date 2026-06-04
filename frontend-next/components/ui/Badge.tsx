import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "slate" | "blue" | "orange" | "green" | "red" | "amber" | "white";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-[#E8F4FF] text-[#102A43]",
  orange: "bg-orange-50 text-orange-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-800",
  white: "bg-white text-slate-600",
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
