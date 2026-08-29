// src/models/ExerciseSession.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import type { ExerciseType } from "./Exercise";

export interface IExerciseSession extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseId?: mongoose.Types.ObjectId; // ref -> matching Exercise doc
  type: ExerciseType;
  durationSeconds: number;
  completed: boolean;
  growthAwarded: number;
  stats: Record<string, unknown>; // type-specific payload, see growth/types.ts
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSessionSchema = new Schema<IExerciseSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
    type: {
      type: String,
      enum: ["breathing", "sound", "memory_match", "garden"],
      required: true,
      index: true,
    },
    durationSeconds: { type: Number, required: true, min: 0 },
    completed: { type: Boolean, default: false },
    growthAwarded: { type: Number, default: 0, min: 0 },
    stats: { type: Schema.Types.Mixed, default: {} },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ExerciseSession: Model<IExerciseSession> =
  mongoose.models.ExerciseSession ||
  mongoose.model<IExerciseSession>("ExerciseSession", ExerciseSessionSchema);

export default ExerciseSession;