// src/models/Notification.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType =
  | "quiz_available" // patient: weekly quiz is ready
  | "journal_due" // patient: today's journal hasn't been written
  | "therapist_advice" // patient: therapist shared new advice
  | "therapist_feedback" // patient: therapist shared new feedback
  | "weekly_report" // therapist: a patient's AI weekly report is ready
  | "patient_request"; // therapist: a patient sent a connection request

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string; // in-app destination, e.g. "/quiz"
  read: boolean;
  // stable key used to avoid duplicate notifications for the same event
  dedupeKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "quiz_available",
        "journal_due",
        "therapist_advice",
        "therapist_feedback",
        "weekly_report",
        "patient_request",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    link: { type: String, trim: true },
    read: { type: Boolean, default: false },
    dedupeKey: { type: String, trim: true },
  },
  { timestamps: true }
);

// unread-first, newest-first listing per recipient
NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
// one notification per logical event (partial: only when key present)
NotificationSchema.index(
  { dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: "string" } } }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
