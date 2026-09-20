"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Sprite from "@/components/ui/Sprite";
import Ambient from "@/components/fx/Ambient";
import SocialIcon from "@/components/ui/SocialIcon";
import Words from "@/components/fx/Words";
import { EVENT, FOOTER_LEGAL, FOOTER_NAV, NOTES, SOCIALS } from "@/lib/site";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The desk the night was built on.
 *
 * The props are arranged as one scene along the bottom edge and the two outer
 * margins — never across the link columns, which get a clear band of their own.
 * The statement, the newsletter and the columns are an ordinary three-band
 * footer underneath all of it.
 */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const root = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // the footer is uncovered rather than scrolled to: its contents start
      // low and rise to rest as the last section clears them, which reads as
      // the page sliding off something that was always underneath
      gsap.fromTo(
        inner.current,
        { yPercent: 16 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.45,
          },
        },
      );

      gsap.from("[data-desk] > *", {
        yPercent: 36,
        autoAlpha: 0,
        duration: 1,
        stagger: { each: 0.08, from: "edges" },
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
      });
      gsap.from("[data-hang]", {
        yPercent: -60,
        rotate: -8,
        autoAlpha: 0,
        duration: 1.1,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={root}
      data-field="ink"
      className="relative isolate w-full overflow-hidden bg-ink pb-[clamp(1.5rem,4vh,2.5rem)] pt-[clamp(4rem,11vh,7rem)] text-bone"
    >
      <div ref={inner} className="will-change-transform">
      <Ambient
        tone="ink"
        blobs={[
          { x: "-10%", y: "-8%", w: "44vw" },
          { x: "62%", y: "22%", w: "48vw" },
          { x: "24%", y: "58%", w: "36vw" },
        ]}
      />

      {/* hanging over the top edge */}
      <span data-hang className="absolute -top-[clamp(0.5rem,2vw,1.5rem)] left-[6%] z-20 block md:left-[11%]">
        <Sprite name="cat-hanging" scale={1.15} drift={12} idle={5} />
      </span>
      <span data-hang className="absolute -top-[clamp(0.25rem,1vw,1rem)] right-[12%] z-20 hidden md:block">
        <Sprite name="cat-tail" scale={1} drift={16} idle={4} />
      </span>

      <div className="relative z-10 px-[var(--edge)]">
        {/* band 1 — the statement and the sign-up */}
        <div className="grid items-start gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <p className="label label-loose whitespace-pre-line text-bone/40">
              Scroll{"\n"}build{"\n"}haunt{"\n"}repeat.
            </p>

            <h2 className="brush mt-[clamp(1.5rem,4vh,2.5rem)] -rotate-[1.3deg] select-none text-[clamp(2.6rem,8.5vw,7rem)] leading-[0.88]">
              <Words>{"See you at"}</Words>
              <span className="mt-[0.06em] flex flex-wrap items-baseline gap-[0.18em] text-lime">
                <Words>{EVENT.name}</Words>
                <span className="display text-[0.3em] tracking-tight">{EVENT.year}</span>
              </span>
            </h2>

            <p className="label label-loose mt-[clamp(1.25rem,3vh,2rem)] whitespace-pre-line text-bone/45">
              Same people.{"\n"}Brighter ideas.
            </p>
          </div>

          <div className="w-full lg:pt-[clamp(1rem,4vh,3rem)]">
            <h3 className="label label-loose text-bone/70">Don&rsquo;t miss updates</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSent(true);
              }}
              className="mt-4 flex w-full items-center gap-2 rounded-full border border-bone/20 bg-bone/[0.04] p-1.5 transition-colors duration-300 focus-within:border-lime/60"
            >
              <label htmlFor="footer-email" className="sr-only">
                Your email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSent(false);
                }}
                placeholder="Your email address"
                className="body-copy min-w-0 flex-1 bg-transparent px-4 py-2 text-[0.95rem] text-bone outline-none placeholder:text-bone/40"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="group grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-ink outline-none transition-transform duration-300 ease-[var(--ease-out-soft)] hover:scale-110 focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                <svg viewBox="0 0 16 10" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 5h13M10 1l4 4-4 4" />
                </svg>
              </button>
            </form>
            <p aria-live="polite" className="body-copy mt-3 max-w-[42ch] text-[0.88rem] text-bone/50">
              {sent
                ? "You're on the list — watch your inbox."
                : "Event updates, announcements and a few spooky surprises. No spam, promise."}
            </p>

            <p className="hand mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[14ch] whitespace-pre-line text-[clamp(1.05rem,1.5vw,1.4rem)] text-bone/45">
              {NOTES.desk}
            </p>
          </div>
        </div>

        {/* band 2 — the links, on their own clear ground */}
        <div className="mt-[clamp(3rem,8vh,5rem)] grid gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-[clamp(2rem,5vh,3rem)] border-t border-bone/12 pt-[clamp(2rem,5vh,3rem)] sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_NAV.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="label text-bone/40">{col.title}</h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="group body-copy relative inline-block text-[0.95rem] text-bone/80 outline-none transition-colors duration-300 hover:text-lime focus-visible:text-lime"
                    >
                      {l.label}
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-lime transition-transform duration-[400ms] ease-[var(--ease-out-soft)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Community">
            <h3 className="label text-bone/40">Community</h3>
            <ul className="mt-5 space-y-3">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="group body-copy inline-flex items-center gap-3 text-[0.95rem] text-bone/80 outline-none transition-colors duration-300 hover:text-lime focus-visible:text-lime"
                  >
                    <SocialIcon name={s.icon} className="h-[1.05rem] w-[1.05rem] transition-transform duration-300 group-hover:-translate-y-0.5" />
                    {s.label}
                    <span aria-hidden="true" className="text-[0.75em] opacity-60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="label text-bone/40">Event details</h3>
            <dl className="mt-5 space-y-3 text-[0.95rem]">
              {[
                ["Where", EVENT.venueLong],
                ["When", EVENT.dateLong],
                ["Runs for", "20 hours"],
                ["Teams", "2 per team"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="sr-only">{k}</dt>
                  <dd className="body-copy text-bone/80">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* band 3 — the desk, then the legal line */}
        {/* the desk — scattered by hand, each thing sitting at its own angle
            rather than spaced out in a row like a toolbar */}
        <div
          data-desk
          className="pointer-events-none relative mt-[clamp(2rem,5vh,3.5rem)] hidden h-[clamp(6rem,10vw,9rem)] lg:block"
          aria-hidden="true"
        >
          <Sprite name="books" scale={1.1} drift={6} className="absolute bottom-0 left-0" />
          <Sprite name="tape-dark" scale={0.9} drift={12} className="absolute bottom-[54%] left-[11%] -rotate-[18deg] opacity-80" />
          <Sprite name="cable" scale={1} drift={9} idle={3} className="absolute bottom-[4%] left-[19%]" />
          <Sprite name="can" scale={0.95} drift={11} idle={4} className="absolute bottom-[2%] left-[38%] rotate-[6deg]" />
          <Sprite name="clip" scale={0.95} drift={8} className="absolute bottom-[38%] left-[48%] -rotate-[24deg]" />
          <Sprite name="paper-ball" scale={0.9} drift={15} idle={5} className="absolute bottom-[10%] left-[55%]" />
          <Sprite name="pin" scale={0.85} drift={10} className="absolute bottom-[52%] left-[64%] rotate-[38deg] opacity-85" />
          <Sprite name="pizza-box" scale={1.05} drift={7} className="absolute bottom-0 right-[6%] -rotate-[3deg]" />
          <Sprite name="tape-lime" scale={0.85} drift={13} className="absolute bottom-[58%] right-[2%] rotate-[12deg]" />
        </div>

        <div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-col gap-5 border-t border-bone/12 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="relative block w-[clamp(3.5rem,5vw,4.75rem)]" style={{ aspectRatio: "1475 / 657" }}>
              <Image
                src="/assets/wordmark-light.webp"
                alt={`${EVENT.name} ${EVENT.year}`}
                fill
                sizes="80px"
                className="object-contain"
              />
            </span>
            <p className="label whitespace-pre-line text-bone/40">
              A hackathon by{"\n"}
              {EVENT.host}
            </p>
          </div>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {FOOTER_LEGAL.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="body-copy text-[0.85rem] text-bone/50 outline-none transition-colors duration-300 hover:text-bone focus-visible:text-lime"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="hand text-[clamp(1.05rem,1.5vw,1.35rem)] text-bone/60">{NOTES.footer}</p>
        </div>
      </div>
      </div>
    </footer>
  );
}
