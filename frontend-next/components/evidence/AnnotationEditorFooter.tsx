export function AnnotationEditorFooter({
  onCancel,
  onSave,
  localAnnotations,
}: {
  onCancel: () => void;
  onSave: (annotations: any[]) => void;
  localAnnotations: any[];
}) {
  return (
    <div className="mt-3 flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-black text-slate-700 dark:text-slate-300 transition hover:bg-slate-300"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={() => onSave(localAnnotations)}
        className="rounded-xl bg-[#1D72B8] px-4 py-2 text-xs font-black text-white transition hover:bg-[#155A91]"
      >
        Save
      </button>
    </div>
  );
}
