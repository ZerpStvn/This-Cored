import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { joinServerByInvite } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default async function InvitePage({
  params,
}: PageProps<"/invite/[inviteCode]">) {
  const { inviteCode } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0b0d12] px-6 text-center text-white">
        <h1 className="text-xl font-bold">You&apos;ve been invited to This Cored</h1>
        <p className="max-w-sm text-sm text-white/50">
          Log in or create an account to accept this invite.
        </p>
        <div className="flex gap-3">
          <Button asChild className="bg-indigo-500 text-white hover:bg-indigo-400">
            <Link href={`/login?redirectTo=/invite/${inviteCode}`}>Log in</Link>
          </Button>
          <Button asChild variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
            <Link href={`/register?redirectTo=/invite/${inviteCode}`}>Sign up</Link>
          </Button>
        </div>
      </main>
    );
  }

  const { server, error } = await joinServerByInvite(supabase, inviteCode);

  if (server) {
    redirect(`/servers/${server.id}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0b0d12] px-6 text-center text-white">
      <p className="text-white/60">{error ?? "Something went wrong."}</p>
      <Button asChild className="bg-indigo-500 text-white hover:bg-indigo-400">
        <Link href="/servers">Back to servers</Link>
      </Button>
    </main>
  );
}
