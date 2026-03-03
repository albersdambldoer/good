"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../lib/apiClient";
import type { Profile as ProfileType, MeResponse, Experience, Education, Language } from "../../../lib/types";

const emptyProfile: ProfileType = {
  name: "",
  headline: "",
  location: "",
  phone: "",
  social: {},
  languages: [],
  skills: [],
  experiences: [],
  educations: [],
};

function normalizeProfile(p: MeResponse["profile"]): ProfileType {
  return {
    name: p?.name ?? "",
    headline: p?.headline ?? "",
    location: p?.location ?? "",
    phone: p?.phone ?? "",
    social: p?.social ?? {},
    languages: Array.isArray(p?.languages) ? p.languages.map((l) => ({ name: l.name ?? "", level: l.level ?? "" })) : [],
    skills: Array.isArray(p?.skills) ? p.skills : [],
    experiences: Array.isArray(p?.experiences)
      ? p.experiences.map((e: any) => ({
          company: e.company ?? "",
          role: e.role ?? "",
          location: e.location,
          startDate: e.startDate ? (typeof e.startDate === "string" ? e.startDate.slice(0, 10) : "") : "",
          endDate: e.endDate ? (typeof e.endDate === "string" ? e.endDate.slice(0, 10) : undefined) : undefined,
          bullets: Array.isArray(e.bullets) ? e.bullets : [],
          stack: e.stack,
        }))
      : [],
    educations: Array.isArray(p?.educations)
      ? p.educations.map((e: any) => ({
          school: e.school ?? "",
          degree: e.degree ?? "",
          startDate: e.startDate ? (typeof e.startDate === "string" ? e.startDate.slice(0, 10) : "") : "",
          endDate: e.endDate ? (typeof e.endDate === "string" ? e.endDate.slice(0, 10) : undefined) : undefined,
        }))
      : [],
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileType>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      .then((data) => setProfile(normalizeProfile(data.profile)))
      .catch((err) => {
        if (err instanceof Error && err.message.includes("401")) {
          router.replace("/auth/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [mounted, router]);

  function updateProfile(partial: Partial<ProfileType>) {
    setProfile((prev) => ({ ...prev, ...partial }));
  }

  function updateSocial(key: "linkedin" | "github" | "website", value: string) {
    setProfile((prev) => ({
      ...prev,
      social: { ...prev.social, [key]: value || undefined },
    }));
  }

  function addExperience() {
    setProfile((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { company: "", role: "", startDate: "", bullets: [] }],
    }));
  }

  function updateExperience(i: number, partial: Partial<Experience>) {
    setProfile((prev) => {
      const next = [...prev.experiences];
      next[i] = { ...next[i], ...partial };
      return { ...prev, experiences: next };
    });
  }

  function removeExperience(i: number) {
    setProfile((prev) => ({ ...prev, experiences: prev.experiences.filter((_, j) => j !== i) }));
  }

  function addEducation() {
    setProfile((prev) => ({
      ...prev,
      educations: [...prev.educations, { school: "", degree: "", startDate: "" }],
    }));
  }

  function updateEducation(i: number, partial: Partial<Education>) {
    setProfile((prev) => {
      const next = [...prev.educations];
      next[i] = { ...next[i], ...partial };
      return { ...prev, educations: next };
    });
  }

  function removeEducation(i: number) {
    setProfile((prev) => ({ ...prev, educations: prev.educations.filter((_, j) => j !== i) }));
  }

  function addLanguage() {
    setProfile((prev) => ({ ...prev, languages: [...prev.languages, { name: "", level: "" }] }));
  }

  function updateLanguage(i: number, partial: Partial<Language>) {
    setProfile((prev) => {
      const next = [...prev.languages];
      next[i] = { ...next[i], ...partial };
      return { ...prev, languages: next };
    });
  }

  function removeLanguage(i: number) {
    setProfile((prev) => ({ ...prev, languages: prev.languages.filter((_, j) => j !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const toSend = {
        ...profile,
        experiences: profile.experiences.map((e) => ({
          ...e,
          startDate: e.startDate ? new Date(e.startDate).toISOString() : new Date().toISOString(),
          endDate: e.endDate ? new Date(e.endDate).toISOString() : undefined,
        })),
        educations: profile.educations.map((e) => ({
          ...e,
          startDate: e.startDate ? new Date(e.startDate).toISOString() : new Date().toISOString(),
          endDate: e.endDate ? new Date(e.endDate).toISOString() : undefined,
        })),
      };
      const data = await api<{ profile: ProfileType }>("/me/profile", {
        method: "PUT",
        body: JSON.stringify({ profile: toSend }),
      });
      setProfile(normalizeProfile(data.profile as MeResponse["profile"]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <p className="text-zinc-400">Loading profile…</p>
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
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-zinc-400">Update your profile. This data is used when generating resumes.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-10">
          {/* Basics */}
          <section className="space-y-4">
            <h2 className="text-lg font-medium text-zinc-200">Basics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Headline</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => updateProfile({ headline: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => updateProfile({ location: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => updateProfile({ phone: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
            </div>
          </section>

          {/* Social */}
          <section className="space-y-4">
            <h2 className="text-lg font-medium text-zinc-200">Social & links</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={profile.social?.linkedin ?? ""}
                  onChange={(e) => updateSocial("linkedin", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">GitHub</label>
                <input
                  type="url"
                  value={profile.social?.github ?? ""}
                  onChange={(e) => updateSocial("github", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Website</label>
                <input
                  type="url"
                  value={profile.social?.website ?? ""}
                  onChange={(e) => updateSocial("website", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-4">
            <h2 className="text-lg font-medium text-zinc-200">Skills</h2>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Comma-separated</label>
              <input
                type="text"
                value={profile.skills.join(", ")}
                onChange={(e) => updateProfile({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                placeholder="JavaScript, TypeScript, React, Node.js"
              />
            </div>
          </section>

          {/* Languages */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-200">Languages</h2>
              <button type="button" onClick={addLanguage} className="text-sm text-indigo-400 hover:text-indigo-300">
                + Add
              </button>
            </div>
            {profile.languages.map((lang, i) => (
              <div key={i} className="flex gap-3 items-end">
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) => updateLanguage(i, { name: e.target.value })}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  placeholder="Language"
                />
                <input
                  type="text"
                  value={lang.level}
                  onChange={(e) => updateLanguage(i, { level: e.target.value })}
                  className="w-28 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  placeholder="Level"
                />
                <button type="button" onClick={() => removeLanguage(i)} className="text-zinc-500 hover:text-red-400 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </section>

          {/* Experience */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-200">Experience</h2>
              <button type="button" onClick={addExperience} className="text-sm text-indigo-400 hover:text-indigo-300">
                + Add
              </button>
            </div>
            {profile.experiences.map((exp, i) => (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(i, { company: e.target.value })}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExperience(i, { role: e.target.value })}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                    placeholder="Role"
                  />
                  <input
                    type="text"
                    value={exp.location ?? ""}
                    onChange={(e) => updateExperience(i, { location: e.target.value || undefined })}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                    placeholder="Location (optional)"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(i, { startDate: e.target.value })}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                    />
                    <input
                      type="date"
                      value={exp.endDate ?? ""}
                      onChange={(e) => updateExperience(i, { endDate: e.target.value || undefined })}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                      placeholder="End"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Bullet points (one per line)</label>
                  <textarea
                    value={exp.bullets.join("\n")}
                    onChange={(e) => updateExperience(i, { bullets: e.target.value.split("\n").filter(Boolean) })}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                    placeholder="Achievement or responsibility..."
                  />
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => removeExperience(i)} className="text-sm text-zinc-500 hover:text-red-400">
                    Remove experience
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Education */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-200">Education</h2>
              <button type="button" onClick={addEducation} className="text-sm text-indigo-400 hover:text-indigo-300">
                + Add
              </button>
            </div>
            {profile.educations.map((edu, i) => (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 flex flex-wrap gap-3 items-end">
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(i, { school: e.target.value })}
                  className="min-w-[180px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  placeholder="School"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(i, { degree: e.target.value })}
                  className="min-w-[180px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  placeholder="Degree"
                />
                <input
                  type="date"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(i, { startDate: e.target.value })}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                />
                <input
                  type="date"
                  value={edu.endDate ?? ""}
                  onChange={(e) => updateEducation(i, { endDate: e.target.value || undefined })}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                />
                <button type="button" onClick={() => removeEducation(i)} className="text-sm text-zinc-500 hover:text-red-400">
                  Remove
                </button>
              </div>
            ))}
          </section>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-indigo-400 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
            <Link href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
