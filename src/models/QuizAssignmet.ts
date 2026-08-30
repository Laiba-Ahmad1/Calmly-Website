// models/QuizAssignment.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { AnxietyType } from "@/lib/anxiety";

export interface IQuizAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  anxietyType: AnxietyType;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  questionIds: mongoose.Types.ObjectId[];
  dimensionWeights: Map<string, number>; // snapshot of what drove the picks, for debugging/therapist view
  source: "baseline" | "personalized" | "therapist";
  createdAt: Date;
  updatedAt: Date;
}

const QuizAssignmentSchema = new Schema<IQuizAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    anxietyType: { type: String, required: true },
    weekNumber: { type: Number, required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: "QuizQuestion", required: true }],
    dimensionWeights: { type: Map, of: Number, default: {} },
    source: { type: String, enum: ["baseline", "personalized", "therapist"], required: true },
  },
  { timestamps: true }
);

// one assignment per user per week
QuizAssignmentSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

const QuizAssignment: Model<IQuizAssignment> =
  mongoose.models.QuizAssignment ||
  mongoose.model<IQuizAssignment>("QuizAssignment", QuizAssignmentSchema);

export default QuizAssignment;