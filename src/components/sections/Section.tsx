import FieldForm, { type FormName } from "./Field";

/**
 * Shared shell: colour field, id, rhythm, the forms the neighbouring field
 * arrives as, and the slow ambient weather behind it.
 *
 * The clip is overflow-x only. Horizontal bleed is contained, but anything that
 * crosses the seam vertically — every cat that hangs over a boundary — stays
 * whole instead of being sliced by the section box.
 */
export default function Section({
  id,
  field,
  fieldRight,
  forms,
  className = "",
  children,
}: {
  id?: string;
  field: "ink" | "bone";
  fieldRight?: "ink" | "bone";
  /**
   * Shapes of the *other* tone laid over this field. Each section picks and
   * places its own, which is what stops every join looking like the last one.
   */
  forms?: { shape: FormName; tone: "ink" | "bone"; at: string; hairline?: boolean }[];
  className?: string;
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
      {forms?.map((f, i) => (
        <FieldForm
          key={i}
          shape={f.shape}
          tone={f.tone}
          hairline={f.hairline}
          className={`-z-[5] ${f.at}`}
        />
      ))}
      {children}
    </section>
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
