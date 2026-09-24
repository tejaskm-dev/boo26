/**
 * When the database won't answer. An event manager on the night needs to know
 * which of the two it is — the site is broken, or the database is — and what
 * to do about it, rather than a blank server error. Only admins ever see
 * this, so it can say plainly what went wrong.
 */
export default function Trouble({ message }: { message: string }) {
  return (
    <main className="grid min-h-svh place-items-center px-[clamp(1rem,4vw,2rem)] py-16">
      <div className="card w-full max-w-[36rem] px-7 py-8">
        <p className="eyebrow">BOO! 2026</p>
        <h1 className="figure mt-3 text-[clamp(1.7rem,4vw,2.3rem)]">
          The database didn&rsquo;t answer
        </h1>
        <p className="muted mt-3 text-[0.92rem] leading-[1.6]">
          Registrations are still safe where they are — this page just
          couldn&rsquo;t read them. Nobody signing up is affected unless the
          sign-up says otherwise too.
        </p>

        <p className="mt-5 rounded-[2px] border border-[#e4cc93] bg-[#fbf3e0] px-4 py-3 text-[0.86rem] leading-[1.5] break-words text-[#7a5200]">
          <code>{message}</code>
        </p>

        <ul className="mt-6 space-y-2">
          {[
            "A table it asked for may not exist yet: run db/schema.sql in the SQL editor. It's safe to run again.",
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY may be wrong or expired — check them where the site is deployed.",
            "If the project is paused, Supabase wakes it from the dashboard.",
          ].map((line) => (
            <li key={line} className="muted flex gap-3 text-[0.88rem] leading-[1.6]">
              <span aria-hidden="true" className="mt-[0.5em] h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-[var(--accent-deep)]" />
              {line}
            </li>
          ))}
        </ul>

        <p className="mt-8 flex gap-6">
          <a href="/admin" className="btn btn-go">
            Try again
          </a>
          <form action="/admin/signout" method="post">
            <button type="submit" className="btn btn-plain">
              Sign out
            </button>
          </form>
        </p>
      </div>
    </main>
  );
}
