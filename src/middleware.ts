// src/middleware.ts
// Edge-safe route gating: checks that a session cookie exists and that the
// token's role matches the route area. The token payload is decoded WITHOUT
// signature verification (Edge runtime has no Node crypto) — this only
// coarsely routes users away from the wrong area. Real authorization happens
// server-side in every page and API handler via getCurrentUser() plus
// therapist-patient relationship checks.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PATIENT_PREFIXES = [
  "/home",
  "/journal",
  "/quiz",
  "/exercises",
  "/plant",
  "/tasks",
  "/settings",
  "/therapistFind",
  "/onboarding",
  "/feedback",
  "/notifications",
  "/profile",
];

function decodeRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const parsed = JSON.parse(atob(normalized));
    return typeof parsed.role === "string" ? parsed.role : null;
  } catch {
    return null;
  }
}

function homeFor(role: string): string {
  if (role === "therapist") return "/therapist";
  if (role === "admin") return "/admin/therapists";
  if (role === "patient") return "/home";
  return "/login";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = token ? decodeRole(token) : null;

  if (!token || !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isTherapistArea = pathname === "/therapist" || pathname.startsWith("/therapist/");
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPatientArea = PATIENT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isTherapistArea && role !== "therapist") {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }
  if (isAdminArea && role !== "admin") {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }
  if (isPatientArea && role !== "patient") {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/journal/:path*",
    "/quiz/:path*",
    "/exercises/:path*",
    "/plant/:path*",
    "/tasks/:path*",
    "/settings/:path*",
    "/therapistFind/:path*",
    "/onboarding/:path*",
    "/feedback/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/therapist/:path*",
    "/admin/:path*",
  ],
};
