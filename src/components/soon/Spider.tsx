"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Sprite from "@/components/ui/Sprite";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A cobweb in the corner, and its owner letting itself down on a thread as
 * the page scrolls past — back up if you scroll back. Tap it and it zips up
 * out of reach, then thinks better of it.
 *
 * Two layers each for the spider and its thread: the outer one follows the
 * scroll, the inner one does the zip, so the two never fight over a value.
 */
export default function Spider({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const drop = useRef<HTMLDivElement>(null);
  const hang = useRef<HTMLSpanElement>(null);
  const body = useRef<HTMLSpanElement>(null);
  const bodyZip = useRef<HTMLButtonElement>(null);
  const threadZip = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const length = () => drop.current?.offsetHeight ?? 80;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el.closest("section") ?? el,
          start: "top 85%",
          end: "top 5%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(body.current, { y: 0 }, { y: length, ease: "none" }, 0).fromTo(
        hang.current,
        { scaleY: 0.02 },
        { scaleY: 1, ease: "none" },
        0,
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const zip = () => {
    if (busy.current || prefersReducedMotion()) return;
    busy.current = true;
    const down = Number(gsap.getProperty(body.current, "y")) || 0;
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .to(bodyZip.current, { y: -down - 4, duration: 0.3, ease: "power3.out" })
      .to(threadZip.current, { scaleY: 0.02, duration: 0.3, ease: "power3.out" }, 0)
      .to({}, { duration: 1.5 })
      .to(bodyZip.current, { y: 0, duration: 1.6, ease: "power1.inOut" })
      .to(threadZip.current, { scaleY: 1, duration: 1.6, ease: "power1.inOut" }, "<");
  };

  return (
    <div ref={root} className={className}>
      <Sprite name="web" scale={0.9} className="ml-auto w-full opacity-80" />
      <div ref={drop} className="absolute left-[46%] top-[40%] h-[clamp(4rem,12vh,7.5rem)] w-10 -translate-x-1/2">
        <span ref={hang} className="absolute inset-0 block origin-top">
          <span ref={threadZip} className="absolute inset-0 block origin-top">
            <span className="soon-thread text-ink" />
          </span>
        </span>
        <span ref={body} className="absolute left-1/2 top-0 block w-[clamp(2.4rem,3.4vw,3.2rem)] -translate-x-1/2 -translate-y-[30%]">
          <button
            ref={bodyZip}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={zip}
            className="block w-full cursor-pointer"
          >
            <Sprite name="spider" scale={0.4} className="w-full" />
          </button>
        </span>
      </div>
    </div>
  );
}
