import { Router } from "express";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";
import { UserActionLog } from "../models/UserActionLog.js";

export const profileRouter = Router();

profileRouter.get("/me", authMiddleware, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = req.user;
  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile,
  });
});

profileRouter.put("/me/profile", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const profileUpdate = req.body?.profile;
  if (!profileUpdate) {
    return res.status(400).json({ message: "profile is required" });
  }

  try {
    req.user.set("profile", profileUpdate);
    await req.user.save();
    await UserActionLog.create({
      userId: req.user._id,
      actionType: "PROFILE_UPDATED",
      metadata: {},
    });
    return res.json({ profile: req.user.profile });
  } catch (error) {
    console.error("[profile] update failed", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

