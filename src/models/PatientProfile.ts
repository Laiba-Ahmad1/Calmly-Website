import mongoose, { Schema, Document, Model } from "mongoose";
import { ANXIETY_TYPES, AnxietyType } from "@/lib/anxiety";

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId;

  anxietyType: AnxietyType;

  plant: {
    growth: number;
    level: number;
  };

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
  },
  {
    timestamps: true,
  }
);

const PatientProfile: Model<IPatientProfile> =
  mongoose.models.PatientProfile ||
  mongoose.model<IPatientProfile>(
    "PatientProfile",
    PatientProfileSchema
  );

export default PatientProfile;