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
      className={["app-input font-bold", sizeClasses[fieldSize], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function AppSelect({ className = "", fieldSize = "md", children, ...props }: AppSelectProps) {
  return (
    <select
      className={["app-input font-bold", sizeClasses[fieldSize], className]
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
      className={["app-input font-bold", sizeClasses[fieldSize], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
