# favTube codebase guide

A layer-by-layer walkthrough of how the app is built, for anyone (including future-you)
getting oriented in the code.

## The big picture

This is a Next.js **App Router** app, which means most "pages" are React Server Components
that run on the server, query the database directly (no separate API layer for reads), and
stream HTML to the browser. Mutations (add a video, follow someone, post a comment) go
through **Server Actions** — functions marked `"use server"` that the browser calls like
normal JavaScript functions, but which actually execute back on the server.

Request lifecycle for visiting someone's profile:

```
Browser → GET /u/jordandavis
  → Next.js runs src/app/u/[username]/page.tsx on the server
    → queries Postgres via Prisma (src/lib/prisma.ts)
    → checks the visitor's session via better-auth (src/lib/actions/session.ts)
    → renders React to HTML, sends it down
  → Browser hydrates the interactive bits (follow button, comment box, drag-reorder)
```

And for a mutation, e.g. clicking "Follow":

```
Browser → calls followUser() as if it were a local function
  → Next.js actually POSTs to the server under the hood
    → src/lib/actions/follows.ts runs: checks session, checks it's not a self-follow,
      writes to Postgres, calls revalidatePath() so the profile page refetches
  → React updates the UI (optimistically, before the server even responds)
```

Everything hangs off three external services: **Neon** (Postgres), **better-auth** (its own
auth logic, backed by that same Postgres), and the **YouTube Data API** (metadata lookup
only, called once per video add — never on page render).

## Database layer — `prisma/schema.prisma`

Two families of models:

**better-auth's own tables** (`User`, `Session`, `Account`, `Verification`) weren't
hand-written. `src/lib/auth.ts` was configured first (which plugins, which extra fields),
then `npx @better-auth/cli generate` read that config and generated the matching Prisma
models. That's why `User` has `username`/`displayUsername`/`bio` fields — those came from
the `username()` plugin and the `additionalFields` passed into `betterAuth()`.
`User.profileViews` is the one field added by hand afterward, since it's not something
better-auth's client ever sets.

Notice `id String @id` with no `@default(...)` on these models — better-auth generates its
own IDs at the application layer, so Prisma doesn't need to.

**The app's own domain tables**:

- `VideoEntry` — one row per ranked video. `@@unique([userId, rank])` means the database
  itself refuses to let one user have two videos at rank 3. That constraint is also *why*
  reordering needs the two-pass trick described below.
- `Follow` — a self-referential join table. It has two separate relations back to `User`
  (`"UserFollowing"` and `"UserFollowers"`) because a single FK wouldn't tell Prisma which
  direction is "who follows" vs "who's followed."
