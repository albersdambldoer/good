"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../lib/apiClient";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<{ token: string; user: { id: string; email: string; role: string } }>(
        "/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({ email, password, name }),
        }
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("token", res.token);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-2 justify-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold">
            RB
          </span>
          <span className="text-sm font-medium text-zinc-300">Resume Builder</span>
        </div>
        <h1 className="text-xl font-semibold text-center">Get started</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-zinc-400 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-500 py-2 text-sm font-medium text-zinc-50 hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-400 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
