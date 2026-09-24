import { requireProfile, getUserServers } from "@/lib/data";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase } = await requireProfile();
  const servers = await getUserServers(supabase);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0d12]">
      <NavigationSidebar servers={servers} />
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
