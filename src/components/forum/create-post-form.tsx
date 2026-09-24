"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { X, ImagePlus } from "lucide-react";
import { createForumPostAction } from "@/lib/actions/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_ATTACHMENT_BYTES,
  formatBytes,
  uploadAttachment,
  validateAttachmentFile,
} from "@/lib/storage";

export function CreatePostForm({ profileId }: { profileId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    try {
      validateAttachmentFile(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid file.");
      e.target.value = "";
      return;
    }

    setError(null);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          if (file) {
            try {
              const attachment = await uploadAttachment(profileId, file);
              formData.set("attachment_url", attachment.url);
              formData.set("attachment_type", attachment.type);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed.");
              return;
            }
          }

          const result = await createForumPostAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="flex w-full flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="What's on your mind?" required maxLength={200} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Share the details..."
          required
          rows={8}
          className="resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Image or video (optional)</Label>
        {previewUrl && file ? (
          <div className="relative w-fit">
            {file.type.startsWith("video/") ? (
              <video
                src={previewUrl}
                className="max-h-40 w-auto rounded-lg border border-white/10 object-cover"
                muted
              />
            ) : (
              <Image
                src={previewUrl}
                alt="Preview"
                width={200}
                height={140}
                unoptimized
                className="max-h-40 w-auto rounded-lg border border-white/10 object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute -top-2 -right-2 rounded-full bg-black/80 p-1 text-white hover:bg-black"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-3 text-sm text-white/50 transition hover:border-white/40 hover:text-white/80"
          >
            <ImagePlus className="size-4" />
            Add a file
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-white/30">Max {formatBytes(MAX_ATTACHMENT_BYTES)}</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="self-start bg-indigo-500 text-white hover:bg-indigo-400"
      >
        {isPending ? "Posting..." : "Post"}
      </Button>
    </form>
  );
}
