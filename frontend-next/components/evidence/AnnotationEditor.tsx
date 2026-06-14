"use client";

import { useEffect, useRef, useState } from "react";
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
  const size = 0.135;
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
  const [redoStack, setRedoStack] = useState<DrawShape[][]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("#DC2626");
  const [selectedFontSize, setSelectedFontSize] = useState(0.045);
  const [colorOpen, setColorOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originalX: number;
    originalY: number;
  }>({ active: false, startX: 0, startY: 0, originalX: 0, originalY: 0 });

  const dragRef = useRef<{
    mode: DragMode;
    index: number | null;
    startX: number;
    startY: number;
    original: DrawShape | null;
  }>({ mode: null, index: null, startX: 0, startY: 0, original: null });

  useEffect(() => {
    function closeMenusOnOutsideClick(event: MouseEvent) {
      if (!toolbarRef.current) return;
      if (toolbarRef.current.contains(event.target as Node)) return;

      setColorOpen(false);
      setTextColorOpen(false);
      setShapeMenuOpen(false);
    }

    document.addEventListener("mousedown", closeMenusOnOutsideClick);
    return () =>
      document.removeEventListener("mousedown", closeMenusOnOutsideClick);
  }, []);

  useEffect(() => {
    if (zoom === 1) {
      setPan({ x: 0, y: 0 });
    } else {
      setPan((current) => clampPan(current.x, current.y, zoom));
    }
  }, [zoom]);

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
    setTextColorOpen(false);
    setShapeMenuOpen(false);
  }

  function applyTextColor(color: string) {
    setSelectedColor(color);
    if (selectedIndex !== null) {
      updateShape(selectedIndex, (shape) => ({ ...shape, color }));
    }
    setTextColorOpen(false);
    setColorOpen(false);
    setShapeMenuOpen(false);
  }

  function addShape(type: "rect" | "circle" | "arrow" | "text") {
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
    setShapeMenuOpen(false);
    setRedoStack([]);
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
    if (localAnnotations[index]?.type === "text") {
      setSelectedFontSize(localAnnotations[index].fontSize || 0.045);
    }

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

    setRedoStack([]);
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

      if (shape.type === "text") {
        return {
          ...shape,
          x: clamp(original.x + dx),
          y: clamp(original.y + dy),
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

  function updateSelectedFontSize(value: number) {
    setSelectedFontSize(value);

    if (selectedIndex !== null) {
      updateShape(selectedIndex, (shape) =>
        shape.type === "text" ? { ...shape, fontSize: value } : shape,
      );
    }
  }

  function undoLast() {
    setLocalAnnotations((current) => {
      if (!current.length) return current;

      const next = current.slice(0, -1);
      const removed = current[current.length - 1];

      setRedoStack((stack) => [[removed], ...stack].slice(0, 20));
      return next;
    });

    setSelectedIndex(null);
  }

  function redoLast() {
    setRedoStack((stack) => {
      if (!stack.length) return stack;

      const [restored, ...remaining] = stack;

      setLocalAnnotations((current) => [...current, ...restored]);
      return remaining;
    });
  }

  function zoomOut() {
    setZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))));
  }

  function zoomIn() {
    setZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))));
  }

  function clampPan(x: number, y: number, targetZoom = zoom) {
    const viewport = viewportRef.current;
    if (!viewport || targetZoom <= 1) return { x: 0, y: 0 };

    const rect = viewport.getBoundingClientRect();
    const maxX = (rect.width * (targetZoom - 1)) / 2;
    const maxY = (rect.height * (targetZoom - 1)) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }

  function startPan(event: React.PointerEvent<HTMLDivElement>) {
    if (zoom <= 1) return;

    const target = event.target as HTMLElement;

    if (
      target.closest("[data-annotation-control='true']") ||
      target.closest("[data-annotation-shape='true']")
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    panRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originalX: pan.x,
      originalY: pan.y,
    };
  }

  function movePan(event: React.PointerEvent<HTMLDivElement>) {
    if (!panRef.current.active || zoom <= 1) return;

    const nextX =
      panRef.current.originalX + event.clientX - panRef.current.startX;
    const nextY =
      panRef.current.originalY + event.clientY - panRef.current.startY;

    setPan(clampPan(nextX, nextY));
  }

  function stopPan(event?: React.PointerEvent<HTMLDivElement>) {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    panRef.current.active = false;
  }

  return (
    <div
      className={`rounded-2xl border-2 border-[#1D72B8] bg-white dark:bg-slate-900 p-3 ${expanded ? "max-h-[86vh] overflow-auto" : ""}`}
    >
      <div className={expanded ? "mx-auto max-w-5xl" : ""}>
        <div className="overflow-hidden rounded-xl bg-slate-200">
          <div
            ref={viewportRef}
            className={`relative aspect-[4/3] w-full overflow-hidden bg-slate-200 ${
              zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""
            }`}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={stopPan}
            onPointerCancel={stopPan}
            onPointerLeave={stopPan}
            onWheel={(event) => {
              if (zoom <= 1) return;
              event.preventDefault();
              setPan((current) =>
                clampPan(current.x - event.deltaX, current.y - event.deltaY),
              );
            }}
          >
            <div
              className="absolute inset-0 origin-center"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              <img
                src={photoUrl}
                alt="Evidence"
                className="h-full w-full object-contain"
                draggable={false}
              />

              <svg
                className="absolute inset-0 h-full w-full touch-none"
                viewBox="0 0 4 3"
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
                          .map((p) => `${p.x * 4},${p.y * 3}`)
                          .join(" ")}
                        fill="none"
                        stroke={color}
                        strokeWidth="0.03"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  }

                  if (shape.type === "text") {
                    return (
                      <text
                        key={index}
                        x={shape.x * 4}
                        y={shape.y * 3}
                        fill={color}
                        fontSize={(shape.fontSize || selectedFontSize) * 3}
                        fontWeight="800"
                        stroke="white"
                        strokeWidth="0.018"
                        paintOrder="stroke"
                        className="cursor-move"
                        onPointerDown={(e) => startDrag(index, "move", e)}
                        onDoubleClick={() => {
                          const nextText = window.prompt(
                            "Annotation text",
                            shape.text || "Text",
                          );
                          if (nextText !== null) {
                            updateShape(index, (current) => ({
                              ...current,
                              text: nextText || "Text",
                            }));
                          }
                        }}
                      >
                        {shape.text || "Text"}
                      </text>
                    );
                  }

                  if (shape.type === "rect") {
                    const width = shape.width || 0.32;
                    const height = shape.height || 0.24;

                    return (
                      <g key={index}>
                        <rect
                          data-annotation-shape="true"
                          x={shape.x * 4}
                          y={shape.y * 3}
                          width={width * 4}
                          height={height * 3}
                          stroke={color}
                          strokeWidth="0.036"
                          fill="transparent"
                          onPointerDown={(e) => startDrag(index, "move", e)}
                        />
                        {selected && (
                          <circle
                            data-annotation-shape="true"
                            cx={(shape.x + width) * 4}
                            cy={(shape.y + height) * 3}
                            r="0.075"
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
                          data-annotation-shape="true"
                          cx={shape.x * 4}
                          cy={shape.y * 3}
                          r={radius * 3}
                          stroke={color}
                          strokeWidth="0.036"
                          fill="transparent"
                          onPointerDown={(e) => startDrag(index, "move", e)}
                        />
                        {selected && (
                          <circle
                            data-annotation-shape="true"
                            cx={(shape.x + radius) * 4}
                            cy={shape.y * 3}
                            r="0.075"
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
                        data-annotation-shape="true"
                        x1={shape.x * 4}
                        y1={shape.y * 3}
                        x2={x2 * 4}
                        y2={y2 * 3}
                        stroke={color}
                        strokeWidth="0.036"
                        strokeLinecap="round"
                        onPointerDown={(e) => startDrag(index, "move", e)}
                      />
                      <polygon
                        data-annotation-shape="true"
                        points={getArrowHeadPoints(
                          shape.x * 4,
                          shape.y * 3,
                          x2 * 4,
                          y2 * 3,
                        )}
                        fill={color}
                        onPointerDown={(e) => startDrag(index, "arrowEnd", e)}
                      />
                      {selected && (
                        <>
                          <circle
                            data-annotation-shape="true"
                            cx={shape.x * 4}
                            cy={shape.y * 3}
                            r="0.075"
                            fill={color}
                            onPointerDown={(e) =>
                              startDrag(index, "arrowStart", e)
                            }
                          />
                          <circle
                            data-annotation-shape="true"
                            cx={x2 * 4}
                            cy={y2 * 3}
                            r="0.075"
                            fill={color}
                            onPointerDown={(e) =>
                              startDrag(index, "arrowEnd", e)
                            }
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
      </div>

      <div
        ref={toolbarRef}
        className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
      >
        <div className="overflow-visible">
          <div className="flex min-w-max items-center">
            <button
              type="button"
              onClick={undoLast}
              className="flex h-11 w-10 items-center justify-center border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35"
              aria-label="Undo last annotation"
              title="Undo"
              disabled={!localAnnotations.length}
            >
              <span className="text-xl font-black leading-none">↩</span>
            </button>

            <button
              type="button"
              onClick={redoLast}
              className="flex h-11 w-10 items-center justify-center border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35"
              aria-label="Redo last annotation"
              title="Redo"
              disabled={!redoStack.length}
            >
              <span className="text-xl font-black leading-none">↪</span>
            </button>

            <div className="relative border-r border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShapeMenuOpen((open) => !open);
                  setColorOpen(false);
                  setTextColorOpen(false);
                }}
                className="flex h-11 items-center gap-2 px-3 text-xs font-black text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="Open shape tools"
                title="Shape tools"
              >
                Shape <span className="text-[9px]">▼</span>
              </button>

              {shapeMenuOpen && (
                <div className="absolute left-0 top-12 z-[80] w-40 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                  {[
                    ["rect", "□", "Box"],
                    ["circle", "○", "Circle"],
                    ["arrow", "↗", "Arrow"],
                    ["draw", "✎", "Draw"],
                    ["text", "T", "Text"],
                  ].map(([tool, icon, label]) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => {
                        if (tool === "draw") {
                          setDrawMode((value) => !value);
                          setShapeMenuOpen(false);
                          return;
                        }

                        addShape(tool as "rect" | "circle" | "arrow" | "text");
                      }}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-xs font-black transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        tool === "draw" && drawMode
                          ? "bg-[#E8F4FF] text-[#1D72B8]"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="flex w-5 justify-center text-base leading-none">
                        {icon}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex h-11 border-r border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTextColorOpen((open) => !open);
                  setColorOpen(false);
                  setShapeMenuOpen(false);
                }}
                className="flex h-11 w-11 flex-col items-center justify-center gap-1 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="Open text color palette"
                title="Text color"
              >
                <span className="flex h-5 items-center text-sm font-black leading-none">
                  T
                </span>
                <span
                  className="block h-1.5 w-6 rounded-full border border-slate-300 dark:border-slate-700"
                  style={{ backgroundColor: selectedColor }}
                />
              </button>

              {textColorOpen && (
                <div className="absolute left-0 top-12 z-[80] grid w-[112px] grid-cols-4 gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyTextColor(color)}
                      className="h-5 w-5 rounded border border-slate-300 dark:border-slate-700"
                      style={{ backgroundColor: color }}
                      aria-label={`Select text color ${color}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex h-11 border-r border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setColorOpen((open) => !open);
                  setTextColorOpen(false);
                  setShapeMenuOpen(false);
                }}
                className="flex h-11 w-11 flex-col items-center justify-center gap-1 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="Open shape color palette"
                title="Shape color"
              >
                <span className="flex h-5 items-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 20h16" />
                    <path d="M7 17l9.5-9.5a2.1 2.1 0 0 1 3 3L10 20H7v-3z" />
                    <path d="M14 7l3 3" />
                  </svg>
                </span>
                <span
                  className="block h-1.5 w-6 rounded-full border border-slate-300 dark:border-slate-700"
                  style={{ backgroundColor: selectedColor }}
                />
              </button>

              {colorOpen && (
                <div className="absolute left-0 top-12 z-[80] grid w-[112px] grid-cols-4 gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyColor(color)}
                      className="h-5 w-5 rounded border border-slate-300 dark:border-slate-700"
                      style={{ backgroundColor: color }}
                      aria-label={`Select shape color ${color}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex h-11 shrink-0 items-center border-r border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  updateSelectedFontSize(
                    Math.max(
                      0.025,
                      Number((selectedFontSize - 0.005).toFixed(3)),
                    ),
                  )
                }
                className="flex h-11 w-10 items-center justify-center border-r border-slate-200 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="Decrease text size"
                title="Decrease text size"
              >
                A↓
              </button>

              <button
                type="button"
                onClick={() =>
                  updateSelectedFontSize(
                    Math.min(
                      0.09,
                      Number((selectedFontSize + 0.005).toFixed(3)),
                    ),
                  )
                }
                className="flex h-11 w-10 items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="Increase text size"
                title="Increase text size"
              >
                A↑
              </button>
            </div>

            <div className="flex h-11 w-24 shrink-0 items-center gap-1 border-r border-slate-200 dark:border-slate-800 px-2">
              <input
                type="range"
                min="1"
                max="3"
                step="0.25"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-14 shrink-0 accent-[#1D72B8]"
                aria-label="Annotation zoom"
              />
              <span className="w-8 text-right text-[10px] font-black text-slate-500 dark:text-slate-400">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        Use Shape &gt; Text to add labels. Double-click text to edit words. Use
        A↓ and A↑ to adjust selected text size.
      </p>

      <div className="mt-3 flex justify-end gap-2">
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
    </div>
  );
}
