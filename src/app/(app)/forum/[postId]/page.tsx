import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { requireProfile, getForumPost } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikeButton } from "@/components/forum/like-button";
import { CommentForm } from "@/components/forum/comment-form";
import { CommentThread } from "@/components/forum/comment-thread";

export default async function ForumPostPage({
  params,
}: PageProps<"/forum/[postId]">) {
  const { postId } = await params;
  const { profile, supabase } = await requireProfile();

  const result = await getForumPost(supabase, postId, profile.id);
  if (!result) notFound();

  const { post, comments } = result;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-[#15171e]">
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <Link
          href="/forum"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80"
        >
          <ArrowLeft className="size-4" />
          Back to forum
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarImage src={post.profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-indigo-500 text-xs text-white">
              {post.profile?.username?.slice(0, 2).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-white/70">
            {post.profile?.username ?? "Unknown"}
          </span>
          <span className="text-xs text-white/30">
            &middot; {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white">{post.title}</h1>
        <p className="mt-3 text-sm whitespace-pre-wrap text-white/80">{post.content}</p>

        {post.attachment_url && (
          <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black">
            {post.attachment_type === "video" ? (
              <video src={post.attachment_url} controls className="max-h-[32rem] w-full" />
            ) : (
              <Image
                src={post.attachment_url}
                alt=""
                width={800}
                height={600}
                unoptimized
                className="max-h-[32rem] w-full object-contain"
              />
            )}
          </div>
        )}

        <div className="mt-4 mb-8 flex items-center gap-2 border-b border-white/10 pb-6">
          <LikeButton
            postId={post.id}
            profileId={profile.id}
            initialLiked={post.liked_by_me}
            initialCount={post.like_count}
          />
        </div>

        <h2 className="mb-3 text-sm font-semibold text-white/70">
          {post.comment_count} {post.comment_count === 1 ? "reply" : "replies"}
        </h2>

        <div className="mb-6">
          <CommentForm postId={post.id} parentId={null} />
        </div>

        <CommentThread postId={post.id} comments={comments} />
      </div>
    </div>
  );
}
