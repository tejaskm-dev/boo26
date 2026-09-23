import { encode, QrCodeDataType } from "uqr";
import { GHOST_BODY } from "@/components/ui/Glyphs";

/**
 * A QR code in the site's own ink: modules on bone, the three finder squares
 * drawn soft-cornered, and the ghost sitting in a gap in the middle.
 *
 * Error correction is set high enough (Q, raised to H whenever it fits in the
 * same size) that the gap costs nothing — and the gap is only cut where it
 * covers plain data. On longer addresses the centre holds an alignment mark,
 * and a scanner needs that more than the page needs a ghost.
 */
export default function Qr({ text, label, className = "" }: { text: string; label: string; className?: string }) {
  const qr = encode(text, { ecc: "Q", boostEcc: true, border: 0 });
  const n = qr.size;

  const hole = Math.max(5, Math.round(n * 0.2)) | 1;
  const from = (n - hole) / 2;
  const to = from + hole;
  const inHole = (x: number, y: number) => x >= from && x < to && y >= from && y < to;
  let ghost = true;
  for (let y = from; y < to && ghost; y++) {
    for (let x = from; x < to; x++) {
      if (qr.types[y][x] !== QrCodeDataType.Data) {
        ghost = false;
        break;
      }
    }
  }

  // the three finder squares are drawn separately, whole
  const finder = (x: number, y: number) => x < 7 && y < 7;
  const inFinder = (x: number, y: number) => finder(x, y) || finder(n - 1 - x, y) || finder(x, n - 1 - y);

  // each row's dark modules as runs, one rectangle per run
  let d = "";
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      if (!qr.data[y][x] || inFinder(x, y) || (ghost && inHole(x, y))) {
        x++;
        continue;
      }
      const start = x;
      while (x < n && qr.data[y][x] && !inFinder(x, y) && !(ghost && inHole(x, y))) x++;
      d += `M${start} ${y}h${x - start}v1h${start - x}z`;
    }
  }

  const quiet = 3;
  const eyes: [number, number][] = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ];

  return (
    <svg
      viewBox={`${-quiet} ${-quiet} ${n + quiet * 2} ${n + quiet * 2}`}
      role="img"
      aria-label={label}
      className={className}
    >
      <rect x={-quiet} y={-quiet} width={n + quiet * 2} height={n + quiet * 2} rx={2.4} fill="var(--color-bone)" />
      <path d={d} fill="var(--color-ink)" />
      {eyes.map(([x, y]) => (
        <g key={`${x}-${y}`} fill="var(--color-ink)">
          <path
            fillRule="evenodd"
            d={`M${x + 2} ${y}h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Z`}
          />
          <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.9} />
        </g>
      ))}
      {ghost ? (
        <svg x={from + 0.6} y={from + 0.7} width={hole - 1.2} height={hole - 1.4} viewBox="0 0 64 60">
          <path d={GHOST_BODY} fill="var(--color-ink)" />
          <ellipse cx="24" cy="26" rx="4" ry="5.4" fill="var(--color-bone)" />
          <ellipse cx="40" cy="26" rx="4" ry="5.4" fill="var(--color-bone)" />
        </svg>
      ) : null}
    </svg>
  );
}
