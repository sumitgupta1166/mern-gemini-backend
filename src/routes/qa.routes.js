import { Router } from "express";
import { ask } from "../controllers/qa.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/ask", requireAuth, ask);
export default router;