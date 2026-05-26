"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_HEXAGON_BOUNDS,
  DEFAULT_HEXAGON_COUNT,
  DEFAULT_HEXAGON_INTERVAL_MS,
  generateRandomHexagons,
  type HexagonSlot,
} from "@/lib/hexagons";

interface UseAnimatedHexagonsOptions {
  count?: number;
  bounds?: number;
  intervalMs?: number;
}

export function useAnimatedHexagons(
  options: UseAnimatedHexagonsOptions = {},
): HexagonSlot[] {
  const {
    count = DEFAULT_HEXAGON_COUNT,
    bounds = DEFAULT_HEXAGON_BOUNDS,
    intervalMs = DEFAULT_HEXAGON_INTERVAL_MS,
  } = options;

  const [hexagons, setHexagons] = useState<HexagonSlot[]>([]);

  useEffect(() => {
    setHexagons(generateRandomHexagons(count, bounds));

    const interval = setInterval(() => {
      setHexagons(generateRandomHexagons(count, bounds));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [bounds, count, intervalMs]);

  return hexagons;
}
