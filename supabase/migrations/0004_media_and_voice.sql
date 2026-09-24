-- This Cored — voice channels + image/video attachments on messages and posts.

-- Channels gain a type: 'text' (default, unchanged behavior) or 'voice'.
alter table public.channels
  add column type text not null default 'text' check (type in ('text', 'voice'));

-- Messages may carry an attachment (image or short video) in place of, or
-- alongside, text content. Loosen the old "content required" check so an
-- image-only message is allowed, but still forbid a fully empty message.
alter table public.messages
  add column attachment_url text,
  add column attachment_type text check (attachment_type in ('image', 'video'));

alter table public.messages drop constraint messages_content_check;
alter table public.messages
  add constraint messages_content_check
  check (char_length(trim(content)) > 0 or attachment_url is not null);

alter table public.messages alter column content set default '';

-- Forum posts may carry a single header attachment (image or short video).
alter table public.forum_posts
  add column attachment_url text,
  add column attachment_type text check (attachment_type in ('image', 'video'));
