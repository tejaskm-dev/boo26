"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import Section from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import BlobButton from "@/components/ui/BlobButton";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import Qr from "./Qr";
import LiveGhost from "./LiveGhost";
import { CODE_ALPHABET, showCode } from "@/lib/register/code";
import type { TeamView } from "@/lib/register/store";
import { prefersReducedMotion, whenOpen } from "@/lib/motion";
import { toast } from "@/lib/toast";
import { EVENT } from "@/lib/site";

/** How often a waiting team page checks whether the teammate is in yet. */
const POLL = 4000;

/**
 * The team's own page. Whoever holds the code can open it, so it shows only
 * first names.
 *
 * While there's a seat empty it's the invite: the code to read out, the link
 * to send, the QR to hold up — and it keeps an eye out, so the captain sees
 * their teammate land without reloading. Once both seats are taken it turns
 * into what happens next.
 */
export default function TeamRoom({
  team,
  link,
  arrived,
  preview,
}: {
  team: TeamView;
  /** the join page, in full, for the link and the QR */
  link: string;
  /** how this visit got here: just made the team, or just joined it */
  arrived: "new" | "joined" | null;
  preview: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // how this visit began, kept once the address has been tidied
  const [landed] = useState(arrived);
  const seat = useRef<HTMLLIElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const codeLine = useRef<HTMLParagraphElement>(null);
  const qr = useRef<HTMLDivElement>(null);
  const wasFull = useRef(team.full);
  const cheered = useRef(false);
  const code = showCode(team.code);
  const [captain, mate] = team.members;

  // The address loses its ?new or ?joined, so a bookmark or a reload later
  // doesn't say "Team made." again. Through the router: it keeps its own copy
  // of the address, and writes it back over one changed behind its back.
  useEffect(() => {
    if (arrived) router.replace(pathname, { scroll: false });
  }, [arrived, pathname, router]);

  // The code lands like a departure board, and the QR turns to face you —
  // both once the page is uncovered, so neither is spent under the preloader.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrambleTextPlugin);
    return whenOpen(() => {
      if (codeLine.current) {
        gsap.to(codeLine.current, {
          duration: 1.1,
          ease: "none",
          scrambleText: { text: code, chars: CODE_ALPHABET, speed: 0.7, revealDelay: 0.25 },
        });
      }
      if (qr.current) {
        gsap.from(qr.current, {
          rotateY: 65,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.25,
          transformPerspective: 700,
          transformOrigin: "50% 50%",
        });
      }
    });
  }, [code]);

  // waiting: look again every few seconds, while anyone's looking
  useEffect(() => {
    if (team.full) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, POLL);
    return () => window.clearInterval(id);
  }, [team.full, router]);

  // the seat fills: celebrate, whether it happened here or on the way in
  useEffect(() => {
    const filled = team.full && !wasFull.current;
    wasFull.current = team.full;
    if (filled) {
      toast(`${mate} is in. You're a team.`, "Team complete");
      if (!prefersReducedMotion() && heading.current) {
        gsap.fromTo(heading.current, { rotation: -2 }, { rotation: 2, duration: 0.1, repeat: 5, yoyo: true, ease: "none", clearProps: "rotation" });
      }
    }
    if ((filled || (landed === "joined" && team.full)) && !cheered.current) {
      cheered.current = true;
      burst(seat.current);
    }
  }, [team.full, mate, landed]);

  const copy = async (text: string, what: string) => {
    toast((await copyText(text)) ? "Copied" : "Couldn't copy. Select it instead.", what);
  };

  const share = async () => {
    const text = `Join my team “${team.name}” for ${EVENT.name} ${EVENT.year}. Team code: ${code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${EVENT.name} ${EVENT.year}`, text, url: link });
      } catch {
        /* closed without sharing */
      }
      return;
    }
    toast((await copyText(`${text}\n${link}`)) ? "Invite copied, ready to paste" : "Couldn't copy. Select the link instead.", "Share");
  };

  return (
    <Section
      field="ink"
      className="min-h-svh pb-[clamp(3.5rem,9vh,6rem)] pt-[calc(var(--header-h)+clamp(1.5rem,5vh,3.5rem))]"
    >
      <Sprite name="star" scale={0.13} drift={28} className="pointer-events-none absolute right-[30%] top-[22%] hidden md:block" />
      <div className="px-[var(--edge)]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="label label-loose text-bone/45">
            Team <span className="text-bone">{code}</span>
          </p>
          <p className="label text-bone/45">{team.full ? "Complete" : "1 of 2 in"}</p>
        </div>

        {/* who's in */}
        <div className="mt-[clamp(1.75rem,5vh,3rem)] grid items-end gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="relative min-w-0">
            {landed ? (
              <p className="hand -rotate-[3deg] text-[clamp(1.2rem,1.9vw,1.7rem)] text-lime">
                {landed === "new" ? "Team made." : "You're in."}
              </p>
            ) : null}
            {/* the name itself shakes when the second seat fills */}
            <span ref={heading} className="block">
              <Words
                as="h1"
                className="brush -rotate-[1.5deg] select-none break-words pb-[0.06em] pr-[clamp(4rem,20vw,10rem)] text-[clamp(2.9rem,8.5vw,7.5rem)] leading-[0.86] text-lime [overflow-wrap:anywhere] lg:pr-[clamp(6rem,12vw,12rem)]"
              >
                {team.name}
              </Words>
            </span>
            <p className="hand mt-[clamp(0.6rem,1.6vh,1rem)] -rotate-[3deg] whitespace-pre-line pl-[0.35rem] text-[clamp(1.1rem,1.7vw,1.5rem)] text-bone/60">
              {team.full ? "Two of you.\nSee you on the 24th." : "One down.\nOne to go."}
            </p>
            <RiseIn key={team.full ? "full" : "waiting"} className="pointer-events-none absolute bottom-0 right-0" start="top 100%">
              <Sprite name={team.full ? "cat-treasure" : "cat-box"} scale={team.full ? 0.42 : 0.4} idle={5} />
            </RiseIn>
          </div>

          <ol className="grid grid-cols-2 gap-[clamp(0.6rem,1.4vw,1rem)]">
            <li className="relative bg-bone/[0.07] px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,2.4vh,1.4rem)] [border-radius:34%_66%_58%_42%/40%_36%_64%_60%]">
              <Seat index="01" role="Captain" name={captain} />
            </li>
            <li
              ref={seat}
              className={`relative px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,2.4vh,1.4rem)] transition-colors duration-700 [border-radius:58%_42%_46%_54%/52%_60%_40%_48%] ${
                mate ? "bg-bone/[0.07]" : "border-[1.5px] border-dashed border-bone/25"
              }`}
            >
              <Seat index="02" role="Teammate" name={mate} />
            </li>
          </ol>
        </div>

        {team.full ? (
          <Next />
        ) : (
          <section aria-labelledby="invite-title" className="mt-[clamp(3.5rem,9vh,6rem)] border-t border-bone/15 pt-[clamp(2rem,5vh,3rem)]">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 id="invite-title" className="label label-loose text-bone/70">
                Send this to your teammate
              </h2>
              <p className="hand text-[clamp(1.05rem,1.5vw,1.35rem)] text-bone/55">Any one of the three works.</p>
            </div>

            <div className="mt-[clamp(1.75rem,4.5vh,2.75rem)] grid gap-[clamp(2.5rem,6vw,5rem)] md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center">
              <div>
                {/* 1 — the code, to read out */}
                <p className="label flex items-center gap-3 text-bone/45">
                  <span className="text-lime">01</span> The code
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <p
                    ref={codeLine}
                    className="display select-all whitespace-nowrap text-[clamp(3.2rem,11vw,7.5rem)] leading-[0.9] tracking-[0.02em]"
                  >
                    {code}
                  </p>
                  <button type="button" onClick={() => copy(team.code, "Team code")} className={SMALL}>
                    Copy code
                  </button>
                </div>

                {/* 2 — the link, to send */}
                <p className="label mt-[clamp(2rem,5vh,2.75rem)] flex items-center gap-3 text-bone/45">
                  <span className="text-lime">02</span> The link
                </p>
                <p className="body-copy mt-2 select-all break-all text-[0.95rem] text-bone/75">{link}</p>
                <div className="mt-[clamp(1.25rem,3vh,1.75rem)] flex flex-wrap items-center gap-x-6 gap-y-4">
                  <BlobButton onClick={share}>Share invite</BlobButton>
                  <button type="button" onClick={() => copy(link, "Invite link")} className={SMALL}>
                    Copy link
                  </button>
                </div>
              </div>

              {/* 3 — the QR, to hold up */}
              <figure className="relative justify-self-center md:justify-self-end">
                <p className="label mb-3 flex items-center gap-3 text-bone/45 md:hidden">
                  <span className="text-lime">03</span> The QR
                </p>
                <div ref={qr} className="relative w-[min(17rem,72vw)] rotate-[2deg] shadow-[0_18px_40px_rgba(0,0,0,0.45)] [border-radius:0.9rem]">
                  <Qr text={link} label={`QR code: join ${team.name}`} className="block h-auto w-full" />
                  <Sprite name="clip" scale={0.24} className="absolute -right-[0.9rem] -top-[1.6rem] rotate-[18deg]" />
                  {/* a viewfinder's corners, breathing: point something at it */}
                  {[
                    "left-[-0.5rem] top-[-0.5rem] border-l-2 border-t-2",
                    "right-[-0.5rem] top-[-0.5rem] border-r-2 border-t-2",
                    "left-[-0.5rem] bottom-[-0.5rem] border-b-2 border-l-2",
                    "right-[-0.5rem] bottom-[-0.5rem] border-b-2 border-r-2",
                  ].map((at) => (
                    <span key={at} aria-hidden="true" className={`viewfinder absolute h-4 w-4 border-lime ${at}`} />
                  ))}
                </div>
                <figcaption className="hand mt-4 -rotate-[2deg] text-center text-[clamp(1.05rem,1.4vw,1.3rem)] text-bone/55">
                  Point a phone camera at it.
                </figcaption>
              </figure>
            </div>

            <p className="label mt-[clamp(2.5rem,6vh,3.5rem)] flex items-start gap-3 leading-[1.8] text-bone/40">
              <span aria-hidden="true" className="mt-[0.45em] h-[0.38rem] w-[0.38rem] shrink-0 animate-pulse rotate-45 bg-lime" />
              This page is watching. It&rsquo;ll change the moment your teammate joins.
            </p>
          </section>
        )}

        {preview ? (
          <p className="label mt-[clamp(2rem,5vh,3rem)] flex items-start gap-3 leading-[1.7] text-bone/35">
            <span aria-hidden="true" className="mt-[0.45em] h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime/70" />
            Preview: teams live in this server&rsquo;s memory and vanish when it restarts.
          </p>
        ) : null}
      </div>
    </Section>
  );
}

