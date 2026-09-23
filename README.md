# boo26

Boo 2026 Event Website bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Registration

`/register` and everything under it is either the sign-up or the coming-soon
page, decided by one environment variable (see `.env.example`):

```bash
BOO_REGISTRATION_OPEN=true    # the sign-up: the fork, the rules, the judging
BOO_REGISTRATION_OPEN=false   # the coming-soon page on every /register path
```

Unset means open. Set it in `.env.local` here, or in the host's environment
variables for a deploy. It's read where the pages are built, so changing it
needs a new build — on Vercel, a redeploy.

### Where teams are kept

Registrations live in Supabase. Set up once:

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → paste [`db/schema.sql`](db/schema.sql) → Run. It makes the two
   tables, the rules that keep them honest (one team per name, one person per
   email/number/ID, two seats a team), and a `registrations` view with
   everyone in one place for the night.
3. Project Settings → API: copy the project URL and the `service_role` key
   into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — in `.env.local` here,
   and in the host's environment variables for a deploy.

The `service_role` key goes past row level security, so it belongs on the
server only: never `NEXT_PUBLIC_`, never in the repo.

With those unset the site keeps teams in its own memory instead. The whole
flow still runs on one machine, but a deploy runs several and a team made on
one request is a stranger to the next — so the pages say teams aren't kept
for good yet, until the database answers.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
