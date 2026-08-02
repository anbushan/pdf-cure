# PDFCure

Free PDF tools that run entirely in your browser — merge, split, compress, sign,
convert, and more, with nothing uploaded to a server. A small set of AI tools
(Summarize, Ask your PDF, Translate, AI HTML↔PDF) are the exception: they
require a Google sign-in and a daily quota — free accounts get one AI action
a day total, Pro accounts (₹499/mo by default, admin-editable) get 20 per day
*per tool* and no ads.

## Features

- **30+ client-side PDF tools** — merge, split, compress, rotate, crop, sign,
  redact, protect/unlock, watermark, page numbers, and format conversions
  (Word/Excel/PowerPoint/JPG/HTML ↔ PDF, OCR, repair). All processing happens
  in the browser; files never leave the device. Free and unlimited regardless
  of plan.
- **AI tools** (Summarize, Ask your PDF, Translate PDF, AI HTML↔PDF) — send
  extracted text (not the file) to Claude via the Anthropic API. Gated behind
  Google sign-in with a daily quota that depends on plan.
- **Pro plan** (`/pricing`) — Razorpay subscription that removes ads and
  raises the AI quota. Fully self-serve: upgrade, cancel anytime (access
  continues until the paid period ends), or delete the account entirely —
  all from the account menu under the avatar in the header. Price is
  charged in INR always, but displayed converted to the visitor's local
  currency (best-effort IP geolocation, see `lib/currency.ts`).
- **Google Drive import** — pick a file straight from Drive instead of local
  upload, available on every tool once configured.
- **Admin panel** (`/admin`) — signed-in-user list, feedback inbox, payment
  history, and settings screens (technical credentials + business
  price/limits) that take effect immediately with no redeploy.
- Multi-language UI (26 locales), PWA installable, optional AdSense/GA.
- Lighthouse performance ≥ 95 on both mobile and desktop for every public
  page (homepage, tool pages, pricing) — see *Performance* below.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL ·
NextAuth.js (Google provider) · Anthropic SDK · Razorpay

## Prerequisites

- Node.js 18.18+ and npm
- A Postgres database — any host works locally (see *Deploying to Vercel*
  below for the one this project is set up for)
