"use client";

import { useEffect, useRef, useState } from "react";
import type { HexagonSlot } from "@/lib/hexagons";
import { cn } from "@/lib/utils";
import { hexCenter, hexPoints, type HexagonDirection } from "@/lib/hexagon-geometry";

export const FADE_DURATION_MS = 450;
export const MAX_STAGGER_MS = 700;

interface AnimatedHexagonSlot {
  id: number;
  col: number;
  row: number;
  opacity: number;
}

interface HexagonHighlightLayerProps {
  slots: HexagonSlot[];
  radius: number;
  direction: HexagonDirection;
  gap: number;
  offsetX: number;
  offsetY: number;
  fillClassName?: string;
}

function toAnimatedSlots(slots: HexagonSlot[], opacity = 1): AnimatedHexagonSlot[] {
  return slots.map((slot) => ({
    id: slot.id,
    col: slot.col,
    row: slot.row,
    opacity,
  }));
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function slotsSignature(slots: HexagonSlot[]): string {
  return slots.map((slot) => `${slot.id}:${slot.col},${slot.row}`).join("|");
}

export function HexagonHighlightLayer({
  slots,
  radius,
  direction,
  gap,
  offsetX,
  offsetY,
  fillClassName,
}: HexagonHighlightLayerProps) {
  const [animatedSlots, setAnimatedSlots] = useState<AnimatedHexagonSlot[]>(
    () => toAnimatedSlots(slots),
  );
  const isFirstRenderRef = useRef(true);
  const previousSignatureRef = useRef(slotsSignature(slots));
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    const signature = slotsSignature(slots);

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousSignatureRef.current = signature;
      setAnimatedSlots(toAnimatedSlots(slots));
      return;
    }

    if (signature === previousSignatureRef.current) return;
    previousSignatureRef.current = signature;

    timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutIdsRef.current = [];

    if (prefersReducedMotion()) {
      setAnimatedSlots(toAnimatedSlots(slots));
      return;
    }

    slots.forEach((target) => {
      const staggerMs = Math.floor(Math.random() * MAX_STAGGER_MS);

      const fadeOutId = window.setTimeout(() => {
        setAnimatedSlots((current) =>
          current.map((slot) =>
            slot.id === target.id ? { ...slot, opacity: 0 } : slot,
          ),
        );
      }, staggerMs);
      timeoutIdsRef.current.push(fadeOutId);

      const fadeInId = window.setTimeout(() => {
        setAnimatedSlots((current) =>
          current.map((slot) =>
            slot.id === target.id
              ? {
                  id: target.id,
                  col: target.col,
                  row: target.row,
                  opacity: 1,
                }
              : slot,
          ),
        );
      }, staggerMs + FADE_DURATION_MS);
      timeoutIdsRef.current.push(fadeInId);
    });
  }, [slots]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  if (animatedSlots.length === 0) return null;

  return (
    <svg
      aria-hidden="true"
      className={cn("overflow-visible fill-inherit", fillClassName)}
      x={offsetX}
      y={offsetY}
    >
      {animatedSlots.map((slot) => {
        const [cx, cy] = hexCenter(slot.col, slot.row, radius, direction, gap);

        return (
          <polygon
            key={slot.id}
            points={hexPoints(cx, cy, radius - 1, direction)}
            strokeWidth="0"
            className="transition-opacity duration-[450ms] ease-out"
            style={{ opacity: slot.opacity }}
          />
        );
      })}
    </svg>
  );
}
