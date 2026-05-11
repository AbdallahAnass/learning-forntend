import { apiFetch, BASE_URL } from "./client";
import { getToken } from "@/lib/auth";

export function getInstructorCourses(instructorId) {
  return apiFetch(`/instructor/${instructorId}/courses`);
}

export function getCourseAnalytics(courseId) {
  return apiFetch(`/instructor/courses/${courseId}/analytics`);
}

export function getCourse(courseId) {
  return apiFetch(`/courses/${courseId}`);
}

export function createCourse(data) {
  return apiFetch("/courses/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCourse(courseId, data) {
  return apiFetch(`/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCourse(courseId) {
  return apiFetch(`/courses/${courseId}`, { method: "DELETE" });
}

export function publishCourse(courseId) {
  return apiFetch(`/courses/${courseId}/publish`, { method: "PUT" });
}

export function unpublishCourse(courseId) {
  return apiFetch(`/courses/${courseId}/unpublish`, { method: "PUT" });
}

export function deleteCourseThumbnail(courseId) {
  return apiFetch(`/courses/${courseId}/thumbnail`, { method: "DELETE" });
}

export function getModules(courseId) {
  return apiFetch(`/courses/${courseId}/modules`);
}

export function createModule(courseId, data) {
  return apiFetch(`/courses/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateModule(moduleId, data) {
  return apiFetch(`/courses/modules/${moduleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteModule(moduleId) {
  return apiFetch(`/courses/modules/${moduleId}`, { method: "DELETE" });
}

export function getLessons(moduleId) {
  return apiFetch(`/courses/modules/${moduleId}/lessons`);
}

export function createLesson(moduleId, data) {
  return apiFetch(`/courses/modules/${moduleId}/lessons`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateLesson(lessonId, data) {
  return apiFetch(`/courses/lessons/${lessonId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteLesson(lessonId) {
  return apiFetch(`/courses/lessons/${lessonId}`, { method: "DELETE" });
}

export async function uploadLessonFile(lessonId, file) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/courses/lessons/${lessonId}/upload`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed." }));
    throw new Error(err.detail || "Upload failed.");
  }
  return res.json();
}

export function deleteLessonFile(lessonId) {
  return apiFetch(`/courses/lessons/${lessonId}/file`, { method: "DELETE" });
}

export async function uploadThumbnail(courseId, file) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/thumbnail`, {
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
