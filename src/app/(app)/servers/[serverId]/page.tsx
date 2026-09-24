import { notFound, redirect } from "next/navigation";
import { requireProfile, getServerWithChannels } from "@/lib/data";

export default async function ServerPage({
  params,
}: PageProps<"/servers/[serverId]">) {
  const { serverId } = await params;
  const { supabase } = await requireProfile();

  const data = await getServerWithChannels(supabase, serverId);
  if (!data) notFound();

  if (data.channels.length > 0) {
    redirect(`/servers/${serverId}/channels/${data.channels[0].id}`);
  }

  return (
    <div className="flex flex-1 items-center justify-center text-white/50">
      No channels yet.
    </div>
  );
}
