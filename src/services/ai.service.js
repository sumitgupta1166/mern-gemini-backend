// import fetch from "node-fetch";

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// /**
//  * Generic Gemini request
//  */
// async function callGemini(model, prompt) {
//   const url = `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
//   const body = {
//     contents: [{ parts: [{ text: prompt }] }]
//   };

//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body)
//   });

//   if (!res.ok) {
//     throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
//   }

//   const data = await res.json();
//   return (
//     data?.candidates?.[0]?.content?.parts?.[0]?.text ||
//     "⚠️ No response from Gemini"
//   );
// }

// // Example wrappers
// export async function summarize(text) {
//   const prompt = `Summarize this in 3 sentences:\n\n${text}`;
//   return await callGemini("gemini-2.5-flash-lite", prompt);
// }

// export async function generateTags(text) {
//   const prompt = `Generate 5 tags for this text, as JSON array of lowercase strings:\n\n${text}`;
//   const raw = await callGemini("gemini-2.5-flash-lite", prompt);

//   try {
//     return JSON.parse(raw);
//   } catch {
//     return raw.split(/[,\\n]+/).map(t => t.trim().toLowerCase()).slice(0, 5);
//   }
// }

// export async function qaAnswer(question, contexts = []) {
//   const ctx = contexts
//     .map(c => `Title: ${c.title}\nSummary: ${c.summary}\nContent: ${c.content}`)
//     .join("\n\n");

//   const prompt = `Answer based on context:\n${ctx}\n\nQuestion: ${question}`;
//   return await callGemini("gemini-2.5-flash-lite", prompt);
// }

// import fetch from "node-fetch";

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// // Generic Gemini call
// async function callGemini(model, prompt) {
//   const url = `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
//   const body = {
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: prompt }]
//       }
//     ]
//   };

//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body)
//   });

//   if (!res.ok) {
//     throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
//   }

//   const data = await res.json();
//   return data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response";
// }

// // Wrap functions
// export async function summarize(text) {
//   return await callGemini("gemini-2.5-flash-lite", `Summarize this in 3 sentences:\n\n${text}`);
// }

// export async function generateTags(text) {
//   const raw = await callGemini("gemini-2.5-flash-lite", `Generate 5 lowercase tags as a JSON array:\n\n${text}`);
//   try {
//     return JSON.parse(raw);
//   } catch {
//     return raw.split(/[,\\n]+/).map(t => t.trim()).filter(Boolean).slice(0, 5);
//   }
// }

// export async function qaAnswer(question, contexts = []) {
//   // If contexts exist, include them, else just send user question directly
//   let prompt;
//   if (contexts.length > 0) {
//     const ctx = contexts
//       .map(c => `Title: ${c.title}\nSummary: ${c.summary}\nContent: ${c.content}`)
//       .join("\n\n");
//     prompt = `Answer the question based on the context:\n${ctx}\n\nQuestion: ${question}`;
//   } else {
//     // Directly forward the user’s question
//     prompt = question;
//   }
//   return await callGemini("gemini-2.5-flash-lite", prompt);
// }

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
