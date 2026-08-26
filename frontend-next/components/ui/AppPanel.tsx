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
  subtle: "app-surface-muted inspection-panel-light p-4 rounded-xl",
  dashed: "app-border border-dashed bg-app-bg-soft inspection-panel-light",
  dark: "bg-app-primary-hover text-white border-white/10",
  strong: "app-surface-strong app-border inspection-panel-light p-4 sm:p-6 rounded-xl",
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
        // `min-w-0` because a panel is routinely a grid or flex item, and such an item
        // defaults to `min-width: auto` -- it refuses to shrink below its content's
        // intrinsic minimum. On /profile at 390px that kept this panel 410px wide inside
        // a 326px column and carried the page content out to 442px, clipping "Edit account
        // details", "Sign Out" and "Delete Account" past the viewport edge. The page did not
        // report horizontal overflow because the shell carries `overflow-x-hidden`, so the
        // controls were not merely off-screen, they were unreachable.
        "min-w-0",
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
