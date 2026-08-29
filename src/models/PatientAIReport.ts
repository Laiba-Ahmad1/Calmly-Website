// src/models/PatientAIReport.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatientAIReport extends Document {
  userId: mongoose.Types.ObjectId;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;

  weeklyOverview: string;        // 1-2 sentence headline, e.g. "Anxiety increased compared to last week..."
  observedPatterns: string[];    // bullet list — mix of computed stats + AI-noted qualitative patterns
  progress: string;              // short paragraph
  suggestedAreas: string[];      // bullet list for therapist follow-up

  strugglingDimensions: string[];
  dimensionScores: Record<string, number>;

  // Computed directly from DB — never AI-generated, so these numbers are always trustworthy
  stats: {
    journalDays: number;
    moodAvg: number | null;
    moodTrend: "up" | "down" | "flat" | null;   // vs previous week
    sleepAvg: number | null;
    sleepTrend: "up" | "down" | "flat" | null;
    quizCompleted: boolean;
    quizTotalScore: number | null;
    quizTrend: "up" | "down" | "flat" | null;    // up = more struggle than last week
    exerciseCounts: Record<string, number>;      // e.g. { breathing: 4, sound: 2 }
  };

  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatientAIReportSchema = new Schema<IPatientAIReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekNumber: { type: Number, required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },

    weeklyOverview: { type: String, required: true },
    observedPatterns: [{ type: String }],
    progress: { type: String, required: true },
    suggestedAreas: [{ type: String }],

    strugglingDimensions: [{ type: String }],
    dimensionScores: { type: Schema.Types.Mixed, default: {} },

    stats: {
      journalDays: { type: Number, default: 0 },
      moodAvg: { type: Number, default: null },
      moodTrend: { type: String, enum: ["up", "down", "flat", null], default: null },
      sleepAvg: { type: Number, default: null },
      sleepTrend: { type: String, enum: ["up", "down", "flat", null], default: null },
      quizCompleted: { type: Boolean, default: false },
      quizTotalScore: { type: Number, default: null },
      quizTrend: { type: String, enum: ["up", "down", "flat", null], default: null },
      exerciseCounts: { type: Schema.Types.Mixed, default: {} },
    },

    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PatientAIReportSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

const PatientAIReport: Model<IPatientAIReport> =
  mongoose.models.PatientAIReport ||
  mongoose.model<IPatientAIReport>("PatientAIReport", PatientAIReportSchema);

export default PatientAIReport;