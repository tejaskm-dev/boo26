import Ambient from "@/components/fx/Ambient";

/**
 * Shared shell: colour field, id, rhythm, the organic edge into it, and the
 * slow ambient weather behind it.
 *
 * The clip is overflow-x only. Horizontal bleed is contained, but anything that
 * crosses the seam vertically — every cat that hangs over a boundary — stays
 * whole instead of being sliced by the section box.
 */
export default function Section({
  id,
  field,
  fieldRight,
  edge,
  className = "",
  ambient = true,
  children,
}: {
  id?: string;
  field: "ink" | "bone";
  fieldRight?: "ink" | "bone";
  /** the field the page arrives from — painted as a wave into this one */
  edge?: { from: "ink" | "bone"; shape: "wave" | "swell" };
  className?: string;
  /** the drifting weather behind the field */
  ambient?: boolean;
  children: React.ReactNode;
}) {
  const bg = field === "ink" ? "bg-ink text-bone" : "bg-bone text-ink";
  return (
    <section
      id={id}
      data-field={field}
      {...(fieldRight ? { "data-field-right": fieldRight } : {})}
      className={`relative isolate w-full overflow-x-clip ${bg} ${className}`}
    >
      {ambient && (
        <Ambient
          tone={field}
          blobs={[
            { x: "-12%", y: "-18%", w: "46vw" },
            { x: "58%", y: "34%", w: "52vw" },
            { x: "18%", y: "62%", w: "38vw" },
          ]}
        />
      )}
      {edge && <FieldEdge tone={edge.from} shape={edge.shape} />}
      {children}
    </section>
  );
}

const EDGES = {
  wave: "M0 110C130 110 248 58 374 58C500 58 548 116 680 116C812 116 880 52 1000 52V0H0Z",
  swell: "M0 50C110 50 180 104 310 104C440 104 530 30 670 30C810 30 880 96 1000 96V0H0Z",
} as const;

const LIP = {
  wave: "M0 110C130 110 248 58 374 58C500 58 548 116 680 116C812 116 880 52 1000 52",
  swell: "M0 50C110 50 180 104 310 104C440 104 530 30 670 30C810 30 880 96 1000 96",
} as const;

/** The join between two colour fields is never a straight line. */
function FieldEdge({ tone, shape }: { tone: "ink" | "bone"; shape: "wave" | "swell" }) {
  return (
    <svg
      viewBox="0 0 1000 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-px h-[clamp(3rem,7vw,7.5rem)] w-full"
    >
      <path d={EDGES[shape]} fill={tone === "ink" ? "var(--color-ink)" : "var(--color-bone)"} />
      <path
        d={LIP[shape]}
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        opacity={0.5}
        transform="translate(0 11)"
      />
    </svg>
  );
}

export function SectionLabel({
  index,
  children,
  className = "",
}: {
  index: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`label flex items-center gap-3 opacity-60 ${className}`}>
      <span className="text-lime opacity-100">{index}</span>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
      <span>{children}</span>
    </p>
  );
}
