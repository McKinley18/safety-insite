import type { HTMLAttributes, ReactNode } from "react";

type HeroPanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
};

export function HeroPanel({
  children,
  align = "left",
  tone = "dark",
  className = "",
  ...props
}: HeroPanelProps) {
  const toneClass =
    tone === "light"
      ? "border border-slate-200/80 bg-white text-slate-950 dark:border-white/10 dark:bg-[#0B1320] dark:text-white"
      : "relative isolate overflow-hidden border border-white/10 bg-[linear-gradient(135deg,#0B1320_0%,#102A43_58%,#0B1320_100%)] text-white";

  return (
    <section
      className={[
        "insite-hero-panel overflow-hidden rounded-xl p-4 sm:p-5",
        toneClass,
        align === "center" ? "text-center" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </section>
  );
}
