"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { joinServerByInvite } from "@/lib/data";
import type { ChannelType, Server } from "@/lib/supabase/types";

export async function createServerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Server name is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("create_server", { _name: name })
    .single<Server>();

  if (error || !data) {
    return { error: error?.message ?? "Could not create server." };
  }

  revalidatePath("/servers", "layout");
  redirect(`/servers/${data.id}`);
}

export async function joinServerByInviteAction(inviteCode: string) {
  const supabase = await createClient();
  const { server, error } = await joinServerByInvite(supabase, inviteCode);

  if (error || !server) {
    return { error: error ?? "Invalid or expired invite." };
  }

  revalidatePath("/servers", "layout");
  redirect(`/servers/${server.id}`);
}

export async function createChannelAction(serverId: string, formData: FormData) {
  const rawType = String(formData.get("type") ?? "text");
  const type: ChannelType = rawType === "voice" ? "voice" : "text";

  const rawName = String(formData.get("name") ?? "").trim();
  const name =
    type === "text" ? rawName.toLowerCase().replace(/\s+/g, "-") : rawName;

  if (!name) {
    return { error: "Channel name is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("channels")
    .insert({ server_id: serverId, name, type })
    .select()
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create channel." };
  }

  revalidatePath(`/servers/${serverId}`, "layout");
  redirect(`/servers/${serverId}/channels/${data.id}`);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
