import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type AppLinkButtonVariant = "primary" | "secondary" | "accent" | "danger" | "ghost";
type AppLinkButtonSize = "sm" | "md" | "lg";

type AppLinkButtonProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  variant?: AppLinkButtonVariant;
  size?: AppLinkButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<AppLinkButtonVariant, string> = {
  primary: "sentinel-primary-button !text-white",
  secondary: "sentinel-secondary-button",
  // Blueprint 72.4 replaced the brand orange with --app-accent-strong (#BB5609) because white
  // text on it measured 2.71-2.80:1, under the 4.5:1 minimum, and routed every consumer through
  // one semantic class so no call site could reintroduce the defect. AppButton's `accent` was
  // migrated then; THIS one was not, and kept resolving to Tailwind orange-500. Measured on
  // /inspections at 2026-08-27: "Open Field Capture", white on rgb(255,105,0), 2.89:1, failing
  // in BOTH themes -- and the same variant carries the /pricing upgrade CTA and every
  // LockedFeatureCard call to action. Fixed at the variant, not at the call sites, for the
  // reason 72.4 gave: patching call sites leaves the trap in place.
  accent: "app-accent-strong-surface",
  danger: "border border-red-100 bg-red-50 text-red-700 hover:bg-red-100",
  ghost: "border border-slate-200 bg-white/85 text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/60 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800",
};

const sizeClasses: Record<AppLinkButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

export function AppLinkButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: AppLinkButtonProps) {
  return (
    <Link
      className={[
        "inline-flex items-center justify-center rounded-xl font-black transition",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Link>
  );
}
