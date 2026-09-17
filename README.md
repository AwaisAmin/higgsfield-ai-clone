# Higgsfield — study rebuild

A rebuild of [higgsfield.ai](https://higgsfield.ai) as a 24-hour assignment.
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Clerk · Neon +
Prisma · fal.ai.

**Not affiliated with, endorsed by, or connected to Higgsfield, Inc.** Design
tokens, nav structure, logo mark and promotional media are the real company's
and are used here for a portfolio study only.

---

## ⚠️ Video generation is simulated

**Image generation is real.** A prompt goes to fal.ai (`fal-ai/flux/schnell`),
and the image that comes back is genuinely generated from it.

**Video generation is not.** Real video models cost dollars and minutes per
clip, which is not sensible for a one-day build. So the *provider* is stubbed
and nothing else is:

- the same `Generation` row, the same `QUEUED → RUNNING → SUCCEEDED` states
- the same polling endpoint and the same client-side backoff
- the same credit debit, and the same refund if it fails
- a realistic 6–10 second run

What it does **not** do is render your prompt. It resolves to a pre-rendered
clip from Higgsfield's CDN, chosen deterministically from the prompt and preset.
**Submit a video prompt and the clip you get back will not match what you
asked for.** That is expected, and it is said in the UI too — there is a notice
next to the video model picker.

Video costs 12 credits, images 4, so the credit maths stays honest even though
the pixels are not.

Making video real is deliberately a one-file change: implement
`GenerationProvider` (`src/lib/providers/types.ts`) against a real model and
swap the entry in `src/lib/providers/index.ts`. Nothing in the API routes or the
generation service knows which provider serves which model.

---

## Running it

```bash
npm install
cp .env.example .env     # then fill in the values
npm run db:migrate
npm run dev
```

You need a Clerk application, a Neon Postgres database (pooled **and** direct
connection strings) and a funded fal.ai key. `.env.example` documents each one.

### Deploying to Vercel

Set these in **Project → Settings → Environment Variables** before the first
deploy. They are needed at runtime; the build itself no longer requires any of
them (see below).

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API keys |
| `CLERK_SECRET_KEY` | Clerk → API keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/ai/image` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/ai/image` |
| `DATABASE_URL` | Neon **pooled** string (host contains `-pooler`) |
| `DIRECT_URL` | Neon **direct** string — migrations only |
| `FAL_KEY` | fal.ai → keys. Server-side only, never `NEXT_PUBLIC_` |

Migrations are **not** run by the build. Apply them from a machine that has
`DIRECT_URL`:

```bash
npm run db:deploy      # prisma migrate deploy
```

#### The build does not need environment variables

`postinstall` runs `prisma generate`, which needs only the schema. An earlier
version of `prisma.config.ts` resolved `env("DIRECT_URL")` eagerly and failed
the Vercel install step with `PrismaConfigEnvError` before the app ever built.
Both that config and the Prisma client now resolve their connection strings
lazily, so a missing variable surfaces on the first query rather than taking
down an entire deploy. `next build` is verified to succeed with no `.env` at
all.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:check` | Verify the signed-up user's row and credit balance |
| `npm run prove:generation` | Drive the real pipeline end to end from the terminal |
| `npm run check:validation` | Assert the input rules (prompt length, models, ratios) |
| `npm run check:studio` | Playwright UI checks against the fixture harness |

---

## Routes

| Route | Access | Notes |
|---|---|---|
| `/` | public, static | Landing |
| `/pricing`, `/enterprise`, `/community` | public, static | Placeholders |
| `/effects` | public | 15 presets; "Recreate" deep-links into the composer |
| `/styleguide` | public | Design token preview |
| `/ai/image` | **signed in** | Real generation via fal |
| `/ai/video` | **signed in** | Simulated generation, see above |
| `/api/generate`, `/api/generations`, `/api/generations/[id]`, `/api/credits` | **signed in** | |
| `/uitest/image` | dev only | Fixture harness for `check:studio`; 404s in production |

Auth is deny-by-default: anything not explicitly listed as public in
`src/middleware.ts` requires a session.

---

## Known tradeoffs

- **Result URLs point at the provider's CDN.** Nothing is mirrored to our own
  storage, so if fal expires those URLs the library breaks retroactively. The
  fix is to copy the bytes on completion in `syncGeneration`.
- **User sync happens on read**, not via Clerk webhooks — webhooks need a public
  tunnel in dev. A profile edit in Clerk reaches our database on that user's
  next request.
- **The stub's job table is in memory.** Job state is encoded in the request id
  so a cold serverless instance reconstructs it rather than losing the job.
- **The credits chip is client-fetched.** A Suspense-wrapped server component in
  the root layout would opt every route out of static rendering; Partial
  Prerendering would fix this properly but is canary-only on Next 15.

## Capture log

`.agent-logs/` holds the raw prompt/response record for this build, and
`CAPTURE-TEST.md` documents the capture setup — including five turns that were
backfilled from transcripts after the hook was found not to be firing.
