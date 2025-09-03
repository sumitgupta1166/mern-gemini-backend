import { Router } from "express";
import { textSearch, semanticSearch } from "../controllers/search.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/text", requireAuth, textSearch);
router.get("/semantic", requireAuth, semanticSearch);
export default router;