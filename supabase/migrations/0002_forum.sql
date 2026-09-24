-- This Cored — community forum
-- A single, community-wide forum (not scoped to any one server): any signed-in
-- member can post, reply in threads, and like posts.

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  parent_id uuid references public.forum_comments (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create table public.forum_post_likes (
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create index forum_posts_created_at_idx on public.forum_posts (created_at desc);
create index forum_comments_post_id_idx on public.forum_comments (post_id);
create index forum_comments_parent_id_idx on public.forum_comments (parent_id);
create index forum_post_likes_post_id_idx on public.forum_post_likes (post_id);

alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_post_likes enable row level security;

-- Posts: readable by anyone signed in; only the author can write/edit/delete.
create policy "signed-in users can read posts"
  on public.forum_posts for select
  to authenticated
  using (true);

create policy "signed-in users can create posts"
  on public.forum_posts for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "authors can update their own posts"
  on public.forum_posts for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "authors can delete their own posts"
  on public.forum_posts for delete
  to authenticated
  using (author_id = auth.uid());

-- Comments: same shape as posts, threaded via parent_id.
create policy "signed-in users can read comments"
  on public.forum_comments for select
  to authenticated
  using (true);

create policy "signed-in users can create comments"
  on public.forum_comments for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "authors can update their own comments"
  on public.forum_comments for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "authors can delete their own comments"
  on public.forum_comments for delete
  to authenticated
  using (author_id = auth.uid());

-- Likes: one per (post, profile); toggled by insert/delete from the client.
create policy "signed-in users can read likes"
  on public.forum_post_likes for select
  to authenticated
  using (true);

create policy "users can like posts as themselves"
  on public.forum_post_likes for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "users can unlike their own like"
  on public.forum_post_likes for delete
  to authenticated
  using (profile_id = auth.uid());
