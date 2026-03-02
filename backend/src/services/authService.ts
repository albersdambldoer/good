import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, type UserDocument } from "../models/User.js";
import { env } from "../config/env.js";
import { UserActionLog } from "../models/UserActionLog.js";

interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

interface LoginParams {
  email: string;
  password: string;
}

function createToken(user: UserDocument) {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: "1h",
  });
}

export async function signUp(params: SignUpParams) {
  const existing = await User.findOne({ email: params.email });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(params.password, 10);
  const user = await User.create({
    email: params.email,
    passwordHash,
    role: "user",
    profile: {
      name: params.name,
      headline: "",
      location: "",
      phone: "",
      social: {},
      languages: [],
      skills: [],
      experiences: [],
      educations: [],
    },
  });

  const token = createToken(user);
  await UserActionLog.create({
    userId: user._id,
    actionType: "PROFILE_UPDATED",
    metadata: { reason: "signup" },
  });

  return { user, token };
}

export async function login(params: LoginParams) {
  const user = await User.findOne({ email: params.email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const matches = await bcrypt.compare(params.password, user.passwordHash);
  if (!matches) {
    throw new Error("Invalid credentials");
  }

  const token = createToken(user);
  await UserActionLog.create({
    userId: user._id,
    actionType: "LOGIN",
    metadata: {},
  });

  return { user, token };
}

