"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export type VoiceParticipant = {
  profileId: string;
  username: string;
  avatarUrl: string | null;
  muted: boolean;
  isLocal: boolean;
  stream: MediaStream | null;
};

type PresenceMeta = {
  profile_id: string;
  username: string;
  avatar_url: string | null;
  muted: boolean;
};

type SignalPayload = {
  from: string;
  to: string;
  kind: "offer" | "answer" | "ice-candidate";
  data: RTCSessionDescriptionInit | RTCIceCandidateInit;
};

export function useVoiceChannel({
  channelId,
  profileId,
  username,
  avatarUrl,
}: {
  channelId: string;
  profileId: string;
  username: string;
  avatarUrl: string | null;
}) {
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);

  const realtimeRef = useRef<RealtimeChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const mutedRef = useRef(false);
  const joinedRef = useRef(false);

  const syncParticipants = useCallback(() => {
    const channel = realtimeRef.current;
    if (!channel) return;

    const state = channel.presenceState<PresenceMeta>();
    const next: VoiceParticipant[] = [];

    for (const metas of Object.values(state)) {
      const meta = metas[0];
      if (!meta) continue;
      const isLocal = meta.profile_id === profileId;
      next.push({
        profileId: meta.profile_id,
        username: meta.username,
        avatarUrl: meta.avatar_url,
        muted: meta.muted,
        isLocal,
        stream: isLocal ? null : remoteStreamsRef.current.get(meta.profile_id) ?? null,
      });
    }

    setParticipants(next);
  }, [profileId]);

  const closePeer = useCallback((otherId: string) => {
    peersRef.current.get(otherId)?.close();
    peersRef.current.delete(otherId);
    remoteStreamsRef.current.delete(otherId);
    pendingCandidatesRef.current.delete(otherId);
  }, []);

  const sendSignal = useCallback(
    (payload: SignalPayload) => {
      realtimeRef.current?.send({
        type: "broadcast",
        event: "webrtc-signal",
        payload,
      });
    },
    []
  );

  const getOrCreatePeer = useCallback(
    (otherId: string) => {
      let pc = peersRef.current.get(otherId);
      if (pc) return pc;

      pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peersRef.current.set(otherId, pc);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc!.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({
            from: profileId,
            to: otherId,
            kind: "ice-candidate",
            data: event.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (event) => {
        remoteStreamsRef.current.set(otherId, event.streams[0]);
        syncParticipants();
      };

      return pc;
    },
    [profileId, sendSignal, syncParticipants]
  );

  const connectTo = useCallback(
    async (otherId: string) => {
      const pc = getOrCreatePeer(otherId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ from: profileId, to: otherId, kind: "offer", data: offer });
    },
    [getOrCreatePeer, profileId, sendSignal]
  );

  const handleSignal = useCallback(
    async (payload: SignalPayload) => {
      if (payload.to !== profileId) return;

      if (payload.kind === "offer") {
        const pc = getOrCreatePeer(payload.from);
        await pc.setRemoteDescription(
          new RTCSessionDescription(payload.data as RTCSessionDescriptionInit)
        );
        const queued = pendingCandidatesRef.current.get(payload.from);
        if (queued) {
          for (const candidate of queued) await pc.addIceCandidate(candidate);
          pendingCandidatesRef.current.delete(payload.from);
        }
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ from: profileId, to: payload.from, kind: "answer", data: answer });
        return;
      }

      if (payload.kind === "answer") {
        const pc = peersRef.current.get(payload.from);
        if (!pc) return;
        await pc.setRemoteDescription(
          new RTCSessionDescription(payload.data as RTCSessionDescriptionInit)
        );
        const queued = pendingCandidatesRef.current.get(payload.from);
        if (queued) {
          for (const candidate of queued) await pc.addIceCandidate(candidate);
          pendingCandidatesRef.current.delete(payload.from);
        }
        return;
      }

      if (payload.kind === "ice-candidate") {
        const pc = peersRef.current.get(payload.from);
        const candidate = payload.data as RTCIceCandidateInit;
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(candidate);
        } else {
          const queue = pendingCandidatesRef.current.get(payload.from) ?? [];
          queue.push(candidate);
          pendingCandidatesRef.current.set(payload.from, queue);
        }
      }
    },
    [getOrCreatePeer, profileId, sendSignal]
  );

  const leave = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    for (const id of Array.from(peersRef.current.keys())) closePeer(id);

    const channel = realtimeRef.current;
    if (channel) {
      channel.untrack();
      const supabase = createClient();
      supabase.removeChannel(channel);
    }
    realtimeRef.current = null;

    joinedRef.current = false;
    setJoined(false);
    setParticipants([]);
    setMuted(false);
    mutedRef.current = false;
  }, [closePeer]);

  const join = useCallback(async () => {
    if (joinedRef.current || connecting) return;
    setConnecting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const supabase = createClient();
      const channel = supabase.channel(`voice:${channelId}`, {
        config: { presence: { key: profileId } },
      });
      realtimeRef.current = channel;

      channel
        .on("presence", { event: "sync" }, syncParticipants)
        .on("presence", { event: "join" }, ({ key }) => {
          // Deterministic tie-break so exactly one side offers per pair:
          // whichever profile id sorts first initiates the connection.
          if (key !== profileId && profileId < key) {
            void connectTo(key);
          }
          syncParticipants();
        })
        .on("presence", { event: "leave" }, ({ key }) => {
          if (key !== profileId) closePeer(key);
          syncParticipants();
        })
        .on(
          "broadcast",
          { event: "webrtc-signal" },
          ({ payload }: { payload: SignalPayload }) => {
            void handleSignal(payload);
          }
        );

      await new Promise<void>((resolve, reject) => {
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") resolve();
          else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            reject(new Error("Could not connect to voice channel."));
          }
        });
      });

      await channel.track({
        profile_id: profileId,
        username,
        avatar_url: avatarUrl,
        muted: false,
      } satisfies PresenceMeta);

      joinedRef.current = true;
      setJoined(true);
      syncParticipants();
    } catch (err) {
      leave();
      setError(
        err instanceof Error
          ? err.message
          : "Could not access your microphone."
      );
    } finally {
      setConnecting(false);
    }
  }, [
    avatarUrl,
    channelId,
    closePeer,
    connectTo,
    connecting,
    handleSignal,
    leave,
    profileId,
    syncParticipants,
    username,
  ]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    stream.getAudioTracks().forEach((track) => (track.enabled = !nextMuted));
    setMuted(nextMuted);
    realtimeRef.current?.track({
      profile_id: profileId,
      username,
      avatar_url: avatarUrl,
      muted: nextMuted,
    } satisfies PresenceMeta);
  }, [avatarUrl, profileId, username]);

  useEffect(() => {
    return () => {
      if (joinedRef.current) leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  return { joined, connecting, muted, error, participants, join, leave, toggleMute };
}
