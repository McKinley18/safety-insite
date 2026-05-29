import type { HTMLAttributes, ReactNode } from "react";

type AppPanelVariant = "default" | "subtle" | "dashed" | "dark";
type AppPanelPadding = "sm" | "md" | "lg";

type AppPanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: AppPanelVariant;
  padding?: AppPanelPadding;
  as?: "section" | "div" | "article";
};

const variantClasses: Record<AppPanelVariant, string> = {
  default: "border border-slate-200 bg-white shadow-sm",
  subtle: "border border-slate-200 bg-slate-50 shadow-sm",
  dashed: "border border-dashed border-slate-300 bg-slate-50 shadow-sm",
  dark: "bg-[#0B1320] text-white shadow-sm",
};

const paddingClasses: Record<AppPanelPadding, string> = {
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function AppPanel({
  children,
  variant = "default",
  padding = "md",
  as: Component = "section",
  className = "",
  ...props
}: AppPanelProps) {
  return (
    <Component
      className={[
        "rounded-2xl",
        variantClasses[variant],
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}
