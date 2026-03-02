import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User, type UserDocument } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: UserDocument;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice("Bearer ".length);
  try {
    if (!env.jwtSecret) {
      throw new Error("JWT_SECRET not configured");
    }
    const payload = jwt.verify(token, env.jwtSecret) as { userId: string };
    void User.findById(payload.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        console.error("[authMiddleware] Failed to load user", err);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

