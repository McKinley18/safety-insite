export function AnnotationToolbar({
  zoomIn,
  zoomOut,
  zoom,
  setZoom,
  undoLast,
  localAnnotations,
  children,
}: {
  zoomIn: () => void;
  zoomOut: () => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  undoLast: () => void;
  localAnnotations: any[];
  children?: React.ReactNode;
}) {
  return (
    <div
      data-annotation-control="true"
      className="absolute right-2 top-1/2 z-[80] flex -translate-y-1/2 flex-col items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-1.5 py-2 shadow-lg"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={zoomIn}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102A43] text-sm font-black text-white"
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>
      <div className="relative flex h-32 w-8 items-center justify-center">
        <input
          type="range"
          min="1"
          max="3"
          step="0.25"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="annotation-vertical-zoom-slider accent-[#1D72B8]"
          aria-label="Annotation zoom"
        />
      </div>
      <button
        type="button"
        onClick={zoomOut}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-800"
        aria-label="Zoom out"
        title="Zoom out"
      >
        −
      </button>
      <span className="text-[9px] font-black text-slate-600">
        {Math.round(zoom * 100)}%
      </span>
      {children}
    </div>
  );
}