const SMALL =
  "label cursor-pointer py-2 text-bone/65 underline decoration-bone/30 underline-offset-[0.5em] outline-none transition-colors duration-300 hover:text-lime hover:decoration-lime focus-visible:text-lime";

function Seat({ index, role, name }: { index: string; role: string; name?: string }) {
  return (
    <>
      <p className="label flex items-center gap-2.5 text-bone/45">
        <span className="text-lime">{index}</span> {role}
      </p>
      {name ? (
        <p className="display mt-3 flex items-baseline gap-2.5 text-[clamp(1.15rem,2.2vw,1.75rem)] leading-[1.05] text-bone">
          {/* a long name wraps rather than being cut off */}
          <span className="min-w-0 [overflow-wrap:anywhere]">{name}</span>
          <span aria-hidden="true" className="h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime" />
        </p>
      ) : (
        <p className="display mt-3 flex items-center gap-2 text-[clamp(1.15rem,2.2vw,1.75rem)] leading-[1.05] text-bone/30">
          <span>
            Waiting
            <span aria-hidden="true" className="animate-pulse">.</span>
            <span aria-hidden="true" className="animate-pulse [animation-delay:250ms]">.</span>
            <span aria-hidden="true" className="animate-pulse [animation-delay:500ms]">.</span>
          </span>
          {/* sitting in the empty seat, watching the door */}
          <LiveGhost search follow={false} className="w-[1.4rem] shrink-0 opacity-70" />
        </p>
      )}
    </>
  );
}

