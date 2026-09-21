import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { connectDB, getDbState, readLocalFile, writeLocalFile } from "./config/db.js";
import MongoUserModel from "./models/User.js";

dotenv.config();

const createAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL || "admin@test.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  console.log(`🚀 Starting admin user creation helper...`);
  console.log(`📧 Target admin email: ${email}`);

  const hasMongo = await connectDB();
  const passwordHash = await bcrypt.hash(password, 10);

  if (hasMongo && getDbState()) {
    try {
      const existingUser = await MongoUserModel.findOne({ email });
      if (existingUser) {
        console.log(`⚠️  User with email '${email}' already exists in MongoDB.`);
      } else {
        await MongoUserModel.create({
          email,
          passwordHash,
          role: "admin"
        });
        console.log(`🟩 Secure Admin user created successfully in MongoDB!`);
      }
    } catch (err) {
      console.error(`❌ Mongoose failed to insert Admin:`, err.message);
    } finally {
      await mongoose.connection.close();
      console.log("🔒 MongoDB connection closed.");
    }
  } else {
    // Write admin to local mock store
    const localDbDir = path.join(process.cwd(), "local_db");
    if (!fs.existsSync(localDbDir)) {
      fs.mkdirSync(localDbDir, { recursive: true });
    }

    const users = readLocalFile("users.json");
    const existing = users.find(u => u.email === email);

    if (existing) {
      console.log(`⚠️  User with email '${email}' already exists in local JSON store.`);
    } else {
      users.push({
        _id: `u_${Date.now()}`,
        email,
        passwordHash,
        role: "admin"
      });
      writeLocalFile("users.json", users);
      console.log(`🟩 Secure Admin user created successfully in local JSON store!`);
    }
  }

  console.log(`✨ Process complete. You can log in with:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
};

createAdminUser();
