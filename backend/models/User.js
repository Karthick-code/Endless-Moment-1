import mongoose, { Schema } from "mongoose";
import { getDbState, readLocalFile, writeLocalFile } from "../config/db.js";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin", enum: ["admin"] },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const MongoUserModel = mongoose.models.User || mongoose.model("User", UserSchema);

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const localMatches = (user, query) =>
  Object.entries(query).every(([key, expected]) => {
    if (key === "email") {
      return normalizeEmail(user.email) === normalizeEmail(expected);
    }

    if (expected && typeof expected === "object" && "$gt" in expected) {
      const actual = user[key] ? new Date(user[key]).getTime() : NaN;
      return Number.isFinite(actual) && actual > new Date(expected.$gt).getTime();
    }

    return String(user[key] ?? "") === String(expected ?? "");
  });

const sanitizeLocalUser = (user) => ({
  ...user,
  email: normalizeEmail(user.email),
});

// Hybrid repository for MongoDB and the existing local JSON fallback.
export const UserRepo = {
  findOne: async (query) => {
    if (getDbState()) {
      return await MongoUserModel.findOne(query);
    }

    const users = readLocalFile("users.json");
    const found = users.find((user) => localMatches(user, query));
    return found ? sanitizeLocalUser(found) : null;
  },

  find: async (query = {}) => {
    if (getDbState()) {
      return await MongoUserModel.find(query).sort({ createdAt: 1 });
    }

    return readLocalFile("users.json")
      .filter((user) => localMatches(user, query))
      .map(sanitizeLocalUser);
  },

  findById: async (id) => {
    if (getDbState()) {
      return await MongoUserModel.findById(id);
    }

    const users = readLocalFile("users.json");
    const found = users.find((user) => String(user._id) === String(id));
    return found ? sanitizeLocalUser(found) : null;
  },

  create: async (data) => {
    const normalizedData = {
      ...data,
      email: normalizeEmail(data.email),
      role: data.role || "admin",
    };

    if (getDbState()) {
      return await MongoUserModel.create(normalizedData);
    }

    const users = readLocalFile("users.json");
    const newUser = {
      _id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email: normalizedData.email,
      passwordHash: normalizedData.passwordHash,
      role: normalizedData.role,
      passwordResetTokenHash: normalizedData.passwordResetTokenHash || null,
      passwordResetExpiresAt: normalizedData.passwordResetExpiresAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeLocalFile("users.json", users);
    return newUser;
  },

  updateById: async (id, updates) => {
    if (getDbState()) {
      return await MongoUserModel.findByIdAndUpdate(id, updates, { new: true });
    }

    const users = readLocalFile("users.json");
    const index = users.findIndex((user) => String(user._id) === String(id));
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      email: updates.email !== undefined ? normalizeEmail(updates.email) : users[index].email,
      updatedAt: new Date().toISOString(),
    };
    writeLocalFile("users.json", users);
    return users[index];
  },

  deleteById: async (id) => {
    if (getDbState()) {
      return await MongoUserModel.findByIdAndDelete(id);
    }

    const users = readLocalFile("users.json");
    const index = users.findIndex((user) => String(user._id) === String(id));
    if (index === -1) return null;

    const [deletedUser] = users.splice(index, 1);
    writeLocalFile("users.json", users);
    return deletedUser;
  },
};

export default MongoUserModel;
