import { apiFetch } from "./client";

export function getEnrollmentStatus(courseId) {
  return apiFetch(`/enrollment/enrollment-status/${courseId}`);
}

export function enrollInCourse(courseId) {
  return apiFetch(`/enrollment/?course_id=${courseId}`, { method: "POST" });
}

export function getEnrolledCourses() {
  return apiFetch("/enrollment/enrolled-courses");
}

export function getCourseProgress(courseId) {
  return apiFetch(`/enrollment/progress/${courseId}`);
}

export function markLessonComplete(lessonId) {
  return apiFetch(`/enrollment/progress/${lessonId}`, { method: "POST" });
}

export function getCompletedLessons(courseId) {
  return apiFetch(`/enrollment/completed-lessons/${courseId}`);
}

export function unenrollFromCourse(courseId) {
  return apiFetch(`/enrollment/${courseId}`, { method: "DELETE" });
}
