// src/lib/notifications.ts
// Reusable in-app notification helpers. createNotification is idempotent per
// dedupeKey, so repeated triggers (page loads, cron reruns) never spam users.
import db from "@/lib/db";
import mongoose from "mongoose";
import Notification, {
  INotification,
  NotificationType,
} from "@/models/Notification";

type UserId = string | mongoose.Types.ObjectId;

interface CreateNotificationParams {
  recipientId: UserId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  // unique per logical event, e.g. "quiz:{userId}:{weekNumber}"
  dedupeKey?: string;
}

export async function createNotification(
  params: CreateNotificationParams
): Promise<INotification | null> {
  await db();

  if (params.dedupeKey) {
    const existing = await Notification.findOne({
      recipientId: params.recipientId,
      dedupeKey: params.dedupeKey,
    }).select("_id");
    if (existing) return null;
  }

  try {
    return await Notification.create(params);
  } catch (err: any) {
    // duplicate key from the unique partial index = another worker created it first
    if (err?.code === 11000) return null;
    throw err;
  }
}

export async function getNotificationsForUser(
  recipientId: UserId,
  limit = 30
) {
  await db();

  return Notification.find({ recipientId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getUnreadCount(recipientId: UserId): Promise<number> {
  await db();

  return Notification.countDocuments({ recipientId, read: false });
}

export async function markAllRead(recipientId: UserId) {
  await db();

  await Notification.updateMany(
    { recipientId, read: false },
    { $set: { read: true } }
  );
}
