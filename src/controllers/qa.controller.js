import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Doc } from "../models/doc.model.js";
import * as ai from "../services/ai.service.js";
export const ask = asyncHandler(async (req, res) => {
const { question } = req.body;
if (!question) return res.status(400).json({ success: false, message:
"question required" });
// get top relevant docs by text search first
const q = question;
const textResults = await Doc.find({ $text: { $search:
q } }).limit(5).select("title summary content");
// prepare contexts
const contexts = textResults.map((d) => ({ title: d.title, summary:
d.summary, content: d.content }));
const answer = await ai.qaAnswer(question, contexts).catch((e) => {
console.warn("QA error:", e.message);
return null;
});
return res.status(200).json(new ApiResponse(200, { answer, contexts },
"Answer"));
});