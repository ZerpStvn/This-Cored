"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LikeButton({
  postId,
  profileId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  profileId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (isPending) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const supabase = createClient();
      const { error } = nextLiked
        ? await supabase.from("forum_post_likes").insert({ post_id: postId, profile_id: profileId })
        : await supabase
            .from("forum_post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("profile_id", profileId);

      if (error) {
        setLiked(!nextLiked);
        setCount((c) => c + (nextLiked ? -1 : 1));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition",
        liked
          ? "bg-rose-500/15 text-rose-400"
          : "text-white/50 hover:bg-white/5 hover:text-white/80"
      )}
    >
      <Heart className={cn("size-3.5", liked && "fill-rose-400")} />
      {count}
    </button>
  );
}
