// src/lib/therapist/guard.ts
import { getCurrentUser } from "@/lib/auth";

// Returns the logged-in user only if they are a therapist — use in every
// therapist page/API as the first authorization step.
export async function requireTherapist() {
  const user = await getCurrentUser();
  return user && user.role === "therapist" ? user : null;
}
