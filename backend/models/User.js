import mongoose, { Schema } from "mongoose";
import { getDbState, readLocalFile, writeLocalFile } from "../config/db.js";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "admin" }
});

const MongoUserModel = mongoose.models.User || mongoose.model("User", UserSchema);

// Hybrid handler for User
export const UserRepo = {
  findOne: async (query) => {
    if (getDbState()) {
      return await MongoUserModel.findOne(query);
    } else {
      const users = readLocalFile("users.json");
      const found = users.find(u => u.email === query.email);
      return found || null;
    }
  },

  create: async (data) => {
    if (getDbState()) {
      return await MongoUserModel.create(data);
    } else {
      const users = readLocalFile("users.json");
      const newUser = {
        _id: `u_${Date.now()}`,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || "admin"
      };
      users.push(newUser);
      writeLocalFile("users.json", users);
      return newUser;
    }
  }
};

export default MongoUserModel;
