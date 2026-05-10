const BASE_URL = "http://localhost:8000";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Something went wrong." }));
    throw new Error(err.detail || "Request failed.");
  }

  return res.json();
}
