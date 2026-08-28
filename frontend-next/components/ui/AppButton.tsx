import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonVariant = "primary" | "secondary" | "accent" | "danger" | "ghost";
type AppButtonSize = "sm" | "md" | "lg";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<AppButtonVariant, string> = {
  // --app-primary inverts between themes: #1D72B8 (dark blue) in light, #38bdf8 (light sky)
  // in dark, with an even lighter #7dd3fc hover -- but the label stayed white, measuring 2.05:1.
  //
  // The `!` is required, not stylistic. globals.css carries an app-wide dark legibility guard,
  //   .dark :where(.text-white, .text-gray-900, .text-zinc-900, .text-black) {
  //     color: var(--app-text-primary) !important; }
  // which assumes anything marked text-white sits on a DARK surface. This button is the case
  // that assumption does not cover, so a plain `dark:text-slate-950` loses to that !important
  // rule. The guard is left intact for every other consumer; only the label on this fill is
  // overridden (9.4:1). The --app-primary token itself is untouched, so the 7 non-button rules
  // that consume it for borders and surfaces are unaffected.
  primary: "bg-app-primary text-white dark:!text-slate-950 hover:bg-app-primary-hover",
  secondary: "app-border bg-app-surface text-app-text hover:bg-app-surface-muted",
  // `accent` was "bg-app-warning text-black" -- a pale amber surface (#fff7ed) meant for
  // BLACK text. Seven of this variant's twelve call sites then forced `!text-white` on top,
  // which produced white on #fff7ed at 1.06:1: invisible. That is a defect in the variant,
  // not in the call sites -- what they were all reaching for is a solid accent CTA.
  //
  // It is now the strong-accent surface: --app-accent-strong (#BB5609), which is the brand
  // orange's own hue and saturation darkened until white text clears WCAG AA at 4.72:1.
  // `.app-accent-strong-surface` carries the background, border, white label and hover, and
  // deliberately leaves :disabled to the app's disabled tokens.
  accent: "app-accent-strong-surface",
  danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  ghost: "border-transparent bg-transparent text-app-text hover:bg-app-surface-muted",
};

const sizeClasses: Record<AppButtonSize, string> = {
  // `min-h-9` (36px) is the mobile touch-target floor from §73.3. `px-3 py-2 text-xs`
  // computes to 32px, which only escaped the §73 sweep because every page that renders a
  // size="sm" action button -- /reports "Download PDF" and "View inspection" -- was measured
  // in its EMPTY state, so the buttons did not exist to be measured.
  sm: "min-h-9 px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

export function AppButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-xl font-black transition disabled:cursor-not-allowed disabled:opacity-60",
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
    </button>
  );
}
