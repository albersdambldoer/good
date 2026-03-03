"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../lib/apiClient";
import type { MeResponse } from "../../lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    api<MeResponse>("/me", { method: "GET" })
      .then(setMe)
      .catch(() => {
        localStorage.removeItem("token");
        router.replace("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [mounted, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <p className="text-zinc-400">Loading…</p>
      </div>
    );
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return null;

  const profileComplete =
    me?.profile &&
    me.profile.name &&
    (me.profile.headline || me.profile.location || me.profile.phone || (me.profile.skills?.length ?? 0) > 0);

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
          <div className="flex items-center gap-3 text-sm">
            {me?.email && (
              <span className="text-zinc-500">{me.email}</span>
            )}
            <Link
              href="/auth/login"
              className="rounded-full border border-zinc-700 px-4 py-1.5 font-medium text-zinc-200 hover:bg-zinc-900"
              onClick={() => localStorage.removeItem("token")}
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-zinc-50">Dashboard</h1>
        <p className="mt-2 text-zinc-400">
          Manage your profile and generate tailored resumes for each job.
        </p>
        {!profileComplete && me?.profile && (
          <p className="mt-3 text-sm text-amber-400/90">
            Complete your <Link href="/dashboard/profile" className="underline hover:no-underline">profile</Link> (headline, location, skills) for better resume output.
          </p>
        )}
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
