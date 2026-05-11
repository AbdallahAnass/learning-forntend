import { apiFetch, BASE_URL } from "./client";
import { getToken } from "@/lib/auth";

export function listCourses({ skill, skip = 0, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (skill) params.set("skill", skill);
  params.set("skip", skip);
  params.set("limit", limit);
  return apiFetch(`/courses/?${params.toString()}`);
}

export function searchCourses(query) {
  return apiFetch(`/courses/search/${encodeURIComponent(query)}`);
}

export function listSkills() {
  return apiFetch("/courses/skills");
}

export function getCourse(courseId) {
  return apiFetch(`/courses/${courseId}`);
}

export function getCourseModules(courseId) {
  return apiFetch(`/courses/${courseId}/modules`);
}

export function getModuleLessons(moduleId) {
  return apiFetch(`/courses/modules/${moduleId}/lessons`);
}

export function getCourseReviews(courseId) {
  return apiFetch(`/courses/${courseId}/reviews`);
}

export async function fetchThumbnailUrl(courseId) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/courses/${courseId}/thumbnail`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("no thumbnail");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
