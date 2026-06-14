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
      ? "sentinel-card-strong text-slate-950"
      : "relative isolate overflow-hidden bg-[#0B1320] text-white shadow-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.20),transparent_32rem),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94))]";

  return (
    <section
      className={[
        "overflow-hidden rounded-xl p-4 sm:p-5",
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
