import { Router } from "express";
import { login, signUp } from "../services/authService.js";

export const authRouter = Router();

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
    const message =
      error instanceof Error ? error.message : "Failed to sign up";
    const status = message === "Email already in use" ? 409 : 500;
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
    const message =
      error instanceof Error ? error.message : "Failed to login";
    const status = message === "Invalid credentials" ? 401 : 500;
    return res.status(status).json({ message });
  }
});

