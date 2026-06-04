import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldSize = "sm" | "md";

const sizeClasses: Record<FieldSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-sm",
};

type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  fieldSize?: FieldSize;
};

type AppSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  fieldSize?: FieldSize;
};

type AppTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  fieldSize?: FieldSize;
};

export function AppInput({ className = "", fieldSize = "md", ...props }: AppInputProps) {
  return (
    <input
      className={[
        "w-full rounded-xl border border-slate-300 bg-white font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]",
        sizeClasses[fieldSize],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function AppSelect({ className = "", fieldSize = "md", children, ...props }: AppSelectProps) {
  return (
    <select
      className={[
        "w-full rounded-xl border border-slate-300 bg-white font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]",
        sizeClasses[fieldSize],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </select>
  );
}

export function AppTextarea({ className = "", fieldSize = "md", ...props }: AppTextareaProps) {
  return (
    <textarea
      className={[
        "w-full rounded-xl border border-slate-300 bg-white font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]",
        sizeClasses[fieldSize],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
