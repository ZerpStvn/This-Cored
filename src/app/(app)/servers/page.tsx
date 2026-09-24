import { redirect } from "next/navigation";
import Link from "next/link";
import { requireProfile, getUserServers } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default async function ServersPage() {
  const { supabase } = await requireProfile();
  const servers = await getUserServers(supabase);

  if (servers.length > 0) {
    redirect(`/servers/${servers[0].id}`);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 text-white">
      <h1 className="text-2xl font-bold">Welcome to This Cored</h1>
      <p className="max-w-sm text-center text-sm text-white/50">
        You&apos;re not in any servers yet. Create one or join with an
        invite link to get started.
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-indigo-500 text-white hover:bg-indigo-400">
          <Link href="/servers/new">Create a server</Link>
        </Button>
        <Button asChild variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
          <Link href="/servers/join">Join a server</Link>
        </Button>
      </div>
    </main>
  );
}
