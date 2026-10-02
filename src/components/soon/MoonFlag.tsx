"use client";

import { useRef } from "react";
import { SECRETS } from "@/lib/soon";
import MuLearn from "./MuLearn";
import { buzz } from "./troll";

/**
 * Planted on the moon in 01: a flag about the size of a fingernail, with
 * µLearn's logo on it — micro, as in µ. Point at it and it comes up close
 * and opens its eyes; on a phone, tap it (and tap again to put it back).
 */
export default function MoonFlag({ className = "" }: { className?: string }) {
  const flag = useRef<HTMLSpanElement>(null);
  const toggle = () => {
    const el = flag.current;
    if (!el) return;
    const on = el.dataset.zoom !== "true";
    el.dataset.zoom = on ? "true" : "false";
    el.dataset.muOpen = on ? "true" : "false";
    if (on) buzz(10);
  };
  return (
    <span
      ref={flag}
      data-secret={SECRETS.flag}
      data-zoom="false"
      onClick={toggle}
      onPointerEnter={(e) => e.pointerType === "mouse" && flag.current && (flag.current.dataset.muOpen = "true")}
      onPointerLeave={(e) => e.pointerType === "mouse" && flag.current?.dataset.zoom !== "true" && (flag.current!.dataset.muOpen = "false")}
      className={`soon-flag ${className}`}
      aria-hidden="true"
    >
      <i className="soon-flag-pole" />
      <span className="soon-flag-cloth soon-loop">
        <MuLearn tone="ink" alive={false} className="w-[84%]" />
      </span>
    </span>
  );
}
