"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../lib/apiClient";
import type { Resume } from "../../../lib/types";

export default function ResumesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stack, setStack] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [stackTags, setStackTags] = useState("");

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
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stack) params.set("stack", stack);
    const q = params.toString();
    api<Resume[]>(`/resumes${q ? `?${q}` : ""}`, { method: "GET" })
      .then(setResumes)
      .catch((err) => {
        if (err instanceof Error && err.message.includes("Unauthorized")) {
          router.replace("/auth/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load resumes");
      })
      .finally(() => setLoading(false));
  }, [mounted, search, stack, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api<Resume>("/resumes/generate", {
        method: "POST",
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          jobLink: jobLink || undefined,
          stackTags: stackTags ? stackTags.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        }),
      });
      setCreateOpen(false);
      setJobTitle("");
      setJobDescription("");
      setJobLink("");
      setStackTags("");
      setLoading(true);
      api<Resume[]>("/resumes", { method: "GET" })
        .then(setResumes)
        .finally(() => setLoading(false));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate resume");
    } finally {
      setCreating(false);
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <p className="text-zinc-400">Loading…</p>
      </div>
    );
  }

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">My resumes</h1>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-indigo-400"
          >
            Generate new resume
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description…"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 min-w-[200px]"
          />
          <input
            type="text"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder="Filter by stack tag"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 w-40"
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="mt-8 text-zinc-400">Loading resumes…</p>
        ) : resumes.length === 0 ? (
          <p className="mt-8 text-zinc-400">No resumes yet. Generate one from a job title and description.</p>
        ) : (
          <ul className="mt-8 space-y-3">
            {resumes.map((r) => (
              <li key={r._id}>
                <Link
                  href={`/dashboard/resumes/${r._id}`}
                  className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium text-zinc-100">{r.title}</h2>
                      <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{r.jobDescription}</p>
                      {r.stackTags && r.stackTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {r.stackTags.map((t) => (
                            <span key={t} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 shrink-0">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      {createOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-100">Generate resume</h2>
            <p className="mt-1 text-sm text-zinc-400">Enter the job details. Your profile will be used to build the resume.</p>
            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Job title *</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Job description *</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  placeholder="Paste the job description here..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Job link (optional)</label>
                <input
                  type="url"
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Stack tags (optional, comma-separated)</label>
                <input
                  type="text"
                  value={stackTags}
                  onChange={(e) => setStackTags(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-indigo-400 disabled:opacity-50"
                >
                  {creating ? "Generating…" : "Generate"}
                </button>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
