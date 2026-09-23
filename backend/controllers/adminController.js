import bcrypt from "bcryptjs";
import { UserRepo } from "../models/User.js";
import { isPrimaryAdminEmail } from "../middleware/authMiddleware.js";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const sanitizeUser = (user) => ({
  _id: String(user?._id || user?.id || ""),
  email: normalizeEmail(user?.email),
  role: user?.role || "admin",
  createdAt: user?.createdAt || null,
  isPrimaryAdmin: isPrimaryAdminEmail(user?.email),
});

const validPassword = (password) => typeof password === "string" && password.length >= 8;

export const getAdmins = async (req, res) => {
  try {
    const users = await UserRepo.find({ role: "admin" });
    res.json(users.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ msg: "Unable to load admin accounts.", error: err.message });
  }
};

export const createAdmin = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ msg: "Please provide a valid admin email address." });
    return;
  }

  if (!validPassword(password)) {
    res.status(400).json({ msg: "Admin password must be at least 8 characters long." });
    return;
  }

  try {
    const existing = await UserRepo.findOne({ email });
    if (existing) {
      res.status(409).json({ msg: "An admin account with that email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserRepo.create({ email, passwordHash, role: "admin" });

    res.status(201).json({ msg: "Admin account created successfully.", user: sanitizeUser(user) });
  } catch (err) {
    const duplicate = err?.code === 11000;
    res.status(duplicate ? 409 : 500).json({
      msg: duplicate ? "An admin account with that email already exists." : "Unable to create admin account.",
      error: err.message,
    });
  }
};

export const changeAdminPassword = async (req, res) => {
  const { id } = req.params;
  const password = req.body?.password;

  if (!validPassword(password)) {
    res.status(400).json({ msg: "Admin password must be at least 8 characters long." });
    return;
  }

  try {
    const target = await UserRepo.findById(id);
    if (!target) {
      res.status(404).json({ msg: "Admin account not found." });
      return;
    }

    if (isPrimaryAdminEmail(target.email)) {
      res.status(400).json({
        msg: "The primary administrator password is managed through ADMIN_PASSWORD and cannot be changed here.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await UserRepo.updateById(id, {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });

    res.json({ msg: "Admin password changed successfully." });
  } catch (err) {
    res.status(500).json({ msg: "Unable to change admin password.", error: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const target = await UserRepo.findById(id);
    if (!target) {
      res.status(404).json({ msg: "Admin account not found." });
      return;
    }

    if (isPrimaryAdminEmail(target.email)) {
      res.status(400).json({ msg: "The primary administrator account cannot be deleted." });
      return;
    }

    await UserRepo.deleteById(id);
    res.json({ msg: "Admin account deleted successfully." });
  } catch (err) {
    res.status(500).json({ msg: "Unable to delete admin account.", error: err.message });
  }
};
