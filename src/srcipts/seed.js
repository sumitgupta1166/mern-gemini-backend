import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import connectDB from "../db/index.js";
import { User } from "../models/user.model.js";
import { Doc } from "../models/doc.model.js";
const run = async () => {
  try {
    await connectDB();
    // create admin + user
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const userEmail = process.env.SEED_USER_EMAIL || "user@example.com";
    await User.deleteMany({});
    await Doc.deleteMany({});
    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: "password123",
      role: "admin",
    });
    const user = await User.create({
      name: "User",
      email: userEmail,
      password: "password123",
      role: "user",
    });
    const d1 = await Doc.create({
      title: "Getting started with project",
      content: "This is a starter doc about how to run the project.",
      summary: "How to run the project locally",
      tags: ["getting-started"],
      createdBy: admin._id,
    });
    const d2 = await Doc.create({
      title: "Team practices",
      content: "Work items, coding standards and PR process.",
      summary: "Team practices and standards",
      tags: ["process", "standards"],
      createdBy: user._id,
    });
    console.log(
      "Seeded users and docs. Admin:",
      adminEmail,
      "User:",
      userEmail
    );
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
