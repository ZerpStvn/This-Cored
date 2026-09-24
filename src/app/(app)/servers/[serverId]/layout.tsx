import { notFound } from "next/navigation";
import { requireProfile, getServerWithChannels } from "@/lib/data";
import { ServerSidebar } from "@/components/server/server-sidebar";

export default async function ServerLayout({
  children,
  params,
}: LayoutProps<"/servers/[serverId]">) {
  const { serverId } = await params;
  const { profile, supabase } = await requireProfile();

  const data = await getServerWithChannels(supabase, serverId);
  if (!data) notFound();

  const { server, channels } = data;

  return (
    <div className="flex flex-1 overflow-hidden">
      <ServerSidebar
        server={server}
        channels={channels}
        profile={profile}
        isOwner={server.owner_id === profile.id}
      />
      <div className="flex flex-1 flex-col overflow-hidden bg-[#15171e]">
        {children}
      </div>
    </div>
  );
}
