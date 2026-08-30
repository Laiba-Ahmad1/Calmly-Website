import mongoose, { Schema, Document, Model } from "mongoose";
import { ANXIETY_TYPES, AnxietyType } from "@/lib/anxiety";
import type { Language } from "@/lib/i18n/dictionaries";

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId;

  anxietyType: AnxietyType;

  plant: {
    growth: number;
    level: number;
  };
  age: number;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    anxietyType: {
      type: String,
      enum: ANXIETY_TYPES,
      required: true,
    },

    plant: {
      growth: {
        type: Number,
        default: 0,
      },
      
      level: {
        type: Number,
        default: 1,
      },
    },
    age: { type: Number, required: false, min: 1, max: 120 },
    language: { type: String, enum: ["en", "ur"], default: "en" },

  },
  {
    timestamps: true,
  },
);

const PatientProfile: Model<IPatientProfile> =
  mongoose.models.PatientProfile ||
  mongoose.model<IPatientProfile>("PatientProfile", PatientProfileSchema);

export default PatientProfile;
