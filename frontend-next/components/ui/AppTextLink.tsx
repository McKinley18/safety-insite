import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// "button" is the tone for a link that is styled as a control -- a filled pill or an
// outlined block. It omits `.app-link` entirely rather than trying to override it: that
// class is unlayered CSS in globals.css, and Tailwind v4 emits `no-underline` inside
// @layer utilities, so unlayered wins and the utility silently loses. Every CTA on
// /pricing and /upgrade rendered underlined because of that.
type AppTextLinkTone = "blue" | "slate" | "button";

type AppTextLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  tone?: AppTextLinkTone;
};

const toneClasses: Record<AppTextLinkTone, string> = {
  blue: "app-link text-app-primary",
  slate: "app-link text-app-text-muted hover:text-app-primary",
  button: "no-underline",
};

export function AppTextLink({
  children,
  tone = "blue",
  className = "",
  ...props
}: AppTextLinkProps) {
  return (
    <Link
      className={[
        "text-sm font-black",
        toneClasses[tone],
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
