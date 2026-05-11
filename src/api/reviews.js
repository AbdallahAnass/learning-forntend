import { apiFetch, BASE_URL } from "./client";
import { getToken } from "@/lib/auth";

export function getCourseReviews(courseId) {
  return apiFetch(`/courses/${courseId}/reviews`);
}

export function getMyReview(courseId) {
  return apiFetch(`/courses/${courseId}/my-review`);
}

export function submitReview(courseId, rating, comment) {
  return apiFetch(`/courses/${courseId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating, comment: comment || null }),
  });
}

export function updateReview(reviewId, rating, comment) {
  return apiFetch(`/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify({ rating, comment: comment || null }),
  });
}

export async function deleteReview(reviewId) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Delete failed." }));
    throw new Error(err.detail || "Delete failed.");
  }
}
