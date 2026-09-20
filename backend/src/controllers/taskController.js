import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as taskService from "../services/taskService.js";

export const createTask = asyncHandler(async (req, res) => {
  const board = await taskService.getBoardOr404(req.params.boardId);
  if (board.workspace.toString() !== req.workspace._id.toString()) {
    throw new ApiError(404, "Board not found in this workspace");
  }
  const task = await taskService.createTask(board, req.body, req.user._id);
  sendSuccess(res, 201, "Task created", { task });
});

export const listTasks = asyncHandler(async (req, res) => {
  const board = await taskService.getBoardOr404(req.params.boardId);
  if (board.workspace.toString() !== req.workspace._id.toString()) {
    throw new ApiError(404, "Board not found in this workspace");
  }
  const { tasks, pagination } = await taskService.listTasksForBoard(board._id, req.query);
  sendSuccess(res, 200, "Tasks fetched", { tasks, pagination });
});

export const updateTask = asyncHandler(async (req, res) => {
  const existing = await taskService.getTaskOr404(req.params.taskId);
  if (existing.workspace.toString() !== req.workspace._id.toString()) {
    throw new ApiError(404, "Task not found in this workspace");
  }
  const task = await taskService.updateTask(req.params.taskId, req.body);
  sendSuccess(res, 200, "Task updated", { task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const existing = await taskService.getTaskOr404(req.params.taskId);
  if (existing.workspace.toString() !== req.workspace._id.toString()) {
    throw new ApiError(404, "Task not found in this workspace");
  }
  await taskService.deleteTask(req.params.taskId);
  sendSuccess(res, 200, "Task deleted", null);
});
