import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), type: "access" }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), type: "refresh", tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

export function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: "/api/auth",
  };
}

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, "An account with this email already exists");
  }
  const user = await User.create({ name, email, password });
  return {
    user: user.toSafeObject(),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password +tokenVersion");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  const match = await user.comparePassword(password);
  if (!match) {
    throw new ApiError(401, "Invalid email or password");
  }
  return {
    user: user.toSafeObject(),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

export async function rotateRefreshToken(token) {
  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Refresh token invalid or expired");
  }
  if (payload.type !== "refresh") {
    throw new ApiError(401, "Invalid token type");
  }
  const user = await User.findById(payload.sub).select("+tokenVersion");
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw new ApiError(401, "Refresh token has been revoked");
  }
  return {
    user: user.toSafeObject(),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

export async function revokeRefreshTokens(userId) {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}
