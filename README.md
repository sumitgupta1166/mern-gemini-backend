# Knowledge Hub - Backend
## Setup
1. copy `.env.example` -> `.env` and fill values (MONGODB_URI, AI_API_URL,
AI_API_KEY, JWT_SECRET)
2. npm install
3. npm run seed (optional)
4. npm run dev
API base: http://localhost:8000/api/v1
Auth: POST /api/v1/auth/register, POST /api/v1/auth/login (returns token)
Docs: CRUD under /api/v1/docs (auth required)
Search: /api/v1/search/text?q=... or /api/v1/search/semantic?q=...
QA: POST /api/v1/qa/ask { question }
Notes: configure AI endpoints in src/services/ai.service.js to match your
provider (Gemini/OpenAI/etc.)