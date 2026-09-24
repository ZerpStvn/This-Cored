"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { Plus, Compass } from "lucide-react";
import type { Server } from "@/lib/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function NavigationSidebar({ servers }: { servers: Server[] }) {
  const params = useParams<{ serverId?: string }>();
  const pathname = usePathname();
  const isForumActive = pathname?.startsWith("/forum") ?? false;

  return (
    <nav className="flex h-full w-[72px] flex-col items-center gap-2 bg-[#05060a] py-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/forum" className="group relative flex size-12 items-center justify-center">
            <span
              className={cn(
                "absolute -left-3 w-1 rounded-r-full bg-white transition-all",
                isForumActive ? "h-8" : "h-2 scale-0 group-hover:scale-100"
              )}
            />
            <div
              className={cn(
                "flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-indigo-500 p-2 transition-all group-hover:rounded-xl",
                isForumActive && "rounded-xl"
              )}
            >
              <Image
                src="/mainlogo.png"
                alt="This Cored"
                width={48}
                height={48}
                className="size-full object-contain"
                priority
              />
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">This Cored — PH Only</TooltipContent>
      </Tooltip>

      <div className="my-1 h-px w-8 bg-white/10" />

      <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto">
        {servers.map((server) => {
          const isActive = params?.serverId === server.id;
          return (
            <Tooltip key={server.id}>
              <TooltipTrigger asChild>
                <Link
                  href={`/servers/${server.id}`}
                  className="group relative flex size-12 items-center justify-center"
                >
                  <span
                    className={cn(
                      "absolute -left-3 w-1 rounded-r-full bg-white transition-all",
                      isActive ? "h-8" : "h-2 scale-0 group-hover:scale-100"
                    )}
                  />
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-[#1c1f26] text-sm font-semibold text-white/80 transition-all group-hover:rounded-xl group-hover:bg-indigo-500 group-hover:text-white",
                      isActive && "rounded-xl bg-indigo-500 text-white"
                    )}
                  >
                    {server.image_url ? (
                      <Image
                        src={server.image_url}
                        alt={server.name}
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    ) : (
                      getInitials(server.name)
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{server.name}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/servers/new"
            className="flex size-12 items-center justify-center rounded-2xl bg-[#1c1f26] text-emerald-400 transition-all hover:rounded-xl hover:bg-emerald-500 hover:text-white"
          >
            <Plus className="size-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Add a server</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/servers/join"
            className="flex size-12 items-center justify-center rounded-2xl bg-[#1c1f26] text-indigo-300 transition-all hover:rounded-xl hover:bg-indigo-500 hover:text-white"
          >
            <Compass className="size-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Join a server</TooltipContent>
      </Tooltip>
    </nav>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
