type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "critical" | "high" | "medium" | "success" | "blue" | "slate";
};

const tones = {
  critical: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-100",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-100",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-100",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100",
  blue: "bg-blue-100 text-blue-700 dark:bg-[#102A43] dark:text-slate-100",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100",
};

export default function StatusBadge({ children, tone = "slate" }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${tones[tone]}`}>
      {children}
    </span>
  );
}
