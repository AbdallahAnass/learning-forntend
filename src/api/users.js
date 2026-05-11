import { apiFetch, BASE_URL } from "./client";
import { getToken } from "@/lib/auth";

export function getProfile() {
  return apiFetch("/users/me");
}

export function updateProfile(data) {
  return apiFetch("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchAvatarUrl() {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/users/me/avatar`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("no avatar");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function uploadAvatar(file) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/users/me/avatar`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed." }));
    throw new Error(err.detail || "Upload failed.");
  }
  return res.json();
}

export function deleteAvatar() {
  return apiFetch("/users/me/avatar", { method: "DELETE" });
}
