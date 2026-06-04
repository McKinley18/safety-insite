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
  primary: "bg-[#102A43] !text-white hover:bg-[#1D72B8]",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  accent: "bg-[#F97316] text-black hover:bg-[#EA580C]",
  danger: "border border-red-100 bg-red-50 text-red-700 hover:bg-red-100",
  ghost: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
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
