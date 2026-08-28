// models/Journal.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJournalTodo {
  text: string;
  done: boolean;
}

export interface IJournal extends Document {
  patientId: mongoose.Types.ObjectId;
  date: Date;
  // Patient's mood: 1–5
  mood: number;
  // Sleep quality: 1–5
  sleepQuality: number;
  // Patient writes how they are feeling
  feelings: string;
  // Therapist-assigned tasks for this entry
  todos: IJournalTodo[];
  // Patient's reflection
  reflection: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    sleepQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feelings: {
      type: String,
      required: true,
      trim: true,
    },
    todos: [
      {
        text: { type: String, required: true, trim: true },
        done: { type: Boolean, default: false },
      },
    ],
    reflection: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Makes weekly/monthly journal retrieval efficient
JournalSchema.index({
  patientId: 1,
  date: -1,
});

const Journal: Model<IJournal> =
  mongoose.models.Journal ||
  mongoose.model<IJournal>("Journal", JournalSchema);

export default Journal;