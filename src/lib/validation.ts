// src/lib/validation.ts
// Shared input validation for auth flows. Mirrored on the frontend — the
// backend is the source of truth, the client uses these messages early for
// a calmer experience.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: unknown): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function validateEmail(email: unknown): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return "Please enter your email address.";
  if (normalized.length > 254) return "That email address is too long.";
  if (!EMAIL_REGEX.test(normalized))
    return "Please enter a valid email address.";
  return null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || !password) {
    return "Please enter your password.";
  }
  if (password.length < 8)
    return "Password must be at least 8 characters long.";
  if (password.length > 128)
    return "Password must be shorter than 128 characters.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    return "Password must include at least one letter and one number.";
  return null;
}

export function validateLoginPassword(password: unknown): string | null {
  // login only needs presence + a sane length — strength rules are for signup
  if (typeof password !== "string" || !password.trim()) {
    return "Please enter your password.";
  }
  if (password.length > 128) return "Password must be shorter than 128 characters.";
  return null;
}

export function validateName(name: unknown): string | null {
  if (typeof name !== "string" || !name.trim()) return "Please enter your name.";
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (trimmed.length > 60) return "Name must be 60 characters or fewer.";
  return null;
}

export function validateOtp(code: unknown): string | null {
  if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    return "Please enter the 6-digit code from your email.";
  }
  return null;
}
