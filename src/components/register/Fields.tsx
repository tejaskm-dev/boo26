/**
 * The register form's inputs, drawn for the ink field.
 *
 * No boxes: a field is its label and a hairline to write on, and the lime
 * stroke the site's links use draws along it while you type. Mistakes come
 * back as margin notes in the hand the rest of the site annotates in, so
 * being corrected reads as part of the page rather than a system alarm.
 *
 * Everything is a real input with a real label — the pretty parts are
 * decoration around it — and anything that goes wrong is tied to its field
 * with aria-describedby, so a screen reader hears it where it happened.
 */

type Base = {
  id: string;
  label: string;
  /** the step's own count, set in lime before the label */
  index?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

function Note({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-note`} className="hand mt-2 flex items-center gap-2 text-[clamp(1.05rem,1.3vw,1.2rem)] leading-tight text-lime">
        <span aria-hidden="true" className="h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime" />
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-note`} className="body-copy mt-2 text-[0.84rem] text-bone/45">
        {hint}
      </p>
    );
  }
  return null;
}

function Label({ index, label, optional }: { index?: string; label: string; optional?: boolean }) {
  return (
    <>
      {index ? <span className="text-lime">{index}</span> : null}
      <span>{label}</span>
      {optional ? <span className="text-bone/30">· optional</span> : null}
    </>
  );
}

export function TextField({
  id,
  label,
  index,
  error,
  hint,
  optional,
  value,
  onChange,
  ...input
}: Base & {
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange">) {
  const noted = error || hint;
  return (
    <div>
      <label htmlFor={id} className="label flex items-center gap-3 text-bone/55">
        <Label index={index} label={label} optional={optional} />
      </label>
      <div className="group/field relative mt-2">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={noted ? `${id}-note` : undefined}
          className="body-copy w-full bg-transparent pb-3 pt-1.5 text-[1.15rem] text-bone caret-lime outline-none placeholder:text-bone/25 md:text-[1.3rem]"
          {...input}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-px ${error ? "bg-lime/60" : "bg-bone/25"}`}
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-lime transition-transform duration-500 ease-[var(--ease-out-soft)] group-focus-within/field:scale-x-100"
        />
      </div>
      <Note id={id} error={error} hint={hint} />
    </div>
  );
}

/**
 * A pick-one row. Each option is a native radio, so arrow keys move through
 * them; what shows is a soft lime blob when it's the one chosen — the SHIP
 * mark from the home page, on a smaller job.
 */
export function ChoiceField({
  id,
  label,
  index,
  error,
  hint,
  optional,
  name,
  options,
  value,
  onChange,
}: Base & {
  name: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const noted = error || hint;
  return (
    <fieldset aria-describedby={noted ? `${id}-note` : undefined}>
      <legend className="label flex items-center gap-3 text-bone/55">
        <Label index={index} label={label} optional={optional} />
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o, i) => (
          <label key={o.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              className={`label block border px-[1.05rem] py-[0.85rem] text-[0.68rem] transition-[background-color,border-color,color] duration-300 ease-[var(--ease-out-soft)] peer-checked:border-lime peer-checked:bg-lime peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-lime peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink md:text-[0.72rem] ${
                error ? "border-lime/50 text-bone/80" : "border-bone/22 text-bone/75 hover:border-bone/55 hover:text-bone"
              } ${BLOBS[i % BLOBS.length]}`}
            >
              {o.label}
            </span>
          </label>
        ))}
      </div>
      <Note id={id} error={error} hint={hint} />
    </fieldset>
  );
}

/** a few cuts of the same soft shape, so a row of options never repeats one */
const BLOBS = [
  "[border-radius:46%_54%_58%_42%/42%_60%_40%_58%]",
  "[border-radius:58%_42%_46%_54%/56%_44%_56%_44%]",
  "[border-radius:40%_60%_52%_48%/48%_56%_44%_52%]",
];

/** The one box to tick. */
export function CheckField({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="group flex cursor-pointer items-start gap-4">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-note` : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`mt-[0.1rem] grid h-[1.55rem] w-[1.55rem] shrink-0 place-items-center border-[1.5px] text-ink transition-colors duration-300 [border-radius:42%_58%_52%_48%/52%_44%_56%_48%] peer-checked:border-lime peer-checked:bg-lime peer-focus-visible:ring-2 peer-focus-visible:ring-lime peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink peer-checked:[&>svg]:opacity-100 ${
            error ? "border-lime/70" : "border-bone/40 group-hover:border-bone/70"
          }`}
        >
          <svg viewBox="0 0 14 12" className="h-[0.8rem] w-[0.8rem] opacity-0 transition-opacity duration-200" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 6.5 5 10l7.5-8.5" />
          </svg>
        </span>
        <span className="body-copy text-[0.95rem] leading-[1.55] text-bone/75">{children}</span>
      </label>
      <Note id={id} error={error} />
    </div>
  );
}
