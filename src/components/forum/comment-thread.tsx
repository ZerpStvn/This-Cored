"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentForm } from "@/components/forum/comment-form";
import type { ForumCommentNode } from "@/lib/supabase/types";

export function CommentThread({
  postId,
  comments,
}: {
  postId: string;
  comments: ForumCommentNode[];
}) {
  if (comments.length === 0) {
    return <p className="text-sm text-white/40">No replies yet. Start the thread.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} postId={postId} comment={comment} />
      ))}
    </div>
  );
}

function CommentItem({
  postId,
  comment,
}: {
  postId: string;
  comment: ForumCommentNode;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className="flex gap-3">
      <Avatar className="mt-0.5 size-8 shrink-0">
        <AvatarImage src={comment.profile?.avatar_url ?? undefined} />
        <AvatarFallback className="bg-indigo-500 text-xs text-white">
          {comment.profile?.username?.slice(0, 2).toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-white">
            {comment.profile?.username ?? "Unknown"}
          </span>
          <span className="text-[11px] text-white/30">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm break-words whitespace-pre-wrap text-white/80">
          {comment.content}
        </p>

        <button
          type="button"
          onClick={() => setReplying((r) => !r)}
          className="mt-1 text-xs font-medium text-white/40 hover:text-white/70"
        >
          {replying ? "Cancel" : "Reply"}
        </button>

        {replying && (
          <div className="mt-2">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              placeholder={`Reply to ${comment.profile?.username ?? "this comment"}...`}
              autoFocus
              onSuccess={() => setReplying(false)}
            />
          </div>
        )}

        {comment.children.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 border-l border-white/10 pl-4">
            {comment.children.map((child) => (
              <CommentItem key={child.id} postId={postId} comment={child} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
