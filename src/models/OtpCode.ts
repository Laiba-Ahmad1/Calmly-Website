// src/models/OtpCode.ts
// One-time codes for email verification and password reset. Codes are stored
// ONLY as bcrypt hashes — never in plain text. One live code per email+purpose.
import mongoose, { Schema, Document, Model } from "mongoose";

export type OtpPurpose = "email_verification" | "password_reset";

export interface IOtpCode extends Document {
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
  consumedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OtpCodeSchema = new Schema<IOtpCode>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["email_verification", "password_reset"],
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    consumedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// one live code per email+purpose — issuing a new one replaces the previous
OtpCodeSchema.index({ email: 1, purpose: 1 }, { unique: true });

const OtpCode: Model<IOtpCode> =
  mongoose.models.OtpCode || mongoose.model<IOtpCode>("OtpCode", OtpCodeSchema);

export default OtpCode;
