import { CheckField, ChoiceField, TextField } from "./Fields";
import { YEARS, cleanPhone, showPhone, typePhone, type Errors, type Member } from "@/lib/register/fields";

/**
 * The two steps both people fill in, the captain and the teammate alike —
 * who you are, then the college details — and the look-over before sending.
 */

type Props = {
  /** keeps the ids apart if both ever sit on one page */
  prefix: string;
  member: Member;
  errors: Errors<Member>;
  set: (field: keyof Member, value: string) => void;
  /** left a field */
  touch: (field: keyof Member) => void;
  /** the answer checks out */
  ok: (field: keyof Member) => boolean;
};

export function YouFields({ prefix, member, errors, set, touch, ok }: Props) {
  return (
    <>
      <TextField
        id={`${prefix}-name`}
        index="01"
        label="Full name"
        value={member.name}
        onChange={(v) => set("name", v)}
        onBlur={() => touch("name")}
        ok={ok("name")}
        error={errors.name}
        hint="As it is on your college ID."
        autoComplete="name"
        autoCapitalize="words"
        enterKeyHint="next"
        maxLength={60}
      />
      <TextField
        id={`${prefix}-email`}
        index="02"
        label="Email"
        type="email"
        inputMode="email"
        value={member.email}
        onChange={(v) => set("email", v)}
        onBlur={() => touch("email")}
        ok={ok("email")}
        error={errors.email}
        hint="Where the updates about the night go."
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="next"
        maxLength={120}
      />
      <TextField
        id={`${prefix}-phone`}
        index="03"
        label="WhatsApp number"
        type="tel"
        inputMode="tel"
        lead="+91"
        placeholder="98765 43210"
        value={member.phone}
        onChange={(v) => set("phone", typePhone(v))}
        onBlur={() => touch("phone")}
        ok={ok("phone")}
        error={errors.phone}
        hint="So we can reach you on the night."
        autoComplete="tel-national"
        enterKeyHint="go"
        maxLength={18}
      />
    </>
  );
}

export function CampusFields({ prefix, member, errors, set, touch, ok }: Props) {
  return (
    <>
      <TextField
        id={`${prefix}-department`}
        index="01"
        label="Department"
        value={member.department}
        onChange={(v) => set("department", v)}
        onBlur={() => touch("department")}
        ok={ok("department")}
        error={errors.department}
        placeholder="CSE, ECE, ME…"
        autoComplete="off"
        autoCapitalize="characters"
        enterKeyHint="next"
        maxLength={40}
      />
      <ChoiceField
        id={`${prefix}-year`}
        index="02"
        label="Year"
        name={`${prefix}-year`}
        options={YEARS}
        value={member.year}
        onChange={(v) => set("year", v)}
        error={errors.year}
      />
      <TextField
        id={`${prefix}-college-id`}
        index="03"
        label="College ID number"
        value={member.collegeId}
        onChange={(v) => set("collegeId", v)}
        onBlur={() => touch("collegeId")}
        ok={ok("collegeId")}
        error={errors.collegeId}
        hint="As printed on your ID card. Bring the card too."
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        enterKeyHint="go"
        maxLength={24}
      />
    </>
  );
}

/** One block of the look-over: what was entered, and the way back to change it. */
export function Summary({
  title,
  onEdit,
  rows,
}: {
  title: string;
  onEdit: () => void;
  rows: (string | false | undefined)[];
}) {
  return (
    <div className="border-t border-bone/15 pt-[clamp(1rem,2.5vh,1.4rem)]">
      <div className="flex items-baseline justify-between gap-6">
        <p className="label text-bone/45">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="label cursor-pointer text-bone/60 underline decoration-bone/30 underline-offset-[0.5em] outline-none transition-colors duration-300 hover:text-lime hover:decoration-lime focus-visible:text-lime"
        >
          Edit<span className="sr-only"> {title.toLowerCase()}</span>
        </button>
      </div>
      <ul className="mt-3 space-y-1.5">
        {rows.filter(Boolean).map((r, i) => (
          <li
            key={i}
            className={i === 0 ? "display text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.05] text-bone" : "body-copy text-[0.98rem] text-bone/70"}
          >
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function memberRows(m: Member) {
  const year = YEARS.find((y) => y.value === m.year)?.label;
  return {
    you: [m.name.trim(), m.email.trim().toLowerCase(), m.phone && showPhone(cleanPhone(m.phone))],
    campus: [
      [m.department.trim(), year && `${year} year`].filter(Boolean).join(" · "),
      m.collegeId.trim().toUpperCase(),
    ],
  };
}

/** The box both people tick: the rules, the conduct, the terms. */
export function Agree({
  id,
  checked,
  onChange,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  // new tabs, so reading them doesn't cost what's been typed here
  const link = (href: string, text: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="font-medium text-bone underline decoration-bone/35 decoration-[1.5px] underline-offset-[0.22em] outline-none transition-[text-decoration-color] duration-300 hover:decoration-lime focus-visible:decoration-lime"
    >
      {text}
    </a>
  );
  return (
    <CheckField id={id} checked={checked} onChange={onChange} error={error}>
      I&rsquo;ve read the {link("/register/rules", "rules")}, and I&rsquo;ll follow the{" "}
      {link("/code-of-conduct", "Code of Conduct")} and the {link("/terms", "Terms")}.
    </CheckField>
  );
}
