import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as workspaceService from "../services/workspaceService.js";

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace({
    name: req.body.name,
    description: req.body.description,
    ownerId: req.user._id,
  });
  sendSuccess(res, 201, "Workspace created", { workspace });
});

export const listWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.listWorkspacesForUser(req.user._id);
  sendSuccess(res, 200, "Workspaces fetched", { workspaces });
});

export const getWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceDetail(req.workspace);
  sendSuccess(res, 200, "Workspace fetched", { workspace, role: req.workspaceRole });
});

export const inviteMember = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.inviteMember(
    req.workspace,
    req.body.email,
    req.body.role
  );
  sendSuccess(res, 200, "Member invited", { workspace });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateMemberRole(
    req.workspace,
    req.params.userId,
    req.body.role
  );
  sendSuccess(res, 200, "Member role updated", { workspace });
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  await workspaceService.deleteWorkspaceCascade(req.workspace._id);
  sendSuccess(res, 200, "Workspace deleted", null);
});
