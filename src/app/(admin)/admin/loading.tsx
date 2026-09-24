/**
 * What's on screen while the server is fetching. Without it a click on a team
 * or a filter looks like nothing happened until the whole page arrives.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[86rem] px-[clamp(1rem,3vw,2rem)] py-10">
      <p className="eyebrow">Loading…</p>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-24 animate-pulse bg-[var(--sunk)]" />
        ))}
      </div>
      <div className="card mt-6 h-72 animate-pulse bg-[var(--sunk)]" />
    </div>
  );
}
