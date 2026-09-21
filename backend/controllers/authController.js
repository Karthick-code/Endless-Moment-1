import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepo } from "../models/User.js";
import { getJwtSecret } from "../config/security.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    res.status(400).json({ msg: "Please enter both email and password." });
    return;
  }

  try {
    // Find user
    const user = await UserRepo.findOne({ email });
    if (!user) {
      res.status(400).json({ msg: "Invalid credentials. Please verify your email and password." });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ msg: "Invalid credentials. Please verify your email and password." });
      return;
    }

    // Sign Token
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role || "admin" },
      jwtSecret,
      { expiresIn: "3h" }
    );

    res.json({ token, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ msg: "Server error during authentication.", error: err.message });
  }
};
