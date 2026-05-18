type MetricBlockProps = {
  value: string | number;
  label: string;
};

export default function MetricBlock({ value, label }: MetricBlockProps) {
  return (
    <div className="border-t border-slate-200 py-3 text-center">
      <p className="text-2xl font-black tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}
