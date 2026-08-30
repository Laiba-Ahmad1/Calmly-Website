// src/models/TherapistFeedback.ts
// Therapist-written weekly feedback, shown to the patient under "Feedback".
// Deliberately separate from the AI-generated PatientAIReport: this is the
// therapist's own words, four fixed sections, no AI involved.
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITherapistFeedback extends Document {
  patientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;

  overallObservation: string;
  progressAndStrength: string;
  areasToFocusOn: string;
  feedbackAndGuidance: string;

  createdAt: Date;
  updatedAt: Date;
}

const TherapistFeedbackSchema = new Schema<ITherapistFeedback>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    therapistId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weekNumber: { type: Number, required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },

    overallObservation: { type: String, required: true, trim: true, maxlength: 2000 },
    progressAndStrength: { type: String, required: true, trim: true, maxlength: 2000 },
    areasToFocusOn: { type: String, required: true, trim: true, maxlength: 2000 },
    feedbackAndGuidance: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

// one feedback document per patient per week — therapist can re-save to edit
TherapistFeedbackSchema.index({ patientId: 1, weekStart: 1 }, { unique: true });

const TherapistFeedback: Model<ITherapistFeedback> =
  mongoose.models.TherapistFeedback ||
  mongoose.model<ITherapistFeedback>("TherapistFeedback", TherapistFeedbackSchema);

export default TherapistFeedback;
