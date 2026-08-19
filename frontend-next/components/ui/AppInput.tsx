import type { InputHTMLAttributes, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldSize = "sm" | "md";

const sizeClasses: Record<FieldSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-sm",
};

// React 19 passes `ref` to function components as an ordinary prop, but
// InputHTMLAttributes does not declare it, so it has to be added explicitly for
// callers that need to focus or measure the underlying element.
type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  fieldSize?: FieldSize;
  ref?: Ref<HTMLInputElement>;
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
