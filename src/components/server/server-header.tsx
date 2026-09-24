"use client";

import { ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Server } from "@/lib/supabase/types";

export function ServerHeader({ server }: { server: Server }) {
  function copyInvite() {
    const url = `${window.location.origin}/invite/${server.invite_code}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied to clipboard");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-12 w-full items-center justify-between border-b border-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/[0.03]">
        <span className="truncate">{server.name}</span>
        <ChevronDown className="size-4 text-white/50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem onClick={copyInvite}>
          <Copy className="size-4" />
          Copy invite link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
