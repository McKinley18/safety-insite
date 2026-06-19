export function StatsGrid({ dashboard }: { dashboard: any }) {
  return (
    <div className="mx-auto grid w-full max-w-[360px] grid-cols-2 gap-2.5 lg:mx-0 lg:max-w-[390px]">
      {[
        [String(dashboard.reportCount), "Reports", "Inspection packages"],
        [String(dashboard.findingCount), "Findings", "Captured observations"],
        [String(dashboard.openActions), "Open Actions", "Active follow-up work"],
        [String(dashboard.overdueActions), "Overdue", "Needs attention"],
      ].map(([value, label]) => (
        <div
          key={label}
          className="rounded-xl border border-white/12 bg-white/10 px-3 py-3 text-center shadow-none backdrop-blur"
        >
          <p className="text-center text-2xl font-black tracking-[-0.06em] text-white sm:text-3xl">
            {value}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
