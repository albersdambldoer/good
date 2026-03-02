import { Router } from "express";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";
import { Resume } from "../models/Resume.js";
import { UserActionLog } from "../models/UserActionLog.js";

export const resumeRouter = Router();

// Simple ATS-friendly deterministic generator (non-AI) placeholder
function generateDeterministicResume(opts: {
  jobTitle: string;
  jobDescription: string;
  stackTags?: string[];
  profile: any;
}) {
  const { jobTitle, jobDescription, stackTags, profile } = opts;

  const summary = [
    `${profile.name || "Experienced professional"} targeting ${jobTitle}.`,
    "Results-oriented, focusing on measurable impact and alignment with role requirements.",
  ];

  const skills = profile.skills ?? [];

  const experiences = (profile.experiences ?? []).slice(0, 4);
  const educations = profile.educations ?? [];
  const languages = profile.languages ?? [];

  return {
    title: `${jobTitle} – tailored resume`,
    jobDescription,
    stackTags: stackTags ?? [],
    content: {
      summary,
      skills,
      experiences,
      educations,
      languages,
    },
    style: {
      fontFamily: "system-ui",
      fontSize: 14,
      lineHeight: 1.4,
      layout: "one-column" as const,
      primaryColor: "#111827",
    },
    isAiGenerated: false,
  };
}

resumeRouter.post(
  "/resumes/generate",
  authMiddleware,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { jobTitle, jobDescription, jobLink, stackTags } = req.body ?? {};
    if (!jobTitle || !jobDescription) {
      return res
        .status(400)
        .json({ message: "jobTitle and jobDescription are required" });
    }

    try {
      const draft = generateDeterministicResume({
        jobTitle,
        jobDescription,
        stackTags,
        profile: req.user.profile,
      });

      const resume = await Resume.create({
        userId: req.user._id,
        jobLink,
        ...draft,
      });

      await UserActionLog.create({
        userId: req.user._id,
        actionType: "RESUME_CREATED",
        metadata: { resumeId: resume._id },
      });

      return res.status(201).json(resume);
    } catch (error) {
      console.error("[resume] generate failed", error);
      return res.status(500).json({ message: "Failed to generate resume" });
    }
  },
);

resumeRouter.get("/resumes", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { search, stack } = req.query;

  const query: any = { userId: req.user._id };
  if (stack) {
    query.stackTags = { $in: [stack] };
  }
  if (search) {
    query.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { jobDescription: { $regex: String(search), $options: "i" } },
    ];
  }

  try {
    const resumes = await Resume.find(query).sort({ createdAt: -1 });
    return res.json(resumes);
  } catch (error) {
    console.error("[resume] list failed", error);
    return res.status(500).json({ message: "Failed to list resumes" });
  }
});

resumeRouter.get(
  "/resumes/:id",
  authMiddleware,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      return res.json(resume);
    } catch (error) {
      console.error("[resume] get failed", error);
      return res.status(500).json({ message: "Failed to get resume" });
    }
  },
);

resumeRouter.put(
  "/resumes/:id",
  authMiddleware,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { content, style, jobLink } = req.body ?? {};

    try {
      const resume = await Resume.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        {
          ...(content ? { content } : {}),
          ...(style ? { style } : {}),
          ...(jobLink !== undefined ? { jobLink } : {}),
        },
        { new: true },
      );

      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      await UserActionLog.create({
        userId: req.user._id,
        actionType: "RESUME_EDITED",
        metadata: { resumeId: resume._id },
      });

      return res.json(resume);
    } catch (error) {
      console.error("[resume] update failed", error);
      return res.status(500).json({ message: "Failed to update resume" });
    }
  },
);

