"use client";

import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RemoteAudio } from "@/components/voice/remote-audio";
import { useVoiceChannel } from "@/lib/voice/use-voice-channel";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/supabase/types";

export function VoiceChannelRoom({
  channelId,
  channelName,
  profile,
}: {
  channelId: string;
  channelName: string;
  profile: Profile;
}) {
  const { joined, connecting, muted, error, participants, join, leave, toggleMute } =
    useVoiceChannel({
      channelId,
      profileId: profile.id,
      username: profile.username,
      avatarUrl: profile.avatar_url,
    });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10">
      {participants
        .filter((p) => !p.isLocal && p.stream)
        .map((p) => (
          <RemoteAudio key={p.profileId} stream={p.stream!} />
        ))}

      <div className="flex items-center gap-2 text-white/60">
        <Volume2 className="size-5" />
        <span className="text-sm font-medium">{channelName}</span>
      </div>

      {participants.length === 0 ? (
        <p className="text-sm text-white/30">No one&apos;s in this voice channel yet.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {participants.map((p) => (
            <div key={p.profileId} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "relative flex size-20 items-center justify-center rounded-full ring-2 ring-offset-4 ring-offset-[#15171e]",
                  p.muted ? "ring-transparent" : "ring-emerald-500/60"
                )}
              >
                <Avatar className="size-20">
                  <AvatarImage src={p.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-indigo-500 text-lg text-white">
                    {p.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {p.muted && (
                  <div className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-rose-500 ring-2 ring-[#15171e]">
                    <MicOff className="size-3.5 text-white" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-white/80">
                {p.username}
                {p.isLocal && " (you)"}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        {joined ? (
          <>
            <Button
              type="button"
              size="icon"
              onClick={toggleMute}
              className={cn(
                "rounded-full",
                muted
                  ? "bg-rose-500 text-white hover:bg-rose-400"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
            <Button
              type="button"
              onClick={leave}
              className="gap-2 rounded-full bg-rose-500 text-white hover:bg-rose-400"
            >
              <PhoneOff className="size-4" />
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={join}
            disabled={connecting}
            className="gap-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-400"
          >
            <Mic className="size-4" />
            {connecting ? "Joining..." : "Join Voice"}
          </Button>
        )}
      </div>
    </div>
  );
}
