"use client";

import { useState, useTransition } from "react";
import { Plus, Hash, Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createChannelAction } from "@/lib/actions/servers";
import { cn } from "@/lib/utils";
import type { ChannelType } from "@/lib/supabase/types";

export function CreateChannelDialog({ serverId }: { serverId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ChannelType>("text");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-white/40 transition hover:text-white/80">
          <Plus className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#12141a] text-white">
        <DialogHeader>
          <DialogTitle>Create channel</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await createChannelAction(serverId, formData);
              if (result?.error) setError(result.error);
              else setOpen(false);
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label>Channel type</Label>
            <div className="flex gap-2">
              <TypeOption
                icon={<Hash className="size-4" />}
                label="Text"
                selected={type === "text"}
                onClick={() => setType("text")}
              />
              <TypeOption
                icon={<Volume2 className="size-4" />}
                label="Voice"
                selected={type === "voice"}
                onClick={() => setType("voice")}
              />
            </div>
            <input type="hidden" name="type" value={type} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="channel-name">Channel name</Label>
            <Input
              id="channel-name"
              name="name"
              placeholder={type === "voice" ? "General Voice" : "general"}
              required
              maxLength={64}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-500 text-white hover:bg-indigo-400"
            >
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TypeOption({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
        selected
          ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
          : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