- A Google Cloud project (for sign-in, and optionally Drive import)
- An Anthropic API key (only needed for the AI tools)
- A Razorpay account (only needed to actually accept Pro payments — the
  pricing page works without it, "Upgrade" just errors until it's configured)

## Quick start

```bash
npm install                 # also runs `prisma generate` via postinstall
cp .env.local.example .env  # then fill in the required values below, including a real DATABASE_URL
npm run db:migrate          # applies the schema to that database (first run creates it: --name init)
npm run dev                 # http://localhost:3000
```

Sign in with Google once the app is running — **the first person to ever sign
in becomes the site admin automatically** (no env var needed). From
`/admin → Configuration` that admin can then set the Anthropic API key,
Drive picker keys, and Razorpay keys without touching `.env` again, and from
`/admin → Pricing` adjust the Pro price and both plans' AI limits.

Set `ADMIN_EMAIL` in `.env` to pin admin access to one address instead —
that address is promoted to admin on every sign-in regardless of order,
which is handy for testing as both a regular user and the admin with one
Google account.

## Environment variables

Full reference with inline setup steps lives in
[`.env.local.example`](.env.local.example) — copy it to `.env` and fill it in.
The short version:

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. On Vercel this is injected automatically once you provision Storage → Postgres — see *Deploying to Vercel* below. |
| `NEXTAUTH_SECRET` | Yes | Encrypts session cookies. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | The site's own URL, e.g. `http://localhost:3000` in dev. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Yes, to sign in at all | OAuth credentials — see below. |
| `ANTHROPIC_API_KEY` | Only for AI tools | Can be set later from `/admin` instead. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Only to accept payments | Can be set later from `/admin` instead — see below. |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` | Optional | Emails a copy of feedback/contact submissions. Feedback is always saved to the database regardless. |
| `NEXT_PUBLIC_ADSENSE_*`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | Ads/analytics. Leave unset to stay ad-free and tracking-free. Not shown to Pro accounts regardless. |
| `NEXT_PUBLIC_GOOGLE_API_KEY`, `NEXT_PUBLIC_GOOGLE_APP_ID` | Optional | Google Drive file picker. Can also be set from `/admin`. |

### Setting up Google sign-in (do this carefully — the redirect URI is the part people miss)

Google sign-in and the Google Drive picker are two *different* OAuth flows
that can share the same Client ID, but each needs its own thing configured on
that OAuth client in Google Cloud Console — missing either one is the #1
cause of sign-in breaking:

1. [console.cloud.google.com](https://console.cloud.google.com) → create or
   select a project.
2. **APIs & Services → OAuth consent screen** → configure it (External is
   fine for testing; add your own Google account as a test user if the app
   isn't published/verified yet).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → type **Web application**.
4. Under **Authorized JavaScript origins**, add your site's origin (e.g.
   `http://localhost:3000`) — this is what the Drive picker needs.
5. Under **Authorized redirect URIs**, add
   `http://localhost:3000/api/auth/callback/google` (and the same with your
   production domain once deployed) — **this is what NextAuth sign-in needs,
   and it's easy to forget if you only set up the client for Drive
   originally.** Without it you'll get Google's `redirect_uri_mismatch`
   error.
6. Copy the **Client ID** and **Client secret** from that same credential
   into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`. (The secret
   only appears in Credentials → click the OAuth client → it's not shown
   anywhere in the Drive-picker setup, so grab it from here even if you
   already had the Client ID from a Drive-only setup.)
7. If you also want Drive import working, enable the **Google Picker API**
   and **Google Drive API** for the project, then create an **API key**
   (restrict it to the Picker API) for `NEXT_PUBLIC_GOOGLE_API_KEY`, and use
   the numeric project number (shown on the project's dashboard) for
   `NEXT_PUBLIC_GOOGLE_APP_ID`.

### Setting up Razorpay (Pro plan payments)

Only needed if you actually want to accept payments — the pricing page
renders fine without it, "Upgrade" just shows an error until this is done.

1. [dashboard.razorpay.com](https://dashboard.razorpay.com) → sign up →
   **Settings → API Keys** → generate a key pair. Use **test mode** while
   developing; Razorpay's test mode needs no real card and has its own test
   key pair (switch the toggle in the dashboard).
2. Put those in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (`.env`, or later
   from `/admin → Configuration`).
3. **Settings → Webhooks → Add New Webhook**:
   - URL: `https://yourdomain.com/api/razorpay/webhook`
   - Active events: `subscription.charged`, `subscription.halted`,
     `payment.failed`, `subscription.cancelled`
   - Set a secret there and copy it into `RAZORPAY_WEBHOOK_SECRET`.
   - In local dev, Razorpay can't reach `localhost` — either skip this
     during local testing (the checkout-success callback alone is enough to
     grant access for a first test) or tunnel with something like `ngrok`
     and use that URL instead.
4. That's it — the app creates its own Razorpay **Plan** automatically the
   first time anyone upgrades, priced at whatever `/admin → Pricing` says.
   You don't need to create a Plan by hand in the Razorpay dashboard.

## Admin panel

`/admin` — only reachable once signed in as an admin (the first-ever sign-in,
whoever matches `ADMIN_EMAIL` if set, or anyone an admin promotes directly in
the database).

- **User information** — every account that's signed in, join date, plan,
  and AI usage (resets daily at midnight UTC).
- **Feedback** — every submission from the feedback widget, sortable,
  searchable, paginated. Saved to the database independently of whether
  email delivery is configured.
- **Payments** — every Razorpay payment event (checkout confirmations and
  webhook events), sortable, searchable, filterable by status, paginated.
- **Pricing** — the Pro plan's monthly price, and the daily AI-action limit
  for each plan. Changing the price creates a new Razorpay Plan for future
  subscribers; existing subscribers keep their original price.
- **Configuration** — technical credentials (API keys, OAuth, Razorpay keys),
  stored in the database and read in preference to `.env`. Changes apply
  immediately, no redeploy. Secrets are masked after saving (only the last 4
  characters are shown).

## AI daily limit

Depends on plan (numbers below are the defaults — both are editable from
`/admin → Pricing`):

- **Free** — **one AI action per day, total, across all four AI tools** (not
  one per tool) — asking a question via "Ask your PDF" and then trying to
  also summarize a document the same day hits the limit on the second
  attempt.
- **Pro** — **20 AI actions per day, per tool** — Summarize, Ask, Translate,
  and AI HTML/PDF each get their own separate pool of 20.

Either way, the quota resets at midnight UTC and is only consumed after a
successful response, so a failed request (bad API key, network error, etc.)
doesn't burn it.

## Account menu

Click the avatar in the header once signed in: shows the current plan (with
renewal date if Pro), a **Cancel subscription** button for Pro accounts
(same effect as the one on `/pricing`), and **Delete account** — a
two-step-confirm action that cancels any active Razorpay subscription
immediately (not at cycle end, since there'll be no account left to keep
serving) and deletes the account. Sessions, linked Google account, AI usage
history, and payment records all cascade-delete with it (see
`prisma/schema.prisma`); feedback submissions aren't linked to accounts, so
they're unaffected.

## Currency display

`/pricing` shows the Pro price converted to the visitor's local currency,
based on a best-effort IP geolocation lookup (`app/api/geo`, via the free
[ipapi.co](https://ipapi.co) API — no key needed, ~1,000 lookups/day on
their free tier, cached per-IP for an hour to stay well under that). **The
actual Razorpay charge is always in INR** regardless of what's displayed —
the conversion is a static, hand-maintained rate table in `lib/currency.ts`
for display only, not a live FX feed, and the page says so explicitly
("billed as ₹499 (INR) via Razorpay") whenever the shown currency isn't
INR. If the geolocation lookup fails or times out, it silently falls back
to showing the INR price — this never blocks or gates checkout itself.

## Performance

Every public page is built to score 95+ on Lighthouse performance, both
mobile and desktop presets, measured against a production build (`npm run
build && npm run start` — dev-mode scores are meaningfully lower and not
representative). The one non-obvious fix worth knowing about: the AI tool
pages' sign-in/quota gate (`components/AiGate.tsx`) is a Server Component,
not a client-side session fetch — an earlier client-rendered version added
several seconds of pure render-delay to Largest Contentful Paint waiting on
`useSession()` and a follow-up API call. If you're adding new
account-aware UI to a page that needs to stay fast, prefer resolving
session/plan state server-side (`lib/getSession.ts`) over a client fetch
where possible.

## Deploying to Vercel

The Prisma datasource is Postgres (`prisma/schema.prisma`), which is what
Vercel's serverless functions need — they run on ephemeral, non-shared
filesystems, so a file-based database like SQLite can't work there. `npm run
build` runs `prisma migrate deploy` before `next build`, so every deploy
applies any pending migrations automatically; you don't run that by hand in
production.

1. **Provision the database** — in the Vercel dashboard, open the project →
   **Storage** tab → **Create Database** → **Postgres** (Neon-backed). This
   injects `DATABASE_URL` and a few `POSTGRES_*` variants into the project's
   env vars automatically; you only need `DATABASE_URL`, the rest can stay
   unused.
2. **One-time schema setup** — before the first deploy, run the initial
   migration against that new database from your machine so the migration
   files exist in the repo (Vercel's build only *applies* migrations, it
   doesn't generate them):
   ```bash
   DATABASE_URL="<paste the Neon connection string>" npx prisma migrate dev --name init
   git add prisma/migrations && git commit -m "Add initial Postgres migration"
   ```
3. **Set the rest of the environment variables** — Project → Settings →
   Environment Variables. At minimum: `NEXTAUTH_SECRET` (generate with
   `openssl rand -base64 32`), `NEXTAUTH_URL` (your production URL, e.g.
   `https://yourdomain.com`), `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
   Everything else (Anthropic key, Razorpay keys, Drive picker keys,
   AdSense/GA IDs) can be set later from `/admin → Configuration` instead —
   see *Environment variables* above.
4. **Update the Google OAuth client** — add
   `https://yourdomain.com/api/auth/callback/google` to its Authorized
   redirect URIs (Google Cloud Console → Credentials), alongside the
   `localhost:3000` one you already have for local dev.
5. **Deploy.** Push to the branch Vercel is tracking, or run `vercel --prod`.

A couple of things that only matter at Vercel's scale, already handled in
the code: the four AI routes (`pdf-summarize`, `pdf-translate`, `pdf-chat`,
`ai-html-to-pdf`, `ai-pdf-to-html`) each set `export const maxDuration = 60`
since Claude can take longer than Vercel's 10-second default on a long
document (Hobby plan still hard-caps at 10s regardless — this only helps
on Pro or above); and every admin/account list's search filter uses
`mode: "insensitive"`, since Postgres's `contains` is case-sensitive by
default where SQLite's wasn't.

## Scripts

```bash
npm run dev          # start the dev server
npm run build         # production build
npm run start          # run the production build
npm run lint            # lint
npm run db:migrate       # create/apply a Prisma migration
npm run db:studio         # browse the database in Prisma Studio
```
