const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message && typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // ignore if response is not JSON
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

