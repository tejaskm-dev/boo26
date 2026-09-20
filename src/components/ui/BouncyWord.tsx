/**
 * Splits a word into letters and knocks each one off the baseline by a fixed
 * amount, so a grotesk sits like hand-placed lettering instead of a set line.
 * The outer span carries the permanent tilt; the inner one is left free for
 * GSAP, which is what actually animates.
 */
function noise(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export default function BouncyWord({
  text,
  seed = 0,
  amount = 1,
}: {
  text: string;
  seed?: number;
  /** 0 keeps the line flat, 1 is the house bounce */
  amount?: number;
}) {
  return (
    <span aria-hidden="true">
      {[...text].map((ch, i) => {
        const rot = (noise(seed * 31 + i) - 0.5) * 8.5 * amount;
        const dy = (noise(seed * 57 + i + 9) - 0.5) * 0.11 * amount;
        const dx = (noise(seed * 91 + i + 3) - 0.5) * 0.02 * amount;
        return (
          <span
            key={`${ch}-${i}`}
            className="inline-block"
            style={{ transform: `rotate(${rot.toFixed(2)}deg) translate(${dx.toFixed(3)}em, ${dy.toFixed(3)}em)` }}
          >
            <span data-char className="inline-block will-change-transform">
              {ch === " " ? " " : ch}
            </span>
          </span>
        );
      })}
    </span>
  );
}
