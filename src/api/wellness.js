import { apiFetch } from "./client";

export function getWellnessAdvice() {
  return apiFetch("/wellness/advice");
}

export function sendWellnessMessage(message, history) {
  return apiFetch("/wellness/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}
