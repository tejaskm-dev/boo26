import { Ghost } from "@/components/ui/Glyphs";

/**
 * How far along a sign-up is, as stops on a trail: the 20 Hours thread and
 * its beads, laid on their side. Stops behind you are filled, the one you're
 * on glows, the rest wait as outlines — so the whole way, and how much of it
 * is left, is always in view. The ghost walks it with you.
 */
export default function Trail({ steps, at }: { steps: readonly string[]; at: number }) {
  const n = steps.length;
  // the trail runs from the centre of the first stop to the centre of the last
  const inset = `${50 / n}%`;
  const done = n > 1 ? at / (n - 1) : 1;

  return (
    <div className="relative w-full max-w-[26rem] pt-[1.9rem]">
      <span
        aria-hidden="true"
        className="absolute top-[calc(1.9rem+0.3rem)] h-0 border-t-[1.5px] border-dashed border-bone/25"
        style={{ left: inset, right: inset }}
      />
      <span
        aria-hidden="true"
        className="absolute top-[calc(1.9rem+0.3rem)] h-0 border-t-[1.5px] border-dashed border-lime transition-[width] duration-700 ease-[var(--ease-out-soft)]"
        style={{ left: inset, width: `calc((100% - 2 * ${inset}) * ${done})` }}
      />
      {/* the ghost, standing on the stop you're at */}
      <span
        aria-hidden="true"
        className="absolute top-0 block w-[1.45rem] -translate-x-1/2 transition-[left] duration-700 ease-[var(--ease-out-soft)]"
        style={{ left: `calc(${inset} + (100% - 2 * ${inset}) * ${done})` }}
      >
        <Ghost on="ink" className="block w-full" />
      </span>

      <ol aria-label="Progress" className="relative flex">
        {steps.map((step, i) => {
          const state = i < at ? "done" : i === at ? "current" : "ahead";
          return (
            <li
              key={step}
              aria-current={state === "current" ? "step" : undefined}
              className="flex flex-1 flex-col items-center gap-[0.65rem]"
            >
              <span
                aria-hidden="true"
                className={`block h-[0.62rem] w-[0.62rem] rounded-full transition-[background-color,box-shadow,transform] duration-500 ease-[var(--ease-out-soft)] ${
                  state === "ahead"
                    ? "bg-ink shadow-[inset_0_0_0_1.5px_rgba(243,240,231,0.35)]"
                    : state === "current"
                      ? "scale-[1.35] bg-lime shadow-[0_0_0_0.4rem_rgba(216,255,40,0.16)]"
                      : "bg-lime"
                }`}
              />
              <span
                className={`label text-[0.58rem] md:text-[0.62rem] ${
                  state === "current" ? "text-lime" : state === "done" ? "text-bone/70" : "text-bone/35"
                }`}
              >
                {step}
                <span className="sr-only">{state === "done" ? " (done)" : state === "current" ? " (you're here)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
