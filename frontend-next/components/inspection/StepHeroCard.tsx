export function StepHeroCard({
  step,
  title,
  description,
  stats,
}: {
  step: string;
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="sentinel-hero-card p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-200">
        {step}
      </p>

      <h2 className="mt-0.5 text-lg font-black text-white">{title}</h2>

      <p className="mt-1 max-w-3xl text-xs font-semibold leading-5 text-blue-100">
        {description}
      </p>

      {!!stats?.length && (
        <div className="mt-2 flex h-16 w-full items-start justify-center gap-1.5 text-center">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex h-16 w-1/3 flex-col items-center justify-start rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-center shadow-sm ring-1 ring-white/10"
            >
              <p className="text-center text-[8px] font-black uppercase tracking-wide text-blue-100">
                {item.label}
              </p>
              <p className="mt-0.5 text-center text-sm font-black text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
