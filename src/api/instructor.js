import { apiFetch } from "./client";

export function getInstructorCourses(instructorId) {
  return apiFetch(`/instructor/${instructorId}/courses`);
}

export function getCourseAnalytics(courseId) {
  return apiFetch(`/instructor/courses/${courseId}/analytics`);
}
