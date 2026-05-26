export type HexagonDirection = "horizontal" | "vertical";

type HexPoint = readonly [number, number];

function getHexSpacing(
  r: number,
  direction: HexagonDirection,
  gap: number,
): {
  colStep: number;
  rowStep: number;
  tileW: number;
  tileH: number;
} {
  const sqrt3 = Math.sqrt(3);

  if (direction === "horizontal") {
    const colStep = (3 * r) / 2 + (sqrt3 * gap) / 2;
    const rowStep = sqrt3 * r + gap;

    return {
      colStep,
      rowStep,
      tileW: colStep * 2,
      tileH: rowStep,
    };
  }

  const colStep = sqrt3 * r + gap;
  const rowStep = (3 * r) / 2 + (sqrt3 * gap) / 2;

  return {
    colStep,
    rowStep,
    tileW: colStep,
    tileH: rowStep * 2,
  };
}

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

export function hexPoints(
  cx: number,
  cy: number,
  r: number,
  direction: HexagonDirection,
): string {
  return hexVertexList(cx, cy, r, direction)
    .map(([px, py]) => `${px},${py}`)
    .join(" ");
}

export function hexCenter(
  col: number,
  row: number,
  r: number,
  direction: HexagonDirection,
  gap: number,
): [number, number] {
  if (direction === "horizontal") {
    const { colStep, rowStep } = getHexSpacing(r, direction, gap);
    const x = col * colStep + colStep / 2;
    const y = row * rowStep + rowStep / 2 + (col % 2 !== 0 ? rowStep / 2 : 0);
    return [x, y];
  }

  const { colStep, rowStep } = getHexSpacing(r, direction, gap);
  const x = col * colStep + colStep / 2 + (row % 2 !== 0 ? colStep / 2 : 0);
  const y = row * rowStep + rowStep / 2;
  return [x, y];
}

export function getTileGeometry(
  r: number,
  direction: HexagonDirection,
  gap: number,
): {
  tileW: number;
  tileH: number;
  centers: [number, number][];
} {
  if (direction === "horizontal") {
    const { colStep, rowStep, tileW, tileH } = getHexSpacing(r, direction, gap);

    const canonical: [number, number][] = [
      [colStep / 2, rowStep / 2],
      [(colStep * 3) / 2, rowStep],
    ];

    const centers: [number, number][] = [];
    for (const [cx, cy] of canonical) {
      centers.push([cx, cy]);
      if (cy - r < 0) centers.push([cx, cy + tileH]);
      if (cy + r > tileH) centers.push([cx, cy - tileH]);
      if (cx - r < 0) centers.push([cx + tileW, cy]);
      if (cx + r > tileW) centers.push([cx - tileW, cy]);
      if (cy - r < 0 && cx - r < 0) centers.push([cx + tileW, cy + tileH]);
      if (cy - r < 0 && cx + r > tileW) centers.push([cx - tileW, cy + tileH]);
      if (cy + r > tileH && cx - r < 0) centers.push([cx + tileW, cy - tileH]);
      if (cy + r > tileH && cx + r > tileW)
        centers.push([cx - tileW, cy - tileH]);
    }

    return { tileW, tileH, centers };
  }

  const { colStep, rowStep, tileW, tileH } = getHexSpacing(r, direction, gap);

  const canonical: [number, number][] = [
    [colStep / 2, rowStep / 2],
    [colStep, (rowStep * 3) / 2],
  ];

  const centers: [number, number][] = [];
  for (const [cx, cy] of canonical) {
    centers.push([cx, cy]);
    if (cy - r < 0) centers.push([cx, cy + tileH]);
    if (cy + r > tileH) centers.push([cx, cy - tileH]);
    if (cx - r < 0) centers.push([cx + tileW, cy]);
    if (cx + r > tileW) centers.push([cx - tileW, cy]);
    if (cy - r < 0 && cx - r < 0) centers.push([cx + tileW, cy + tileH]);
    if (cy - r < 0 && cx + r > tileW) centers.push([cx - tileW, cy + tileH]);
    if (cy + r > tileH && cx - r < 0) centers.push([cx + tileW, cy - tileH]);
    if (cy + r > tileH && cx + r > tileW)
      centers.push([cx - tileW, cy - tileH]);
  }

  return { tileW, tileH, centers };
}
