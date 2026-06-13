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
  accent: "bg-orange-500 text-white shadow-sm hover:bg-orange-600",
  danger: "border border-red-100 bg-red-50 text-red-700 hover:bg-red-100",
  ghost: "border border-slate-200 bg-white/85 text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/60",
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
