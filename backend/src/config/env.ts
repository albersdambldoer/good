import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  mongoUri: process.env.MONGO_URI ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  aiApiKey: process.env.AI_API_KEY ?? "",
};

if (!env.mongoUri) {
  console.warn("[env] MONGO_URI is not set.");
}

if (!env.jwtSecret) {
  console.warn("[env] JWT_SECRET is not set.");
}

