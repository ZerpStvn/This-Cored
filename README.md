# This Cored — PH Only

A Discord-style chat app — servers, text channels, real-time messaging, and a community
forum — built with Next.js and Supabase.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase** — Postgres, Auth, and Realtime
- **Tailwind CSS v4** + **shadcn/ui**
- **pnpm**

## Setup

### 1. Create a Supabase project

Create a free project at [supabase.com](https://supabase.com).

### 2. Run the database migrations

Open the SQL Editor in your Supabase project dashboard and run, in order:

1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — creates:
   - `profiles`, `servers`, `server_members`, `channels`, `messages` tables
   - Row Level Security policies scoping every table to server membership
   - A trigger that creates a `profiles` row whenever a new user signs up
   - RPC functions `create_server` and `join_server_by_invite`
   - Realtime enabled on the `messages` table
2. [`supabase/migrations/0002_forum.sql`](supabase/migrations/0002_forum.sql) — creates:
   - `forum_posts`, `forum_comments` (threaded via `parent_id`), `forum_post_likes` tables
   - RLS policies open to any signed-in user (the forum isn't scoped to a server)
3. [`supabase/migrations/0003_storage.sql`](supabase/migrations/0003_storage.sql) — creates the
   `avatars` (5 MB, images only) and `attachments` (50 MB, images + short videos) Storage
   buckets, both public-read, with RLS restricting uploads to each user's own folder
   (`{user_id}/...`).
4. [`supabase/migrations/0004_media_and_voice.sql`](supabase/migrations/0004_media_and_voice.sql) —
   adds `channels.type` (`text` | `voice`), `messages.attachment_url`/`attachment_type`, and
   `forum_posts.attachment_url`/`attachment_type`.

If you have the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to your project, you can
instead run:

```bash
supabase db push
```

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your project's URL and anon key
(Project Settings → API in the Supabase dashboard):

```bash
cp .env.local.example .env.local
```

### 4. (Optional) Disable email confirmation for local testing

In Supabase, go to Authentication → Providers → Email and turn off "Confirm email" if you
want to sign up and log straight in without checking an inbox.

### 5. Run the app

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- **Auth** — email/password via Supabase Auth, plus a real forgot/reset-password flow. A
  database trigger auto-creates a `profiles` row for every new user.
- **Servers** — created via the `create_server` RPC, which atomically creates the server, adds
  the creator as `owner`, and creates a default `general` channel.
- **Invites** — every server has an `invite_code`; sharing `/invite/<code>` lets anyone with an
  account join via the `join_server_by_invite` RPC.
- **Channels** — text or voice, within a server; only the server owner can create them (MVP scope).
- **Messages** — sent directly from the browser via the Supabase client (RLS-checked) and
  streamed to everyone in the channel with Supabase Realtime (`postgres_changes`). Can carry an
  image/video attachment in place of or alongside text.
- **Voice channels** — WebRTC audio, mesh-connected (every participant connects directly to
  every other participant — fine for small servers, doesn't scale to large ones). Supabase
  Realtime's Presence tracks who's in the channel and Broadcast carries the offer/answer/ICE
  signaling; there's no TURN server configured, only public STUN, so calls between peers on
  strict/symmetric NATs may fail to connect. See `src/lib/voice/use-voice-channel.ts`.
- **Forum** — a community-wide space (not scoped to any one server), reached by clicking the
  app logo at the top of the server rail. Members can create posts (with an optional
  image/video attachment), reply in nested threads, and like posts. Not real-time — pages
  revalidate on mutation instead of subscribing.
- **File uploads** — avatars (`/servers` → your user pill → Edit profile) and chat/forum
  attachments upload straight from the browser to Supabase Storage. Size and MIME type are
  enforced both client-side (fast feedback) and by the bucket config (authoritative): 5 MB for
  avatars, 50 MB for attachments. See `src/lib/storage.ts`.

## Project structure

```
src/
  app/
    page.tsx                    Landing page
    login/, register/           Auth pages
    forgot-password/,
    reset-password/             Password reset flow
    invite/[inviteCode]/        Invite acceptance
    (app)/                      Route group: shared app shell (nav rail + auth guard)
      layout.tsx                 Fetches the signed-in profile and the user's servers
      forum/
        page.tsx                  Post feed
        new/                      Create-post form
        [postId]/                 Post detail + threaded comments
      servers/
        new/, join/               Create/join server forms
        [serverId]/
          layout.tsx               Channel sidebar
          channels/[channelId]/    Chat view
  components/
    auth/, server/, chat/, forum/, navigation/, user/, voice/, ui/
  lib/
    supabase/                   Browser/server Supabase clients + session proxy
    actions/                    Server actions (servers, channels, forum posts/comments)
    voice/use-voice-channel.ts  WebRTC mesh + Realtime Presence/Broadcast signaling
    storage.ts                  Upload helpers + client-side size/type validation
    data.ts                     Server-side data fetching helpers
supabase/migrations/
  0001_init.sql                 Servers/channels/messages schema + RLS + RPCs
  0002_forum.sql                Forum schema + RLS
  0003_storage.sql              Storage buckets (avatars, attachments) + RLS
  0004_media_and_voice.sql      channels.type + attachment columns
```

## Not included (out of MVP scope)

Video channels, direct messages, and granular roles/permissions were left out of this pass —
see the project's task history if you want to add them next. The QR-code and passkey options on
the login page are visual only (no mobile app or passkey auth is wired up). Voice channels have
no TURN server, so they're not guaranteed to connect across restrictive NATs (see above).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
