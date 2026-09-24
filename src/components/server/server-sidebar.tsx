import Link from "next/link";
import { Hash, Volume2 } from "lucide-react";
import type { Channel, Profile, Server } from "@/lib/supabase/types";
import { ServerHeader } from "@/components/server/server-header";
import { CreateChannelDialog } from "@/components/server/create-channel-dialog";
import { UserButton } from "@/components/user/user-button";

export function ServerSidebar({
  server,
  channels,
  activeChannelId,
  profile,
  isOwner,
}: {
  server: Server;
  channels: Channel[];
  activeChannelId?: string;
  profile: Profile;
  isOwner: boolean;
}) {
  // Treat anything that isn't explicitly "voice" as text, so a channel row
  // never silently disappears if the DB schema is ahead of/behind the app
  // (e.g. the 0004 migration hasn't been run and `type` doesn't exist yet).
  const voiceChannels = channels.filter((c) => c.type === "voice");
  const textChannels = channels.filter((c) => c.type !== "voice");

  return (
    <aside className="flex h-full w-60 flex-col bg-[#0f1117]">
      <ServerHeader server={server} />

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <ChannelGroup
          label="Text channels"
          channels={textChannels}
          serverId={server.id}
          activeChannelId={activeChannelId}
          isOwner={isOwner}
        />
        <ChannelGroup
          label="Voice channels"
          channels={voiceChannels}
          serverId={server.id}
          activeChannelId={activeChannelId}
          isOwner={isOwner}
          className="mt-4"
        />
      </div>

      <div className="p-2">
        <UserButton profile={profile} />
      </div>
    </aside>
  );
}

function ChannelGroup({
  label,
  channels,
  serverId,
  activeChannelId,
  isOwner,
  className,
}: {
  label: string;
  channels: Channel[];
  serverId: string;
  activeChannelId?: string;
  isOwner: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="text-xs font-semibold tracking-wide text-white/40 uppercase">
          {label}
        </span>
        {isOwner && <CreateChannelDialog serverId={serverId} />}
      </div>

      <div className="flex flex-col gap-0.5">
        {channels.map((channel) => {
          const isActive = channel.id === activeChannelId;
          const Icon = channel.type === "voice" ? Volume2 : Hash;
          return (
            <Link
              key={channel.id}
              href={`/servers/${serverId}/channels/${channel.id}`}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <Icon className="size-4 shrink-0 text-white/30" />
              <span className="truncate">{channel.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
