import Task from "../models/Task.js";
import Board from "../models/Board.js";
import { ApiError } from "../utils/ApiError.js";

export async function createBoard({ workspaceId, name, description, createdBy }) {
  return Board.create({ workspace: workspaceId, name, description, createdBy });
}

export async function listBoards(workspaceId) {
  return Board.find({ workspace: workspaceId }).sort({ createdAt: -1 }).lean();
}

export async function getBoardOr404(boardId) {
  const board = await Board.findById(boardId);
  if (!board) throw new ApiError(404, "Board not found");
  return board;
}

export async function updateBoard(board, { name, description }) {
  board.name = name;
  board.description = description;
  await board.save();
  return board;
}

export async function deleteBoardCascade(boardId) {
  await Task.deleteMany({ board: boardId });
  await Board.findByIdAndDelete(boardId);
}

export async function createTask(board, payload, createdBy) {
  return Task.create({
    board: board._id,
    workspace: board.workspace,
    title: payload.title,
    description: payload.description,
    status: payload.status,
    priority: payload.priority,
    assignee: payload.assignee || null,
    dueDate: payload.dueDate || null,
    createdBy,
  });
}

export async function listTasksForBoard(boardId, filters = {}) {
  const { status, priority, search, page = 1, limit = 50 } = filters;

  const query = { board: boardId };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) query.title = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("assignee", "name email avatarColor")
      .populate("createdBy", "name email avatarColor")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function updateTask(taskId, updates) {
  const task = await Task.findByIdAndUpdate(taskId, updates, {
    new: true,
    runValidators: true,
  }).populate("assignee", "name email avatarColor");
  if (!task) throw new ApiError(404, "Task not found");
  return task;
}

export async function deleteTask(taskId) {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw new ApiError(404, "Task not found");
  return task;
}

export async function getTaskOr404(taskId) {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");
  return task;
}
