import Link from "next/link";
import { JoinServerForm } from "@/components/server/join-server-form";

export default function JoinServerPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-white">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="mb-1 text-center text-lg font-bold">Join a server</h1>
        <p className="mb-6 text-center text-sm text-white/50">
          Enter an invite code someone shared with you.
        </p>
        <JoinServerForm />
        <p className="mt-4 text-center text-sm text-white/50">
          Don&apos;t have one?{" "}
          <Link href="/servers/new" className="text-indigo-400 hover:underline">
            Create a server
          </Link>
        </p>
      </div>
    </main>
  );
}
