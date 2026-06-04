type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "critical" | "high" | "medium" | "success" | "blue" | "slate";
};

const tones = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  slate: "bg-slate-100 text-slate-700",
};

export default function StatusBadge({ children, tone = "slate" }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${tones[tone]}`}>
      {children}
    </span>
  );
}
