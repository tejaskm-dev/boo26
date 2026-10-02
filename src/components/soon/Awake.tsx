"use client";

import { useEffect, useRef } from "react";

/**
 * Marks the section it's dropped into as awake while it's on screen, or
 * nearly. The teaser's looping animations only run under [data-awake], so a
 * section nobody can see costs nothing. `target` marks another one instead
 * (the hero, which is the full site's and can't hold one of these).
 */
export default function Awake({ margin = "20% 0px", target }: { margin?: string; target?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = target ? document.querySelector<HTMLElement>(target) : ref.current?.closest("section");
    if (!section) return;
    const io = new IntersectionObserver(
      ([e]) => {
        section.dataset.awake = e.isIntersecting ? "true" : "false";
      },
      { rootMargin: margin },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [margin, target]);

  return <span ref={ref} hidden />;
}
