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
import { scrollPageTo } from "@/lib/lenis";
import type { SpriteName } from "@/lib/sprites";

export type Step = { label: string; title: string; note: string; cat: SpriteName; catScale?: number };

/**
 * One step of a sign-up, laid out the way every page on the site is: the
 * question in the lime brush on the ink field, a margin note, a cat. On a wide
 * screen the question holds the left while the fields fill the right; on a
 * phone it all stacks, question first, so what's being asked is never
 * scrolled away from.
 *
 * Moving between steps re-asks the question — the heading rises again, a new
 * cat drops in — and puts the reader, and their focus, back at the top.
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
    if (shown.current === at) return;
    shown.current = at;
    scrollPageTo(0);
    head.current?.focus({ preventScroll: true });
    const el = body.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.fromTo(
      el.children,
      { y: 22, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: "power3.out", clearProps: "transform,opacity,visibility" },
    );
    return () => {
      tween.kill();
    };
  }, [at]);

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
        <form onSubmit={onSubmit} noValidate className="lg:pt-[clamp(4.5rem,11vh,7rem)]">
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
              Preview: teams live in this server&rsquo;s memory and vanish when it restarts.
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
