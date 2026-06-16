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
    <div className="sentinel-hero-card p-4 sm:p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
        {step}
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>

      <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
        {description}
      </p>

      {!!stats?.length && (
        <div className="mt-2 sm:mt-4 grid grid-cols-3 gap-2 text-center">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[76px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-sm ring-1 ring-white/10"
            >
              <p className="text-center text-[9px] font-black uppercase tracking-wide text-blue-100">
                {item.label}
              </p>
              <p className="mt-1 text-center text-lg font-black text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
