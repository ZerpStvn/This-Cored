import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthBackground } from "@/components/auth/auth-background";
import { QrPanel } from "@/components/auth/qr-panel";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <AuthBackground />

      <div className="flex w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#12141c]/90 shadow-2xl backdrop-blur-xl">
        <div className="flex w-full flex-col p-8 sm:w-96">
          <Link href="/" className="mb-1 text-center text-lg font-black">
            This <span className="text-indigo-400">Cored</span>
          </Link>
          <h1 className="mt-3 text-center text-2xl font-bold">Welcome back!</h1>
          <p className="mb-6 text-center text-sm text-white/50">
            We&apos;re so excited to see you again!
          </p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <QrPanel />
      </div>
    </main>
  );
}
