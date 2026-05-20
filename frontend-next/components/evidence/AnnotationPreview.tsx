export type AnnotationShape = {
  type: "rect" | "circle" | "arrow" | "draw" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
  color: string;
  text?: string;
};

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

export default function AnnotationPreview({
  photoUrl,
  annotations = [],
}: {
  photoUrl: string;
  annotations?: AnnotationShape[];
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-200">
      <img
        src={photoUrl}
        alt="Evidence"
        className="h-full w-full object-contain"
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        {annotations.map((shape, index) => {
          const color = shape.color || "#DC2626";

          if (shape.type === "draw") {
            const points = (shape as any).points || [];
            return (
              <polyline
                key={index}
                points={points.map((p: any) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={color}
                strokeWidth="0.01"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          }

          if (shape.type === "text") {
            return (
              <text
                key={index}
                x={shape.x}
                y={shape.y}
                fill={color}
                fontSize="0.045"
                fontWeight="800"
                stroke="white"
                strokeWidth="0.006"
                paintOrder="stroke"
              >
                {shape.text || "Text"}
              </text>
            );
          }

          if (shape.type === "rect") {
            return (
              <rect
                key={index}
                x={shape.x}
                y={shape.y}
                width={shape.width || 0.32}
                height={shape.height || 0.24}
                stroke={color}
                strokeWidth="0.012"
                fill="transparent"
              />
            );
          }

          if (shape.type === "circle") {
            return (
              <circle
                key={index}
                cx={shape.x}
                cy={shape.y}
                r={shape.radius || 0.12}
                stroke={color}
                strokeWidth="0.012"
                fill="transparent"
              />
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
              />
              <polygon
                points={getArrowHeadPoints(shape.x, shape.y, x2, y2)}
                fill={color}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
