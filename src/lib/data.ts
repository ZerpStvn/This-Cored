import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Channel,
  ForumCommentNode,
  ForumCommentWithProfile,
  ForumPostWithMeta,
  MessageWithProfile,
  Profile,
  Server,
} from "@/lib/supabase/types";

export async function requireProfile(): Promise<{
  profile: Profile;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return { profile, supabase };
}

export async function joinServerByInvite(
  supabase: Awaited<ReturnType<typeof createClient>>,
  inviteCode: string
): Promise<{ server: Server | null; error: string | null }> {
  const code = inviteCode.trim();
  if (!code) return { server: null, error: "Invite code is required." };

  const { data, error } = await supabase
    .rpc("join_server_by_invite", { _invite_code: code })
    .single<Server>();

  if (error || !data) {
    return { server: null, error: error?.message ?? "Invalid or expired invite." };
  }

  return { server: data, error: null };
}

export async function getUserServers(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Server[]> {
  const { data, error } = await supabase
    .from("servers")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function getServerWithChannels(
  supabase: Awaited<ReturnType<typeof createClient>>,
  serverId: string
): Promise<{ server: Server; channels: Channel[] } | null> {
  const { data: server, error: serverError } = await supabase
    .from("servers")
    .select("*")
    .eq("id", serverId)
    .single();

  if (serverError || !server) return null;

  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("server_id", serverId)
    .order("created_at", { ascending: true });

  return { server, channels: channels ?? [] };
}

export async function getChannel(
  supabase: Awaited<ReturnType<typeof createClient>>,
  serverId: string,
  channelId: string
): Promise<Channel | null> {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .eq("server_id", serverId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getChannelMessages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  channelId: string
): Promise<MessageWithProfile[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*, profile:profiles(*)")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error || !data) return [];
  return data as unknown as MessageWithProfile[];
}

export async function getServerMemberProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  serverId: string
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("server_members")
    .select("profile:profiles(*)")
    .eq("server_id", serverId);

  if (error || !data) return [];
  return data
    .map((row) => (row as unknown as { profile: Profile }).profile)
    .filter(Boolean);
}

export async function getForumPosts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  currentProfileId: string
): Promise<ForumPostWithMeta[]> {
  const { data: posts, error } = await supabase
    .from("forum_posts")
    .select("*, profile:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !posts || posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);

  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase.from("forum_post_likes").select("post_id, profile_id").in("post_id", postIds),
    supabase.from("forum_comments").select("post_id").in("post_id", postIds),
  ]);

  const likeCounts = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const like of likes ?? []) {
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) ?? 0) + 1);
    if (like.profile_id === currentProfileId) likedByMe.add(like.post_id);
  }

  const commentCounts = new Map<string, number>();
  for (const comment of comments ?? []) {
    commentCounts.set(comment.post_id, (commentCounts.get(comment.post_id) ?? 0) + 1);
  }

  return (posts as unknown as (ForumPostWithMeta & { profile: Profile })[]).map((post) => ({
    ...post,
    like_count: likeCounts.get(post.id) ?? 0,
    comment_count: commentCounts.get(post.id) ?? 0,
    liked_by_me: likedByMe.has(post.id),
  }));
}

export async function getForumPost(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  currentProfileId: string
): Promise<{ post: ForumPostWithMeta; comments: ForumCommentNode[] } | null> {
  const { data: post, error } = await supabase
    .from("forum_posts")
    .select("*, profile:profiles(*)")
    .eq("id", postId)
    .single();

  if (error || !post) return null;

  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase.from("forum_post_likes").select("profile_id").eq("post_id", postId),
    supabase
      .from("forum_comments")
      .select("*, profile:profiles(*)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true }),
  ]);

  const postWithMeta: ForumPostWithMeta = {
    ...(post as unknown as ForumPostWithMeta),
    like_count: likes?.length ?? 0,
    comment_count: comments?.length ?? 0,
    liked_by_me: (likes ?? []).some((l) => l.profile_id === currentProfileId),
  };

  return {
    post: postWithMeta,
    comments: buildCommentTree((comments ?? []) as unknown as ForumCommentWithProfile[]),
  };
}

export function buildCommentTree(
  comments: ForumCommentWithProfile[]
): ForumCommentNode[] {
  const nodes = new Map<string, ForumCommentNode>();
  const roots: ForumCommentNode[] = [];

  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id)!;
    if (comment.parent_id && nodes.has(comment.parent_id)) {
      nodes.get(comment.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
