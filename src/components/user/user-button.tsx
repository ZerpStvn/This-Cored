"use client";

import { useState } from "react";
import { LogOut, UserPen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProfileDialog } from "@/components/user/edit-profile-dialog";
import { signOutAction } from "@/lib/actions/servers";
import type { Profile } from "@/lib/supabase/types";

export function UserButton({ profile }: { profile: Profile }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-black/20 p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex flex-1 items-center gap-2 rounded-md px-1 py-1 text-left transition hover:bg-white/5">
            <Avatar className="size-8">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-indigo-500 text-xs text-white">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium text-white/90">
              {profile.username}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <UserPen className="size-4" />
            Edit profile
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOutAction()}
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileDialog profile={profile} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
