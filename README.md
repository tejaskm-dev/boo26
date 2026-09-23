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

Teams are still kept in the server's memory (`src/lib/register/store.ts`):
they go when it restarts, and a deploy running more than one instance can
lose them between requests. Swapping those three functions for a database is
what makes registration real; `TEAMS_ARE_TEMPORARY` in
`src/lib/register/mode.ts` turns the "trying it out" notes off in the same
change.

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
