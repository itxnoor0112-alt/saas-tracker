import { Router } from "express";
import { register, login, refresh, logout, me } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../utils/validate.js";
import { registerSchema, loginSchema } from "../utils/schemas.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
