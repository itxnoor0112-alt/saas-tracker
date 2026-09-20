import { Router } from "express";
import { validate } from "../utils/validate.js";
import { validateQuery } from "../utils/validateQuery.js";
import { taskCreateSchema, taskUpdateSchema, taskQuerySchema } from "../utils/schemas.js";
import * as taskController from "../controllers/taskController.js";

const router = Router({ mergeParams: true });

router.post(
  "/boards/:boardId/tasks",
  validate(taskCreateSchema),
  taskController.createTask
);
router.get(
  "/boards/:boardId/tasks",
  validateQuery(taskQuerySchema),
  taskController.listTasks
);
router.patch("/tasks/:taskId", validate(taskUpdateSchema), taskController.updateTask);
router.delete("/tasks/:taskId", taskController.deleteTask);

export default router;
