"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message, MessageWithProfile, Profile } from "@/lib/supabase/types";

export function ChatMessages({
  channelId,
  channelName,
  initialMessages,
  memberProfiles,
  currentProfileId,
}: {
  channelId: string;
  channelName: string;
  initialMessages: MessageWithProfile[];
  memberProfiles: Profile[];
  currentProfileId: string;
}) {
  const [messages, setMessages] = useState<MessageWithProfile[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const profileMap = useRef(new Map(memberProfiles.map((p) => [p.id, p])));

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          let profile = profileMap.current.get(newMessage.profile_id);

          if (!profile) {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", newMessage.profile_id)
              .single();
            if (data) {
              profile = data;
              profileMap.current.set(data.id, data);
            }
          }

          if (!profile) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, { ...newMessage, profile: profile! }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center text-white/30">
          <p className="text-sm">No messages yet in #{channelName}.</p>
          <p className="text-xs">Be the first to say something.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {messages.map((message) => {
          const isOwn = message.profile_id === currentProfileId;
          return (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar className="mt-0.5 size-9 shrink-0">
                <AvatarImage src={message.profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-indigo-500 text-xs text-white">
                  {message.profile?.username?.slice(0, 2).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-sm font-semibold ${isOwn ? "text-indigo-300" : "text-white"}`}
                  >
                    {message.profile?.username ?? "Unknown"}
                  </span>
                  <span className="text-[11px] text-white/30">
                    {format(new Date(message.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                {message.content && (
                  <p className="text-sm break-words whitespace-pre-wrap text-white/80">
                    {message.content}
                  </p>
                )}
                {message.attachment_url && (
                  <div className="mt-1.5 max-w-sm overflow-hidden rounded-lg border border-white/10">
                    {message.attachment_type === "video" ? (
                      <video
                        src={message.attachment_url}
                        controls
                        className="max-h-80 w-full bg-black"
                      />
                    ) : (
                      <a href={message.attachment_url} target="_blank" rel="noreferrer">
                        <Image
                          src={message.attachment_url}
                          alt="Attachment"
                          width={400}
                          height={300}
                          className="max-h-80 w-full object-cover"
                          unoptimized
                        />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
