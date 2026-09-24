import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthBackground } from "@/components/auth/auth-background";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <AuthBackground />

      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#12141c]/90 p-8 shadow-2xl backdrop-blur-xl">
        <Link href="/" className="mb-1 block text-center text-lg font-black">
          This <span className="text-indigo-400">Cored</span>
        </Link>
        <h1 className="mt-3 mb-6 text-center text-2xl font-bold">
          Create your account
        </h1>
        <RegisterForm />
      </div>
    </main>
  );
}
