"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../../lib/apiClient";
import type { Resume, ResumeContent, ResumeStyle } from "../../../../lib/types";

export default function ResumeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [mounted, setMounted] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editContent, setEditContent] = useState<ResumeContent | null>(null);
  const [editStyle, setEditStyle] = useState<ResumeStyle | null>(null);
  const [jobLink, setJobLink] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id || typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    api<Resume>(`/resumes/${id}`, { method: "GET" })
      .then((r) => {
        setResume(r);
        setEditContent(r.content);
        setEditStyle(r.style);
        setJobLink(r.jobLink ?? "");
      })
      .catch((err) => {
        if (err instanceof Error && err.message.includes("Unauthorized")) {
          router.replace("/auth/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load resume");
      })
      .finally(() => setLoading(false));
  }, [mounted, id, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !resume) return;
    setError("");
    setSaving(true);
    try {
      const updated = await api<Resume>(`/resumes/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          content: editContent ?? resume.content,
          style: editStyle ?? resume.style,
          jobLink: jobLink || undefined,
        }),
      });
      setResume(updated);
      setEditContent(updated.content);
      setEditStyle(updated.style);
      setJobLink(updated.jobLink ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save resume");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || !id) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <p className="text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <p className="text-zinc-400">Loading resume…</p>
      </div>
    );
  }

  if (error && !resume) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <Link href="/dashboard/resumes" className="text-indigo-400 hover:underline">
          ← Back to resumes
        </Link>
      </div>
    );
  }

  if (!resume) return null;

  const content = editContent ?? resume.content;
  const style = editStyle ?? resume.style;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/dashboard/resumes" className="text-sm font-medium text-zinc-300 hover:text-zinc-100">
            ← My resumes
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold">{resume.title}</h1>
        {resume.jobDescription && (
          <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{resume.jobDescription}</p>
        )}

        <form onSubmit={handleSave} className="mt-8 space-y-8">
          <section>
            <h2 className="text-lg font-medium text-zinc-200 mb-3">Job link</h2>
            <input
              type="url"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              className="w-full max-w-xl rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              placeholder="https://..."
            />
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-200 mb-3">Summary</h2>
            <textarea
              value={(content.summary ?? []).join("\n")}
              onChange={(e) =>
                setEditContent((prev) => ({
                  ...prev!,
                  summary: e.target.value.split("\n").filter(Boolean),
                }))
              }
              rows={4}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            />
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-200 mb-3">Skills</h2>
            <input
              type="text"
              value={(content.skills ?? []).join(", ")}
              onChange={(e) =>
                setEditContent((prev) => ({
                  ...prev!,
                  skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                }))
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              placeholder="Comma-separated"
            />
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-200 mb-3">Style</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Font size</label>
                <input
                  type="number"
                  min={10}
                  max={24}
                  value={style.fontSize}
                  onChange={(e) =>
                    setEditStyle((prev) => (prev ? { ...prev, fontSize: Number(e.target.value) } : null))
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Layout</label>
                <select
                  value={style.layout}
                  onChange={(e) =>
                    setEditStyle((prev) =>
                      prev ? { ...prev, layout: e.target.value as "one-column" | "two-column" } : null
                    )
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                >
                  <option value="one-column">One column</option>
                  <option value="two-column">Two column</option>
                </select>
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-indigo-400 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <Link
              href="/dashboard/resumes"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
            >
              Back to list
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
