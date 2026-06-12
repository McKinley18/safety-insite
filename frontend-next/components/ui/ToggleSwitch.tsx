"use client";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
};

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition",
        checked
          ? "border-[#1D72B8] bg-[#E8F4FF]"
          : "border-slate-200 bg-white hover:bg-slate-50",
        disabled ? "cursor-not-allowed opacity-60" : "",
      ].join(" ")}
    >
      <span className="min-w-0">
        <span className="block text-sm font-black text-slate-900">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
            {description}
          </span>
        )}
      </span>

      <span
        className={[
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked ? "bg-[#102A43]" : "bg-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
