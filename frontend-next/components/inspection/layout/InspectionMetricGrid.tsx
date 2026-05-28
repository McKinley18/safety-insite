"use client";

type Metric = {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "blue" | "critical" | "warning" | "success";
};

type InspectionMetricGridProps = {
  metrics: Metric[];
};

const toneClasses = {
  neutral: "bg-slate-50 text-slate-900",
  blue: "bg-blue-50 text-[#102A43]",
  critical: "bg-red-50 text-red-800",
  warning: "bg-amber-50 text-amber-800",
  success: "bg-emerald-50 text-emerald-800",
};

export default function InspectionMetricGrid({ metrics }: InspectionMetricGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`min-h-[72px] rounded-xl px-3 py-3 text-center ${
            toneClasses[metric.tone || "neutral"]
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wide opacity-70">
            {metric.label}
          </p>
          <div className="mt-1 break-words text-sm font-black leading-5 sm:text-base">
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}
