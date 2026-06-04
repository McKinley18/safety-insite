import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type AppTextLinkTone = "blue" | "slate";

type AppTextLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  tone?: AppTextLinkTone;
};

const toneClasses: Record<AppTextLinkTone, string> = {
  blue: "text-[#1D72B8] hover:underline",
  slate: "text-slate-500 hover:text-[#1D72B8] hover:underline",
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
