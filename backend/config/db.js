import mongoose from "mongoose";
import fs from "fs";
import path from "path";

let isMongoConnected = false;

export const getMongoUri = () => process.env.MONGODB_URI || process.env.MONGO_URI || "";

export const connectDB = async () => {
  const mongoUri = getMongoUri();
  if (!mongoUri) {
    console.warn("⚠️ No MongoDB URI configured. Using the existing local JSON fallback for development only.");
    isMongoConnected = false;
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri);
    console.log("🟩 MongoDB connected securely");
    isMongoConnected = true;
    return true;
  } catch (err) {
    isMongoConnected = false;
    throw new Error(`Failed to connect to MongoDB: ${err.message}`);
  }
};

export const getDbState = () => isMongoConnected && mongoose.connection.readyState === 1;
export const isStrictMongo = () => Boolean(getMongoUri());

const LOCAL_DB_DIR = path.join(process.cwd(), "local_db");

export const readLocalFile = (filename, defaultData = []) => {
  if (isStrictMongo()) return defaultData;
  if (!fs.existsSync(LOCAL_DB_DIR)) fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });

  const filePath = path.join(LOCAL_DB_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(`Error reading local file db: ${filename}`, err);
    return defaultData;
  }
};

export const writeLocalFile = (filename, data) => {
  if (isStrictMongo()) return;
  if (!fs.existsSync(LOCAL_DB_DIR)) fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
  try {
    fs.writeFileSync(path.join(LOCAL_DB_DIR, filename), JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing local file db: ${filename}`, err);
  }
};
