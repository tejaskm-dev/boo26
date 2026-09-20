"use client";

import { useEffect } from "react";
import { enableTilt, recalibrateTilt, canTilt } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Turns device tilt into the motion source on mobile and touch devices.
 *
 * - Android / Chrome grants orientation immediately on mount without user gestures.
 * - iOS Safari strictly requires a user gesture activation (click, touchend, pointerup).
 * - Rotating the device re-levels the adaptive baseline.
 */
export default function Tilt() {
  useEffect(() => {
    if (prefersReducedMotion() || !canTilt()) return;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const DOE = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    const isIOS = typeof DOE.requestPermission === "function";

    if (!isIOS) {
      // Android / non-iOS: silently activates immediately
      void enableTilt();
    } else {
      // iOS Safari: must be requested from valid user gesture (click, touchend, pointerup)
      const tryEnable = () => {
        void enableTilt().then((granted) => {
          if (granted) {
            removeGestureListeners();
          }
        });
      };

      const removeGestureListeners = () => {
        window.removeEventListener("touchend", tryEnable);
        window.removeEventListener("click", tryEnable);
        window.removeEventListener("pointerup", tryEnable);
      };

      window.addEventListener("touchend", tryEnable, { passive: true });
      window.addEventListener("click", tryEnable, { passive: true });
      window.addEventListener("pointerup", tryEnable, { passive: true });

      const onOrient = () => recalibrateTilt();
      window.addEventListener("orientationchange", onOrient);

      return () => {
        removeGestureListeners();
        window.removeEventListener("orientationchange", onOrient);
      };
    }

    const onOrient = () => recalibrateTilt();
    window.addEventListener("orientationchange", onOrient);

    return () => {
      window.removeEventListener("orientationchange", onOrient);
    };
  }, []);

  return null;
}
