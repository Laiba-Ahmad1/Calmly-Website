// src/models/Exercise.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type ExerciseType = "breathing" | "sound" | "memory_match" | "garden";
export type GrowthDimension =
  | "calmness" | "relaxation" | "anxiety_regulation" | "emotional_regulation"
  | "stress_reduction" | "focus" | "attention" | "cognitive_engagement"
  | "concentration" | "physical_movement" | "physical_activity"
  | "engagement" | "overall_wellness";

export interface IExercise extends Document {
  name: string;
  description: string;
  type: ExerciseType;
  growthDimensions: { dimension: GrowthDimension; weight: number }[];
  durationMinutes?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["breathing", "sound", "memory_match", "garden"],
      required: true,
      index: true,
    },
    growthDimensions: [
      {
        dimension: {
          type: String,
          enum: [
            "calmness", "relaxation", "anxiety_regulation", "emotional_regulation",
            "stress_reduction", "focus", "attention", "cognitive_engagement",
            "concentration", "physical_movement", "physical_activity",
            "engagement", "overall_wellness",
          ],
          required: true,
        },
        weight: { type: Number, min: 0, max: 1, default: 1 },
      },
    ],
    durationMinutes: { type: Number, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Exercise: Model<IExercise> =
  mongoose.models.Exercise || mongoose.model<IExercise>("Exercise", ExerciseSchema);

export default Exercise;