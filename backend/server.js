import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { connectDB, readLocalFile, writeLocalFile, isStrictMongo } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import UserModel from "./models/User.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);
const FRONTEND_URL = (  process.env.FRONTEND_URL ||  "http://localhost:5173").trim().replace(/\/+$/, "");

const app = express();

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: "12mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/media", mediaRoutes);

async function seedDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@test.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  if (isStrictMongo()) {
    const adminCount = await UserModel.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      await UserModel.create({ email, passwordHash, role: "admin" });
      console.log(`🟩 Default administrator created: ${email}`);
    }
    return;
  }

  const users = readLocalFile("users.json");
  if (users.length === 0) {
    users.push({ _id: "u_default_seed", email, passwordHash, role: "admin" });
    writeLocalFile("users.json", users);
    console.log(`🟩 Local preview administrator created: ${email}`);
  }
}

async function startServer() {
  try {
    await connectDB();
    await seedDefaultAdmin();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 ENDLESS Moments backend listening on port ${PORT}`);
      console.log(`🌐 Allowed frontend origin: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("❌ Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
