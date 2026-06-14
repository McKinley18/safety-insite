import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type AppTextLinkTone = "blue" | "slate";

type AppTextLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  tone?: AppTextLinkTone;
};

const toneClasses: Record<AppTextLinkTone, string> = {
  blue: "text-[#1D72B8] underline-offset-4 hover:underline dark:text-[#5DB7FF]",
  slate: "text-[#102A43] underline-offset-4 hover:text-[#1D72B8] hover:underline dark:text-slate-100 dark:hover:text-[#5DB7FF]",
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
