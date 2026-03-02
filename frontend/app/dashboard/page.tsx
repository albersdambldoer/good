"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <p className="text-zinc-400">Loading…</p>
      </div>
    );
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    router.replace("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold">
              RB
            </span>
            <span className="text-sm font-medium text-zinc-300">Resume Builder</span>
          </Link>
          <div className="flex gap-3 text-sm">
            <Link
              href="/"
              className="rounded-full border border-zinc-700 px-4 py-1.5 font-medium text-zinc-200 hover:bg-zinc-900"
              onClick={() => {
                localStorage.removeItem("token");
              }}
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-zinc-50">Dashboard</h1>
        <p className="mt-2 text-zinc-400">
          You’re signed in. Profile, resume generator, and resume manager will go here.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/dashboard/profile"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/resumes"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
          >
            My resumes
          </Link>
        </div>
      </main>
    </div>
  );
}
