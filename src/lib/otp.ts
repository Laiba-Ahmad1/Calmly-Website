// src/lib/otp.ts
// Issue and verify one-time codes. Codes are 6 digits, expire in 10 minutes,
// are stored only as bcrypt hashes, allow at most 5 wrong attempts, and can
// be resent at most once per 60 seconds per email+purpose.
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import OtpCode, { OtpPurpose } from "@/models/OtpCode";
import { sendEmail } from "@/lib/email";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function codeEmailText(code: string, minutes: number, purpose: OtpPurpose) {
  const line =
    purpose === "email_verification"
      ? "Use this code to verify your email address:"
      : "Use this code to reset your password:";
  return [
    "Hello,",
    "",
    line,
    "",
    `    ${code}`,
    "",
    `This code expires in ${minutes} minutes. If you didn't request it, you can safely ignore this email.`,
    "",
    "— Calmly",
  ].join("\n");
}

export type IssueResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function issueOtp(
  email: string,
  purpose: OtpPurpose,
  opts: { existingUserOnly?: boolean } = {}
): Promise<IssueResult> {
  await db();
  const normalized = email.trim().toLowerCase();

  // Replace any previous live code for this email+purpose. If the caller is
  // rate-limited we keep the existing one untouched.
  const previous = await OtpCode.findOne({
    email: normalized,
    purpose,
  });

  if (
    previous &&
    !previous.consumedAt &&
    Date.now() - new Date(previous.lastSentAt).getTime() < RESEND_COOLDOWN_MS
  ) {
    return {
      ok: false,
      status: 429,
      error: "Please wait a minute before requesting another code.",
    };
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await OtpCode.findOneAndUpdate(
    { email: normalized, purpose },
    {
      codeHash,
      expiresAt,
      attempts: 0,
      consumedAt: null,
      lastSentAt: new Date(),
    },
    { upsert: true }
  );

  await sendEmail({
    to: normalized,
    subject:
      purpose === "email_verification"
        ? "Your Calmly verification code"
        : "Reset your Calmly password",
    text: codeEmailText(code, CODE_TTL_MINUTES, purpose),
  });

  return { ok: true };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function verifyOtp(
  email: string,
  purpose: OtpPurpose,
  code: string
): Promise<VerifyResult> {
  await db();
  const normalized = email.trim().toLowerCase();

  const record = await OtpCode.findOne({ email: normalized, purpose });

  if (!record || record.consumedAt) {
    return { ok: false, status: 400, error: "This code is invalid." };
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { ok: false, status: 400, error: "This code has expired." };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return {
      ok: false,
      status: 429,
      error: "Too many incorrect attempts. Please request a new code.",
    };
  }

  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    record.attempts += 1;
    await record.save();
    return {
      ok: false,
      status: 400,
      error:
        record.attempts >= MAX_ATTEMPTS
          ? "Too many incorrect attempts. Please request a new code."
          : "That code isn't right. Please check and try again.",
    };
  }

  // consume — a code can never be verified twice
  record.consumedAt = new Date();
  await record.save();
  return { ok: true };
}
