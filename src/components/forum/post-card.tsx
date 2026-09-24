import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikeButton } from "@/components/forum/like-button";
import type { ForumPostWithMeta } from "@/lib/supabase/types";

export function PostCard({
  post,
  currentProfileId,
}: {
  post: ForumPostWithMeta;
  currentProfileId: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-2 flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarImage src={post.profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-indigo-500 text-[10px] text-white">
            {post.profile?.username?.slice(0, 2).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium text-white/70">
          {post.profile?.username ?? "Unknown"}
        </span>
        <span className="text-xs text-white/30">
          &middot; {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </span>
      </div>

      <Link href={`/forum/${post.id}`} className="block">
        <h2 className="text-base font-semibold text-white hover:text-indigo-300">
          {post.title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-white/50">{post.content}</p>
        {post.attachment_url && (
          <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg border border-white/10 bg-black">
            {post.attachment_type === "video" ? (
              <>
                <video
                  src={post.attachment_url}
                  className="size-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <PlayCircle className="size-10 text-white" />
                </div>
              </>
            ) : (
              <Image
                src={post.attachment_url}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            )}
          </div>
        )}
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <LikeButton
          postId={post.id}
          profileId={currentProfileId}
          initialLiked={post.liked_by_me}
          initialCount={post.like_count}
        />
        <Link
          href={`/forum/${post.id}`}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white/50 hover:bg-white/5 hover:text-white/80"
        >
          <MessageCircle className="size-3.5" />
          {post.comment_count}
        </Link>
      </div>
    </div>
  );
}
