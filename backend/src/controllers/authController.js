import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as authService from "../services/authService.js";

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, authService.refreshCookieOptions());
}

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 201, "Account created", { user, accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 200, "Logged in", { user, accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.rotateRefreshToken(token);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 200, "Token refreshed", { user, accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.revokeRefreshTokens(req.user._id);
  res.clearCookie("refreshToken", { path: "/api/auth" });
  sendSuccess(res, 200, "Logged out", null);
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Current user", { user: req.user.toSafeObject() });
});