/** Once both are in: what's left to do before the night. */
function Next() {
  const items = [
    { k: "The fee", v: "₹200 per team, ₹100 each. How and when to pay: coming soon." },
    { k: "Your IDs", v: "Both of you bring your college ID. You may be asked for it at any point." },
    { k: "The night", v: "24 October, 2 PM. The doors open at ASIET, Kalady. It runs 20 hours." },
  ];
  const links = [
    { href: "/register/rules", label: "The rules" },
    { href: "/register/judging", label: "How it's judged" },
    { href: "/", label: `Back to ${EVENT.name}` },
  ];
  return (
    <section aria-labelledby="next-title" className="mt-[clamp(3.5rem,9vh,6rem)] border-t border-bone/15 pt-[clamp(2rem,5vh,3rem)]">
      <h2 id="next-title" className="label label-loose text-bone/70">
        What happens next
      </h2>
      <ol className="mt-[clamp(1.25rem,3vh,2rem)] grid gap-[clamp(1.5rem,3vw,3rem)] md:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.k} className="arrive-in border-t border-bone/15 pt-4" style={{ animationDelay: `${0.08 * i}s` }}>
            <p className="label flex items-center gap-3 text-bone/45">
              <span className="text-lime">{String(i + 1).padStart(2, "0")}</span> {it.k}
            </p>
            <p className="body-copy mt-3 max-w-[34ch] text-[0.98rem] text-bone/80">{it.v}</p>
          </li>
        ))}
      </ol>
      <ul className="mt-[clamp(2.5rem,6vh,3.5rem)] flex flex-wrap gap-x-8 gap-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="group label inline-flex items-center gap-2 text-bone outline-none">
              <span className="relative">
                {l.label}
                <span aria-hidden="true" className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-100 bg-bone/40 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-x-0" />
                <span aria-hidden="true" className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-lime transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </span>
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Lime diamonds thrown out of the seat that just filled — the marquee's mark, celebrating. */
function burst(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  const bits: HTMLSpanElement[] = [];
  for (let i = 0; i < 14; i++) {
    const b = document.createElement("span");
    b.setAttribute("aria-hidden", "true");
    b.className = "pointer-events-none absolute left-1/2 top-1/2 h-[0.5rem] w-[0.5rem] rotate-45 bg-lime";
    el.appendChild(b);
    bits.push(b);
  }
  gsap.fromTo(
    bits,
    { x: 0, y: 0, scale: 0.4, autoAlpha: 1 },
    {
      x: () => gsap.utils.random(-150, 150),
      y: () => gsap.utils.random(-120, 70),
      rotate: () => gsap.utils.random(-180, 180),
      scale: () => gsap.utils.random(0.6, 1.3),
      autoAlpha: 0,
      duration: () => gsap.utils.random(0.8, 1.3),
      ease: "power3.out",
      onComplete: () => bits.forEach((b) => b.remove()),
    },
  );
}

/** The clipboard, with the old way as a fallback: phones on a plain http address don't get the new one. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let done = false;
    try {
      done = document.execCommand("copy");
    } catch {
      /* nothing left to try */
    }
    area.remove();
    return done;
  }
}
