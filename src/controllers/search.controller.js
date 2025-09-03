import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Doc } from "../models/doc.model.js";
import * as ai from "../services/ai.service.js";
function cosine(a, b) {
if (!a || !b || a.length !== b.length) return -1;
let dot = 0;
let na = 0;
let nb = 0;
for (let i = 0; i < a.length; i++) {
dot += a[i] * b[i];
na += a[i] * a[i];
nb += b[i] * b[i];
}
if (na === 0 || nb === 0) return -1;
return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
export const textSearch = asyncHandler(async (req, res) => {
const q = req.query.q || "";
if (!q.trim()) return res.status(200).json(new ApiResponse(200, [], "Empty query"));
const docs = await Doc.find({ $text: { $search:
q } }).limit(50).populate("createdBy", "name");
return res.status(200).json(new ApiResponse(200, docs, "Text results"));

});
export const semanticSearch = asyncHandler(async (req, res) => {
const q = req.query.q || "";
if (!q.trim()) return res.status(200).json(new ApiResponse(200, [], "Empty query"));
const qEmb = await ai.embed(q).catch(() => null);
if (!qEmb) return res.status(200).json(new ApiResponse(200, [], "Embedding failed"));
// load docs with embeddings
const docs = await Doc.find({ embedding: { $exists: true, $ne:
[] } }).limit(500).populate("createdBy", "name");
const scored = docs.map((d) => ({ doc: d, score: cosine(qEmb, d.embedding ||
[]) })).filter((x) => x.score > -1);
scored.sort((a, b) => b.score - a.score);
const top = scored.slice(0, parseInt(req.query.limit || "10", 10)).map((s) =>
({ ...s.doc.toObject(), score: s.score }));
return res.status(200).json(new ApiResponse(200, top, "Semantic results"));
});