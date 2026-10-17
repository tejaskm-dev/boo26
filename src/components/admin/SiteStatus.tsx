/**
 * What the public site is right now, in a line each, with the way to see the
 * full site before it goes up. Both switches are environment variables read
 * when the site is built (LIVE_STATUS, REGISTER_URL), so the dashboard can
 * say what they are but not change them: that's the host's settings and a
 * redeploy.
 */
export default function SiteStatus({ live, register }: { live: boolean; register: string | null }) {
  const where = register ? new URL(register) : null;
  return (
    <section className="card mt-5 flex flex-wrap items-center gap-x-8 gap-y-4 px-5 py-4">
      <dl className="grid flex-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        <div>
          <dt className="eyebrow">Visitors see</dt>
          <dd className="mt-1.5 text-[0.92rem]">
            {live ? (
              <>The full site</>
            ) : (
              <>
                The teaser <span className="faint">— the full site waits for LIVE_STATUS=true and a redeploy</span>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Register buttons</dt>
          <dd className="mt-1.5 text-[0.92rem]">
            {where ? (
              <a href={register!} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2">
                {where.host}
                {where.pathname === "/" ? "" : where.pathname}
              </a>
            ) : (
              <>
                Not set <span className="faint">— &ldquo;isn&rsquo;t open yet&rdquo; until REGISTER_URL is set</span>
              </>
            )}
          </dd>
        </div>
      </dl>
      <a href="/admin/preview" target="_blank" rel="noopener" className="btn btn-go text-[0.84rem]">
        Preview the full site ↗
      </a>
    </section>
  );
}
