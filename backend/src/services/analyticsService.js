import Task from "../models/Task.js";
import Board from "../models/Board.js";

export async function buildWorkspaceAnalytics(workspaceId) {
  const boards = await Board.find({ workspace: workspaceId }).select("_id name");

  const statusAgg = await Task.aggregate([
    { $match: { workspace: workspaceId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const priorityAgg = await Task.aggregate([
    { $match: { workspace: workspaceId } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  const memberAgg = await Task.aggregate([
    { $match: { workspace: workspaceId, assignee: { $ne: null } } },
    { $group: { _id: "$assignee", total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } } } },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { _id: 0, userId: "$user._id", name: "$user.name", total: 1, done: 1 } },
  ]);

  const boardAgg = await Task.aggregate([
    { $match: { workspace: workspaceId } },
    { $group: { _id: "$board", total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } } } },
  ]);

  const boardMap = new Map(boards.map((b) => [b._id.toString(), b.name]));
  const perBoard = boardAgg.map((b) => ({
    boardId: b._id,
    name: boardMap.get(b._id.toString()) || "Unknown board",
    total: b.total,
    done: b.done,
  }));

  const totalTasks = statusAgg.reduce((sum, s) => sum + s.count, 0);
  const doneTasks = statusAgg.find((s) => s._id === "done")?.count || 0;

  return {
    totalTasks,
    completionRate: totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100),
    byStatus: statusAgg.map((s) => ({ status: s._id, count: s.count })),
    byPriority: priorityAgg.map((p) => ({ priority: p._id, count: p.count })),
    byMember: memberAgg,
    byBoard: perBoard,
  };
}
