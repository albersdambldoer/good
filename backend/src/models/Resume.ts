import mongoose, { Schema, Document, Model } from "mongoose";

export interface ResumeContentSection {
  summary: string[];
  skills: string[];
  experiences: any[];
  educations: any[];
  languages: any[];
}

export interface ResumeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  layout: "one-column" | "two-column";
  primaryColor: string;
}

export interface ResumeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  jobDescription: string;
  jobLink?: string;
  stackTags?: string[];
  content: ResumeContentSection;
  style: ResumeStyle;
  isAiGenerated: boolean;
  atsScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const resumeStyleSchema = new Schema<ResumeStyle>(
  {
    fontFamily: { type: String, default: "system-ui" },
    fontSize: { type: Number, default: 14 },
    lineHeight: { type: Number, default: 1.4 },
    layout: { type: String, enum: ["one-column", "two-column"], default: "one-column" },
    primaryColor: { type: String, default: "#111827" },
  },
  { _id: false },
);

const resumeContentSchema = new Schema<ResumeContentSection>(
  {
    summary: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    experiences: { type: [Schema.Types.Mixed], default: [] },
    educations: { type: [Schema.Types.Mixed], default: [] },
    languages: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false },
);

const resumeSchema = new Schema<ResumeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    jobDescription: { type: String, required: true },
    jobLink: { type: String },
    stackTags: { type: [String], default: [] },
    content: { type: resumeContentSchema, required: true },
    style: { type: resumeStyleSchema, required: true },
    isAiGenerated: { type: Boolean, default: false },
    atsScore: { type: Number },
  },
  { timestamps: true },
);

export const Resume: Model<ResumeDocument> =
  mongoose.models.Resume || mongoose.model<ResumeDocument>("Resume", resumeSchema);

