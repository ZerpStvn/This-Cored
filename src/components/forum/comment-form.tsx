"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createForumCommentAction } from "@/lib/actions/forum";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({
  postId,
  parentId,
  placeholder = "Add a comment...",
  autoFocus = false,
  onSuccess,
}: {
  postId: string;
  parentId: string | null;
  placeholder?: string;
  autoFocus?: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("content", content);

    startTransition(async () => {
      const result = await createForumCommentAction(postId, parentId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setContent("");
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        rows={2}
        className="resize-none text-sm"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        className="self-start bg-indigo-500 text-white hover:bg-indigo-400"
      >
        {isPending ? "Posting..." : "Reply"}
      </Button>
    </form>
  );
}
