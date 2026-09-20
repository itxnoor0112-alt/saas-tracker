import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const workspaceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional().default(""),
});

export const inviteSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["admin", "member"]).optional().default("member"),
});

export const roleUpdateSchema = z.object({
  role: z.enum(["admin", "member"]),
});

export const boardSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional().default(""),
});

export const taskCreateSchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(1000).optional().default(""),
  status: z.enum(["todo", "in-progress", "review", "done"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  assignee: z.string().trim().length(24).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(2).max(140).optional(),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(["todo", "in-progress", "review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignee: z.string().trim().length(24).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const taskQuerySchema = z.object({
  status: z.enum(["todo", "in-progress", "review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  search: z.string().trim().max(140).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});
