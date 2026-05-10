import { BASE_URL } from "./client";
import { getToken } from "@/lib/auth";

export async function fetchThumbnailUrl(courseId) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/courses/${courseId}/thumbnail`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("no thumbnail");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
