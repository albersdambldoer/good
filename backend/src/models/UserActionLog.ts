import mongoose, { Schema, Document, Model } from "mongoose";

export type UserActionType =
  | "LOGIN"
  | "RESUME_CREATED"
  | "RESUME_EDITED"
  | "PROFILE_UPDATED";

export interface UserActionLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  actionType: UserActionType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const userActionLogSchema = new Schema<UserActionLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actionType: {
      type: String,
      required: true,
      enum: ["LOGIN", "RESUME_CREATED", "RESUME_EDITED", "PROFILE_UPDATED"],
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const UserActionLog: Model<UserActionLogDocument> =
  mongoose.models.UserActionLog ||
  mongoose.model<UserActionLogDocument>("UserActionLog", userActionLogSchema);

