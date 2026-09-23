import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepo } from "../models/User.js";
import { getJwtSecret } from "../config/security.js";
import { isPrimaryAdminEmail } from "../middleware/authMiddleware.js";
import { canUsePasswordResetEmail, sendPasswordResetEmail } from "../utils/mailer.js";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const frontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").trim().replace(/\/+$/, "");
const genericResetResponse = {
  msg: "If an administrator account exists for that email, a password reset link has been sent.",
};

export const login = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!email || !password) {
    res.status(400).json({ msg: "Please enter both email and password." });
    return;
  }

  try {
    const user = await UserRepo.findOne({ email });
    if (!user) {
      res.status(400).json({ msg: "Invalid credentials. Please verify your email and password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ msg: "Invalid credentials. Please verify your email and password." });
      return;
    }

    if ((user.role || "admin") !== "admin") {
      res.status(403).json({ msg: "Administrator access is required." });
      return;
    }

    const userId = String(user._id || user.id);
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      {
        id: userId,
        email: user.email,
        role: "admin",
        isPrimaryAdmin: isPrimaryAdminEmail(user.email),
      },
      jwtSecret,
      { expiresIn: "3h" },
    );

    res.json({
      token,
      email: user.email,
      role: "admin",
      isPrimaryAdmin: isPrimaryAdminEmail(user.email),
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error during authentication.", error: err.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ msg: "Please enter a valid email address." });
    return;
  }

  try {
    const user = await UserRepo.findOne({ email, role: "admin" });

    // Do not disclose whether an admin account exists.
    if (!user) {
      res.json(genericResetResponse);
      return;
    }

    if (!canUsePasswordResetEmail()) {
      console.error("Password reset requested, but Password Reset EmailJS is not configured.");
      res.json(genericResetResponse);
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await UserRepo.updateById(user._id || user.id, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    });

    const resetUrl = `${frontendUrl()}/login?reset=${encodeURIComponent(rawToken)}`;

    try {
      await sendPasswordResetEmail({
        email: user.email,
        resetUrl,
      });
    } catch (mailError) {
      await UserRepo.updateById(user._id || user.id, {
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      });
      throw mailError;
    }

    res.json(genericResetResponse);
  } catch (err) {
    console.error("Password reset request failed:", err.message);
    res.json(genericResetResponse);
  }
};

export const resetPassword = async (req, res) => {
  const token = String(req.body?.token || "").trim();
  const password = req.body?.password;

  if (!token) {
    res.status(400).json({ msg: "Password reset token is required." });
    return;
  }

  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ msg: "Password must be at least 8 characters long." });
    return;
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await UserRepo.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
      role: "admin",
    });

    if (!user) {
      res.status(400).json({ msg: "This password reset link is invalid or has expired." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await UserRepo.updateById(user._id || user.id, {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });

    res.json({ msg: "Password changed successfully. You can now sign in." });
  } catch (err) {
    res.status(500).json({ msg: "Unable to reset password.", error: err.message });
  }
};
