/**
 * The colour fields.
 *
 * The two tones never meet on a straight line. One field arrives in the next
 * as a contour with a mind of its own — plunging deep down one side, barely
 * dipping on the other, taking one hard bite out of an otherwise quiet edge.
 *
 * Every join form spans the full width of the boundary. That is not optional:
 * a form covering 60% of the edge leaves the section's own square top showing
 * across the other 40%, which reads as a straight rule with a blob stuck to
 * it. The asymmetry lives in the path, never in the width.
 *
 * A join form paints the PREVIOUS section's colour down into this one, so its
 * `tone` must be the field above it. Where two sections share a field there is
 * nothing to paint and the form is left off entirely — giving one the other
 * tone stamps its own straight top edge across the page, which is the exact
 * rectangle these shapes exist to avoid.
 *
 * Each contour is drawn once, by hand, with lobes at uneven widths and depths
 * that tighten at one end and open at the other, because an edge built from an
 * even period reads as a formula however soft the curve. Each `view` is
 * authored at the proportion it is used at, so nothing is squashed flat.
 */
export type FormName = keyof typeof FORM;

const JOIN = "none" as const;

export const FORM = {
  /** plunges down the left, lifting away to almost nothing on the right */
  spillLeft: {
    view: "0 0 1000 300",
    fit: JOIN,
    d: "M0 0H1000V52C946 46 928 74 880 70C832 66 820 40 762 48C704 56 700 92 628 96C556 100 540 60 462 72C384 84 388 140 308 158C228 176 168 138 108 168C68 188 34 226 0 262Z",
    lip: "M1000 52C946 46 928 74 880 70C832 66 820 40 762 48C704 56 700 92 628 96C556 100 540 60 462 72C384 84 388 140 308 158C228 176 168 138 108 168C68 188 34 226 0 262",
  },

  /** the same idea from the other side, drawn again rather than mirrored */
  spillRight: {
    view: "0 0 1000 300",
    fit: JOIN,
    d: "M0 0H1000V244C958 214 906 192 846 176C786 160 726 176 668 152C610 128 602 86 534 78C466 70 442 106 372 102C302 98 288 62 222 66C156 70 132 92 76 86C48 83 24 74 0 68Z",
    lip: "M1000 244C958 214 906 192 846 176C786 160 726 176 668 152C610 128 602 86 534 78C466 70 442 106 372 102C302 98 288 62 222 66C156 70 132 92 76 86C48 83 24 74 0 68",
  },

  /** hangs lowest through the middle and lifts at both ends, unevenly */
  swellMid: {
    view: "0 0 1000 260",
    fit: JOIN,
    d: "M0 0H1000V64C938 58 900 84 846 80C792 76 768 44 700 56C632 68 612 144 528 160C444 176 396 132 328 118C260 104 232 62 168 58C104 54 56 74 0 70Z",
    lip: "M1000 64C938 58 900 84 846 80C792 76 768 44 700 56C632 68 612 144 528 160C444 176 396 132 328 118C260 104 232 62 168 58C104 54 56 74 0 70",
  },

  /** the quiet one, for a join that should barely announce itself */
  shelf: {
    view: "0 0 1000 112",
    fit: JOIN,
    d: "M0 0H1000V50C964 46 952 82 916 78C880 74 872 36 806 44C740 52 736 100 638 94C540 88 546 38 428 48C310 58 322 98 214 90C106 82 72 44 0 60Z",
    lip: "M0 60C72 44 106 82 214 90C322 98 310 58 428 48C546 38 540 88 638 94C736 100 740 52 806 44C872 36 880 74 916 78C952 82 964 46 1000 50",
  },

  /** one deep bite out of an otherwise level edge */
  notch: {
    view: "0 0 1000 220",
    fit: JOIN,
    d: "M0 0H1000V72C938 66 908 84 852 80C796 76 778 52 726 58C674 64 660 158 570 166C480 174 436 92 362 96C288 100 282 130 226 128C170 126 74 88 0 96Z",
    lip: "M0 96C74 88 170 126 226 128C282 130 288 100 362 96C436 92 480 174 570 166C660 158 674 64 726 58C778 52 796 76 852 80C908 84 938 66 1000 72",
  },

  /**
   * The side forms. These hold a whole flank of the screen rather than a join,
   * so they run the full height and are the one place a form is allowed to
   * stop short of an edge.
   */
  /* Closes its own bottom well inside the section. Running a side form to the
     section's bottom edge means the section box cuts it off flat, which is a
     rectangle by another route. */
  coveLeft: {
    view: "0 0 900 1000",
    fit: JOIN,
    d: "M0 0H520C548 92 498 156 546 236C594 316 760 330 796 442C832 554 686 606 672 704C658 802 736 846 690 884C644 922 520 906 424 918C352 927 286 904 208 916C132 928 62 902 0 908Z",
    lip: "M520 0C548 92 498 156 546 236C594 316 760 330 796 442C832 554 686 606 672 704C658 802 736 846 690 884C644 922 520 906 424 918C352 927 286 904 208 916C132 928 62 902 0 908",
  },

  coveRight: {
    view: "0 0 740 1000",
    fit: JOIN,
    d: "M740 0H352C316 74 368 152 316 216C264 280 116 274 82 362C48 450 178 518 174 600C170 682 12 720 34 796C56 872 186 884 240 926C282 958 340 970 740 984Z",
    lip: "M352 0C316 74 368 152 316 216C264 280 116 274 82 362C48 450 178 518 174 600C170 682 12 720 34 796C56 872 186 884 240 926",
  },
} as const;

/**
 * One field form, painted over whatever section it is dropped into.
 *
 * Position and size come from `className` so each section art-directs its own
 * composition — but a join form is always given the full width.
 */
export default function FieldForm({
  shape,
  tone,
  className = "",
  hairline = true,
}: {
  shape: FormName;
  /** the colour the form is painted in — the field it is arriving from */
  tone: "ink" | "bone";
  className?: string;
  hairline?: boolean;
}) {
  const form = FORM[shape];
  return (
    /*
     * The box is a span, not the svg itself. An <svg> carrying a viewBox has an
     * intrinsic aspect ratio, so giving it only a height makes it take its
     * intrinsic width and quietly ignore `inset-x-0` — which left every join
     * form a few hundred pixels wide with the section's own square edge showing
     * across the rest. Sizing the wrapper and filling it removes the question.
     */
    <span aria-hidden="true" className={`pointer-events-none absolute block ${className}`}>
      <svg
        viewBox={form.view}
        preserveAspectRatio={form.fit}
        className="h-full w-full"
      >
        <path d={form.d} fill={tone === "ink" ? "var(--color-ink)" : "var(--color-bone)"} />
        {hairline ? (
          <path
            d={form.lip}
            fill="none"
            stroke="var(--color-lime)"
            strokeWidth={1.6}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.5}
          />
        ) : null}
      </svg>
    </span>
  );
}
