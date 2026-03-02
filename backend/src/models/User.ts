import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "user" | "admin";

export interface Language {
  name: string;
  level: string;
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  bullets: string[];
  stack?: string[];
}

export interface Education {
  school: string;
  degree: string;
  startDate: Date;
  endDate?: Date;
}

export interface Profile {
  name: string;
  headline: string;
  location: string;
  phone: string;
  social: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  languages: Language[];
  skills: string[];
  experiences: Experience[];
  educations: Education[];
}

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: Profile;
  createdAt: Date;
  updatedAt: Date;
}

const languageSchema = new Schema<Language>(
  {
    name: { type: String, required: true },
    level: { type: String, required: true },
  },
  { _id: false },
);

const experienceSchema = new Schema<Experience>(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    bullets: { type: [String], default: [] },
    stack: { type: [String], default: [] },
  },
  { _id: false },
);

const educationSchema = new Schema<Education>(
  {
    school: { type: String, required: true },
    degree: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { _id: false },
);

const profileSchema = new Schema<Profile>(
  {
    name: { type: String, required: true },
    headline: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    social: {
      linkedin: { type: String },
      github: { type: String },
      website: { type: String },
    },
    languages: { type: [languageSchema], default: [] },
    skills: { type: [String], default: [] },
    experiences: { type: [experienceSchema], default: [] },
    educations: { type: [educationSchema], default: [] },
  },
  { _id: false },
);

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profile: {
      type: profileSchema,
      required: true,
      default: {
        name: "",
        headline: "",
        location: "",
        phone: "",
        social: {},
        languages: [],
        skills: [],
        experiences: [],
        educations: [],
      },
    },
  },
  { timestamps: true },
);

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

