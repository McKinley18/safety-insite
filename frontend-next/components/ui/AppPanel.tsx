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
  default: "app-card",
  subtle: "app-surface-muted p-4 rounded-xl",
  dashed: "app-border border-dashed bg-app-bg-soft",
  dark: "bg-app-primary-hover text-white border-white/10",
  strong: "app-surface-strong app-border p-4 sm:p-6 rounded-xl",
};

const paddingClasses: Record<AppPanelPadding, string> = {
  sm: "p-3",
  md: "p-4 sm:p-4 sm:p-5",
  lg: "p-4 sm:p-5 sm:p-4 sm:p-6",
  xl: "p-4 sm:p-6 sm:p-8",
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
        "rounded-xl",
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
