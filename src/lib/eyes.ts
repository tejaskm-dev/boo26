/**
 * Eye geometry measured off the supplied artwork (see scripts/measure-eyes.py).
 * Coordinates are in each asset's *trimmed* pixel space, which is also the
 * viewBox of the overlay SVG, so the pupils stay locked to the art at any size.
 *
 * `patch` covers the pupil painted into the artwork with the flat lime the eye
 * is already filled with; `pupil` is the one that actually moves; `eye` is the
 * painted eye itself, which the lid closes over.
 */
export type EyeSpec = {
  /** the painted lime eye — the lid is clipped to this, so it never lands on fur */
  eye: { cx: number; cy: number; rx: number; ry: number; deg: number };
  patch: { cx: number; cy: number; rx: number; ry: number };
  pupil: { cx: number; cy: number; rx: number; ry: number };
  glint: { cx: number; cy: number; r: number };
};

export type CatEyeArt = {
  /** trimmed asset size — used as the overlay viewBox */
  box: { w: number; h: number };
  /** how far a pupil may travel from rest, in viewBox units */
  travel: number;
  /**
   * The head is painted at an angle, so the lids have to close along that same
   * line or the blink reads as a shutter rather than an eyelid. Derived from
   * the line through both eye centres.
   */
  tilt: number;
  eyes: [EyeSpec, EyeSpec];
};

export const LOCKUP_EYES: CatEyeArt = {
  box: { w: 1350, h: 909 },
  travel: 9,
  tilt: 24.5,
  eyes: [
    {
      eye: { cx: 721.6, cy: 285.8, rx: 56.4, ry: 49.8, deg: -4.1 },
      patch: { cx: 725, cy: 305, rx: 37, ry: 38 },
      pupil: { cx: 727, cy: 310, rx: 26, ry: 30 },
      glint: { cx: 738, cy: 298, r: 5 },
    },
    {
      eye: { cx: 873.1, cy: 354.9, rx: 63.7, ry: 54, deg: 5.8 },
      patch: { cx: 844, cy: 369, rx: 36, ry: 40 },
      pupil: { cx: 842, cy: 373, rx: 24, ry: 33 },
      glint: { cx: 851, cy: 361, r: 4.5 },
    },
  ],
};

export const CAT_EYES: CatEyeArt = {
  box: { w: 1327, h: 871 },
  travel: 16,
  tilt: 17.5,
  eyes: [
    {
      eye: { cx: 608.6, cy: 593.4, rx: 101.3, ry: 85.7, deg: -12.4 },
      patch: { cx: 618, cy: 626, rx: 62, ry: 62 },
      pupil: { cx: 621, cy: 636, rx: 46, ry: 52 },
      glint: { cx: 640, cy: 616, r: 9 },
    },
    {
      eye: { cx: 898.6, cy: 684.6, rx: 110.5, ry: 93.5, deg: -6.6 },
      patch: { cx: 844, cy: 705, rx: 58, ry: 66 },
      pupil: { cx: 844, cy: 714, rx: 42, ry: 58 },
      glint: { cx: 860, cy: 694, r: 8 },
    },
  ],
};
