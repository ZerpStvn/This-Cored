-- This Cored — initial schema
create extension if not exists pgcrypto;

-- ============================================================================
-- Tables
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.servers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  invite_code text not null unique default encode(gen_random_bytes(6), 'hex'),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.server_members (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (server_id, profile_id)
);

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index messages_channel_id_created_at_idx on public.messages (channel_id, created_at);
create index server_members_profile_id_idx on public.server_members (profile_id);
create index channels_server_id_idx on public.channels (server_id);

-- ============================================================================
-- Helper functions (security definer to avoid recursive RLS lookups)
-- ============================================================================

create function public.is_server_member(_server_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.server_members
    where server_id = _server_id and profile_id = auth.uid()
  );
$$;

create function public.is_channel_member(_channel_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.channels c
    join public.server_members sm on sm.server_id = c.server_id
    where c.id = _channel_id and sm.profile_id = auth.uid()
  );
$$;

create function public.is_server_owner(_server_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.servers
    where id = _server_id and owner_id = auth.uid()
  );
$$;

-- ============================================================================
-- RPCs
-- ============================================================================

create function public.create_server(_name text, _image_url text default null)
returns public.servers
language plpgsql
security definer
set search_path = public
as $$
declare
  _server public.servers;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if trim(_name) = '' then
    raise exception 'Server name cannot be empty';
  end if;

  insert into public.servers (name, image_url, owner_id)
  values (trim(_name), _image_url, auth.uid())
  returning * into _server;

  insert into public.server_members (server_id, profile_id, role)
  values (_server.id, auth.uid(), 'owner');

  insert into public.channels (server_id, name)
  values (_server.id, 'general');

  return _server;
end;
$$;

create function public.join_server_by_invite(_invite_code text)
returns public.servers
language plpgsql
security definer
set search_path = public
as $$
declare
  _server public.servers;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into _server from public.servers where invite_code = _invite_code;

  if _server.id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.server_members (server_id, profile_id, role)
  values (_server.id, auth.uid(), 'member')
  on conflict (server_id, profile_id) do nothing;

  return _server;
end;
$$;

grant execute on function public.create_server(text, text) to authenticated;
grant execute on function public.join_server_by_invite(text) to authenticated;

-- ============================================================================
-- New user trigger
-- ============================================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- Row level security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.servers enable row level security;
alter table public.server_members enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;

-- profiles: everyone can read (needed to render usernames/avatars), only the
-- owner can modify their own row.
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- servers: only members can read; creation happens through create_server().
create policy "members can view their servers"
  on public.servers for select
  to authenticated
  using (public.is_server_member(id));

create policy "owners can update their server"
  on public.servers for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners can delete their server"
  on public.servers for delete
  to authenticated
  using (owner_id = auth.uid());

-- server_members: members can see the roster of servers they belong to.
create policy "members can view server rosters"
  on public.server_members for select
  to authenticated
  using (public.is_server_member(server_id));

create policy "owners can remove members"
  on public.server_members for delete
  to authenticated
  using (
    public.is_server_owner(server_id)
    and profile_id <> (select owner_id from public.servers where id = server_id)
  );

create policy "members can leave a server"
  on public.server_members for delete
  to authenticated
  using (
    profile_id = auth.uid()
    and profile_id <> (select owner_id from public.servers where id = server_id)
  );

-- channels: members can read; only the server owner can create/delete.
create policy "members can view channels"
  on public.channels for select
  to authenticated
  using (public.is_server_member(server_id));

create policy "owners can create channels"
  on public.channels for insert
  to authenticated
  with check (public.is_server_owner(server_id));

create policy "owners can delete channels"
  on public.channels for delete
  to authenticated
  using (public.is_server_owner(server_id));

-- messages: members of the parent server can read/write; authors can edit or
-- delete their own messages.
create policy "channel members can view messages"
  on public.messages for select
  to authenticated
  using (public.is_channel_member(channel_id));

create policy "channel members can send messages"
  on public.messages for insert
  to authenticated
  with check (profile_id = auth.uid() and public.is_channel_member(channel_id));

create policy "authors can update their own messages"
  on public.messages for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "authors can delete their own messages"
  on public.messages for delete
  to authenticated
  using (profile_id = auth.uid());

-- ============================================================================
-- Realtime
-- ============================================================================

alter publication supabase_realtime add table public.messages;
