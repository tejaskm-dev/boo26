/** The hero's narrowed eyes, in their 134x68 box. */
export const EYES = [
  "M7 5 57 47C45 63 19 61 9 47 2 38 4 15 7 5Z",
  "M127 27 77 63C87 79 113 77 123 63 130 54 129 37 127 27Z",
];

/**
 * Where things are on the sleeper, as percentages of its square (it's drawn
 * in a 1000 box, shrunk to 0.9 and set down 110 so the ears clear the top of
 * a wide screen). The overlays above the dark use these to line up with it.
 */
const at = (x: number, y: number) => [(50 + 0.9 * x) / 10, (110 + 0.9 * y) / 10] as const;
/** the open eyes: the hero's pair at 1.9x, over the closed ones */
export const OPEN_EYES = { left: at(373, 452)[0], top: at(373, 452)[1], width: (134 * 1.9 * 0.9) / 10 };
/** the middle of its face, and how far from it the torch counts as "in its face" */
export const FACE = { x: at(500, 540)[0], y: at(500, 540)[1], r: 17 };
/** where its breath comes out, just off the right ear */
export const ZZZ = { x: at(690, 250)[0], y: at(690, 250)[1] };

/**
 * The thing in the dark: one enormous black cat, asleep, filling the room —
 * drawn the way the site draws its cats, ink with a lime rim, against a
 * cream wall papered in the hero's eyes. Static on purpose: it's drawn once
 * and only ever moved whole (breathing is a scale on its square), so the
 * torch passing over it costs nothing. The ears and whiskers can twitch;
 * that's the only part that ever repaints, and only for half a second.
 */
export default function Sleeper() {
  return (
    <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id="soon-wall" width="80" height="80" patternUnits="userSpaceOnUse">
          <g transform="translate(18 30) scale(0.3)" opacity="0.08">
            {EYES.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </pattern>
        <filter id="soon-sleeper-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <radialGradient id="soon-sleeper-sheen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <g id="soon-sleeper-body">
          <ellipse cx="500" cy="1010" rx="640" ry="330" />
          <ellipse cx="500" cy="530" rx="272" ry="214" />
          <ellipse cx="500" cy="610" rx="300" ry="132" />
          <ellipse cx="398" cy="770" rx="104" ry="58" />
          <ellipse cx="602" cy="770" rx="104" ry="58" />
        </g>
      </defs>

      <rect x="-500" y="-500" width="2000" height="2000" fill="var(--color-bone)" />
      <rect x="-500" y="-500" width="2000" height="2000" fill="url(#soon-wall)" />

      <g transform="translate(50 110) scale(0.9)">
        <ellipse cx="500" cy="590" rx="330" ry="250" fill="#080808" opacity="0.18" filter="url(#soon-sleeper-soft)" />

        {/* the ears, each its own piece so it can twitch */}
        {(
          [
            ["soon-ear-l", "292,440 334,196 476,334", "320,404 344,262 430,340"],
            ["soon-ear-r", "524,334 666,196 708,440", "570,340 656,262 680,404"],
          ] as const
        ).map(([cls, outer, inner]) => (
          <g key={cls} className={`soon-ear ${cls}`}>
            <polygon points={outer} fill="var(--color-lime)" stroke="var(--color-lime)" strokeWidth={30} strokeLinejoin="round" transform="translate(-10 8)" />
            <polygon points={outer} fill="#070707" stroke="#070707" strokeWidth={30} strokeLinejoin="round" />
            <polygon points={inner} fill="#1c1c1b" stroke="#1c1c1b" strokeWidth={16} strokeLinejoin="round" />
          </g>
        ))}

        {/* the rest of it, lime-rimmed like every field on the site */}
        <use href="#soon-sleeper-body" fill="var(--color-lime)" stroke="var(--color-lime)" strokeWidth={30} transform="translate(-10 8)" />
        <use href="#soon-sleeper-body" fill="#070707" stroke="#070707" strokeWidth={30} />
        <ellipse cx="480" cy="410" rx="170" ry="90" fill="url(#soon-sleeper-sheen)" />

        <g fill="none" stroke="var(--color-bone)" strokeLinecap="round">
          {/* fast asleep */}
          <g className="soon-sleeper-shut" opacity={0.85}>
            <path d="M404 528Q440 556 476 528" strokeWidth={8} />
            <path d="M524 528Q560 556 596 528" strokeWidth={8} />
          </g>
          <path d="M500 598Q488 616 472 607M500 598Q512 616 528 607" strokeWidth={5} opacity={0.85} />
          <g className="soon-whiskers" opacity={0.5}>
            <path d="M396 596L250 578M394 610L240 622M398 624L262 664" strokeWidth={2.5} />
            <path d="M604 596L750 578M606 610L760 622M602 624L738 664" strokeWidth={2.5} />
          </g>
          <path d="M372 744L372 790M398 742L398 796M424 744L424 790M576 744L576 790M602 742L602 796M628 744L628 790" strokeWidth={3} opacity={0.3} />
        </g>
        <polygon points="487,582 513,582 500,598" fill="var(--color-bone)" opacity={0.85} />
      </g>
    </svg>
  );
}
