# PDFCure

Free PDF tools that run entirely in your browser — merge, split, compress, sign,
convert, and more, with nothing uploaded to a server. A small set of AI tools
(Summarize, Ask your PDF, Translate) are the exception: they require a Google
sign-in and are limited to one use per account per day.

## Features

- **30+ client-side PDF tools** — merge, split, compress, rotate, crop, sign,
  redact, protect/unlock, watermark, page numbers, and format conversions
  (Word/Excel/PowerPoint/JPG/HTML ↔ PDF, OCR, repair). All processing happens
  in the browser; files never leave the device.
- **AI tools** (Summarize, Ask your PDF, Translate PDF, AI HTML↔PDF) — send
  extracted text (not the file) to Claude via the Anthropic API. Gated behind
  Google sign-in, one use per account per day.
- **Google Drive import** — pick a file straight from Drive instead of local
  upload, available on every tool once configured.
- **Admin panel** (`/admin`) — signed-in-user list, feedback inbox, and a
  settings screen for API keys/OAuth credentials that takes effect immediately
  with no redeploy.
- Multi-language UI (26 locales), PWA installable, optional AdSense/GA.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite ·
NextAuth.js (Google provider) · Anthropic SDK

## Prerequisites

- Node.js 18.18+ and npm
- A Google Cloud project (for sign-in, and optionally Drive import)
- An Anthropic API key (only needed for the AI tools)

## Quick start

```bash
npm install                 # also runs `prisma generate` via postinstall
cp .env.local.example .env  # then fill in the required values below
npm run db:migrate          # creates prisma/dev.db and applies the schema
npm run dev                 # http://localhost:3000
```

Sign in with Google once the app is running — **the first person to ever sign
in becomes the site admin automatically** (no env var needed). From
`/admin → Configuration` that admin can then set the Anthropic API key and
Drive picker keys without touching `.env` again.

## Environment variables

Full reference with inline setup steps lives in
[`.env.local.example`](.env.local.example) — copy it to `.env` and fill it in.
The short version:

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite file path, e.g. `file:./dev.db`. Already set in the example file. |
| `NEXTAUTH_SECRET` | Yes | Encrypts session cookies. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | The site's own URL, e.g. `http://localhost:3000` in dev. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Yes, to sign in at all | OAuth credentials — see below. |
| `ANTHROPIC_API_KEY` | Only for AI tools | Can be set later from `/admin` instead. |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` | Optional | Emails a copy of feedback/contact submissions. Feedback is always saved to the database regardless. |
| `NEXT_PUBLIC_ADSENSE_*`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | Ads/analytics. Leave unset to stay ad-free and tracking-free. |
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

## Admin panel

`/admin` — only reachable once signed in as an admin (the first-ever sign-in,
or anyone an admin promotes directly in the database).

- **User information** — every account that's signed in, join date, and AI
  usage (resets daily at midnight UTC).
- **Feedback** — every submission from the feedback widget, sortable and
  searchable, paginated. Saved to the database independently of whether
  email delivery is configured.
- **Configuration** — API keys and OAuth credentials, stored in the database
  and read in preference to `.env`. Changes apply immediately, no redeploy.
  Secrets are masked after saving (only the last 4 characters are shown).

## AI daily limit

Each signed-in account gets **one AI action per day, total, across all four
AI tools** (not one per tool) — asking a question via "Ask your PDF" and then
trying to also summarize a document the same day will hit the limit on the
second attempt. The quota resets at midnight UTC and is only consumed after a
successful response, so a failed request (bad API key, network error, etc.)
doesn't burn it.

## Deployment notes

This uses SQLite via a local file (`prisma/dev.db`), which needs a host with
a persistent, writable disk and a single running instance — a VPS, Railway,
Render, Fly.io, etc. all work fine. **It will not work reliably on Vercel or
other serverless platforms**, where each function invocation can run on a
different, ephemeral instance with no shared disk. If you're deploying to
serverless, swap the Prisma datasource to a hosted Postgres (Vercel Postgres,
Supabase, Neon, etc.) — the schema and code don't otherwise change, just the
`datasource` provider in `prisma/schema.prisma` and `DATABASE_URL`.

## Scripts

```bash
npm run dev          # start the dev server
npm run build         # production build
npm run start          # run the production build
npm run lint            # lint
npm run db:migrate       # create/apply a Prisma migration
npm run db:studio         # browse the database in Prisma Studio
```
