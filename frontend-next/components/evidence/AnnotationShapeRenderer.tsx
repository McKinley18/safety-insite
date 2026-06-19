import { DragMode } from "./AnnotationEditor";

export function AnnotationShapeRenderer({
  localAnnotations,
  selectedIndex,
  selectedFontSize,
  startDrag,
  updateShape,
  getArrowHeadPoints,
  beginDraw,
  handlePointerMove,
  stopDrag,
}: {
  localAnnotations: any[];
  selectedIndex: number | null;
  selectedFontSize: number;
  startDrag: (index: number, mode: DragMode, e: React.PointerEvent) => void;
  updateShape: (index: number, updater: (current: any) => any) => void;
  getArrowHeadPoints: (x1: number, y1: number, x2: number, y2: number) => string;
  beginDraw: (e: React.PointerEvent<SVGSVGElement>) => void;
  handlePointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  stopDrag: (e: React.PointerEvent<SVGSVGElement>) => void;
}) {
  return (
    <svg
      className="absolute inset-0 h-full w-full touch-none"
      viewBox="0 0 4 3"
      preserveAspectRatio="none"
      onPointerDown={beginDraw}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
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
                .map((p: any) => `${p.x * 4},${p.y * 3}`)
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
                  onPointerDown={(e) => startDrag(index, "arrowStart", e)}
                />
                <circle
                  data-annotation-shape="true"
                  cx={x2 * 4}
                  cy={y2 * 3}
                  r="0.075"
                  fill={color}
                  onPointerDown={(e) => startDrag(index, "arrowEnd", e)}
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
