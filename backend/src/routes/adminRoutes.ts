import { Router } from "express";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { User } from "../models/User.js";
import { UserActionLog } from "../models/UserActionLog.js";
import { Resume } from "../models/Resume.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware, requireRole("admin"));

adminRouter.get("/admin/users", async (_req: AuthRequest, res) => {
  try {
    const users = await User.find({}, "email role createdAt").sort({
      createdAt: -1,
    });
    return res.json(users);
  } catch (error) {
    console.error("[admin] list users failed", error);
    return res.status(500).json({ message: "Failed to list users" });
  }
});

adminRouter.get("/admin/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resumes = await Resume.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    return res.json({ user, resumes });
  } catch (error) {
    console.error("[admin] get user failed", error);
    return res.status(500).json({ message: "Failed to load user" });
  }
});

adminRouter.get("/admin/actions", async (req, res) => {
  const { userId, type, from, to } = req.query;

  const query: any = {};
  if (userId) {
    query.userId = userId;
  }
  if (type) {
    query.actionType = type;
  }
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(String(from));
    if (to) query.createdAt.$lte = new Date(String(to));
  }

  try {
    const actions = await UserActionLog.find(query)
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json(actions);
  } catch (error) {
    console.error("[admin] list actions failed", error);
    return res.status(500).json({ message: "Failed to list actions" });
  }
});

