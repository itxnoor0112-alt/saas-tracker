import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as taskService from "../services/taskService.js";

export const createBoard = asyncHandler(async (req, res) => {
  const board = await taskService.createBoard({
    workspaceId: req.workspace._id,
    name: req.body.name,
    description: req.body.description,
    createdBy: req.user._id,
  });
  sendSuccess(res, 201, "Board created", { board });
});

export const listBoards = asyncHandler(async (req, res) => {
  const boards = await taskService.listBoards(req.workspace._id);
  sendSuccess(res, 200, "Boards fetched", { boards });
});

export const getBoard = asyncHandler(async (req, res) => {
  const board = await taskService.getBoardOr404(req.params.boardId);
  if (board.workspace.toString() !== req.workspace._id.toString()) {
    throw new ApiError(404, "Board not found in this workspace");
  }
  sendSuccess(res, 200, "Board fetched", { board });
});
