import { apiFetch, BASE_URL } from "./client";
import { getToken } from "@/lib/auth";

async function fetchImageBlob(path) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

async function apiDelete(path) {
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

export function getQuiz(lessonId) {
  return apiFetch(`/lessons/${lessonId}/quiz`);
}

export function createQuiz(lessonId, data) {
  return apiFetch(`/lessons/${lessonId}/quiz`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateQuiz(quizId, data) {
  return apiFetch(`/quizzes/${quizId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteQuiz(quizId) {
  return apiDelete(`/quizzes/${quizId}`);
}

export function addQuestion(quizId, data) {
  return apiFetch(`/quizzes/${quizId}/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateQuestion(questionId, data) {
  return apiFetch(`/questions/${questionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteQuestion(questionId) {
  return apiDelete(`/questions/${questionId}`);
}

export function addAnswer(questionId, data) {
  return apiFetch(`/questions/${questionId}/answers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAnswer(answerId, data) {
  return apiFetch(`/answers/${answerId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAnswer(answerId) {
  return apiDelete(`/answers/${answerId}`);
}

export async function uploadQuestionImage(questionId, file) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/questions/${questionId}/image`, {
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

export function fetchQuestionImageBlob(questionId) {
  return fetchImageBlob(`/questions/${questionId}/image`);
}

export function deleteQuestionImage(questionId) {
  return apiFetch(`/questions/${questionId}/image`, { method: "DELETE" });
}

export async function uploadAnswerImage(answerId, file) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/answers/${answerId}/image`, {
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

export function fetchAnswerImageBlob(answerId) {
  return fetchImageBlob(`/answers/${answerId}/image`);
}

export function deleteAnswerImage(answerId) {
  return apiFetch(`/answers/${answerId}/image`, { method: "DELETE" });
}
