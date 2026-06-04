type SentinelCardProps = {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  interactive?: boolean;
};

export default function SentinelCard({
  children,
  className = "",
  dark = false,
  interactive = false,
}: SentinelCardProps) {
  return (
    <div
      className={[
        dark
          ? "rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20"
          : "rounded-2xl border border-slate-200 bg-white shadow-sm",
        interactive ? "transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
