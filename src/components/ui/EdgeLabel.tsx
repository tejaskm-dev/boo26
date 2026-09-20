/**
 * The section's name, set on its side in the outer margin.
 *
 * Desktop leaves a wide gutter that a phone never has, and on these pages it
 * was reading as nothing rather than as room. A running label down the edge
 * gives the composition a left or right wall to sit against and says where you
 * are without competing with the heading for the middle of the page.
 *
 * Margin furniture only — hidden below the width where the gutter exists.
 */
export default function EdgeLabel({
  children,
  side = "right",
  className = "",
}: {
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`label pointer-events-none absolute hidden select-none items-center gap-[clamp(0.75rem,1.4vw,1.5rem)] whitespace-nowrap opacity-30 lg:flex ${
        side === "right" ? "right-[clamp(0.5rem,1.4vw,1.5rem)]" : "left-[clamp(0.5rem,1.4vw,1.5rem)]"
      } ${className}`}
      style={{
        writingMode: "vertical-rl",
        transform: side === "left" ? "rotate(180deg)" : undefined,
      }}
    >
      <span aria-hidden="true" className="h-[clamp(2rem,5vw,4.5rem)] w-px bg-current opacity-50" />
      {children}
    </span>
  );
}
