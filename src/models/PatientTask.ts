// src/models/PatientTask.ts
// A todo assigned by a therapist to a connected patient. The patient sees it
// in their journal, and checking it off there marks it completed (the journal
// entry keeps its own todos snapshot for history).
import mongoose, { Schema, Document, Model } from "mongoose";

export type PatientTaskStatus = "active" | "completed" | "cancelled";

export interface IPatientTask extends Document {
  patientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  text: string;
  status: PatientTaskStatus;
  assignedAt: Date;
  completedAt?: Date;
  completedViaJournal?: mongoose.Types.ObjectId; // journal entry whose todos marked it done
  createdAt: Date;
  updatedAt: Date;
}

const PatientTaskSchema = new Schema<IPatientTask>(
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
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    completedViaJournal: {
      type: Schema.Types.ObjectId,
      ref: "Journal",
    },
  },
  { timestamps: true }
);

const PatientTask: Model<IPatientTask> =
  mongoose.models.PatientTask ||
  mongoose.model<IPatientTask>("PatientTask", PatientTaskSchema);

export default PatientTask;
