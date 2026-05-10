import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Define and export the cn (className) helper function
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
