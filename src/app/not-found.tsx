"use client";

import FuzzyText from "@/components/FuzzyText";

export default function NotFound() {
  return (
    <>
      <div className="w-full h-lvh font-bold text-center bg-zinc-900">
        <div className="flex justify-center items-center align-middle">
          <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover>
            404
          </FuzzyText>
        </div>
      </div>
    </>
  );
}
