import Link from "next/link";
import { CreateServerForm } from "@/components/server/create-server-form";

export default function NewServerPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-white">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="mb-1 text-center text-lg font-bold">
          Create your server
        </h1>
        <p className="mb-6 text-center text-sm text-white/50">
          Give your community a home. You can invite others once it&apos;s
          created.
        </p>
        <CreateServerForm />
        <p className="mt-4 text-center text-sm text-white/50">
          Have an invite instead?{" "}
          <Link href="/servers/join" className="text-indigo-400 hover:underline">
            Join a server
          </Link>
        </p>
      </div>
    </main>
  );
}
