"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { MAX_AVATAR_BYTES, formatBytes, uploadAvatar, validateAvatarFile } from "@/lib/storage";
import type { Profile } from "@/lib/supabase/types";

export function EditProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(profile.username);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateAvatarFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid file.");
      e.target.value = "";
      return;
    }

    setError(null);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Username can't be empty.");
      return;
    }

    startTransition(async () => {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar(profile.id, avatarFile);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed.");
          return;
        }
      }

      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ username: trimmedUsername, avatar_url: avatarUrl })
        .eq("id", profile.id);

      if (error) {
        setError(error.message);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#12141c] text-white">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative"
            >
              <Avatar className="size-20">
                <AvatarImage src={previewUrl ?? profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-indigo-500 text-lg text-white">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
                <Pencil className="size-5 text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-white/40">Max {formatBytes(MAX_AVATAR_BYTES)}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={32}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-500 text-white hover:bg-indigo-400"
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
