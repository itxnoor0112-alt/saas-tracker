import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as analyticsService from "../services/analyticsService.js";

export const getWorkspaceAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.buildWorkspaceAnalytics(req.workspace._id);
  sendSuccess(res, 200, "Analytics fetched", { analytics });
});
