"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/apiClient";

export default function Home() {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">(
    "checking",
  );

  useEffect(() => {
    api<{ status: string }>("/health")
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex h-screen max-w-5xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold">
              RB
            </span>
            <span className="text-sm font-medium text-zinc-300">
              Resume Builder
            </span>
          </div>
          <div className="flex gap-3 text-sm">
            <button className="rounded-full border border-zinc-700 px-4 py-1.5 font-medium text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900">
              Sign in
            </button>
            <button className="rounded-full bg-indigo-500 px-4 py-1.5 font-medium text-zinc-50 hover:bg-indigo-400">
              Get started
            </button>
          </div>
        </header>

        <main className="mt-16 grid flex-1 gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <section className="flex flex-col justify-center gap-6">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
              Build ATS‑friendly resumes with a clean, focused workflow.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
              Save your profile once, generate tailored resumes for each job,
              and keep everything organised in a simple dashboard. Optional AI
              support when an API key is configured.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 md:text-sm">
              <span className="rounded-full border border-zinc-800 px-3 py-1">
                ✓ Role‑based access (user & admin)
              </span>
              <span className="rounded-full border border-zinc-800 px-3 py-1">
                ✓ Resume manager with filters & search
              </span>
              <span className="rounded-full border border-zinc-800 px-3 py-1">
                ✓ Print‑ready PDF layouts
              </span>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">
                  Your next resume
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
                  style={{
                    backgroundColor:
                      apiStatus === "ok"
                        ? "rgb(22, 163, 74)"
                        : apiStatus === "error"
                          ? "rgb(220, 38, 38)"
                          : "rgb(39, 39, 42)",
                  }}
                >
                  {apiStatus === "checking"
                    ? "Checking API..."
                    : apiStatus === "ok"
                      ? "API online"
                      : "API offline"}
                </span>
              </div>
              <div className="mt-4 space-y-3 rounded-xl bg-zinc-950/60 p-4 text-xs text-zinc-300">
                <div className="h-2 w-24 rounded-full bg-zinc-700" />
                <div className="flex gap-3">
                  <div className="h-2 w-16 rounded-full bg-zinc-800" />
                  <div className="h-2 w-10 rounded-full bg-zinc-900" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-20 rounded-full bg-zinc-700" />
                  <div className="h-2 w-full rounded-full bg-zinc-900" />
                  <div className="h-2 w-5/6 rounded-full bg-zinc-900" />
                  <div className="h-2 w-4/6 rounded-full bg-zinc-900" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-24 rounded-full bg-zinc-700" />
                  <div className="h-2 w-full rounded-full bg-zinc-900" />
                  <div className="h-2 w-5/6 rounded-full bg-zinc-900" />
                  <div className="h-2 w-4/6 rounded-full bg-zinc-900" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
