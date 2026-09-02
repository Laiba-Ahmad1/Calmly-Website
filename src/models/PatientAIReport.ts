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

  // Per-day anxiety indicator (7 elements, one per day of the report week).
  // Derived deterministically from Journal.mood + Journal.sleepQuality by
  // src/lib/ai/dailyAnxietyTrend.ts. Older reports predate this field and
  // leave it undefined — the UI guards with Array.isArray().
  dailyTrend?: {
    dayIndex: number;
    date: Date;
    score: number | null;
    level: "low" | "moderate" | "high" | "none";
    mood: number | null;
    sleepQuality: number | null;
  }[];

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
    taskText: string | null;                     // therapist-assigned todo active this week, if any
    taskCompleted: boolean | null;               // completed within this week's window (null = no task)
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

    dailyTrend: {
      type: [
        {
          _id: false,
          dayIndex: { type: Number, required: true },
          date: { type: Date, required: true },
          score: { type: Number, default: null },
          level: {
            type: String,
            enum: ["low", "moderate", "high", "none"],
            default: "none",
          },
          mood: { type: Number, default: null },
          sleepQuality: { type: Number, default: null },
        },
      ],
      default: undefined,
    },

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
      taskText: { type: String, default: null },
      taskCompleted: { type: Boolean, default: null },
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