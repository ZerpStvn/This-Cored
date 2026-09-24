import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AuthBackground } from "@/components/auth/auth-background";
import { MessageSquare, Users, Zap } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/servers");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
      <AuthBackground />
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-indigo-300 uppercase">
        🇵🇭 PH Only
      </div>

      <h1 className="max-w-2xl text-5xl font-black tracking-tight sm:text-6xl">
        This <span className="text-indigo-400">Cored</span>
      </h1>

      <p className="mt-5 max-w-md text-balance text-base text-white/60">
        A private space to talk, hang out, and stay connected — built for the
        This Cored community.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="bg-indigo-500 text-white hover:bg-indigo-400"
        >
          <Link href="/register">Create an account</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/20"
        >
          <Link href="/login">Log in</Link>
        </Button>
      </div>

      <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        <Feature
          icon={<Users className="size-5" />}
          title="Servers"
          description="Create or join servers with an invite link."
        />
        <Feature
          icon={<MessageSquare className="size-5" />}
          title="Text channels"
          description="Organize conversations into channels."
        />
        <Feature
          icon={<Zap className="size-5" />}
          title="Real-time chat"
          description="Messages sync instantly for everyone online."
        />
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left">
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-white/50">{description}</p>
    </div>
  );
}
