// src/models/TherapistAdvice.ts
// Therapist-created advice for a connected patient, tied to a Calmly module.
import mongoose, { Schema, Document, Model } from "mongoose";
import type { ModuleKey } from "@/lib/modules";

export interface ITherapistAdvice extends Document {
  patientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  text: string;
  relatedModule: ModuleKey;
  active: boolean; // false = removed/archived, hidden from patient
  createdAt: Date;
  updatedAt: Date;
}

const TherapistAdviceSchema = new Schema<ITherapistAdvice>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    therapistId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 400,
    },
    relatedModule: {
      type: String,
      enum: ["breathing", "sound", "memory_match", "garden", "journal", "quiz"],
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// patient's visible advice list, newest first
TherapistAdviceSchema.index({ patientId: 1, active: 1, createdAt: -1 });

const TherapistAdvice: Model<ITherapistAdvice> =
  mongoose.models.TherapistAdvice ||
  mongoose.model<ITherapistAdvice>("TherapistAdvice", TherapistAdviceSchema);

export default TherapistAdvice;
