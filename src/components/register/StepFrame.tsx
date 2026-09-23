"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Section from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import BlobButton from "@/components/ui/BlobButton";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import Trail from "./Trail";
import { prefersReducedMotion } from "@/lib/motion";
import { getLenis, scrollPageTo } from "@/lib/lenis";
import { ghostSays, onGhost } from "@/lib/register/ghost";
import type { SpriteName } from "@/lib/sprites";

/** the fields that bring up a keyboard: where attention goes when a step opens */
const TYPED = "input[type=text], input[type=email], input[type=tel], input:not([type])";

export type Step = { label: string; title: string; note: string; cat: SpriteName; catScale?: number };

/**
 * One step of a sign-up, laid out the way every page on the site is: the
 * question in the lime brush on the ink field, a margin note, a cat. On a wide
 * screen the question holds the left while the fields fill the right; on a
 * phone it all stacks, question first, so what's being asked is never
 * scrolled away from.
 *
 * Moving between steps re-asks the question — the heading rises again, a new
 * cat drops in, the fields slide in from the way you're going — and puts the
 * reader back at the top: focus on the first field where there's a keyboard
 * and a mouse, on the question on a phone, so no keyboard jumps up unasked.
 *
 * Filling it in should never fight you. Enter goes to the next field and only
 * sends the step from the last one; the ghost on the trail follows along; and
 * when something's wrong the step shakes and the cursor lands on the problem.
 */
