// GET /api/notifications — the logged-in user's notifications
// POST /api/notifications — mark all as read
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getNotificationsForUser,
  markAllRead,
} from "@/lib/notifications";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotificationsForUser(user._id);
  return NextResponse.json({ notifications });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllRead(user._id);
  return NextResponse.json({ success: true });
}
