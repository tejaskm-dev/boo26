"use client";

import { useEffect, useRef } from "react";

/**
 * Marks the section it's dropped into as awake while it's on screen, or
 * nearly. The teaser's looping animations only run under [data-awake], so a
 * section nobody can see costs nothing.
 */
export default function Awake({ margin = "20% 0px" }: { margin?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    const io = new IntersectionObserver(
      ([e]) => {
        section.dataset.awake = e.isIntersecting ? "true" : "false";
      },
      { rootMargin: margin },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [margin]);

  return <span ref={ref} hidden />;
}
