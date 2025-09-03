import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = async () => {
  try {
    const uri = `${process.env.MONGODB_URI}/${DB_NAME}?retryWrites=true&w=majority`;
    const conn = await mongoose.connect(uri, {});
    console.log("MongoDB connected to:", conn.connection.host);
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
};
export default connectDB;
