import { apiFetch } from "./client";

export function getEnrollmentStatus(courseId) {
  return apiFetch(`/enrollment/enrollment-status/${courseId}`);
}

export function enrollInCourse(courseId) {
  return apiFetch(`/enrollment/?course_id=${courseId}`, { method: "POST" });
}
