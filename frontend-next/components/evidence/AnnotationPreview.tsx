"use client";

import { useEffect, useRef, useState } from "react";

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
  fontSize?: number;
};

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
        viewBox="0 0 4 3"
        preserveAspectRatio="none"
      >
        {annotations.map((shape, index) => {
          const color = shape.color || "#DC2626";

          if (shape.type === "draw") {
            const points = (shape as any).points || [];
            return (
              <polyline
                key={index}
                points={points
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
                fontSize={(shape.fontSize || 0.045) * 3}
                fontWeight="800"
                stroke="white"
                strokeWidth="0.018"
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
                x={shape.x * 4}
                y={shape.y * 3}
                width={(shape.width || 0.32) * 4}
                height={(shape.height || 0.24) * 3}
                stroke={color}
                strokeWidth="0.036"
                fill="transparent"
              />
            );
          }

          if (shape.type === "circle") {
            const radius = shape.radius || 0.12;

            return (
              <circle
                key={index}
                cx={shape.x * 4}
                cy={shape.y * 3}
                r={radius * 3}
                stroke={color}
                strokeWidth="0.036"
                fill="transparent"
              />
            );
          }

          const x2 = shape.x2 ?? shape.x + 0.34;
          const y2 = shape.y2 ?? shape.y;

          return (
            <g key={index}>
              <line
                x1={shape.x * 4}
                y1={shape.y * 3}
                x2={x2 * 4}
                y2={y2 * 3}
                stroke={color}
                strokeWidth="0.036"
                strokeLinecap="round"
              />
              <polygon
                points={getArrowHeadPoints(
                  shape.x * 4,
                  shape.y * 3,
                  x2 * 4,
                  y2 * 3,
                )}
                fill={color}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
