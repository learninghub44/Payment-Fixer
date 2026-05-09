const BASE = "https://kuwesa-payment-api.onrender.com/api";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";

  // Handle non-JSON responses (e.g. Render cold-start HTML page)
  if (!contentType.includes("application/json")) {
    if (res.status === 503 || res.status === 502) {
      throw new Error("The server is starting up. Please wait 30 seconds and try again.");
    }
    throw new Error(`Unexpected response (${res.status}). The server may be starting up — please try again.`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),

  uploadPhoto: async (leaderId: string, file: File): Promise<{ photoUrl: string }> => {
    const form = new FormData();
    form.append("photo", file);
    const res = await fetch(`${BASE}/leaders/${leaderId}/photo`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },
};
