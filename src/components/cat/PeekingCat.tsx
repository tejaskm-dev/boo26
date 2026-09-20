"use client";

import Image from "next/image";
import { forwardRef } from "react";
import CatEyes from "./CatEyes";
import { CAT_EYES } from "@/lib/eyes";
import { useFinePointer } from "@/lib/motion";

/**
 * The supplied cat, used as a character in its own right rather than as part of
 * the lockup. Whatever it peeks over is drawn on top of it by the caller.
 */
const PeekingCat = forwardRef<HTMLDivElement, {
  className?: string;
  excited?: boolean;
  priority?: boolean;
}>(function PeekingCat({ className = "", excited = false, priority = false }, ref) {
  const fine = useFinePointer();
  return (
    <div ref={ref} className={className} style={{ aspectRatio: "1327 / 871" }}>
      <div className="relative h-full w-full">
        <Image
          src="/assets/cat.webp"
          alt=""
          aria-hidden="true"
          fill
          priority={priority}
          sizes="(max-width: 767px) 70vw, 34vw"
          className="object-contain"
        />
        <CatEyes art={CAT_EYES} track={fine} excited={excited} />
      </div>
    </div>
  );
});

export default PeekingCat;
