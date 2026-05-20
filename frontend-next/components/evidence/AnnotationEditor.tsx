"use client";

import { useRef, useState } from "react";
import { AnnotationShape } from "./AnnotationPreview";

const COLORS = [
  "#DC2626",
  "#F97316",
  "#EAB308",
  "#1D72B8",
  "#16A34A",
  "#7C3AED",
  "#FFFFFF",
  "#000000",
];

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

function getArrowHeadPoints(x1: number, y1: number, x2: number, y2: number) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 0.045;
  const spread = Math.PI / 7;

  const leftX = x2 - size * Math.cos(angle - spread);
  const leftY = y2 - size * Math.sin(angle - spread);
  const rightX = x2 - size * Math.cos(angle + spread);
  const rightY = y2 - size * Math.sin(angle + spread);

  return `${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`;
}

type DrawShape = AnnotationShape & {
  points?: { x: number; y: number }[];
};

type DragMode = "move" | "resize" | "arrowStart" | "arrowEnd" | "draw" | null;

export default function AnnotationEditor({
  photoUrl,
  annotations,
  onSave,
  onCancel,
  expanded = false,
}: {
  photoUrl: string;
  annotations: DrawShape[];
  onSave: (annotations: DrawShape[]) => void;
  onCancel: () => void;
  expanded?: boolean;
}) {
  const [localAnnotations, setLocalAnnotations] = useState<DrawShape[]>(
    annotations || [],
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("#DC2626");
  const [colorOpen, setColorOpen] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [zoom, setZoom] = useState(1);

  const dragRef = useRef<{
    mode: DragMode;
    index: number | null;
    startX: number;
    startY: number;
    original: DrawShape | null;
  }>({ mode: null, index: null, startX: 0, startY: 0, original: null });

  function updateShape(
    index: number,
    updater: (shape: DrawShape) => DrawShape,
  ) {
    setLocalAnnotations((current) =>
      current.map((shape, i) => (i === index ? updater(shape) : shape)),
    );
  }

  function applyColor(color: string) {
    setSelectedColor(color);
    if (selectedIndex !== null) {
      updateShape(selectedIndex, (shape) => ({ ...shape, color }));
    }
    setColorOpen(false);
  }

  function addShape(type: "rect" | "circle" | "arrow") {
    const offset = localAnnotations.length * 0.03;

    const next: DrawShape =
      type === "rect"
        ? {
            type,
            x: 0.18 + offset,
            y: 0.18 + offset,
            width: 0.36,
            height: 0.22,
            color: selectedColor,
          }
        : type === "circle"
          ? {
              type,
              x: 0.42 + offset,
              y: 0.36 + offset,
              radius: 0.12,
              color: selectedColor,
            }
          : {
              type,
              x: 0.2 + offset,
              y: 0.35 + offset,
              x2: 0.68 + offset,
              y2: 0.35 + offset,
              color: selectedColor,
            };

    setDrawMode(false);
    setLocalAnnotations((current) => [...current, next]);
    setSelectedIndex(localAnnotations.length);
  }

  function startDrag(index: number, mode: DragMode, e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as SVGElement;
    const svg = target.ownerSVGElement || target;
    const rect = svg.getBoundingClientRect();

    const x = clamp((e.clientX - rect.left) / rect.width);
    const y = clamp((e.clientY - rect.top) / rect.height);

    setDrawMode(false);
    setSelectedIndex(index);

    dragRef.current = {
      mode,
      index,
      startX: x,
      startY: y,
      original: { ...localAnnotations[index] },
    };
  }

  function beginDraw(e: React.PointerEvent<SVGSVGElement>) {
    if (!drawMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width);
    const y = clamp((e.clientY - rect.top) / rect.height);

    const newShape: DrawShape = {
      type: "draw",
      x,
      y,
      color: selectedColor,
      points: [{ x, y }],
    };

    setLocalAnnotations((current) => [...current, newShape]);
    setSelectedIndex(localAnnotations.length);

    dragRef.current = {
      mode: "draw",
      index: localAnnotations.length,
      startX: x,
      startY: y,
      original: newShape,
    };
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (drag.index === null || !drag.mode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width);
    const y = clamp((e.clientY - rect.top) / rect.height);

    if (drag.mode === "draw") {
      updateShape(drag.index, (shape) => ({
        ...shape,
        points: [...(shape.points || []), { x, y }],
      }));
      return;
    }

    if (!drag.original) return;

    const dx = x - drag.startX;
    const dy = y - drag.startY;
    const original = drag.original;

    updateShape(drag.index, (shape) => {
      if (drag.mode === "move") {
        return {
          ...shape,
          x: clamp(original.x + dx),
          y: clamp(original.y + dy),
          x2: original.x2 !== undefined ? clamp(original.x2 + dx) : undefined,
          y2: original.y2 !== undefined ? clamp(original.y2 + dy) : undefined,
        };
      }

      if (drag.mode === "resize" && shape.type === "rect") {
        return {
          ...shape,
          width: clamp((original.width || 0.32) + dx, 0.05, 0.95),
          height: clamp((original.height || 0.24) + dy, 0.05, 0.95),
        };
      }

      if (drag.mode === "resize" && shape.type === "circle") {
        return {
          ...shape,
          radius: clamp((original.radius || 0.12) + dx, 0.03, 0.45),
        };
      }

      if (drag.mode === "arrowStart") return { ...shape, x, y };
      if (drag.mode === "arrowEnd") return { ...shape, x2: x, y2: y };

      return shape;
    });
  }

  function stopDrag() {
    dragRef.current = {
      mode: null,
      index: null,
      startX: 0,
      startY: 0,
      original: null,
    };
  }

  function undoLast() {
    setLocalAnnotations((current) => current.slice(0, -1));
    setSelectedIndex(null);
  }

  function zoomOut() {
    setZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))));
  }

  function zoomIn() {
    setZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))));
  }

  function resetZoom() {
    setZoom(1);
  }

  return (
    <div
      className={`rounded-2xl border-2 border-[#1D72B8] bg-white p-3 ${expanded ? "max-h-[86vh] overflow-auto" : ""}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => addShape("rect")}
          className="flex h-8 w-8 items-center justify-center text-slate-700"
          aria-label="Add square"
        >
          <span className="block h-4 w-4 border-2 border-current" />
        </button>
        <button
          onClick={() => addShape("circle")}
          className="flex h-8 w-8 items-center justify-center text-slate-700"
          aria-label="Add circle"
        >
          <span className="block h-4 w-4 rounded-full border-2 border-current" />
        </button>
        <button
          onClick={() => addShape("arrow")}
          className="flex h-8 w-8 items-center justify-center text-slate-700"
          aria-label="Add arrow"
        >
          <span className="text-xl leading-none">↗</span>
        </button>
        <button
          onClick={() => setDrawMode((v) => !v)}
          className={`flex h-8 w-8 items-center justify-center ${
            drawMode ? "text-[#1D72B8]" : "text-slate-700"
          }`}
        >
          <span className="text-xl leading-none">✎</span>
        </button>

        <div className="relative">
          <div className="flex h-7 overflow-hidden rounded-lg border border-slate-300 bg-white">
            <button
              onClick={() => setColorOpen((v) => !v)}
              className="h-7 w-7"
              style={{ backgroundColor: selectedColor }}
              aria-label="Selected annotation color"
            />
            <button
              onClick={() => setColorOpen((v) => !v)}
              className="flex w-5 items-center justify-center border-l border-slate-300 bg-slate-100 text-[8px] font-black text-slate-700"
              aria-label="Open color options"
            >
              ▼
            </button>
          </div>

          {colorOpen && (
            <div className="absolute right-0 top-8 z-50 grid w-[84px] grid-cols-4 gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => applyColor(color)}
                  className="h-4 w-4 border border-slate-300"
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={zoomOut}
            className="rounded-lg px-2 py-1 text-xs font-black text-slate-700 disabled:opacity-40"
            disabled={zoom <= 1}
          >
            −
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="rounded-lg bg-white px-2 py-1 text-[11px] font-black text-slate-700 shadow-sm"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="rounded-lg px-2 py-1 text-xs font-black text-slate-700 disabled:opacity-40"
            disabled={zoom >= 3}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={undoLast}
          className="flex h-9 items-center justify-center rounded-xl bg-red-50 px-3 text-xs font-black text-red-700"
        >
          Undo
        </button>
      </div>

      <div className={expanded ? "mx-auto max-w-5xl" : ""}>
        <div className="overflow-auto rounded-xl bg-slate-200">
          <div
            className="relative aspect-[4/3] bg-slate-200"
            style={{
              width: `${zoom * 100}%`,
              minWidth: "100%",
            }}
          >
            <img
              src={photoUrl}
              alt="Evidence"
              className="h-full w-full object-contain"
            />

            <svg
              className="absolute inset-0 h-full w-full touch-none"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              onPointerDown={beginDraw}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDrag}
              onPointerLeave={stopDrag}
            >
              {localAnnotations.map((shape, index) => {
                const selected = selectedIndex === index;
                const color = shape.color || "#DC2626";

                if (shape.type === "draw") {
                  return (
                    <polyline
                      key={index}
                      points={(shape.points || [])
                        .map((p) => `${p.x},${p.y}`)
                        .join(" ")}
                      fill="none"
                      stroke={color}
                      strokeWidth="0.01"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                }

                if (shape.type === "rect") {
                  const width = shape.width || 0.32;
                  const height = shape.height || 0.24;

                  return (
                    <g key={index}>
                      <rect
                        x={shape.x}
                        y={shape.y}
                        width={width}
                        height={height}
                        stroke={color}
                        strokeWidth="0.012"
                        fill="transparent"
                        onPointerDown={(e) => startDrag(index, "move", e)}
                      />
                      {selected && (
                        <circle
                          cx={shape.x + width}
                          cy={shape.y + height}
                          r="0.025"
                          fill={color}
                          onPointerDown={(e) => startDrag(index, "resize", e)}
                        />
                      )}
                    </g>
                  );
                }

                if (shape.type === "circle") {
                  const radius = shape.radius || 0.12;

                  return (
                    <g key={index}>
                      <circle
                        cx={shape.x}
                        cy={shape.y}
                        r={radius}
                        stroke={color}
                        strokeWidth="0.012"
                        fill="transparent"
                        onPointerDown={(e) => startDrag(index, "move", e)}
                      />
                      {selected && (
                        <circle
                          cx={shape.x + radius}
                          cy={shape.y}
                          r="0.025"
                          fill={color}
                          onPointerDown={(e) => startDrag(index, "resize", e)}
                        />
                      )}
                    </g>
                  );
                }

                const x2 = shape.x2 ?? shape.x + 0.34;
                const y2 = shape.y2 ?? shape.y;

                return (
                  <g key={index}>
                    <line
                      x1={shape.x}
                      y1={shape.y}
                      x2={x2}
                      y2={y2}
                      stroke={color}
                      strokeWidth="0.012"
                      strokeLinecap="round"
                      onPointerDown={(e) => startDrag(index, "move", e)}
                    />
                    <polygon
                      points={getArrowHeadPoints(shape.x, shape.y, x2, y2)}
                      fill={color}
                      onPointerDown={(e) => startDrag(index, "arrowEnd", e)}
                    />
                    {selected && (
                      <>
                        <circle
                          cx={shape.x}
                          cy={shape.y}
                          r="0.025"
                          fill={color}
                          onPointerDown={(e) =>
                            startDrag(index, "arrowStart", e)
                          }
                        />
                        <circle
                          cx={x2}
                          cy={y2}
                          r="0.025"
                          fill={color}
                          onPointerDown={(e) => startDrag(index, "arrowEnd", e)}
                        />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs font-bold text-slate-500">
        Select a shape to move, resize, or recolor. Zoom in for precise marking.
      </p>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-full bg-slate-200 px-4 py-2 text-xs font-black text-slate-700"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(localAnnotations)}
          className="rounded-full bg-[#1D72B8] px-4 py-2 text-xs font-black text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
}
