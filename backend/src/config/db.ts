import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectToDatabase() {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(env.mongoUri);
  // Simple success log; in production you might use a logger
  console.log("[db] Connected to MongoDB");
}

