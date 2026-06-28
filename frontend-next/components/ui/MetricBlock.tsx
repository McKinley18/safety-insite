type MetricBlockProps = {
  value: string | number;
  label: string;
};

export default function MetricBlock({ value, label }: MetricBlockProps) {
  return (
    <div className="border-t border-slate-200 py-3 text-center dark:border-slate-800">
      <p className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-200">
        {label}
      </p>
    </div>
  );
}
