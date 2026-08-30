// src/lib/email.ts
// Server-side email abstraction. Uses SMTP via nodemailer when configured;
// otherwise logs the message to the server console so verification flows
// remain testable in development without real credentials.
//
// Required environment variables for real sending:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM
// (Optional: SMTP_SECURE=true for port 465 implicit TLS)
import nodemailer from "nodemailer";

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
  }
  return transporter;
}

export function isEmailConfigured(): boolean {
  return getTransporter() !== null;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const transporter = getTransporter();

  if (!transporter) {
    // Dev fallback: no SMTP configured — log instead of sending.
    console.info(
      `[email:dev-fallback] to=${to} subject="${subject}"\n${text}`
    );
    return { delivered: false };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    return { delivered: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { delivered: false };
  }
}
