import type { HTMLAttributes, ReactNode } from "react";

type AppPanelVariant = "default" | "subtle" | "dashed" | "dark" | "strong";
type AppPanelPadding = "sm" | "md" | "lg" | "xl";

type AppPanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: AppPanelVariant;
  padding?: AppPanelPadding;
  as?: "section" | "div" | "article";
};

const variantClasses: Record<AppPanelVariant, string> = {
  default: "sentinel-card",
  subtle: "sentinel-card-muted",
  dashed: "border border-dashed border-slate-300 bg-slate-50/90 shadow-sm dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300",
  dark: "border border-white/10 bg-[#0B1320] text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]",
  strong: "sentinel-card-strong",
};

const paddingClasses: Record<AppPanelPadding, string> = {
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
  xl: "p-6 sm:p-8",
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
