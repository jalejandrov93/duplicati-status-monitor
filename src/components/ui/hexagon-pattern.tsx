import { useId } from "react";

import { HexagonHighlightLayer } from "@/components/ui/hexagon-highlight-layer";
import type { HexagonSlot } from "@/lib/hexagons";
import {
  getTileGeometry,
  hexPoints,
  type HexagonDirection,
} from "@/lib/hexagon-geometry";
import { cn } from "@/lib/utils";

interface HexagonPatternProps extends React.SVGProps<SVGSVGElement> {
  /**
   * The radius of each hexagon (center to vertex).
   * @default 40
   */
  radius?: number;
  /**
   * Spacing in pixels between adjacent hexagons.
   * @default 0
   */
  gap?: number;
  /**
   * Offset applied to the pattern origin on the x-axis.
   * @default -1
   */
  x?: number;
  /**
   * Offset applied to the pattern origin on the y-axis.
   * @default -1
   */
  y?: number;
  /**
   * Controls the orientation of the hexagons.
   * @default "horizontal"
   */
  direction?: HexagonDirection;
  /**
   * SVG stroke-dasharray applied to each hexagon outline.
   * @default "0"
   */
  strokeDasharray?: string;
  /**
   * Highlighted hexagons rendered on top of the repeating pattern.
   */
  hexagons?: HexagonSlot[];
  className?: string;
  [key: string]: unknown;
}

type HexPoint = readonly [number, number];

function hexVertexList(
  cx: number,
  cy: number,
  r: number,
  direction: HexagonDirection,
): HexPoint[] {
  const startAngle = direction === "horizontal" ? 0 : 30;
  return Array.from({ length: 6 }, (_, i) => {
    const angle = ((startAngle + i * 60) * Math.PI) / 180;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  });
}

function edgeLexKey(a: HexPoint, b: HexPoint): string {
  const [p, q] =
    a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1]) ? [a, b] : [b, a];
  return `${p[0].toFixed(6)},${p[1].toFixed(6)}|${q[0].toFixed(6)},${q[1].toFixed(6)}`;
}

function collectUniqueHexEdges(
  centers: [number, number][],
  r: number,
  direction: HexagonDirection,
): [HexPoint, HexPoint][] {
  const seen = new Set<string>();
  const edges: [HexPoint, HexPoint][] = [];
  for (const [cx, cy] of centers) {
    const verts = hexVertexList(cx, cy, r, direction);
    for (let i = 0; i < 6; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % 6];
      const key = edgeLexKey(a, b);
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([a, b]);
      }
    }
  }
  return edges;
}

function isSolidStrokeDasharray(strokeDasharray: string): boolean {
  const t = strokeDasharray.trim();
  return t === "" || t === "none" || t === "0";
}

export function HexagonPattern({
  radius = 40,
  gap = 0,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  direction = "horizontal",
  hexagons,
  className,
  ...props
}: HexagonPatternProps) {
  const id = useId();

  const { tileW, tileH, centers } = getTileGeometry(radius, direction, gap);
  const solidStroke = isSolidStrokeDasharray(strokeDasharray);
  const dashedEdges = solidStroke
    ? null
    : collectUniqueHexEdges(centers, radius, direction);

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={tileW}
          height={tileH}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          {solidStroke
            ? centers.map(([cx, cy]) => (
                <polygon
                  className="fill-none"
                  key={`${cx}-${cy}`}
                  points={hexPoints(cx, cy, radius, direction)}
                  strokeDasharray={strokeDasharray}
                />
              ))
            : dashedEdges?.map(([a, b]) => (
                <line
                  className="fill-none"
                  key={edgeLexKey(a, b)}
                  x1={a[0]}
                  x2={b[0]}
                  y1={a[1]}
                  y2={b[1]}
                  strokeDasharray={strokeDasharray}
                />
              ))}
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${id})`} stroke="none" />

      {hexagons && hexagons.length > 0 && (
        <HexagonHighlightLayer
          slots={hexagons}
          radius={radius}
          direction={direction}
          gap={gap}
          offsetX={x}
          offsetY={y}
        />
      )}
    </svg>
  );
}
