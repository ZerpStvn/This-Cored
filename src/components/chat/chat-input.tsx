"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Paperclip, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_ATTACHMENT_BYTES,
  formatBytes,
  uploadAttachment,
  validateAttachmentFile,
} from "@/lib/storage";

export function ChatInput({
  channelId,
  channelName,
  profileId,
}: {
  channelId: string;
  channelName: string;
  profileId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    try {
      validateAttachmentFile(selected);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid file.");
      e.target.value = "";
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    e.target.value = "";
  }

  function clearFile() {
    setFile(null);
    setPreviewUrl(null);
  }

  function sendMessage() {
    const content = value.trim();
    if ((!content && !file) || isPending) return;

    const pendingFile = file;
    setValue("");
    clearFile();

    startTransition(async () => {
      const supabase = createClient();

      let attachment: { url: string; type: "image" | "video" } | null = null;
      if (pendingFile) {
        try {
          attachment = await uploadAttachment(profileId, pendingFile);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Upload failed.");
          setValue(content);
          setFile(pendingFile);
          return;
        }
      }

      const { error } = await supabase.from("messages").insert({
        channel_id: channelId,
        profile_id: profileId,
        content,
        attachment_url: attachment?.url ?? null,
        attachment_type: attachment?.type ?? null,
      });

      if (error) {
        toast.error("Message failed to send.");
        setValue(content);
      }
    });
  }

  return (
    <div className="px-4 pb-4">
      {previewUrl && file && (
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/5 p-2">
          {file.type.startsWith("image/") ? (
            <Image
              src={previewUrl}
              alt="Attachment preview"
              width={48}
              height={48}
              className="size-12 rounded-md object-cover"
              unoptimized
            />
          ) : (
            <video src={previewUrl} className="size-12 rounded-md object-cover" muted />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-white/70">{file.name}</p>
            <p className="text-[11px] text-white/40">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 rounded-lg bg-white/5 px-4 py-2.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mb-0.5 text-white/40 transition hover:text-white/80"
          title={`Attach a file (max ${formatBytes(MAX_ATTACHMENT_BYTES)})`}
        >
          <Paperclip className="size-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={`Message #${channelName}`}
          rows={1}
          className="max-h-40 min-h-0 resize-none border-0 bg-transparent p-0 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
