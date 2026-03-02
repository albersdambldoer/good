"use client";

import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-zinc-100">
            ← Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-zinc-400">Profile builder (experiences, education, skills) will go here.</p>
      </main>
    </div>
  );
}
