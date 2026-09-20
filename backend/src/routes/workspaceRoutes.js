import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { loadWorkspace, requireWorkspaceAdmin } from "../middleware/workspaceAccess.js";
import { validate } from "../utils/validate.js";
import {
  workspaceSchema,
  updateWorkspaceSchema,
  inviteSchema,
  roleUpdateSchema,
  boardSchema,
  boardUpdateSchema,
} from "../utils/schemas.js";
import * as workspaceController from "../controllers/workspaceController.js";
import * as boardController from "../controllers/boardController.js";
import * as analyticsController from "../controllers/analyticsController.js";
import taskRouter from "./taskRoutes.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(workspaceSchema), workspaceController.createWorkspace);
router.get("/", workspaceController.listWorkspaces);

router.get("/:workspaceId", loadWorkspace(), workspaceController.getWorkspace);
router.patch(
  "/:workspaceId",
  loadWorkspace(),
  requireWorkspaceAdmin,
  validate(updateWorkspaceSchema),
  workspaceController.updateWorkspace
);
router.delete(
  "/:workspaceId",
  loadWorkspace(),
  requireWorkspaceAdmin,
  workspaceController.deleteWorkspace
);

router.post(
  "/:workspaceId/invite",
  loadWorkspace(),
  requireWorkspaceAdmin,
  validate(inviteSchema),
  workspaceController.inviteMember
);

router.patch(
  "/:workspaceId/members/:userId",
  loadWorkspace(),
  requireWorkspaceAdmin,
  validate(roleUpdateSchema),
  workspaceController.updateMemberRole
);

router.delete(
  "/:workspaceId/members/:userId",
  loadWorkspace(),
  requireWorkspaceAdmin,
  workspaceController.removeMember
);

router.post(
  "/:workspaceId/boards",
  loadWorkspace(),
  validate(boardSchema),
  boardController.createBoard
);
router.get("/:workspaceId/boards", loadWorkspace(), boardController.listBoards);
router.get("/:workspaceId/boards/:boardId", loadWorkspace(), boardController.getBoard);
router.patch(
  "/:workspaceId/boards/:boardId",
  loadWorkspace(),
  requireWorkspaceAdmin,
  validate(boardUpdateSchema),
  boardController.updateBoard
);
router.delete(
  "/:workspaceId/boards/:boardId",
  loadWorkspace(),
  requireWorkspaceAdmin,
  boardController.deleteBoard
);

router.get("/:workspaceId/analytics", loadWorkspace(), analyticsController.getWorkspaceAnalytics);

router.use("/:workspaceId", loadWorkspace(), taskRouter);

export default router;
