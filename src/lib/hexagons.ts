import { cn } from "@/lib/utils";

export interface HexagonSlot {
  id: number;
  col: number;
  row: number;
}

/** @deprecated Use HexagonSlot instead */
export type HexagonCoordinate = [col: number, row: number];

export const DEFAULT_HEXAGON_COUNT = 30;
export const DEFAULT_HEXAGON_BOUNDS = 25;
export const DEFAULT_HEXAGON_INTERVAL_MS = 4000;

function coordinateKey(col: number, row: number): string {
  return `${col},${row}`;
}

export function generateRandomHexagons(
  count = DEFAULT_HEXAGON_COUNT,
  bounds = DEFAULT_HEXAGON_BOUNDS,
): HexagonSlot[] {
  const used = new Set<string>();
  const slots: HexagonSlot[] = [];
  const maxAttempts = count * 20;
  let attempts = 0;

  for (let id = 0; id < count; id++) {
    let col = 0;
    let row = 0;
    let placed = false;

    while (!placed && attempts < maxAttempts) {
      attempts += 1;
      col = Math.floor(Math.random() * bounds);
      row = Math.floor(Math.random() * bounds);
      const key = coordinateKey(col, row);

      if (!used.has(key)) {
        used.add(key);
        placed = true;
      }
    }

    slots.push({ id, col, row });
  }

  return slots;
}

export const hexagonPatternClassName = cn(
  "fixed inset-0 h-full w-full skew-y-6",
  "mask-[radial-gradient(620px_circle_at_center,white,transparent)]",
);
