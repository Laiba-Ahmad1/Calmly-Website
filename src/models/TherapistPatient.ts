// models/TherapistPatient.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type TherapistPatientStatus = "pending" | "active" | "rejected" | "inactive";

export interface ITherapistPatient extends Document {
  therapistId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  status: TherapistPatientStatus;
  requestedAt: Date;
  respondedAt?: Date; // when the therapist accepted/rejected
  assignedAt?: Date; // when status first became "active"
  endedAt?: Date; // when status became "inactive"
  createdAt: Date;
  updatedAt: Date;
}

const TherapistPatientSchema = new Schema<ITherapistPatient>(
  {
    therapistId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "inactive"],
      default: "pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    assignedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// A patient can only have ONE row in "pending" or "active" state at a time —
// this is what actually enforces "one therapist," not the old plain unique index.
// Once that row moves to "rejected" or "inactive," the patient is free to
// request someone else (or the same therapist again later).
TherapistPatientSchema.index(
  { patientId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "active"] } },
  }
);

// speeds up a therapist's "my patients" list / pending-requests list
TherapistPatientSchema.index({ therapistId: 1, status: 1 });

const TherapistPatient: Model<ITherapistPatient> =
  mongoose.models.TherapistPatient ||
  mongoose.model<ITherapistPatient>("TherapistPatient", TherapistPatientSchema);

export default TherapistPatient;