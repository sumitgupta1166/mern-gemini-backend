import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDB from "./db/index.js";
import { app } from "./app.js";
connectDB()
.then(() => {
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
})
.catch((err) => {
console.error("Startup error:", err);
process.exit(1);
});