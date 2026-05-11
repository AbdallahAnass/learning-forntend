import { apiFetch, BASE_URL } from "./client";
import { getToken } from "@/lib/auth";

export function getStats() {
  return apiFetch("/admin/stats");
}

export function listStudents(skip = 0, limit = 50) {
  return apiFetch(`/admin/students?skip=${skip}&limit=${limit}`);
}

export function listInstructors(skip = 0, limit = 50) {
  return apiFetch(`/admin/instructors?skip=${skip}&limit=${limit}`);
}

export function listAllCourses(skip = 0, limit = 50) {
  return apiFetch(`/admin/courses?skip=${skip}&limit=${limit}`);
}

export function unpublishCourse(courseId) {
  return apiFetch(`/admin/courses/${courseId}/unpublish`, { method: "PUT" });
}

async function adminDelete(path) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Delete failed." }));
    throw new Error(err.detail || "Delete failed.");
  }
}

export function deleteStudent(studentId) {
  return adminDelete(`/admin/students/${studentId}`);
}

export function deleteInstructor(instructorId) {
  return adminDelete(`/admin/instructors/${instructorId}`);
}

export function deleteCourse(courseId) {
  return adminDelete(`/admin/courses/${courseId}`);
}
