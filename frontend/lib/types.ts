export interface Language {
  name: string;
  level: string;
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  bullets: string[];
  stack?: string[];
}

export interface Education {
  school: string;
  degree: string;
  startDate: string;
  endDate?: string;
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

export interface MeResponse {
  id: string;
  email: string;
  role: string;
  profile: Profile;
}

export interface ResumeContent {
  summary: string[];
  skills: string[];
  experiences: unknown[];
  educations: unknown[];
  languages: unknown[];
}

export interface ResumeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  layout: "one-column" | "two-column";
  primaryColor: string;
}

export interface Resume {
  _id: string;
  userId: string;
  title: string;
  jobDescription: string;
  jobLink?: string;
  stackTags?: string[];
  content: ResumeContent;
  style: ResumeStyle;
  isAiGenerated: boolean;
  atsScore?: number;
  createdAt: string;
  updatedAt: string;
}
