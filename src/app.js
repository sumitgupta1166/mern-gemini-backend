import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import docRouter from "./routes/doc.routes.js";
import searchRouter from "./routes/search.routes.js";
import qaRouter from "./routes/qa.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/docs", docRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/qa", qaRouter);
app.get("/", (req, res) => res.json({ ok: true }));
app.use(errorHandler);
export { app };
