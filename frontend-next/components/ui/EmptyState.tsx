type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border-y border-dashed border-slate-300 py-6 text-center">
      <p className="text-sm font-black text-slate-700">{title}</p>
      {description && (
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}
