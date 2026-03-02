import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRoutes.js";
import { profileRouter } from "./routes/profileRoutes.js";
import { resumeRouter } from "./routes/resumeRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use(profileRouter);
app.use(resumeRouter);
app.use(adminRouter);

