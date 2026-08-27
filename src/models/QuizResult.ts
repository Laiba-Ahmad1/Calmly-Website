import mongoose, { Schema, Document, Model } from "mongoose";
import { ANXIETY_TYPES, AnxietyType } from "@/lib/anxiety";

export interface IQuizResponse {
  questionId: mongoose.Types.ObjectId;

  questionText: string;

  selectedOption: string;

  score: number;

  anxietyType: AnxietyType;

  dimension: string;
}

export interface IQuizResult extends Document {
  userId: mongoose.Types.ObjectId;

  anxietyType: AnxietyType;

  weekStart: Date;

  weekEnd: Date;

  responses: IQuizResponse[];

  dimensionScores: Map<string, number>;

  totalScore: number;

  maxScore: number;

  completedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    anxietyType: {
      type: String,
      enum: ANXIETY_TYPES,
      required: true,
      index: true,
    },

    weekStart: {
      type: Date,
      required: true,
    },

    weekEnd: {
      type: Date,
      required: true,
    },

    responses: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "QuizQuestion",
          required: true,
        },

        questionText: {
          type: String,
          required: true,
        },

        selectedOption: {
          type: String,
          required: true,
        },

        score: {
          type: Number,
          required: true,
          min: 0,
          max: 4,
        },

        anxietyType: {
          type: String,
          enum: ANXIETY_TYPES,
          required: true,
        },

        dimension: {
          type: String,
          required: true,
        },
      },
    ],

    dimensionScores: {
      type: Map,
      of: Number,
      default: {},
    },

    totalScore: {
      type: Number,
      required: true,
      min: 0,
    },

    maxScore: {
      type: Number,
      required: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One quiz result per user per week
QuizResultSchema.index(
  {
    userId: 1,
    weekStart: 1,
  },
  {
    unique: true,
  }
);

const QuizResult: Model<IQuizResult> =
  mongoose.models.QuizResult ||
  mongoose.model<IQuizResult>(
    "QuizResult",
    QuizResultSchema
  );

export default QuizResult;