- `Comment` / `CommentLike` — comments attach to a `profileUserId` (whose list it's on), not
  to an individual video — feedback is on the list as a whole, not per-video.

Every foreign key has `onDelete: Cascade`. Delete a user, and their videos, follow edges
(both directions), and comments (both authored and received) all disappear with them — no
orphan rows.

The `generator` block at the top points at `../src/generated/prisma` — a fully-typed
TypeScript client (`prisma.videoEntry.findMany(...)` etc. with autocomplete) that Prisma
writes every time `prisma generate` runs. It's gitignored; nobody hand-edits it.

## Connecting to the database — `src/lib/prisma.ts`

Since Prisma 6/7, connecting to Neon goes through a **driver adapter**
(`@prisma/adapter-neon`) instead of Prisma opening the TCP connection itself — that's what
lets this run in serverless/edge-ish environments over HTTP/WebSocket instead of a raw
Postgres socket.

Two things worth knowing:

1. The client and adapter are cached on `globalThis`. In dev, Next.js hot-reloads modules
   constantly — without the cache, every file save would create a *new* `PrismaClient` and a
   new connection pool, and Neon's free tier has a low connection ceiling that would be
   exhausted in minutes.
2. `DATABASE_URL` (pooled, has `-pooler` in the hostname) is used at runtime. `DIRECT_URL`
   (non-pooled) is used only by the Prisma CLI for migrations (see `prisma.config.ts`).
   Migrations need a direct connection because schema changes don't always play nicely
   through a connection pooler.

## Auth — three files that work together

- `src/lib/auth.ts` — the server-side config and source of truth: which providers (Google +
  email/password), which plugins (`username()` for the `@handle`, `nextCookies()` so server
  actions can set the session cookie). **Order matters**: `nextCookies()` must be last in
  the plugins array, because it wraps every other plugin's response to attach the cookie.
- `src/lib/auth-client.ts` — the browser-side counterpart. Exports `signIn`, `signUp`,
  `signOut`, `useSession` — what `sign-in/page.tsx` and `site-nav.tsx` actually call.
- `src/app/api/auth/[...all]/route.ts` — a catch-all route. Every auth HTTP call
  (`/api/auth/sign-in/email`, `/api/auth/callback/google`, `/api/auth/sign-out`, etc.)
  funnels through this one file, which just hands the request to better-auth's own handler.

`src/lib/actions/session.ts` is the bridge back into server-only code — `getSession()` reads
the incoming request's cookies and asks better-auth "who is this." Every server action calls
`requireUserId()` from this file as its first line. That's deliberate, not boilerplate: a
signed-out user could call `addVideoEntry()` directly (server actions are just POST endpoints
under the hood — nothing stops someone from hitting them without going through the UI), so
the check has to live in the action itself, not just in whether a button is rendered.

## Server actions — `src/lib/actions/`

Four files, one per domain (`video-entries.ts`, `follows.ts`, `comments.ts`, plus
`session.ts` as the shared helper). Every exported function follows the same shape:

1. `requireUserId()` — bail if not signed in
2. check ownership if it's a mutation on someone's own resource
3. do the database write
4. `revalidatePath(...)` so Next.js knows to refetch that page's data

The one genuinely tricky piece is in `video-entries.ts`: reordering or removing a video.
Because of the `@@unique([userId, rank])` constraint, naively updating ranks one at a time
during a reorder (e.g. shifting rows 4→3, 5→4, 6→5, 7→6) will collide mid-transaction — the
second update tries to write `rank: 4` while another row still holds it. The fix is a
**two-pass update**: first push every affected row to a negative, guaranteed-unused rank
(`-1`, `-2`, ...), then in a second pass assign the real final ranks. Both passes run inside
one `prisma.$transaction(...)`, so nobody ever sees the intermediate negative-rank state, and
if anything fails, it all rolls back.

`follows.ts` and `comments.ts` have a related but different problem: **idempotency**. If
someone double-clicks "Follow" fast enough that two requests race, the second one shouldn't
throw a duplicate-key error — it should just be a harmless no-op. That's what
`skipDuplicates: true` on `createMany` does in `followUser()` and in `toggleCommentLike()`.

## YouTube integration — `src/lib/youtube.ts`

Two pure functions plus one that hits the network:

- `parseYoutubeUrl()` — takes whatever someone pastes (`youtube.com/watch?v=...`,
  `youtu.be/...`, `/shorts/...`, `/embed/...`, `/live/...`, or a bare 11-character video ID)
  and extracts just the video ID, or `null` if it doesn't recognize it.
- `parseIsoDuration()` — the YouTube API returns durations like `PT4M13S` (4 min 13 sec);
  this turns that into a plain integer of seconds, which is what gets stored.
- `fetchVideoMetadata()` — the one function that calls Google's API. It's only ever called
  from `addVideoEntry()` in the server action, at the moment a video is added. The metadata
  (title, channel, thumbnail, duration) gets written into the `VideoEntry` row right then —
  so viewing a profile later never re-hits YouTube's API, it just reads what's already in
  Postgres.

## Pages — `src/app/`

- `page.tsx` — the landing page. `getShowcase()` wraps its Prisma calls in a `try/catch`
  that falls back to zeros, so the page still renders before a database is connected.
  `export const revalidate = 60` means the page's stats refetch at most once a minute rather
  than being frozen at build time.
- `discover/page.tsx` — same fallback pattern, lists profiles that have at least one ranked
  video, most-videos-first.
- `u/[username]/page.tsx` — the page doing the most work. It fetches the profile, the
  viewer's session, comments, and follow status all in parallel (`Promise.all`), then
  branches on `isOwner = viewerId === profile.id` to decide whether to render the read-only
  `VideoCard` grid or the editable `ManageTopTen` component. There's no separate `/edit`
  route — same URL, different rendering, based on who's looking at it.
- `sign-in/page.tsx` / `sign-up/page.tsx` — plain client components, form state + calls into
  `auth-client.ts`.

## Components — `src/components/`

- `nav/site-nav.tsx` — reads session state (`useSession()`) to decide whether to show
  "Sign in" or an avatar, and reads scroll position (`atTop`) to swap the nav between
  transparent and a translucent blurred surface.
- `landing/animated-grid-backdrop.tsx` — the decorative SVG grid behind the top of the
  landing page. A 44px `<pattern>` plus ~26 randomly placed squares, each with its own
  randomized CSS keyframe duration (3–6s) and delay (0–4s), reshuffled every 5s. Squares are
  generated after mount rather than during render, since random positions would otherwise
  differ between the server-rendered HTML and the client's first paint (hydration mismatch).
  It's absolutely positioned from the document top at `z-0` so it also sits behind the nav;
  page sections carry `relative z-[1]` to stay above it.
- `theme/theme-provider.tsx` — thin wrapper around `next-themes`, which flips a `dark` class
  on `<html>`.
- `profile/video-card.tsx` — the read-only display of one ranked video (thumbnail, rank
  badge, duration badge).
- `profile/follow-button.tsx` — uses React's `useOptimistic` so the button flips state
  before the server responds, then reconciles (or reverts, with an error message) once the
  action actually completes.
- `profile/edit/manage-top-ten.tsx` — the biggest component. Uses `@dnd-kit` for
  drag-to-reorder; on drop, it optimistically reorders the local list immediately, then fires
  `reorderVideoEntries()` in the background via `useTransition`, rolling back local state if
  the server rejects it.
- `comments/comment-section.tsx` — composer + list, calls `postComment`/`deleteComment`/
  `toggleCommentLike`.

## Styling — `src/app/globals.css`

Tailwind v4's config-in-CSS style. The `:root` block defines raw color tokens (`--gray-0`,
`--primary`, etc.); `.dark` overrides the same variable names with dark-mode values. The
`@theme inline` block makes those usable as Tailwind classes (`bg-background`, `text-muted`,
etc.) instead of writing `style={{ background: 'var(--gray-0)' }}` everywhere.

One line worth flagging: `@custom-variant dark (&:where(.dark, .dark *));` — by default
Tailwind v4's `dark:` variant follows the OS-level `prefers-color-scheme`, but `next-themes`
works by toggling a `.dark` *class* instead. Without this line, `dark:` classes never
activate no matter what the toggle button does.

## Config/tooling odds and ends

- `prisma.config.ts` — tells the Prisma CLI to use `DIRECT_URL` for migrations (separate
  from the schema file, which as of Prisma 7 no longer holds connection URLs at all — a
  v6→v7 breaking change).
- `pnpm-workspace.yaml` — the `allowBuilds` section is a supply-chain gate: packages with
  install-time scripts (native binaries, postinstall hooks) need to be explicitly allowed.
  `@prisma/engines` and `prisma` are approved (needed to fetch the query engine binary);
  `sharp` and `better-sqlite3` are denied since nothing in this app uses them.

## Where to start reading

`src/lib/actions/video-entries.ts` is the smallest file that touches almost every concept
above (auth, ownership checks, transactions, the YouTube helper, revalidation) in one place —
a good first stop for getting oriented in the actual code.
