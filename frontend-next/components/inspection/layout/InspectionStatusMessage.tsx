"use client";

type Tone = "info" | "success" | "warning" | "danger";

type InspectionStatusMessageProps = {
  tone?: Tone;
  children: React.ReactNode;
};

const toneClasses: Record<Tone, string> = {
  info: "border-blue-100 bg-blue-50 text-[#102A43]",
  success: "border-emerald-100 bg-emerald-50 text-emerald-800",
  warning: "border-amber-100 bg-amber-50 text-amber-800",
  danger: "border-red-100 bg-red-50 text-red-800",
};

export default function InspectionStatusMessage({
  tone = "info",
  children,
}: InspectionStatusMessageProps) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-center text-xs font-black leading-5 ${toneClasses[tone]}`}
    >
      {children}
    </div>
  );
}
