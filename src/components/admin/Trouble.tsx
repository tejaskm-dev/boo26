/**
 * When the database won't answer. An event manager on the night needs to know
 * which of the two it is — the site is broken, or the database is — and what
 * to do about it, rather than a blank server error. Only admins ever see
 * this, so it can say plainly what went wrong.
 */
export default function Trouble({ message }: { message: string }) {
  return (
    <main className="grid min-h-svh place-items-center px-[var(--edge)] py-16">
      <div className="w-full max-w-[36rem]">
        <p className="label label-loose text-bone/45">BOO! 2026</p>
        <h1 className="display mt-4 text-[clamp(1.8rem,4vw,2.6rem)] leading-[0.95]">
          The database didn&rsquo;t answer
        </h1>
        <p className="body-copy mt-4 text-[0.98rem] text-bone/65">
          Registrations are still safe where they are — this page just
          couldn&rsquo;t read them. Nobody signing up is affected unless the
          sign-up says otherwise too.
        </p>

        <p className="body-copy mt-6 border-l-2 border-lime pl-4 text-[0.92rem] break-words text-bone/75">
          <code>{message}</code>
        </p>

        <ul className="mt-6 space-y-2">
          {[
            "A table it asked for may not exist yet: run db/schema.sql in the SQL editor. It's safe to run again.",
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY may be wrong or expired — check them where the site is deployed.",
            "If the project is paused, Supabase wakes it from the dashboard.",
          ].map((line) => (
            <li key={line} className="body-copy flex gap-3 text-[0.92rem] leading-[1.7] text-bone/60">
              <span aria-hidden="true" className="mt-[0.5em] h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime/70" />
              {line}
            </li>
          ))}
        </ul>

        <p className="mt-8 flex gap-6">
          <a href="/admin" className="label text-lime underline decoration-lime/40 underline-offset-4 hover:decoration-lime">
            Try again
          </a>
          <form action="/admin/signout" method="post">
            <button type="submit" className="label cursor-pointer text-bone/50 underline decoration-bone/25 underline-offset-4 hover:text-lime">
              Sign out
            </button>
          </form>
        </p>
      </div>
    </main>
  );
}
