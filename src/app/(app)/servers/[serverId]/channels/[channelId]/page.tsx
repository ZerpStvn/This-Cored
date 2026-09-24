import { notFound } from "next/navigation";
import { Hash, Volume2 } from "lucide-react";
import {
  requireProfile,
  getChannel,
  getChannelMessages,
  getServerMemberProfiles,
} from "@/lib/data";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { VoiceChannelRoom } from "@/components/voice/voice-channel-room";

export default async function ChannelPage({
  params,
}: PageProps<"/servers/[serverId]/channels/[channelId]">) {
  const { serverId, channelId } = await params;
  const { profile, supabase } = await requireProfile();

  const channel = await getChannel(supabase, serverId, channelId);
  if (!channel) notFound();

  if (channel.type === "voice") {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-12 shrink-0 items-center gap-1.5 border-b border-white/5 px-4 text-white">
          <Volume2 className="size-5 text-white/40" />
          <span className="font-semibold">{channel.name}</span>
        </div>
        <VoiceChannelRoom
          key={channel.id}
          channelId={channel.id}
          channelName={channel.name}
          profile={profile}
        />
      </div>
    );
  }

  const [messages, memberProfiles] = await Promise.all([
    getChannelMessages(supabase, channelId),
    getServerMemberProfiles(supabase, serverId),
  ]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 items-center gap-1.5 border-b border-white/5 px-4 text-white">
        <Hash className="size-5 text-white/40" />
        <span className="font-semibold">{channel.name}</span>
      </div>

      <ChatMessages
        key={channel.id}
        channelId={channel.id}
        channelName={channel.name}
        initialMessages={messages}
        memberProfiles={memberProfiles}
        currentProfileId={profile.id}
      />

      <ChatInput
        key={channel.id}
        channelId={channel.id}
        channelName={channel.name}
        profileId={profile.id}
      />
    </div>
  );
}
