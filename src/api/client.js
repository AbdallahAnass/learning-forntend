import { getToken } from "@/lib/auth";

const BASE_URL = "http://localhost:8000";

export { BASE_URL };

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Something went wrong." }));
    const detail = err.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(", ")
      : detail || "Request failed.";
    throw new Error(message);
  }

  return res.json();
}
