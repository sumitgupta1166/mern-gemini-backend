import mongoose from "mongoose";
const versionSchema = new mongoose.Schema(
{
title: String,
content: String,
summary: String,
tags: [String],
createdAt: { type: Date, default: Date.now },
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
},
{ _id: false }
);
const docSchema = new mongoose.Schema(
{
title: { type: String, required: true, text: true },
content: { type: String, required: true, text: true },
tags: [{ type: String, index: true }],
summary: String,
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required:
true },
versions: [versionSchema],
embedding: { type: [Number], default: [] } // optional numeric vector for semantic search
},
{ timestamps: true }
);
// Text index for quick text search
docSchema.index({ title: "text", content: "text", summary: "text", tags:
"text" });
export const Doc = mongoose.model("Doc", docSchema);