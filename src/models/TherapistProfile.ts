import mongoose, { Schema, Document, Model } from "mongoose";

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface ITherapistProfile extends Document {
  userId: mongoose.Types.ObjectId;
  documentUrl: string;       // path/url to uploaded certificate/license
  documentName: string;      // original filename, for display
  verificationStatus: VerificationStatus;
  rejectionReason?: string;  // optional, if you want to tell them why
  submittedAt: Date;
  reviewedAt?: Date;
}

const TherapistProfileSchema = new Schema<ITherapistProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    documentUrl: {
      type: String,
      required: true,
    },

    documentName: {
      type: String,
      required: true,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const TherapistProfile: Model<ITherapistProfile> =
  mongoose.models.TherapistProfile ||
  mongoose.model<ITherapistProfile>("TherapistProfile", TherapistProfileSchema);

export default TherapistProfile;