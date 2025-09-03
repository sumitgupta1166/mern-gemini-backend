import { Router } from "express";
import {
createDoc,
getDoc,
listDocs,
updateDoc,
deleteDoc,
summarizeDoc,
generateTagsForDoc,
getVersions
} from "../controllers/doc.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/", requireAuth, createDoc);
router.get("/", requireAuth, listDocs);
router.get("/:id", requireAuth, getDoc);
router.put("/:id", requireAuth, updateDoc);
router.delete("/:id", requireAuth, deleteDoc);
15
router.post("/:id/summarize", requireAuth, summarizeDoc);
router.post("/:id/tags", requireAuth, generateTagsForDoc);
router.get("/:id/versions", requireAuth, getVersions);
export default router;