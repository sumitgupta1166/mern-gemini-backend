import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Doc } from "../models/doc.model.js";
import * as ai from "../services/ai.service.js";
// Create doc (auto-summary + tags + embedding optional)
export const createDoc = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) throw new ApiError(400, "title and content required");
  const createdBy = req.user._id;
  // auto-summary and tags (best-effort)
  let summary = req.body.summary || null;
  let tags = req.body.tags || [];
  let embedding = [];
  try {
    if (!summary) summary = await ai.summarize(content).catch(() => null);
    if ((!tags || tags.length === 0) && summary)
      tags = await ai
        .generateTags(
          `$
{title}\n\n${summary}`
        )
        .catch(() => []);
    // try to compute embedding
    const emb = await ai
      .embed(`${title}\n\n${summary || content}`)
      .catch(() => null);
    if (Array.isArray(emb)) embedding = emb;
  } catch (e) {
    console.warn("AI enrichment failed:", e.message);
  }
  const doc = await Doc.create({
    title,
    content,
    summary,
    tags,
    createdBy,
    embedding,
  });
  return res.status(201).json(new ApiResponse(201, doc, "Doc created"));
});
export const getDoc = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const doc = await Doc.findById(id).populate("createdBy", "name email");
  if (!doc) throw new ApiError(404, "Doc not found");
  return res.status(200).json(new ApiResponse(200, doc, "Doc fetched"));
});
export const listDocs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(50, parseInt(req.query.limit || "20", 10));
  const skip = (page - 1) * limit;
  const docs = await Doc.find({})
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name email");
  return res
    .status(200)
    .json(new ApiResponse(200, { data: docs, page, limit }, "Docs"));
});
export const updateDoc = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const doc = await Doc.findById(id);
  if (!doc) throw new ApiError(404, "Doc not found");
  // only owner or admin can edit
  if (
    doc.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Forbidden");
  }
  const { title, content } = req.body;
  // store previous version
  doc.versions = doc.versions || [];
  doc.versions.unshift({
    title: doc.title,
    content: doc.content,
    summary: doc.summary,
    tags: doc.tags,
    createdBy: doc.createdBy,
  });
  if (title) doc.title = title;
  if (content) doc.content = content;
  // recompute summary/tags/embedding if requested or if content changed
  if (content || req.body.forceAI) {
    try {
      const summary = await ai.summarize(doc.content).catch(() => null);
      const tags =
        (await ai
          .generateTags(`${doc.title}\n\n${summary || doc.content}`)
          .catch(() => [])) || [];
      const emb = await ai
        .embed(
          `${doc.title}\n\n${summary || doc.content}
`
        )
        .catch(() => null);
      if (summary) doc.summary = summary;
      if (tags && tags.length) doc.tags = tags;
      if (Array.isArray(emb)) doc.embedding = emb;
    } catch (e) {
      console.warn("AI enrichment failed on update:", e.message);
    }
  }
  await doc.save();
  return res.status(200).json(new ApiResponse(200, doc, "Doc updated"));
});
export const deleteDoc = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const doc = await Doc.findById(id);
  if (!doc) throw new ApiError(404, "Doc not found");
  if (
    doc.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Forbidden");
  }
  await doc.deleteOne();
  return res.status(200).json(new ApiResponse(200, null, "Doc deleted"));
});
export const summarizeDoc = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const doc = await Doc.findById(id);
  if (!doc) throw new ApiError(404, "Doc not found");
  const summary = await ai.summarize(doc.content).catch(() => null);
  if (summary) {
    doc.summary = summary;
    await doc.save();
  }
  return res.status(200).json(new ApiResponse(200, { summary }, "Summarized"));
});
export const generateTagsForDoc = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const doc = await Doc.findById(id);
  if (!doc) throw new ApiError(404, "Doc not found");
  const tags = await ai
    .generateTags(`${doc.title}\n\n${doc.summary || doc.content}`)
    .catch(() => []);
  if (tags && tags.length) {
    doc.tags = tags;
    await doc.save();
  }
  return res.status(200).json(new ApiResponse(200, { tags }, "Tags generated"));
});
export const getVersions = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const doc = await Doc.findById(id).select("versions");
  if (!doc) throw new ApiError(404, "Doc not found");
  return res
    .status(200)
    .json(new ApiResponse(200, doc.versions || [], "Versions"));
});
