import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

async function callGemini(model, prompt) {
  const url = `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response";
}

export async function qaAnswer(question, contexts = []) {
  let prompt;

  if (contexts.length > 0) {
    const ctx = contexts
      .map(
        (c, i) =>
          `Document #${i + 1}\nTitle: ${c.title}\nSummary: ${c.summary}\nContent: ${c.content}`
      )
      .join("\n\n");

    prompt = `
You are a helpful research assistant. 
Answer the following user question using ONLY the provided documents. 
- Be concise and structured. 
- If the answer cannot be found in the documents, say clearly: "Not enough information in the provided context."

User Question: ${question}

Documents:
${ctx}
    `;
  } else {
    prompt = `
You are a helpful assistant. 
Provide a clear, structured, and factual answer. 
Use bullet points or short paragraphs. Avoid unnecessary text. 

User Question: ${question}
    `;
  }

  return await callGemini("gemini-2.5-flash", prompt); // upgraded model for better quality
}
