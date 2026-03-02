import { Router } from "express";
import mongoose from "mongoose";
import { login, signUp } from "../services/authService";

export const authRouter = Router();

function getAuthErrorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    if (error.message === "Email already in use")
      return { message: error.message, status: 409 };
    if (error.message === "Invalid credentials")
      return { message: error.message, status: 401 };
    if (error.message === "JWT_SECRET not configured")
      return { message: "Server configuration error. Please try again later.", status: 503 };
    if (error instanceof mongoose.Error.ValidationError) {
      const first = Object.values(error.errors)[0];
      const msg = first && "message" in first ? String(first.message) : "Validation failed";
      return { message: msg, status: 400 };
    }
    return { message: error.message, status: 500 };
  }
  return { message: "Something went wrong", status: 500 };
}

authRouter.post("/signup", async (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: "email, password and name are required" });
  }

  try {
    const { user, token } = await signUp({ email, password, name });
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("[auth/signup]", error);
    const { message, status } = getAuthErrorMessage(error);
    return res.status(status).json({ message });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const { user, token } = await login({ email, password });
    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("[auth/login]", error);
    const { message, status } = getAuthErrorMessage(error);
    return res.status(status).json({ message });
  }
});

