import Workspace from "../models/Workspace.js";
import Board from "../models/Board.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export async function createWorkspace({ name, description, ownerId }) {
  const workspace = await Workspace.create({
    name,
    description,
    owner: ownerId,
    members: [{ user: ownerId, role: "admin" }],
  });
  return workspace;
}

export async function listWorkspacesForUser(userId) {
  return Workspace.find({ "members.user": userId })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getWorkspaceDetail(workspace) {
  return Workspace.findById(workspace._id)
    .populate("members.user", "name email avatarColor")
    .populate("owner", "name email avatarColor")
    .lean();
}

export async function inviteMember(workspace, email, role = "member") {
  const invitee = await User.findOne({ email });
  if (!invitee) {
    throw new ApiError(404, "No user found with that email");
  }
  const alreadyMember = workspace.members.some(
    (m) => m.user.toString() === invitee._id.toString()
  );
  if (alreadyMember) {
    throw new ApiError(400, "User is already a member of this workspace");
  }
  workspace.members.push({ user: invitee._id, role });
  await workspace.save();
  return workspace;
}

export async function updateMemberRole(workspace, targetUserId, role) {
  const entry = workspace.members.find(
    (m) => m.user.toString() === targetUserId
  );
  if (!entry) {
    throw new ApiError(404, "Member not found in this workspace");
  }
  entry.role = role;
  await workspace.save();
  return workspace;
}

export async function deleteWorkspaceCascade(workspaceId) {
  const boards = await Board.find({ workspace: workspaceId }).select("_id");
  const boardIds = boards.map((b) => b._id);
  await Task.deleteMany({ board: { $in: boardIds } });
  await Board.deleteMany({ workspace: workspaceId });
  await Workspace.findByIdAndDelete(workspaceId);
}
