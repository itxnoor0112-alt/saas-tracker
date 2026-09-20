import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Workspace from "../models/Workspace.js";

export const loadWorkspace = (paramName = "workspaceId") =>
  asyncHandler(async (req, res, next) => {
    const workspace = await Workspace.findById(req.params[paramName]);
    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }
    const role = workspace.roleOf(req.user._id);
    if (!role) {
      throw new ApiError(403, "You are not a member of this workspace");
    }
    req.workspace = workspace;
    req.workspaceRole = role;
    next();
  });

export const requireWorkspaceAdmin = (req, res, next) => {
  if (req.workspaceRole !== "admin") {
    throw new ApiError(403, "Admin role required for this action");
  }
  next();
};
