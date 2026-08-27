// models/QuizQuestion.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { ANXIETY_TYPES, AnxietyType } from "@/lib/anxiety";

export interface IQuizOption {
  text: string;
  score: number;
}

export interface IQuizQuestion extends Document {
  question: string;
  anxietyType: AnxietyType;
  dimension: string;
  options: IQuizOption[];
  active: boolean;

  // NEW: AI-generated, user-specific questions
  generated: boolean;
  generatedForUserId?: mongoose.Types.ObjectId; // undefined = shared bank question
  generatedContext?: string; // short debug note: what triggered this question

  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true, trim: true },
    anxietyType: { type: String, enum: ANXIETY_TYPES, required: true, index: true },
    dimension: { type: String, required: true, index: true },
    options: [
      {
        text: { type: String, required: true },
        score: { type: Number, required: true, min: 0, max: 4 },
      },
    ],
    active: { type: Boolean, default: true, index: true },

    generated: { type: Boolean, default: false, index: true },
    generatedForUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    generatedContext: { type: String },
  },
  { timestamps: true }
);

const QuizQuestion: Model<IQuizQuestion> =
  mongoose.models.QuizQuestion ||
  mongoose.model<IQuizQuestion>("QuizQuestion", QuizQuestionSchema);

export default QuizQuestion;