export default function StepFrame({
  kicker,
  steps,
  at,
  onSubmit,
  onBack,
  backHref,
  next,
  busy = false,
  preview = false,
  children,
}: {
  kicker: React.ReactNode;
  steps: readonly Step[];
  at: number;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** a step back inside the form */
  onBack?: () => void;
  /** or, on the first step, out of it */
  backHref?: string;
  next: string;
  busy?: boolean;
  preview?: boolean;
  children: React.ReactNode;
}) {
  const step = steps[at];
  const head = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  /** the step on screen: the first arrives with the page, every later one is a move */
  const shown = useRef(at);

  useEffect(() => {
    const from = shown.current;
    if (from === at) return;
    shown.current = at;
    scrollPageTo(0);
    const el = body.current;
    const first = el?.querySelector<HTMLInputElement>(TYPED);
    if (first && window.matchMedia("(hover: hover) and (pointer: fine)").matches) first.focus({ preventScroll: true });
    else head.current?.focus({ preventScroll: true });
    if (!el || prefersReducedMotion()) return;
    const dir = at > from ? 1 : -1;
    const tween = gsap.fromTo(
      el.children,
      { x: dir * 40, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.55, stagger: 0.06, ease: "power3.out", clearProps: "transform,opacity,visibility" },
    );
    return () => {
      tween.kill();
    };
  }, [at]);

  // Something's wrong: the step shakes and the cursor goes to the first
  // problem. After the effects of whatever else just changed, so a jump back
  // to an earlier step doesn't take the focus straight off it again.
  useEffect(
    () =>
      onGhost((mood) => {
        const el = body.current;
        if (mood !== "scared" || !el) return;
        if (!prefersReducedMotion()) gsap.fromTo(el, { x: 0 }, { x: 7, duration: 0.055, repeat: 5, yoyo: true, ease: "none", clearProps: "x" });
        window.setTimeout(() => {
          const bad = el.querySelector<HTMLElement>("[aria-invalid=true]");
          if (!bad) return;
          bad.focus({ preventScroll: true });
          const r = bad.getBoundingClientRect();
          if (r.top < 90 || r.bottom > window.innerHeight - 40) {
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(bad, { offset: -window.innerHeight * 0.3 });
            else bad.scrollIntoView({ block: "center" });
          }
        }, 80);
      }),
    [],
  );

  /** Enter moves on a field, and sends the step only from the last one */
  const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const t = e.target;
    if (e.key !== "Enter" || e.nativeEvent.isComposing || !(t instanceof HTMLInputElement) || t.type === "checkbox") return;
    const inputs = Array.from(e.currentTarget.querySelectorAll("input"));
    const next = inputs.slice(inputs.indexOf(t) + 1).find((i) => !(t.type === "radio" && i.name === t.name));
    if (!next) return;
    e.preventDefault();
    // a row of choices takes focus on its picked one, as Tab would
    (next.type === "radio" ? (inputs.find((i) => i.name === next.name && i.checked) ?? next) : next).focus();
  };

  return (
    <Section
      field="ink"
      className="min-h-svh pb-[clamp(3.5rem,9vh,6rem)] pt-[calc(var(--header-h)+clamp(1.25rem,5vh,3.5rem))]"
    >
      <div className="grid grid-cols-1 gap-[clamp(2.25rem,5vw,5.5rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        {/* the question */}
        <div className="relative lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
          <p className="label label-loose text-bone/45">{kicker}</p>
          <div className="mt-[clamp(0.75rem,2vh,1.25rem)]">
            <Trail steps={steps.map((s) => s.label)} at={at} />
          </div>

          <div className="relative mt-[clamp(1.75rem,5vh,3rem)]">
            <div ref={head} tabIndex={-1} className="outline-none">
              <p className="sr-only">
                Step {at + 1} of {steps.length}: {step.label}.
              </p>
              <Words
                key={at}
                as="h1"
                className="brush -rotate-[1.5deg] select-none pb-[0.06em] pr-[clamp(4.5rem,24vw,12rem)] text-[clamp(3rem,8vw,6.75rem)] leading-[0.86] text-lime lg:pr-0"
              >
                {step.title}
              </Words>
            </div>
            <p className="hand mt-[clamp(0.6rem,1.6vh,1rem)] max-w-[16ch] -rotate-[3deg] whitespace-pre-line pl-[0.35rem] text-[clamp(1.1rem,1.7vw,1.5rem)] text-bone/60">
              {step.note}
            </p>
            {/* the empty half of a wide screen gets one of the site's own marks */}
            <Sprite
              name="squiggle-lime"
              scale={0.3}
              drift={16}
              className="pointer-events-none absolute -bottom-[clamp(6rem,15vh,10rem)] left-[1rem] hidden lg:block"
            />
            <RiseIn
              key={`cat-${at}`}
              className="pointer-events-none absolute right-0 top-[-0.5rem] lg:right-[4%] lg:top-auto lg:bottom-[-1rem]"
              start="top 100%"
            >
              <Sprite name={step.cat} scale={step.catScale ?? 0.42} idle={5} />
            </RiseIn>
          </div>
        </div>

        {/* the answers */}
        <form
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          onInput={() => ghostSays("nod")}
          onFocus={() => ghostSays("watch")}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) ghostSays("away");
          }}
          noValidate
          className="lg:pt-[clamp(4.5rem,11vh,7rem)]"
        >
          <div ref={body} className="space-y-[clamp(1.9rem,4.5vh,2.6rem)]">
            {children}
          </div>

          <div className="mt-[clamp(2.5rem,6vh,3.75rem)] flex flex-wrap-reverse items-center justify-between gap-x-6 gap-y-5">
            {onBack ? (
              <button type="button" onClick={onBack} className={BACK}>
                <BackArrow />
                Back
              </button>
            ) : backHref ? (
              <a href={backHref} className={BACK}>
                <BackArrow />
                Back
              </a>
            ) : (
              <span />
            )}
            <BlobButton type="submit" size="lg" busy={busy}>
              {next}
            </BlobButton>
          </div>

          {preview ? (
            <p className="label mt-[clamp(2.5rem,6vh,3.5rem)] flex items-start gap-3 leading-[1.7] text-bone/35">
              <span aria-hidden="true" className="mt-[0.45em] h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime/70" />
              Trying it out: teams live in the server&rsquo;s memory. They go when it restarts, and a deploy can lose them
              between requests.
            </p>
          ) : null}
        </form>
      </div>
    </Section>
  );
}

const BACK =
  "group label inline-flex cursor-pointer items-center gap-3 py-2 text-bone/60 outline-none transition-colors duration-300 hover:text-lime focus-visible:text-lime";

function BackArrow() {
  return (
    <svg
      viewBox="0 0 16 10"
      className="h-[0.7rem] w-[1.1rem] transition-transform duration-300 group-hover:-translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 5H2M6 1 2 5l4 4" />
    </svg>
  );
}
