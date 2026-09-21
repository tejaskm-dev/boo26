import { Fragment } from "react";

/**
 * µLearn's µ, kept lowercase inside uppercase type.
 *
 * `text-transform: uppercase` maps µ to the Greek capital Mu, which is drawn
 * exactly like a Latin M — so "µLearn" set in any of this site's labels would
 * read "MLEARN". The glyph gets its own span with the transform switched off.
 */
export default function Micro({ children }: { children: string }) {
  return (
    <>
      {children.split("µ").map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? <span className="normal-case">µ</span> : null}
          {part}
        </Fragment>
      ))}
    </>
  );
}
