import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthBackground } from "@/components/auth/auth-background";

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <AuthBackground />

      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#12141c]/90 p-8 shadow-2xl backdrop-blur-xl">
        <Link href="/" className="mb-1 block text-center text-lg font-black">
          This <span className="text-indigo-400">Cored</span>
        </Link>
        <h1 className="mt-3 mb-6 text-center text-2xl font-bold">
          Set a new password
        </h1>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
