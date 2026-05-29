import type { HTMLAttributes, ReactNode } from "react";

type HeroPanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  align?: "left" | "center";
};

export function HeroPanel({ children, align = "left", className = "", ...props }: HeroPanelProps) {
  return (
    <section
      className={[
        "overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-white shadow-sm sm:p-6",
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
