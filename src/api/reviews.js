import { apiFetch } from "./client";

export function getCourseReviews(courseId) {
  return apiFetch(`/courses/${courseId}/reviews`);
}
