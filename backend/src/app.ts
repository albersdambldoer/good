import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRoutes";
import { profileRouter } from "./routes/profileRoutes";
import { resumeRouter } from "./routes/resumeRoutes";
import { adminRouter } from "./routes/adminRoutes";

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

