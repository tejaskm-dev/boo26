"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import GhostIndex from "@/components/ui/GhostIndex";
import RiseIn from "@/components/fx/RiseIn";
import { TEAM, type TeamMember } from "@/lib/site";

export default function ThePeople() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    // Dismiss active card on tap outside
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-polaroid-card]")) {
        setActiveCard(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  return (
    <Section
      id="team"
      field="bone"
      forms={[{ shape: "spillRight", tone: "ink", at: "inset-x-0 top-0 w-full h-[12vh] md:h-[18vh]" }]}
      className="pb-[clamp(5rem,14vh,9rem)] pt-[clamp(7.5rem,22vh,15rem)] md:pt-[clamp(8.5rem,28vh,17rem)]"
    >
      <div className="px-[var(--edge)]">
        <SectionLabel index="05">The People</SectionLabel>
      </div>

      {/* Grand Hollow Number in Background */}
      <GhostIndex className="left-[40%] top-[8%] hidden text-[clamp(10rem,26vw,24rem)] lg:block">
        05
      </GhostIndex>

      {/* Header Spread with Macro Parallax */}
      <div className="relative mt-[clamp(2.5rem,5vh,4rem)] px-[var(--edge)]">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-center">
          {/* Left annotation: scrubs down with scroll */}
          <div data-scrub="down" data-scrub-amount="6" className="hidden lg:block w-[14ch] shrink-0">
            <p className="hand -rotate-[3deg] text-[clamp(1.15rem,1.4vw,1.45rem)] font-bold leading-[1.18] text-ink/60 select-none">
              {"SAME\nPEOPLE.\nBRIGHTER\nIDEAS."}
            </p>
          </div>

          {/* Center Title: Authentic Typography & Floating Crown */}
          <div className="relative flex flex-col items-center select-none text-center">
            {/* Floating Crown above TEAM with RiseIn entrance */}
            <RiseIn
              from="top"
              start="top 88%"
              className="pointer-events-none absolute -top-8 sm:-top-11 right-[14%] sm:right-[19%] z-10 -rotate-12"
            >
              <Sprite name="crown" scale={0.32} drift={14} idle={4} />
            </RiseIn>

            {/* Lime slash marks */}
            <span
              aria-hidden="true"
              className="absolute -top-3 right-[8%] sm:right-[11%] text-lime font-display font-black text-2xl rotate-12 pointer-events-none select-none"
            >
              {"//"}
            </span>

            <h2 className="brush text-[clamp(3.8rem,10.5vw,8.5rem)] leading-[0.82] tracking-tight">
              <span className="block text-ink -rotate-[3deg]">MEET</span>
              <span className="flex items-baseline justify-center gap-[0.16em]">
                <span className="text-ink -rotate-[1.5deg]">THE</span>
                <span className="relative inline-block text-lime rotate-[2deg] [text-shadow:3px_3px_0px_var(--color-ink),-1px_-1px_0px_var(--color-ink),1px_-1px_0px_var(--color-ink),-1px_1px_0px_var(--color-ink),0px_6px_16px_rgba(216,255,40,0.35)]">
                  TEAM
                  {/* Ink drip accent */}
                  <svg
                    viewBox="0 0 32 44"
                    className="absolute -bottom-6 right-2 h-5.5 w-3.5 text-lime fill-current drop-shadow-[0_2px_0px_rgba(8,8,8,1)]"
                    aria-hidden="true"
                  >
                    <path d="M16 0 C13 10 8 20 8 28 C8 35 11 40 16 40 C21 40 24 35 24 28 C24 20 19 10 16 0 Z" />
                  </svg>
                  <svg
                    viewBox="0 0 32 44"
                    className="absolute -bottom-4 left-3 h-4 w-2.5 text-lime fill-current drop-shadow-[0_2px_0px_rgba(8,8,8,1)]"
                    aria-hidden="true"
                  >
                    <path d="M16 0 C13 8 9 16 9 24 C9 30 12 34 16 34 C20 34 23 30 23 24 C23 16 19 8 16 0 Z" />
                  </svg>
                </span>
              </span>
            </h2>
          </div>

          {/* Right Subtitle & Pinned Kraft Note: scrubs up with scroll */}
          <div data-scrub="up" data-scrub-amount="8" className="flex items-center gap-6 lg:w-[22rem] lg:justify-end">
            <div className="hidden md:block max-w-[20ch] text-left">
              <p className="label label-loose text-[clamp(0.66rem,0.72vw,0.78rem)] leading-relaxed text-ink/50">
                THE DREAMERS, BUILDERS, OVERTHINKERS AND CHAOS ENABLERS.
              </p>
              <span className="mt-2.5 block h-[2px] w-9 bg-lime" />
            </div>

            {/* Pinned Kraft Note with Custom PushPin SVG */}
            <div className="hidden lg:block relative rotate-[3.5deg] select-none group hover:rotate-0 transition-transform duration-300">
              {/* Detailed 3D Vector Pushpin */}
              <div className="absolute -top-4.5 -right-2 z-20 pointer-events-none">
                <PushPin className="w-10 h-11" />
              </div>
              <div className="bg-[#ded5c2] border border-[#beaf95] shadow-[0_8px_24px_rgba(8,8,8,0.12)] px-5 py-6 rounded-[2px] w-40 text-center transform rotate-[-1deg]">
                <p className="hand font-bold text-[1.12rem] leading-[1.28] text-ink/85">
                  IDEAS<br />
                  HAPPEN<br />
                  BETTER<br />
                  TOGETHER.<br />
                  <span className="text-base font-normal">:)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile tap hint */}
        <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
          <p className="font-mono text-[0.72rem] tracking-wider uppercase text-ink/55">
            Tap a card to develop &amp; reveal
          </p>
        </div>
      </div>

      {/* Gallery Grid: Cascading Staggered Entrance */}
      <div className="relative mt-[clamp(3rem,6vh,5rem)] px-[var(--edge)]">
        <div
          data-stagger
          className="grid grid-cols-2 gap-x-3.5 gap-y-36 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-40 lg:grid-cols-6 lg:gap-3.5 xl:gap-4.5 pt-28 sm:pt-36 lg:pt-40"
        >
          {TEAM.map((member, i) => (
            <PolaroidCard
              key={member.name}
              member={member}
              index={i}
              isActive={activeCard === i}
              onCardClick={(idx) => setActiveCard((prev) => (prev === idx ? null : idx))}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

/**
 * Detailed 3D Vector Pushpin SVG
 * Realistic steel needle entering paper, paper puncture hole, conical body, lime waist ring, and light reflection.
 */
function PushPin({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Soft shadow cast by the pin on the paper */}
        <filter id="pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#1a1408" floodOpacity="0.38" />
        </filter>
        {/* Metallic needle gradient */}
        <linearGradient id="needle-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
        {/* Pin head body gradient */}
        <radialGradient id="pin-head-body" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#383838" />
          <stop offset="45%" stopColor="#1a1a1a" />
          <stop offset="85%" stopColor="#080808" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        {/* Lime accent ring */}
        <linearGradient id="pin-lime-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eeff55" />
          <stop offset="100%" stopColor="#b4dd00" />
        </linearGradient>
        {/* Specular glare on the bulb */}
        <linearGradient id="pin-glare" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Group with cast shadow */}
      <g filter="url(#pin-shadow)">
        {/* Paper puncture hole */}
        <ellipse cx="27" cy="38" rx="2.5" ry="1.5" fill="#2d2516" opacity="0.6" />

        {/* Steel needle shaft entering paper */}
        <path d="M20 24 L27 37 L28.5 36 L21.5 23 Z" fill="url(#needle-metal)" />

        {/* Pin base collar */}
        <ellipse cx="19" cy="22" rx="6.5" ry="3.8" fill="#181818" stroke="#000000" strokeWidth="0.8" />

        {/* Pin cone body */}
        <path
          d="M13 21.5 C13 21.5 15 14 15 12 L23 12 C23 14 25 21.5 25 21.5 Z"
          fill="url(#pin-head-body)"
          stroke="#000000"
          strokeWidth="0.8"
        />

        {/* Lime accent waist band */}
        <ellipse cx="19" cy="12" rx="5" ry="2.2" fill="url(#pin-lime-ring)" />

        {/* Pin Head Bulb / Cap */}
        <circle cx="19" cy="8.5" r="7" fill="url(#pin-head-body)" stroke="#000000" strokeWidth="0.8" />

        {/* Glossy sphere highlight */}
        <ellipse cx="16.5" cy="6.5" rx="3.5" ry="2" fill="url(#pin-glare)" transform="rotate(-25 16.5 6.5)" />
      </g>
    </svg>
  );
}

/**
 * Hyper-Detailed SVG Polaroid Frame & Card
 * - Authentic photographic cardstock base with multi-stop warm paper gradient.
 * - Microscopic paper flecks texture pattern.
 * - 3D paper cut edge highlights and thickness bevels.
 * - Corner stress creases and paper age lines.
 * - Die-cut photo well with realistic 3D paper bevel:
 *   Top/left cut cast shadow + Bottom/right bright paper-thickness highlight line.
 * - Chemical developer pod roller indentation seam with compression tabs across the chin.
 * - Recessed photo well with diagonal glossy Mylar film glare.
 * - Multi-layer micro-interactions on hover with companion mascots.
 */
function PolaroidCard({
  member,
  index,
  isActive,
  onCardClick,
}: {
  member: TeamMember;
  index: number;
  isActive: boolean;
  onCardClick: (index: number) => void;
}) {
  const uid = `pol-${index}`;

  return (
    <div
      data-polaroid-card
      data-index={index}
      data-active={isActive ? "true" : undefined}
      role="button"
      tabIndex={0}
      aria-label={`${member.name}, ${member.tagline}`}
      aria-expanded={isActive}
      onClick={() => onCardClick(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick(index);
        }
      }}
      className={`group relative z-10 flex flex-col cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-30 hover:-translate-y-3 hover:rotate-0 hover:shadow-[0_24px_50px_rgba(8,8,8,0.18),0_8px_16px_rgba(8,8,8,0.08)] ${
        isActive
          ? "!z-30 !-translate-y-3 !rotate-0 shadow-[0_24px_50px_rgba(8,8,8,0.18),0_8px_16px_rgba(8,8,8,0.08)]"
          : ""
      } ${member.tilt}`}
    >
      {/* 1. Bespoke Mascot Companion Pop-Up — 100% Fully Visible & Sitting on the Top Rim */}
      <div
        className={`polaroid-cat-popup pointer-events-none absolute bottom-[calc(100%-8px)] left-1/2 -translate-x-1/2 z-40 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isActive
            ? "!translate-y-0 !opacity-100 !scale-100"
            : "translate-y-8 opacity-0 scale-75 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100"
        }`}
        aria-hidden="true"
      >
        <div className="relative filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.38)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
          <Sprite name={member.companion} scale={member.companionScale} />
        </div>
      </div>

      {/* 2. Super Detailed SVG Polaroid Frame Container */}
      <div className="relative w-full rounded-[3px] shadow-[0_4px_18px_rgba(8,8,8,0.08),0_1px_3px_rgba(8,8,8,0.04)]">
        {/* Full-bleed SVG Polaroid Paper Architecture */}
        <svg
          viewBox="0 0 250 330"
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Multi-stop warm paper gradient simulating ambient light from top-left */}
            <linearGradient id={`${uid}-paper`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdfcf8" />
              <stop offset="40%" stopColor="#faf6ed" />
              <stop offset="80%" stopColor="#f4ede1" />
              <stop offset="100%" stopColor="#eee6d6" />
            </linearGradient>

            {/* Paper Edge Highlight (Top & Left light bounce) */}
            <linearGradient id={`${uid}-edge-hi`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
            </linearGradient>

            {/* Microscopic Paper Flecks Pattern */}
            <pattern id={`${uid}-flecks`} width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="4" r="0.5" fill="#8c8273" opacity="0.14" />
              <circle cx="12" cy="10" r="0.4" fill="#6d6558" opacity="0.11" />
              <circle cx="8" cy="15" r="0.55" fill="#8c8273" opacity="0.1" />
              <circle cx="16" cy="3" r="0.4" fill="#a39988" opacity="0.16" />
            </pattern>
          </defs>

          {/* Paper Cardstock Base */}
          <rect
            x="1"
            y="1"
            width="248"
            height="328"
            rx="3"
            ry="3"
            fill={`url(#${uid}-paper)`}
            stroke="rgba(8,8,8,0.13)"
            strokeWidth="1"
          />

          {/* Paper Fleck Texture Layer */}
          <rect
            x="1"
            y="1"
            width="248"
            height="328"
            rx="3"
            ry="3"
            fill={`url(#${uid}-flecks)`}
          />

          {/* Outer Paper Edge 3D Bevel: Top & Left light highlight */}
          <path
            d="M 3 2 L 247 2 M 2 3 L 2 327"
            stroke={`url(#${uid}-edge-hi)`}
            strokeWidth="1.2"
          />

          {/* Bottom & Right Edge Shadow Rim */}
          <path
            d="M 2 328 L 248 328 L 248 2"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="1"
          />

          {/* Tactile Corner Stress Creases */}
          <line x1="3" y1="12" x2="12" y2="3" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
          <line x1="4" y1="11" x2="11" y2="4" stroke="rgba(255,255,255,0.75)" strokeWidth="0.6" />
          <line x1="238" y1="327" x2="247" y2="318" stroke="rgba(0,0,0,0.09)" strokeWidth="0.8" />

          {/* Chemical Developer Pod Roller Indentation Seam (Iconic Polaroid Chin Groove) */}
          <line x1="14" y1="247.5" x2="236" y2="247.5" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
          <line x1="14" y1="248.7" x2="236" y2="248.7" stroke="rgba(255,255,255,0.88)" strokeWidth="1" />
          {/* Developer Pod Roller Compression Tab Notches at groove ends */}
          <rect x="13" y="246" width="3" height="4" rx="0.5" fill="rgba(0,0,0,0.1)" />
          <rect x="234" y="246" width="3" height="4" rx="0.5" fill="rgba(0,0,0,0.1)" />

          {/* Die-Cut Photo Window 3D Paper Cut Thickness Bevel:
              Top & Left cast a dark shadow into the photo well;
              Bottom & Right catch light across the cut paper cross-section. */}
          <path
            d="M 13 239 L 13 13 L 237 13"
            stroke="rgba(0,0,0,0.32)"
            strokeWidth="1.8"
            strokeLinecap="square"
          />
          <path
            d="M 13 239 L 237 239 L 237 13"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="1.4"
            strokeLinecap="square"
          />
        </svg>

        {/* 3. Card Content (Registered precisely to match the SVG cutouts) */}
        <div className="relative z-10 flex flex-col p-2.5 pb-3.5 sm:p-3 sm:pb-4">
          {/* Authentic Doodles & Washi Tape per card */}
          {index === 0 && (
            <>
              {/* Detailed SVG Lime Washi Tape */}
              <svg
                viewBox="0 0 68 24"
                className="pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 w-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="tape-grad-0" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c8f800" stopOpacity="0.88" />
                    <stop offset="50%" stopColor="#d8ff28" stopOpacity="0.94" />
                    <stop offset="100%" stopColor="#b4ee00" stopOpacity="0.88" />
                  </linearGradient>
                </defs>
                <polygon
                  points="2,2 66,3 67,21 64,22 65,20 62,22 4,21 2,22 3,20 1,21"
                  fill="url(#tape-grad-0)"
                />
                <line x1="12" y1="5" x2="14" y2="19" stroke="#99cc00" strokeWidth="0.8" opacity="0.6" />
                <line x1="34" y1="4" x2="33" y2="20" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
                <line x1="52" y1="5" x2="54" y2="18" stroke="#99cc00" strokeWidth="0.8" opacity="0.6" />
              </svg>
              {/* Hand-drawn star doodle on left */}
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute -left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 z-30 text-lime fill-none stroke-ink stroke-[1.8] -rotate-12 drop-shadow-xs">
                <path d="M12 2l2.6 6.8L22 9.5l-5.3 4.5 1.6 7.2L12 17.5l-6.3 3.7 1.6-7.2L2 9.5l7.4-.7L12 2z"/>
              </svg>
            </>
          )}

          {index === 1 && (
            /* Nandana: Three sketch tick marks /// on upper right */
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute -right-2 top-3 w-5 h-5 z-30 text-ink/75 stroke-current stroke-2 stroke-linecap-round">
              <line x1="3" y1="20" x2="9" y2="4" />
              <line x1="9" y1="20" x2="15" y2="4" />
              <line x1="15" y1="20" x2="21" y2="4" />
            </svg>
          )}

          {index === 2 && (
            <>
              {/* Rithvik: Two sketch tick marks // on upper right */}
              <svg viewBox="0 0 20 20" className="pointer-events-none absolute -right-2 top-2.5 w-4 h-4 z-30 text-ink/75 stroke-current stroke-2 stroke-linecap-round">
                <line x1="4" y1="17" x2="11" y2="3" />
                <line x1="11" y1="17" x2="18" y2="3" />
              </svg>
              {/* Lime marker highlighter stroke along right edge */}
              <svg viewBox="0 0 16 60" className="pointer-events-none absolute -right-1.5 top-9 w-3 h-14 z-30 text-lime stroke-current stroke-3 stroke-linecap-round opacity-85">
                <path d="M4 2 Q10 30 5 58" fill="none" />
              </svg>
            </>
          )}

          {index === 3 && (
            /* Meera: Solid ink star doodle ★ on upper right */
            <svg viewBox="0 0 20 20" className="pointer-events-none absolute -right-2.5 top-7 w-4 h-4 z-30 fill-ink">
              <path d="M10 1l2.4 5.6 6.1.5-4.6 3.9 1.4 6-5.3-3.2-5.3 3.2 1.4-6-4.6-3.9 6.1-.5L10 1z"/>
            </svg>
          )}

          {index === 4 && (
            <>
              {/* Fahad: Two sketch tick marks // on upper right */}
              <svg viewBox="0 0 20 20" className="pointer-events-none absolute -right-2 top-4 w-4 h-4 z-30 text-ink/75 stroke-current stroke-2 stroke-linecap-round">
                <line x1="3" y1="16" x2="10" y2="4" />
                <line x1="9" y1="16" x2="16" y2="4" />
              </svg>
              {/* Lime artistic smudge on left margin */}
              <svg viewBox="0 0 16 50" className="pointer-events-none absolute -left-2 top-12 w-3.5 h-12 z-30 text-lime stroke-current stroke-4 stroke-linecap-round opacity-75">
                <path d="M8 2 C4 18 12 32 6 48" fill="none" />
              </svg>
            </>
          )}

          {index === 5 && (
            <>
              {/* Sreelakshmi: Diagonal lime washi tape across top-right corner */}
              <svg
                viewBox="0 0 54 28"
                className="pointer-events-none absolute -top-3 -right-2.5 z-30 w-14 rotate-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="tape-grad-5" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c8f800" stopOpacity="0.88" />
                    <stop offset="50%" stopColor="#d8ff28" stopOpacity="0.94" />
                    <stop offset="100%" stopColor="#b4ee00" stopOpacity="0.88" />
                  </linearGradient>
                </defs>
                <polygon
                  points="2,4 52,2 51,24 48,26 49,23 3,25 1,23"
                  fill="url(#tape-grad-5)"
                />
                <line x1="14" y1="5" x2="15" y2="23" stroke="#99cc00" strokeWidth="0.8" opacity="0.6" />
                <line x1="38" y1="4" x2="37" y2="24" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
              </svg>
              {/* Hand-drawn outline heart on right margin */}
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute -right-2.5 top-8 w-5 h-5 z-30 text-ink stroke-current stroke-2 fill-none -rotate-12">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {/* Handwritten callout on bottom right */}
              <span className="pointer-events-none absolute -right-22 -bottom-2 hidden 2xl:block font-hand font-bold text-[0.82rem] text-ink/70 rotate-6 leading-tight w-20">
                MAKES THINGS HAPPEN.
              </span>
            </>
          )}

          {/* The Recessed Photo Window with Emulsion Rim & Diagonal Gloss Sheen */}
          <div className="relative aspect-square w-full overflow-hidden rounded-[1px] bg-ink/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.28)] ring-1 ring-black/[0.15]">
            {/* 1. Base Monochrome Print (Classic vintage B&W Polaroid) */}
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
              style={{ objectPosition: member.imagePosition || "center" }}
              className={`object-cover grayscale contrast-[1.12] brightness-[0.95] transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
                isActive ? "!scale-[1.04]" : ""
              }`}
            />

            {/* 2. Developing Full-Color Print — Liquid Chemical Emulsion Arc Expansion */}
            <div className="polaroid-color-reveal absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
              <Image
                src={member.image}
                alt=""
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
                style={{ objectPosition: member.imagePosition || "center" }}
                className={`object-cover contrast-[1.06] brightness-[1.02] saturate-[1.14] transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
                  isActive ? "!scale-[1.04]" : ""
                }`}
              />
              {/* Chemical reaction warm bloom at the developing wavefront */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-lime/20 via-transparent to-transparent transition-opacity duration-300 ${
                  isActive ? "!opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              />
            </div>

            {/* 3. Photochemical Laser Sweep Glint across the photo surface */}
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
              <div
                className="polaroid-glint h-full w-[90px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(216,255,40,0.35) 35%, rgba(255,255,255,0.85) 50%, rgba(216,255,40,0.35) 65%, transparent 100%)",
                }}
              />
            </div>

            {/* 4. Diagonal Glossy Mylar Film Reflection */}
            <div
              className={`pointer-events-none absolute inset-0 z-25 transition-opacity duration-500 [background:linear-gradient(135deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.1)_28%,transparent_55%)] ${
                isActive ? "!opacity-65" : "opacity-30 group-hover:opacity-65"
              }`}
              aria-hidden="true"
            />
          </div>

          {/* Name & Tagline (Positioned on the chin below the developer pod seam) */}
          <div className="mt-3.5 sm:mt-4 flex flex-col">
            <h3
              className={`font-display text-[clamp(0.88rem,0.98vw,1.05rem)] font-black tracking-tight leading-tight transition-colors ${
                isActive ? "!text-black" : "text-ink group-hover:text-black"
              }`}
            >
              {member.name}
            </h3>
            <p
              className={`font-hand mt-0.5 text-[0.82rem] sm:text-[0.88rem] font-bold leading-tight transition-colors ${
                isActive ? "!text-ink" : "text-ink/70 group-hover:text-ink"
              }`}
            >
              &ldquo;{member.tagline}&rdquo;
            </p>
          </div>

          {/* Social Links & Card Index */}
          <div className="mt-2.5 flex items-center justify-between border-t border-ink/[0.08] pt-2 text-ink/40">
            <div className="flex items-center gap-2">
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on LinkedIn`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 -m-1 text-ink/40 hover:text-ink hover:bg-lime/40 rounded-xs transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 0 0-1.64 1.64 1.64 1.64 0 0 0 1.64 1.64 1.64 1.64 0 0 0 1.64-1.64c0-.9-.74-1.64-1.64-1.64Z" />
                  </svg>
                </a>
              )}
              {member.email && (
                <a
                  href={member.email}
                  aria-label={`Email ${member.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 -m-1 text-ink/40 hover:text-ink hover:bg-lime/40 rounded-xs transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </a>
              )}
            </div>

            {/* Subtle Index / Moniker Pill with Lime Highlight */}
            <span
              className={`font-mono text-[0.68rem] tracking-wider px-1.5 py-0.5 rounded-xs transition-all duration-200 ml-1 ${
                isActive ? "!text-ink !bg-lime/30" : "text-ink/40 group-hover:text-ink group-hover:bg-lime/30"
              }`}
            >
              0{index + 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
